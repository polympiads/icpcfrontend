import { createContext, createSignal, onCleanup, onMount, useContext, type ParentComponent } from "solid-js";
import { useWorkerContext, type WorkerContextValue } from "./WorkerContext";
import type { WorkerOutgoing } from "../types/WorkerOutgoing";
import { areWhoAmIEqual, type WhoAmI } from "../types/data/WhoAmI";

interface AuthContextValue {
  whoami  : () => WhoAmI,
  session : () => string | undefined,
  login   : (username: string, password: string) => Promise<string | undefined>;
  logout  : () => void;
};

const AuthContext = createContext<AuthContextValue>();

const STORAGE_SESSION_ITEM = "session_id";
const STORAGE_WHOAMI_ITEM  = "whoami";

function getSession () {
  let currentSession: string | null = localStorage.getItem(STORAGE_SESSION_ITEM)

  let trueSession: string | undefined = undefined;
  if (currentSession !== null) {
    trueSession = currentSession;
  }

  return trueSession;
}
function loadSession (workerContext: WorkerContextValue) {
  workerContext.send({
    "type": "LOGIN_INIT"
  })
}

export const AuthProvider: ParentComponent = (props) => {
  const workerContext = useWorkerContext();
  onMount(() => loadSession(workerContext));

  function loadWhoAmI (): WhoAmI {
    const content = localStorage.getItem(STORAGE_WHOAMI_ITEM)
    if (content === null) {
      return { is_authenticated: false };
    }

    return JSON.parse(content) as WhoAmI;
  }

  const [session, setSession] = createSignal<string | undefined>(
    getSession(),
    { equals: (x1, x2) => x1 == x2 }
  );
  const [whoami, setWhoAmIRaw] = createSignal<WhoAmI>(
    loadWhoAmI(),
    { equals: areWhoAmIEqual }
  );
  function setWhoAmI (content: WhoAmI, session_id: string | undefined) {
    localStorage.setItem(STORAGE_WHOAMI_ITEM, JSON.stringify(content))
    
    if (session_id !== undefined) {
      localStorage.setItem(STORAGE_SESSION_ITEM, session_id)
    } else localStorage.removeItem(STORAGE_SESSION_ITEM);
    
    setSession(session_id);
    setWhoAmIRaw(content);
  }

  const context: AuthContextValue = {
    whoami  : whoami,
    session : session,
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
      if (msg.type == "WHOAMI") {
        setWhoAmI(msg.content, msg.session);
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

export function headerFromSession (sessionId: string | undefined) {
  const headers: { [key: string]: string }
    = sessionId !== undefined
    ? { "X-Session-ID" : sessionId }
    : {};

  return headers;
}

export function useAuth () {
  const ctx = useContext(AuthContext);
  
  if (!ctx) {
    throw new Error("useAuth should be used inside an AuthProvider");
  }

  return ctx;
}
