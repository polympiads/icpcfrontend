import type { ParentProps } from "solid-js";
import { usePdfContext } from "./PdfViewerRoot";
import { VsAdd, VsChevronDown, VsChevronUp, VsDesktopDownload, VsLayoutSidebarLeft, VsLayoutSidebarLeftOff, VsRemove } from "solid-icons/vs";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { createSignal, onCleanup } from "solid-js";
import { createEffect } from "solid-js";

function _PdfViewerToolbar(props: ParentProps) {
  return (
      <div
        class={`w-full h-8 flex flex-row items-center bg-slate-50 border-b border-b-slate-300 shadow-xs text-xs select-none sticky top-0 backdrop-blur-sm z-10 overflow-x-auto`}
      >
        { props.children }
      </div>
  )
}

function ThumbsbarButton() {
  const {setThumbsbarOpen, isThumbsbarOpen } = usePdfContext()
  
  return (
      <button
        type="button"
        class={`enabled:hover:bg-slate-200 enabled:hover:text-black text-slate-500 disabled:text-slate-300 p-1 rounded-xs transition-all group relative focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent`}
        onClick={() => setThumbsbarOpen(!isThumbsbarOpen())}
      >
        {isThumbsbarOpen() ? (
          <VsLayoutSidebarLeftOff class="h-4 w-4" />
        ) : (
          <VsLayoutSidebarLeft class="h-4 w-4" />
        )}
      </button>
  )
}

const presets = new Map([
  ["auto", "Auto"],
  ["page-actual", "Actual Size"],
  ["page-fit", "Page Fit"],
  ["page-width", "Page Width"],
]);

const zoomVals = new Map([
  [0.5, "50%"],
  [0.75, "75%"],
  [1, "100%"],
  [1.25, "125%"],
  [1.5, "150%"],
  [2, "200%"],
]);

export function ZoomSelector() {
  const { pdfSlickStore: store } = usePdfContext()
  
  return (
      <div class="flex items-center space-x-1 shrink-0">
        <button
          type="button"
          disabled={!store.pdfSlick || store.scale <= 0.25}
          class="enabled:hover:bg-slate-200 enabled:hover:text-black text-slate-500 disabled:text-slate-300 p-1 rounded-xs transition-all group relative focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent"
          onClick={() => store.pdfSlick?.viewer?.decreaseScale()}
        >
          <VsRemove class="h-4 w-4 fill-current" />
        </button>
  
        <DropdownMenu modal={false}>
          <DropdownMenu.Trigger
            class="flex w-32 text-left items-center bg-slate-200/70 hover:bg-slate-200 py-1 rounded-xs focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <span class="sr-only">Open zoom options</span>
            <div class="flex px-1 w-full">
              <span
                class={`flex-1 px-1 ${
                  store.pdfSlick ? "opacity-100" : "opacity-0"
                }`}
              >
                {store.scaleValue && presets.has(store.scaleValue)
                  ? presets.get(store.scaleValue)
                  : `${~~(store.scale * 100)}%`}
              </span>
  
              <div class="w-4 h-4">
                <VsChevronDown class="w-4 h-4" />
              </div>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              class="absolute w-32 max-w-[142px] right-0 left-0 z-30 mt-1 origin-top-right divide-y divide-slate-200 rounded-sm text-left bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden animate-content-hide ui-expanded:animate-content-show"
              role="menu"
              aria-orientation="vertical"
              tabindex="-1"
            >
              <div class="py-1">
                {Array.from(presets.entries()).map(([value, label]) => (
                  <DropdownMenu.Item
                    onSelect={() => {
                      store.pdfSlick!.currentScaleValue = value;
                    }}
                    class={`cursor-pointer block w-full text-left px-2 py-1.5 text-xs hover:bg-slate-100 hover:text-slate-900 ui-highlighted:bg-slate-100 ui-highlighted:text-slate-900 ui-not-highlighted:text-slate-700`}
                  >
                    {label}
                  </DropdownMenu.Item>
                ))}
              </div>
  
              <div class="py-1">
                {Array.from(zoomVals.entries()).map(([value, label]) => (
                  <DropdownMenu.Item
                    onSelect={() => {
                      store.pdfSlick!.currentScale = value;
                    }}
                    class={`cursor-pointer block w-full text-left px-2 py-1.5 text-xs hover:bg-slate-100 hover:text-slate-900 ui-highlighted:bg-slate-100 ui-highlighted:text-slate-900 ui-not-highlighted:text-slate-700`}
                  >
                    {label}
                  </DropdownMenu.Item>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu>
  
        <button
          type="button"
          disabled={!store.pdfSlick || store.scale >= 5}
          class="enabled:hover:bg-slate-200 enabled:hover:text-black text-slate-500 disabled:text-slate-300 p-1 rounded-xs transition-all group relative focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent"
          onClick={() => store.pdfSlick?.viewer?.increaseScale()}
        >
          <VsAdd class="h-4 w-4 fill-current" />
        </button>
      </div>
  )
}

export function PageSelector() {
  let pageNumberRef!: HTMLInputElement;
  
  const { pdfSlickStore: store } = usePdfContext()
  const [wantedPageNumber, setWantedPageNumber] = createSignal<number | string>(
    1,
  );
  
  const updatePageNumber = ({ pageNumber }: any) =>
    setWantedPageNumber(pageNumber);

  createEffect(() => {
    if (store.pdfSlick) {
      store.pdfSlick?.on("pagechanging", updatePageNumber);
    }
  });

  onCleanup(() => {
    store.pdfSlick?.off("pagechanging", updatePageNumber);
  });
  
  return (
    <>
      <button
        type="button"
        disabled={store.pageNumber <= 1}
        class="shrink-0 enabled:hover:bg-slate-200 enabled:hover:text-black text-slate-500 disabled:text-slate-300 p-1 rounded-xs transition-all group relative focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent"
        onClick={() => store.pdfSlick?.viewer?.previousPage()}
      >
        <VsChevronUp class="h-4 w-4" />
      </button>

      <button
        type="button"
        disabled={!store.pdfSlick || store.pageNumber >= store.numPages}
        class="shrink-0 enabled:hover:bg-slate-200 enabled:hover:text-black text-slate-500 disabled:text-slate-300 p-1 rounded-xs transition-all group relative focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent"
        onClick={() => store.pdfSlick?.viewer?.nextPage()}
      >
        <VsChevronDown class="h-4 w-4" />
      </button>

      <div class="shrink-0 flex items-center text-center space-x-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newPageNumber = parseInt(wantedPageNumber() + "");
            if (
              Number.isInteger(newPageNumber) &&
              newPageNumber > 0 &&
              newPageNumber <= store.numPages
            ) {
              store.pdfSlick?.linkService.goToPage(newPageNumber);
            } else {
              setWantedPageNumber(store.pageNumber);
            }
          }}
        >
          <input
            ref={pageNumberRef}
            type="text"
            value={wantedPageNumber()}
            class="block w-12 text-right rounded-xs border border-slate-300 focus:shadow-sm focus:border-blue-400 focus:ring-0 outline-hidden text-xs p-1 px-1.5 placeholder:text-gray-300 focus:placeholder:text-gray-400 placeholder:italic"
            onFocus={() => pageNumberRef!.select()}
            onChange={(e) => {
              setWantedPageNumber(e.currentTarget.value);
            }}
            onKeyDown={(e) => {
              switch (e.key) {
                case "Down":
                case "ArrowDown":
                  store.pdfSlick?.gotoPage(
                    Math.max(1, (store.pageNumber ?? 0) - 1),
                  );
                  break;
                case "Up":
                case "ArrowUp":
                  store.pdfSlick?.gotoPage(
                    Math.min(
                      store.numPages ?? 0,
                      (store.pageNumber ?? 0) + 1,
                    ),
                  );
                  break;
                default:
                  return;
              }
            }}
          />
        </form>

        <span class="text-nowrap"> of {store.numPages}</span>
      </div>
    </>
  )
}

export function DownloadButton() {
  const { pdfSlickStore: store } = usePdfContext()

  return (
    <button
      type="button"
      class="enabled:hover:bg-slate-200 enabled:hover:text-black text-slate-500 disabled:text-slate-300 p-1 rounded-xs transition-all group relative focus:border-blue-400 focus:ring-0 focus:shadow-sm outline-hidden border border-transparent"
      onClick={() => store.pdfSlick?.downloadOrSave()}
    >
      <VsDesktopDownload class="w-4 h-4" />
    </button>
  )
}

function Splitter() {
  return (
    <>
      <div class="after:content-[''] after:w-px after:block after:h-4 after:bg-slate-300" />
    </>
  )
}

export const PdfViewerToolbar = Object.assign(_PdfViewerToolbar, {
  ThumbsbarButton: ThumbsbarButton,
  ZoomSelector: ZoomSelector,
  PageSelector: PageSelector,
  Splitter: Splitter,
  DownloadButton: DownloadButton
})