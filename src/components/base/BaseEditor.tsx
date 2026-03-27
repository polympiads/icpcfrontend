import { Editor, type Extension } from "solid-prism-editor";
import "solid-prism-editor/prism/languages/common";
import "solid-prism-editor/languages/common";
import "solid-prism-editor/layout.css";
// import "solid-prism-editor/folding.css";
// import "solid-prism-editor/copy-button.css";
import "solid-prism-editor/themes/github-light.css";
import { matchBrackets } from "solid-prism-editor/match-brackets";
import { highlightBracketPairs } from "solid-prism-editor/highlight-brackets";
import {
  highlightMatchingTags,
  matchTags,
} from "solid-prism-editor/match-tags";
import { defaultCommands, editHistory } from "solid-prism-editor/commands";
import {
  highlightSelectionMatches,
  showInvisibles,
} from "solid-prism-editor/search";
import { cursorPosition } from "solid-prism-editor/cursor";
import { indentGuides } from "solid-prism-editor/guides";
import { untrack, type Setter } from "solid-js";

import "./BaseEditor.css"

interface BaseEditorProps {
  code: string,
  language?: string,
  setCode?: Setter<string>,
  readonly?: boolean
  class?: string
}

function hideCursorExtension(): Extension {
  return (editor) => {
    editor.textarea.readOnly = true
    editor.textarea.classList.add("readonly")
  }
}

function ariaSetup(): Extension {
  return (editor) => {
    editor.textarea.setAttribute("aria-hidden", "true")
    editor.textarea.tabIndex = -1
    
    editor.container.tabIndex = 0
    editor.container.classList.add("editor-aria-selectable")
    
    editor.container.addEventListener("focus", () => {
      editor.container.classList.add("focus-visible")
    })
    editor.container.addEventListener("blur", () => {
      editor.container.classList.remove("focus-visible")
    })
    
    editor.container.addEventListener("keydown", (e) => {
      if (document.activeElement === editor.textarea) {
        return
      }
      
      if (e.key === "Enter") {
        e.preventDefault()
        editor.textarea.focus()
      }
    })
    editor.keyCommandMap["Escape"] = () => {
      editor.container.focus()
    }
  }
}

function getExtensions(
  readonly: boolean,

): Extension[] {
  if (readonly) {
    return [
      matchBrackets(),
      highlightBracketPairs(),
      matchTags(),
      highlightMatchingTags(),
      highlightSelectionMatches(),
      cursorPosition(),
      indentGuides(),
      showInvisibles(),
      hideCursorExtension()
    ]
  } else {
    return [
      matchBrackets(),
      highlightBracketPairs(),
      matchTags(),
      highlightMatchingTags(),
      defaultCommands(),
      editHistory(),
      
      highlightSelectionMatches(),
      cursorPosition(),
      indentGuides(),
      showInvisibles(),
      ariaSetup()
    ]
  }
}

export function BaseEditor(props: BaseEditorProps) {
  const staticProps = untrack(() => ({
    class: props.class,
    readonly: props.readonly, 
    initialCode: props.code
  }));

  return (
    <>
      <Editor
        value={staticProps.initialCode}
        class={staticProps.class}
        language={props.language}
        readOnly={staticProps.readonly}
        onUpdate={(value) => {
          if (props.setCode) {
            props.setCode(value)
          }
        }}
        
        insertSpaces={!staticProps.readonly}
        extensions={getExtensions(staticProps.readonly ?? false)}
      />
    </>
  )
}