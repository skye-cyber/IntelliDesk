
const thinkms = `
<think>
Key Optimizations:
Early Return for Authentication Check: We immediately return None if the user is not authenticated.
Simplified Farm Check: We return None if no farms are found for the user.
Consistent Handling of farms: We handle both QuerySet and list cases in a more readable manner.
Reduced Redundancy: We avoid repeating the isinstance check by handling both locations and names in a single block.
</think>
Explanation:
Authentication Check: The function first checks if the user is authenticated. If not, it returns None.
Farms Filtering: It filters the FarmInformation objects for the current user.
No Farms Found: If no farms are found, it returns None.
Location or Name Selection: Depending on the locations and names parameters, it extracts either farm_location or farm_name from the farms queryset or list.
\`\`\`python
import os

class LinkFetcher:
def __init__(self, base_url):
	self.base_url = base_url

def fetch_links(self, url):
	# Simulated function to fetch links from a given URL
	# Replace this with your actual implementation
	return [
		"/cgit/qt/qtdeclarative.git/plain/src/qmlls/file1.txt",
	"/cgit/qt/qtdeclarative.git/plain/src/qmlls/file2.txt",
	"/cgit/qt/qtdeclarative.git/plain/src/another_dir/",
	]

def get_all_links(self, base):
	links_list = []

def add_links(links, base_url):
for link in links:
	if link.startswith("/cgit/qt/qtdeclarative.git/plain/src/qmlls/"):
		full_link = os.path.join(base_url, link.split("qmlls/")[-1])
		links_list.append(full_link)
		# Name Selection: Depending on the locations and names parameters, it extracts either farm_location or farm_name from the farms queryset or list.
		def recurse_dirs(links, base_url):
			for link in links:  # Iterate over a copy of the list to avoid modification issues
				if link.endswith("/"):
					full_link = os.path.join(base_url, link)
					sub_links = self.fetch_links(full_link)
					add_links(sub_links, base_url)
					recurse_dirs(sub_links, base_url)

					initial_links = self.fetch_links(base)
					add_links(initial_links, self.base_url)
					recurse_dirs(initial_links, self.base_url)

					return links_list

					# Example usage
					base_url = "https://example.com"
					fetcher = LinkFetcher(base_url)
					all_links = fetcher.get_all_links(base_url + "/cgit/qt/qtdeclarative.git/plain/src/")
					print(all_links)
					def recurse_dirs(links, base_url):
					for link in links:  # Iterate over a copy of the list to avoid modification issues
						if link.endswith("/"):
							full_link = os.path.join(base_url, link)
							sub_links = self.fetch_links(full_link)
							add_links(sub_links, base_url)
							recurse_dirs(sub_links, base_url)

							initial_links = self.fetch_links(base)
							add_links(initial_links, self.base_url)
							recurse_dirs(initial_links, self.base_url)

							return links_list

							# Example usage
							base_url = "https://example.com"
							fetcher = LinkFetcher(base_url)
							all_links = fetcher.get_all_links(base_url + "/cgit/qt/qtdeclarative.git/plain/src/")
							print(all_links)
\`\`\`
Name Selection: Depending on the locations and names parameters, it extracts either farm_location or farm_name from the farms queryset or list.
`

const message3 = `System integrity-check Already executed. Need deeper diagnostics or specific subsystem focus?`

const code =
    `<continued>
continued
\`\`\`python
import os

class LinkFetcher:
def __init__(self, base_url):
self.base_url = base_url

def fetch_links(self, url):
# Simulated function to fetch links from a given URL
# Replace this with your actual implementation
return [
    "/cgit/qt/qtdeclarative.git/plain/src/qmlls/file1.txt",
    "/cgit/qt/qtdeclarative.git/plain/src/qmlls/file2.txt",
    "/cgit/qt/qtdeclarative.git/plain/src/another_dir/",
]

def get_all_links(self, base):
links_list = []
\`\`\`
    </continued>`

//Ai content emulator for Test
export async function* _generateTextChunks(input, message = null, hf = false) {
    message = message ? message : message3

    if (input === "continue") message = code

    const chunkSize = 1; // Number of characters per chunk
    message = message.split(' ');
    let index = 0;
    const totalLength = message.length;
    while (index < totalLength) {
        // Generate a chunk of text
        const chunk = message.slice(index, index + chunkSize);
        if (hf === true) {
            yield { choices: [{ delta: { content: `${chunk} ` } }] };
        } else {
            yield { data: { choices: [{ delta: { content: `${chunk} ` } }] } };

        }
        index += chunkSize;

        // Wait for 0.5 seconds before generating the next chunk
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

// AI content emulator for testing with realistic streaming behavior
export async function* generateTextChunks(input, message = null, hf = false) {
    // Default test messages for different scenarios
    const testMessages = {
        normal: "This is a $E = mc^2$ or (E = mc^2) test message for streaming simulation. It includes various punctuation marks, numbers like 123, and special characters!",
        xml: "<name>Test Conversation</name>This is the actual response content after the name tag.",
        code: "```javascript\n function example() {\n\t return 'Hello World';\n }\n // This is a code example\n```",
        long: "This is a much longer message designed to test streaming with multiple chunks and various edge cases including line breaks\nand special characters like <, >, &, and @ symbols.",
        mixed: "<name>Analysis Result</name><think>\nLet me analyze this...</think>\nThe final answer is 42.",
        edge: "Incomplete<name>Partial",
        empty: "",
        continue: `<continued> Continuation response </continued> ${code}`,
        name: "<name>Test c name</name>The rest of response goes here",
        think: thinkms
    };

    // Select message based on input
    if (!message) {
        message = testMessages[input] || testMessages.normal;
    }

    if (input === "continue") {
        message = testMessages.continue;
    }

    // Character-level chunking for more realistic streaming
    const chunkConfigs = {
        slow: { size: 1, delay: 50 },    // Very slow, character by character
        normal: { size: 3, delay: 30 },  // Normal speed
        fast: { size: 5, delay: 10 },    // Fast streaming
        burst: { size: 8, delay: 5 },    // Bursty behavior
        mixed: { size: () => Math.floor(Math.random() * 6) + 1, delay: () => Math.random() * 40 + 10 } // Random sizes and delays
    };

    const config = chunkConfigs.normal; // Change this to test different streaming behaviors

    let position = 0;
    const totalLength = message.length;

    // Simulate initial processing delay
    await new Promise(resolve => setTimeout(resolve, 10));

    while (position < totalLength) {
        // Determine chunk size (fixed or random)
        const chunkSize = typeof config.size === 'function' ? config.size() : config.size;
        const nextChunk = message.slice(position, position + chunkSize);

        // Determine delay (fixed or random)
        const delay = typeof config.delay === 'function' ? config.delay() : config.delay;

        // Simulate realistic chunk with proper structure
        const chunkData = hf ?
            { choices: [{ delta: { content: nextChunk } }] } :
            { data: { choices: [{ delta: { content: nextChunk } }] } };

        yield chunkData;

        position += chunkSize;

        // Wait before next chunk
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Final empty chunk to signal completion (real APIs often do this)
    yield hf ?
        { choices: [{ delta: {} }] } :
        { data: { choices: [{ delta: {} }] } };
}

// Enhanced version with more testing scenarios
export async function* generateTextChunksAdvanced(scenario = "normal", options = {}) {
    const {
        hf = false,
        speed = "normal",
        includeThinking = true,
        includeNameTags = true,
        includeErrors = false,
        partialTokens = false
    } = options;

    const scenarios = {
        normal: "This is a comprehensive test of the streaming functionality with various elements.",

        xml: includeNameTags ?
            "<name>Test Conversation</name>This is the response content." :
            "Regular response without XML tags.",

        thinking: includeThinking ?
            "<think>Let me analyze this request carefully...</think>Based on my analysis, here's the answer." :
            "Direct response without thinking tags.",

        code: "```javascript\nfunction calculate(a, b) {\n  return a + b;\n}\n```\nThis function adds two numbers.",

        long: "This is an exceptionally long message designed to thoroughly test the streaming capabilities under extended conditions. It includes multiple sentences, various punctuation marks, numbers like 42 and 3.14, and special characters such as <, >, &, @, and #. The goal is to simulate real-world usage where responses can be quite lengthy and complex.",

        mixed: "<think>Processing request...</think><name>Mixed Response</name>Here is the final answer with <b>formatting</b> and special chars: & < >",

        edge: "Incomplete<name>Partial Tag",

        empty: "",

        bursty: "Bursty content with varying chunk sizes",

        special: "Content with 🚀 emojis and unicode: Café naïve résumé",

        markdown: "## Heading\n\n- List item 1\n- List item 2\n\n**Bold** and *italic* text."
    };

    let message = scenarios[scenario] || scenarios.normal;

    // Speed configurations
    const speedConfigs = {
        slow: { minSize: 1, maxSize: 2, minDelay: 80, maxDelay: 150 },
        normal: { minSize: 2, maxSize: 5, minDelay: 30, maxDelay: 70 },
        fast: { minSize: 4, maxSize: 8, minDelay: 10, maxDelay: 30 },
        burst: { minSize: 1, maxSize: 15, minDelay: 5, maxDelay: 100 },
        realtime: { minSize: 1, maxSize: 4, minDelay: 20, maxDelay: 50 }
    };

    const config = speedConfigs[speed] || speedConfigs.normal;

    let position = 0;
    const totalLength = message.length;

    // Simulate initial connection delay
    await new Promise(resolve => setTimeout(resolve, 150));

    let chunkCount = 0;

    while (position < totalLength) {
        chunkCount++;

        // Random chunk size within range
        const chunkSize = Math.floor(Math.random() * (config.maxSize - config.minSize + 1)) + config.minSize;
        let nextChunk = message.slice(position, position + chunkSize);

        // Simulate partial tokens for edge case testing
        if (partialTokens && chunkCount % 5 === 0 && position + chunkSize < totalLength) {
            // Occasionally break in the middle of words/tags
            if (nextChunk.includes(' ')) {
                const words = nextChunk.split(' ');
                if (words.length > 1) {
                    nextChunk = words.slice(0, -1).join(' ');
                    position -= words[words.length - 1].length;
                }
            }
        }

        // Simulate network variability
        const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;

        const chunkData = hf ?
            { choices: [{ delta: { content: nextChunk } }] } :
            { data: { choices: [{ delta: { content: nextChunk } }] } };

        // Simulate occasional errors if enabled
        if (includeErrors && Math.random() < 0.1) {
            await new Promise(resolve => setTimeout(resolve, delay * 2));
            // Continue anyway, just simulated latency spike
        }

        yield chunkData;

        position += nextChunk.length;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Final completion signal
    yield hf ?
        { choices: [{ delta: {}, finish_reason: "stop" }] } :
        { data: { choices: [{ delta: {}, finish_reason: "stop" }] } };
}

// Utility function for specific test cases
export const testScenarios = {
    // Test XML tag parsing
    async *xmlTagTest() {
        const chunks = [
            "<nam", "e>", "Test", " Con", "versation", "</", "name", ">", "This is the content."
        ];

        for (const chunk of chunks) {
            yield { data: { choices: [{ delta: { content: chunk } }] } };
            await new Promise(resolve => setTimeout(resolve, 40));
        }
        yield { data: { choices: [{ delta: {}, finish_reason: "stop" }] } };
    },

    // Test thinking then response
    async *thinkingTest() {
        const chunks = [
            "<think", "ing>", "Let me think", " about this", "...", "</thinking", ">", "Here's my answer."
        ];

        for (const chunk of chunks) {
            yield { data: { choices: [{ delta: { content: chunk } }] } };
            await new Promise(resolve => setTimeout(resolve, 35));
        }
        yield { data: { choices: [{ delta: {}, finish_reason: "stop" }] } };
    },

    // Test edge cases with partial tokens
    async *edgeCaseTest() {
        const chunks = [
            "Incomplete", "<", "name", ">Par", "tial", " Tag", "Content", " with", " broken", " structure"
        ];

        for (const chunk of chunks) {
            yield { data: { choices: [{ delta: { content: chunk } }] } };
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        yield { data: { choices: [{ delta: {}, finish_reason: "stop" }] } };
    }
};

// Usage examples:
/*
 / /* Basic usage
 for await (const chunk of generateTextChunks("normal")) {
     console.log(chunk.data.choices[0].delta.content);
            }

            // Advanced scenarios
            for await (const chunk of generateTextChunksAdvanced("xml", {
                includeNameTags: true,
                speed: "slow",
                partialTokens: true
                })) {
                console.log(chunk.data.choices[0].delta.content);
            }

            // Specific edge case tests
            for await (const chunk of testScenarios.xmlTagTest()) {
                console.log(chunk.data.choices[0].delta.content);
            }
            */

window.generateTextChunks = generateTextChunks;
