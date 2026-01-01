export interface DocImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export interface AIAnalysisResult {
  suggestedFilename: string;
  summary: string;
  documentType: string;
}

export type QualityOption = 'low' | 'medium' | 'high';

export interface PDFGenerationOptions {
  filename: string;
  images: DocImage[];
  quality: QualityOption;
}

// Augment window for jspdf
declare global {
  interface Window {
    jspdf: any;
  }
}