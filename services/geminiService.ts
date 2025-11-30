import { GoogleGenAI, Content } from "@google/genai";
import { SearchSource, GroundingChunk, SearchCategory, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CATEGORY_PROMPTS: Record<SearchCategory, string> = {
  'General': 'Provide a broad, general overview.',
  'Health': 'Strictly focus on healthcare, medical applications, clinical research, and health-tech.',
  'Emotion': 'Strictly focus on sentiment analysis, emotional AI, psychology, and human interactions.',
  'Business': 'Strictly focus on enterprise solutions, financial models, and market trends.',
  'Education': 'Strictly focus on ed-tech, learning analytics, and pedagogical research.',
  'Creative': 'Strictly focus on generative art, music, tools, and entertainment.'
};

export const searchLLMContext = async (
  query: string, 
  category: SearchCategory, 
  history: ChatMessage[]
): Promise<{ text: string; sources: SearchSource[] }> => {
  try {
    const categoryInstruction = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['General'];

    const systemInstruction = `
      You are an advanced AI Research Assistant.
      CONTEXT FILTER: ${categoryInstruction}
      
      For every query, you MUST provide a comprehensive answer using Google Search data.
      Structure your response into the following three distinct sections using Markdown Headers (##):

      ## 1. Applications & Models
      List and describe specific LLMs, tools, or applications.

      ## 2. Research & Technical Papers
      Identify relevant research papers, technical reports, or architectural concepts.

      ## 3. Ecosystem & News
      Provide broader context, recent news, or community discussions.

      Format the output in clean, readable Markdown.
    `;

    // Convert internal chat message format to Gemini Content format
    const contents: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: query }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No information found.";
    
    // Extract sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    const sources: SearchSource[] = groundingChunks
      .map((chunk): SearchSource | null => {
        if (chunk.web?.uri) {
          return {
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri,
          };
        }
        return null;
      })
      .filter((source): source is SearchSource => source !== null)
      .filter((v, i, a) => a.findIndex((t) => t.uri === v.uri) === i);

    return {
      text,
      sources,
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};