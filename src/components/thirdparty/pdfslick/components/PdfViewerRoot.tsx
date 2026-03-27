import { usePDFSlick, type PDFException, type PDFSlickState } from "@pdfslick/solid";
import type { PDFSlickViewerProps } from "@pdfslick/solid/PDFSlickViewer";
import clsx from "clsx";
import type { Accessor, ComponentProps, ParentProps, Setter } from "solid-js";
import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import { createContext, createEffect, createSignal, splitProps, useContext } from "solid-js";

export type PdfViewerContextProps = {
  isDocumentLoaded: Accessor<boolean>,
  error: Accessor<PDFException | null>
  
  viewerRef: (node: HTMLElement) => void,
  thumbsRef: (node: HTMLElement) => void,
  
  pdfSlickStore: PDFSlickState,
  PDFSlickViewer: Component<PDFSlickViewerProps>
  
  isThumbsbarOpen: Accessor<boolean>,
  setThumbsbarOpen: Setter<boolean>
}

const Context = createContext<PdfViewerContextProps>();

export function usePdfContext() {
  const context = useContext(Context)
  if (!context)
    throw "Tried to access a PdfContext outside of a PdfViewer"
  
  return context
}

export function PdfViewerRoot(props: { pdfSource: Accessor<ArrayBuffer | undefined>, isSourceLoading: Accessor<boolean> } & ComponentProps<"div"> & ParentProps) {
  const contextValue = usePDFSlick(props.pdfSource)
  
  const [local, others] = splitProps(props, ["class"])
  
  const [isThumbsbarOpen, setThumbsbarOpen] = createSignal(false)
  const isDocumentLoaded = createMemo(() => contextValue.isDocumentLoaded() && !props.isSourceLoading() && props.pdfSource() != undefined)
  
  createEffect(() => {
    if (contextValue.error()) {
      console.error(contextValue.error())
    }
  })
  
  return (
    <div class={clsx("pdfSlick", local.class)} {...others}>
      <Context.Provider value={{ isThumbsbarOpen, setThumbsbarOpen, ...contextValue, isDocumentLoaded }}>
        { props.children }
      </Context.Provider>
    </div>
  )
}

