import { createEffect, createSignal, For, Show } from "solid-js";
import { AuthProvider, useAuth } from "./worker/context/AuthContext"
import { WorkerProvider } from "./worker/context/WorkerContext"
import { useContests } from "./worker/hooks/useContests";
import { FeedProvider, useFeed } from "./worker/context/FeedContext";
import { useProblems, useStatement } from "./worker/hooks/useProblems";
import { useSubmission, useSubmissions } from "./worker/hooks/useSubmissions";

function Statement (_props: { problemId: string }) {
  const statement = useStatement(_props.problemId);
  return (
    <>
    <br></br>
    <>Problem {_props.problemId}</>
    <Show 
        when={!statement.loading} 
        fallback={<p>Downloading PDF...</p>}
      >
        <Show 
          when={statement()} 
          fallback={<p>No statement available for this problem.</p>}
        >
          <object
            data={statement()} 
            type="application/pdf"
            width="100%"
            height="100%"
            class="pdf-object"
          >
            {/* Fallback for browsers that can't embed PDFs (like some mobile browsers) */}
            <div class="pdf-fallback">
              <p>Your browser cannot display this PDF directly.</p>
              <a href={statement()} download="statement.pdf" class="btn">
                Download Statement instead
              </a>
            </div>
          </object>
        </Show>
      </Show>
      
      <Show when={statement.error}>
        <p style={{ color: "red" }}>Error loading PDF: {statement.error.message}</p>
      </Show>
    </>
  )
}

function Submission (_props: { submissionId: string }) {
  const submission = useSubmission(_props.submissionId);
  return (
    <>
      <br></br>
      Submission {submission().id}, language {submission().language_id}, on {submission().problem_id}, status {submission().status}, judgement {submission().judgement_type_id}, by {submission().account_id} team {submission().team_id}
    </>
  )
}

function PApp (_props: { children ?: any }) {
  const { whoami, login, logout } = useAuth();

  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  function handleLogin () {
    login(username(), password());
  }

  const contests = useContests();

  const feed = useFeed();

  const problems = useProblems();
  const entries = () => Object.values( problems() ).sort((a, b) => Number(a.id) - Number(b.id))

  const submissions = useSubmissions();
  const submissions_entries = () => Object.values( submissions() ).sort((a, b) => Number(a.id) - Number(b.id))

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
      
      <For each={entries()}>
        {(item, _index) => <Statement problemId={item.id} data-index={item.id} />}
      </For>

      <For each={submissions_entries()}>
        {(item, _index) => <Submission submissionId={item.id} data-index={item.id} />}
      </For>

      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
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
