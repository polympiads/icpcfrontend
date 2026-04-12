import {
	createContext,
	createSignal,
	onCleanup,
	onMount,
	useContext,
	type JSX,
} from "solid-js";
import {
	parseContest,
	parseContestState,
	type Contest,
	type ContestState,
} from "../types/data/Contest";
import { useWorkerContext } from "./WorkerContext";
import type { WorkerOutgoing } from "../types/WorkerOutgoing";
import type { Language } from "../types/data/Language";
import type { JudgementType } from "../types/data/JudgementTypes";
import type { Account, Team } from "../types/data/Users";
import type { Problem } from "../types/data/Problems";
import type { Submission } from "../types/data/Submission";
import { v4 as uuidv4 } from "uuid";
import type { Print } from "../types/data/Print";
import type { Balloon } from "../types/data/Balloons";

interface FeedContextValue {
	// Contest Information
	contest?: Contest;
	contestState?: ContestState;

	// Static Information
	languages: { [key: string]: Language };
	judgementTypes: { [key: string]: JudgementType };

	// Users Information
	accounts: { [key: string]: Account };
	teams: { [key: string]: Team };

	// Contest content
	problems: { [key: string]: Problem };
	submissions: { [key: string]: Submission };

	prints: { [key: string]: Print };
	balloons: { [key: string]: Balloon };
}

const FeedContext = createContext<() => FeedContextValue>();

function defaultFeed(): FeedContextValue {
	return {
		contest: undefined,
		contestState: undefined,

		languages: {},
		judgementTypes: {},

		accounts: {},
		teams: {},

		problems: {},
		submissions: {},

		prints: {},
		balloons: {},
	};
}

export function copyFeed(feed: FeedContextValue) {
	return {
		contest: feed.contest,
		contestState: feed.contestState,

		// Static Information
		languages: { ...feed.languages },
		judgementTypes: { ...feed.judgementTypes },

		// Users Information
		accounts: { ...feed.accounts },
		teams: { ...feed.teams },

		// Contest content
		problems: { ...feed.problems },
		submissions: { ...feed.submissions },

		prints: { ...feed.prints },
		balloons: { ...feed.balloons },
	};
}
export function FeedProvider(props: {
	children?: JSX.Element;
	contestId: string;
}) {
	const workerContext = useWorkerContext();

	const [feed, setFeed] = createSignal<FeedContextValue>(defaultFeed());

	let unsubscribe: () => void = () => {};
	let listen_hash: string = uuidv4();
	let listen_feed: string = props.contestId;
	onMount(() => {
		listen_hash = uuidv4();

		unsubscribe = workerContext.subscribe((message: WorkerOutgoing) => {
			if (message.type == "FEED_CONTENT") {
				if (message.feed !== listen_feed) return;
				if (message.handlerHash !== listen_hash) return;

				const newFeed = copyFeed(feed());

				for (let content of message.content) {
					switch (content.type) {
						case "contests":
							newFeed.contest = parseContest(content.data);
							break;
						case "state":
							newFeed.contestState = parseContestState(content.data);
							break;
						case "languages":
							newFeed.languages[content.data.id] = content.data;
							break;
						case "judgement-types":
							newFeed.judgementTypes[content.data.id] = content.data;
							break;
						case "accounts":
							newFeed.accounts[content.data.id] = content.data;
							break;
						case "teams":
							newFeed.teams[content.data.id] = content.data;
							break;
						case "submission":
							newFeed.submissions[content.data.id] = content.data as Submission;
							break;
						case "submission-state":
							newFeed.submissions[content.data.submission_id] = {
								...newFeed.submissions[content.data.submission_id],
							};
							newFeed.submissions[content.data.submission_id].status =
								content.data.status;
							break;
						case "judgements":
							newFeed.submissions[content.data.submission_id] = {
								...newFeed.submissions[content.data.submission_id],
							};
							newFeed.submissions[
								content.data.submission_id
							].judgement_type_id = content.data.judgement_type_id;
							break;
						case "problems":
							newFeed.problems[content.data.id] = content.data;
							break;
						case "prints":
							newFeed.prints[content.data.id] = content.data;
							break;
						case "balloons":
							newFeed.balloons[content.data.id] = content.data;
							break;
					}
				}

				setFeed(newFeed);
			} else if (message.type == "RESET_FEED") {
				if (message.feed !== listen_feed) return;
				if (message.handlerHash !== listen_hash) return;

				setFeed(defaultFeed());
			}
		});

		workerContext.send({
			type: "LISTEN_FEED",
			feed: listen_feed,
			handlerHash: listen_hash,
		});
	});
	onCleanup(() => {
		workerContext.send({
			type: "CLOSE_FEED",
			feed: listen_feed,
			handlerHash: listen_hash,
		});

		unsubscribe();
	});

	return (
		<FeedContext.Provider value={feed}>{props.children}</FeedContext.Provider>
	);
}

export function useFeed() {
	const ctx = useContext(FeedContext);

	if (!ctx) {
		throw new Error("useFeed should be used inside a FeedProvider");
	}

	return ctx;
}
