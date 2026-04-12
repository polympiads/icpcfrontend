import { dictsEqual } from "./List";

export type JudgementType = {
	id: string;
	name: string;

	penalty: boolean;
	solved: boolean;
};

export function judgementTypeEquals(
	j1: JudgementType | undefined,
	j2: JudgementType | undefined,
) {
	if (j1 === undefined && j2 === undefined) return true;
	if (j1 === undefined || j2 === undefined) return false;

	return (
		j1.id == j2.id &&
		j1.name == j2.name &&
		j1.penalty == j2.penalty &&
		j1.solved == j2.solved
	);
}
export function judgementTypeDictsEquals(
	j1: { [key: string]: JudgementType },
	j2: { [key: string]: JudgementType },
) {
	return dictsEqual(j1, j2, judgementTypeEquals);
}
