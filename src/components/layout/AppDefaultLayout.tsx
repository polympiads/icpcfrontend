import { Button } from "@kobalte/core/button";
import { AppHeader } from "./AppHeader";
import { FaSolidMountain } from "solid-icons/fa";
import type { JSXElement, ParentProps } from "solid-js";
import { A } from "@solidjs/router";

type AppDefaultLayoutProps = ParentProps & {
  headerComponents?: JSXElement
}

export function AppDefaultLayout(props: AppDefaultLayoutProps) {
  return (
    <>
      <div class="w-full h-full flex flex-col">
        { /* Header */ }
        <AppHeader>
          { /* Logo */}
          <A href="/">
            <FaSolidMountain size="3em" class="opacity-25" />
          </A>
          
          { props.headerComponents }
        </AppHeader>
        
        { /* App views */}
        <div class="grow w-full overflow-hidden">
          { props.children }
        </div>
      </div>
    </>
  )
}