/// <reference types="astro/client" />


declare namespace App {
	interface Locals {
		user: {
			isLoggedIn: boolean;
			name?: string | undefined;
			email?: string | undefined;
		}
	}
}

interface ImportMetaEnv {
	readonly FIREBASE_PRIVATE_KEY_ID: string;
	readonly FIREBASE_PRIVATE_KEY: string;
	readonly FIREBASE_PROJECT_ID: string;
	readonly FIREBASE_CLIENT_EMAIL: string;
	readonly FIREBASE_CLIENT_ID: string;
	readonly FIREBASE_AUTH_URI: string;
	readonly FIREBASE_TOKEN_URI: string;
	readonly FIREBASE_AUTH_CERT_URL: string
	readonly FIREBASE_CLIENT_CERT_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}