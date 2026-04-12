import { useStatement } from "./worker/hooks/useProblems";
import { PDFViewer } from "../packages/pdfslick/src";
import { LoadingAnimation } from "./LoadingAnimation";
import { BsExclamationCircle } from "solid-icons/bs";
import { Button } from "@kobalte/core/button";
import { RotateCw } from "lucide-solid";
import type { Accessor } from "solid-js";

export function ProblemViewer(props: { problemId: Accessor<string> }) {
	const [statement, statementActions] = useStatement(props.problemId);

	return (
		<PDFViewer
			pdfSource={statement}
			class="relative w-full h-full inset-0 pdfSlick flex flex-col"
		>
			<PDFViewer.Toolbar>
				<PDFViewer.Toolbar.ThumbsbarButton />
				<PDFViewer.Toolbar.Splitter />
				<PDFViewer.Toolbar.ZoomSelector />
				<PDFViewer.Toolbar.Splitter />
				<PDFViewer.Toolbar.PageSelector />
			</PDFViewer.Toolbar>
			<div class="flex-1 relative h-full [&_.canvasWrapper]:shadow-md [&_.canvasWrapper]:outline [&_.canvasWrapper]:outline-black/10 [&_.viewerContainer]:z-0">
				<PDFViewer.Thumbsbar />
				<PDFViewer.Viewer />
			</div>
			<PDFViewer.Loading>
				<div class="absolute w-full h-full backdrop-blur-md flex flex-col justify-center items-center z-10">
					<LoadingAnimation.SpinningCircle size="4em" />
					<div class="text-2xl font-medium text-center">
						Waiting for problem...
					</div>
				</div>
			</PDFViewer.Loading>
			<PDFViewer.Error>
				<div class="absolute w-full h-full flex flex-col items-center justify-center z-10">
					<BsExclamationCircle size="3em" />
					<div class="text-xl font-medium mb-3"> Something went wrong. </div>
					<Button
						class="border border-black/10 p-2 rounded-md flex flex-row items-center hover:bg-gray-100"
						onClick={() => statementActions.refetch()}
					>
						<RotateCw size="1em" /> <div class="ml-1">Retry</div>
					</Button>
				</div>
			</PDFViewer.Error>
		</PDFViewer>
	);
}
