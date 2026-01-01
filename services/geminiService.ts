import { GoogleGenAI, Type } from "@google/genai";
import { DocImage, AIAnalysisResult } from "../types";

export const analyzeDocuments = async (images: DocImage[]): Promise<AIAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare parts: text prompt + image data
  const parts: any[] = [];
  
  // Add images (limit to first 4 to avoid hitting payload limits if user uploads many)
  const imagesToAnalyze = images.slice(0, 4);
  
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

  const prompt = `
    Analyze these document images. They are being compiled into a single PDF.
    
    1. Identify the document type (e.g., Invoice, Contract, Notes, Receipt).
    2. Suggest a professional filename in snake_case (e.g., medical_invoice_oct_2023). Do not include the file extension.
    3. Write a very brief (1-2 sentence) summary of what these documents contain.
    4. Extract 4-6 key data points relevant to this document type (e.g. "Total Amount", "Date", "Vendor Name", "Invoice ID", "Subject", "Signatories").
       Return them as a list of labels and values.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      },
      config: {
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