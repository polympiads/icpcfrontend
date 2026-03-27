import { createStore, reconcile } from "solid-js/store";
import { createEffect, createSignal, untrack, type Accessor } from "solid-js";
import { onCleanup } from "solid-js";
import { create, PDFSlick } from "@pdfslick/core";
import type {
  PDFSlickOptions,
  PDFSlickState,
  PDFException,
} from "@pdfslick/core";
import { StoreApi } from "zustand";
import PDFSlickViewer from "./PDFSlickViewer";
import { PDFSlickThumbnails } from "./PDFSlickThumbnails";

type TUsePDFSlick = (
  url: Accessor<string | URL | ArrayBuffer | undefined>,
  options?: PDFSlickOptions
) => {
  isDocumentLoaded: Accessor<boolean>;
  viewerRef: (node: HTMLElement) => void;
  thumbsRef: (node: HTMLElement) => void;
  pdfSlick: Accessor<PDFSlick | null>;
  pdfSlickStore: PDFSlickState;
  PDFSlickViewer: typeof PDFSlickViewer;
  PDFSlickThumbnails: typeof PDFSlickThumbnails;
  error: Accessor<PDFException | null>;
};

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;
function useStore<S extends StoreApi<unknown>>(api: S): ExtractState<S>;
function useStore<S extends StoreApi<unknown>, U>(
  api: S,
  selector: (state: ExtractState<S>) => U,
  equalityFn?: (a: U, b: U) => boolean
): U;

function useStore<TState extends object, StateSlice>(
  api: StoreApi<TState>,
  selector: (state: TState) => StateSlice = api.getState as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean
) {
  const initialValue = selector(api.getState()) as any;
  const [state, setState] = createStore(initialValue);

  const listener = (nextState: TState, previousState: TState) => {
    const prevStateSlice = selector(previousState);
    const nextStateSlice = selector(nextState);

    if (equalityFn !== undefined) {
      if (!equalityFn(prevStateSlice, nextStateSlice))
        setState(reconcile(nextStateSlice));
    } else {
      setState(reconcile(nextStateSlice));
    }
  };

  const unsubscribe = api.subscribe(listener);
  onCleanup(() => unsubscribe());
  return state;
}

export const usePDFSlick: TUsePDFSlick = (url, options) => {
  const [isDocumentLoaded, setIsDocumentLoaded] = createSignal(false);
  const [areContainersMounted, setContainersMounted] = createSignal(false);
  const [container, setContainer] = createSignal<HTMLElement | null>(null);
  const [thumbs, setThumbs] = createSignal<HTMLElement | null>(null);
  const [error, setError] = createSignal<PDFException | null>(null);

  const [pdfSlick, setPdfSlick] = createSignal<PDFSlick | null>(null);

  const zustandStore = create();
  const pdfSlickStore = useStore(zustandStore);

  const viewerRef = (node: HTMLElement) => {
    setContainer(node);
    setContainersMounted(true);
  };

  const thumbsRef = (node: HTMLElement) => {
    setThumbs(node);
  };

  createEffect(() => {
    if (!areContainersMounted()) return;
  
    if (!pdfSlick()) {
      const instance = new PDFSlick({
        container: container()!,
        thumbs: thumbs()!,
        store: zustandStore,
        options,
        onError: (err) => setError(err),
      });
  
      setPdfSlick(instance);
      zustandStore.setState({ pdfSlick: instance });
  
      onCleanup(() => {
        instance.document?.destroy()
        instance.viewer.cleanup()
      });
    }
  });
  createEffect(() => {
    const instance = pdfSlick();
    const urlValue = url();
    
    //console.log(instance, urlValue)
    
    if (!instance || !urlValue) return;
  
    setIsDocumentLoaded(false);
    setError(null);
  
    //console.log("Loading document")
    instance.loadDocument(urlValue, options).then(() => {
      //console.log("Done")
      setIsDocumentLoaded(true);
    });
  });

  return {
    isDocumentLoaded,
    viewerRef,
    thumbsRef,
    pdfSlick,
    pdfSlickStore,
    PDFSlickViewer,
    PDFSlickThumbnails,
    error,
  };
};
