import type { ParentProps } from "solid-js";
import { usePdfContext } from "./PdfViewerRoot";
import { Show } from "solid-js";

export function PdfViewerLoading(props: ParentProps) {
  const context = usePdfContext()
  
  return (
    <Show when={context.isDocumentLoading()}>
      { props.children }
    </Show>
  )
}