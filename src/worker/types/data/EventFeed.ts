import type { Balloon } from "./Balloons";
import type { ContestJson, ContestStateJson } from "./Contest";
import type { JudgementType } from "./JudgementTypes";
import type { Language } from "./Language";
import type { Print } from "./Print";
import type { Problem } from "./Problems";
import type {
  JudgementJson,
  SubmissionJson,
  SubmissionStateJson,
} from "./Submission";
import type { Account, Team } from "./Users";

export type EventFeed = {
  token: string;
  id: string;
} & (
  | { type: "contests"; data: ContestJson }
  | { type: "state"; data: ContestStateJson }
  | { type: "languages"; data: Language }
  | { type: "judgement-types"; data: JudgementType }
  | { type: "accounts"; data: Account }
  | { type: "teams"; data: Team }
  | { type: "submission"; data: SubmissionJson }
  | { type: "submission-state"; data: SubmissionStateJson }
  | { type: "judgements"; data: JudgementJson }
  | { type: "problems"; data: Problem }
  | { type: "prints"; data: Print }
  | { type: "balloons"; data: Balloon }
);
