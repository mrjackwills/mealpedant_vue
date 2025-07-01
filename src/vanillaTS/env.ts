import { su } from '@/types';

class Env {
	readonly #app_version = String(import.meta.env.VERSION);

	readonly #build_date = new Date(import.meta.env.BUILD_DATE);

	readonly #domain_api = String(import.meta.env.VITE_APP_DOMAIN_API);

	readonly #domain_static = String(import.meta.env.VITE_APP_DOMAIN_STATIC);

	readonly #domain_www = String(import.meta.env.VITE_APP_DOMAIN_WWW);

	readonly #mode_production = import.meta.env.VITE_APP_MODE === 'production';

	get app_version (): string {
		return this.#app_version;
	}

	get build_date (): string {
		return this.#build_date.toISOString();
	}

	get domain_api (): string {
		return this.#domain_api;
	}

	get domain_static (): string {
		return this.#domain_static;
	}

	get domain_www (): string {
		return this.#domain_www;
	}

	get mode_production (): boolean {
		return this.#mode_production;
	}

	// / Generate a url for a given photoname
	gen_photo_url (photoname: su): string {
		return `${this.domain_static}/photo/${photoname}`;
	}
}

export type TEnv = typeof Env;

export const env = new Env();
