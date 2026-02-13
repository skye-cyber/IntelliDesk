/**
 * Send Message Tool - Send messages to various platforms
 */
import { ToolBase } from '../ToolBase';
import { MessageService } from '../ToolProviders/MessageService';


export class SendMessageTool extends ToolBase {
    constructor() {
        super('send_message', 'Send messages to various platforms');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "send_message",
                description: "Send messages to various platforms",
                parameters: {
                    type: "object",
                    properties: {
                        platform: {
                            type: "string",
                            enum: ["email", "sms", "slack", "discord", "teams", "whatsapp"],
                            description: "Messaging platform"
                        },
                        to: {
                            anyOf: [
                                { type: "string" },
                                { 
                                    type: "array",
                                    items: { type: "string" }
                                }
                            ],
                            description: "Recipient(s) address or identifier"
                        },
                        subject: {
                            type: "string",
                            description: "Message subject (for email and some platforms)"
                        },
                        body: {
                            type: "string",
                            description: "Message content"
                        },
                        attachments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    path: { type: "string" },
                                    type: { type: "string" }
                                }
                            },
                            description: "File attachments"
                        },
                        priority: {
                            type: "string",
                            enum: ["low", "normal", "high", "urgent"],
                            default: "normal",
                            description: "Message priority"
                        },
                        schedule_time: {
                            type: "string",
                            format: "date-time",
                            description: "Scheduled send time (ISO format)"
                        }
                    },
                    required: ["platform", "to", "body"]
                }
            }
        };
    }

    async _execute({ platform, to, subject, body, attachments = [], priority = "normal", schedule_time }, context) {
        // Validate platform
        const validPlatforms = ["email", "sms", "slack", "discord", "teams", "whatsapp"];
        if (!validPlatforms.includes(platform)) {
            throw new Error(`Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`);
        }

        // Validate recipients
        const recipients = Array.isArray(to) ? to : [to];
        if (recipients.length === 0) {
            throw new Error('At least one recipient is required');
        }

        // Validate message body
        if (!body || typeof body !== 'string' || body.trim().length === 0) {
            throw new Error('Message body must be a non-empty string');
        }

        // Validate attachments
        if (attachments && !Array.isArray(attachments)) {
            throw new Error('Attachments must be an array');
        }

        try {
            // Initialize message service
            const messageService = new MessageService(platform);

            // Prepare message data
            const messageData = {
                platform: platform,
                recipients: recipients,
                subject: subject,
                body: body,
                attachments: attachments,
                priority: priority,
                schedule_time: schedule_time,
                metadata: {
                    sender: this.config.default_sender || 'system',
                    context: context
                }
            };

            // Send message
            const result = await messageService.sendMessage(messageData);

            return {
                platform: platform,
                message_id: result.messageId,
                recipients: recipients,
                status: result.status,
                timestamp: new Date().toISOString(),
                delivery_info: result.deliveryInfo
            };
        } catch (error) {
            throw new Error(`Message sending failed: ${error.message}`);
        }
    }

    formatResult(result) {
        return {
            success: true,
            //tool: this.name,
            platform: result.platform,
            message_id: result.message_id,
            recipients: result.recipients,
            status: result.status,
            timestamp: result.timestamp,
            delivery_info: result.delivery_info
        };
    }
}
