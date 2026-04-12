export class ScoreBoardColor {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	toString() {
		return this.name;
	}

	isEqual(other: ScoreBoardColor) {
		return other === this;
	}
}

export const ACCEPTED = new ScoreBoardColor("ACCEPTED");
export const REJECTED = new ScoreBoardColor("REJECTED");
export const PENDING = new ScoreBoardColor("PENDING");
export const NONE = new ScoreBoardColor("NONE");

export interface ScoreboardProblemInfo {
	name: string;
	title: string;
	subtitle: string;
	color: ScoreBoardColor;
}

export interface ScoreboardTeamInfo {
	teamName: string;
	position: number;
	problem: ScoreboardProblemInfo[];
}

export interface ScoreBoard {
	[teamId: string]: ScoreboardTeamInfo;
}

export function equalScoreBoardColor(
	a: ScoreBoardColor,
	b: ScoreBoardColor,
): boolean {
	return a === b || a.name === b.name;
}

export function equalScoreboardProblemInfo(
	a: ScoreboardProblemInfo,
	b: ScoreboardProblemInfo,
): boolean {
	return (
		a.name === b.name &&
		a.title === b.title &&
		a.subtitle === b.subtitle &&
		equalScoreBoardColor(a.color, b.color)
	);
}

export function equalScoreboardTeamInfo(
	a: ScoreboardTeamInfo,
	b: ScoreboardTeamInfo,
): boolean {
	if (a.position !== b.position || a.teamName !== b.teamName) {
		return false;
	}

	if (a.problem.length !== b.problem.length) {
		return false;
	}

	for (let i = 0; i < a.problem.length; i++) {
		if (!equalScoreboardProblemInfo(a.problem[i], b.problem[i])) {
			return false;
		}
	}

	return true;
}

export function equalScoreBoard(a: ScoreBoard, b: ScoreBoard): boolean {
	const aKeys = Object.keys(a).sort();
	const bKeys = Object.keys(b).sort();

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	for (let i = 0; i < aKeys.length; i++) {
		if (aKeys[i] !== bKeys[i]) {
			return false;
		}

		if (!equalScoreboardTeamInfo(a[aKeys[i]], b[bKeys[i]])) {
			return false;
		}
	}

	return true;
}
