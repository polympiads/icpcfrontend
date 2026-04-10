import type { ParentProps } from "solid-js";
import { usePdfContext } from "./PdfViewerRoot";
import { Show } from "solid-js";

export function PdfViewerError(props: ParentProps) {
  const context = usePdfContext()
  
  return (
    <Show when={context.error()}>
      { props.children }
    </Show>
  )
}