import { DocImage, QualityOption, ScanMode, AIAnalysisResult } from '../types';

const applyShadowRemoval = (ctx: CanvasRenderingContext2D, width: number, height: number, bgData: Uint8ClampedArray) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // 1. Get luminance of original pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // 2. Get luminance of background (blurred) pixel
    const bgR = bgData[i];
    const bgG = bgData[i+1];
    const bgB = bgData[i+2];
    const bgGray = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
    
    // 3. Division (Shading Correction)
    // Formula: Result = (Original / Background) * 255
    // This removes low-frequency illumination gradients (shadows)
    let val = 255;
    if (bgGray > 1) { 
         val = (gray / bgGray) * 255;
    }
    
    // 4. Contrast Stretch / Normalization
    // The division often makes the image very light. We need to restore black text.
    // We define a black point (e.g. 50) and white point (e.g. 230).
    const blackPoint = 50;
    const whitePoint = 230;
    
    if (val > whitePoint) val = 255;
    else if (val < blackPoint) val = 0;
    else {
         // Linear mapping between black and white points
         val = ((val - blackPoint) / (whitePoint - blackPoint)) * 255;
    }
    
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  
  ctx.putImageData(imageData, 0, 0);
};

const applyFilters = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: ScanMode) => {
  if (mode === 'original' || mode === 'enhanced') return; // Enhanced handled separately

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Contrast factor for 'document' mode
  const contrast = 120; 
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Grayscale (Luminance perception)
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (mode === 'document') {
      // Apply Contrast to separate text from background
      gray = factor * (gray - 128) + 128;
      
      // Simple Brightness Boost to clean up background noise
      gray += 25;

      // Clamp values
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

      // Define constraints based on quality selection
      switch (quality) {
        case 'low':
          // ~ 1000px width
          targetWidth = Math.min(img.width, 1000); 
          jpgQuality = 0.5;
          break;
        case 'medium':
          // ~ 1600px width
          targetWidth = Math.min(img.width, 1600); 
          jpgQuality = 0.75;
          break;
        case 'high':
          // ~ 2400px width
          targetWidth = Math.min(img.width, 2400); 
          jpgQuality = 0.92;
          break;
      }

      // Maintain aspect ratio
      const scale = targetWidth / img.width;
      const targetHeight = img.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw Main Image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (scanMode === 'enhanced') {
        // Create a temporary canvas to generate the background estimate (blurred image)
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = targetWidth;
        blurCanvas.height = targetHeight;
        const blurCtx = blurCanvas.getContext('2d');
        
        if (blurCtx) {
          // A blur radius of ~2-3% of the image width works well for shadow estimation
          const blurRadius = Math.max(15, Math.floor(targetWidth * 0.025));
          
          blurCtx.fillStyle = '#FFFFFF';
          blurCtx.fillRect(0, 0, targetWidth, targetHeight);
          blurCtx.filter = `grayscale(100%) blur(${blurRadius}px)`;
          blurCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          const bgData = blurCtx.getImageData(0, 0, targetWidth, targetHeight).data;
          applyShadowRemoval(ctx, targetWidth, targetHeight, bgData);
        } else {
          // Fallback if blur context fails
          applyFilters(ctx, targetWidth, targetHeight, 'document');
        }
      } else {
        // Apply Standard Filters
        applyFilters(ctx, targetWidth, targetHeight, scanMode);
      }

      const data = canvas.toDataURL('image/jpeg', jpgQuality);
      resolve({ data, width: targetWidth, height: targetHeight });
    };
    img.onerror = (err) => reject(err);
  });
};

export const generatePDFBlob = async (
  images: DocImage[], 
  quality: QualityOption, 
  scanMode: ScanMode,
  analysis?: AIAnalysisResult | null
): Promise<Blob> => {
  if (!window.jspdf) {
    throw new Error("jsPDF library not loaded");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    // Add new page for subsequent images
    if (i > 0) {
      doc.addPage();
    }

    const processed = await processImage(image.base64, quality, scanMode);

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    
    let contentY = 0;
    let contentHeight = pdfHeight;

    // Apply header/metadata only on the first page if analysis exists
    if (i === 0 && analysis) {
      // Set PDF Metadata
      doc.setProperties({
        title: analysis.documentType,
        subject: analysis.summary,
        author: 'DocuFlow AI',
        keywords: analysis.extractedData.map(d => d.label).join(', ')
      });

      // Visual Header
      const margin = 10;
      const headerHeight = 25;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(60); // Dark Gray
      doc.text(analysis.documentType.toUpperCase(), margin, margin + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100); // Lighter Gray
      
      // Split summary if too long
      const summaryLines = doc.splitTextToSize(analysis.summary, pdfWidth - (margin * 2));
      const displaySummary = summaryLines.length > 2 ? summaryLines.slice(0, 2) : summaryLines;
      
      doc.text(displaySummary, margin, margin + 11);
      
      doc.setDrawColor(200);
      doc.line(margin, margin + 18, pdfWidth - margin, margin + 18);

      contentY = headerHeight;
      contentHeight = pdfHeight - headerHeight;
    }

    const imgRatio = processed.width / processed.height;
    const pageRatio = pdfWidth / contentHeight;

    let finalWidth = pdfWidth;
    let finalHeight = contentHeight;
    let xOffset = 0;
    let yOffset = contentY;

    if (imgRatio > pageRatio) {
      finalHeight = pdfWidth / imgRatio;
      yOffset = contentY + (contentHeight - finalHeight) / 2;
    } else {
      finalWidth = contentHeight * imgRatio;
      xOffset = (pdfWidth - finalWidth) / 2;
    }
    
    const margin = 10;
    if (finalWidth > pdfWidth - margin * 2) {
        const scale = (pdfWidth - margin * 2) / finalWidth;
        finalWidth *= scale;
        finalHeight *= scale;
        xOffset = (pdfWidth - finalWidth) / 2;
        yOffset = contentY + (contentHeight - finalHeight) / 2;
    }
    
    doc.addImage(processed.data, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${i + 1}/${images.length}`, pdfWidth - 10, pdfHeight - 5, { align: 'right' });
  }

  const pdfArrayBuffer = doc.output('arraybuffer');
  return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
};