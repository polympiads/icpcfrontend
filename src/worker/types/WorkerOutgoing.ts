import type { WhoAmI } from "./data/WhoAmI";

export type LoginResult = {
  type: "LOGIN_RESULT";

  success: boolean;
  message: string;
};

export type StoreSession = {
  type: "LOGIN_STORE";

  session_id: string | undefined;
};

export type WhoAmIResult = {
  type: "WHOAMI";

  content: WhoAmI;
};

export type WorkerOutgoing = LoginResult | StoreSession | WhoAmIResult;

export type FullWorkerOutgoing = {
  answerTo : string;

  content: WorkerOutgoing | undefined;
} | {
  answerTo: undefined;
  content: WorkerOutgoing
};
