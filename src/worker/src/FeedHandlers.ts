import { v4 as uuidv4 } from "uuid";
import { feedEndpoint } from "../Endpoints";
import type { EventFeed } from "../types/data/EventFeed";
import type { CloseFeed, ListenToFeed } from "../types/WorkerIncoming";
import type {
  FullWorkerOutgoing,
  WorkerOutgoing,
} from "../types/WorkerOutgoing";
import params from "./entry.worker";
import { NDJsonReader } from "./NDJsonReader";
import { SessionDB } from "./SessionDB";

function outcomingMessageFromFeed(
  feed: string,
  hash: string,
  feedObject: EventFeed[],
) {
  const message: WorkerOutgoing = {
    type: "FEED_CONTENT",
    feed: feed,
    handlerHash: hash,
    content: feedObject,
  };
  const fullMessage: FullWorkerOutgoing = {
    answerTo: undefined,
    content: message,
  };

  return fullMessage;
}
function resetFeedMessage(feed: string, hash: string) {
  const message: WorkerOutgoing = {
    type: "RESET_FEED",
    feed: feed,
    handlerHash: hash,
  };
  const fullMessage: FullWorkerOutgoing = {
    answerTo: undefined,
    content: message,
  };

  return fullMessage;
}

class FeedGroup {
  feed: string;

  feedCache: EventFeed[] = [];
  listeners: Map<string, MessagePort> = new Map();

  localSessionId: string | undefined;
  reader: NDJsonReader<EventFeed> | undefined;

  constructor(feed: string, sessionId: string | undefined) {
    this.feed = feed;
    this._setSessionIdRaw(sessionId, true);
  }

  _setSessionIdRaw(sessionId: string | undefined, forcedReset: boolean) {
    if (this.feed.endsWith(":noauth")) {
      sessionId = undefined;
    }

    if (this.localSessionId !== sessionId || forcedReset) {
      const toRemove: string[] = [];
      for (const [hash, port] of this.listeners.entries()) {
        try {
          port.postMessage(resetFeedMessage(this.feed, hash));
        } catch (e) {
          toRemove.push(hash);
        }
      }

      for (const hash of toRemove) {
        this.removeListener(hash);
      }

      if (this.reader) {
        this.reader.close();
        this.reader = undefined;
      }
      this.localSessionId = sessionId;
      this.reader = new NDJsonReader((feed: EventFeed[]) => {
        this.onEventFeed(feed);
      });

      const headers: { [key: string]: string } =
        sessionId !== undefined ? { "X-Session-ID": sessionId } : {};
      const url = new URL(feedEndpoint(this.feed), params.apiHostname);
      this.reader.streamFromEndpointAndReconnect(url.toString(), () => true, {
        headers: headers,
      });
    }
  }
  setSessionId(sessionId: string | undefined) {
    this._setSessionIdRaw(sessionId, false);
  }

  deletionHash: string = "";
  tryDelete(callback: () => void, timeout: number) {
    if (this.listeners.size !== 0) {
      return;
    }

    const hash = uuidv4();

    this.deletionHash = hash;

    setTimeout(() => {
      if (this.deletionHash !== hash) return;
      if (this.listeners.size !== 0) {
        return;
      }

      this.reader?.close();
      this.reader = undefined;
      callback();
    }, timeout);
  }

  onEventFeed(eventFeed: EventFeed[]) {
    this.feedCache.push(...eventFeed);
    const toRemove: string[] = [];
    for (const [hash, port] of this.listeners) {
      try {
        port.postMessage(outcomingMessageFromFeed(this.feed, hash, eventFeed));
      } catch (e) {
        toRemove.push(hash);
      }
    }

    for (const hash of toRemove) this.removeListener(hash);
  }
  addListener(hash: string, port: MessagePort) {
    try {
      port.postMessage(
        outcomingMessageFromFeed(this.feed, hash, this.feedCache),
      );

      this.listeners.set(hash, port);
    } catch (exception) {}
  }
  removeListener(hash: string) {
    this.listeners.delete(hash);
  }
}

const groups: Map<string, FeedGroup> = new Map();

export async function listenHandler(port: MessagePort, message: ListenToFeed) {
  if (!groups.has(message.feed)) {
    groups.set(
      message.feed,
      new FeedGroup(
        message.feed,
        (await SessionDB.getSessionInformation()).sessionId,
      ),
    );
  }

  groups.get(message.feed)?.addListener(message.handlerHash, port);
}
export function closeHandler(message: CloseFeed) {
  groups.get(message.feed)?.removeListener(message.handlerHash);
}
export function setSessionIDOnGroups(sessionId: string | undefined) {
  for (const [_feed, group] of groups.entries()) {
    group.setSessionId(sessionId);
  }
}
