import { createContext, createEffect, createSignal, splitProps, useContext, type Accessor, type ComponentProps, type ParentProps, type Setter } from "solid-js";
import { languageIdToPrismLanguage } from "../languages/Languages";
import { BaseEditor } from "../base/BaseEditor";
import clsx from "clsx";
import { LanguageSelect } from "./LanguageSelect";

export type AppEditorContextProps = {
  language: Accessor<string | undefined>,
  setLanguage: Setter<string | undefined>,
  code: Accessor<string>,
  setCode: Setter<string>,
  readonly?: boolean
}

const Context = createContext<AppEditorContextProps>()

export function useAppEditorContext() {
  const context = useContext(Context)
  if (!context) {
    throw "AppEditor's components should be used inside an AppEditor component"
  }
  
  return context
}

type AppEditorRootProps = {
  readonly?: boolean,
  code?: string,
  onCode?: (code: string) => void
  language?: string,
  onLanguage?: (code: string) => void
}

function AppEditorRoot(props: ParentProps & AppEditorRootProps) {
  const [language, setLanguage] = createSignal<string | undefined>(props.language)
  const [code, setCode] = createSignal<string>(props.code ?? "");
  
  createEffect(() => {
    props.onCode?.(code());
  });
  createEffect(() => {
    const languageVal = language()
    if (!languageVal) {
      return;
    }
    
    props.onLanguage?.(languageVal);
  });
  
  const context: AppEditorContextProps = {
    language,
    setLanguage,
    code,
    setCode,
    readonly: props.readonly
  }
  
  return (
    <>
      <Context.Provider value={ context }>
        { props.children }
      </Context.Provider>
    </>
  )
}

function AppEditorToolbar(props: ParentProps & ComponentProps<"div">) {
  const [local, others] = splitProps(props, ["class"])
  
  return (
    <>
      <div class={ clsx("flex flex-row items-center h-10", local.class) } { ...others }>
        { props.children }
      </div>
    </>
  )
}

function AppEditorEditor(props: { class?: string }) {
  const { code, setCode, language, readonly } = useAppEditorContext()
  return (
    <>
      <BaseEditor
        code={code()}
        setCode={setCode}
        language={languageIdToPrismLanguage(language())}
        class={props.class}
        readonly={readonly ?? false}
      />
    </>
  )
}

export const AppEditor = Object.assign(AppEditorRoot, {
  Toolbar: AppEditorToolbar,
  Editor: AppEditorEditor,
  LanguageSelect: LanguageSelect
})