import type { ParentProps } from "solid-js";

export function AppHeader(props: ParentProps) {
  return (
    <>
      { /* Header */ }
      <div class="flex flex-row items-center h-20 w-full bg-white shadow-xl border-b border-black/10 p-4 z-10">
        { props.children }
      </div>
    </>
  )
}