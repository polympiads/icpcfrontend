export function loginEndpoint() {
	return "login/";
}
export function whoamiEndpoint() {
	return "whoami/";
}
export function contestEndpoint() {
	return "contests/";
}
export function feedEndpoint(feed: string) {
	return `contests/${feed}/eventfeed/`;
}
