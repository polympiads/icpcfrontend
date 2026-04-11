import { createEffect, createMemo, createResource, createSignal, For, Match, Switch, type Accessor, type ComponentProps } from "solid-js";
import { AppEditor, useAppEditorContext } from "./Editor";
import { Button } from "@kobalte/core/button";
import { BiRegularPrinter } from "solid-icons/bi";
import { Check, LoaderCircle } from "lucide-solid";
import { API_ROOT, BASE_URL, PRINT_URL, PRINTS_URL } from "./constants";
import { useContest } from "./worker/hooks/useContest";
import { useAuth } from "./worker/context/AuthContext";
import { LoadingAnimation } from "./LoadingAnimation";
import { FaSolidWarning } from "solid-icons/fa";
import { Accordion } from "@kobalte/core/accordion";
import clsx from "clsx";
import { CopyButton } from "./CopyButtons";
import { sortRecordValues } from "./utils";
import type { Print } from "./worker/types/data/Print";
import { VsWarning } from "solid-icons/vs";

async function postPrint(contest_id: string, code: string, session: string) {
  const url = new URL(API_ROOT + PRINTS_URL(contest_id), BASE_URL)
  
  const formData = new FormData()
  const codeBlob = new Blob([code], { type: 'text/plain' })
  formData.append('file', codeBlob)
  
  return await fetch(url.toString(), {
    method: "POST",
    body: formData,
    headers: {
      'X-Session-Id': session
    }
  })
}

async function getPrintCode(contest_id: string, print_id: string, session: string) {
  const url = new URL(API_ROOT + PRINT_URL(contest_id, print_id) + 'code', BASE_URL)

  return await fetch(url.toString(), {
    headers: {
      'X-Session-Id': session
    }
  })
    .then(response => response.text())
}

export function SubmitPrintButton(props: { disable: boolean }) {
  const contest = useContest()
  const { session } = useAuth()
  const { code } = useAppEditorContext()
  
  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    postPrint(contest()!.id, code(), session()!)
      .then(() => setSubmitting(false))
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
          <BiRegularPrinter size="1.5rem" class="scale-90"/>
          <div class="h-5" />
          <LoaderCircle class="animate-spin scale-75" />
        </div>
      </div>
      <div>Print</div>
    </Button>
  )
}

type Status = "pending" | "compiling" | "ready" | "failure" | "error" | "done"

const bg_map: Record<Status, string> = {
  "done": "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
  "failure": "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
  "error": "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
  "ready": "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
  "compiling": "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
  "pending": "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
}

function PrintEntry(props: { index: number, print: Print }) {
  function PrintStatusIcon(props: { status: Status }) {
    return (
      <Switch>
        <Match when={props.status == "done"}>
          <Check class="stroke-gray-400" size="1.5rem"/>
        </Match>
        <Match when={props.status == "compiling" || props.status == "ready"}>
          <BiRegularPrinter size="1.5rem" class="animate-pulse"/>
        </Match>
        <Match when={props.status == "failure" || props.status == "error"}>
          <VsWarning class="stroke-red-500" size="1.5rem"/>
        </Match>
        <Match when={props.status == "pending"}>
          <LoadingAnimation.ThreePulsingDots />
        </Match>
      </Switch>
    )
  }

  return (
    <div class="relative h-12 w-full group @container/submissionEntry rounded-md overflow-hidden">
      <div class="absolute w-full h-full z-0">
        <div class={ clsx("w-full h-full", bg_map[props.print.status]) } />
      </div>
      <div class="relative h-full flex flex-row *:not-last:mr-2 items-center bg-linear-to-r px-3 rounded-md py-1 duration-150 transition-all cursor-pointer border border-black/10 z-10">
        <div class="text-gray-400"> {`#${props.index}`} </div>
        
        { /* Space */ }
        <div class="grow" />
        
        <div class="shrink-0 flex flex-row items-center">
          <PrintStatusIcon status={props.print.status} />
        </div>
      </div>
    </div>
  )
}

function PrintEntryWithCode(props: { print: Print, index: Accessor<number> }) {
  return (
    <>
      <Accordion.Item value={props.print.id}>
        <Accordion.Header class="relative z-10">
          <Accordion.Trigger class="w-full group">
            <PrintEntry
              index={props.index() + 1}
              print={props.print}
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content class="ui-closed:animate-slide-up">
          <PrintCodeView print={props.print}/>
        </Accordion.Content>
      </Accordion.Item>
    </>
  )
}

function PrintCodeView(props: { print: Print }) {
  const contest = useContest();
  const { session } = useAuth()

  const resourceParams = () => ({ session: session(), contest: contest() });
  const [code] = createResource(resourceParams, async (params) => {
    if (!params.session || !params.contest)
      throw "Try to access session without session or contest providers";

    const response = await getPrintCode(
      params.session,
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
          <Match when={code.state == "ready"}>
            <div class="relative w-full max-h-60 overflow-hidden">
              <AppEditor
                code={code()}
                readonly
              >
                <div class="absolute right-0 z-10 p-2 gap-2 flex flex-row-reverse">
                  <CopyButton />
                </div>
                <div class="relative w-full z-0 max-h-60 overflow-auto">
                  <AppEditor.Editor />
                </div>
              </AppEditor>
            </div>
          </Match>
          <Match
            when={
              code.state == "pending" ||
              code.state == "refreshing" ||
              code.state == "unresolved"
            }
          >
            <div class="w-full h-20 flex items-center justify-center">
              <LoadingAnimation.SpinningCircle size="3rem" />
            </div>
          </Match>
          <Match when={code.state == "errored"}>
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
        <Match when={sortedPrints().length == 0}>
          <div class="relative w-full h-full overflow-hidden">
            <div class="absolute w-full h-full flex items-center justify-center z-20 text-xl font-medium opacity-50">
              No prints yet.
            </div>
            <div class="w-full h-full max-h-60 absolute bg-linear-to-b from-transparent to-white z-10" />
            <div class="p-3 *:not-last:mb-3">
              <div class="h-12 w-full bg-slate-100 rounded-md"/>
              <div class="h-12 w-full bg-slate-100 rounded-md"/>
              <div class="h-12 w-full bg-slate-100 rounded-md"/>
              <div class="h-12 w-full bg-slate-100 rounded-md"/>
            </div>
          </div>
        </Match>
        <Match when={sortedPrints().length > 0}>
          <div class="p-3">
            <Accordion class={finalStyle} collapsible={true}>
              <For each={sortedPrints()}>
                {(item, index) => (
                  <PrintEntryWithCode print={item} index={() => sortedPrints().length - index()} />
                )}
              </For>
            </Accordion>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
