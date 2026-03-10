/// <reference lib="webworker" />

import type { WorkerIncoming } from "../types/WorkerIncoming";
import type { FullWorkerOutgoing, WorkerOutgoing } from "../types/WorkerOutgoing";
import type { WorkerParams } from "../types/WorkerParams";
import { initHandler, loginHandler, logoutHandler } from "./AuthHandlers";
import { closeHandler, listenHandler } from "./FeedHandlers";

declare const self: SharedWorkerGlobalScope;

const connections : MessagePort[] = []
const params      : WorkerParams = JSON.parse(self.name);

export type Answer    = (message: WorkerOutgoing | undefined) => void;
export type Broadcast = (message: WorkerOutgoing) => void;
export type Send      = (message: WorkerOutgoing) => void;

self.onconnect = (event: MessageEvent) => {
  for (let port of event.ports) {
    connections.push(port);
    port.start();
    
    port.onmessage = async (event: MessageEvent<WorkerIncoming>) => {
      let didAnswer : boolean = false;
      const broadcast = (message: WorkerOutgoing) => {
        const payload: FullWorkerOutgoing = {
          answerTo: undefined,
          content: message
        };

        for (let port of connections) {
          port.postMessage(payload);
        }
      }
      const send = (message: WorkerOutgoing) => {
        const fullMessage: FullWorkerOutgoing = {
          answerTo: undefined,
          content:  message
        };

        port.postMessage(fullMessage);
      };
      const answer = (message: WorkerOutgoing | undefined) => {
        if (didAnswer) {
          throw new Error("Can't answer to message twice.");
        }

        const fullMessage: FullWorkerOutgoing = {
          answerTo: event.data.hash as string,
          content:  message
        };

        port.postMessage(fullMessage);
        didAnswer = true;
      };

      try {
        switch (event.data.type) {
          case "LOGIN":
            await loginHandler(answer, broadcast, event.data);
            break;
          case "LOGIN_INIT":
            await initHandler(answer, broadcast, send, event.data);
            break;
          case "LOGOUT":
            await logoutHandler(answer, broadcast, event.data);
            break ;
          case "LISTEN_FEED":
            listenHandler(port, event.data);
            break ;
          case "CLOSE_FEED":
            closeHandler(event.data);
            break ;

          default:
            break;
        }
      } finally {
        if (!didAnswer) {
          answer(undefined);
        }
      }
    };
  }
}

export default params;
