import { FaSolidMountain } from "solid-icons/fa";
import { API_HOSTNAME, CONTEST_URL_PATTERN, ROOT_URL } from "./constants";
import { UserLoginWidget } from "./User";
import { AuthProvider } from "./worker/context/AuthContext";
import { WorkerProvider } from "./worker/context/WorkerContext";
import { ContestSelect } from "./Contest";
import { Route, Router } from "@solidjs/router";

function ContestSelectionPage() {
	return (
		<div class="w-full h-full flex flex-col">
			<div class="h-20 w-full p-3 border-b border-black/10 shadow-xl flex flex-row">
				<FaSolidMountain class="h-14 w-14 aspect-square object-cover opacity-50"/>
			
				<div class="grow"/>

				<UserLoginWidget />
			</div>
			<div class="grow w-full overflow-hidden">
				<ContestSelect />
			</div>
		</div>
	)
}

function App() {
	return (
		<WorkerProvider apiHostname={API_HOSTNAME}>
			<AuthProvider>
				<Router>
					<Route path="/" component={ContestSelectionPage}/>
					<Route path="/contests/:id">

					</Route>
				</Router>
			</AuthProvider>
		</WorkerProvider>
	);
}

export default App;
