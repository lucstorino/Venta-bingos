import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Downloads a DOM element as a high-resolution landscape PDF.
 * Uses html-to-image to bypass Tailwind v4 'oklch' CSS parsing bugs in html2canvas.
 */
export async function downloadTicketAsPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    // Generate high-resolution PNG using browser native SVG foreignObject rasterization
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Fit on A4 Landscape with 8mm margins
    const margin = 8;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = reject;
    });

    let renderW = maxW;
    let renderH = (img.height * renderW) / img.width;

    if (renderH > maxH) {
      renderH = maxH;
      renderW = (img.width * renderH) / img.height;
    }

    const xPos = (pageWidth - renderW) / 2;
    const yPos = (pageHeight - renderH) / 2;

    pdf.addImage(dataUrl, 'PNG', xPos, yPos, renderW, renderH, undefined, 'FAST');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating PDF with html-to-image:', err);
    // Fallback: direct window print
    window.print();
    return false;
  }
}

/**
 * Downloads multiple elements as a multi-page landscape PDF
 */
export async function downloadMultipleTicketsAsPdf(
  elementIds: string[],
  filename: string
): Promise<boolean> {
  if (elementIds.length === 0) return false;

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    for (let i = 0; i < elementIds.length; i++) {
      const elId = elementIds[i];
      const element = document.getElementById(elId);
      if (!element) continue;

      if (i > 0) {
        pdf.addPage('a4', 'landscape');
      }

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = reject;
      });

      let renderW = maxW;
      let renderH = (img.height * renderW) / img.width;

      if (renderH > maxH) {
        renderH = maxH;
        renderW = (img.width * renderH) / img.height;
      }

      const xPos = (pageWidth - renderW) / 2;
      const yPos = (pageHeight - renderH) / 2;

      pdf.addImage(dataUrl, 'PNG', xPos, yPos, renderW, renderH, undefined, 'FAST');
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating multi-page PDF:', err);
    window.print();
    return false;
  }
}
