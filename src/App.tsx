import { createEffect, createSignal, Show } from "solid-js";
import { AuthProvider, useAuth } from "./worker/context/AuthContext"
import { WorkerProvider } from "./worker/context/WorkerContext"

function PApp (_props: { children ?: any }) {
  const { whoami, login, logout } = useAuth();

  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  function handleLogin () {
    login(username(), password());
  }

  createEffect(() => {
    console.log(whoami())
  })

  return (
    <>
      <>{ JSON.stringify(whoami()) }</>
      <Show when={whoami().is_authenticated}>
        <button
          onClick={logout}
        >Logout</button>
      </Show>
      <Show when={!whoami().is_authenticated}>
        <input
          type="text"
          value={username()}
          onInput={(e) => setUsername(e.currentTarget.value)}
          placeholder="Enter your username"
        />
        <input
          type="text"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter your password"
        />
        <button
          onClick={handleLogin}
        >Login</button>
      </Show>
    </>
  )
}

function App() {
  return (
    <>
      <WorkerProvider apiHostname="http://127.0.0.1:5173/api/">
        <AuthProvider>
          <PApp></PApp>
        </AuthProvider>
      </WorkerProvider>
    </>
  )
}

export default App
