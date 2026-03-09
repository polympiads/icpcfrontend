
export type AuthLogin = {
  type: "LOGIN";

  username: string;
  password: string;
};

export type AuthLogout = {
  type: "LOGOUT";
};

export type AuthInit = {
  type: "LOGIN_INIT";

  session_id: string | undefined;
};

export type WorkerIncoming = (AuthLogin | AuthLogout | AuthInit) & {
  "hash"?: string
};
