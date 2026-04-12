import type { ParentProps } from "solid-js";
import { Show } from "solid-js";
import { usePdfContext } from "./PdfViewerRoot";

export function PdfViewerLoading(props: ParentProps) {
  const context = usePdfContext();

  return <Show when={context.isDocumentLoading()}>{props.children}</Show>;
}
