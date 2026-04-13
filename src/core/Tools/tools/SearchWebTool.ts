/**
 * Search Web Tool - Search the web for current information
 */
import { ToolBase } from '../ToolBase';
import * as duckDuckGoSearch from '@eazevedociss/duckduckgo-search';

interface Result {
    title: string
    url: string
    snippet: string
    source: string
    is_mock?: boolean
}

export class SearchWebTool extends ToolBase {
    private lastRequestTime = 0;
    private minRequestInterval = 1000; // 1 second between requests

    constructor() {
        super('search_web', 'Search the web for current information using DuckDuckGo');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "search_web",
                description: "Search the web for current information. Use this when you need recent or factual information not in your training data.",
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
                        }
                    },
                    required: ["query"]
                }
            }
        };
    }


    async _execute(params: any, context: Record<any, any> = {}): Promise<Record<any, any>> {
        const { query, max_results = 5 }: { query: string, max_results: number } = params
        await this.rateLimit()

        // Validate input
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error('Query must be a non-empty string');
        }

        // Apply limits
        const maxResults = Math.min(max_results, this.config.max_results || 10);
        const timeout = this.config.timeout || 10000;

        try {
            // Use real DuckDuckGo search with timeout
            const results = await this.searchWithTimeout(query, maxResults, timeout);

            return {
                query: query,
                results: results,
                count: results.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Fall back to mock data if real search fails
            console.error(`Search failed: ${error.message}`);
            return {
                query: query,
                results: `Search failed: ${error.message}`,
                count: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    private async searchWithTimeout(query: string, maxResults: number, timeout: number): Promise<any[]> {
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Search timed out after ${timeout}ms`)), timeout);
        });

        // Perform the actual search
        const searchPromise = this.performSearch(query, maxResults);

        // Race between search and timeout
        const results = await Promise.race([searchPromise, timeoutPromise]);
        return results as any[];
    }

    private async performSearchWithRetry(query: string, maxResults: number, retries = 2): Promise<any[]> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await this.performSearch(query, maxResults);
            } catch (error) {
                if (attempt === retries) throw error;
                console.warn(`Search attempt ${attempt} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw new Error('All search attempts failed');
    }

    private async performSearch(query: string, maxResults: number): Promise<any[]> {
        const searchResults: any[] = [];

        // Use the text search API which returns an async iterator
        // @ts-ignore - The package's type definitions may be incomplete
        for await (const result of duckDuckGoSearch.text(query)) {
            if (searchResults.length >= maxResults) break;

            // Transform the result to match your expected format
            searchResults.push({
                title: result.title || 'No title',
                url: result.url || '#',
                snippet: this.truncateSnippet(result.body || result.description || 'No description available'),
                source: 'duckduckgo'
            });
        }

        return searchResults;
    }

    private truncateSnippet(snippet: string): string {
        const maxLength = this.config.max_snippet_length || 300;
        if (snippet.length <= maxLength) return snippet;
        return snippet.substring(0, maxLength) + '...';
    }

    private async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve =>
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }
        this.lastRequestTime = Date.now();
    }

    private filterResults(results: any[]): any[] {
        return results.filter(result => {
            // Filter out results without URLs or with obviously fake URLs
            if (!result.url || result.url === '#' || result.url.startsWith('javascript:')) {
                return false;
            }
            // Filter out very short snippets (likely low quality)
            if (result.snippet.length < 20) {
                return false;
            }
            return true;
        });
    }

    formatResult(result: Record<any, any>): any {
        console.log("SEARCH RESULT:", result)
        return {
            success: true,
            query: result.query,
            results: result.results,
            count: result.count,
            timestamp: result.timestamp,
            is_mock: result.is_mock || false
        };
    }
}
