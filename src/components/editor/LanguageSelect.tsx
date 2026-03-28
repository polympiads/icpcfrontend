import { Select } from "@kobalte/core/select";
import { LanguageEntry } from "../languages/LanguageEntry";
import { BasePortal } from "../base/BasePortal";
import {
  createEffect,
  onCleanup,
  Show,
  untrack,
  type Accessor,
} from "solid-js";
import { useAppEditorContext } from "./AppEditor";

type LanguageSelectProps = {
  availableLanguages: Accessor<string[]>;
};

export function LanguageSelect(props: LanguageSelectProps) {
  const { language, setLanguage } = useAppEditorContext();

  createEffect(() => {
    if (!untrack(() => language()) && props.availableLanguages().length > 0) {
      setLanguage(props.availableLanguages()[0]);
    }
    if (props.availableLanguages().length == 0) {
      setLanguage(undefined);
    }
  });

  return (
    <>
      <Show when={language() == undefined}>
        <div class="p-2 flex flex-row items-center gap-2 h-full">
          <div class="h-full aspect-square animate-pulse bg-gray-300 rounded-full" />
          <div class="h-1/2 w-15 aspect-square animate-pulse bg-gray-300 rounded-full" />
        </div>
      </Show>
      <Show when={language() != undefined}>
        <Select
          class="h-full"
          value={language()}
          onChange={(v) => v && setLanguage(v)}
          options={props.availableLanguages()}
          fitViewport={true}
          itemComponent={(itemProps) => {
            let ref: HTMLDivElement | undefined;

            createEffect(() => {
              if (!ref) return;

              const observer = new MutationObserver(() => {
                if (ref?.dataset.highlighted !== undefined) {
                  ref.scrollIntoView({
                    block: "nearest",
                  });
                }
              });

              observer.observe(ref, {
                attributes: true,
                attributeFilter: ["data-highlighted"],
              });

              onCleanup(() => observer.disconnect());
            });

            return (
              <Select.Item
                ref={ref}
                item={itemProps.item}
                class="h-full hover:bg-gray-100 duration-75 ui-selected:bg-slate-200 outline-0 focus-visible:bg-gray-100 ui-selected:focus-visible:bg-slate-300"
              >
                <LanguageEntry language={itemProps.item.rawValue} />
              </Select.Item>
            );
          }}
        >
          <Select.Trigger class="h-full">
            <Select.Value<string>>
              {(state) => (
                <div class="h-full  hover:bg-gray-100 duration-75 flex items-center">
                  <LanguageEntry language={state.selectedOption() ?? "text"} />
                </div>
              )}
            </Select.Value>
          </Select.Trigger>
          <BasePortal>
            <Select.Content class="rounded-md border border-black/10 bg-white shadow-lg overflow-auto max-h-ui-popup-h">
              <Select.Listbox />
            </Select.Content>
          </BasePortal>
        </Select>
      </Show>
    </>
  );
}
