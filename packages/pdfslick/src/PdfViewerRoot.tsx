import clsx from "clsx";
import { ResponseException } from "pdfjs-dist";
import type {
  Accessor,
  Component,
  ComponentProps,
  ParentProps,
  Resource,
  Setter,
} from "solid-js";
import {
  createContext,
  createEffect,
  createSignal,
  splitProps,
  useContext,
} from "solid-js";
import { type PDFException, type PDFSlickState, usePDFSlick } from "./pdfslick";
import type { PDFSlickViewerProps } from "./pdfslick/PDFSlickViewer";

export type PdfViewerContextProps = {
  isDocumentLoading: Accessor<boolean>;
  error: Accessor<PDFException | null>;

  viewerRef: (node: HTMLDivElement) => void;
  thumbsRef: (node: HTMLElement) => void;

  pdfSlickStore: PDFSlickState;
  PDFSlickViewer: Component<PDFSlickViewerProps>;

  isThumbsbarOpen: Accessor<boolean>;
  setThumbsbarOpen: Setter<boolean>;
};

const Context = createContext<PdfViewerContextProps>();

export function usePdfContext() {
  const context = useContext(Context);
  if (!context) throw "Tried to access a PdfContext outside of a PdfViewer";

  return context;
}

export function PdfViewerRoot(
  props: {
    pdfSource: Resource<ArrayBuffer | undefined>;
  } & ComponentProps<"div"> &
    ParentProps,
) {
  const contextValue = usePDFSlick(props.pdfSource);

  const [local, others] = splitProps(props, ["class", "pdfSource"]);

  const [isThumbsbarOpen, setThumbsbarOpen] = createSignal(false);
  const isDocumentLoading = () =>
    (!contextValue.isDocumentLoaded() && !(props.pdfSource.state === "ready" && props.pdfSource() === undefined)) ||
    props.pdfSource.state === "pending" ||
    props.pdfSource.state === "refreshing";
  const error = () => {
    if (isDocumentLoading()) return null;
    if (contextValue.error()) return contextValue.error();
    if (props.pdfSource.state === "errored")
      return new ResponseException("failed to load the pdf", "", "");
    return null;
  };
  createEffect(() => {
    if (contextValue.error()) {
      console.error(contextValue.error());
    }
  });

  return (
    <div class={clsx("pdfSlick", local.class)} {...others}>
      <Context.Provider
        value={{
          isThumbsbarOpen,
          setThumbsbarOpen,
          ...contextValue,
          error,
          isDocumentLoading: isDocumentLoading,
        }}
      >
        {props.children}
      </Context.Provider>
    </div>
  );
}
