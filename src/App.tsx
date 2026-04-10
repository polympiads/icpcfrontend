import { FaRegularCalendarAlt, FaSolidMountain, FaSolidWarning } from "solid-icons/fa";
import { Route, Router, useNavigate, useParams } from "@solidjs/router";
import { PDFViewer } from "pdfslick"

import { API_HOSTNAME } from "./constants";
import { UserLoginWidget } from "./User";
import { AuthProvider } from "./worker/context/AuthContext";
import { WorkerProvider } from "./worker/context/WorkerContext";
import { ContestSelect } from "./Contest";
import { FeedProvider } from "./worker/context/FeedContext";
import dayjs, { duration } from "dayjs";
import { Panel, SplitPanel } from "./SplitPanel";
import { useStatement } from "./worker/hooks/useProblems";
import { Button } from "@kobalte/core/button";
import { Printer, RotateCw } from "lucide-solid";
import { LoadingAnimation } from "./LoadingAnimation";
import { createEffect, createSignal, onMount, type ParentProps } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";

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
	const urlParams = useParams()
	const navigate = useNavigate()

	const [selectedTab, setSelectedTab] = createSignal("problems")
	
	const TABS = ["problems", "scoreboard", "print"]
	onMount(() => {
		const wild = urlParams.rest
		if (wild === undefined)
			throw "That component should be used for the /contests/:id/* route."
		
		if (wild === "") {
			navigate("./problems")
		} else if (TABS.includes(wild)) {
			setSelectedTab(wild)
		} else {
			navigate("/404")
		}
	})
	createEffect(() => {
		navigate(`./${selectedTab()}`)
	})

	return (
		<div class="relative w-full h-full">
			{/* <div class="absolute w-full h-full bg-white z-10">
				<ContestPageOverlay contest={contest()}/>
			</div> */}
			
			<div class="relative w-full h-full flex flex-col z-0">
				<div class="relative h-20 w-full p-3 border-b border-black/10 shadow-xl flex flex-row z-10">
					<FaSolidMountain class="h-14 w-14 aspect-square object-cover opacity-50"/>
				
					<div class="grow"/>

					<UserLoginWidget />
				</div>
				<div class="grow w-full overflow-hidden">
					<Tabs class="h-full flex flex-col" value={selectedTab()} onChange={setSelectedTab}>
						<Tabs.List class="*:bg-white *:border *:border-black/10 *:p-1 *:ui-highlighted:shadow-md *:opacity-75 *:ui-highlighted:opacity-100 *:ui-highlighted:z-10 *:ui-highlighted:hover:border-black/10 *:ui-highlighted:scale-105 *:ui-highlighted:cursor-auto *:cursor-pointer *:rounded-lg *:w-30 *:hover:opacity-100 *:hover:border-black/30 *:duration-75 px-2.5 pt-2 gap-2 flex flex-row">
							<Tabs.Trigger value="problems"> Problems </Tabs.Trigger>
							<Tabs.Trigger value="scoreboard" class="flex flex-row gap-1 justify-center items-center"> <FaRegularCalendarAlt size="1rem" class="float-left"/> Scoreboard </Tabs.Trigger>
							<Tabs.Trigger value="print" class="flex flex-row gap-1 justify-center items-center"> <Printer size="1rem"/> Print </Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="problems" class="grow w-full">
							<SplitPanel direction="horizontal" class="h-full"includeMargin>
								<Panel></Panel>
								<SplitPanel direction="vertical">
									<Panel></Panel>
									<Panel></Panel>
								</SplitPanel>
							</SplitPanel>
						</Tabs.Content>
						<Tabs.Content value="scoreboard">
							Scoreboard
						</Tabs.Content>
						<Tabs.Content value="print">
							Print
						</Tabs.Content>
					</Tabs>
				</div>
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
						<Route path="/*rest" component={InContestPage}/>
					</Route>
				</Router>
			</AuthProvider>
		</WorkerProvider>
	);
}

export default App;
