import { FaSolidUserSlash } from "solid-icons/fa";
import { createSignal, Show, createEffect, createMemo } from "solid-js";
import { Popover } from "@kobalte/core/popover";
import { createPresence } from "@solid-primitives/presence";

import { UserLogin } from "./UserLogin";
import { onMount } from "solid-js";
import { UserPP } from "../components/user/UserPP";
import { UserInfo } from "./UserInfo";
import { ImExit } from "solid-icons/im";
import { Button } from "@kobalte/core/button";
import { LoadingAnimation } from "../components/animations/LoadingAnimation";
import { LOGIN_TASK_RUNNER } from "./UserLoginTask";
import { AiOutlineExclamationCircle } from "solid-icons/ai";
import { useUserLoginContext } from "../contexts/UserLoginContext";
import { Transition } from "solid-transition-group";

export function UserInfoWidget() {
  const { is_authenticated, login, logout } = useUserLoginContext()
  
  const [panelOpened, setPanelOpened] = createSignal(false);
  createEffect(() => {
    is_authenticated();
    setPanelOpened(false)
  })
  
  // small trick to make the popup change only when not visible
  const panelPresense = createPresence(panelOpened, {
    transitionDuration: 150,
  });
  const [isLoggedInDeffered, setIsLoggedInDeffered] = createSignal(false);
  createEffect(() => {
    if (!panelPresense.isMounted()) {
      setIsLoggedInDeffered(is_authenticated());
    }
  });
  onMount(() => setIsLoggedInDeffered(is_authenticated()));

  const showLoginAttemptFailed = createMemo(() => !panelOpened() && typeof LOGIN_TASK_RUNNER.lastValue() === "string")

  return (
    <>
      <Popover open={panelOpened()} onOpenChange={setPanelOpened}>
        {/* User PP Button */}
        <Popover.Trigger class="relative h-full aspect-square outline outline-black/10 rounded-md flex items-center justify-center overflow-hidden cursor-pointer">
          <Show when={is_authenticated()}>
            <UserPP src={ undefined } />
          </Show>
          <Show when={!is_authenticated()}>
            { /* Login error */}
            <Transition enterActiveClass="animate-fade-in" exitActiveClass="animate-fade-out">
              <Show when={showLoginAttemptFailed()}>
                <div class="w-full h-full absolute z-10">
                  <div class="absolute w-full h-full flex items-center justify-center z-20">
                    <AiOutlineExclamationCircle size="2em" class="text-red-600"/>
                  </div>
                  <div class="absolute w-full h-full bg-red-100/80"></div>
                </div>
              </Show>
            </Transition>
            
            { /* Login animation */}
            <Transition enterActiveClass="animate-fade-in" exitActiveClass="animate-fade-out">
              <Show when={ LOGIN_TASK_RUNNER.isRunning() }>
                <div class="w-full h-full absolute z-10">
                  <div class="absolute w-full h-full flex items-center justify-center z-20">
                    <div class="animate-pulse-2x">
                      <LoadingAnimation.ThreeBouncingDots />
                    </div>
                  </div>
                  <div class="absolute w-full h-full bg-white/50 animate-pulse"></div>
                </div>
              </Show>
            </Transition>

            {/* Not logged in */}
            <FaSolidUserSlash size="2.3em" class="opacity-40" />
          </Show>
        </Popover.Trigger>

        {/* Popup */}
        <Popover.Portal>
          <Popover.Content class="border border-black/10 bg-white shadow-2xl rounded-md ui-expanded:animate-popover-enter ui-closed:animate-popover-exit popover-content z-999">
            <Popover.Arrow />

            <Show when={!isLoggedInDeffered()}>
              <div class="p-3">
                <UserLogin onLoggin={login}></UserLogin>
              </div>
            </Show>
            <Show when={isLoggedInDeffered()}>
              <div class="flex flex-col items-center pb-4">
                <UserInfo />

                <Button
                  onClick={logout}
                  class="p-2.5 rounded-full border outline-0 outline-red-600 cursor-pointer hover:outline-2 hover:border-2 hover:border-white hover:bg-red-600 bg-white/50 duration-75 group"
                >
                  <ImExit
                    size="1.3em"
                    class="group-hover:text-white duration-75"
                  />
                </Button>
              </div>
            </Show>
          </Popover.Content>
        </Popover.Portal>
      </Popover>
    </>
  );
}
