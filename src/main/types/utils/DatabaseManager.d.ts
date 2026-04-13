/**
 * Database Manager - Handles database connections and operations
 */
import { Db } from "mongodb";
import postgres from 'pg';
import mysql from 'mysql2/promise';
import { Database } from "sqlite";
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
export declare class DatabaseManager {
    private connections;
    private config;
    constructor();
    /**
     * Load database configuration
     */
    loadConfig(): Record<string, DatabaseConfig>;
    /**
     * Save database configuration
     */
    saveConfig(): void;
    /**
     * Get a database connection
     * @param name - Connection name or identifier
     * @returns Database connection object
     */
    getConnection(name?: string): Promise<any>;
    /**
     * Get connection configuration
     * @param name - Connection name
     * @returns Connection configuration
     */
    getConnectionConfig(name: string): DatabaseConfig;
    /**
     * Parse connection string
     * @param connectionString - Database connection string
     * @returns Parsed configuration
     */
    parseConnectionString(connectionString: string): DatabaseConfig;
    /**
     * Create database connection based on type
     * @param config - Database configuration
     * @returns Database connection
     */
    createConnection(config: DatabaseConfig): Promise<any>;
    /**
     * Create SQLite connection
     */
    createSQLiteConnection(config: DatabaseConfig): Promise<Database>;
    /**
     * Create MySQL connection
     */
    createMySQLConnection(config: DatabaseConfig): Promise<mysql.Connection>;
    /**
     * Create PostgreSQL connection
     */
    createPostgresConnection(config: DatabaseConfig): Promise<postgres.Client>;
    /**
     * Create MongoDB connection
     */
    createMongoDBConnection(config: DatabaseConfig): Promise<Db>;
    /**
     * Test if connection is alive
     */
    testConnection(connection: any): Promise<boolean>;
    /**
     * Close a database connection
     */
    closeConnection(name: string): Promise<void>;
    /**
     * Close all database connections
     */
    closeAllConnections(): Promise<void>;
    /**
     * List all available connections
     */
    listConnections(): ConnectionListItem[];
    /**
     * Add or update a database configuration
     */
    addConnection(name: string, config: DatabaseConfig): AddConnectionResult;
    /**
     * Remove a database configuration
     */
    removeConnection(name: string): AddConnectionResult;
    /**
     * Execute a query on a specific connection
     * Utility method for other tools/components
     */
    executeQuery(connectionName: string, query: string, parameters?: any[]): Promise<any>;
    /**
     * Get database schema/information
     */
    getSchema(connectionName: string): Promise<TableSchema[] | {
        error: string;
    }>;
    /**
     * Get SQLite schema
     */
    getSQLiteSchema(db: any): Promise<TableSchema[]>;
    /**
     * Get MySQL schema
     */
    getMySQLSchema(db: any, database: string): Promise<TableSchema[]>;
    /**
     * Get PostgreSQL schema
     */
    getPostgresSchema(db: any): Promise<TableSchema[]>;
    /**
     * Cleanup old/unused connections
     */
    cleanupConnections(maxAgeMinutes?: number): void;
}
export declare const dbManager: DatabaseManager;
//# sourceMappingURL=DatabaseManager.d.ts.map