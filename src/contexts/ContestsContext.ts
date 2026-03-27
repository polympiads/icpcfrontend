import { type Accessor } from "solid-js";
import type { Contest } from "../worker/types/data/Contest";
import { useContests } from "../worker/hooks/useContests";

// dayjs.extend(duration);

// function createMockContestContext(): Accessor<Contest[] | undefined> {
//   const { is_authenticated } = useUserLoginContext();

//     const publicContests: Contest[] = [
//       {
//         id: "contest1",
//         name: "contest1",
//         formal_name: "Scheduled Contest",
//         start_time: dayjs().add(1, "hour"),
//         countdown_pause_time: undefined,
//         duration: dayjs.duration({ hours: 4 }),
//         scoreboard_type: "pass-fail",
//         penalty_time: dayjs.duration({ minutes: 2 }),
//         scoreboard_freeze_time: dayjs(),
//         scoreboard_thaw_time: dayjs(),
//       },
//       {
//         id: "contest2",
//         name: "contest2",
//         formal_name: "Ongoing contest",
//         start_time: dayjs().add(-2, "hour"),
//         countdown_pause_time: undefined,
//         duration: dayjs.duration({ hours: 4 }),
//         scoreboard_type: "pass-fail",
//         penalty_time: dayjs.duration({ minutes: 2 }),
//         scoreboard_freeze_time: dayjs(),
//         scoreboard_thaw_time: dayjs(),
//       },
//       {
//         id: "contest2",
//         name: "contest2",
//         formal_name: "On the end contest",
//         start_time: dayjs().add(-3, "hour").add(-59, "minute"),
//         countdown_pause_time: undefined,
//         duration: dayjs.duration({ hours: 4 }),
//         scoreboard_type: "pass-fail",
//         penalty_time: dayjs.duration({ minutes: 2 }),
//         scoreboard_freeze_time: dayjs(),
//         scoreboard_thaw_time: dayjs(),
//       },
//       {
//         id: "contest2",
//         name: "contest2",
//         formal_name: "Paused contest",
//         start_time: undefined,
//         countdown_pause_time: dayjs.duration({ minutes: 30 }),
//         duration: dayjs.duration({ hours: 4 }),
//         scoreboard_type: "pass-fail",
//         penalty_time: dayjs.duration({ minutes: 2 }),
//         scoreboard_freeze_time: dayjs(),
//         scoreboard_thaw_time: dayjs(),
//       },
//       {
//         id: "contest2",
//         name: "contest2",
//         formal_name: "Finished contest",
//         start_time: dayjs().add(-4, "hour"),
//         countdown_pause_time: undefined,
//         duration: dayjs.duration({ hours: 4 }),
//         scoreboard_type: "pass-fail",
//         penalty_time: dayjs.duration({ minutes: 2 }),
//         scoreboard_freeze_time: dayjs(),
//         scoreboard_thaw_time: dayjs(),
//       },
//     ];
//   return createMemo(() => {

//     if (is_authenticated()) {
//       const auth_contests: Contest[] = [
//         {
//           id: "contest1",
//           name: "contest1",
//           formal_name: "Scheduled Contest",
//           start_time: dayjs().add(1, "hour"),
//           countdown_pause_time: undefined,
//           duration: dayjs.duration({ hours: 4 }),
//           scoreboard_type: "pass-fail",
//           penalty_time: dayjs.duration({ minutes: 2 }),
//           scoreboard_freeze_time: dayjs(),
//           scoreboard_thaw_time: dayjs(),
//         },
//         {
//           id: "contest2",
//           name: "contest2",
//           formal_name: "Ongoing contest",
//           start_time: dayjs().add(-2, "hour"),
//           countdown_pause_time: undefined,
//           duration: dayjs.duration({ hours: 4 }),
//           scoreboard_type: "pass-fail",
//           penalty_time: dayjs.duration({ minutes: 2 }),
//           scoreboard_freeze_time: dayjs(),
//           scoreboard_thaw_time: dayjs(),
//         },
//         {
//           id: "contest2",
//           name: "contest2",
//           formal_name: "On the end contest",
//           start_time: dayjs().add(-3, "hour").add(-55, "minute"),
//           countdown_pause_time: undefined,
//           duration: dayjs.duration({ hours: 4 }),
//           scoreboard_type: "pass-fail",
//           penalty_time: dayjs.duration({ minutes: 2 }),
//           scoreboard_freeze_time: dayjs(),
//           scoreboard_thaw_time: dayjs(),
//         },
//         {
//           id: "contest2",
//           name: "contest2",
//           formal_name: "Paused contest",
//           start_time: undefined,
//           countdown_pause_time: dayjs.duration({ minutes: 30 }),
//           duration: dayjs.duration({ hours: 4 }),
//           scoreboard_type: "pass-fail",
//           penalty_time: dayjs.duration({ minutes: 2 }),
//           scoreboard_freeze_time: dayjs(),
//           scoreboard_thaw_time: dayjs(),
//         },
//         {
//           id: "contest2",
//           name: "contest2",
//           formal_name: "Finished contest",
//           start_time: dayjs().add(-4, "hour"),
//           countdown_pause_time: undefined,
//           duration: dayjs.duration({ hours: 4 }),
//           scoreboard_type: "pass-fail",
//           penalty_time: dayjs.duration({ minutes: 2 }),
//           scoreboard_freeze_time: dayjs(),
//           scoreboard_thaw_time: dayjs(),
//         },
//       ];

//       return [...publicContests, ...auth_contests];
//     }

//     return publicContests;
//   });
// }

export function useContestsContext(): Accessor<Contest[] | undefined> {
  return useContests();
}
