import type { APIRoute } from "astro";
import { fbAdminDb } from "src/firebase/server";

export const post: APIRoute = async (ctx) => {
	const { noteId } = ctx.params
	if (!noteId) {
		return new Response("No Nost address.", { status: 400 })
	}
	const payload = await ctx.request.formData()
	const content = payload.get("content")

	try {
		await fbAdminDb.collection("nost").doc(noteId).set({
			content,
		}, {
			mergeFields: ["content"]
		})
	} catch (e) {
		console.log(e)
		return new Response("Failed to update document", { status: 500 })
	}

	return new Response("success")
}