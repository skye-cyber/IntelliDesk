/**
 * Database Query Tool - Execute database queries
 */
import { ToolBase } from '../ToolBase';
import { DatabaseManager } from '../../DatabaseManager';

export class DatabaseQueryTool extends ToolBase {
    constructor() {
        super('database_query', 'Execute database queries');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "database_query",
                description: "Execute database queries",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "SQL query to execute"
                        },
                        database: {
                            type: "string",
                            description: "Database name or connection string",
                            default: "default"
                        },
                        query_type: {
                            type: "string",
                            enum: ["select", "insert", "update", "delete", "create", "drop"],
                            description: "Type of query being executed"
                        },
                        parameters: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "string" },
                                    type: { type: "string" }
                                }
                            },
                            description: "Query parameters for prepared statements"
                        },
                        return_format: {
                            type: "string",
                            enum: ["json", "csv", "table"],
                            default: "json",
                            description: "Format for returned results"
                        }
                    },
                    required: ["query"]
                }
            }
        };
    }

    async _execute({ query, database = "default", query_type, parameters = [], return_format = "json" }, context) {
        // Validate query
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error('Query must be a non-empty string');
        }

        // Validate query type if provided
        const validQueryTypes = ["select", "insert", "update", "delete", "create", "drop"];
        if (query_type && !validQueryTypes.includes(query_type)) {
            throw new Error(`Invalid query_type: ${query_type}. Must be one of: ${validQueryTypes.join(', ')}`);
        }

        // Validate parameters
        if (parameters && !Array.isArray(parameters)) {
            throw new Error('Parameters must be an array');
        }

        try {
            // Get database connection
            const dbManager = new DatabaseManager();
            const dbConnection = await dbManager.getConnection(database);

            // Execute query based on type
            let result;
            if (query_type === 'select' || !query_type) {
                // For SELECT queries or when query_type is not specified
                result = await this.executeSelectQuery(dbConnection, query, parameters);
            } else {
                // For other query types
                result = await this.executeNonSelectQuery(dbConnection, query, parameters, query_type);
            }

            // Format the result
            const formattedResult = this.formatQueryResult(result, return_format);

            return {
                query: query,
                database: database,
                query_type: query_type || this.inferQueryType(query),
                rows_affected: result.rowsAffected || result.rowCount || 0,
                result: formattedResult,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Database query failed: ${error.message}`);
        }
    }

    async executeSelectQuery(dbConnection, query, parameters) {
        // Execute SELECT query
        const result = await dbConnection.query(query, parameters);
        return {
            rows: result.rows || result,
            rowCount: result.rowCount || result.length || 0,
            columns: result.columns || Object.keys(result[0] || {})
        };
    }

    async executeNonSelectQuery(dbConnection, query, parameters, queryType) {
        // Execute non-SELECT query
        const result = await dbConnection.execute(query, parameters);

        return {
            rowsAffected: result.rowsAffected || result.rowCount || 0,
            queryType: queryType,
            success: true
        };
    }

    inferQueryType(query) {
        const trimmedQuery = query.trim().toLowerCase();
        if (trimmedQuery.startsWith('select')) return 'select';
        if (trimmedQuery.startsWith('insert')) return 'insert';
        if (trimmedQuery.startsWith('update')) return 'update';
        if (trimmedQuery.startsWith('delete')) return 'delete';
        if (trimmedQuery.startsWith('create')) return 'create';
        if (trimmedQuery.startsWith('drop')) return 'drop';
        if (trimmedQuery.startsWith('alter')) return 'alter';
        return 'unknown';
    }

    formatQueryResult(result, format) {
        switch (format) {
            case 'json':
                return result.rows || result;
            case 'csv':
                return this.convertToCSV(result.rows || result);
            case 'table':
                return this.convertToTable(result.rows || result);
            default:
                return result.rows || result;
        }
    }

    convertToCSV(rows) {
        if (!rows || rows.length === 0) return '';

        const headers = Object.keys(rows[0]);
        const csvRows = [];

        // Add header row
        csvRows.push(headers.join(','));

        // Add data rows
        for (const row of rows) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/\"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    convertToTable(rows) {
        if (!rows || rows.length === 0) return 'No results';

        const headers = Object.keys(rows[0]);

        // Calculate column widths
        const colWidths = headers.map(() => 0);
        for (const row of rows) {
            headers.forEach((header, i) => {
                const value = '' + (row[header] || '');
                colWidths[i] = Math.max(colWidths[i], header.length, value.length);
            });
        }

        // Build table
        let table = '';

        // Header row
        const headerCells = headers.map((header, i) =>
            header.padEnd(colWidths[i])
        );
        table += '| ' + headerCells.join(' | ') + ' |\n';

        // Separator row
        const separators = headers.map((_, i) =>
            '-'.repeat(colWidths[i])
        );
        table += '| ' + separators.join(' | ') + ' |\n';

        // Data rows
        for (const row of rows) {
            const cells = headers.map((header, i) =>
                ('' + (row[header] || '')).padEnd(colWidths[i])
            );
            table += '| ' + cells.join(' | ') + ' |\n';
        }

        return table;
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            query: result.query,
            database: result.database,
            query_type: result.query_type,
            rows_affected: result.rows_affected,
            result: result.result,
            timestamp: result.timestamp
        };
    }
}
