import { usePdfContext } from "./PdfViewerRoot";
import PDFSlickViewer from "./pdfslick/PDFSlickViewer";

export function PdfViewerViewer() {
  const { pdfSlickStore: store, viewerRef } = usePdfContext();

  return <PDFSlickViewer {...{ store, viewerRef }} />;
}
