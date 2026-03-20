import { createContext, onCleanup, onMount, useContext, type JSX } from "solid-js";
import { parseContest, parseContestState, type Contest, type ContestState } from "../types/data/Contest";
import { createStore, reconcile } from "solid-js/store";
import { useWorkerContext } from "./WorkerContext";
import type { WorkerOutgoing } from "../types/WorkerOutgoing";
import type { Language } from "../types/data/Language";
import type { JudgementType } from "../types/data/JudgementTypes";
import type { Account, Team } from "../types/data/Users";
import type { Problem } from "../types/data/Problems";
import type { Submission } from "../types/data/Submission";
import { v4 as uuidv4 } from "uuid";

interface FeedContextValue {
  // Contest Information
  contest      ?: Contest;
  contestState ?: ContestState;

  // Static Information
  languages:      { [key: string]: Language };
  judgementTypes: { [key: string]: JudgementType };

  // Users Information
  accounts:    { [key: string]: Account };
  teams:       { [key: string]: Team };

  // Contest content
  problems:    { [key: string]: Problem };
  submissions: { [key: string]: Submission };
};

const FeedContext = createContext<FeedContextValue>();

function defaultFeed (): FeedContextValue {
  return {
    contest:      undefined,
    contestState: undefined,

    languages:      {},
    judgementTypes: {},

    accounts: {},
    teams:    {},

    problems:    {},
    submissions: {}
  }
}
export function FeedProvider (props: { children ?: JSX.Element, contestId: string }) {
  const workerContext = useWorkerContext();

  const [feed, setFeed] = createStore<FeedContextValue>(defaultFeed());

  let unsubscribe: () => void = () => {};
  let listen_hash: string = uuidv4();
  let listen_feed: string = props.contestId;
  onMount(() => {
    listen_hash = uuidv4();

    unsubscribe = workerContext.subscribe((message: WorkerOutgoing) => {
      if (message.type == "FEED_CONTENT") {
        if (message.feed !== listen_feed) return ;
        if (message.handlerHash !== listen_hash) return ;

        switch (message.content.type) {
          case "contests":
            setFeed("contest", reconcile( parseContest(message.content.data) ));
            break;
          case "state":
            setFeed("contestState", reconcile( parseContestState(message.content.data) ));
            break;
          case "languages":
            setFeed("languages", message.content.data.id, message.content.data);
            break;
          case "judgement-types":
            setFeed("judgementTypes", message.content.data.id, message.content.data);
            break;
          case "accounts":
            setFeed("accounts", message.content.data.id, message.content.data);
            break ;
          case "teams":
            setFeed("teams", message.content.data.id, message.content.data);
            break ;
          case "submission":
            setFeed("submissions", message.content.data.id, message.content.data);
            break ;
          case "submission-state":
            setFeed("submissions", message.content.data.submission_id, "status", message.content.data.status);
            break ;
          case "judgements":
            setFeed("submissions", message.content.data.submission_id, "judgement_type_id", message.content.data.judgement_type_id);
            break ;
          case "problems":
            setFeed("problems", message.content.data.id, message.content.data);
            break ;
        }
      } else if (message.type == "RESET_FEED") {
        if (message.feed !== listen_feed) return ;
        if (message.handlerHash !== listen_hash) return ;

        setFeed(defaultFeed());
      }
    });

    workerContext.send({
      "type": "LISTEN_FEED",
      "feed": listen_feed,
      "handlerHash": listen_hash
    })
  })
  onCleanup(() => {
    workerContext.send({
      "type": "CLOSE_FEED",
      "feed": listen_feed,
      "handlerHash": listen_hash
    })

    unsubscribe()
  });

  return (
    <FeedContext.Provider value={feed}>
      { props.children }
    </FeedContext.Provider>
  )
}

export function useFeed () {
  const ctx = useContext(FeedContext);
  
  if (!ctx) {
    throw new Error("useFeed should be used inside a FeedProvider");
  }

  return ctx;
}
