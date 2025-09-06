import { GoogleGenAI, Type } from "@google/genai";
import type { DesignState, Slide } from '../types';

// The API key is injected by the environment.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}
// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey });

/**
 * Parses JSON from a string, accommodating markdown code blocks.
 * @param text The string potentially containing JSON.
 * @returns The parsed JSON object.
 */
const parseJsonFromMarkdown = (text: string): any => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse JSON from markdown:", e);
            throw new Error("Invalid JSON format in markdown");
        }
    }
    // Fallback for when there's no markdown block
    try {
        return JSON.parse(text);
    } catch(e) {
        console.error("Failed to parse raw text as JSON:", text, e);
        throw new Error("Invalid JSON format");
    }
};

export const generateLayoutFromPrompt = async (
  prompt: string,
  width: number,
  height: number
): Promise<DesignState | null> => {
    try {
        const fullPrompt = `
            Based on the following prompt, generate a banner design layout for a canvas of size ${width}x${height} pixels.
            Prompt: "${prompt}"

            The response must be a JSON object that strictly follows this TypeScript interface:
            \`\`\`typescript
            interface DesignState {
              canvas: {
                backgroundColor: string; // e.g., '#FFFFFF'
              };
              elements: Array<{
                id: string; // A unique ID like 'text-1', 'image-2'
                type: 'text' | 'image' | 'shape';
                x: number;
                y: number;
                width: number;
                height: number;
                rotation: number; // in degrees, e.g., 0
                // For text elements
                content?: string;
                fontSize?: number;
                fontFamily?: string; // e.g., 'Arial', 'Verdana'
                color?: string;
                fontWeight?: 'normal' | 'bold';
                textAlign?: 'left' | 'center' | 'right';
                // For image elements (use placeholder image)
                src?: string; // e.g., 'https://picsum.photos/400/300'
                // For shape elements
                shapeType?: 'rect' | 'ellipse';
                backgroundColor?: string;
              }>;
            }
            \`\`\`
            Rules:
            - The entire response must be a single JSON object inside a \`\`\`json markdown block.
            - Do not include any text or explanations outside the JSON block.
            - Ensure all coordinates and dimensions are within the canvas bounds (${width}x${height}).
            - For images, use a placeholder URL from picsum.photos with appropriate dimensions. Example: "https://picsum.photos/500/300".
            - Generate unique IDs for each element.
        `;

        // FIX: Use gemini-2.5-flash model and correct API for generating content with JSON output.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // FIX: Extract text directly from response.text property.
        const jsonText = response.text.trim();
        const parsedJson = parseJsonFromMarkdown(jsonText);

        if (parsedJson && parsedJson.canvas && Array.isArray(parsedJson.elements)) {
            const newDesign: DesignState = {
                canvas: {
                    ...parsedJson.canvas,
                    width,
                    height,
                },
                elements: parsedJson.elements,
            };
            return newDesign;
        }

        console.error("Generated JSON does not match expected DesignState structure:", parsedJson);
        return null;
    } catch (error) {
        console.error("Error generating layout from prompt:", error);
        return null;
    }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        // FIX: Use imagen-4.0-generate-001 model for image generation.
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
            },
        });

        // FIX: Correctly access the base64 image data from the response.
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
};


export const generateSlidesFromPrompt = async (prompt: string): Promise<Omit<Slide, 'id'>[]> => {
    const fullPrompt = `
        Based on the user's prompt, create a script for a short video (like TikTok/Reels). The output should be a JSON array of slide objects.
        User prompt: "${prompt}"

        The response must be a JSON array that strictly follows this TypeScript interface:
        \`\`\`typescript
        interface SlideText {
            content: string;
            fontSize: number; // e.g., 72
            color: string; // e.g., '#FFFFFF'
            fontWeight: 'normal' | 'bold';
            y: number; // Vertical position percentage (0-100), e.g., 50 for center
        }
        
        interface Slide {
            duration: number; // in seconds, e.g., 4
            backgroundColor: string; // e.g., '#000000'
            backgroundImage: null; // Always null for now
            text: SlideText;
        }
        \`\`\`
        Rules:
        - The entire response must be a JSON array inside a \`\`\`json markdown block.
        - Do not include any text or explanations outside of the JSON block.
        - Create a logical sequence of slides that tell a short story or convey a message based on the prompt.
        - Choose appropriate colors and font sizes for a vertical video format.
    `;
    
    // FIX: Define a response schema for structured JSON output.
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.NUMBER },
                backgroundColor: { type: Type.STRING },
                backgroundImage: { type: Type.NULL },
                text: {
                    type: Type.OBJECT,
                    properties: {
                        content: { type: Type.STRING },
                        fontSize: { type: Type.NUMBER },
                        color: { type: Type.STRING },
                        fontWeight: { type: Type.STRING },
                        y: { type: Type.NUMBER },
                    },
                    required: ['content', 'fontSize', 'color', 'fontWeight', 'y']
                },
            },
            required: ['duration', 'backgroundColor', 'backgroundImage', 'text']
        },
    };

    try {
        // FIX: Use gemini-2.5-flash model and correct API for generating content with a response schema.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        // FIX: Extract text directly from response.text property.
        const jsonText = response.text.trim();
        const slides = parseJsonFromMarkdown(jsonText);
        
        if (Array.isArray(slides) && slides.every(s => s.text && typeof s.duration === 'number')) {
            return slides;
        }
        throw new Error("Generated data is not a valid slide array.");
    } catch (error) {
        console.error("Error generating slides from prompt:", error);
        throw new Error("Failed to generate slides.");
    }
};
