import * as pdfjsLib from 'pdfjs-dist';
import { Document } from '../types';

// Configure PDF.js worker - using a working CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export const parsePDF = async (file: File): Promise<Document> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = async function() {
      try {
        const arrayBuffer = this.result as ArrayBuffer;
        console.log('Starting PDF parsing...');
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });
        
        const pdf = await loadingTask.promise;
        
        console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
        
        let fullText = '';
        const totalPages = pdf.numPages;
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          console.log(`Processing page ${pageNum}/${totalPages}`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        }
        
        console.log('PDF parsing completed successfully');
        resolve({
          name: file.name,
          content: fullText.trim(),
          totalPages
        });
      } catch (error) {
        console.error('Error parsing PDF:', error);
        reject(new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    fileReader.onerror = () => {
      console.error('File reader error');
      reject(new Error('Failed to read file'));
    };
    
    fileReader.readAsArrayBuffer(file);
  });
};
