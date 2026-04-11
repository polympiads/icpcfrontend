import { createSignal, type Accessor } from "solid-js";
import { AppEditor, useAppEditorContext } from "./Editor";
import { Button } from "@kobalte/core/button";
import { LoaderCircle, Upload } from "lucide-solid";
import { API_ROOT, BASE_URL, SUBMISSIONS_URL } from "./constants";

export async function postSubmission(contest_id: string, code: string, problem_id: string, language_id: string, session: string) {
  const url = new URL(API_ROOT + SUBMISSIONS_URL(contest_id), BASE_URL)
  url.searchParams.append('language_id', language_id)
  url.searchParams.append('problem_id', problem_id)
  
  const formData = new FormData()
  const codeBlob = new Blob([code], { type: 'text/plain' })
  formData.append('file', codeBlob)
  
  return await fetch(url.toString(), {
    method: "POST",
    body: formData,
    headers: {
      'X-Session-Id': session
    }
  })
}

function SubmitButton(props: { onSubmit: (code: string, language: string) => Promise<void>, disable: boolean }) {
  const { code, language } = useAppEditorContext()
  const isLanguageSelected = () => language() !== undefined
  
  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    props.onSubmit(code(), language()!)
      .finally(() => setSubmitting(false));
  }
  
  return (
    <Button
      class="h-full rounded-none cursor-pointer flex flex-row justify-center items-center bg-sky-300 disabled:bg-sky-200 disabled:cursor-default duration-100 hover:bg-sky-400 shrink-0 disabled:*:opacity-75 p-2"
      disabled={isSumbitting() || !isLanguageSelected() || props.disable}
      onClick={onSubmit}
    >
      <div class="relative w-6 h-6 top-0">
        <div
          class="absolute duration-150 ease-out"
          classList={{
            "-top-0": !isSumbitting(),
            "-top-11": isSumbitting(),
          }}
        >
          <Upload class="scale-75" />
          <div class="h-5" />
          <LoaderCircle class="animate-spin scale-75" />
        </div>
      </div>
      <div>Submit</div>
    </Button>
  )
}

export function SubmissionEditor(props: {
  onSubmit: (code: string, languageId: string) => Promise<void>;
  availableLanguages: Accessor<string[]>;
  disableSubmission: boolean
}) {
  return (
    <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
      <AppEditor>
        <AppEditor.Toolbar class="border-b border-gray-300">
          {/* Space */}
          <div class="grow" />

          <AppEditor.LanguageSelect availableLanguages={props.availableLanguages} />
          <SubmitButton onSubmit={props.onSubmit} disable={ props.disableSubmission ?? false} />
        </AppEditor.Toolbar>
        <div class="grow overflow-auto">
          <AppEditor.Editor class="h-full"/>
        </div>
      </AppEditor>
    </div>
  );
}