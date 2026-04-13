import { Accordion } from "@kobalte/core/accordion";
import { Button } from "@kobalte/core/button";
import { RadioGroup } from "@kobalte/core/radio-group";
import clsx from "clsx";
import { Check, LoaderCircle, RotateCw } from "lucide-solid";
import { PDFViewer } from "pdfslick";
import { BiRegularPrinter } from "solid-icons/bi";
import { BsExclamationCircle } from "solid-icons/bs";
import { FaSolidUser, FaSolidWarning } from "solid-icons/fa";
import { VsWarning } from "solid-icons/vs";
import {
  type Accessor,
  type ComponentProps,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  type Setter,
  Switch,
} from "solid-js";
import { FloatingCopyButton } from "./CopyButtons";
import {
  API_ROOT,
  BASE_URL,
  PRINT_DONE_URL,
  PRINT_URL,
  PRINTS_URL,
} from "./constants";
import { AppEditor, useAppEditorContext } from "./Editor";
import { LoadingAnimation } from "./LoadingAnimation";
import PingPongScroller from "./PingPongScroller";
import { sortRecordValues } from "./utils";
import { useAuth } from "./worker/context/AuthContext";
import { useContest } from "./worker/hooks/useContest";
import { usePrint, usePrints } from "./worker/hooks/usePrints";
import { useAccount } from "./worker/hooks/useUsers";
import type { Print } from "./worker/types/data/Print";

async function postPrint(contest_id: string, code: string, session: string) {
  const url = new URL(API_ROOT + PRINTS_URL(contest_id), BASE_URL);

  const formData = new FormData();
  const codeBlob = new Blob([code], { type: "text/plain" });
  formData.append("file", codeBlob);

  return await fetch(url.toString(), {
    method: "POST",
    body: formData,
    headers: {
      "X-Session-Id": session,
    },
  });
}

async function getPrintCode(
  contest_id: string,
  print_id: string,
  session: string,
) {
  const url = new URL(
    API_ROOT + PRINT_URL(contest_id, print_id) + "download/code/",
    BASE_URL,
  );

  return await fetch(url.toString(), {
    headers: {
      "X-Session-Id": session,
    },
  }).then((response) => response.text());
}

async function markPrintAsDone(
  contest_id: string,
  print_id: string,
  session: string,
) {
  const url = new URL(
    API_ROOT + PRINT_DONE_URL(contest_id, print_id),
    BASE_URL,
  );

  return await fetch(url.toString(), {
    method: "POST",
    headers: {
      "X-Session-Id": session,
    },
  });
}

export function SubmitPrintButton(props: { disable: boolean }) {
  const contest = useContest();
  const { session } = useAuth();
  const { code } = useAppEditorContext();

  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    postPrint(contest()!.id, code(), session()!).then(() =>
      setSubmitting(false),
    );
  }

  return (
    <Button
      class="h-full rounded-none cursor-pointer flex flex-row justify-center items-center bg-sky-300 disabled:bg-sky-200 disabled:cursor-default duration-100 hover:bg-sky-400 shrink-0 disabled:*:opacity-75 p-2"
      disabled={isSumbitting() || session() === undefined || props.disable}
      onClick={onSubmit}
    >
      <div class="relative w-6 h-6 top-0">
        <div
          class="absolute duration-150 ease-out"
          classList={{
            "-top-0": !isSumbitting(),
            "-top-11": isSumbitting(),
          }}
        >
          <BiRegularPrinter size="1.5rem" class="scale-90" />
          <div class="h-5" />
          <LoaderCircle class="animate-spin scale-75" />
        </div>
      </div>
      <div>Print</div>
    </Button>
  );
}

type Status = "pending" | "compiling" | "ready" | "failure" | "error" | "done";

const bg_map: Record<Status, string> = {
  done: "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
  failure:
    "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
  error:
    "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
  ready:
    "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
  compiling:
    "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
  pending:
    "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
};

function PrintStatusIcon(props: { status: Status }) {
  return (
    <Switch>
      <Match when={props.status === "done"}>
        <Check class="stroke-gray-400" size="1.5rem" />
      </Match>
      <Match when={props.status === "compiling" || props.status === "ready"}>
        <BiRegularPrinter size="1.5rem" class="animate-pulse" />
      </Match>
      <Match when={props.status === "failure" || props.status === "error"}>
        <VsWarning class="stroke-red-500" size="1.5rem" />
      </Match>
      <Match when={props.status === "pending"}>
        <LoadingAnimation.ThreePulsingDots />
      </Match>
    </Switch>
  );
}

function PrintEntry(props: { index: number; print: Print }) {
  return (
    <div class="relative h-12 w-full group @container/submissionEntry rounded-md overflow-hidden">
      <div class="absolute w-full h-full z-0">
        <div class={clsx("w-full h-full", bg_map[props.print.status])} />
      </div>
      <div class="relative h-full flex flex-row *:not-last:mr-2 items-center bg-linear-to-r px-3 rounded-md py-1 duration-150 transition-all cursor-pointer border border-black/10 z-10">
        <div class="text-gray-400"> {`Print #${props.index}`} </div>

        {/* Space */}
        <div class="grow" />

        <div class="shrink-0 flex flex-row items-center">
          <PrintStatusIcon status={props.print.status} />
        </div>
      </div>
    </div>
  );
}

function PrintEntryWithCode(props: { print: Print; index: Accessor<number> }) {
  return (
    <Accordion.Item value={props.print.id}>
      <Accordion.Header class="relative z-10">
        <Accordion.Trigger class="w-full group">
          <PrintEntry index={props.index() + 1} print={props.print} />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content class="ui-closed:animate-slide-up">
        <PrintCodeView print={props.print} />
      </Accordion.Content>
    </Accordion.Item>
  );
}

function PrintCodeView(props: { print: Print }) {
  const contest = useContest();
  const { session } = useAuth();

  const resourceParams = () => ({ session: session(), contest: contest() });
  const [code] = createResource(resourceParams, async (params) => {
    if (!params.session || !params.contest)
      throw "Try to access session without session or contest providers";

    const response = await getPrintCode(
      params.contest.id,
      props.print.id,
      params.session,
    );

    return response;
  });
  createEffect(() => {
    if (code.error) {
      console.error(code.error);
    }
  });

  return (
    <div class="h-full relative -top-2 rounded-b-md overflow-hidden z-0 border-x border-b border-slate-200 bg-white">
      <div class="h-2" />
      <Switch>
        <Match when={code.state === "ready"}>
          <div class="relative w-full max-h-60 overflow-hidden">
            <AppEditor code={code()} readonly>
              <div class="absolute right-0 z-10 p-2 gap-2 flex flex-row-reverse">
                <FloatingCopyButton />
              </div>
              <div class="relative w-full z-0 max-h-60 overflow-auto">
                <AppEditor.Editor />
              </div>
            </AppEditor>
          </div>
        </Match>
        <Match
          when={
            code.state === "pending" ||
            code.state === "refreshing" ||
            code.state === "unresolved"
          }
        >
          <div class="w-full h-20 flex items-center justify-center">
            <LoadingAnimation.SpinningCircle size="3rem" />
          </div>
        </Match>
        <Match when={code.state === "errored"}>
          <div class="w-full h-20 flex items-center justify-center">
            <FaSolidWarning size="3rem" class="opacity-50" />
          </div>
        </Match>
      </Switch>
    </div>
  );
}

export function PrintEntries(
  props: ComponentProps<"div"> & {
    prints: Accessor<Record<string, Print>>;
  },
) {
  const sortedPrints = createMemo(() =>
    sortRecordValues(props.prints(), (v) => Number(v.id), "desc"),
  );
  //console.log(sortedSubmissions());

  const finalStyle = clsx(
    "relative h-full overflow-x-hidden *:not-last:mb-3 overflow-auto grow",
    props.class,
  );

  return (
    <div class={finalStyle}>
      <Switch>
        <Match when={sortedPrints().length === 0}>
          <div class="relative w-full h-full overflow-hidden">
            <div class="absolute w-full h-full flex items-center justify-center z-20 text-xl font-medium opacity-50">
              No prints yet.
            </div>
            <div class="w-full h-full max-h-60 absolute bg-linear-to-b from-transparent to-white z-10" />
            <div class="p-3 *:not-last:mb-3">
              <div class="h-12 w-full bg-slate-100 rounded-md" />
              <div class="h-12 w-full bg-slate-100 rounded-md" />
              <div class="h-12 w-full bg-slate-100 rounded-md" />
              <div class="h-12 w-full bg-slate-100 rounded-md" />
            </div>
          </div>
        </Match>
        <Match when={sortedPrints().length > 0}>
          <div class="p-3">
            <Accordion class={finalStyle} collapsible={true}>
              <For each={sortedPrints()}>
                {(item, index) => (
                  <PrintEntryWithCode
                    print={item}
                    index={() => sortedPrints().length - index()}
                  />
                )}
              </For>
            </Accordion>
          </div>
        </Match>
      </Switch>
    </div>
  );
}

function AccountInfo(props: { account_id: string }) {
  const account = useAccount(props.account_id);

  return (
    <>
      <FaSolidUser size="1.5rem" class="opacity-40" />

      <PingPongScroller hoverOnly>
        {account()?.username ?? "[Unknown team]"}
      </PingPongScroller>
    </>
  );
}

function StaffPrintEntry(props: { index: Accessor<number>; print_id: string }) {
  const contest = useContest();
  const { session } = useAuth();

  const print = usePrint(props.print_id);
  const [isSumbitting, setSubmitting] = createSignal(false);

  async function markAsDone() {
    setSubmitting(true);

    markPrintAsDone(contest()!.id, props.print_id, session()!).finally(() =>
      setSubmitting(false),
    );
  }

  return (
    <div class="relative h-12 w-full group @container/submissionEntry rounded-md overflow-hidden">
      <div class="absolute w-full h-full z-0">
        <div class={clsx("w-full h-full", bg_map[print().status])} />
      </div>
      <div class="relative h-full flex flex-row flex-nowrap *:not-last:mr-2 items-center bg-linear-to-r px-3 rounded-md py-1 duration-150 transition-all cursor-pointer border border-black/10 z-10">
        <div class="text-gray-400 shrink-0"> {`Print #${props.index()}`} </div>

        <AccountInfo account_id={print().owner_id} />

        {/* Space */}
        <div class="grow" />

        <Button
          class="border border-black/10 rounded-md p-1 bg-white hover:bg-gray-100 cursor-pointer ui-disabled:text-gray-500 ui-disabled:cursor-auto"
          onClick={markAsDone}
          disabled={isSumbitting() || session() === undefined}
        >
          <Check size="1.5rem" />
        </Button>
      </div>
    </div>
  );
}

export function StaffPrintSelect(
  props: ComponentProps<"div"> & {
    prints: Accessor<Record<string, Print>>;
    selectedPrintId: Accessor<string | undefined>;
    setSelectedPrintId: Setter<string | undefined>;
  },
) {
  const sortedPrints = createMemo(() => {
    const printsVal = props.prints();

    const printsReady = Object.values(printsVal).filter(
      (print) => print.status === "ready",
    );
    const printsReadyRecord = Object.fromEntries(
      printsReady.map((print) => [print.id, print]),
    );

    return sortRecordValues(printsReadyRecord, (v) => Number(v.id), "desc");
  });

  createEffect(() => {
    if (props.selectedPrintId() !== undefined) {
      if (
        !sortedPrints()
          .map((p) => p.id)
          .includes(props.selectedPrintId()!)
      ) {
        props.setSelectedPrintId();
      }
    }
  });

  //console.log(sortedSubmissions());

  const finalStyle = clsx(
    "relative h-full overflow-x-hidden *:not-last:mb-3 overflow-auto grow",
    props.class,
  );

  return (
    <div class={finalStyle}>
      <Switch>
        <Match when={sortedPrints().length === 0}>
          <div class="relative w-full h-full overflow-hidden">
            <div class="absolute w-full h-full flex items-center justify-center z-20 text-xl font-medium opacity-50">
              No prints ready yet.
            </div>
            <div class="w-full h-full max-h-60 absolute bg-linear-to-b from-transparent to-white z-10" />
            <div class="p-3 *:not-last:mb-3">
              <div class="h-12 w-full bg-slate-100 rounded-md" />
              <div class="h-12 w-full bg-slate-100 rounded-md" />
              <div class="h-12 w-full bg-slate-100 rounded-md" />
              <div class="h-12 w-full bg-slate-100 rounded-md" />
            </div>
          </div>
        </Match>
        <Match when={sortedPrints().length > 0}>
          <RadioGroup
            value={props.selectedPrintId()}
            onChange={props.setSelectedPrintId}
          >
            <div class="p-3">
              <For each={sortedPrints()}>
                {(item, index) => (
                  <RadioGroup.Item value={item.id}>
                    <RadioGroup.ItemInput />
                    <RadioGroup.ItemControl>
                      <StaffPrintEntry
                        print_id={item.id}
                        index={() => sortedPrints().length - index()}
                      />
                    </RadioGroup.ItemControl>
                  </RadioGroup.Item>
                )}
              </For>
            </div>
          </RadioGroup>
        </Match>
      </Switch>
    </div>
  );
}

export function StaffPrintViewer(props: {
  print: Accessor<string | undefined>;
}) {
  const prints = usePrints();
  const { session } = useAuth();

  const [printPdfData, printPdfAction] = createResource(
    () => ({ prints: prints(), print_id: props.print(), session: session() }),
    async (params) => {
      if (!params.print_id || !params.session) return;

      const print = params.prints[params.print_id];
      if (!print) return;
      if (!print.pdf_href) return;

      console.log(print.pdf_href);

      return await fetch("/api" + print.pdf_href, {
        headers: {
          "X-Session-Id": params.session,
        },
      })
        .then((response) => response.blob())
        .then((blob) => blob.arrayBuffer());
    },
  );

  createEffect(() => console.log(printPdfData()));

  return (
    <PDFViewer
      pdfSource={printPdfData}
      class="relative w-full h-full inset-0 pdfSlick flex flex-col"
    >
      <PDFViewer.Toolbar>
        <PDFViewer.Toolbar.ThumbsbarButton />
        <PDFViewer.Toolbar.Splitter />
        <PDFViewer.Toolbar.ZoomSelector />
        <PDFViewer.Toolbar.Splitter />
        <PDFViewer.Toolbar.PageSelector />

        <div class="grow" />

        <PDFViewer.Toolbar.DownloadButton />
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
            onClick={() => printPdfAction.refetch()}
          >
            <RotateCw size="1em" /> <div class="ml-1">Retry</div>
          </Button>
        </div>
      </PDFViewer.Error>
    </PDFViewer>
  );
}
