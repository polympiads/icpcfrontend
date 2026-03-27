import { Show } from "solid-js";
import { UserPP } from "../components/user/UserPP";
import { useUserLoginContext } from "../contexts/UserLoginContext";
import { UserRole } from "../components/user/UserRole";

export function UserInfo() {
  const { user_info } = useUserLoginContext()
  
  return (
    <>
      <div class="w-75">
        <div class="flex flex-col items-center justify-center p-7">
          <div class="outline outline-black/10 rounded-md overflow-hidden shrink-0">
            <UserPP src={ undefined } variant="lg"/>
          </div>
          
          <div class="text-xl  wrap-anywhere mt-3">
            <Show when={ user_info()?.display_name != undefined }>
              {user_info()?.display_name}
            </Show>
            <Show when={ user_info()?.display_name == undefined }>
              @{user_info()?.username}
            </Show>
          </div>
          <div class="flex flex-row">
            <Show when={ user_info()?.display_name != undefined }>
              <div class="text-sm opacity-75 wrap-anywhere">
                <div>@{user_info()?.username}</div>
              </div>
              <Show when={user_info()?.is_staff}>
                •
              </Show>
            </Show>
            
            <Show when={user_info()?.is_staff}>
              <UserRole.Staff />
            </Show>
          </div>
        </div>
      </div>
    </>
  )
}