import { createResizeObserver } from "@solid-primitives/resize-observer";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { createEffect, createSignal, onMount } from "solid-js";
import { usePdfContext } from "./PdfViewerRoot";
import { type PDFSlickState, PDFSlickThumbnails } from "./pdfslick";

export function PdfViewerThumbsbar() {
  const { pdfSlickStore: store, isThumbsbarOpen, thumbsRef } = usePdfContext();

  let containerRef!: HTMLDivElement;
  let resizerRef!: HTMLDivElement;
  const [isResizing, setIsResizing] = createSignal(false);
  const [width, setWidth] = createSignal(190);

  createEffect(() => {
    let newWidth = 0;

    const dragResize = drag<HTMLDivElement, unknown>()
      .on("start", (_) => {
        newWidth = containerRef.clientWidth;
        setIsResizing(true);
      })
      .on("drag", (e) => {
        newWidth += e.dx;
        const width = Math.min(620, Math.max(233, newWidth));
        setWidth(width);
      })
      .on("end", (_) => {
        setIsResizing(false);
      });

    select(resizerRef).call(dragResize);
  });

  return (
    <>
      <div
        ref={containerRef}
        class={`h-full flex relative bg-white border-r border-gray-300  z-10 shadow-xl shadow-black/20`}
        classList={{
          "transition-all": !isResizing(),
          visible: isThumbsbarOpen(),
          "invisible border-r-0 overflow-hidden": !isThumbsbarOpen(),
        }}
        style={{
          width: `${isThumbsbarOpen() ? width() : 0}px`,
        }}
      >
        {/*<ButtonsBar {...{ tab, setTab, store, isThumbsbarOpen }} />*/}

        <div
          class={`flex-1 relative`}
          classList={{
            "translate-x-0 visible opacity-100": isThumbsbarOpen(),
            "-translate-x-full invisible opacity-0": !isThumbsbarOpen(),
          }}
        >
          <Thumbnails show={true} {...{ thumbsRef, store }} />
          {/*<Outline show={tab() === "outline"} {...{ store }} />*/}
          {/*<Attachments show={tab() === "attachments"} {...{ store }} />*/}
        </div>
      </div>
      <div ref={resizerRef} class="hover:cursor-col-resize relative w-0">
        {isThumbsbarOpen() && (
          <div
            class={`absolute -left-px top-0 h-full z-10 w-1 transition-all duration-150 ease-in hover:delay-150 hover:duration-150 ${
              isResizing() ? "bg-blue-400" : "bg-transparent hover:bg-blue-400"
            }`}
          />
        )}
      </div>
    </>
  );
}

type ThumbnailsProps = {
  store: PDFSlickState;
  thumbsRef: (instance: HTMLElement) => void;
  show: boolean;
};

function Thumbnails(props: ThumbnailsProps) {
  let ref!: HTMLDivElement;
  const [width, setWidth] = createSignal(200);

  const cols = () => Math.round(width() / 200);

  onMount(() => {
    createResizeObserver(ref, ({ width, height: _ }, el) => {
      if (el === ref) {
        setWidth(width);
      }
    });
  });

  return (
    <div
      class="overflow-auto absolute inset-0"
      classList={{ invisible: !props.show }}
      ref={ref}
    >
      <div class="px-2 relative h-full">
        <PDFSlickThumbnails
          {...{ thumbsRef: props.thumbsRef, store: props.store }}
          class="grid gap-2 mx-auto pb-4"
          classList={{
            "grid-cols-1": cols() === 1,
            "grid-cols-2": cols() === 2,
            "grid-cols-3": cols() === 3,
            "grid-cols-4": cols() > 3,
          }}
        >
          {({ pageNumber, width, height, src, pageLabel, loaded }) => (
            <div class="box-border pt-4 h-full w-full inline-flex justify-center">
              <div>
                <div class="flex justify-center">
                  <button
                    type="button"
                    onClick={() => props.store.pdfSlick?.gotoPage(pageNumber)}
                    class="p-0.5"
                    classList={{
                      "bg-blue-400 shadow-sm":
                        loaded && pageNumber === props.store.pageNumber,
                      "bg-transparent":
                        pageNumber !== props.store.pageNumber || !loaded,
                    }}
                  >
                    <div
                      class="box-border relative border"
                      classList={{
                        "border-slate-300 border-solid bg-slate-400/5 shadow-xs":
                          !loaded,
                        "border-slate-300 border-solid hover:border-blue-400 shadow-sm hover:shadow-sm":
                          loaded && pageNumber !== props.store.pageNumber,
                        "border-transparent border-solid shadow-md":
                          loaded && pageNumber === props.store.pageNumber,
                      }}
                      style={{
                        width: `${width + 2}px`,
                        height: `${height + 2}px`,
                      }}
                    >
                      {src && (
                        <img
                          src={src}
                          width={width}
                          height={height}
                          alt="Page Thumbnail"
                        />
                      )}
                    </div>
                  </button>
                </div>
                <div class="text-center text-xs text-slate-500 py-2">
                  {pageLabel ?? pageNumber}
                </div>
              </div>
            </div>
          )}
        </PDFSlickThumbnails>
      </div>
    </div>
  );
}
