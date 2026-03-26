import mysql from 'mysql2/promise';
export declare class DatabaseManager {
    private connections;
    private config;
    constructor();
    /**
     * Load database configuration
     */
    loadConfig(): any;
    /**
     * Save database configuration
     */
    saveConfig(): void;
    /**
     * Get a database connection
     * @param {string} name - Connection name or identifier
     * @returns {Promise<object>} Database connection object
     */
    getConnection(name?: string): Promise<any>;
    /**
     * Get connection configuration
     * @param {string} name - Connection name
     * @returns {object} Connection configuration
     */
    getConnectionConfig(name: string): any;
    /**
     * Parse connection string
     * @param {string} connectionString - Database connection string
     * @returns {object} Parsed configuration
     */
    parseConnectionString(connectionString: string): {
        type: string;
        host: string;
        port: string;
        database: string;
        username: string;
        password: string;
    };
    /**
     * Create database connection based on type
     * @param {object} config - Database configuration
     * @returns {Promise<object>} Database connection
     */
    createConnection(config: any): Promise<any>;
    /**
     * Create SQLite connection
     */
    createSQLiteConnection(config: any): Promise<import("sqlite").Database<import("sqlite3").Database, import("sqlite3").Statement>>;
    /**
     * Create MySQL connection
     */
    createMySQLConnection(config: any): Promise<mysql.Connection>;
    /**
     * Create PostgreSQL connection
     */
    createPostgresConnection(config: any): Promise<any>;
    /**
     * Create MongoDB connection
     */
    createMongoDBConnection(config: any): Promise<import("mongodb").Db>;
    /**
     * Test if connection is alive
     */
    testConnection(connection: any): Promise<boolean>;
    /**
     * Close a database connection
     */
    closeConnection(name: any): Promise<void>;
    /**
     * Close all database connections
     */
    closeAllConnections(): Promise<void>;
    /**
     * List all available connections
     */
    listConnections(): {
        name: string;
        type: any;
        database: any;
        lastUsed: any;
        status: string;
    }[];
    /**
     * Add or update a database configuration
     */
    addConnection(name: string, config: any): {
        success: boolean;
        message: string;
    };
    /**
     * Remove a database configuration
     */
    removeConnection(name: string): {
        success: boolean;
        message: string;
    };
    /**
     * Execute a query on a specific connection
     * Utility method for other tools/components
     */
    executeQuery(connectionName: string, query: string, parameters?: [string | object | number | undefined]): Promise<any>;
    /**
     * Get database schema/information
     */
    getSchema(connectionName: string): Promise<{
        table: any;
        columns: any;
    }[] | {
        error: string;
    }>;
    getSQLiteSchema(db: any): Promise<{
        table: any;
        columns: any;
    }[]>;
    getMySQLSchema(db: any, database: any): Promise<{
        table: any;
        columns: any;
    }[]>;
    getPostgresSchema(db: any): Promise<{
        table: any;
        columns: any;
    }[]>;
    /**
     * Cleanup old/unused connections
     */
    cleanupConnections(maxAgeMinutes?: number): void;
}
export declare const dbManager: DatabaseManager;
//# sourceMappingURL=DatabaseManager.d.ts.map