/**
 * Search Web Tool - Search the web for current information
 */
import { ToolBase } from '../ToolBase';
import axios from 'axios';

export class SearchWebTool extends ToolBase {
    constructor() {
        super('search_web', 'Search the web for current information');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "search_web",
                description: "Search the web for current information",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query"
                        },
                        max_results: {
                            type: "integer",
                            description: "Maximum number of results",
                            default: 5
                        },
                        search_engine: {
                            type: "string",
                            enum: ["google", "bing", "duckduckgo"],
                            default: "google",
                            description: "Search engine to use"
                        }
                    },
                    required: ["query"]
                }
            }
        };
    }

    async _execute({ query, max_results = 5, search_engine = "google" }, context) {
        // Validate query
        console.log(query, max_results)
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error('Query must be a non-empty string');
        }

        // Apply limits
        const maxResults = Math.min(max_results, this.config.max_results || 10);

        try {
            // Use appropriate search API based on configuration
            let results;
            if (this.config.search_api_url) {
                // Use custom search API
                results = await this.searchWithCustomAPI(query, maxResults, search_engine);
            } else {
                // Use mock data for development
                results = this.generateMockResults(query, maxResults, search_engine);
            }

            return {
                query: query,
                results: results,
                count: results.length,
                search_engine: search_engine,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    async searchWithCustomAPI(query, maxResults, searchEngine) {
        const apiUrl = this.config.search_api_url;
        const apiKey = this.config.search_api_key;

        const response = await axios.get(apiUrl, {
            params: {
                q: query,
                num: maxResults,
                engine: searchEngine,
                api_key: apiKey
            },
            timeout: this.config.timeout || 10000
        });

        if (response.data && response.data.results) {
            return response.data.results.map(result => ({
                title: result.title,
                url: result.url,
                snippet: result.snippet || result.description,
                source: result.source || searchEngine
            }));
        }

        return [];
    }

    generateMockResults(query, maxResults, searchEngine) {
        // Generate mock results for development
        const mockResults = [];
        for (let i = 1; i <= maxResults; i++) {
            mockResults.push({
                title: `Result ${i} for "${query}"`,
                url: `https://www.example.com/search?q=${encodeURIComponent(query)}&page=${i}`,
                snippet: `This is a mock result ${i} for the search query "${query}". In a real implementation, this would contain actual search results.`,
                source: searchEngine
            });
        }
        return mockResults;
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            query: result.query,
            results: result.results,
            count: result.count,
            search_engine: result.search_engine,
            timestamp: result.timestamp
        };
    }
}
