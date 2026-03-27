import dayjs, { type Dayjs } from "dayjs";
import type { Contest } from "../../worker/types/data/Contest";
import duration from "dayjs/plugin/duration";
import {
  createEffect,
  createMemo,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Switch,
} from "solid-js";
import { DurationView } from "../TimeComponents";
import { BaseTransition } from "../base/BaseTransition";
import { BaseSwitch } from "../base/BaseSwitch";
import { FaRegularAlarmClock } from "solid-icons/fa";
import { BiSolidFlagCheckered } from "solid-icons/bi";
import { DurationClock } from "../Clock";
import { AiTwotonePauseCircle } from "solid-icons/ai";
import { LoadingAnimation } from "../animations/LoadingAnimation";
import clsx from "clsx";

dayjs.extend(duration);

const START_IN_SOON_THRESHOLD = 60 * 30;
const WILL_END_SOON_THRESHOLD = 60 * 30;

type Status =
  "not-scheduled"
  | "scheduled-in"
  | "starts-in-soon"
  | "going"
  | "will-end-soon"
  | "finished";

export function ContestStatus(props: { contest: Contest }) {
  const [remainingTime, setRemainingTime] = createSignal<duration.Duration>(
    dayjs.duration(0, "seconds"),
  );
  const [pauseDuration, setPauseDuration] = createSignal<duration.Duration>(
    dayjs.duration(0, "seconds"),
  );
  const [status, setStatus] = createSignal<Status>("scheduled-in");
  const isPaused = createMemo(
    () => props.contest.countdown_pause_time != undefined,
  );

  const [timeSeparatorPulse, setTimeSeparatorPulse] = createSignal(false);

  const [now, setNow] = createSignal(dayjs());
  onMount(() => {
    const intervalID = setInterval(() => {
      if (!isPaused()) {
        setNow(dayjs());
        setTimeSeparatorPulse((v) => !v);
      }
    }, 500);
    onCleanup(() => clearInterval(intervalID));
  });

  function updateStatus(now: Dayjs) {
    if (props.contest.countdown_pause_time != undefined) {
      setPauseDuration(() => props.contest.countdown_pause_time!);
      return;
    } else if (props.contest.start_time) {
      const start_diff = dayjs.duration(props.contest.start_time!.diff(now));
      const end_diff = dayjs.duration(
        props.contest
          .start_time!.add(props.contest.duration.asSeconds(), "seconds")
          .diff(now),
      );

      if (start_diff.asSeconds() > 0) {
        if (start_diff.asSeconds() <= START_IN_SOON_THRESHOLD) {
          setStatus("starts-in-soon");
          setRemainingTime(() => start_diff);
        } else {
          setStatus("scheduled-in");
          setRemainingTime(() => start_diff);
        }
      } else if (end_diff.asSeconds() > 0) {
        if (end_diff.asSeconds() <= WILL_END_SOON_THRESHOLD) {
          setStatus("will-end-soon");
          setRemainingTime(() => end_diff);
        } else {
          setStatus("going");
          setRemainingTime(() => end_diff);
        }
      } else {
        setStatus("finished");
      }
    } else {
      setStatus("not-scheduled")
    }
  }

  createEffect(() => {
    props.contest;
    updateStatus(now());
  });

  const showSeconds = createMemo(
    () =>
      status() == "going" ||
      status() == "will-end-soon" ||
      status() == "starts-in-soon",
  );

  // props is reactive here, but duration isn't, so we need to create a reactive duration for the clock

  const bg_map: Record<Status, string> = {
    "scheduled-in": "",
    "starts-in-soon": "bg-green-400",
    going: "bg-green-400 font-bold",
    "will-end-soon": "bg-red-500",
    finished: "bg-gray-500",
    "not-scheduled": "bg-gray-400",
  };
  const container_class = createMemo(() =>
    clsx(
      "relative leading-none text-sm overflow-hidden rounded-full duration-100",
      isPaused() ? "bg-yellow-400" : bg_map[status()],
      status() != "scheduled-in"
        ? "font-bold text-white"
        : "font-medium text-black",
      status() == "not-scheduled" ? "opacity-75" : ""
    ),
  );
  const text_class = createMemo(() => {
    const s = status();
  
    let variant;
    if (isPaused()) {
      variant = "text-black/50";
    } else if (s === "not-scheduled") {
      variant = "text-white/90";
    } else if (s === "scheduled-in") {
      variant = "text-black/75";
    } else {
      variant = "opacity-100";
    }
  
    return clsx(
      "relative flex flex-row items-center *:not-first:ml-1 z-10 transition-colors",
      variant
    );
  });

  const bg_wave_class = createMemo(() =>
    status() != "finished" && status() != "not-scheduled" ? "via-white/30" : "via-white/10",
  );

  return (
    <>
      <div class={container_class()}>
        <div class="w-full h-full absolute">
          <LoadingAnimation.WaveBackground
            waveWidth="5em"
            showBgPulse={false}
            waveClass={bg_wave_class()}
          />
        </div>

        <div class="relative flex flex-row items-center py-1 px-2 *:not-first:ml-1">
          <BaseSwitch.TopDown pulseValue={status}>
            {(value) => (
              <div class={text_class()}>
                <Switch>
                  <Match
                    when={value == "scheduled-in" || value == "starts-in-soon"}
                  >
                    <FaRegularAlarmClock />
                  </Match>
                  <Match when={value == "going" || value == "will-end-soon"}>
                    <DurationClock size="1rem" duration={remainingTime()} />
                  </Match>
                  <Match when={value == "finished"}>
                    <div class="flex flex-row">
                      <BiSolidFlagCheckered class="mr-1" /> Finished
                    </div>
                  </Match>
                  <Match when={value == "not-scheduled"}>
                    Not scheduled
                  </Match>
                </Switch>
              </div>
            )}
          </BaseSwitch.TopDown>

          <BaseTransition.FadeInWidth visible={status() != "finished" && status() != "not-scheduled"}>
            <div class={text_class()}>
              <div class="flex flex-row">
                <DurationView
                  duration={remainingTime()}
                  showSeconds={showSeconds()}
                  separatorPulse={timeSeparatorPulse()}
                />
              </div>
            </div>
          </BaseTransition.FadeInWidth>

          <BaseTransition.FadeInWidth visible={isPaused()}>
            <div class="flex flex-row items-center">
              <div class="h-full aspect-square flex items-center justify-center">
                <AiTwotonePauseCircle size="1.2em" />
              </div>

              <div class="flex flex-row">
                <DurationView
                  duration={pauseDuration()}
                  showSeconds={showSeconds()}
                  separatorPulse={timeSeparatorPulse()}
                />
              </div>
            </div>
          </BaseTransition.FadeInWidth>
        </div>
      </div>
    </>
  );
}
