/**
 * Search Replace Tool - Replace content in files
 */
import { ToolBase } from '../ToolBase';

const fs = window.desk.fs


export class SearchReplaceTool extends ToolBase {
    constructor() {
        super('search_replace', 'Replace sections of files using SEARCH/REPLACE blocks');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "search_replace",
                description: "Replace sections of files using SEARCH/REPLACE blocks. Supports fuzzy matching and detailed error reporting.",
                parameters: {
                    type: "object",
                    properties: {
                        file_path: {
                            type: "string",
                            description: "Path to the file to modify"
                        },
                        content: {
                            type: "string",
                            description: "Search/replace content in format: <<<<<<< SEARCH\\n[text]\\n=======\\n[replacement]\\n>>>>>>> REPLACE"
                        }
                    },
                    required: ["file_path", "content"]
                }
            }
        };
    }

    async _execute({ file_path, content }, context) {
        // Parse the search/replace blocks
        const blocks = this.parseSearchReplaceContent(content);
        console.log(blocks)
        if (blocks.length === 0) {
            throw new Error('No valid SEARCH/REPLACE blocks found in content');
        }

        // Read the file
        const fileContent = fs.readFileSync(file_path, 'utf8');

        let modifiedContent = fileContent;
        let changesMade = 0;

        // Apply each search/replace block
        for (const block of blocks) {
            const searchPattern = block.search.trim();
            const replacement = block.replace.trim();

            // Find the search pattern in the file
            const searchIndex = modifiedContent.indexOf(searchPattern);
            console.log(searchIndex, searchPattern)
            if (searchIndex !== -1) {
                // Replace the content
                modifiedContent = modifiedContent.substring(0, searchIndex) +
                    replacement +
                    modifiedContent.substring(searchIndex + searchPattern.length);
                changesMade++;
            }
        }

        // Write back to file if changes were made
        if (changesMade > 0) {
            // Create backup if configured
            if (this.config.create_backup) {
                const backupPath = file_path + '.backup_' + Date.now();
                fs.writeFileSync(backupPath, fileContent);
            }

            fs.writeFileSync(file_path, modifiedContent);
        }

        return {
            file_path: file_path,
            changes_made: changesMade,
            total_blocks: blocks.length,
            backup_created: this.config.create_backup
        };
    }

    parseSearchReplaceContent(content) {
        const blocks = [];
        const lines = content.split('\n');

        let currentBlock = null;
        let inSearch = false;
        let inReplace = false;

        for (const line of lines) {
            console.log(line)
            if (line.trim() === '<<<<<<< SEARCH') {
                currentBlock = { search: '', replace: '' };
                inSearch = true;
                inReplace = false;
            } else if (line.trim() === '=======') {
                inSearch = false;
                inReplace = true;
            } else if (line.trim() === '>>>>>>> REPLACE') {
                inReplace = false;
                if (currentBlock) {
                    blocks.push(currentBlock);
                    currentBlock = null;
                }
            } else if (currentBlock) {
                if (inSearch) {
                    currentBlock.search += line + '\n';
                } else if (inReplace) {
                    currentBlock.replace += line + '\n';
                }
            }
        }

        return blocks;
    }

    formatResult(result) {
        return {
            success: true,
            //tool: this.name,
            file_path: result.file_path,
            changes_made: result.changes_made,
            total_blocks: result.total_blocks,
            backup_created: result.backup_created
        };
    }
}
