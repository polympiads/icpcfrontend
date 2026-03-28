import { createEffect } from "solid-js";
import { PdfViewer } from "../thirdparty/pdfslick/components/PdfViewer";
import { LoadingAnimation } from "../animations/LoadingAnimation";
import { BaseTransition } from "../base/BaseTransition";
import { usePdfContext } from "../thirdparty/pdfslick/components/PdfViewerRoot";
import { FaSolidWarning } from "solid-icons/fa";
import { AppButton } from "../AppButton";
import { RotateCw } from "lucide-solid";
import { createSignal } from "solid-js";
import { usePrintPdf } from "../../worker/hooks/usePrints";

export function PrintViewer(props: { printId: string }) {
  const pdf = usePrintPdf(props.printId);

  const [reactivePulse, setReactivePulse] = createSignal(false);
  const [statementValue, setStatementValue] = createSignal(pdf());
  createEffect(() => {
    reactivePulse();
    setStatementValue(pdf());
  });

  function tryReload() {
    setStatementValue();
    setReactivePulse((v) => !v);
  }

  return (
    <PdfViewer
      pdfSource={() => statementValue()}
      isSourceLoading={() => pdf.state == "pending"}
      class="relative w-full h-full inset-0 pdfSlick flex flex-col"
    >
      <PdfViewer.Toolbar>
        <PdfViewer.Toolbar.ThumbsbarButton />
        <PdfViewer.Toolbar.Splitter />
        <PdfViewer.Toolbar.ZoomSelector />
        <PdfViewer.Toolbar.Splitter />
        <PdfViewer.Toolbar.PageSelector />
      </PdfViewer.Toolbar>
      <div
        class="flex-1 relative h-full [&_.canvasWrapper]:shadow-md [&_.canvasWrapper]:outline [&_.canvasWrapper]:outline-black/10 [&_.viewerContainer]:z-0"
        aria-hidden={
          usePdfContext().error() != null || !usePdfContext().isDocumentLoaded()
        }
      >
        <PdfViewer.Thumbsbar />
        <PdfViewer.Viewer />
      </div>
      <BaseTransition.FadeIn visible={usePdfContext().error() != null}>
        <div class="absolute w-full h-full flex flex-col items-center justify-center z-20 bg-white/75 backdrop-blur-xs">
          <FaSolidWarning size="5rem" class="opacity-50" />
          <div class="text-lg font-medium mb-5 mx-5 text-center">
            Failed to load the print file.
          </div>
          <AppButton variant="white" onClick={tryReload}>
            <RotateCw size="1rem" />
            <div class="ml-1">Retry</div>
          </AppButton>
        </div>
      </BaseTransition.FadeIn>
      <BaseTransition.FadeIn visible={!usePdfContext().isDocumentLoaded()}>
        <div class="absolute w-full h-full flex items-center justify-center z-20 bg-white/75 backdrop-blur-xs">
          <LoadingAnimation.SpinningCircle size="5rem" />
        </div>
      </BaseTransition.FadeIn>
    </PdfViewer>
  );
}
