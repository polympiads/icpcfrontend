import type dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import { parseReltime, parseTime } from "./DeltaTime";

export interface Contest {
  id: string;

  name: string;
  formal_name: string;

  start_time           : dayjs.Dayjs       | undefined;
  countdown_pause_time : duration.Duration | undefined;
  duration             : duration.Duration;

  scoreboard_freeze_time : dayjs.Dayjs | undefined;
  scoreboard_thaw_time   : dayjs.Dayjs | undefined;
  scoreboard_type        : "pass-fail";

  penalty_time : duration.Duration;
}

export interface ContestState {
    started        : dayjs.Dayjs | null
    ended          : dayjs.Dayjs | null
    frozen         : dayjs.Dayjs | null
    thawed         : dayjs.Dayjs | null
    finalized      : dayjs.Dayjs | null
    end_of_updates : dayjs.Dayjs | null
};

export interface ContestJson {
  id: string;

  name: string;
  formal_name: string;

  start_time           : string | undefined;
  countdown_pause_time : string | undefined;
  duration             : string;

  scoreboard_freeze_time : string | undefined;
  scoreboard_thaw_time   : string | undefined;
  scoreboard_type        : "pass-fail";

  penalty_time : string;
}

export interface ContestStateJson {
    started        : string | null
    ended          : string | null
    frozen         : string | null
    thawed         : string | null
    finalized      : string | null
    end_of_updates : string | null
};

export function parseContest (contest: ContestJson) {
  const result: Contest = {
    id: contest.id,
    name: contest.name,
    formal_name: contest.formal_name,

    start_time           : contest.start_time           ? parseTime   (contest.start_time) : undefined,
    countdown_pause_time : contest.countdown_pause_time ? parseReltime(contest.countdown_pause_time) : undefined,
    duration             : parseReltime(contest.duration),

    scoreboard_freeze_time : contest.scoreboard_freeze_time ? parseTime(contest.scoreboard_freeze_time) : undefined,
    scoreboard_thaw_time   : contest.scoreboard_thaw_time   ? parseTime(contest.scoreboard_thaw_time) : undefined,
    scoreboard_type        : contest.scoreboard_type,
    
    penalty_time : parseReltime(contest.penalty_time)
  };

  return result;
}

export function parseContestState (contestState: ContestStateJson) {
  function parseTimeOrNull (time: string | null) {
    if (time === null) return time;
    return parseTime(time);
  }
  
  const result : ContestState = {
    started        : parseTimeOrNull(contestState.started),
    ended          : parseTimeOrNull(contestState.ended),
    frozen         : parseTimeOrNull(contestState.frozen),
    thawed         : parseTimeOrNull(contestState.thawed),
    finalized      : parseTimeOrNull(contestState.finalized),
    end_of_updates : parseTimeOrNull(contestState.end_of_updates)
  };

  return result;
}

export function contestEquals (j1: Contest | undefined, j2: Contest | undefined) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.countdown_pause_time == j2.countdown_pause_time
  && j1.duration == j2.duration
  && j1.formal_name == j2.formal_name
  && j1.id == j2.id
  && j1.name == j2.name
  && j1.penalty_time == j2.penalty_time
  && j1.scoreboard_freeze_time == j2.scoreboard_freeze_time
  && j1.scoreboard_thaw_time == j2.scoreboard_thaw_time
  && j1.scoreboard_type == j2.scoreboard_type
  && j1.start_time == j2.start_time
}

export function contestStateEquals (j1: ContestState | undefined, j2: ContestState | undefined) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.end_of_updates == j2.end_of_updates
    && j1.ended == j2.ended
    && j1.finalized == j2.finalized
    && j1.frozen == j2.frozen
    && j1.started == j2.started
    && j1.thawed == j2.thawed
}
