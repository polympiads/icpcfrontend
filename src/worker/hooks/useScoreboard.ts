import { createMemo, createSignal, onCleanup } from "solid-js";
import { useProblems } from "./useProblems";
import { useTeams } from "./useUsers";
import { useSubmissions } from "./useSubmissions";
import { useJudgementTypes } from "./useJudgementTypes";
import {
	ACCEPTED,
	NONE,
	PENDING,
	REJECTED,
	type ScoreBoard,
	type ScoreboardProblemInfo,
	type ScoreboardTeamInfo,
	type ScoreBoardColor,
	equalScoreBoard,
} from "../types/data/scoreboard";
import { parseSubmission, type Submission } from "../types/data/Submission";
import type { JudgementType } from "../types/data/JudgementTypes";
import { useRawFeed } from "../context/FeedContext";
import type { EventFeed } from "../types/data/EventFeed";
import type { Account } from "../types/data/Users";
import duration from 'dayjs/plugin/duration';
import dayjs from "dayjs";

function computeProblemColor(
	submissions    : { judgement_type_id?: string }[],
	judgementTypes : { [key: string]: JudgementType },
): ScoreBoardColor {
	if (submissions.length === 0) return NONE;

	const anyAccepted = submissions.some((s) => {
		if (s.judgement_type_id === undefined) return false;

		const jt = judgementTypes[s.judgement_type_id];
		return jt?.solved;
	});

	if (anyAccepted) return ACCEPTED;

	const last = submissions[submissions.length - 1];
	const lastType = last.judgement_type_id && judgementTypes[last.judgement_type_id];

	if (!last.judgement_type_id || !lastType) return PENDING;

	return lastType.solved ? ACCEPTED : REJECTED;
}

function emptyScoreboard (): ScoreBoard {
	return {};
}

function computeFromSubmissions (label: string, submissions: {
		submission  : Submission,
		judgement  ?: JudgementType
	}[]): ScoreboardProblemInfo {
	if (submissions.length == 0) return {
		"name": label,
		"color": NONE,
		"subtitle": "",
		"title": "-",
		"addedScore": 0,
		"addedPenalty": dayjs.duration({})
	}

	const penaltyFault = dayjs.duration({ minutes: 20 });
	let basePenalty = dayjs.duration({});
	let nbK = 0;
	for (let { submission, judgement } of submissions) {
		if (judgement?.penalty) {
			basePenalty = basePenalty.add(penaltyFault);
			nbK ++;
		} else if (judgement?.solved) {
			return {
				"name": label,
				"color": ACCEPTED,
				"title": nbK == 0 ? "+" : `+${nbK}`,
				"subtitle": `+${submission.contest_time.hours()}:${submission.contest_time.minutes()}`,
				"addedScore": 1,
				"addedPenalty": basePenalty.add(submission.contest_time)
			};
		}
	}

	
	for (let { submission, judgement } of submissions) {
		if (judgement === undefined) {
			return {
				"name": label,
				"addedScore": 0,
				"addedPenalty": dayjs.duration({}),
				"color": PENDING,
				"subtitle": "",
				"title": `-${nbK}`
			}
		}
	}
	
	return {
		"name": label,
		"color": REJECTED,
		"addedScore": 0,
		"addedPenalty": dayjs.duration({}),
		"subtitle": "",
		"title": `-${nbK}`
	}
}

export function useScoreboard() {
	const rawFeed = useRawFeed();
	
	const [scoreboard, setScoreboard] = createSignal(emptyScoreboard());

	const accounts    : { [key: string]: Account    } = {};
	const submissions : { [key: string]: Submission } = {};

	const unsubscribe = rawFeed.subscribe((samples: EventFeed[] | undefined) => {
		if (samples === undefined) {
			setScoreboard(emptyScoreboard());
			return ;
		}

		if (samples.find(x => x["type"] == "submission"
			                 || x["type"] == "judgements"
											 || x["type"] == "accounts"
											 || x["type"] == "teams"
											 || x["type"] == "problems") === undefined) {
			return ;
		}

		const newScoreboard = { ...scoreboard() };
		const problemLabels: string[] = [];
		const idToLabel: { [key: string] : string } = {};

		const loc: { [key: string]: { tid: string, pid: string, idx: number } } = {};

		let team: ScoreboardTeamInfo;
		for (let sample of samples) {
			switch (sample.type) {
				case "accounts":
					accounts[sample.data.id] = sample.data;
					team = newScoreboard[sample.data.id];
					if (team !== undefined) {
						team.teamName = sample.data.name;
					}
					break ;
				case "teams":
					team = newScoreboard[sample.data.id];
					if (team === undefined) {
						newScoreboard[sample.data.id] = {
							"position" : -1,
							"teamName" : "",
							"submissions" : {},
							"problem"  : problemLabels.map((label: string) => {
								return computeFromSubmissions(label, [])
							})
						}
					}

					newScoreboard[sample.data.id].teamName = accounts[sample.data.id]?.name!;
					
					break ;
				case "problems":
					const newLabel = sample.data.label;
					const newId = sample.data.id;
					if (idToLabel[newId] === undefined) {
						idToLabel[newId] = newLabel;
						
						for (let team of Object.values(newScoreboard)) {
							team.problem.push(computeFromSubmissions(newLabel, []))
						}
					}

					break ;
				case "submission":
					if (sample.data.team_id) {
						if (newScoreboard[sample.data.team_id].submissions[sample.data.problem_id] === undefined) {
							newScoreboard[sample.data.team_id].submissions[sample.data.problem_id] = [];
						}
						loc[sample.data.id] = {
							"idx": newScoreboard[sample.data.team_id].submissions[sample.data.problem_id].length,
							"tid": sample.data.team_id,
							"pid": sample.data.problem_id
						}
						newScoreboard[sample.data.team_id].submissions[sample.data.problem_id].push({
							submission: parseSubmission(sample.data)
						})

						
					}

					break ;
			}

			setScoreboard(newScoreboard);
		}
	});

	onCleanup(() => unsubscribe());

	return scoreboard;
}
