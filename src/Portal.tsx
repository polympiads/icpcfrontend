import { createSignal, onMount } from "solid-js";
import {
	createContext,
	createUniqueId,
	useContext,
	type ParentProps,
} from "solid-js";
import { Portal } from "solid-js/web";

type PortalContextProps = {
	parentId: string;
};

const PortalContext = createContext<PortalContextProps>();

export function BasePortal(props: ParentProps) {
	const context = useContext(PortalContext);
	const [parent, setParent] = createSignal<HTMLElement | undefined>();

	onMount(() => {
		if (context) {
			const el = document.getElementById(context.parentId);
			setParent(el ?? undefined);
		}
	});

	return <Portal mount={parent()}>{props.children}</Portal>;
}

export function BasePortalRoot(props: ParentProps) {
	const id = createUniqueId();

	return (
		<PortalContext.Provider value={{ parentId: id }}>
			<div class="w-full h-full relative">
				<div class="w-full h-full absolute z-10 pointer-events-none" id={id} />
				<div class="w-full h-full z-0 relative">{props.children}</div>
			</div>
		</PortalContext.Provider>
	);
}
