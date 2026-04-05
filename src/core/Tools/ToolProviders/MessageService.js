/**
 * Message Service - Unified service for sending messages across multiple platforms
 */
// import nodemailer from 'nodemailer';
// import twilio from 'twilio';
// import { WebClient } from '@slack/web-api';
// import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
// import fetch from 'node-fetch';

export class MessageService {
    constructor(platform, config = {}) {
        this.platform = platform;
        this.config = this.loadConfig(config);
        this.initializeClient();
    }

    /**
     * Load configuration from various sources
     */
    loadConfig(userConfig) {
        // Default configuration
        const defaultConfig = {
            email: {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || '',
                    pass: process.env.EMAIL_PASS || ''
                },
                defaults: {
                    from: process.env.EMAIL_FROM || 'noreply@example.com'
                }
            },
            sms: {
                provider: 'twilio',
                accountSid: process.env.TWILIO_ACCOUNT_SID || '',
                authToken: process.env.TWILIO_AUTH_TOKEN || '',
                fromNumber: process.env.TWILIO_FROM_NUMBER || ''
            },
            slack: {
                token: process.env.SLACK_BOT_TOKEN || '',
                defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || ''
            },
            discord: {
                token: process.env.DISCORD_BOT_TOKEN || '',
                defaultChannelId: process.env.DISCORD_DEFAULT_CHANNEL || ''
            },
            teams: {
                webhookUrl: process.env.TEAMS_WEBHOOK_URL || ''
            },
            whatsapp: {
                provider: 'twilio', // or other providers
                accountSid: process.env.TWILIO_ACCOUNT_SID || '',
                authToken: process.env.TWILIO_AUTH_TOKEN || '',
                fromNumber: process.env.WHATSAPP_FROM_NUMBER || ''
            },
            // Retry and rate limiting
            retryConfig: {
                maxRetries: 3,
                initialDelay: 1000,
                maxDelay: 10000
            }
        };

        // Merge with user config
        return { ...defaultConfig, ...userConfig };
    }

    /**
     * Initialize platform-specific client
     */
    initializeClient() {
        switch (this.platform) {
            case 'email':
                this.client = this.initEmailClient();
                break;
            case 'sms':
                this.client = this.initSmsClient();
                break;
            case 'slack':
                this.client = this.initSlackClient();
                break;
            case 'discord':
                break
                //this.client = this.initDiscordClient();
                //break;
            case 'teams':
                // Teams uses webhooks, no persistent client needed
                break;
            case 'whatsapp':
                this.client = this.initWhatsappClient();
                break;
            default:
                throw new Error(`Unsupported platform: ${this.platform}`);
        }
    }

    /**
     * Initialize email client (nodemailer)
     */
    initEmailClient() {
        const emailConfig = this.config.email;

        if (!emailConfig.auth.user || !emailConfig.auth.pass) {
            throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
        }

        return nodemailer.createTransport({
            service: emailConfig.service,
            auth: emailConfig.auth
        });
    }

    /**
     * Initialize SMS client (Twilio)
     */
    initSmsClient() {
        const smsConfig = this.config.sms;

        if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.fromNumber) {
            throw new Error('SMS credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER environment variables.');
        }

        return twilio(smsConfig.accountSid, smsConfig.authToken);
    }

    /**
     * Initialize Slack client
     */
    initSlackClient() {
        const slackConfig = this.config.slack;

        if (!slackConfig.token) {
            throw new Error('Slack token not configured. Set SLACK_BOT_TOKEN environment variable.');
        }

        return new WebClient(slackConfig.token);
    }

    /**
     * Initialize Discord client
     */
    async initDiscordClient() {
        const discordConfig = this.config.discord;

        if (!discordConfig.token) {
            throw new Error('Discord token not configured. Set DISCORD_BOT_TOKEN environment variable.');
        }

        const client = new DiscordClient({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        // Login the client
        await client.login(discordConfig.token);

        // Wait for client to be ready
        await new Promise((resolve) => {
            client.once('ready', resolve);
        });

        return client;
    }

    /**
     * Initialize WhatsApp client (using Twilio)
     */
    initWhatsappClient() {
        const whatsappConfig = this.config.whatsapp;

        if (!whatsappConfig.accountSid || !whatsappConfig.authToken || !whatsappConfig.fromNumber) {
            throw new Error('WhatsApp credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and WHATSAPP_FROM_NUMBER environment variables.');
        }

        return twilio(whatsappConfig.accountSid, whatsappConfig.authToken);
    }

    /**
     * Main method to send messages
     */
    async sendMessage(messageData) {
        const { platform, recipients, subject, body, attachments, priority, schedule_time } = messageData;

        // Validate platform matches service
        if (platform !== this.platform) {
            throw new Error(`Service configured for ${this.platform}, but trying to send to ${platform}`);
        }

        // Schedule message if requested
        if (schedule_time) {
            return await this.scheduleMessage(messageData);
        }

        // Send immediately
        return await this.sendImmediateMessage(messageData);
    }

    /**
     * Send message immediately
     */
    async sendImmediateMessage(messageData) {
        const { recipients, subject, body, attachments, priority } = messageData;

        try {
            let result;

            switch (this.platform) {
                case 'email':
                    result = await this.sendEmail(recipients, subject, body, attachments);
                    break;
                case 'sms':
                    result = await this.sendSMS(recipients, body);
                    break;
                case 'slack':
                    result = await this.sendSlackMessage(recipients, body, attachments);
                    break;
                case 'discord':
                    result = await this.sendDiscordMessage(recipients, body, attachments);
                    break;
                case 'teams':
                    result = await this.sendTeamsMessage(recipients, body, attachments);
                    break;
                case 'whatsapp':
                    result = await this.sendWhatsApp(recipients, body, attachments);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.platform}`);
            }

            return {
                messageId: result.messageId || result.id || Date.now().toString(),
                status: 'sent',
                platform: this.platform,
                timestamp: new Date().toISOString(),
                deliveryInfo: result.deliveryInfo || result,
                metadata: {
                    recipients: recipients,
                    priority: priority
                }
            };
        } catch (error) {
            // Retry logic
            return await this.retrySend(messageData, error);
        }
    }

    /**
     * Schedule a message for later delivery
     */
    async scheduleMessage(messageData) {
        const { schedule_time, recipients, subject, body, attachments, priority } = messageData;

        const scheduledTime = new Date(schedule_time);
        const now = new Date();

        if (scheduledTime <= now) {
            // If scheduled time is in the past, send immediately
            return await this.sendImmediateMessage(messageData);
        }

        // Calculate delay
        const delay = scheduledTime.getTime() - now.getTime();

        // Schedule the message
        const scheduleId = `schedule_${Date.now()}_${this.platform}`;

        setTimeout(async () => {
            try {
                await this.sendImmediateMessage(messageData);
                this.logScheduledMessage(scheduleId, 'delivered');
            } catch (error) {
                this.logScheduledMessage(scheduleId, 'failed', error.message);
            }
        }, delay);

        return {
            messageId: scheduleId,
            status: 'scheduled',
            platform: this.platform,
            scheduledFor: schedule_time,
            metadata: {
                recipients: recipients,
                priority: priority
            }
        };
    }

    /**
     * Send email
     */
    async sendEmail(recipients, subject, body, attachments = []) {
        const emailConfig = this.config.email;

        const mailOptions = {
            from: emailConfig.defaults.from,
            to: recipients.join(', '),
            subject: subject || 'No Subject',
            text: body,
            html: this.formatEmailHtml(body),
            attachments: attachments.map(att => ({
                filename: att.name,
                path: att.path,
                contentType: att.type
            }))
        };

        const info = await this.client.sendMail(mailOptions);

        return {
            messageId: info.messageId,
            deliveryInfo: {
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response
            }
        };
    }

    /**
     * Format HTML for email
     */
    formatEmailHtml(text) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .content { max-width: 600px; margin: 0 auto; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="content">
                    ${text.replace(/\n/g, '<br>')}
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send SMS
     */
    async sendSMS(recipients, body) {
        const smsConfig = this.config.sms;

        const results = await Promise.all(
            recipients.map(async (to) => {
                const message = await this.client.messages.create({
                    body: body,
                    from: smsConfig.fromNumber,
                    to: to
                });

                return {
                    to: to,
                    sid: message.sid,
                    status: message.status,
                    errorCode: message.errorCode,
                    errorMessage: message.errorMessage
                };
            })
        );

        return {
            messageId: `sms_${Date.now()}`,
            deliveryInfo: {
                results: results,
                totalSent: results.filter(r => r.status === 'sent' || r.status === 'queued').length,
                totalFailed: results.filter(r => r.status === 'failed').length
            }
        };
    }

    /**
     * Send Slack message
     */
    async sendSlackMessage(recipients, body, attachments = []) {
        const slackConfig = this.config.slack;

        const results = await Promise.all(
            recipients.map(async (channel) => {
                const message = {
                    channel: channel,
                    text: body,
                    attachments: this.formatSlackAttachments(attachments)
                };

                const result = await this.client.chat.postMessage(message);

                return {
                    channel: channel,
                    ts: result.ts,
                    ok: result.ok,
                    error: result.error
                };
            })
        );

        return {
            messageId: `slack_${Date.now()}`,
            deliveryInfo: {
                results: results,
                totalSent: results.filter(r => r.ok).length,
                totalFailed: results.filter(r => !r.ok).length
            }
        };
    }

    /**
     * Format Slack attachments
     */
    formatSlackAttachments(attachments) {
        return attachments.map(att => ({
            title: att.name,
            text: `File: ${att.path}`,
            color: '#36a64f'
        }));
    }

    /**
     * Send Discord message
     */
    async sendDiscordMessage(recipients, body, attachments = []) {
        const results = await Promise.all(
            recipients.map(async (channelId) => {
                try {
                    const channel = await this.client.channels.fetch(channelId);

                    const messageOptions = {
                        content: body.substring(0, 2000) // Discord character limit
                    };

                    // Handle file attachments if any
                    if (attachments.length > 0) {
                        // For Discord, files need to be read and attached
                        // This is a simplified version
                        messageOptions.files = attachments.map(att => att.path);
                    }

                    const message = await channel.send(messageOptions);

                    return {
                        channelId: channelId,
                        messageId: message.id,
                        success: true
                    };
                } catch (error) {
                    return {
                        channelId: channelId,
                        success: false,
                        error: error.message
                    };
                }
            })
        );

        return {
            messageId: `discord_${Date.now()}`,
            deliveryInfo: {
                results: results,
                totalSent: results.filter(r => r.success).length,
                totalFailed: results.filter(r => !r.success).length
            }
        };
    }

    /**
     * Send Microsoft Teams message
     */
    async sendTeamsMessage(recipients, body, attachments = []) {
        const teamsConfig = this.config.teams;

        if (!teamsConfig.webhookUrl) {
            throw new Error('Teams webhook URL not configured');
        }

        const message = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "summary": "System Message",
            "sections": [{
                "activityTitle": "System Notification",
                "activitySubtitle": new Date().toLocaleString(),
                "text": body
            }]
        };

        // Add file attachments as links
        if (attachments.length > 0) {
            message.sections[0].facts = attachments.map((att, index) => ({
                name: `Attachment ${index + 1}`,
                value: att.path
            }));
        }

        const response = await fetch(teamsConfig.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        return {
            messageId: `teams_${Date.now()}`,
            deliveryInfo: {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            }
        };
    }

    /**
     * Send WhatsApp message
     */
    async sendWhatsApp(recipients, body, attachments = []) {
        const whatsappConfig = this.config.whatsapp;

        const results = await Promise.all(
            recipients.map(async (to) => {
                // WhatsApp requires numbers in format: whatsapp:+1234567890
                const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

                const message = await this.client.messages.create({
                    body: body,
                    from: `whatsapp:${whatsappConfig.fromNumber}`,
                    to: formattedTo
                });

                return {
                    to: to,
                    sid: message.sid,
                    status: message.status,
                    errorCode: message.errorCode,
                    errorMessage: message.errorMessage
                };
            })
        );

        return {
            messageId: `whatsapp_${Date.now()}`,
            deliveryInfo: {
                results: results,
                totalSent: results.filter(r => r.status === 'sent' || r.status === 'queued').length,
                totalFailed: results.filter(r => r.status === 'failed').length
            }
        };
    }

    /**
     * Retry logic for failed messages
     */
    async retrySend(messageData, originalError, attempt = 1) {
        const retryConfig = this.config.retryConfig;

        if (attempt > retryConfig.maxRetries) {
            throw new Error(`Failed after ${retryConfig.maxRetries} attempts: ${originalError.message}`);
        }

        // Exponential backoff
        const delay = Math.min(
            retryConfig.initialDelay * Math.pow(2, attempt - 1),
            retryConfig.maxDelay
        );

        await new Promise(resolve => setTimeout(resolve, delay));

        console.log(`Retry attempt ${attempt} for ${this.platform} message`);

        try {
            return await this.sendImmediateMessage(messageData);
        } catch (error) {
            return await this.retrySend(messageData, error, attempt + 1);
        }
    }

    /**
     * Log scheduled messages
     */
    logScheduledMessage(scheduleId, status, error = null) {
        const logEntry = {
            scheduleId,
            platform: this.platform,
            status,
            timestamp: new Date().toISOString(),
            error
        };

        // Store in localStorage or send to logging service
        try {
            const logs = JSON.parse(localStorage.getItem('scheduled_messages_log') || '[]');
            logs.push(logEntry);
            localStorage.setItem('scheduled_messages_log', JSON.stringify(logs));
        } catch (e) {
            console.log('Scheduled message log:', logEntry);
        }
    }

    /**
     * Get message status
     */
    async getMessageStatus(messageId) {
        // Implementation depends on platform
        // For now, return a mock status
        return {
            messageId,
            platform: this.platform,
            status: 'delivered',
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        const requiredConfigs = {
            email: ['EMAIL_USER', 'EMAIL_PASS'],
            sms: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
            slack: ['SLACK_BOT_TOKEN'],
            discord: ['DISCORD_BOT_TOKEN'],
            teams: ['TEAMS_WEBHOOK_URL'],
            whatsapp: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'WHATSAPP_FROM_NUMBER']
        };

        const missing = [];
        const platformConfig = requiredConfigs[this.platform] || [];

        platformConfig.forEach(envVar => {
            if (!process.env[envVar]) {
                missing.push(envVar);
            }
        });

        if (missing.length > 0) {
            throw new Error(`Missing environment variables for ${this.platform}: ${missing.join(', ')}`);
        }

        return true;
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.platform === 'discord' && this.client) {
            await this.client.destroy();
        }
    }
}

// Export singleton instance for shared use
export const messageService = new Proxy({}, {
    get(target, platform) {
        const validPlatforms = ['email', 'sms', 'slack', 'discord', 'teams', 'whatsapp'];

        if (validPlatforms.includes(platform)) {
            return new MessageService(platform);
        }

        throw new Error(`Invalid platform: ${platform}`);
    }
});
