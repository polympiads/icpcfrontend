import { FaSolidMountain } from "solid-icons/fa";
import { API_HOSTNAME } from "./constants";
import { UserLoginWidget } from "./User";
import { AuthProvider } from "./worker/context/AuthContext";
import { WorkerProvider } from "./worker/context/WorkerContext";

function App() {
	return (
		<WorkerProvider apiHostname={API_HOSTNAME}>
			<AuthProvider>
				<div class="w-full h-full flex flex-col">
					<div class="h-20 w-full p-3 border-b border-black/10 shadow-xl flex flex-row">
						<FaSolidMountain class="h-14 w-14 aspect-square object-cover opacity-50"/>
					
						<div class="grow"/>

						<UserLoginWidget />
					</div>
					<div class="grow w-full overflow-hidden">

					</div>
				</div>
			</AuthProvider>
		</WorkerProvider>
	);
}

export default App;
