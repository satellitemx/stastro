import { defineMiddleware, sequence } from "astro/middleware"
import { getAuth } from "firebase-admin/auth"
import { cloneDeep } from "lodash-es"
import { fbAdmin, fbAdminAuth } from "src/firebase/server"

const defaultMiddleLocals: App.Locals = {
	user: null,
}

const auth = getAuth(fbAdmin)

const authentication = defineMiddleware(async (context, next) => {
	const thisMiddlewareLocals = cloneDeep(defaultMiddleLocals)

	const sessionCookie = context.cookies.get("session")?.value
	if (sessionCookie) {
		const decodedCookie = await auth.verifySessionCookie(sessionCookie)
		const user = await fbAdminAuth.getUser(decodedCookie.uid)
		if (user) {
			thisMiddlewareLocals.user = {
				displayName: user.displayName,
				emailVerified: user.emailVerified,
				email: user.email,
				uid: user.uid,
			}
		}
	}

	context.locals = thisMiddlewareLocals
	return next()
})

export const onRequest = sequence(authentication)