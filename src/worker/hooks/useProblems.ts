import {
	type Accessor,
	createMemo,
	createResource,
} from "solid-js";
import { headerFromSession, useAuth } from "../context/AuthContext";
import { useFeed } from "../context/FeedContext";
import { useWorkerContext } from "../context/WorkerContext";
import { problemDictsEquals, problemEquals } from "../types/data/Problems";

export function useProblems() {
	const feed = useFeed();

	return createMemo(
		() => {
			return feed().problems;
		},
		undefined,
		{
			equals: problemDictsEquals,
		},
	);
}
export function useProblem(problemId: string) {
	const feed = useFeed();

	return createMemo(
		() => {
			return feed().problems[problemId];
		},
		undefined,
		{
			equals: problemEquals,
		},
	);
}

export function useStatement(problemId: Accessor<string>) {
	const problem = useProblems();
	const auth = useAuth();
	const { apiEndpoint } = useWorkerContext();

	return createResource(
		() => ({
			problem: problem()[problemId()],
			session: auth.session(),
			_problemId: problemId(),
		}),
		async ({ problem, session }) => {
			console.log(problem);
			if (problem === undefined) return undefined;

			const response = await fetch(apiEndpoint(problem.statement[0].href), {
				headers: headerFromSession(session),
			});
			return response.blob().then((b) => b.arrayBuffer());
		},
	);
}
