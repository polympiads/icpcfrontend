import PDFSlickViewer from "./pdfslick/PDFSlickViewer"
import { usePdfContext } from "./PdfViewerRoot"

export function PdfViewerViewer() {
  const { pdfSlickStore: store, viewerRef } = usePdfContext()
  
  return (
    <PDFSlickViewer {...{ store, viewerRef }} />
  )
}