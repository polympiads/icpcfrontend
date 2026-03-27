import { LoaderCircle, Upload } from "lucide-solid";
import { createEffect, createSignal, untrack, type Accessor } from "solid-js";
import { BaseEditor } from "../base/BaseEditor";
import { AppButton } from "../AppButton";
import { languageIdToPrismLanguage } from "./Languages";
import { LanguageSelect } from "./LanguageSelect";
import { Show } from "solid-js";

export function SubmissionEditor(props: {
  onSubmit: (code: string, languageId: string) => Promise<void>;
  availableLanguages: Accessor<string[]>;
  disableSubmission?: boolean
}) {
  
  const [language, setLanguage] = createSignal<string>();
  createEffect(() => {
    if (!untrack(language) && props.availableLanguages().length > 0) {
      setLanguage(props.availableLanguages()[0])
    }
    if (props.availableLanguages().length == 0) {
      setLanguage(undefined)
    }
  })
  //createEffect(() => console.log(language()))

  const [code, setCode] = createSignal("");
  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    props.onSubmit(code(), language()!).finally(() => setSubmitting(false));
  }

  return (
    <>
      <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
        <div class="flex flex-row items-center border-b border-gray-300 h-10">
          {/* Space */}
          <div class="grow" />

          <Show when={ language() == undefined }>
            <div class="p-2 flex flex-row items-center gap-2 h-full">
              <div class="h-full aspect-square animate-pulse bg-gray-300 rounded-full" />
              <div class="h-1/2 w-15 aspect-square animate-pulse bg-gray-300 rounded-full"/>
            </div>
          </Show>
          <Show when={ language() != undefined }>
            <LanguageSelect
              language={language()!}
              onLanguage={setLanguage}
              availableLanguages={props.availableLanguages}
            />
          </Show>

          <AppButton
            spacing="small"
            class="h-full rounded-none"
            disabled={isSumbitting() || language() == undefined || (props.disableSubmission ?? false)}
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
          </AppButton>
        </div>
        <div class="grow overflow-auto">
          <BaseEditor
            code={code()}
            setCode={setCode}
            language={languageIdToPrismLanguage(language())}
            class="h-full"
          />
        </div>
      </div>
    </>
  );
}
