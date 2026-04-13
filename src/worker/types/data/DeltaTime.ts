import dayjs from "../../../dayjs";

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
