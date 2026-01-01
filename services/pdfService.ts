import { DocImage, QualityOption } from '../types';

const processImage = (base64: string, quality: QualityOption): Promise<{data: string, width: number, height: number}> => {
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

      const data = canvas.toDataURL('image/jpeg', jpgQuality);
      resolve({ data, width: targetWidth, height: targetHeight });
    };
    img.onerror = (err) => reject(err);
  });
};

export const generatePDFBlob = async (images: DocImage[], quality: QualityOption): Promise<Blob> => {
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

    // Process image based on selected quality
    const processed = await processImage(image.base64, quality);

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