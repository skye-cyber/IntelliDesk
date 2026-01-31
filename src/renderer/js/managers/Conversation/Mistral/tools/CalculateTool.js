/**
 * Calculate Tool - Perform mathematical calculations safely
 */
import { ToolBase } from '../ToolBase';

export class CalculateTool extends ToolBase {
    constructor() {
        super('calculate', 'Perform mathematical calculations');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "calculate",
                description: "Perform mathematical calculations",
                parameters: {
                    type: "object",
                    properties: {
                        expression: {
                            type: "string",
                            description: "Mathematical expression to evaluate"
                        },
                        precision: {
                            type: "number",
                            description: "Decimal precision",
                            default: 2
                        }
                    },
                    required: ["expression"]
                }
            }
        };
    }

    async _execute({ expression, precision = 2 }, context) {
        try {
            // Safe evaluation of mathematical expressions
            const sanitizedExpression = expression.replace(/[^0-9+\-*/(). \t]/g, '');

            // Use Function constructor for safer evaluation
            const result = new Function('return ' + sanitizedExpression)();

            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('Invalid calculation result');
            }

            return {
                expression: expression,
                result: Number(result.toFixed(precision)),
                precision: precision,
                formatted: `${expression} = ${Number(result.toFixed(precision))}`
            };
        } catch (error) {
            throw new Error(`Could not calculate expression: ${error.message}`);
        }
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            expression: result.expression,
            result: result.result,
            precision: result.precision,
            formatted: result.formatted
        };
    }
}
