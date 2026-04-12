import type { WhoAmI } from "../types/data/WhoAmI";

export class SessionDB {
	static async openDB() {
		return new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("SessionDB", 1);

			request.onupgradeneeded = (_event) => {
				const db = request.result;
				if (!db.objectStoreNames.contains("sessions")) {
					db.createObjectStore("sessions", { keyPath: "id" });
				}
			};

			request.onsuccess = (_event) => resolve(request.result);
			request.onerror = (_event) => reject(request.error);
		});
	}

	static getSessionInformation(): Promise<{
		sessionId: string | undefined;
		whoami: WhoAmI;
	}> {
		return new Promise<{ sessionId: string | undefined; whoami: WhoAmI }>(
			async (resolve, reject) => {
				const db = await SessionDB.openDB();

				const transaction = db.transaction("sessions", "readonly");
				const store = transaction.objectStore("sessions");

				const getRequest = store.get("active_user");

				getRequest.onerror = (event) => reject(event.target);
				getRequest.onsuccess = (_event) => {
					const result = getRequest.result;

					if (result) {
						resolve(result);
					} else {
						resolve({
							sessionId: undefined,
							whoami: { is_authenticated: false },
						});
					}
				};

				transaction.oncomplete = () => db.close();
			},
		);
	}

	static async setSessionInformation(
		sessionId: string | undefined,
		whoami: WhoAmI,
	) {
		return new Promise<undefined>(async (resolve, reject) => {
			const db = await SessionDB.openDB();

			const transaction = db.transaction("sessions", "readwrite");
			const store = transaction.objectStore("sessions");

			const sessionRecord = {
				id: "active_user",
				sessionId: sessionId,
				whoami: whoami,
			};

			const addRequest = store.put(sessionRecord);

			addRequest.onsuccess = (_event) => resolve(undefined);
			addRequest.onerror = (event) => reject(event.target);
		});
	}
}
