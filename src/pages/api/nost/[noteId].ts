import type { APIContext } from "astro";
import hashids from "src/lib/hashids";
import supabase from "src/lib/supabase";

export const post = async (ctx: APIContext) => {
	if (ctx.request.method !== "POST") {
		return new Response("Invalid HTTP Method.", { status: 400 })
	}
	const { noteId } = ctx.params
	if (!noteId) {
		return new Response("No Nost address supplied.", { status: 400 })
	}
	const id = hashids.decode(noteId).pop()
	if (id === undefined) {
		return new Response("Cannot decode Nost address.", { status: 404 })
	}
	const payload = await ctx.request.formData()
	const { error, statusText } = await supabase.from("nost").upsert({ id: id, content: payload.get("content") })
	if (error) {
		return new Response(error.message, { status: 500 })
	}
	return new Response(statusText)
}