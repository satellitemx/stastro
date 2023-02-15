import Hashids from "hashids"

const ALPHABET = "qweryupasdfghjklzxcvbm23456789"

const hashids = (() => {
	const instance = new Hashids(
		import.meta.env.HASHIDS_SECRET, // secret
		4, // min length
		ALPHABET, // allowed characters
	)
	return instance
})()

export default hashids