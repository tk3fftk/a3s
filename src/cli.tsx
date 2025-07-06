#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ a3s

	Options
		--backend  Backend to use (sdk|cli|auto) [default: auto]
		--profile  AWS profile to use

	Examples
	  $ a3s
	  $ a3s --backend=cli
	  $ a3s --profile=production
`,
	{
		importMeta: import.meta,
		flags: {
			backend: {
				type: 'string',
				default: 'auto',
			},
			profile: {
				type: 'string',
			},
		},
	},
);

// Set environment variables from CLI flags
if (cli.flags.backend) {
	process.env['A3S_BACKEND'] = cli.flags.backend;
}
if (cli.flags.profile) {
	process.env['AWS_PROFILE'] = cli.flags.profile;
}

const {waitUntilExit} = render(<App />);

await waitUntilExit();
