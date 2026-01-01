export interface DocImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export interface ExtractedDataPoint {
  label: string;
  value: string;
}

export interface AIAnalysisResult {
  suggestedFilename: string;
  summary: string;
  documentType: string;
  extractedData: ExtractedDataPoint[];
}

export type QualityOption = 'low' | 'medium' | 'high';
export type ScanMode = 'original' | 'grayscale' | 'document';

export interface PDFGenerationOptions {
  filename: string;
  images: DocImage[];
  quality: QualityOption;
  scanMode: ScanMode;
}

// Augment window for jspdf
declare global {
  interface Window {
    jspdf: any;
  }
}