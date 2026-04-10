import { PdfViewerError } from "./PdfViewerError";
import { PdfViewerLoading } from "./PdfViewerLoading";
import { PdfViewerRoot } from "./PdfViewerRoot";
import { PdfViewerThumbsbar } from "./PdfViewerThumbsbar";
import { PdfViewerToolbar } from "./PdfViewerToolbar";
import { PdfViewerViewer } from "./PdfViewerViewer";

export const PDFViewer = Object.assign(PdfViewerRoot, {
  Toolbar: PdfViewerToolbar,
  Thumbsbar: PdfViewerThumbsbar,
  Viewer: PdfViewerViewer,
  Loading: PdfViewerLoading,
  Error: PdfViewerError
})