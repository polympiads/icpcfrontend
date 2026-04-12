import type { WorkerOutgoing } from "./WorkerOutgoing";

export type WorkerListener = (msg: WorkerOutgoing) => void;
