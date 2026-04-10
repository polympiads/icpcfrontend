import { Button } from "@kobalte/core/button";
import { Popover } from "@kobalte/core/popover";
import { TextField } from "@kobalte/core/text-field";
import { LogIn, LogOut } from "lucide-solid";
import { CgPassword } from "solid-icons/cg";
import { FaSolidUserAlt, FaSolidUserAltSlash } from "solid-icons/fa";
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { useAuth } from "./worker/context/AuthContext";
import type { WhoAmI_Auth } from "./worker/types/data/WhoAmI";
import { SingleTaskHandler } from "./taskManager";
import { LoadingAnimation } from "./LoadingAnimation";
import { BsExclamationCircle } from "solid-icons/bs";

let LOGIN_TASK: SingleTaskHandler<string | undefined> | undefined;

function getLoginTask() {
  if (!LOGIN_TASK) {
    LOGIN_TASK = new SingleTaskHandler<string | undefined>()
  }
  return LOGIN_TASK
}

export function UserLoginWidget() {
  const { whoami, login, logout } = useAuth()
  const loginTaskHandler = getLoginTask()

  let usernameInput!: HTMLInputElement;
  let passwordInput!: HTMLInputElement;

  const isLogging = loginTaskHandler.isRunning;
  const [loginFailedReason, setLoginFailedReason] = createSignal<string>();
  const textInputValidationState = () => loginFailedReason() !== undefined ? 'invalid' : 'valid';

  const userInfo = createMemo(() => whoami().is_authenticated ? whoami() as WhoAmI_Auth : undefined)

  function onError() {
    setLoginFailedReason("An error occured during login.")
  }

  function onLoginResult(result: string | undefined) {
    if (result) {
      setLoginFailedReason("Invalid credentials.")
    } else {
      setLoginFailedReason(undefined)
    }
  }

  onMount(() => {
    loginTaskHandler.registerOnError(onError)
    loginTaskHandler.registerOnResult(onLoginResult)

    if (loginTaskHandler.previousResult) {
      setLoginFailedReason(loginTaskHandler.previousResult)
    }
    if (loginTaskHandler.previousError) {
      onError()
    }
  })
  onCleanup(() => {
    loginTaskHandler.removeOnErrorHandler(onError)
    loginTaskHandler.removeOnResultHandler(onLoginResult)
  })

  function onLogin() {
    getLoginTask().spawnTask(login(usernameInput.textContent, passwordInput.textContent))
  }

  function resetResult() {
    setLoginFailedReason()
    getLoginTask().clearResults()
  }

  function onLogout() {
    logout();
  }

  return (
    <Popover>
      <Popover.Trigger class="relative h-14 w-14 border border-black/10 rounded-md cursor-pointer">
        <Show when={loginFailedReason() !== undefined}>
          <div class="absolute w-full h-full bg-red-200/70 rounded-md z-10 p-2 text-red-500">
            <BsExclamationCircle class="w-full h-full"/>
          </div>
        </Show>
        
        <Show when={isLogging()}>
          <div class="absolute w-full h-full flex items-center justify-center z-10 bg-white/50">
            <LoadingAnimation.ThreeBouncingDots />
          </div>
        </Show>

        <div class="w-full h-full p-2 relative z-0">
          <Show when={userInfo() !== undefined}>
            <FaSolidUserAlt class="h-full w-full object-cover opacity-50"/>
          </Show>
          <Show when={userInfo() === undefined}>
            <FaSolidUserAltSlash class="h-full w-full object-cover opacity-50"/>
          </Show>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class="w-60 bg-white rounded-md border border-black/10 shadow-md outline-0 px-3 flex flex-col items-center pb-2">
          <Popover.Arrow />
          
          <Show when={userInfo() !== undefined}>
            <div class="text-2xl my-5 text-center"> Welcome, { userInfo()?.display_name ?? `@${userInfo()?.username}` } </div>
          
            <Button class="bg-red-500 flex flex-row items-center p-2 px-6 rounded-md cursor-pointer ui-disabled:bg-red-500 ui-disabled:text-white/60" onClick={onLogout}>
              <LogOut class="mr-2"/>
              <div class="text-xl"> Logout </div> 
            </Button>
          </Show>
          <Show when={userInfo() === undefined}>
            <div class="text-2xl my-5"> Welcome </div>

            <TextField class="flex flex-row w-full p-0.5 overflow-hidden text-xl border border-gray-500 focus-within:border-black rounded-md mb-2 cursor-text ui-disabled:border-gray-400 ui-disabled:text-gray-600 ui-invalid:border-red-500" disabled={isLogging()} validationState={textInputValidationState()}>
              <TextField.Label class="mr-2 cursor-text"> <FaSolidUserAlt class="h-6 w-6 object-cover m-2"/> </TextField.Label>
              <TextField.Input ref={usernameInput} placeholder="Username..." class="w-full outline-0" onFocus={() => resetResult()}/>
            </TextField>
            
            <TextField class="relative flex flex-row w-full p-0.5  text-xl border border-gray-500 focus-within:border-black rounded-md mb-4 cursor-text ui-disabled:border-gray-400 ui-disabled:text-gray-600 ui-invalid:border-red-500" disabled={isLogging()} validationState={textInputValidationState()}>
              <TextField.Label class="mr-2 cursor-text"> <CgPassword class="h-6 w-6 object-cover m-2"/> </TextField.Label>
              <TextField.Input ref={passwordInput} placeholder="Password..." class="w-full outline-0" type="password" onFocus={() => resetResult()}/>

              <Show when={loginFailedReason() !== undefined}>
                <div class="absolute bottom-0 right-0 translate-y-1/2 pr-2">
                  <div class="text-sm text-red-500 bg-white font-medium px-0.5">
                    { loginFailedReason() }
                  </div>
                </div>
              </Show>
            </TextField>

            <Button class="bg-sky-300 flex flex-row items-center p-2 px-6 rounded-md cursor-pointer ui-disabled:bg-sky-200 ui-disabled:text-gray-600" onClick={onLogin} disabled={isLogging()}>
              <LogIn class="mr-2"/>
              <div class="text-xl"> Login </div> 
            </Button>
          </Show>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  )
}
