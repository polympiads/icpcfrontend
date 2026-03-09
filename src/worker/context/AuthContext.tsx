import { createContext, createSignal, onCleanup, onMount, useContext, type ParentComponent } from "solid-js";
import { useWorkerContext, type WorkerContextValue } from "./WorkerContext";
import type { WorkerOutgoing } from "../types/WorkerOutgoing";
import { type WhoAmI } from "../types/data/WhoAmI";

interface AuthContextValue {
  whoami : () => WhoAmI,
  login  : (username: string, password: string) => Promise<string | undefined>;
  logout : () => void;
};

const AuthContext = createContext<AuthContextValue>();

const STORAGE_SESSION_ITEM = "session_id";

function loadSession (workerContext: WorkerContextValue) {
  let currentSession: string | undefined | null = localStorage.getItem(STORAGE_SESSION_ITEM)
  if (currentSession === null)
    currentSession = undefined;
  
  workerContext.send({
    "type": "LOGIN_INIT",
    "session_id": currentSession
  })
}

export const AuthProvider: ParentComponent = (props) => {
  const workerContext = useWorkerContext();
  onMount(() => loadSession(workerContext));

  const [whoami, setWhoAmI] = createSignal<WhoAmI>({ is_authenticated: false });

  const context: AuthContextValue = {
    whoami : whoami,
    login : async (username: string, password: string) => {
      const promise = workerContext.send({
        "type": "LOGIN",

        "username": username,
        "password": password
      })

      const result = await promise;
      if (result?.type !== "LOGIN_RESULT") {
        throw new Error("Received wrong answer from worker.");
      }

      if (!result.success) {
        return result.message;
      }
    },
    logout : () => {
      workerContext.send({
        "type": "LOGOUT"
      })
    }
  };

  let unsubscribe: () => void = () => {};
  onMount (() => {
    unsubscribe = workerContext.subscribe((msg: WorkerOutgoing) => {
      if (msg.type == "LOGIN_STORE") {
        if (msg.session_id === undefined) {
          localStorage.removeItem(STORAGE_SESSION_ITEM);
        } else {
          localStorage.setItem(STORAGE_SESSION_ITEM, msg.session_id);
        }
      } else if (msg.type == "WHOAMI") {
        setWhoAmI(msg.content);
      }
    })
  })
  onCleanup(() => unsubscribe())

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  );
};

export function useAuth () {
  const ctx = useContext(AuthContext);
  
  if (!ctx) {
    throw new Error("useAuth should be used inside an AuthProvider");
  }

  return ctx;
}
