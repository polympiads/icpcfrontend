
import { loginEndpoint, whoamiEndpoint } from "../Endpoints";
import type { WhoAmI } from "../types/data/WhoAmI";
import type { AuthInit, AuthLogin, AuthLogout } from "../types/WorkerIncoming";
import type { Answer, Broadcast, Send } from "./entry.worker";
import params from "./entry.worker";
import { setSessionIDOnGroups } from "./FeedHandlers";
import { SessionDB } from "./SessionDB";

export async function initHandler (_answer: Answer, _broadcast: Broadcast, send: Send, _message: AuthInit) {
  const { sessionId, whoami } = await SessionDB.getSessionInformation();

  send({
    "type": "WHOAMI",
    "content": whoami,
    "session": sessionId
  })
}
export async function loginHandler (answer: Answer, broadcast: Broadcast, message: AuthLogin) {
  const url = new URL( loginEndpoint(), params.apiHostname );
  url.searchParams.append("username", message.username);
  url.searchParams.append("password", message.password);

  const response = await fetch(url);

  const json = await response.json();
  console.log("LOGIN HANDLER", message, json)

  if (response.status !== 200) {
    answer({
      "type"    : "LOGIN_RESULT",
      "success" : false,
      "message" : json["message"]
    })

    return ;
  }

  let session_id = json["session_id"] as string;

  const whoami_resp = await fetch(
    new URL(whoamiEndpoint(), params.apiHostname),
    { headers: { "X-Session-ID": session_id } } );
  
  let session_whoami = await whoami_resp.json()
  
  await SessionDB.setSessionInformation(session_id, session_whoami)

  answer({
    "type"    : "LOGIN_RESULT",
    "success" : true,
    "message" : "OK"
  })

  broadcast({
    "type": "WHOAMI",
    "content": session_whoami,
    "session": session_id
  })

  setSessionIDOnGroups(session_id);
}
export async function logoutHandler (_answer: Answer, broadcast: Broadcast, _message: AuthLogout) {
  let session_id = undefined;
  let session_whoami: WhoAmI = { is_authenticated: false };
  
  await SessionDB.setSessionInformation(session_id, session_whoami)
  
  broadcast({
    "type": "WHOAMI",
    "content": session_whoami,
    "session": session_id
  })

  setSessionIDOnGroups(session_id);
}
