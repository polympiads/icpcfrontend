import autoAnimate from "@formkit/auto-animate";
import { onMount, type ParentProps } from "solid-js";

export function AutoAnimate(props: ParentProps & { class?: string }) {
  let parent!: HTMLDivElement;

  onMount(() => autoAnimate(parent));

  return (
    <div ref={parent} class={props.class}>
      {props.children}
    </div>
  );
}