import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { balloonDictsEquals, balloonEquals } from "../types/data/Balloons";

export function useBalloons() {
	const feed = useFeed();

	return createMemo(
		() => {
			return feed().balloons;
		},
		undefined,
		{
			equals: balloonDictsEquals,
		},
	);
}
export function useBalloon(balloonId: string) {
	const feed = useFeed();

	return createMemo(
		() => {
			return feed().balloons[balloonId];
		},
		undefined,
		{
			equals: balloonEquals,
		},
	);
}
