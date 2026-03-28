import { type Accessor } from "solid-js";

import { AppEditor } from "../editor/AppEditor";
import { SubmitButton } from "./SubmitButton";

export function SubmissionEditor(props: {
  onSubmit: (code: string, languageId: string) => Promise<void>;
  availableLanguages: Accessor<string[]>;
  disableSubmission?: boolean
}) {
  return (
    <>
      <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
        <AppEditor>
          <AppEditor.Toolbar class="border-b border-gray-300">
            {/* Space */}
            <div class="grow" />

            <AppEditor.LanguageSelect availableLanguages={props.availableLanguages} />
            <SubmitButton onSubmit={props.onSubmit} disable={ props.disableSubmission ?? false} />
          </AppEditor.Toolbar>
          <div class="grow overflow-auto">
            <AppEditor.Editor />
          </div>
        </AppEditor>
      </div>
    </>
  );
}
