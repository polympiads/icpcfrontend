import { createContext, onCleanup, onMount, useContext, type JSX } from "solid-js";
import type { WorkerListener } from "../types/Listener";
import type { WorkerIncoming } from "../types/WorkerIncoming";

import SharedWorkerFactory from "../src/entry.worker.ts?sharedworker";
import type { FullWorkerOutgoing, WorkerOutgoing } from "../types/WorkerOutgoing";
import type { WorkerParams } from "../types/WorkerParams";

export interface WorkerContextValue {
  apiHostname : string;
  apiEndpoint : (path: string) => URL;

  send      : (msg: WorkerIncoming) => Promise<WorkerOutgoing | undefined>;
  subscribe : (listener: WorkerListener) => () => void;
};

const WorkerContext = createContext<WorkerContextValue>();

export const WorkerProvider = (props: {
          children    ?: JSX.Element,
          apiHostname : string
      }) => {
  let port : MessagePort | undefined = undefined;

  const listeners        : Set<WorkerListener> = new Set();
  const pendingCallbacks : Map<string, (value: WorkerOutgoing | undefined) => void> = new Map();

  onMount(() => {
    const params: WorkerParams = {
      apiHostname: props.apiHostname
    };

    const worker = new SharedWorkerFactory({
      name: JSON.stringify(params)
    });

    port = worker.port;
  
    port.onmessage = (event: MessageEvent<FullWorkerOutgoing>) => {
      console.log(event.data)
      if (event.data.answerTo !== undefined) {
        const resolve = pendingCallbacks.get(event.data.answerTo);
        if (resolve) {
          resolve(event.data.content);
          pendingCallbacks.delete(event.data.answerTo);
        }
      } else {
        for (const listener of listeners) {
          listener(event.data.content);
        }
      }
    };
  });
  onCleanup(() => {
    port?.close();
  })

  const context: WorkerContextValue = {
    apiHostname: props.apiHostname,
    apiEndpoint: (path: string) => {
      return new URL(props.apiHostname + path);
    },

    send : (message: WorkerIncoming) => {
      const uuid = crypto.randomUUID();
      message["hash"] = uuid;

      const promise = new Promise<WorkerOutgoing | undefined>((resolve, _reject) => {
        pendingCallbacks.set(uuid, resolve);
      });

      port?.postMessage(message);

      return promise;
    }, subscribe : (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener);
    },
 }

  return (
    <WorkerContext.Provider value={context}>
      {props.children}
    </WorkerContext.Provider>
  );
};

export function useWorkerContext () {
  const ctx = useContext(WorkerContext);
  
  if (!ctx) {
    throw new Error("useWorkerContext should be used inside a WorkerProvider");
  }

  return ctx;
}
