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
import { OcGrabber2 } from "solid-icons/oc";

export type Direction = "horizontal" | "vertical";
type OriginalSplitOptions = Omit<Options, "gutter">;

type GutterElement = HTMLDivElement & {
  _dispose: () => void;
};

type BaseSplitPanelProps = {
  includeMargin?: boolean,
  gutter?(index: number, direction: Direction): JSXElement;
}
  & OriginalSplitOptions
  & ParentProps;

function BaseSplitPanel(
  props: PolymorphicProps<"div", BaseSplitPanelProps>,
) {
  const resolvedChildren = children(() => props.children);
  const resolvedChildrenDivs: HTMLDivElement[] = [];

  let splitInstance: Instance;
  const gutters: GutterElement[] = [];

  onMount(() => {
    const [{ gutter }, otherOptions] = splitProps(props, ["gutter"]);

    const gutterRenderer =
      gutter === undefined
        ? undefined
        : (index: number, direction: Direction) => {
            const rootDiv = document.createElement("div") as GutterElement;

            createRoot((dispose) => {
              render(() => gutter?.(index, direction), rootDiv);
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
    //console.log("destroy")
    resolvedChildrenDivs.length = 0;
    gutters.forEach((gutter) => {
      gutter._dispose()
    });
    gutters.length = 0;
  
    splitInstance?.destroy();
  });
  
  const class_ = clsx(
    "flex",
    props.class,
    props.direction === "horizontal" && "flex-row w-full",
    props.direction === "vertical" && "flex-col h-full",
    
  );
  const styleList = mergeProps(
    (props.includeMargin ?? false) && { "padding": `${props.gutterSize ?? 10}px` }
  )

  return (
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
  );
}

type AppSplitPanelProps = Omit<BaseSplitPanelProps, "gutter">

export function Panel(props: ParentProps) {
  return (
    <div class="relative h-full w-full max-h-full max-w-full contain-size bg-white border border-black/10 rounded-md shadow-md overflow-hidden">
      { props.children }
    </div>
  )
}

function SplitPanelGutter(_index: number, direction: Direction) {
  return (
    <div class="h-full w-full flex items-center justify-center">
      <OcGrabber2 classList={{ "rotate-90": direction === "vertical" }}/>
    </div>
  )
}

export function SplitPanel(props: PolymorphicProps<"div", AppSplitPanelProps>) {
  return (
    <BaseSplitPanel {...props} gutter={SplitPanelGutter}/>
  )
}
