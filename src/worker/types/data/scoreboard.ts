
export class ScoreBoardColor {
  name: string

  constructor(name: string) {
    this.name = name;
  }

  toString() {
    return this.name;
  }

  isEqual(other: ScoreBoardColor) {
    return other === this 
  }
}

export const ACCEPTED = new ScoreBoardColor("ACCEPTED")
export const REJECTED = new ScoreBoardColor("REJECTED")
export const PENDING = new ScoreBoardColor("PENDING")
export const NONE = new ScoreBoardColor("NONE")

import duration from 'dayjs/plugin/duration';
import type { JudgementJson, Submission } from './Submission';
import type { JudgementType } from './JudgementTypes';

export interface ScoreboardCell {
  submissions : { [key: string]: Submission };
  judgements  : { [key: string]: JudgementType };

  
};

export interface ScoreboardGrid {
  team_ids:    string[];
  problem_ids: string[];

  submissions: { [key: string]: Submission };
  cells: { [key: string]: ScoreboardCell };
};

export function cellUuid (grid: ScoreboardGrid, team_id: string, problem_id: string) {
  const uuid = `${team_id}-${problem_id}`;

  if (grid.cells[uuid] === undefined) {
    grid.cells[uuid] = {
      submissions: {},
      judgements : {}
    }
  }

  return uuid;
}

export function refreshCell (cell: ScoreboardCell) {
  const sortedSubmissions = Object.values(cell.submissions).sort((x1, x2) => Number(x1.id) - Number(x2.id))

  for (let submission of sortedSubmissions) {
    if (submission.account_id )
  }
}

export function pushSubmission (grid: ScoreboardGrid, submission: Submission) {
  const cell = grid.cells[cellUuid(grid, submission.team_id!, submission.problem_id)];

  cell.submissions[submission.id] = submission;
  grid.submissions[submission.id] = submission;
}
export function pushJudgement (grid: ScoreboardGrid, submission_id: string, judgement: JudgementType) {
  const submission = grid.submissions[submission_id];

  const cell = grid.cells[cellUuid(grid, submission.team_id!, submission.problem_id)];
  cell.judgements[submission_id] = judgement;

  refreshCell(cell);
}
