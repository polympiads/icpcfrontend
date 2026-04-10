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
import { onCleanup, Show, untrack, type Setter } from "solid-js";
import {
	createContext,
	createEffect,
	createSignal,
	useContext,
	type Accessor,
	type ComponentProps,
	type ParentProps,
} from "solid-js";
import clsx from "clsx";

import "./Editor.css";
import { Select } from "@kobalte/core/select";

import { createMemo, splitProps } from "solid-js";

// Import devicon SVGs as raw strings
// import ada from "devicon/icons/ada/ada-original.svg?raw";
import c from "devicon/icons/c/c-original.svg?raw";
import cpp from "devicon/icons/cplusplus/cplusplus-original.svg?raw";
import csharp from "devicon/icons/csharp/csharp-original.svg?raw";
import go from "devicon/icons/go/go-original.svg?raw";
import haskell from "devicon/icons/haskell/haskell-original.svg?raw";
import java from "devicon/icons/java/java-original.svg?raw";
import javascript from "devicon/icons/javascript/javascript-original.svg?raw";
import kotlin from "devicon/icons/kotlin/kotlin-original.svg?raw";
// import objectivec from "devicon/icons/objectivec/objectivec-original.svg?raw";
// import pascal from "devicon/icons/pascal/pascal-original.svg?raw";
import php from "devicon/icons/php/php-original.svg?raw";
import prolog from "devicon/icons/prolog/prolog-original.svg?raw";
import python from "devicon/icons/python/python-original.svg?raw"; // for both python2 & python3
import ruby from "devicon/icons/ruby/ruby-original.svg?raw";
import rust from "devicon/icons/rust/rust-original.svg?raw";
import scala from "devicon/icons/scala/scala-original.svg?raw";
import { BasePortal } from "./Portal";
import { type PolymorphicProps } from "@kobalte/core";
import { Button } from "@kobalte/core/button";
import { LoaderCircle, Upload } from "lucide-solid";

interface BaseEditorProps {
	code: string;
	language?: string;
	setCode?: Setter<string>;
	readonly?: boolean;
	class?: string;
}

function hideCursorExtension(): Extension {
	return (editor) => {
		editor.textarea.readOnly = true;
		editor.textarea.classList.add("readonly");
	};
}

function ariaSetup(): Extension {
	return (editor) => {
		editor.textarea.setAttribute("aria-hidden", "true");
		editor.textarea.tabIndex = -1;

		editor.container.tabIndex = 0;
		editor.container.classList.add("editor-aria-selectable");

		editor.container.addEventListener("focus", () => {
			editor.container.classList.add("focus-visible");
		});
		editor.container.addEventListener("blur", () => {
			editor.container.classList.remove("focus-visible");
		});

		editor.container.addEventListener("keydown", (e) => {
			if (document.activeElement === editor.textarea) {
				return;
			}

			if (e.key === "Enter") {
				e.preventDefault();
				editor.textarea.focus();
			}
		});
		editor.keyCommandMap["Escape"] = () => {
			editor.container.focus();
		};
	};
}

function getExtensions(readonly: boolean): Extension[] {
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
			hideCursorExtension(),
		];
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
			ariaSetup(),
		];
	}
}

function BaseEditor(props: BaseEditorProps) {
	const staticProps = untrack(() => ({
		class: props.class,
		readonly: props.readonly,
		initialCode: props.code,
	}));

	return (
		<Editor
			value={staticProps.initialCode}
			class={staticProps.class}
			language={props.language}
			readOnly={staticProps.readonly}
			onUpdate={(value: string) => {
				if (props.setCode) {
					props.setCode(value);
				}
			}}
			insertSpaces={!staticProps.readonly}
			extensions={getExtensions(staticProps.readonly ?? false)}
		/>
	);
}

export type AppEditorContextProps = {
	language: Accessor<string | undefined>;
	setLanguage: Setter<string | undefined>;
	code: Accessor<string>;
	setCode: Setter<string>;
	readonly?: boolean;
};

const Context = createContext<AppEditorContextProps>();

export function useAppEditorContext() {
	const context = useContext(Context);
	if (!context) {
		throw "AppEditor's components should be used inside an AppEditor component";
	}

	return context;
}

type AppEditorRootProps = {
	readonly?: boolean;
	code?: string;
	onCode?: (code: string) => void;
	language?: string;
	onLanguage?: (code: string) => void;
};

function AppEditorRoot(props: ParentProps & AppEditorRootProps) {
	const [language, setLanguage] = createSignal<string | undefined>(
		props.language,
	);
	const [code, setCode] = createSignal<string>(props.code ?? "");

	createEffect(() => {
		props.onCode?.(code());
	});
	createEffect(() => {
		const languageVal = language();
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
		readonly: props.readonly,
	};

	return <Context.Provider value={context}>{props.children}</Context.Provider>;
}

function AppEditorToolbar(props: ParentProps & ComponentProps<"div">) {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			class={clsx("flex flex-row items-center h-10", local.class)}
			{...others}
		>
			{props.children}
		</div>
	);
}

function AppEditorEditor(props: { class?: string }) {
	const { code, setCode, language, readonly } = useAppEditorContext();
	return (
		<BaseEditor
			code={code()}
			setCode={setCode}
			language={languageIdToPrismLanguage(language())}
			class={props.class}
			readonly={readonly ?? false}
		/>
	);
}

export const AppEditor = Object.assign(AppEditorRoot, {
	Toolbar: AppEditorToolbar,
	Editor: AppEditorEditor,
	LanguageSelect: LanguageSelect,
});

const languageIdToPrismId: Record<string, string | undefined> = {
	ada: "ada", // Ada
	c: "c", // C
	cpp: "cpp", // C++
	csharp: "csharp", // C#
	go: "go", // Go
	haskell: "haskell", // Haskell
	java: "java", // Java
	javascript: "javascript", // JavaScript
	kotlin: "kotlin", // Kotlin
	objectivec: "objectivec", // Objective-C
	pascal: "pascal", // Pascal
	php: "php", // PHP
	prolog: "prolog", // Prolog
	python2: "python", // Prism only has "python"
	python3: "python", // Same as above
	ruby: "ruby", // Ruby
	rust: "rust", // Rust
	scala: "scala", // Scala,
};

const languageIdToName: Record<string, string> = {
	ada: "Ada",
	c: "C",
	cpp: "C++",
	csharp: "C#",
	go: "Go",
	haskell: "Haskell",
	java: "Java",
	javascript: "JavaScript",
	kotlin: "Kotlin",
	objectivec: "Objective-C",
	pascal: "Pascal",
	php: "PHP",
	prolog: "Prolog",
	python2: "Python 2",
	python3: "Python 3",
	ruby: "Ruby",
	rust: "Rust",
	scala: "Scala",
};

function languageIdToPrismLanguage(language: string | undefined) {
	if (!language) {
		return undefined;
	}
	return language in languageIdToPrismId
		? languageIdToPrismId[language]
		: undefined;
}

type LanguageSelectProps = {
	availableLanguages: Accessor<string[]>;
};

function LanguageSelect(props: LanguageSelectProps) {
	const { language, setLanguage } = useAppEditorContext();

	createEffect(() => {
		if (!untrack(() => language()) && props.availableLanguages().length > 0) {
			setLanguage(props.availableLanguages()[0]);
		}
		if (props.availableLanguages().length === 0) {
			setLanguage(undefined);
		}
	});

	return (
		<>
			<Show when={language() === undefined}>
				<div class="p-2 flex flex-row items-center gap-2 h-full">
					<div class="h-full aspect-square animate-pulse bg-gray-300 rounded-full" />
					<div class="h-1/2 w-15 aspect-square animate-pulse bg-gray-300 rounded-full" />
				</div>
			</Show>
			<Show when={language() !== undefined}>
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
								<LanguageEntry
									language={itemProps.item.rawValue}
									class="cursor-pointer"
								/>
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

function LanguageEntry(props: PolymorphicProps<"div", { language: string }>) {
	return (
		<div
			class={clsx(
				"h-8 flex flex-row items-center py-1 px-2 duration-75 overflow-hidden",
				props.class,
			)}
		>
			<LanguageIcon language={props.language} class="h-full aspect-square" />
			<div class="py-1 pl-1 font-medium"> {languageIdToName[props.language]} </div>
		</div>
	);
}

// Colored SVGs in Devicon style (simplified for icon size)
export const adaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#02f88c"/>
  <text x="50%" y="50%" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">A</text>
</svg>`;

export const pascalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#E3A857"/>
  <text x="50%" y="50%" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">P</text>
</svg>`;

export const objcSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#438eff"/>
  <text x="50%" y="50%" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">ObjC</text>
</svg>`;

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="#ccc" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#333">?</text></svg>`;

const ICON_MAP: Record<string, string> = {
	ada: adaSvg,
	c,
	cpp,
	csharp,
	go,
	haskell,
	java,
	javascript,
	kotlin,
	objectivec: objcSvg,
	pascal: pascalSvg,
	php,
	prolog,
	python2: python,
	python3: python,
	ruby,
	rust,
	scala,
};

type LanguageIconProps = {
	language: string;
	size?: number;
	class?: string;
};

function LanguageIcon(props: LanguageIconProps) {
	const [local, rest] = splitProps(props, ["language", "size", "class"]);

	const svg = createMemo(() => {
		const langKey = local.language.toLowerCase().trim();
		return ICON_MAP[langKey] ?? FALLBACK_SVG;
	});

	return (
		<div
			class={clsx(
				local.class,
				"h-full aspect-square [&>svg]:h-full [&>svg]:w-full [&>svg]:block",
			)}
			innerHTML={svg()}
			{...rest}
		/>
	);
}

function SubmitButton(props: { onSubmit: (code: string, language: string) => Promise<void>, disable: boolean }) {
  const { code, language } = useAppEditorContext()
  const isLanguageSelected = () => language() !== undefined
  
  const [isSumbitting, setSubmitting] = createSignal(false);

  function onSubmit() {
    setSubmitting(true);

    props.onSubmit(code(), language()!)
      .finally(() => setSubmitting(false));
  }
  
  return (
    <Button
      class="h-full rounded-none cursor-pointer flex flex-row justify-center items-center bg-sky-300 disabled:bg-sky-200 disabled:cursor-default duration-100 hover:bg-sky-400 shrink-0 disabled:*:opacity-75 p-2"
      disabled={isSumbitting() || !isLanguageSelected() || props.disable}
      onClick={onSubmit}
    >
      <div class="relative w-6 h-6 top-0">
        <div
          class="absolute duration-150 ease-out"
          classList={{
            "-top-0": !isSumbitting(),
            "-top-11": isSumbitting(),
          }}
        >
          <Upload class="scale-75" />
          <div class="h-5" />
          <LoaderCircle class="animate-spin scale-75" />
        </div>
      </div>
      <div>Submit</div>
    </Button>
  )
}

export function SubmissionEditor(props: {
  onSubmit: (code: string, languageId: string) => Promise<void>;
  availableLanguages: Accessor<string[]>;
  disableSubmission?: boolean
}) {
  return (
    <div class="flex flex-col w-full h-full bg-white @container/editor overflow-hidden">
      <AppEditor>
        <AppEditor.Toolbar class="border-b border-gray-300">
          {/* Space */}
          <div class="grow" />

          <AppEditor.LanguageSelect availableLanguages={props.availableLanguages} />
          <SubmitButton onSubmit={props.onSubmit} disable={ props.disableSubmission ?? false} />
        </AppEditor.Toolbar>
        <div class="grow overflow-auto">
          <AppEditor.Editor class="h-full"/>
        </div>
      </AppEditor>
    </div>
  );
}
