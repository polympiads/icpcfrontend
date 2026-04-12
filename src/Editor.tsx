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

import { splitProps } from "solid-js";

import { BasePortal } from "./Portal";
import { LanguageEntry } from "./Languages";

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
