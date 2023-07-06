import { defineMiddleware, sequence } from "astro/middleware"
import { getAuth } from "firebase-admin/auth"
import { cloneDeep } from "lodash-es"
import { fbAdmin } from "src/firebase/server"

const defaultMiddleLocals: App.Locals = {
	user: {
		isLoggedIn: false,
	}
}

const auth = getAuth(fbAdmin)

const authentication = defineMiddleware(async (context, next) => {
	const thisMiddlewareLocals = cloneDeep(defaultMiddleLocals)

	const sessionCookie = context.cookies.get("session").value
	if (sessionCookie) {
		const decodedCookie = await auth.verifySessionCookie(sessionCookie)
		if (decodedCookie) {
			thisMiddlewareLocals.user.isLoggedIn = true
			thisMiddlewareLocals.user.name = decodedCookie.name
			thisMiddlewareLocals.user.email = decodedCookie.email
		}
	}

	context.locals = thisMiddlewareLocals
	return next()
})

export const onRequest = sequence(authentication)