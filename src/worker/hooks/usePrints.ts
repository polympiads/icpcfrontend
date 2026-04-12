import { createMemo, createResource } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { printDictsEquals, printEquals } from "../types/data/Print";
import { headerFromSession, useAuth } from "../context/AuthContext";
import { useWorkerContext } from "../context/WorkerContext";

export function usePrints() {
	const feed = useFeed();

	return createMemo(
		() => {
			return feed().prints;
		},
		undefined,
		{
			equals: printDictsEquals,
		},
	);
}
export function usePrint(printId: string) {
	const feed = useFeed();

	return createMemo(
		() => {
			return feed().prints[printId];
		},
		undefined,
		{
			equals: printEquals,
		},
	);
}

export function usePrintPdf(printId: string) {
	const print = usePrint(printId);
	const { apiEndpoint } = useWorkerContext();
	const auth = useAuth();

	const [printBuffer] = createResource(
		() => {
			return { print: print(), session: auth.session() };
		},
		async ({ print, session }) => {
			if (print.pdf_href === undefined) {
				return undefined;
			}

			const response = await fetch(apiEndpoint(print.pdf_href), {
				headers: headerFromSession(session),
			});
			const blob = (await response.blob()).arrayBuffer();

			return blob;
		},
	);

	return printBuffer;
}
