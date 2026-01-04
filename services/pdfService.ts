import { DocImage, QualityOption, ScanMode, AIAnalysisResult } from '../types';

// --- Types for Internal Layout Planning ---

interface PageLayoutConfig {
  showHeader: boolean;
  showFooter: boolean;
  showPageNumber: boolean;
  headerData?: {
    title: string;
    subtitle: string;
    metadata: string[];
  };
}

interface PDFPageBlueprint {
  type: 'image_content' | 'data_summary';
  image?: DocImage; 
  config: PageLayoutConfig;
  pageIndex: number; 
  totalPages: number;
}

// --- Image Processing Logic (Pure Rendering) ---

const applyShadowRemoval = (ctx: CanvasRenderingContext2D, width: number, height: number, bgData: Uint8ClampedArray) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // UPDATED: Widen dynamic range to prevent crushing blacks or blowing out whites
  const blackPoint = 10; // Was 30
  const whitePoint = 245; // Was 220

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const bgR = bgData[i];
    const bgG = bgData[i + 1];
    const bgB = bgData[i + 2];

    const normR = (r / Math.max(bgR, 1)) * 255;
    const normG = (g / Math.max(bgG, 1)) * 255;
    const normB = (b / Math.max(bgB, 1)) * 255;

    const stretch = (val: number) => {
      if (val > whitePoint) return 255;
      if (val < blackPoint) return 0;
      return ((val - blackPoint) / (whitePoint - blackPoint)) * 255;
    };
    
    data[i] = stretch(normR);
    data[i + 1] = stretch(normG);
    data[i + 2] = stretch(normB);
  }
  ctx.putImageData(imageData, 0, 0);
};

const applyFilters = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: ScanMode) => {
  if (mode === 'original' || mode === 'enhanced') return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // UPDATED: Reduced contrast aggression to preserve detail in photos
  const contrast = 50; // Was 120 (too fried). 50 provides a nice pop without destroying detail.
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (mode === 'document') {
      gray = factor * (gray - 128) + 128;
      gray += 10; // Reduced brightness boost from 25 to 10
      gray = Math.max(0, Math.min(255, gray));
    }

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);
};

const processImage = (base64: string, quality: QualityOption, scanMode: ScanMode): Promise<{data: string, width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let targetWidth = img.width;
      let jpgQuality = 0.92;

      // UPDATED: Significant boost to resolution caps
      switch (quality) {
        case 'low': 
          targetWidth = Math.min(img.width, 1500); 
          jpgQuality = 0.7; 
          break;
        case 'medium': 
          targetWidth = Math.min(img.width, 3000); 
          jpgQuality = 0.85; 
          break;
        case 'high': 
          // Use original resolution (capped only for extreme outliers)
          targetWidth = Math.min(img.width, 8000); 
          jpgQuality = 1.0; 
          break;
      }

      const scale = targetWidth / img.width;
      const targetHeight = img.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) { reject(new Error("Could not get canvas context")); return; }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Critical for crisp text
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (scanMode === 'enhanced') {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = targetWidth;
        blurCanvas.height = targetHeight;
        const blurCtx = blurCanvas.getContext('2d');
        if (blurCtx && typeof blurCtx.filter !== 'undefined') {
          // Dynamic blur radius based on resolution
          const blurRadius = Math.max(20, Math.floor(targetWidth * 0.03));
          blurCtx.fillStyle = '#FFFFFF';
          blurCtx.fillRect(0, 0, targetWidth, targetHeight);
          blurCtx.filter = `blur(${blurRadius}px)`; 
          blurCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const bgData = blurCtx.getImageData(0, 0, targetWidth, targetHeight).data;
          applyShadowRemoval(ctx, targetWidth, targetHeight, bgData);
        } else {
          applyFilters(ctx, targetWidth, targetHeight, 'document');
        }
      } else {
        applyFilters(ctx, targetWidth, targetHeight, scanMode);
      }

      resolve({ data: canvas.toDataURL('image/jpeg', jpgQuality), width: targetWidth, height: targetHeight });
    };
    img.onerror = (err) => reject(err);
  });
};

const drawText = (doc: any, text: string, x: number, y: number, size: number = 10, align: 'left' | 'right' | 'center' = 'left', color: number = 0) => {
  doc.setFontSize(size);
  doc.setTextColor(color);
  doc.text(text, x, y, { align });
};

// --- Blueprint Creation (Business Logic Layer) ---

const createPDFBlueprint = (images: DocImage[], analysis?: AIAnalysisResult | null): PDFPageBlueprint[] => {
  const plan: PDFPageBlueprint[] = [];
  const totalContentPages = images.length;
  // If we have analysis data, we add a summary page, so total pages + 1
  const hasSummary = !!(analysis && analysis.extractedData.length > 0);
  const totalPages = hasSummary ? totalContentPages + 1 : totalContentPages;

  // 1. Plan Content Pages
  images.forEach((img, index) => {
    const isFirstPage = index === 0;
    
    // Rule: Show Header only on first page if analysis exists
    const showHeader = isFirstPage && !!analysis;
    
    // Rule: Show Footer (Document Type) on all pages EXCEPT first page (if header is present)
    const showFooter = analysis ? !showHeader : false;

    plan.push({
      type: 'image_content',
      image: img,
      pageIndex: index + 1,
      totalPages,
      config: {
        showHeader,
        showFooter,
        showPageNumber: true,
        headerData: showHeader && analysis ? {
          title: analysis.documentType.toUpperCase(),
          subtitle: analysis.summary,
          metadata: analysis.extractedData.map(d => d.label)
        } : undefined
      }
    });
  });

  // 2. Plan Summary Page
  if (hasSummary && analysis) {
    plan.push({
      type: 'data_summary',
      pageIndex: totalContentPages + 1,
      totalPages,
      config: {
        showHeader: false, // Summary page has its own internal header
        showFooter: false,
        showPageNumber: true,
      }
    });
  }

  return plan;
};

// --- Main Generator (Execution Layer) ---

export const generatePDFBlob = async (
  images: DocImage[], 
  quality: QualityOption, 
  scanMode: ScanMode,
  analysis?: AIAnalysisResult | null
): Promise<Blob> => {
  if (!window.jspdf) throw new Error("jsPDF library not loaded");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // 1. Create the plan (Declarative Step)
  const blueprint = createPDFBlueprint(images, analysis);

  // Set Metadata once if available
  if (analysis) {
    doc.setProperties({
      title: analysis.documentType,
      subject: analysis.summary,
      author: 'DocuFlow AI',
      keywords: analysis.extractedData.map(d => d.label).join(', ')
    });
  }

  // 2. Execute the plan (Imperative Step)
  for (let i = 0; i < blueprint.length; i++) {
    const page = blueprint[i];

    if (i > 0) doc.addPage();

    // -- RENDER: HEADER --
    let startY = 0;
    let availableHeight = pageHeight;

    if (page.config.showHeader && page.config.headerData) {
      const { title, subtitle } = page.config.headerData;
      
      doc.setFont('helvetica', 'bold');
      drawText(doc, title, margin, margin + 5, 12, 'left', 60);
      
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(subtitle, pageWidth - (margin * 2));
      const displaySummary = summaryLines.length > 2 ? summaryLines.slice(0, 2) : summaryLines;
      
      doc.setTextColor(100);
      doc.text(displaySummary, margin, margin + 12);
      
      doc.setDrawColor(200);
      doc.line(margin, margin + 20, pageWidth - margin, margin + 20);
      
      startY = margin + 25;
      availableHeight = pageHeight - startY - 15; 
    } else {
      availableHeight = pageHeight - 15;
    }

    // -- RENDER: CONTENT (Image or Data) --
    if (page.type === 'image_content' && page.image) {
      const processed = await processImage(page.image.base64, quality, scanMode);
      
      const imgRatio = processed.width / processed.height;
      let finalWidth = pageWidth;
      let finalHeight = finalWidth / imgRatio;

      if (finalHeight > availableHeight) {
        finalHeight = availableHeight;
        finalWidth = finalHeight * imgRatio;
      }

      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = startY + (availableHeight - finalHeight) / 2;

      // Pass 'FAST' compression for dev, or 'NONE' for max quality. 
      // Since we use JPEG data URL with quality 1.0 for high, passing it directly is best.
      doc.addImage(processed.data, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
    } 
    else if (page.type === 'data_summary' && analysis) {
      // Render the summary table
      doc.setFont('helvetica', 'bold');
      drawText(doc, "DIGITAL EXTRACTION RECORD", margin, margin + 10, 14, 'left', 60);
      
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

      let y = margin + 25;
      
      doc.setFont('helvetica', 'bold');
      drawText(doc, "SUMMARY", margin, y, 10, 'left', 60);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - (margin * 2));
      doc.setTextColor(80);
      doc.text(summaryLines, margin, y);
      y += (summaryLines.length * 5) + 12;

      doc.setFont('helvetica', 'bold');
      drawText(doc, "EXTRACTED DATA POINTS", margin, y, 10, 'left', 60);
      y += 8;

      const col1X = margin;
      const col2X = margin + 60;
      const rowHeight = 8;
      doc.setFontSize(9);
      
      analysis.extractedData.forEach((item, index) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin + 10;
        }
        if (index % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(margin, y - 5, pageWidth - (margin * 2), rowHeight, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80);
        doc.text(item.label, col1X + 2, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30);
        const valueLines = doc.splitTextToSize(item.value, pageWidth - col2X - margin - 2);
        doc.text(valueLines, col2X, y);
        y += Math.max(rowHeight, valueLines.length * 5);
      });
      
      // Special footer for summary page
      const footerY = pageHeight - 10;
      drawText(doc, "Generated by DocuFlow AI", margin, footerY, 8, 'left', 150);
      drawText(doc, new Date().toLocaleDateString(), pageWidth - margin, footerY, 8, 'right', 150);
    }

    // -- RENDER: FOOTERS --
    const footerY = pageHeight - 10;
    
    if (page.config.showPageNumber) {
      doc.setFont('helvetica', 'normal');
      drawText(doc, `${page.pageIndex}/${page.totalPages}`, pageWidth - margin, footerY, 8, 'right', 150);
    }

    if (page.config.showFooter && analysis) {
      doc.setFont('helvetica', 'normal');
      drawText(doc, analysis.documentType, margin, footerY, 8, 'left', 150);
    }
  }

  const pdfArrayBuffer = doc.output('arraybuffer');
  return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
};