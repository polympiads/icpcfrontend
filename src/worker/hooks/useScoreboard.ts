import { createMemo } from "solid-js";
import type { JudgementType } from "../types/data/JudgementTypes";
import type { Submission } from "../types/data/Submission";
import {
	ACCEPTED,
	equalScoreBoard,
	NONE,
	PENDING,
	REJECTED,
	type ScoreBoard,
	type ScoreBoardColor,
	type ScoreboardProblemInfo,
	type ScoreboardTeamInfo,
} from "../types/data/scoreboard";
import { useJudgementTypes } from "./useJudgementTypes";
import { useProblems } from "./useProblems";
import { useSubmissions } from "./useSubmissions";
import { useTeams } from "./useUsers";

function computeProblemColor(
	submissions: { judgement_type_id?: string }[],
	judgementTypes: { [key: string]: JudgementType },
): ScoreBoardColor {
	if (submissions.length === 0) return NONE;

	const anyAccepted = submissions.some((s) => {
		const jt = s.judgement_type_id !== undefined ? judgementTypes[s.judgement_type_id] : undefined;
		return jt?.solved;
	});
	if (anyAccepted) return ACCEPTED;

	const last = submissions[submissions.length - 1];
	const lastType =
		last.judgement_type_id && judgementTypes[last.judgement_type_id];

	if (!last.judgement_type_id || !lastType) return PENDING;

	return lastType.solved ? ACCEPTED : REJECTED;
}

export function useScoreboard() {
	const problems = useProblems();
	const teams = useTeams();
	const submissions = useSubmissions();
	const judgementTypes = useJudgementTypes();

	return createMemo<ScoreBoard>(
		() => {
			const problemsList = Object.values(problems());
			const teamsList = Object.values(teams());

			const submissionsByTeam = Object.values(submissions()).reduce(
				(acc, submission) => {
					if (!submission.team_id) return acc;
					if (!acc[submission.team_id]) acc[submission.team_id] = [];
					acc[submission.team_id].push(submission);
					return acc;
				},
				{} as { [teamId: string]: Submission[] },
			);

			const scoreboard: ScoreBoard = {};

			teamsList.forEach((team, idx) => {
				const teamSubs = submissionsByTeam[team.id] ?? [];

				const problemInfos: ScoreboardProblemInfo[] = problemsList.map((p) => {
					const subsForProblem = teamSubs.filter((s) => s.problem_id === p.id);

					const color = computeProblemColor(subsForProblem, judgementTypes());

					let title: string;
					if (subsForProblem.length === 0) {
						title = "-";
					} else {
						const acceptedIndex = subsForProblem.findIndex((s) => {
							const jt =
								s.judgement_type_id !== undefined ? judgementTypes()[s.judgement_type_id] : undefined;
							return jt?.solved;
						});
						if (acceptedIndex !== -1) {
							title = `+${acceptedIndex + 1}`;
						} else {
							title = `-${subsForProblem.length}`;
						}
					}

					const subtitle = "TODO";
					const name = p.label ?? p.id;

					return {
						name,
						title,
						subtitle,
						color,
					} satisfies ScoreboardProblemInfo;
				});

				const teamInfo: ScoreboardTeamInfo = {
					teamName: team.display_name ?? team.name,
					position: idx + 1,
					problem: problemInfos,
				};

				scoreboard[team.id] = teamInfo;
			});

			return scoreboard;
		},
		{ },
		{ equals: equalScoreBoard },
	);
}
