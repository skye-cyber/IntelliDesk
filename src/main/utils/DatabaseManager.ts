/**
 * Database Manager - Handles database connections and operations
 */
import { MongoClient, Db } from "mongodb";
import postgres from 'pg';
import mysql from 'mysql2/promise';
import { open, Database } from "sqlite";
import { sqlite3 } from "sqlite3";

// Type definitions
export interface DatabaseConfig {
    type: 'sqlite' | 'mysql' | 'mariadb' | 'postgres' | 'postgresql' | 'mongodb';
    database?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    connectionString?: string;
    driver?: any;
    options?: Record<string, any>;
}

export interface ConnectionInfo {
    db: any;
    config: DatabaseConfig;
    lastUsed: Date;
}

export interface TableColumn {
    name: string;
    type: string;
    notnull?: boolean;
    default?: any;
    pk?: boolean;
    nullable?: boolean;
    primary?: boolean;
    unique?: boolean;
}

export interface TableSchema {
    table: string;
    columns: TableColumn[];
}

export interface QueryResult {
    rowsAffected?: number;
    lastID?: number;
    rows?: any[];
}

export interface AddConnectionResult {
    success: boolean;
    message: string;
}

export interface ConnectionListItem {
    name: string;
    type: string;
    database: string;
    lastUsed: Date;
    status: string;
}

export class DatabaseManager {
    private connections: Map<string, ConnectionInfo>;
    private config: Record<string, DatabaseConfig>;

    constructor() {
        this.connections = new Map<string, ConnectionInfo>();
        this.config = this.loadConfig();
    }

    /**
     * Load database configuration
     */
    loadConfig(): Record<string, DatabaseConfig> {
        try {
            // Check if running in browser environment with localStorage
            if (typeof localStorage !== 'undefined') {
                const config = JSON.parse(localStorage.getItem('database_config') || '{}');
                return config;
            }
            // Fallback for Node.js environment
            return {
                default: {
                    type: 'sqlite',
                    database: './database.sqlite'
                }
            };
        } catch (error) {
            return {
                default: {
                    type: 'sqlite',
                    database: './database.sqlite'
                }
            };
        }
    }

    /**
     * Save database configuration
     */
    saveConfig(): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('database_config', JSON.stringify(this.config));
        }
    }

    /**
     * Get a database connection
     * @param name - Connection name or identifier
     * @returns Database connection object
     */
    async getConnection(name: string = 'default'): Promise<any> {
        // Return existing connection if available
        if (this.connections.has(name)) {
            const connection = this.connections.get(name)!;

            // Test if connection is still alive
            try {
                await this.testConnection(connection.db);
                return connection.db;
            } catch (error) {
                // Connection is dead, remove it and create a new one
                this.connections.delete(name);
                await this.closeConnection(name);
            }
        }

        // Create new connection
        const config = this.getConnectionConfig(name);
        const connection = await this.createConnection(config);

        // Store the connection
        this.connections.set(name, {
            db: connection,
            config: config,
            lastUsed: new Date()
        });

        return connection;
    }

    /**
     * Get connection configuration
     * @param name - Connection name
     * @returns Connection configuration
     */
    getConnectionConfig(name: string): DatabaseConfig {
        // Return specific config if exists
        if (this.config[name]) {
            return this.config[name];
        }

        // Return default config
        if (name === 'default' && !this.config.default) {
            return {
                type: 'sqlite',
                database: './database.sqlite',
                //driver: sqlite3.Database
            };
        }

        // Parse connection string
        if (name.includes('://')) {
            return this.parseConnectionString(name);
        }

        throw new Error(`Database configuration not found for: ${name}`);
    }

    /**
     * Parse connection string
     * @param connectionString - Database connection string
     * @returns Parsed configuration
     */
    parseConnectionString(connectionString: string): DatabaseConfig {
        const url = new URL(connectionString);

        const config: DatabaseConfig = {
            type: url.protocol.replace(':', '') as DatabaseConfig['type'],
            host: url.hostname,
            port: parseInt(url.port) || undefined,
            database: url.pathname.replace('/', ''),
            username: url.username,
            password: url.password
        };

        // Parse query parameters as options
        const options: Record<string, any> = {};
        url.searchParams.forEach((value, key) => {
            options[key] = value;
        });

        if (Object.keys(options).length > 0) {
            config.options = options;
        }

        return config;
    }

    /**
     * Create database connection based on type
     * @param config - Database configuration
     * @returns Database connection
     */
    async createConnection(config: DatabaseConfig): Promise<any> {
        const { type } = config;

        switch (type.toLowerCase()) {
            case 'sqlite':
                return await this.createSQLiteConnection(config);
            case 'mysql':
            case 'mariadb':
                return await this.createMySQLConnection(config);
            case 'postgres':
            case 'postgresql':
                return await this.createPostgresConnection(config);
            case 'mongodb':
                return await this.createMongoDBConnection(config);
            default:
                throw new Error(`Unsupported database type: ${type}`);
        }
    }

    /**
     * Create SQLite connection
     */
    async createSQLiteConnection(config: DatabaseConfig): Promise<Database> {
        try {
            const db = await open({
                filename: config.database || ':memory:',
                driver: config.driver //|| sqlite3.Database
            });

            // Enable foreign keys for SQLite
            await db.exec('PRAGMA foreign_keys = ON');

            return db;
        } catch (error: any) {
            throw new Error(`Failed to connect to SQLite: ${error.message}`);
        }
    }

    /**
     * Create MySQL connection
     */
    async createMySQLConnection(config: DatabaseConfig): Promise<mysql.Connection> {
        try {
            const connection = await mysql.createConnection({
                host: config.host || 'localhost',
                port: config.port || 3306,
                user: config.username || 'root',
                password: config.password || '',
                database: config.database,
                ...config.options
            });

            return connection;
        } catch (error: any) {
            throw new Error(`Failed to connect to MySQL: ${error.message}`);
        }
    }

    /**
     * Create PostgreSQL connection
     */
    async createPostgresConnection(config: DatabaseConfig): Promise<postgres.Client> {
        try {
            const client = new postgres.Client({
                host: config.host || 'localhost',
                port: config.port || 5432,
                user: config.username || 'postgres',
                password: config.password || '',
                database: config.database,
                ...config.options
            });

            await client.connect();
            return client;
        } catch (error: any) {
            throw new Error(`Failed to connect to PostgreSQL: ${error.message}`);
        }
    }

    /**
     * Create MongoDB connection
     */
    async createMongoDBConnection(config: DatabaseConfig): Promise<Db> {
        try {
            const connectionString = config.connectionString || `mongodb://${config.host || 'localhost'}:${config.port || 27017}`;
            const client = new MongoClient(connectionString);
            await client.connect();

            const db = client.db(config.database || 'test');
            return db;
        } catch (error: any) {
            throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        }
    }

    /**
     * Test if connection is alive
     */
    async testConnection(connection: any): Promise<boolean> {
        try {
            const db = connection.db || connection;

            // Try a simple query based on database type
            if (db.run && db.get) { // SQLite
                await db.get('SELECT 1');
            } else if (db.execute) { // MySQL
                await db.execute('SELECT 1');
            } else if (db.query) { // PostgreSQL
                await db.query('SELECT 1');
            } else if (db.command) { // MongoDB
                await db.command({ ping: 1 });
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Close a database connection
     */
    async closeConnection(name: string): Promise<void> {
        if (this.connections.has(name)) {
            const connection = this.connections.get(name)!;
            const db = connection.db;

            try {
                if (db.close) {
                    await db.close();
                } else if (db.end) {
                    await db.end();
                }
            } catch (error) {
                console.warn(`Error closing connection ${name}:`, error);
            }

            this.connections.delete(name);
        }
    }

    /**
     * Close all database connections
     */
    async closeAllConnections(): Promise<void> {
        const closePromises = Array.from(this.connections.keys()).map(
            name => this.closeConnection(name)
        );
        await Promise.all(closePromises);
    }

    /**
     * List all available connections
     */
    listConnections(): ConnectionListItem[] {
        return Array.from(this.connections.entries()).map(([name, conn]) => ({
            name,
            type: conn.config.type,
            database: conn.config.database || conn.config.host || '',
            lastUsed: conn.lastUsed,
            status: 'connected'
        }));
    }

    /**
     * Add or update a database configuration
     */
    addConnection(name: string, config: DatabaseConfig): AddConnectionResult {
        this.config[name] = config;
        this.saveConfig();
        return { success: true, message: `Configuration saved for ${name}` };
    }

    /**
     * Remove a database configuration
     */
    removeConnection(name: string): AddConnectionResult {
        if (this.config[name]) {
            delete this.config[name];
            this.saveConfig();
            this.closeConnection(name);
            return { success: true, message: `Configuration removed for ${name}` };
        }
        return { success: false, message: `Configuration not found: ${name}` };
    }

    /**
     * Execute a query on a specific connection
     * Utility method for other tools/components
     */
    async executeQuery(
        connectionName: string,
        query: string,
        parameters: any[] = []
    ): Promise<any> {
        const db = await this.getConnection(connectionName);

        try {
            if (db.run && db.all) { // SQLite
                if (query.trim().toUpperCase().startsWith('SELECT')) {
                    return await db.all(query, ...parameters);
                } else {
                    const result = await db.run(query, ...parameters);
                    return { rowsAffected: result.changes, lastID: result.lastID };
                }
            } else if (db.execute) { // MySQL
                const [rows] = await db.execute(query, parameters);
                return rows;
            } else if (db.query) { // PostgreSQL
                const result = await db.query(query, parameters);
                return result.rows;
            } else if (db.collection) { // MongoDB
                throw new Error('MongoDB queries should use native MongoDB syntax');
            }
        } catch (error: any) {
            throw new Error(`Query execution failed: ${error.message}`);
        }
    }

    /**
     * Get database schema/information
     */
    async getSchema(connectionName: string): Promise<TableSchema[] | { error: string }> {
        const db = await this.getConnection(connectionName);
        const config = this.getConnectionConfig(connectionName);

        switch (config.type.toLowerCase()) {
            case 'sqlite':
                return await this.getSQLiteSchema(db);
            case 'mysql':
            case 'mariadb':
                return await this.getMySQLSchema(db, config.database!);
            case 'postgres':
            case 'postgresql':
                return await this.getPostgresSchema(db);
            default:
                return { error: 'Schema inspection not supported for this database type' };
        }
    }

    /**
     * Get SQLite schema
     */
    async getSQLiteSchema(db: any): Promise<TableSchema[]> {
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");

        const schema: TableSchema[] = [];
        for (const table of tables) {
            const columns = await db.all(`PRAGMA table_info(${table.name})`);
            schema.push({
                table: table.name,
                columns: columns.map((col: any) => ({
                    name: col.name,
                    type: col.type,
                    notnull: col.notnull === 1,
            default: col.dflt_value,
                pk: col.pk === 1
                }))
            });
        }

        return schema;
    }

    /**
     * Get MySQL schema
     */
    async getMySQLSchema(db: any, database: string): Promise<TableSchema[]> {
        const [tables] = await db.execute(`
        SELECT TABLE_NAME as table_name
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        `, [database]);

        const schema: TableSchema[] = [];
        for (const table of tables as any[]) {
            const [columns] = await db.execute(`
            SELECT COLUMN_NAME as name, DATA_TYPE as type,
            IS_NULLABLE as nullable, COLUMN_DEFAULT as default_value,
            COLUMN_KEY as key_type
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
            `, [database, table.table_name]);

            schema.push({
                table: table.table_name,
                columns: (columns as any[]).map((col: any) => ({
                    name: col.name,
                    type: col.type,
                    nullable: col.nullable === 'YES',
            default: col.default_value,
                primary: col.key_type === 'PRI',
                unique: col.key_type === 'UNI'
                }))
            });
        }

        return schema;
    }

    /**
     * Get PostgreSQL schema
     */
    async getPostgresSchema(db: any): Promise<TableSchema[]> {
        const tables = await db.query(`
        SELECT tablename as table_name
        FROM pg_tables
        WHERE schemaname = 'public'
        `);

        const schema: TableSchema[] = [];
        for (const table of tables.rows) {
            const columns = await db.query(`
            SELECT column_name as name, data_type as type,
            is_nullable as nullable, column_default as default_value
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position
            `, [table.table_name]);

            schema.push({
                table: table.table_name,
                columns: columns.rows.map((col: any) => ({
                    name: col.name,
                    type: col.type,
                    nullable: col.nullable === 'YES',
            default: col.default_value
                }))
            });
        }

        return schema;
    }

    /**
     * Cleanup old/unused connections
     */
    cleanupConnections(maxAgeMinutes: number = 30): void {
        const now = new Date();
        for (const [name, connection] of this.connections.entries()) {
            const age = (now.getTime() - connection.lastUsed.getTime()) / (1000 * 60);
            if (age > maxAgeMinutes) {
                this.closeConnection(name);
            }
        }
    }
}

// Export singleton instance if desired
export const dbManager = new DatabaseManager();
