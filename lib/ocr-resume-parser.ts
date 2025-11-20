import { advancedOCRService, type ExtractedResumeData } from './advanced-ocr-service'
import { convertPDFToImages, dataURLToBase64 } from './pdf-to-image'

/**
 * OCR-based resume parser with PDF-to-image conversion
 */
export class OCRResumeParser {
  /**
   * Parse resume using OCR - converts PDFs to images first
   */
  async parseFromFile(file: File): Promise<ExtractedResumeData> {
    console.log('[v0] OCR Resume Parser: Starting to parse file:', file.name)
    console.log('[v0] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`)
    }

    const fileExtension = file.name.toLowerCase().split('.').pop() || ''
    
    if (file.type === 'application/pdf' || fileExtension === 'pdf') {
      console.log('[v0] PDF detected - converting to images for OCR')
      
      try {
        // Convert PDF to array buffer
        const arrayBuffer = await file.arrayBuffer()
        
        // Convert PDF pages to images
        const imageDataUrls = await convertPDFToImages(arrayBuffer)
        
        console.log('[v0] PDF converted to', imageDataUrls.length, 'images')
        
        // Process each page with OCR and combine results
        let combinedText = ''
        
        for (let i = 0; i < imageDataUrls.length; i++) {
          console.log('[v0] Processing page', i + 1, 'of', imageDataUrls.length)
          
          const base64 = dataURLToBase64(imageDataUrls[i])
          
          // Create a temporary "image" file from the PDF page
          const pageResult = await advancedOCRService.extractFromImageEnhanced(base64)
          
          // Append the text from this page
          combinedText += pageResult.rawText + '\n\n'
        }
        
        // Now extract information from the combined text
        console.log('[v0] Combined text from all pages, length:', combinedText.length)
        
        return advancedOCRService['extractInformationAdvanced'](combinedText)
        
      } catch (pdfError) {
        console.error('[v0] PDF conversion failed:', pdfError)
        throw new Error(`PDF processing failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}. Try converting your PDF to PNG/JPG format.`)
      }
    }
    
    return await advancedOCRService.extractFromFile(file)
  }
}

// Export singleton instance
export const ocrResumeParser = new OCRResumeParser()

export async function parseResumeWithOCR(file: File): Promise<ExtractedResumeData> {
  return await ocrResumeParser.parseFromFile(file)
}
