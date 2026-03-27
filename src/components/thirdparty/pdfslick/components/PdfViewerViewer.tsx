import PDFSlickViewer from "@pdfslick/solid/PDFSlickViewer"
import { usePdfContext } from "./PdfViewerRoot"
import { Show } from "solid-js"

export function PdfViewerViewer() {
  const { pdfSlickStore: store, viewerRef, error, isDocumentLoaded } = usePdfContext()
  
  return (
    <>
      <PDFSlickViewer {...{ store, viewerRef }} />
    </>
  )
}