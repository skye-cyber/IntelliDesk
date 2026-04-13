import OpenAI from "openai";
import { createInterface } from 'readline/promises';

// Define constants
const BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: BASE_URL
});

async function getResponse(messages) {
    try {
        const completion = await openai.chat.completions.create({
            // Model list: https://www.alibabacloud.com/help/en/model-studio/getting-started/models
            model: "qwen-plus",
            messages: messages,
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error fetching response:", error);
        throw error;  // Rethrow the exception for upper-level handling
    }
}

// Initialize messages array
const messages = [
    {
        "role": "system",
        "content": `You are a clerk at the Bailian phone store, responsible for recommending phones to users. Phones have two parameters: screen size (including 6.1 inches, 6.5 inches, 6.7 inches) and resolution (including 2K, 4K).
        You can only ask the user one parameter at a time. If the user's information is incomplete, you need to ask a follow-up question to provide the missing parameter. If the parameter collection is complete, you should say: I have understood your purchase intention, please wait a moment.`,
    }
];

let assistant_output = "Welcome to the Bailian phone store. What is the size of the phone do you need to buy?";
console.log(assistant_output);


const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    while (!assistant_output.includes("I have understood your purchase intention")) {
        const user_input = await readline.question("Please enter:");
        messages.push({ role: "user", content: user_input});
        try {
            const response = await getResponse(messages);
            assistant_output = response;
            messages.push({ role: "assistant", content: assistant_output });
            console.log(assistant_output);
            console.log("\n");
        } catch (error) {
            console.error("Error fetching response:", error);
        }
    }
    readline.close();
})();


//Streaming API
import OpenAI from "openai";

const openai = new OpenAI(
    {
        // If the environment variable is not configured, replace the following line with: apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    }
);

const completion = await openai.chat.completions.create({
    model: "qwen-plus", // qwen-plus is used as an example. You can use other models in the model list: https://www.alibabacloud.com/help/en/model-studio/getting-started/models
    messages: [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who are you?"}
    ],
    stream: true,
    stream_options: {
        include_usage: true
    }
});

let fullContent = "";
console.log("Streaming output content is:")
for await (const chunk of completion) {
    // If stream_options.include_usage is true, the choices field of the last chunk is empty and need to be skipped. Obtain token usage from chunk.usage instead.
    if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
        fullContent = fullContent + chunk.choices[0].delta.content;
        console.log(chunk.choices[0].delta.content);
    }
}
console.log("\nFull content is:")
console.log(fullContent);


//Models=37
`
Qwen-QwQ-Plus（qwq-plus）
QVQ-Max-Latest（qvq-max-latest）
QVQ-Max-2025-03-25（qvq-max-2025-03-25）
QVQ-Max（qvq-max）
qwen2.5-vl-32b-instruct（qwen2.5-vl-32b-instruct）
Qwen2.5-Omni-7B（qwen2.5-omni-7b）
Qwen-Max（qwen-max）
Qwen-Max-Latest（qwen-max-latest）
Qwen-Max-2025-01-25（qwen-max-2025-01-25）
Qwen-Plus（qwen-plus）
Qwen-Plus-Latest（qwen-plus-latest）
Qwen-Plus-2025-01-25（qwen-plus-2025-01-25）
Qwen-Turbo（qwen-turbo）
Qwen-Turbo-Latest（qwen-turbo-latest）
Qwen-Turbo-2024-11-01（qwen-turbo-2024-11-01）
Qwen-VL-Max（qwen-vl-max）
Qwen-VL-Plus（qwen-vl-plus）
Qwen2.5-VL-72B-Instruct（qwen2.5-vl-72b-instruct）
Qwen2.5-VL-7B-Instruct（qwen2.5-vl-7b-instruct）
Qwen2.5-VL-3B-Instruct（qwen2.5-vl-3b-instruct）
Qwen2.5-7B-Instruct-1M（qwen2.5-7b-instruct-1m）
Qwen2.5-14B-Instruct-1M（qwen2.5-14b-instruct-1m）
Qwen2.5-72B-Instruct（qwen2.5-72b-instruct）
Qwen2.5-32B-Instruct（qwen2.5-32b-instruct）
Qwen2.5-14B-Instruct（qwen2.5-14b-instruct）
Qwen2.5-7B-Instruct（qwen2.5-7b-instruct）
Qwen2-72B-Instruct（qwen2-72b-instruct）
Qwen2-57B-A14B-Instruct（qwen2-57b-a14b-instruct）
Qwen2-7B-Instruct（qwen2-7b-instruct）
Qwen1.5-110B-Chat（qwen1.5-110b-chat）
Text-Embedding-v3（text-embedding-v3）
Qwen-MT-Turbo（qwen-mt-turbo）
Qwen-MT-Plus（qwen-mt-plus）
Qwen1.5-7B-Chat（qwen1.5-7b-chat）
Qwen1.5-72B-Chat（qwen1.5-72b-chat）
Qwen1.5-32B-Chat（qwen1.5-32b-chat）
Qwen1.5-14B-Chat（qwen1.5-14b-chat）`


//Tools
// Paste the following code after the code in Step 1

// Step 2: Create tools array

const tools = [
    {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Very useful when you want to know the current time.",
        }
    },
{
    type: "function",
    function: {
        name: "get_current_weather",
        description: "Very useful when you want to query the weather of a specified city.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "City or district, such as Singapore, Hangzhou, Yuhang District, etc.",
                }
            },
            required: ["location"]
        }
    }
}
];

const toolNames = tools.map(tool => tool.function.name);
console.log(`Created ${tools.length} tools: ${toolNames.join(', ')}\n`);
