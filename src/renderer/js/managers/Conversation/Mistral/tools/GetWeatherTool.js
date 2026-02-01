/**
 * Get Weather Tool - Get current weather information for a location
 */
import { ToolBase } from '../ToolBase';
import axios from 'axios';

export class GetWeatherTool extends ToolBase {
    constructor() {
        super('get_weather', 'Get current weather information for a location');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "get_weather",
                description: "Get current weather information for a location",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "City name or coordinates (e.g., 'New York' or '40.7128,-74.0060')"
                        },
                        unit: {
                            type: "string",
                            enum: ["celsius", "fahrenheit"],
                            default: "celsius",
                            description: "Temperature unit"
                        },
                        include_forecast: {
                            type: "boolean",
                            default: false,
                            description: "Whether to include weather forecast"
                        }
                    },
                    required: ["location"]
                }
            }
        };
    }

    async _execute({ location, unit = "celsius", include_forecast = false }, context) {
        // Validate location
        if (!location || typeof location !== 'string' || location.trim().length === 0) {
            throw new Error('Location must be a non-empty string');
        }

        try {
            // Use appropriate weather API based on configuration
            let weatherData;
            if (this.config.weather_api_url) {
                // Use custom weather API
                weatherData = await this.fetchWeatherFromAPI(location, unit, include_forecast);
            } else {
                // Use mock data for development
                weatherData = this.generateMockWeatherData(location, unit, include_forecast);
            }

            return {
                location: location,
                unit: unit,
                current_weather: weatherData.current,
                forecast: weatherData.forecast,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Weather fetch failed: ${error.message}`);
        }
    }

    async fetchWeatherFromAPI(location, unit, includeForecast) {
        const apiUrl = this.config.weather_api_url;
        const apiKey = this.config.weather_api_key;

        const response = await axios.get(apiUrl, {
            params: {
                q: location,
                units: unit === 'celsius' ? 'metric' : 'imperial',
                appid: apiKey,
                include_forecast: includeForecast
            },
            timeout: this.config.timeout || 10000
        });

        if (response.data) {
            return {
                current: {
                    temperature: response.data.main?.temp,
                    feels_like: response.data.main?.feels_like,
                    humidity: response.data.main?.humidity,
                    pressure: response.data.main?.pressure,
                    wind_speed: response.data.wind?.speed,
                    wind_direction: response.data.wind?.deg,
                    weather_description: response.data.weather?.[0]?.description,
                    weather_icon: response.data.weather?.[0]?.icon,
                    visibility: response.data.visibility,
                    clouds: response.data.clouds?.all,
                    timestamp: new Date().toISOString()
                },
                forecast: includeForecast && response.data.forecast ? response.data.forecast : null
            };
        }

        return { current: null, forecast: null };
    }

    generateMockWeatherData(location, unit, includeForecast) {
        // Generate mock weather data for development
        const baseTemp = Math.floor(Math.random() * 30) + 5; // 5-35°C
        const temperature = unit === 'celsius' ? baseTemp : Math.round(baseTemp * 9/5 + 32);

        const weatherConditions = [
            'clear sky', 'few clouds', 'scattered clouds', 'broken clouds',
            'shower rain', 'rain', 'thunderstorm', 'snow', 'mist'
        ];

        const currentWeather = {
            temperature: temperature,
            feels_like: temperature - (unit === 'celsius' ? 2 : 5),
            humidity: Math.floor(Math.random() * 60) + 40,
            pressure: Math.floor(Math.random() * 20) + 1000,
            wind_speed: (Math.random() * 20).toFixed(1),
            wind_direction: Math.floor(Math.random() * 360),
            weather_description: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
            weather_icon: '01d', // Default icon
            visibility: Math.floor(Math.random() * 10000) + 1000,
            clouds: Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString()
        };

        let forecast = null;
        if (includeForecast) {
            forecast = [];
            for (let i = 1; i <= 5; i++) {
                const forecastTemp = unit === 'celsius' ? baseTemp + (i - 3) : Math.round((baseTemp + (i - 3)) * 9/5 + 32);
                forecast.push({
                    date: this.getFutureDate(i),
                    temperature: forecastTemp,
                    weather_description: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
                    humidity: Math.floor(Math.random() * 40) + 50
                });
            }
        }

        return { current: currentWeather, forecast: forecast };
    }

    getFutureDate(daysAhead) {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split('T')[0];
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            location: result.location,
            unit: result.unit,
            current_weather: result.current_weather,
            forecast: result.forecast,
            timestamp: result.timestamp
        };
    }
}
