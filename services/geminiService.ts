import { GoogleGenAI, Type } from "@google/genai";
import { DocImage, AIAnalysisResult } from "../types";

export const analyzeDocuments = async (images: DocImage[]): Promise<AIAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare parts: Interleave text markers with images to force the model
  // to recognize distinct pages and prevent it from skipping the middle/end of the batch.
  const parts: any[] = [];
  const totalPages = images.length;
  
  // Use all provided images for analysis
  images.forEach((img, index) => {
    // Add a structural marker before the image
    parts.push({
      text: `[DOCUMENT_PAGE_INDEX: ${index + 1}/${totalPages}]`
    });

    // Add the image data
    const base64Data = img.base64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: img.file.type || 'image/jpeg',
        data: base64Data
      }
    });
  });

  // Final trigger prompt
  parts.push({ 
    text: `
      Analyze this ${totalPages}-page document batch. 
      I have provided markers [DOCUMENT_PAGE_INDEX: X/${totalPages}] for every page. 
      
      CRITICAL INSTRUCTION:
      You MUST process every single page in order.
      Do not skip pages. Do not summarize until you have read the last page.
      If a page contains a form field, check box, or signature, it MUST be in the extraction list.
    ` 
  });

  const systemInstruction = `
    You are an expert "Form Data Extractor" AI engine specializing in batch processing.
    
    TASK:
    1. Scan the ${totalPages} provided images sequentially.
    2. **Inventory Phase**: First, identify what is on EACH page (e.g., "Page 1: Questionnaire", "Page 2: Continuation", "Page 16: Signature").
    3. **Extraction Phase**: Extract all filled-in data.
       - Handwritten text is HIGH PRIORITY.
       - Checkboxes (Checked/Yes/No) are HIGH PRIORITY.
       - Signatures and Dates on the final pages are CRITICAL.
    
    OUTPUT RULES:
    - **Document Type**: Name the entire set based on the first page or dominant form.
    - **Extracted Data**: Return a FLAT list. 
       - Label keys with their source page if ambiguous (e.g., "P1_Do_You_Smoke", "P8_Driver_License_Number").
       - Consolidate repetitive headers, but keep unique form answers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        // Increased thinking budget for larger batches
        thinkingConfig: { thinkingBudget: 4096 }, 
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