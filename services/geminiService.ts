import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchSource, GroundingChunk, SearchCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CATEGORY_PROMPTS: Record<SearchCategory, string> = {
  'General': 'Provide a broad, general overview covering all aspects.',
  'Health': 'Strictly focus on healthcare, medical applications, clinical research papers, and health-tech. Prioritize medical accuracy.',
  'Emotion': 'Strictly focus on sentiment analysis, emotional AI (Affective Computing), psychology papers, and human interactions.',
  'Business': 'Strictly focus on enterprise solutions, financial models, business automation, and market ecosystem trends.',
  'Education': 'Strictly focus on educational technology, learning analytics, tutoring systems, and pedagogical research.',
  'Creative': 'Strictly focus on generative art, music, creative writing tools, and entertainment industry applications.'
};

export const searchLLMContext = async (query: string, category: SearchCategory = 'General'): Promise<SearchResult> => {
  try {
    const categoryInstruction = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['General'];

    const prompt = `
      You are an advanced AI Research Assistant. The user is searching for information related to: "${query}".
      
      CONTEXT FILTER: ${categoryInstruction}
      
      Your goal is to provide a comprehensive overview using Google Search data, specifically tailored to the "${category}" domain. 
      You MUST structure your response into the following three distinct sections using Markdown Headers (##):

      ## 1. ${category === 'General' ? 'Applications & Models' : `${category} Applications & Tools`}
      List and describe specific LLMs or AI applications relevant to ${category} in the context of the query.

      ## 2. Research & Technical Papers
      Identify relevant research papers, technical reports, or architectural concepts specifically within the ${category} field. Summarize key findings.

      ## 3. Ecosystem & News
      Provide broader context, recent news, or community discussions related to the query within the ${category} sector.

      Format the output in clean, readable Markdown. Use bullet points for lists.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    const text = response.text || "No information found.";
    
    // Extract sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    
    const sources: SearchSource[] = groundingChunks
      // Explicitly return SearchSource | null to match the filter predicate's requirement
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
      // Remove duplicates based on URI
      .filter((v, i, a) => a.findIndex((t) => t.uri === v.uri) === i);

    return {
      markdownText: text,
      sources: sources,
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};