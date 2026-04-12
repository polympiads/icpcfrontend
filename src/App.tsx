import { Select } from "@kobalte/core/select";
import { Tabs } from "@kobalte/core/tabs";
import { A, Route, Router, useNavigate, useParams } from "@solidjs/router";
import dayjs, { duration } from "dayjs";
import { ArrowLeft, ChevronDown, Printer } from "lucide-solid";
import { BsExclamationCircle } from "solid-icons/bs";
import {
  FaRegularCalendarAlt,
  FaSolidListSquares,
} from "solid-icons/fa";
import {
  createEffect,
  createMemo,
  createSignal,
  ErrorBoundary,
  Match,
  onMount,
  type ParentProps,
  Show,
  Switch,
} from "solid-js";
import { ContestPageOverlay, ContestSelect } from "./Contest";
import { API_ROOT, API_URL, BASE_URL, SUBMISSIONS_URL } from "./constants";
import { AppEditor } from "./Editor";
import { BasePortalRoot } from "./Portal";
import {
  PrintEntries,
  StaffPrintSelect,
  StaffPrintViewer,
  SubmitPrintButton,
} from "./Prints";
import { ProblemViewer } from "./Problems";
import { Panel, SplitPanel } from "./SplitPanel";
import {
  SubmissionEditor,
  SubmissionEntries,
  SubmissionView,
} from "./Submissions";
import { UserLoginWidget } from "./User";
import { AuthProvider, useAuth } from "./worker/context/AuthContext";
import { FeedProvider } from "./worker/context/FeedContext";
import { WorkerProvider } from "./worker/context/WorkerContext";
import { useContest, useContestState } from "./worker/hooks/useContest";
import { useLanguages } from "./worker/hooks/useLanguages";
import { usePrints } from "./worker/hooks/usePrints";
import { useProblems } from "./worker/hooks/useProblems";
import { useSubmissions } from "./worker/hooks/useSubmissions";
import type { Problem } from "./worker/types/data/Problems";
import type { Submission } from "./worker/types/data/Submission";
import { NowProvider, useNow } from "./Now";

dayjs.extend(duration);

function ContestSelectionPage() {
  return (
    <div class="w-full h-full flex flex-col">
      <div class="h-20 w-full p-3 border-b border-black/10 shadow-xl flex flex-row">
        <img src="/hc2_icon.png" class="h-14 w-14 object-cover"/>
            
        <div class="grow" />

        <UserLoginWidget />
      </div>
      <div class="grow w-full overflow-hidden">
        <ContestSelect />
      </div>
    </div>
  );
}

function InContestPage() {
  const urlParams = useParams();
  const navigate = useNavigate();

  const { now } = useNow();

  const languages = useLanguages();
  const auth = useAuth();
  const isLoggedIn = () => auth.whoami().is_authenticated;
  const isStaff = () => {
    const whoamiVal = auth.whoami();
    return whoamiVal.is_authenticated && whoamiVal.is_staff;
  };
  const [selectedPrint, setSelectedPrint] = createSignal<string>();

  const problems = useProblems();
  const submissions = useSubmissions();
  const prints = usePrints();
  const contest = useContest();
  const isFrozen = createMemo(() => {
    const nowVal = now();
    const contestVal = contest();
    if (!contestVal) {
      return;
    }
    if (!contestVal.start_time || !contestVal.scoreboard_freeze_time) {
      return;
    }

    return nowVal.diff(contestVal.scoreboard_freeze_time) > 0;
  });

  const frozenSubmissions = createMemo<Record<string, Submission>>(
    (old) => (isFrozen() ? old : submissions()),
    {},
  );

  const [selectedProblem, setSelectedProblem] = createSignal<Problem>(
    Object.values(problems())[0],
  );
  createEffect(() => console.log(problems()));

  function onProblemSelect(problem: Problem | null) {
    if (!problem) {
      return;
    }

    setSelectedProblem(problem);
  }

  const [selectedTab, setSelectedTab] = createSignal("problems");

  const TABS = ["problems", "scoreboard", "print", "submissions"];
  onMount(() => {
    const wild = urlParams.rest;
    if (wild === undefined)
      throw "That component should be used for the /contests/:id/* route.";

    const wildParts = wild.split("/");
    const segment = wildParts[0];
    console.log(segment);

    const firstProblem = Object.values(problems())[0];
    if (firstProblem === undefined) {
      throw "Error no problems available for that contest";
    }

    if (wild === "") {
      setSelectedTab("problems");
      setSelectedProblem(firstProblem);
    } else if (TABS.includes(segment)) {
      if (segment === "print" && !isLoggedIn()) {
        setSelectedProblem(firstProblem);
      } else {
        setSelectedTab(segment);

        if (segment === "problems") {
          if (wildParts.length > 1) {
            const problem_id = wildParts[1];
            if (problem_id in problems()) {
              setSelectedProblem(problems()[problem_id]);
            } else {
              setSelectedProblem(firstProblem);
            }
          } else {
            setSelectedProblem(firstProblem);
          }
        }
      }
    } else {
      navigate("/404");
    }
  });
  createEffect(() => {
    const selectedTabVal = selectedTab();

    if (selectedTabVal !== "problems") {
      navigate(`./${selectedTabVal}`, { replace: true });
    } else {
      const problem = selectedProblem();
      navigate(`./${selectedTabVal}/${problem?.id}`, { replace: true });
    }
  });

  createEffect(() => {
    const firstProblem = Object.values(problems())[0];
    if (firstProblem === undefined) {
      throw "Error no problems available for that contest";
    }

    if (!isLoggedIn() && selectedTab() === "print") {
      setSelectedTab("problems");
      setSelectedProblem(firstProblem);
    }
  });

  function ProblemInfo(props: { problem: Problem }) {
    return (
      <>
        {props.problem.label} - {props.problem.name}
      </>
    );
  }

  async function postSubmission(
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

  async function submitCode(code: string, language_id: string) {
    await postSubmission(
      urlParams.id!,
      code,
      selectedProblem().id,
      language_id,
      auth.session()!,
    );
  }

  return (
    <div class="relative w-full h-full">
      <div class="absolute w-full h-full bg-white z-10">
        <ContestPageOverlay contest={contest()} />
      </div>

      <div class="relative w-full h-full flex flex-col z-0">
        <div class="relative h-20 w-full p-3 border-b border-black/10 shadow-xl flex flex-row z-10">
		      <img src="/hc2_icon.png" class="h-14 w-14 object-cover"/>

          <div class="grow" />

          <UserLoginWidget />
        </div>
        <div class="grow w-full overflow-hidden">
          <Tabs
            class="h-full flex flex-col"
            value={selectedTab()}
            onChange={setSelectedTab}
          >
            <Tabs.List class="*:bg-white *:border *:border-black/10 *:p-1 *:ui-highlighted:shadow-md *:opacity-75 *:ui-highlighted:opacity-100 *:ui-highlighted:z-10 *:ui-highlighted:hover:border-black/10 *:ui-highlighted:scale-105 *:ui-highlighted:cursor-auto *:cursor-pointer *:rounded-lg *:min-w-30 *:hover:opacity-100 *:hover:border-black/30 *:duration-75 *:ui-disabled:opacity-50 px-2.5 pt-2 gap-2 flex flex-row">
              <Tabs.Trigger value="problems">
                <Show when={problems() !== undefined}>
                  <Select
                    value={selectedProblem()}
                    onChange={onProblemSelect}
                    options={Object.values(problems())}
                    optionValue="id"
                    optionTextValue="name"
                    itemComponent={(props) => (
                      <Select.Item item={props.item}>
                        <Select.ItemLabel class="px-2 hover:bg-black/20 outline-t border-t border-black/10 max-w-80 leading-7.5 box-border">
                          <ProblemInfo problem={props.item.rawValue} />
                        </Select.ItemLabel>
                      </Select.Item>
                    )}
                  >
                    <div class="flex flex-row flex-nowrap items-center">
                      <Select.Trigger class="flex flex-row flex-nowrap items-center hover:bg-black/20 rounded-full border border-black/20 cursor-pointer">
                        <Select.Icon class="">
                          <ChevronDown size="1.4rem" />
                        </Select.Icon>
                      </Select.Trigger>
                      <div class="ml-1">
                        <Select.Value<Problem>>
                          {(state) => {
                            console.log(
                              state.selectedOption(),
                              selectedProblem(),
                            );
                            return (
                              <div class="flex flex-row flex-nowrap">
                                <ProblemInfo problem={state.selectedOption()} />
                              </div>
                            );
                          }}
                        </Select.Value>
                      </div>
                    </div>
                    <Select.Portal>
                      <Select.Content class="bg-white border border-black/20 rounded-md shadow-lg">
                        <div class="max-h-ui-popup-h max-w-ui-popup-w overflow-x-auto">
                          <Select.Listbox class="flex flex-col flex-wrap max-h-ui-popup-h" />
                        </div>
                      </Select.Content>
                    </Select.Portal>
                  </Select>
                </Show>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="scoreboard"
                class="flex flex-row gap-1 justify-center items-center"
              >
                <FaRegularCalendarAlt size="1rem" class="float-left" />
                Scoreboard
              </Tabs.Trigger>
              <Tabs.Trigger
                value="submissions"
                class="flex flex-row gap-1 justify-center items-center"
              >
                <FaSolidListSquares size="1rem" class="float-left" />
                Submissions
              </Tabs.Trigger>
              <Tabs.Trigger
                disabled={!isLoggedIn()}
                value="print"
                class="flex flex-row gap-1 justify-center items-center"
              >
                <Printer size="1rem" /> Print
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="problems" class="grow w-full">
              <BasePortalRoot>
                <SplitPanel direction="horizontal" class="h-full" includeMargin>
                  <Panel>
                    <Show when={selectedProblem() !== undefined}>
                      <ProblemViewer problemId={() => selectedProblem().id} />
                    </Show>
                  </Panel>
                  <SplitPanel direction="vertical">
                    <Panel>
                      <SubmissionEntries submissions={submissions} />
                    </Panel>
                    <Panel>
                      <SubmissionEditor
                        onSubmit={submitCode}
                        availableLanguages={() => Object.keys(languages())}
                        disableSubmission={!isLoggedIn()}
                      />
                    </Panel>
                  </SplitPanel>
                </SplitPanel>
              </BasePortalRoot>
            </Tabs.Content>
            <Tabs.Content value="submissions" class="h-full w-full p-3">
              <Panel>
                <div class="h-full w-full overflow-auto">
                  <div class="relative z-0">
                    <Show when={isFrozen()}>
                      <div class="absolute z-10 h-full w-full bg-sky-200/50" />
                    </Show>
                    <div class="relative z-0">
                      <SubmissionEntries submissions={frozenSubmissions} />
                    </div>
                  </div>
                </div>
              </Panel>
            </Tabs.Content>
            <Tabs.Content value="print" class="w-full h-full p-2.5">
              <Show when={!isStaff()}>
                <SplitPanel direction="horizontal" class="h-full">
                  <Panel>
                    <PrintEntries prints={prints} />
                  </Panel>
                  <Panel>
                    <AppEditor>
                      <AppEditor.Toolbar class="border-b border-gray-300">
                        <div class="grow" />

                        <SubmitPrintButton disable={false} />
                      </AppEditor.Toolbar>
                      <div class="h-full w-full overflow-auto">
                        <AppEditor.Editor class="h-full" />
                      </div>
                    </AppEditor>
                  </Panel>
                </SplitPanel>
              </Show>
              <Show when={isStaff()}>
                <SplitPanel direction="horizontal" class="h-full">
                  <Panel>
                    <StaffPrintSelect
                      selectedPrintId={selectedPrint}
                      setSelectedPrintId={setSelectedPrint}
                      prints={prints}
                    />
                  </Panel>
                  <Panel>
                    <StaffPrintViewer print={selectedPrint} />
                  </Panel>
                </SplitPanel>
              </Show>
            </Tabs.Content>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ContestPage() {
  const { now } = useNow();
  const contest = useContest()
  const contestState = useContestState()

  const isInProgress = () => {
    const contestVal = contest();
    const contestStateVal = contestState()
    const nowVal = now();

    if (!contestVal || !contestStateVal) {
      return false;
    }
    if (!contestStateVal.started) {
      return false;
    }

    const remainingTimeMS = contestStateVal.started
      .add(contestVal.duration)
      .diff(nowVal);
    return remainingTimeMS > 0 && nowVal.diff(contestStateVal.started) >= 0;
  };

  return (
    <Switch>
      <Match when={!isInProgress()}>
        <ContestPageOverlay contest={contest()}/>
      </Match>
      <Match when={isInProgress()}>
        <InContestPage />
      </Match>
    </Switch>
  )
}

function PageCrashHandler(props: ParentProps) {
  return (
    <ErrorBoundary
      fallback={
        <div class="w-full h-full flex flex-col items-center justify-center">
          <BsExclamationCircle size="3em" />
          <div class="text-xl font-medium mb-3"> Something went wrong. </div>
          <A href="/">
            <div class="border border-black/10 p-2 rounded-md flex flex-row flex-nowrap items-center group/return_button overflow-hidden cursor-pointer">
              <ArrowLeft size="1rem" />
              <div class="w-0 group-hover/return_button:w-30 text-nowrap duration-75">
                <div class="ml-2">Return to menu</div>
              </div>
            </div>
          </A>
        </div>
      }
    >
      {props.children}
    </ErrorBoundary>
  );
}

function ContestSubmissionViewPage() {
  const urlParams = useParams();
  const navigate = useNavigate();

  const { whoami } = useAuth();

  onMount(() => {
    if (!whoami().is_authenticated) {
      navigate("/404");
    }
  });

  return (
    <div class="w-full h-full flex flex-col">
      <div class="h-20 w-full p-3 border-b border-black/10 shadow-xl flex flex-row">
        <img src="/hc2_icon.png" class="h-14 w-14 object-cover"/>

        <div class="grow" />

        <UserLoginWidget />
      </div>
      <div class="grow w-full overflow-hidden">
        <SubmissionView submission_id={urlParams.submission_id!} />
      </div>
    </div>
  );
}

function RouteFeedWrapper(props: ParentProps) {
  const urlParams = useParams();
  if (!urlParams.id) {
    throw "This component should be used for the /contests/:id route.";
  }

  return <FeedProvider contestId={urlParams.id}>{props.children}</FeedProvider>;
}

function App() {
  return (
    <NowProvider>
      <WorkerProvider apiHostname={API_URL}>
        <AuthProvider>
          <Router>
            <Route path="/" component={ContestSelectionPage} />
            <Route path="/contests/:id" component={RouteFeedWrapper}>
              <Route
                path="/submissions/:submission_id"
                component={ContestSubmissionViewPage}
              />
              <Route
                path="/*rest"
                component={() => (
                  <PageCrashHandler>
                    <ContestPage />
                  </PageCrashHandler>
                )}
              />
            </Route>
          </Router>
        </AuthProvider>
      </WorkerProvider>
    </NowProvider>
  );
}

export default App;
