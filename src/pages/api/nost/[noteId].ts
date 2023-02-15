import type { APIContext } from "astro";
import hashids from "src/lib/hashids";
import supabase from "src/lib/supabase";

export const post = async (ctx: APIContext) => {
	if (ctx.request.method !== "POST") {
		return new Response(null, { status: 400 })
	}
	const { noteId } = ctx.params
	if (!noteId) {
		return new Response(null, { status: 400 })
	}
	const id = hashids.decode(noteId).pop()
	if (id === undefined) {
		return new Response(null, { status: 404 })
	}
	const content = await ctx.request.text()
	const { error, statusText } = await supabase.from("nost").upsert({ id: id, content })
	if (error) {
		return new Response(error.message, { status: 500 })
	}
	return new Response(statusText)
}