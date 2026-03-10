
import { loginEndpoint, whoamiEndpoint } from "../Endpoints";
import type { WhoAmI } from "../types/data/WhoAmI";
import type { AuthInit, AuthLogin, AuthLogout } from "../types/WorkerIncoming";
import type { Answer, Broadcast, Send } from "./entry.worker";
import params from "./entry.worker";
import { setSessionIDOnGroups } from "./FeedHandlers";

let session_id: string | undefined = undefined;
let session_whoami : WhoAmI = { is_authenticated: false };

export function getSessionId () {
  return session_id;
}

export async function initHandler (_answer: Answer, broadcast: Broadcast, send: Send, message: AuthInit) {
  if (session_id !== undefined) {
    send({
      "type": "LOGIN_STORE",
      "session_id": session_id
    })

    send({
      "type": "WHOAMI",
      "content": session_whoami,
      "session": session_id
    })

    return ;
  }
  
  if (message.session_id) {
    const whoami_resp = await fetch(
      new URL(whoamiEndpoint(), params.apiHostname),
      { headers: { "X-Session-ID": message.session_id } } );
    
    session_whoami = await whoami_resp.json()
  } else {
    session_whoami = { "is_authenticated": false };
  }
  
  session_id = message.session_id;
  
  broadcast({
    "type": "WHOAMI",
    "content": session_whoami,
    "session": session_id
  })
  
  setSessionIDOnGroups(session_id);
}
export async function loginHandler (answer: Answer, broadcast: Broadcast, message: AuthLogin) {
  const url = new URL( loginEndpoint(), params.apiHostname );
  url.searchParams.append("username", message.username);
  url.searchParams.append("password", message.password);

  const response = await fetch(url);

  const json = await response.json();

  if (response.status !== 200) {
    answer({
      "type"    : "LOGIN_RESULT",
      "success" : false,
      "message" : json["message"]
    })

    return ;
  }

  let local_session_id = json["session_id"] as string;

  const whoami_resp = await fetch(
    new URL(whoamiEndpoint(), params.apiHostname),
    { headers: { "X-Session-ID": local_session_id } } );
  
  session_whoami = await whoami_resp.json()
  session_id     = local_session_id;

  answer({
    "type"    : "LOGIN_RESULT",
    "success" : true,
    "message" : "OK"
  })

  broadcast({
    "type": "LOGIN_STORE",
    "session_id": session_id
  })

  broadcast({
    "type": "WHOAMI",
    "content": session_whoami,
    "session": session_id
  })

  setSessionIDOnGroups(session_id);
}
export async function logoutHandler (_answer: Answer, broadcast: Broadcast, _message: AuthLogout) {
  session_id = undefined;
  session_whoami = { is_authenticated: false };
  
  broadcast({
    "type": "LOGIN_STORE",
    "session_id": undefined
  })
  
  broadcast({
    "type": "WHOAMI",
    "content": session_whoami,
    "session": session_id
  })

  setSessionIDOnGroups(session_id);
}
