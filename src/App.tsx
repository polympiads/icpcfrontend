import { createSignal, For, Show } from "solid-js";
import { AuthProvider, useAuth } from "./worker/context/AuthContext"
import { WorkerProvider } from "./worker/context/WorkerContext"
import { useContests } from "./worker/hooks/useContests";
import { FeedProvider, useFeed } from "./worker/context/FeedContext";

function PApp (_props: { children ?: any }) {
  const { whoami, login, logout } = useAuth();

  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  function handleLogin () {
    login(username(), password());
  }

  const contests = useContests();

  const feed = useFeed();

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
      <ul>
        <For each={contests()}>
          {(contest) => <li>{contest.formal_name}</li>}
        </For>
      </ul>
      <>{JSON.stringify(feed)}</>
    </>
  )
}

function App() {
  return (
    <>
      <WorkerProvider apiHostname="http://localhost/api/">
        <AuthProvider>
          <FeedProvider contestId="1">
            <PApp></PApp>
          </FeedProvider>
        </AuthProvider>
      </WorkerProvider>
    </>
  )
}

export default App
