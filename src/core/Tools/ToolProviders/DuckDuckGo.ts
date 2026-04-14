import axios, { AxiosResponse, Method } from 'axios';

// Sleep function for delays
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Custom HTTP error class
class HTTPError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "HTTPError";
    }
}

// Unescape HTML entities
function unescape(text: string): string {
    return text.replace(/&quot;/g, '"');
}

// Regex substitute helper
function sub(pattern: RegExp, replacement: string, text: string): string {
    return text.replace(pattern, replacement);
}

// URL unquote helper
function unquote(url: string): string {
    return url;
}

// Strip HTML tags regex
const REGEX_STRIP_TAGS = /<[^>]*>/g;

// Types for search results
interface ImageResult {
    title: string;
    image: string;
    thumbnail: string;
    url: string;
    height: number;
    width: number;
    source: string;
}

interface TextResult {
    title: string;
    href: string;
    body: string;
}

interface SearchPayload {
    l?: string;
    o?: string;
    s: number | string;
    q: string;
    vqd?: string;
    f?: string;
    p?: number;
    kl?: string;
    df?: string | null;
    sp?: string;
    ex?: string;
}

interface ApiResponse {
    data: {
        results?: any[];
        next?: string;
    };
    status: number;
    config: {
        url?: string;
    };
}

// Main search API class
class SearchApi {
    private logger: Console;

    constructor() {
        this.logger = console;
    }

    /**
     * Search for images on DuckDuckGo
     * @param keywords - Search query
     * @param region - Region code (default: "wt-wt")
     * @param safesearch - Safe search level: "on", "moderate", "off" (default: "moderate")
     * @param timelimit - Time limit filter (default: null)
     * @param size - Image size filter (default: null)
     * @param color - Color filter (default: null)
     * @param type_image - Image type filter (default: null)
     * @param layout - Layout filter (default: null)
     * @param license_image - License filter (default: null)
     */
    async *images(
        keywords: string,
        region: string = "wt-wt",
        safesearch: "on" | "moderate" | "off" = "moderate",
        timelimit: string | null = null,
        size: string | null = null,
        color: string | null = null,
        type_image: string | null = null,
        layout: string | null = null,
        license_image: string | null = null
    ): AsyncGenerator<ImageResult> {
        if (!keywords) {
            throw new Error("Keywords are mandatory");
        }

        const vqd = await this._getVqd(keywords);
        if (!vqd) {
            throw new Error("Error in getting vqd");
        }

        const safesearchBase: Record<string, number> = { on: 1, moderate: 1, off: -1 };
        const timelimitParam = timelimit ? `time:${timelimit}` : "";
        const sizeParam = size ? `size:${size}` : "";
        const colorParam = color ? `color:${color}` : "";
        const typeImageParam = type_image ? `type:${type_image}` : "";
        const layoutParam = layout ? `layout:${layout}` : "";
        const licenseImageParam = license_image ? `license:${license_image}` : "";

        const payload: SearchPayload = {
            l: region,
            o: "json",
            s: 0,
            q: keywords,
            vqd: vqd,
            f: `${timelimitParam},${sizeParam},${colorParam},${typeImageParam},${layoutParam},${licenseImageParam}`,
            p: safesearchBase[safesearch.toLowerCase()],
        };

        const cache = new Set<string>();

        for (let i = 0; i < 10; i++) {
            const resp = await this._getUrl(
                "GET",
                "https://duckduckgo.com/i.js",
                payload
            );

            if (!resp) {
                break;
            }

            try {
                const respJson = resp.data;
                const pageData = respJson.results;

                if (!pageData) {
                    break;
                }

                let resultExists = false;

                for (const row of pageData) {
                    const imageUrl = row.image;
                    if (imageUrl && !cache.has(imageUrl)) {
                        cache.add(imageUrl);
                        resultExists = true;
                        yield {
                            title: row.title,
                            image: this._normalizeUrl(imageUrl),
                            thumbnail: this._normalizeUrl(row.thumbnail),
                            url: this._normalizeUrl(row.url),
                            height: row.height,
                            width: row.width,
                            source: row.source,
                        };
                    }
                }

                const next = respJson.next;
                if (next) {
                    const sMatch = next.match(/s=([^&]+)/);
                    if (sMatch) {
                        payload.s = sMatch[1];
                    }
                }

                if (!next || !resultExists) {
                    break;
                }
            } catch (error) {
                break;
            }
        }
    }

    /**
     * Search for text results on DuckDuckGo
     * @param keywords - Search query
     * @param region - Region code (default: "wt-wt")
     * @param safesearch - Safe search level: "on", "moderate", "off" (default: "moderate")
     * @param timelimit - Time limit filter (default: null)
     */
    async *text(
        keywords: string,
        region: string = "wt-wt",
        safesearch: "on" | "moderate" | "off" = "moderate",
        timelimit: string | null = null
    ): AsyncGenerator<TextResult> {
        if (!keywords) {
            throw new Error("Keywords are mandatory");
        }

        const vqd = await this._getVqd(keywords);
        if (!vqd) {
            throw new Error("Error in getting vqd");
        }

        const payload: SearchPayload = {
            q: keywords,
            kl: region,
            l: region,
            s: 0,
            df: timelimit,
            vqd: vqd,
            o: "json",
            sp: "0",
        };

        const safeSearchLower = safesearch.toLowerCase();
        if (safeSearchLower === "moderate") {
            payload.ex = "-1";
        } else if (safeSearchLower === "off") {
            payload.ex = "-2";
        } else if (safeSearchLower === "on") {
            payload.p = 1;
        }

        const cache = new Set<string>();
        const searchPositions = ["0", "20", "70", "120"];

        for (const s of searchPositions) {
            payload.s = s;
            const resp = await this._getUrl(
                "GET",
                "https://links.duckduckgo.com/d.js",
                payload
            );

            if (!resp) {
                break;
            }

            try {
                const pageData = resp.data.results;
                if (!pageData) {
                    break;
                }

                let resultExists = false;

                for (const row of pageData) {
                    const href = row.u;
                    if (
                        href &&
                        !cache.has(href) &&
                        href !== `http://www.google.com/search?q=${keywords}`
                    ) {
                        cache.add(href);
                        const body = this._normalize(row.a);
                        if (body) {
                            resultExists = true;
                            yield {
                                title: this._normalize(row.t),
                                href: this._normalizeUrl(href),
                                body: body,
                            };
                        }
                    }
                }

                if (!resultExists) {
                    break;
                }
            } catch (error) {
                break;
            }
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    private async _getUrl(
        method: Method,
        url: string,
        params: SearchPayload
    ): Promise<AxiosResponse<any> | null> {
        for (let i = 0; i < 3; i++) {
            try {
                // DuckDuckGo often returns 202/antibot when User-Agent
                // doesn't look like a real browser. Force some headers to
                // simulate browser access and avoid constant HTTPError.
                const headers = {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    Accept:
                        "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
                    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                    Referer: "https://duckduckgo.com/",
                    DNT: "1",
                };

                const resp = await axios.request({
                    method,
                    url,
                    headers,
                    [method === "GET" ? "params" : "data"]: params,
                });

                if (this._is500InUrl(resp.config.url || "") || resp.status === 202) {
                    throw new HTTPError("");
                }

                if (resp.status === 200) {
                    return resp;
                }
            } catch (ex: any) {
                this.logger.warn(`_getUrl() ${url} ${ex.name} ${ex.message}`);
                if (i >= 2 || ex.message?.includes("418")) {
                    throw ex;
                }
            }
            await sleep(3000);
        }
        return null;
    }

    /**
     * Get VQD token required for API requests
     */
    private async _getVqd(keywords: string): Promise<string | null> {
        try {
            const resp = await this._getUrl("GET", "https://duckduckgo.com", {
                q: keywords,
            } as SearchPayload);

            if (resp) {
                const patterns: Array<[string, string]> = [
                    ['vqd="', '"'],
                    ["vqd=", "&"],
                    ["vqd='", "'"],
                ];

                for (const [startPattern, endPattern] of patterns) {
                    try {
                        const start = resp.data.indexOf(startPattern) + startPattern.length;
                        const end = resp.data.indexOf(endPattern, start);
                        if (start > startPattern.length - 1 && end > start) {
                            return resp.data.substring(start, end);
                        }
                    } catch (error) {
                        this.logger.warn(`_getVqd() keywords=${keywords} vqd not found`);
                    }
                }
            }
        } catch (error) {
            console.error("Error getting VQD:", error);
        }
        return null;
    }

    /**
     * Check if URL contains 500 error
     */
    private _is500InUrl(url: string): boolean {
        return url.includes("500");
    }

    /**
     * Normalize HTML content by stripping tags
     */
    private _normalize(rawHtml: string): string {
        if (rawHtml) {
            return unescape(sub(REGEX_STRIP_TAGS, "", rawHtml));
        }
        return "";
    }

    /**
     * Normalize URL
     */
    private _normalizeUrl(url: string): string {
        if (url) {
            return unquote(url).replace(" ", "+");
        }
        return "";
    }
}

// Export singleton instance
export default new SearchApi();


// duckduckgo-instant-api.ts
interface InstantAnswerResponse {
    Abstract: string;
    AbstractText: string;
    AbstractSource: string;
    AbstractURL: string;
    Image: string;
    Heading: string;
    Answer: string;
    AnswerType: string;
    Definition: string;
    DefinitionSource: string;
    DefinitionURL: string;
    RelatedTopics: Array<{
        Text: string;
        FirstURL: string;
        Icon: { URL: string; Height?: string; Width?: string };
    }>;
    Results: Array<{
        FirstURL: string;
        Text: string;
        Icon: { URL: string };
    }>;
    Type: string;
}

async function searchDuckDuckGoInstant(keyword: string): Promise<InstantAnswerResponse> {
    try {
        const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(keyword)}&format=json&pretty=1&no_html=1&skip_disambig=1`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Search failed:', error);
        throw error;
    }
}

// Usage in AI search tool
async function Search(query: string) {
    const results = await searchDuckDuckGoInstant(query);

    // Format for AI context
    const context = {
        answer: results.AbstractText || results.Answer,
        source: results.AbstractURL,
        related: results.RelatedTopics.slice(0, 5).map(t => t.Text),
        definition: results.Definition
    };

    return context;
}
