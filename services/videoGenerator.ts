import { GoogleGenAI } from "@google/genai";
import type { Slide } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Creates a detailed prompt from a series of slides.
 * @param slides - The array of slides.
 * @returns A string prompt for the video generation model.
 */
const createPromptFromSlides = (slides: Slide[]): string => {
    let prompt = "Create a short video for social media (like TikTok or Reels) with the following scenes:\n\n";
    slides.forEach((slide, index) => {
        prompt += `Scene ${index + 1} (duration: ${slide.duration} seconds):\n`;
        if (slide.backgroundImage) {
            // NOTE: The current 'veo' model API in guidelines takes one image for the whole video.
            // This is a simplified representation where we mention a background concept.
            // For a real app, you might use the first slide's image as the main input.
            prompt += `- Scene visual: A scene inspired by an image. The main text should be laid over it.\n`;
        } else {
            prompt += `- Scene visual: A simple, clean background with color ${slide.backgroundColor}.\n`;
        }
        prompt += `- Text on screen: "${slide.text.content}". Make sure the text is large, centered, and easy to read.\n`;
        prompt += `\n`;
    });
    prompt += "Transitions between scenes should be smooth and modern. The overall tone should be engaging and dynamic.";
    return prompt;
};

/**
 * Generates a video from a series of slides.
 * This is a simplified example. The actual implementation may require more complex
 * state management for the long-running operation.
 * @param slides - The slides to generate the video from.
 * @returns The URL of the generated video.
 */
export const generateVideo = async (slides: Slide[]): Promise<string> => {
    if (slides.length === 0) {
        throw new Error("Cannot generate video from empty slides.");
    }
    
    const prompt = createPromptFromSlides(slides);
    
    try {
        console.log("Starting video generation with prompt:", prompt);
        
        // VEO API for video generation. This is a long-running operation.
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });

        // Polling for completion
        while (!operation.done) {
            console.log("Video generation in progress... waiting 10 seconds.");
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        console.log("Video generation finished. Download link:", downloadLink);
        
        // The API key must be appended to the download URI for access.
        return `${downloadLink}&key=${apiKey}`;

    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to generate video.");
    }
};
