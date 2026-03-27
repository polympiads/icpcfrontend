import type { PolymorphicProps } from "@kobalte/core";
import { Image, type ImageRootProps } from "@kobalte/core/image";
import { createContext, createEffect, createUniqueId, mergeProps, Show, useContext, type Accessor, type ParentProps, type ValidComponent } from "solid-js";
import { createSignal } from "solid-js";

type ImageStatus = "idle" | "loading" | "loaded" | "error"

interface ContextProps {
  status: Accessor<ImageStatus>
}

export type BaseImageProps<T extends ValidComponent> = PolymorphicProps<T, ImageRootProps<T>> & ParentProps & {
  /// image name, many used for debug purposes
  debugName?: string
};

const Context = createContext<ContextProps>()

function ImageRoot<T extends ValidComponent = "span">(props: BaseImageProps<T>) {
  const name = props.debugName ?? createUniqueId()
  const [status, setStatus] = createSignal<ImageStatus>("idle")
  const propsMerged = mergeProps(props, { onLoadingStatusChange: setStatus })
  
  createEffect(() => console.log(`[${name}] ${status()}`))
  
  return (
    <>
      <Context.Provider value={ {status} } >
        <Image {...propsMerged}></Image>
      </Context.Provider>
    </>
  )
}

function ImageLoading(props: ParentProps) {
  const context = useContext(Context)
  if (!context) {
    throw "AppImageLoading should be used inside an AppImage"
  } 
  
  return (
    <>
      <Show when={context.status() == "loading"}>
        { props.children }
      </Show>
    </>
  )
}

function ImageFallback(props: ParentProps) {
  const context = useContext(Context)
  if (!context) {
    throw "AppImageFallback should be used inside an AppImage"
  } 
  
  return (
    <>
      <Show when={context.status() == "error"}>
        { props.children }
      </Show>
    </>
  )
}

export const BaseImage = Object.assign(ImageRoot, {
  Loading: ImageLoading,
  Fallback: ImageFallback,
  Image: Image.Img
})

