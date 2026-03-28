import { createSignal } from "solid-js";
import { AppButton } from "../AppButton";
import { useAppEditorContext } from "../editor/AppEditor";
import { LoaderCircle, Upload } from "lucide-solid";

export function SubmitButton(props: { onSubmit: (code: string, language: string) => Promise<void>, disable: boolean }) {
  const { code, language } = useAppEditorContext()
  const isLanguageSelected = () => language() != undefined
  
  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    props.onSubmit(code(), language()!)
      .finally(() => setSubmitting(false));
  }
  
  return (
    <>
      <AppButton
        spacing="small"
        class="h-full rounded-none"
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
      </AppButton>
    </>
  )
}