import { Button } from "@kobalte/core/button";
import { A } from "@solidjs/router";
import { type Dayjs } from "dayjs";
import dayjs from './dayjs'
import type { Duration } from "dayjs/plugin/duration";
import { ArrowLeft, Hourglass, Plus, RotateCw } from "lucide-solid";
import { AiFillFileUnknown } from "solid-icons/ai";
import { BsExclamationCircle, BsPauseCircle } from "solid-icons/bs";
import { FaSolidFlagCheckered } from "solid-icons/fa";
import {
  createMemo,
  ErrorBoundary,
  For,
  Match,
  Suspense,
  Switch,
  type Accessor,
} from "solid-js";
import { LoadingAnimation } from "./LoadingAnimation";
import { useNow } from "./Now";
import { useContestState } from "./worker/hooks/useContest";
import { useContests } from "./worker/hooks/useContests";
import type { Contest, ContestState } from "./worker/types/data/Contest";

export function ContestSelect() {
  const { contests, contestsActions } = useContests();

  return (
    <ErrorBoundary
      fallback={(_, reset) => (
        <div class="w-full h-full flex flex-col items-center justify-center">
          <BsExclamationCircle size="3em" />
          <div class="text-xl font-medium mb-3"> Something went wrong. </div>
          <Button
            class="border border-black/10 p-2 rounded-md flex flex-row items-center hover:bg-gray-100"
            onClick={() => {contestsActions.refetch(); reset()}}
          >
            <RotateCw size="1em" /> <div class="ml-1">Retry</div>
          </Button>
        </div>
      )}
    >
      <Suspense
        fallback={
          <div class="relative w-full h-full">
            <div class="absolute z-20 w-full h-full flex items-center justify-center">
              <LoadingAnimation.SpinningCircle size="5em" />
            </div>
            <div class="relative w-full h-150 overflow-hidden">
              <div class="absolute z-10 w-full h-150 bg-linear-to-b from-transparent to-white" />
              <div class="relative z-0 w-full overflow-hidden grid column-auto-fit-80 grid-rows-11 gap-2 animate-pulse justify-center pt-20">
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
                <div class="bg-gray-200 w-80 h-50 rounded-md"></div>
              </div>
            </div>
          </div>
        }
      >
        <div class="relative z-0 w-full grid column-auto-fit-80 gap-2 justify-center py-20">
          <For each={contests()}>
            {(contest, _) => <ContestSelectionCard contest={contest} />}
          </For>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

function ContestSelectionCard(props: { contest: Contest }) {
  function formatRemainingTime(time: Dayjs | Duration) {
    let string = "";
    if (dayjs.isDayjs(time)) {
      if (time.hour() > 0) {
        string += `${time.hour()}h`;
      }
      if (time.minute() > 0) {
        string += `${time.minute()}m`;
      }
      if (time.second() > 0) {
        string += `${time.minute()}s`;
      }
    } else {
      if (time.hours() > 0) {
        string += `${time.hours()}h`;
      }
      if (time.minutes() > 0) {
        string += `${time.minutes()}m`;
      }
      if (time.seconds() > 0) {
        string += `${time.seconds()}s`;
      }
    }

    if (string.length === 0) {
      string = "0m";
    }

    return string;
  }

  return (
    <A href={`/contests/${props.contest.id}`}>
      <div class="w-80 h-50 border border-black/10 rounded-md bg-white shadow-md flex flex-col cursor-pointer hover:scale-105 duration-75">
        <div class="w-full grow flex items-center justify-center">
          <AiFillFileUnknown size="3em" class="opacity-50" />
        </div>
        <div class="h-17 border-t border-black/10 p-2">
          <div class="font-medium text-xl"> {props.contest.formal_name} </div>
          <div class="flex flex-row items-center">
            <div class="flex flex-row items-center">
              <Hourglass size="0.9rem" />
              <div class="ml-0.5">
                {formatRemainingTime(props.contest.duration)}
              </div>
            </div>
            <div class="mx-0.5 opacity-50">·</div>
            <Plus size="0.9rem" />
            {formatRemainingTime(props.contest.penalty_time)}
          </div>
        </div>
      </div>
    </A>
  );
}

function ContestOverlayStatus(props: { contest: Contest, contestState: Accessor<ContestState|undefined> }) {
  const { now } = useNow();

  const HALF_HOUR_THRESHOLD_MS = 1800000;

  function formatRemainingTime(time: Duration) {
    let string = "";
    const parts_with_unit_map: [number, string, boolean][] = [
      [time.hours(), "h", false],
      [time.minutes(), "m", true],
      [time.seconds(), "", true],
    ];

    let b = false;
    for (const part of parts_with_unit_map) {
      if (part[0] > 0 || b || part[2]) {
        const part_str = b
          ? part[0].toString().padStart(2, "0")
          : part[0].toString();

        string += `${part_str}${part[1]}`;
        b = true;
      }
    }

    if (string.length === 0) {
      string = "0m";
    }

    return string;
  }

  if (props.contest.start_time) {
    const remainingTime = createMemo(() => {
      const contestStateVal = props.contestState();
      if (contestStateVal === undefined) {
        return;
      }
      if (contestStateVal.started === null) {
        return;
      }

      return contestStateVal.started.add(props.contest.duration).diff(now());
    });
    const isFinished = createMemo(
      () => remainingTime() !== undefined && remainingTime()! < 0,
    );

    return (
      <Switch>
        <Match
          when={
            now().diff(props.contest.start_time) < -HALF_HOUR_THRESHOLD_MS
          }
        >
          <div class="py-0.5 px-1.5 mx-0.5 outline outline-black/10 rounded-full text-sm bg-white">
            Scheduled for {props.contest.start_time?.format("HH:mm")}
          </div>
        </Match>
        <Match when={now().diff(props.contest.start_time) < 0}>
          <div class="py-0.5 px-1.5 mx-0.5 outline outline-black/10 rounded-full text-sm bg-green-400 text-white font-medium">
            Starts in
            {formatRemainingTime(
              dayjs.duration(props.contest.start_time.diff(now())),
            )}
          </div>
        </Match>
        <Match when={isFinished()}>
          <div class="py-0.5 px-1.5 mx-0.5 outline outline-black/10 rounded-full text-sm bg-slate-700 text-white flex flex-row items-center">
            <FaSolidFlagCheckered />
            <div class="font-medium ml-0.5">Finished</div>
          </div>
        </Match>
        <Match
          when={now().diff(props.contest.start_time) >= 0 && !isFinished()}
        >
          <div class="py-0.5 px-1.5 mx-0.5 outline outline-black/10 rounded-full text-sm bg-green-400 text-white font-medium">
            Starting...
          </div>
        </Match>
      </Switch>
    );
  } else if (props.contest.countdown_pause_time) {
    return (
      <div class="py-0.5 px-1.5 mx-0.5 outline outline-black/10 rounded-full text-sm bg-yellow-300 text-yellow-800 flex flex-row items-center">
        <BsPauseCircle /> <div class="font-medium ml-0.5">Paused</div>
      </div>
    );
  } else {
    return <> Not yet scheduled </>;
  }
}

function OverlayInfo(props: { contest: Contest }) {
  return (
    <>
      <div class="w-80 h-50 flex items-center justify-center border border-black/10 rounded-md shadow-md">
        <AiFillFileUnknown size="3em" class="opacity-50" />
      </div>
      <div class="text-3xl font-semibold my-3">
        {props.contest?.formal_name}
      </div>
    </>
  );
}

export function ContestPageOverlay(props: { contest: Contest | undefined }) {
  const { now } = useNow();
  const contestState = useContestState();

  const isInProgress = () => {
    const contestVal = props.contest;
    const contestStateVal = contestState();
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
    <div class="w-full h-full flex flex-col justify-center items-center">
      <div class="absolute top-0 left-0 p-2">
        <A href="/">
          <div class="border border-black/10 p-2 rounded-md flex flex-row flex-nowrap items-center group/return_button overflow-hidden cursor-pointer">
            <ArrowLeft size="1rem" />
            <div class="w-0 group-hover/return_button:w-30 text-nowrap duration-75">
              <div class="ml-2">Return to menu</div>
            </div>
          </div>
        </A>
      </div>

      <Switch>
        <Match when={props.contest === undefined}>
          <LoadingAnimation.SpinningCircle size="4em" />
          <div class="text-2xl font-medium"> Waiting for contest... </div>
        </Match>
        <Match when={props.contest !== undefined && !isInProgress()}>
          {/** biome-ignore lint/style/noNonNullAssertion: contest can't be undefined because of the requirement of the Match */}
          <OverlayInfo contest={props.contest!} />

          {/** biome-ignore lint/style/noNonNullAssertion: contest can't be undefined because of the requirement of the Match */}
          <ContestOverlayStatus contest={props.contest!} contestState={contestState}/>
        </Match>
      </Switch>
    </div>
  );
}
