import { TextField } from "@kobalte/core/text-field";
import { LoaderCircle, SquareAsterisk, UserRound } from "lucide-solid";
import { createEffect, createSignal, onMount } from "solid-js";
import { AppButton } from "../components/AppButton";
import { createPresence } from "@solid-primitives/presence";
import { LOGIN_TASK_RUNNER } from "./UserLoginTask";

export interface UserLoginProps {
  onLoggin: (username: string, password: string) => Promise<string | void>
}

export function UserLogin(props: UserLoginProps) {
  let passwordTextField!: HTMLInputElement;
  let usernameTextField!: HTMLInputElement;

  const { isMounted } = createPresence(LOGIN_TASK_RUNNER.isRunning, { transitionDuration: 100 })
  const [loginFailed, setLoginFailed] = createSignal(false);

  createEffect(() => loginFailed())
  
  function handleLogin() {
    usernameTextField.blur();
    passwordTextField.blur();
    
    LOGIN_TASK_RUNNER.runTask(props.onLoggin(usernameTextField.value, passwordTextField.value))
  }
  onMount(() => {
    const lastAttempt = LOGIN_TASK_RUNNER.lastValue()
    if (lastAttempt) {
      setLoginFailed(typeof lastAttempt === "string")
    } else {
      usernameTextField.focus();
    }
    
    LOGIN_TASK_RUNNER.onFinish = (result) => {
      setLoginFailed(typeof result === "string")
    }
    LOGIN_TASK_RUNNER.onError = (error) => {
      console.error(error)
      setLoginFailed(true)
    }
  })

  function handleKeypress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (e.target === usernameTextField) {
        passwordTextField.focus();
      } else {
        handleLogin();
      }
    }
  }
  
  function resetError() {
    setLoginFailed(false)
    LOGIN_TASK_RUNNER.clearLastValue()
  }

  return (
    <>
      <div class="flex flex-col *:not-last:mb-3 rounded-md items-center">
        <div class="text-2xl p-3">Welcome</div>

        { /* FIXME : The TextField are autofocused immediately */ }
        <TextField
          disabled={LOGIN_TASK_RUNNER.isRunning()}
          validationState={loginFailed() ? "invalid" : "valid"}
          class="relative border-slate-300 border-2 rounded-md appearance-none focus-within:border-black flex flex-row *:not-last:mr-3 bg-white duration-150 ui-invalid:border-red-500 p-3"
        >
          <UserRound />
          <TextField.Input
            ref={usernameTextField}
            onKeyDown={handleKeypress}
            class="outline-0"
            placeholder="Username"
            onFocus={() => resetError()}
          />
        </TextField>
        <TextField
          disabled={LOGIN_TASK_RUNNER.isRunning()}
          validationState={loginFailed() ? "invalid" : "valid"}
          class="relative border-slate-300 border-2 rounded-md appearance-none focus-within:border-black flex flex-row *:not-last:mr-3 bg-white duration-150 ui-invalid:border-red-500"
        >
          <div class="m-3 flex flex-row *:not-last:mr-3">
            <SquareAsterisk />
            <TextField.Input
              ref={passwordTextField}
              onKeyDown={handleKeypress}
              class="outline-0"
              type="password"
              placeholder="Password"
              onFocus={() => resetError()}
            />
          </div>

          {/* Anchor to bottom right centered */}
          <div class="absolute bottom-0 right-0">
            {/* then translate 50% to on y axis */}
            <div class="mr-5 translate-y-1/2">
              <TextField.ErrorMessage class="bg-white p-1 text-sm text-nowrap text-red-500 leading-none">
                Login failed.
              </TextField.ErrorMessage>
            </div>
          </div>
        </TextField>

        <AppButton
          class="w-80/100"
          disabled={LOGIN_TASK_RUNNER.isRunning()}
          onClick={handleLogin}
        >
          <div
            class="overflow-hidden duration-100"
            classList={{
              "w-0": !LOGIN_TASK_RUNNER.isRunning(),
              "w-6": LOGIN_TASK_RUNNER.isRunning(),
            }}
          >
            <LoaderCircle classList={{"animate-spin": isMounted()}} />
          </div>
          <div>Login</div>
        </AppButton>
      </div>
    </>
  );
}
