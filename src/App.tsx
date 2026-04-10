import { FaSolidMountain } from "solid-icons/fa";
import { API_HOSTNAME } from "./constants";
import { UserLoginWidget } from "./User";
import { AuthProvider } from "./worker/context/AuthContext";
import { WorkerProvider } from "./worker/context/WorkerContext";
import { ContestPageOverlay, ContestSelect } from "./Contest";
import { Route, Router, useParams } from "@solidjs/router";
import { FeedProvider } from "./worker/context/FeedContext";
import type { ParentProps } from "solid-js";
import { useContest } from "./worker/hooks/useContest";
import dayjs, { duration } from "dayjs";

dayjs.extend(duration)

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

function InContestPage() {
	const contest = useContest()

	return (
		<div class="relative w-full h-full">
			<div class="absolute w-full h-full">
				<ContestPageOverlay contest={contest()}/>
			</div>
		</div>
	)
}

function RouteFeedWrapper(props: ParentProps) {
	const urlParams = useParams();
	if (!urlParams.id) {
		throw "This component should be used for the /contests/:id route."
	}

	return (
		<FeedProvider contestId={ urlParams.id }>
			{ props.children }
		</FeedProvider>
	)
}


function App() {
	return (
		<WorkerProvider apiHostname={API_HOSTNAME}>
			<AuthProvider>
				<Router>
					<Route path="/" component={ContestSelectionPage}/>
					<Route path="/contests/:id" component={RouteFeedWrapper}>
						<Route path="/" component={InContestPage} />
					</Route>
				</Router>
			</AuthProvider>
		</WorkerProvider>
	);
}

export default App;
