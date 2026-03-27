import { OcGrabber2 } from "solid-icons/oc";
import { BaseSplitPanel, type BaseSplitPanelProps, type Direction } from "./base/BaseSplitPanel";
import type { PolymorphicProps } from "@kobalte/core";
import type { ParentProps } from "solid-js";

type AppSplitPanelProps = Omit<BaseSplitPanelProps, "gutter">

export function AppPanel(props: ParentProps) {
  return (
    <>
      <div class="relative h-full w-full max-h-full max-w-full contain-size bg-white border border-black/10 rounded-md shadow-md overflow-hidden">
        { props.children }
      </div>
    </>
  )
}

function AppSplitPanelGutter(_index: number, direction: Direction) {
  return (
    <>
      <div class="h-full w-full flex items-center justify-center">
        <OcGrabber2 classList={{ "rotate-90": direction == "vertical" }}/>
      </div>
    </>
  )
}

export function AppSplitPanel(props: PolymorphicProps<"div", AppSplitPanelProps>) {
  return (
    <>
      <BaseSplitPanel {...props} gutter={AppSplitPanelGutter}/>
    </>
  )
}