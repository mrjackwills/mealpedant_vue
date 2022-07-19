class Env {
	readonly #api_key = String(process.env.VUE_APP_APIKEY);
	readonly #app_version = String(process.env.VUE_APP_VERSION);
	readonly #domain_api = String(process.env.VUE_APP_DOMAIN_API);
	readonly #domain_static = String(process.env.VUE_APP_DOMAIN_STATIC);
	readonly #domain_www = String(process.env.VUE_APP_DOMAIN_WWW);
	readonly #build_date = String(process.env.VUE_APP_BUILDDATE);
	readonly #github = String(process.env.VUE_APP_GITHUB);
	readonly #mode_production = process.env.VUE_APP_MODE === 'production' ;

	get api_key (): string {
		return this.#api_key;
	}

	get app_version (): string {
		return this.#app_version;
	}

	get build_date (): string {
		return this.#build_date;
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

	get github (): string {
		return this.#github;
	}

	get mode_production (): boolean {
		return this.#mode_production;
	}
}

export const env = new Env();