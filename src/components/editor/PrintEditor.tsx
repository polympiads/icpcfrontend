import { createSignal } from "solid-js";
import { AppButton } from "../AppButton";
import { LoaderCircle, Upload } from "lucide-solid";
import { BaseEditor } from "../base/BaseEditor";

export function PrintEditor(props: {
  onPrint: (code: string) => Promise<void>;
}) {
  
  const [code, setCode] = createSignal("");
  const [isPrinting, setPrinting] = createSignal(false);

  function onPrint() {
    setPrinting(true);

    props.onPrint(code()).finally(() => setPrinting(false));
  }

  return (
    <>
      <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
        <div class="flex flex-row items-center border-b border-gray-300 h-10">
          {/* Space */}
          <div class="grow" />

          <AppButton
            spacing="small"
            class="h-full rounded-none"
            disabled={isPrinting()}
            onClick={onPrint}
          >
            <div class="relative w-6 h-6 top-0">
              <div
                class="absolute duration-150 ease-out"
                classList={{
                  "-top-0": !isPrinting(),
                  "-top-11": isPrinting(),
                }}
              >
                <Upload class="scale-75" />
                <div class="h-5" />
                <LoaderCircle class="animate-spin scale-75" />
              </div>
            </div>
            <div>Print</div>
          </AppButton>
        </div>
        <div class="grow overflow-auto">
          <BaseEditor
            code={code()}
            setCode={setCode}
            class="h-full"
          />
        </div>
      </div>
    </>
  );
}