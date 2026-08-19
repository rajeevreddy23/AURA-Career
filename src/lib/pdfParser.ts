export async function extractTextFromPdf(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only supported in browser environments.');
  }

  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source for pdfjs-dist
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tokenizedText = await page.getTextContent();
      const pageText = tokenizedText.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Failed to parse PDF text. Please ensure the file is a valid readable PDF.');
  }
}

