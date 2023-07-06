import type { APIRoute } from "astro";

export const get: APIRoute = async ({ request, redirect, cookies }) => {
	cookies.delete("session", {
		path: "/",
	});
	return redirect(request.headers.get("Referer") || "/");
};