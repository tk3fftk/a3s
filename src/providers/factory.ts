import {Provider} from './types.js';
import {SdkProvider} from './sdk-provider.js';
import {CliProvider} from './cli-provider.js';

export type BackendType = 'sdk' | 'cli' | 'auto';

export class ProviderFactory {
	static create(): Provider {
		const backendType = this.getBackendType();

		switch (backendType) {
			case 'sdk':
				return new SdkProvider();
			case 'cli':
				return new CliProvider();
			case 'auto':
				// Default to SDK provider for auto mode
				return new SdkProvider();
			default:
				throw new Error(
					`Invalid A3S_BACKEND: ${backendType}. Must be one of: sdk, cli, auto`,
				);
		}
	}

	static getBackendType(): BackendType {
		const backend = process.env['A3S_BACKEND']?.toLowerCase() as BackendType;

		if (!backend) {
			return 'auto';
		}

		if (!['sdk', 'cli', 'auto'].includes(backend)) {
			throw new Error(
				`Invalid A3S_BACKEND: ${backend}. Must be one of: sdk, cli, auto`,
			);
		}

		return backend;
	}
}
