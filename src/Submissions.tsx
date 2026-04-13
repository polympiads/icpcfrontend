import type { OverrideComponentProps } from "@kobalte/core";
import { Accordion } from "@kobalte/core/accordion";
import { Button } from "@kobalte/core/button";
import { A } from "@solidjs/router";
import clsx from "clsx";
import { Check, LoaderCircle, Upload, X } from "lucide-solid";
import { FaSolidUser, FaSolidWarning } from "solid-icons/fa";
import { OcLinkexternal2 } from "solid-icons/oc";
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
  Show,
  Switch,
  splitProps,
} from "solid-js";
import { CopyButton } from "./CopyButtons";
import {
  API_ROOT,
  BASE_URL,
  SUBMISSION_CODE_URL,
  SUBMISSION_URL,
  SUBMISSIONS_URL,
} from "./constants";
import { AppEditor, useAppEditorContext } from "./Editor";
import { LanguageEntry, LanguageIcon } from "./Languages";
import { LoadingAnimation } from "./LoadingAnimation";
import PingPongScroller from "./PingPongScroller";
import { sortRecordValues } from "./utils";
import { useAuth } from "./worker/context/AuthContext";
import { useContest } from "./worker/hooks/useContest";
import { useJudgementTypes } from "./worker/hooks/useJudgementTypes";
import { useProblem } from "./worker/hooks/useProblems";
import { useAccount } from "./worker/hooks/useUsers";
import type { Contest } from "./worker/types/data/Contest";
import type { JudgementType } from "./worker/types/data/JudgementTypes";
import type { Submission } from "./worker/types/data/Submission";
import { useSubmission } from "./worker/hooks/useSubmissions";
import { Panel, SplitPanel } from "./SplitPanel";
import { ProblemViewer } from "./Problems";
import { AiFillFileUnknown } from "solid-icons/ai";

export async function postSubmission(
  contest_id: string,
  code: string,
  problem_id: string,
  language_id: string,
  session: string,
) {
  const url = new URL(API_ROOT + SUBMISSIONS_URL(contest_id), BASE_URL);
  url.searchParams.append("language_id", language_id);
  url.searchParams.append("problem_id", problem_id);

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

async function getSubmissionCode(
  session: string | undefined,
  contest: Contest,
  submission: Submission,
) {
  let headers = {};
  if (session) {
    headers = {
      "X-Session-Id": session,
    };
  }

  return await fetch(
    API_ROOT + SUBMISSION_CODE_URL(contest.id, submission.id),
    { headers },
  ).then((response) => response.text());
}

function SubmitButton(props: {
  onSubmit: (code: string, language: string) => Promise<void>;
  disable: boolean;
}) {
  const { code, language } = useAppEditorContext();
  const isLanguageSelected = () => language() !== undefined;

  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    props.onSubmit(code(), language()!).finally(() => setSubmitting(false));
  }

  return (
    <Button
      class="h-full rounded-none cursor-pointer flex flex-row justify-center items-center bg-sky-300 disabled:bg-sky-200 disabled:cursor-default duration-100 hover:bg-sky-400 shrink-0 disabled:*:opacity-75 p-2"
      disabled={isSumbitting() || !isLanguageSelected() || props.disable}
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
          <Upload class="scale-75" />
          <div class="h-5" />
          <LoaderCircle class="animate-spin scale-75" />
        </div>
      </div>
      <div>Submit</div>
    </Button>
  );
}

export function SubmissionEditor(props: {
  onSubmit: (code: string, languageId: string) => Promise<void>;
  availableLanguages: Accessor<string[]>;
  disableSubmission: boolean;
}) {
  return (
    <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
      <AppEditor>
        <AppEditor.Toolbar class="border-b border-gray-300">
          {/* Space */}
          <div class="grow" />

          <AppEditor.LanguageSelect
            availableLanguages={props.availableLanguages}
          />
          <SubmitButton
            onSubmit={props.onSubmit}
            disable={props.disableSubmission ?? false}
          />
        </AppEditor.Toolbar>
        <div class="grow overflow-auto">
          <AppEditor.Editor class="h-full" />
        </div>
      </AppEditor>
    </div>
  );
}

type Status = "waiting" | "running" | "reject" | "failed" | "accepted";

const bg_map: Record<Status, string> = {
  accepted:
    "bg-linear-to-r from-green-50 to-green-200 hover:from-green-200 hover:to-green-300",
  failed:
    "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
  reject:
    "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
  running:
    "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
  waiting:
    "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
};

function AccountInfo(props: { account_id: string }) {
  const account = useAccount(props.account_id);
  createEffect(() => console.log(account()));

  return (
    <>
      <FaSolidUser size="1.5rem" class="opacity-40 shrink-0" />

      <PingPongScroller hoverOnly class="mx-1 text-lg">
        {account()?.username !== undefined
          ? account()?.username
          : "[Unknown team]"}
      </PingPongScroller>
    </>
  );
}

function computeStatus(
  submission: Submission,
  judgment: JudgementType | undefined,
): Status {
  switch (submission.status) {
    case "starting":
      return "waiting";
    case "compiling":
    case "running":
      return "running";
    case "finished":
      if (judgment) {
        if (judgment.solved) {
          return "accepted";
        } else {
          return "reject";
        }
      }
      return "running";
    case "failed":
      return "failed";
  }
}

function SubmissionStatusIcon(props: { status: Status }) {
  return (
    <Switch>
      <Match when={props.status === "running"}>
        <LoadingAnimation.SpinningCircle size="1.5rem" />
      </Match>
      <Match when={props.status === "accepted"}>
        <Check class="stroke-green-500" size="1.5rem" />
      </Match>
      <Match when={props.status === "reject"}>
        <div class="flex flex-row w-fit h-full items-center text-red-500 justify-center">
          <X size="1.5rem" />
        </div>
      </Match>
      <Match when={props.status === "failed"}>
        <VsWarning class="stroke-red-500" size="1.5rem" />
      </Match>
      <Match when={props.status === "waiting"}>
        <LoadingAnimation.ThreePulsingDots />
      </Match>
    </Switch>
  );
}

function SubmissionEntry(props: {
  index: number;
  submission: Submission;
  doNotShowUser?: boolean;
}) {
  const judgments = useJudgementTypes();
  const judgment = createMemo(() =>
    props.submission.judgement_type_id
      ? judgments()[props.submission.judgement_type_id]
      : undefined,
  );

  const status = createMemo(() => computeStatus(props.submission, judgment()));

  function ProblemLabel(
    props: OverrideComponentProps<"div", { problem_id: string }>,
  ) {
    const [local, other] = splitProps(props, ["problem_id"]);
    const problem = useProblem(local.problem_id);

    return <div {...other}>P.{problem()?.label}</div>;
  }

  return (
    <div class="relative h-12 w-full group @container/submissionEntry rounded-md overflow-hidden">
      <div class="absolute w-full h-full z-0">
        <div class={clsx("w-full h-full", status() && bg_map[status()!])} />
      </div>
      <div class="relative h-full flex flex-row *:not-last:mr-2 items-center bg-linear-to-r px-3 rounded-md py-1 duration-150 transition-all cursor-pointer border border-black/10 z-10">
        <div class="text-gray-400"> {`#${props.index}`} </div>
        <ProblemLabel
          problem_id={props.submission.problem_id}
          class="text-xl font-normal"
        />
        <LanguageIcon language={props.submission.language_id} class="p-1" />

        <Show
          when={
            props.submission.account_id !== undefined && !props.doNotShowUser
          }
        >
          <div class="h-full flex flex-row *:not-last:mr-2 items-center @max-3xs/submissionEntry:hidden shrink overflow-x-hidden">
            {/* Separator */}
            <div class="h-4/5 w-px bg-black/10"></div>

            <AccountInfo account_id={props.submission.account_id!} />
          </div>
        </Show>

        {/* Space */}
        <div class="grow" />

        <div class="shrink-0 flex flex-row items-center">
          <SubmissionStatusIcon status={status()} />

          <Show when={status() === "reject" && judgment() !== undefined}>
            <div class="overflow-hidden font-mono leading-none text-red-500 w-8 text-center">
              {judgment()?.id}
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

function SubmissionEntryWithCode(props: {
  submission: Submission;
  index: Accessor<number>;
  doNotShowUser?: boolean;
}) {
  const { whoami } = useAuth();

  const canAccessCode = createMemo(() => {
    const whoamiVal = whoami();
    if (!whoamiVal.is_authenticated) {
      return false;
    }

    return whoamiVal.is_staff || whoamiVal.id === props.submission.account_id;
  });

  return (
    <Accordion.Item value={props.submission.id} disabled={!canAccessCode()}>
      <Accordion.Header class="relative z-10">
        <Accordion.Trigger class="w-full group">
          <SubmissionEntry
            index={props.index() + 1}
            submission={props.submission}
            doNotShowUser={props.doNotShowUser}
          />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content class="ui-closed:animate-slide-up">
        <SubmissionCodeView submission={props.submission} />
      </Accordion.Content>
    </Accordion.Item>
  );
}

function SubmissionCodeView(props: { submission: Submission }) {
  const { session } = useAuth();
  const contest = useContest();

  const resourceParams = () => ({ session: session(), contest: contest() });
  const [code] = createResource(resourceParams, async (params) => {
    if (!params.session || !params.contest)
      throw "Try to access session without session or contest providers";

    const response = await getSubmissionCode(
      params.session,
      params.contest,
      props.submission,
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
            <AppEditor
              code={code()}
              language={props.submission.language_id}
              readonly
            >
              <div class="absolute right-0 z-10 p-2 gap-2 flex flex-row-reverse">
                <CopyButton />
                <A
                  href={SUBMISSION_URL(contest()!.id, props.submission.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button class="p-1 cursor-pointer flex flex-row justify-center items-center border border-black/10 bg-white hover:bg-gray-100 disabled:cursor-default rounded-md duration-50 shrink-0">
                    <OcLinkexternal2 size="1rem" />
                  </Button>
                </A>
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

export function SubmissionEntries(
  props: ComponentProps<"div"> & {
    submissions: Accessor<Record<string, Submission>>;
    thisUserOnly?: boolean;
  },
) {
  const { whoami } = useAuth();

  const sortedSubmissions = createMemo(() => {
    const submissionsVal = props.submissions();

    let submissionsToShow = submissionsVal;
    if (props.thisUserOnly) {
      const whoamiVal = whoami();
      if (!whoamiVal.is_authenticated) {
        submissionsToShow = {};
      } else {
        const submissionByThisUser = Object.values(submissionsVal).filter(
          (submission) => submission.account_id === whoamiVal.id,
        );
        submissionsToShow = Object.fromEntries(
          submissionByThisUser.map((submission) => [submission.id, submission]),
        );
      }
    }

    return sortRecordValues(submissionsToShow, (v) => Number(v.id), "desc");
  });
  //console.log(sortedSubmissions());

  const finalStyle = clsx(
    "relative h-full overflow-x-hidden *:not-last:mb-3 overflow-auto grow",
    props.class,
  );

  return (
    <div class={finalStyle}>
      <Switch>
        <Match when={sortedSubmissions().length === 0}>
          <div class="relative w-full h-full overflow-hidden *:not-last:mb-3 p-3">
            <div class="absolute w-full h-full flex items-center justify-center z-20 text-xl font-medium opacity-50">
              No submissions yet.
            </div>
            <div class="w-full h-full max-h-60 absolute bg-linear-to-b from-transparent to-white z-10" />
            <div class="h-12 w-full bg-slate-100 rounded-md" />
            <div class="h-12 w-full bg-slate-100 rounded-md" />
            <div class="h-12 w-full bg-slate-100 rounded-md" />
            <div class="h-12 w-full bg-slate-100 rounded-md" />
          </div>
        </Match>
        <Match when={sortedSubmissions().length > 0}>
          <div class="p-3">
            <Accordion class={finalStyle} collapsible={true}>
              <For each={sortedSubmissions()}>
                {(item, index) => (
                  <SubmissionEntryWithCode
                    submission={item}
                    index={() => sortedSubmissions().length - index()}
                    doNotShowUser={props.thisUserOnly}
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

export function SubmissionView(props: { submission_id: string }) {
  const { session } = useAuth();
  const contest = useContest();

  const submission = useSubmission(props.submission_id);

  const [code] = createResource(
    () => ({
      session: session(),
      contest: contest(),
      submission: submission(),
    }),
    async (params) => {
      if (!params.session || !params.contest)
        throw "Try to access session without session or contest providers";

      const response = await getSubmissionCode(
        params.session,
        params.contest,
        params.submission,
      );

      return response;
    },
  );

  const judgments = useJudgementTypes();
  const judgment = createMemo(() => {
    const submissionVal = submission();
    if (!submissionVal) {
      return;
    }

    return submissionVal.judgement_type_id
      ? judgments()[submissionVal.judgement_type_id]
      : undefined;
  });
  const status = createMemo(() => {
    if (submission()) {
      return computeStatus(submission(), judgment());
    }
  });

  const bg_map: Record<Status, string> = {
    accepted:
      "bg-linear-to-r from-green-50 to-green-200 hover:from-green-200 hover:to-green-300",
    failed:
      "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
    reject:
      "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
    running:
      "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
    waiting:
      "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
  };

  function SubmissionStatuMessage(props: {
    status: Status;
    judgment: Accessor<JudgementType | undefined>;
  }) {
    const message_map: Record<Status, string> = {
      accepted: "Passed",
      failed: "An error has occured. Contact assistance.",
      reject: "Rejected",
      running: "Running...",
      waiting: "Waiting...",
    };

    if (props.status === "reject") {
      return props.judgment()?.name ?? message_map[props.status];
    } else {
      return message_map[props.status];
    }
  }

  return (
    <div class="flex flex-col w-full h-full">
      <div class=" flex justify-center items-center mx-2.5 mt-2.5">
        <div class="w-30 h-20 border border-black/10 rounded-md shadow-md flex items-center justify-center">
          <AiFillFileUnknown size="2.5em" class="opacity-50" />
        </div>
        <div class="flex flex-col ml-2">
          <div class="text-3xl">{contest()?.name}</div>
          <div class="flex flex-row flex-nowrap">
            <Show when={submission()?.account_id !== undefined}>
              <div class="max-w-40 flex flex-row items-center">
                <AccountInfo account_id={submission()!.account_id!} />
              </div>
            </Show>
            <Show when={status() !== undefined}>
              <div
                class={clsx(
                  "rounded-full px-2 py-1 flex flex-nowrap items-center",
                  bg_map[status()!],
                )}
              >
                <SubmissionStatusIcon status={status()!} />
                <SubmissionStatuMessage
                  status={status()!}
                  judgment={judgment}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
      <SplitPanel direction="horizontal" includeMargin class="grow">
        <Panel>
          <Show when={submission() !== undefined}>
            <ProblemViewer problemId={() => submission().problem_id} />
          </Show>
          <Show when={submission() === undefined}>
            <div class="w-full h-full flex items-center justify-center">
              <LoadingAnimation.SpinningCircle size="3rem" />
            </div>
          </Show>
        </Panel>
        <Panel>
          <Switch>
            <Match when={code.state === "ready"}>
              <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
                <AppEditor
                  code={code()}
                  language={submission().language_id}
                  readonly
                >
                  <AppEditor.Toolbar class="bg-white border-b border-black/10">
                    <div class="grow" />
                    <CopyButton />
                    <LanguageEntry language={submission().language_id} />
                  </AppEditor.Toolbar>
                  <div class="grow z-0 overflow-auto">
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
              <div class="w-full h-full flex items-center justify-center">
                <LoadingAnimation.SpinningCircle size="3rem" />
              </div>
            </Match>
            <Match when={code.state === "errored"}>
              <div class="w-full h-full flex items-center justify-center">
                <FaSolidWarning size="3rem" class="opacity-50" />
              </div>
            </Match>
          </Switch>
        </Panel>
      </SplitPanel>
    </div>
  );
}
