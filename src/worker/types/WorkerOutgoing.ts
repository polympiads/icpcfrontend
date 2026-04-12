import type { EventFeed } from "./data/EventFeed";
import type { WhoAmI } from "./data/WhoAmI";

export type LoginResult = {
	type: "LOGIN_RESULT";

	success: boolean;
	message: string;
};

export type WhoAmIResult = {
	type: "WHOAMI";

	content: WhoAmI;
	session: string | undefined;
};

export type FeedContent = {
	type: "FEED_CONTENT";

	content: EventFeed[];
	feed: string;
	handlerHash: string;
};
export type ResetFeed = {
	type: "RESET_FEED";

	feed: string;
	handlerHash: string;
};

export type WorkerOutgoing =
	| LoginResult
	| WhoAmIResult
	| FeedContent
	| ResetFeed;

export type FullWorkerOutgoing =
	| {
			answerTo: string;

			content: WorkerOutgoing | undefined;
	  }
	| {
			answerTo: undefined;
			content: WorkerOutgoing;
	  };
