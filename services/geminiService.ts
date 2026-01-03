import { GoogleGenAI, Type } from "@google/genai";
import { DocImage, AIAnalysisResult } from "../types";

export const analyzeDocuments = async (images: DocImage[]): Promise<AIAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare parts: image data only
  const parts: any[] = [];
  
  // Use all provided images for analysis
  const imagesToAnalyze = images;
  
  for (const img of imagesToAnalyze) {
    // Remove header from base64 string if present
    const base64Data = img.base64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: img.file.type || 'image/jpeg',
        data: base64Data
      }
    });
  }

  // Add a trigger text to the contents
  parts.push({ text: "Perform the data extraction task on the provided document images." });

  const systemInstruction = `
    You are an expert "Form Data Extractor" AI.
    
    1. Identify the document type (e.g., Medical Intake Form, Tax Invoice, Rental Agreement).
    2. Suggest a professional filename in snake_case.
    3. Write a brief summary.
    4. DATA EXTRACTION TASK:
       - Extract ALL visible form fields and their values.
       - Include both TYPED and HANDWRITTEN text.
       - Return them as a list of labels and values (e.g., Label: "Patient Name", Value: "John Doe").
       - If the document is a filled form, capture as many fields as possible (up to 20 key fields) to help the user digitize this record.
       - Clean up the values (e.g., fix obvious OCR errors in handwriting).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedFilename: { type: Type.STRING },
            summary: { type: Type.STRING },
            documentType: { type: Type.STRING },
            extractedData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                }
              }
            }
          },
          required: ["suggestedFilename", "summary", "documentType", "extractedData"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};