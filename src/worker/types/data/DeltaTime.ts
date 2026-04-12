import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function parseTime(time: string) {
	return dayjs(time);
}
export function parseReltime(reltime: string) {
	const [lhs, milliseconds] = reltime.split(".");
	const [hours, minutes, seconds] = lhs.split(":");

	return dayjs.duration({
		hours: Number(hours),
		minutes: Number(minutes),
		seconds: Number(seconds),
		milliseconds: Number(milliseconds),
	});
}
