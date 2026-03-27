import { type Accessor } from "solid-js";
import { useAuth } from "../worker/context/AuthContext";
import type { WhoAmI_Auth } from "../worker/types/data/WhoAmI";

// function sleep(ms: number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms)
//   })
// }

// class MockAuthContext {
//   whoami: Accessor<WhoAmI>
//   private setWhoAmI: Setter<WhoAmI>
//   session: Accessor<string | undefined>
//   private setSession: Setter<string | undefined>
  
//   constructor() {
//     [this.whoami, this.setWhoAmI] = createSignal<WhoAmI>({ is_authenticated: false });
//     [this.session, this.setSession] = createSignal()
//   }
  
//   async login(username: string, password: string): Promise<string | undefined> {
//     await sleep(5000)
    
//     if (username == "username" && password == "password") {
//       this.setWhoAmI({
//         is_authenticated: true,
//         username: "username",
//         is_staff: true
//       })
//       return
//     } else {
//       return "error"
//     }
//   }
//   logout() {
//     this.setSession(undefined)
//     this.setWhoAmI({ is_authenticated: false })
//   }
// }

// const MOCK_AUTH = new MockAuthContext()

type UserContext = {
  is_authenticated: Accessor<boolean>,
  user_info: Accessor<WhoAmI_Auth | undefined>
  session: Accessor<string | undefined>,
  login: (username: string, password: string) => Promise<string | void>
  logout: () => void
}

export function useUserLoginContext(): UserContext {
  const { whoami, login, logout, session } = useAuth()
  return {
    is_authenticated: () => whoami().is_authenticated,
    user_info: () => (whoami().is_authenticated ? whoami() as WhoAmI_Auth : undefined),
    session: session,
    login: login,
    logout: logout,
  }
}