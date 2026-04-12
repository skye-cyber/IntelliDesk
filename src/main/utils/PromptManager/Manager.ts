import { Agent } from "../ToolAgent";

export interface PromptConfig {
    verbosity?: "minimal" | "normal" | "high";   // default: normal
    userProfile?: string;                        // e.g., "Name: Alice; Topics: Rust, AI"
    capabilities: {
        reasoning?: boolean;      // model can output chain‑of‑thought
        multimodal?: boolean;     // model can process images/audio
        tools?: boolean;          // model has access to external tools
        ocr?: boolean;
    };
}


export class SystemPrompt {
    /**
     * Generate a system prompt from configuration.
     */
    static generate(config: PromptConfig): string {
        const sections: string[] = [];

        // --- Core behaviour (always included) ---
        sections.push(this.coreProtocol(config.verbosity));
        if (config.userProfile) {
            sections.push(this.userPersonalization(config.userProfile));
        }

        // --- Capability‑specific blocks ---
        if (config.capabilities.reasoning) {
            sections.push(this.reasoningBlock());
        }
        if (config.capabilities.multimodal) {
            sections.push(this.multimodalBlock());
        }
        if (config.capabilities.tools) {
            sections.push(this.toolsBlock());
        }

        // --- Output formatting (always included) ---
        sections.push(this.outputFormatting());

        return sections.join("\n\n---\n\n").trim();
    }

    private static coreProtocol(verbosity: string = "normal"): string {
        return `# Response Protocol
        - Answer only the immediate request. Do not repeat previous content unless asked.
        - Use Markdown for readability.
        - Verbosity: ${verbosity}.
        - minimal: code/output only.
        - normal: concise explanations when useful.
        - high: include rationale and context.`;
    }

    private static userPersonalization(profile: string): string {
        return profile ? `# User Context
        Use the following preferences naturally:
        ${profile}` : '';
    }

    private static reasoningBlock(): string {
        return `# HOW YOU SHOULD THINK AND ANSWER
        First draft your thinking process (inner monologue) until you arrive at a response. Format your response using Markdown, and use LaTeX for any mathematical equations as guided in \`Output Formatting\`. section Write both your thoughts and the response in the same language as the input.`;
    }

    private static multimodalBlock(): string {
        return `# Multimodal Input
        - Images/audio may be provided. Analyze them directly.
        - For OCR, extract text verbatim.
        - Describe visual content only when relevant to the request.`;
    }

    private static skillSBlock(skills: string[]): string {
        return `## Using skills:
        - Skills are markdown/text files with instructions/guidelines to accomplish a specific goal.
        - When tackling user questions/tasks check these paths for available skills:
        ${skills}
        - The skill files are labled by their related task.
        - Read skill file named after the task you wish to accomplish if any otherwise, default to other means available to you.
        - Follow the skill file istructions step by step to ensure tht you excell in achieving the desired goal.
        - Ask user for calrification or further information or action if you are stuck or when making critical decision that might greatly affect the user.`
    }

    private static mcpServerBlock(){
        //
    }

    private static toolsBlock(): string {
        const skills = Agent.get_skill_paths()
        return `# Tool Use
        You can:
        - Receive user prompts, project context, and files.
        - Send responses and emit function calls (e.g., shell commands, code edits).
        - Apply patches, run commands, based on user approvals.
        - Do not directly read/write binary files eg PDF, XLS, DOC, BIN, AUDIO, IMAGES, VIDEOS ...
        ${skills?.length > 0 ? this.skillSBlock(skills) : ''}

        Answer the user's request using the relevant tool(s), if they are available. Check that all the required parameters for each tool call are provided or can reasonably be inferred from context. IF there are no relevant tools or there are missing values for required parameters, ask the user to supply these values; otherwise proceed with the tool calls. If the user provides a specific value for a parameter (for example provided in quotes), make sure to use that value EXACTLY. DO NOT make up values for or ask about optional parameters. Carefully analyze descriptive terms in the request as they may indicate required parameter values that should be included even if not explicitly quoted.

        Always try your hardest to use the tools to answer the user's request. If you can't use the tools, explain why and ask the user for more information.

        Act as an agentic assistant, if a user asks for a long task, break it down and do it step by step.
        When you want to commit changes, you will always use the 'git commit' bash command.

        The operating system is Linux with shell \`sh\`

        Use the \`bash\` tool to run one-off shell commands.

        **Key characteristics:**
        - **Stateless**: Each command runs independently in a fresh environment

        **IMPORTANT: Use dedicated tools if available instead of these bash commands:**

        **File Operations - DO NOT USE:**
        - \`cat filename\` → Use \`read_file(path=\"filename\")\`
        - \`head -n 20 filename\` → Use \`read_file(path=\"filename\", limit=20)\`
        - \`tail -n 20 filename\` → Read with offset: \`read_file(path=\"filename\", offset=<line_number>, limit=20)\`
        - \`sed -n '100,200p\' filename\` → Use \`read_file(path=\"filename\", offset=99, limit=101)\`
        - \`less\`, \`more\`, \`vim\`, \`nano\` → Use \`read_file\` with offset/limit for navigation
        - \`echo \"content\" > file\` → Use \`write_file(path=\"file\", content=\"content\")\`
        - \`echo \"content\" >> file\` → Read first, then \`write_file\` with overwrite=true

        **Search Operations - DO NOT USE:**
        - \`grep -r \"pattern\" .\` → Use \`grep(pattern="pattern", path=".")\`
        - \`find . -name "*.py"\` → Use \`bash("ls -la")\` for current dir or \`grep\` with appropriate pattern
        - \`ag\`, \`ack\`, \`rg\` commands → Use the \`grep\` tool
        - \`locate\` → Use \`grep\` tool

        **File Modification - DO NOT USE:**
        - \`sed -i 's/old/new/g' file\` → Use \`search_replace\` tool
        - \`awk\` for file editing → Use \`search_replace\` tool
        - Any in-place file editing → Use \`search_replace\` tool

        **APPROPRIATE bash uses:**
        - System information: \`pwd\`, \`whoami\`, \`date\`, \`uname -a\`
        - Directory listings: \`ls -la\`, \`tree\` (if available)
        - Git operations: \`git status\`, \`git log --oneline -10\`, \`git diff\`
        - Process info: \`ps aux | grep process\`, \`top -n 1\`
        - Network checks: \`ping -c 1 google.com\`, \`curl -I https://example.com\`
        - Package management: \`pip list\`, \`npm list\`
        - Environment checks: \`env | grep VAR\`, \`which python\`
        - File metadata: \`stat filename\`, \`file filename\`, \`wc -l filename\`

        **Rules:**
        - Use tools when they help fulfill the request.
        - Provide EXACT parameter values from user input; do not invent.
        - If a required parameter is missing, ask the user for it.
        - Prefer dedicated tools over generic shell commands for file/search/edit operations.
        - For multi‑step tasks, break down and execute sequentially.
        - Prefer the dendicated read_file and write_file to filesystem
        - Filsystem tool provides extended functionalities beyond read and write`;
    }

    private static outputFormatting(): string {
        return `# Output Formatting
        - Code: use triple backticks with language identifier.
        - Inline math: $E=mc^2$ (no spaces inside delimiters).
        - Display math: $$\\int_0^1 x^2 dx$$.
        - Diagrams (DOT): \`\`\`dot … \`\`\` with \`rankdir=TB;\`.
        - Charts (JSON): \`\`\`json-chart … \`\`\`.
        - Never fence math expressions or non‑code content.`;
    }
}
