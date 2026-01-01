import { DocImage, QualityOption, ScanMode } from '../types';

const applyFilters = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: ScanMode) => {
  if (mode === 'original') return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Contrast factor for 'document' mode
  // Formula: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  // We use a contrast value of around 100 for a good document pop
  const contrast = 100; 
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Grayscale (Luminance perception)
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (mode === 'document') {
      // Apply Contrast
      gray = factor * (gray - 128) + 128;
      
      // Simple Brightness Boost to clean up background
      gray += 20;

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
          // ~ 96 DPI equivalent - compact size
          targetWidth = Math.min(img.width, 800); 
          jpgQuality = 0.5;
          break;
        case 'medium':
          // ~ 150 DPI equivalent - balanced for email
          targetWidth = Math.min(img.width, 1600); 
          jpgQuality = 0.75;
          break;
        case 'high':
          // ~ 250-300 DPI equivalent - high quality print
          targetWidth = Math.min(img.width, 2500); 
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

      // Draw with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Apply Filter (Grayscale / High Contrast)
      applyFilters(ctx, targetWidth, targetHeight, scanMode);

      const data = canvas.toDataURL('image/jpeg', jpgQuality);
      resolve({ data, width: targetWidth, height: targetHeight });
    };
    img.onerror = (err) => reject(err);
  });
};

export const generatePDFBlob = async (images: DocImage[], quality: QualityOption, scanMode: ScanMode): Promise<Blob> => {
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

    // Process image based on selected quality and scan mode
    const processed = await processImage(image.base64, quality, scanMode);

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit page while maintaining aspect ratio
    const imgRatio = processed.width / processed.height;
    const pageRatio = pdfWidth / pdfHeight;

    let finalWidth = pdfWidth;
    let finalHeight = pdfHeight;
    let xOffset = 0;
    let yOffset = 0;

    if (imgRatio > pageRatio) {
      // Image is wider than page
      finalHeight = pdfWidth / imgRatio;
      yOffset = (pdfHeight - finalHeight) / 2;
    } else {
      // Image is taller than page
      finalWidth = pdfHeight * imgRatio;
      xOffset = (pdfWidth - finalWidth) / 2;
    }
    
    // Add margin if it fills the whole page too tightly
    const margin = 10;
    if (finalWidth > pdfWidth - margin * 2) {
        const scale = (pdfWidth - margin * 2) / finalWidth;
        finalWidth *= scale;
        finalHeight *= scale;
        xOffset = (pdfWidth - finalWidth) / 2;
        yOffset = (pdfHeight - finalHeight) / 2;
    }
    
    doc.addImage(processed.data, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
    
    // Add page number
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i + 1} of ${images.length}`, pdfWidth - 20, pdfHeight - 10, { align: 'right' });
  }

  return doc.output('blob');
};