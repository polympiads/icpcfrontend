import type { PolymorphicProps } from "@kobalte/core";
import clsx from "clsx";
import {
  createRoot,
  For,
  mergeProps,
  onCleanup,
  splitProps,
  type JSXElement,
} from "solid-js";
import { children, onMount, type ParentProps } from "solid-js";
import { render } from "solid-js/web";
import type { Instance, Options } from "split.js";
import Split from "split.js";
import { onTransitionAfterExit } from "./BaseTransition";

export type Direction = "horizontal" | "vertical";
type OriginalSplitOptions = Omit<Options, "gutter">;

type GutterElement = HTMLDivElement & {
  _dispose: () => void;
};

export type BaseSplitPanelProps = {
  includeMargin?: boolean,
  gutter?(index: number, direction: Direction): JSXElement;
}
  & OriginalSplitOptions
  & ParentProps;

export function BaseSplitPanel(
  props: PolymorphicProps<"div", BaseSplitPanelProps>,
) {
  const resolvedChildren = children(() => props.children);
  const resolvedChildrenDivs: HTMLDivElement[] = [];

  let splitInstance: Instance;
  const gutters: GutterElement[] = [];

  onMount(() => {
    const [{ gutter }, otherOptions] = splitProps(props, ["gutter"]);

    const gutterRenderer =
      gutter == undefined
        ? undefined
        : (index: number, direction: Direction) => {
            let rootDiv = document.createElement("div") as GutterElement;

            createRoot((dispose) => {
              render(() => gutter!(index, direction), rootDiv);
              rootDiv._dispose = dispose;
            });

            gutters.push(rootDiv);

            return rootDiv;
          };

    splitInstance = Split(resolvedChildrenDivs, {
      gutter: gutterRenderer,
      ...otherOptions,
    });
  });

  onCleanup(() => {
    console.log("destroy")
    resolvedChildrenDivs.length = 0;
  });
  onTransitionAfterExit(() => {
    gutters.forEach((gutter) => gutter._dispose());
    gutters.length = 0;

    splitInstance?.destroy();
  })

  
  
  const class_ = clsx(
    "flex",
    props.class,
    props.direction == "horizontal" && "flex-row w-full",
    props.direction == "vertical" && "flex-col h-full",
    
  );
  const styleList = mergeProps(
    (props.includeMargin ?? false) && { "padding": `${props.gutterSize ?? 10}px` }
  )

  return (
    <>
      <div class={class_} style={styleList}>
        <For each={resolvedChildren.toArray()}>
          {(item) => (
            <div
              ref={(r) => resolvedChildrenDivs.push(r)}
              class="*:h-full *:w-full"
            >
              {item}
            </div>
          )}
        </For>
      </div>
    </>
  );
}
