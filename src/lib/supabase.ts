import { createClient } from "@supabase/supabase-js"

const supabase = (() => {
	const client = createClient(
		import.meta.env.SUPABASE_URL,
		import.meta.env.SUPABASE_PUBLIC_KEY
	)
	return client
})()

export default supabase