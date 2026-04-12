import type { ParentProps } from "solid-js";
import { Show } from "solid-js";
import { usePdfContext } from "./PdfViewerRoot";

export function PdfViewerError(props: ParentProps) {
	const context = usePdfContext();

	return <Show when={context.error()}>{props.children}</Show>;
}
