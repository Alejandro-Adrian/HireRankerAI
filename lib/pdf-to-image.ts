export async function convertPDFToImages(pdfBuffer: ArrayBuffer): Promise<string[]> {
  try {
    console.log('[v0] Converting PDF to images using pdfjs-dist')
    
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker source to avoid worker loading issues
    if (typeof window === 'undefined') {
      // Server-side: disable worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''
    }
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: new Uint8Array(pdfBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    })
    
    const pdfDocument = await loadingTask.promise
    
    console.log('[v0] PDF loaded, total pages:', pdfDocument.numPages)
    
    const imageDataUrls: string[] = []
    
    const { createCanvas } = await import('canvas')
    
    // Convert each page to image
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      console.log('[v0] Processing PDF page', pageNum)
      
      const page = await pdfDocument.getPage(pageNum)
      
      // Set scale for better OCR quality (higher = better quality but larger file)
      const scale = 2.0
      const viewport = page.getViewport({ scale })
      
      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height)
      const context = canvas.getContext('2d')
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context as any,
        viewport: viewport,
      }
      
      await page.render(renderContext).promise
      
      // Convert canvas to base64 image
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95)
      imageDataUrls.push(imageDataUrl)
      
      console.log('[v0] Page', pageNum, 'converted to image')
    }
    
    console.log('[v0] PDF conversion complete, generated', imageDataUrls.length, 'images')
    return imageDataUrls
    
  } catch (error) {
    console.error('[v0] PDF to image conversion error:', error)
    console.error('[v0] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function dataURLToBase64(dataURL: string): string {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const parts = dataURL.split(',')
  if (parts.length !== 2) {
    throw new Error('Invalid data URL format')
  }
  return parts[1]
}
