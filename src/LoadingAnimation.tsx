import clsx from "clsx";
import { AiOutlineLoading, AiOutlineLoading3Quarters } from "solid-icons/ai";
import { VsCircleLargeFilled } from "solid-icons/vs";
import { createMemo, Show } from "solid-js";

function SpinningCircle(props: { size?: string }) {
	return (
		<div
			class="animate-spin"
			style={{ width: props.size ?? "1em", height: props.size ?? "1em" }}
		>
			<AiOutlineLoading size={props.size} class="-rotate-90 absolute" />
			<div class="animate-pulse-2x">
				<AiOutlineLoading3Quarters size={props.size} class="opacity-25" />
			</div>
		</div>
	);
}

function ThreeBouncingDots() {
	return (
		<div class="flex flex-row h-5 items-end">
			<VsCircleLargeFilled
				size="0.5em"
				class="mx-0.5 animate-three-dot-bounce"
			/>
			<VsCircleLargeFilled
				size="0.5em"
				class="mx-0.5 animate-three-dot-bounce animation-delay-333"
			/>
			<VsCircleLargeFilled
				size="0.5em"
				class="mx-0.5 animate-three-dot-bounce animation-delay-666"
			/>
		</div>
	);
}

function ThreePulsingDots(props: { size?: string; gap?: string }) {
	const dotSize = props.size ?? "0.5rem";
	const gap = props.gap ?? "0.250rem"; // default gap same as mx-0.5

	return (
		<div class="flex flex-row" style={{ gap }}>
			<VsCircleLargeFilled size={dotSize} class="animate-pulse-1/4" />
			<VsCircleLargeFilled
				size={dotSize}
				class="animate-pulse-1/4 animation-delay-222"
			/>
			<VsCircleLargeFilled
				size={dotSize}
				class="animate-pulse-1/4 animation-delay-444"
			/>
		</div>
	);
}

function WaveBackground(props: {
	waveWidth?: string;
	showBgPulse?: boolean;
	waveClass?: string;
}) {
	const class_ = createMemo(() =>
		clsx(
			"h-full w-50 bg-linear-to-r from-transparent via-gray-300/40 to-transparent rotate-4 scale-110",
			props.waveClass,
		),
	);

	return (
		<div class="w-full h-full relative overflow-hidden">
			<Show when={props.showBgPulse ?? true}>
				<div class="w-full h-full bg-gray-100 animate-pulse-2x" />
			</Show>
			<div class="absolute top-0 w-full h-full animate-wave overflow-hidden">
				<div class={class_()} style={{ width: props.waveWidth }} />
			</div>
		</div>
	);
}

export const LoadingAnimation = {
	SpinningCircle: SpinningCircle,
	ThreeBouncingDots: ThreeBouncingDots,
	ThreePulsingDots: ThreePulsingDots,
	WaveBackground: WaveBackground,
};
