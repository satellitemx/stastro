import type { APIRoute } from "astro";
import { fbAdminAuth } from "src/firebase/server";
import { z } from "zod";

const updateUserInfoSchema = z.string().min(1)

export const post: APIRoute = async ({ request, redirect, locals }) => {
	const formData = await request.formData()
	const { user } = locals
	if (!user) {
		return new Response(null, { status: 401 })
	}
	const parsed = await updateUserInfoSchema.safeParseAsync(formData.get("displayName"))
	if (!parsed.success) {
		return new Response(parsed.error.message, { status: 400 })
	}
	await fbAdminAuth.updateUser(user.uid, {
		displayName: parsed.data,
	})
	return redirect(request.headers.get("Referer") || "/")
}