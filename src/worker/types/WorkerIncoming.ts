
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
};

export type ListenToFeed = {
  type: "LISTEN_FEED";
  feed: string;
  handlerHash: string;
};
export type CloseFeed = {
  type: "CLOSE_FEED";
  feed: string;
  handlerHash: string;
};

export type WorkerIncoming = (AuthLogin | AuthLogout | AuthInit | ListenToFeed | CloseFeed) & {
  "hash"?: string
};
