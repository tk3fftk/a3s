import React from 'react';
import {Text, useInput} from 'ink';

interface ConfirmationDialogProps {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmationDialog({
	message,
	onConfirm,
	onCancel,
}: ConfirmationDialogProps) {
	useInput(
		(input, key) => {
			if (input.toLowerCase() === 'y') {
				onConfirm();
			} else if (input.toLowerCase() === 'n') {
				onCancel();
			} else if (key.escape || key.return) {
				// Default to cancel (No) on Escape or Enter
				onCancel();
			}
			// Ignore other key presses
		},
		{
			isActive: process.env['NODE_ENV'] !== 'test',
		},
	);

	return <Text>{message} (y/N)</Text>;
}
