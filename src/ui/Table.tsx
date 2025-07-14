import React from 'react';
import {Box, Text} from 'ink';

export interface TableColumn {
	key: string;
	header: string;
	width: string; // Now uses percentage like "20%"
}

export interface TableProps<T = any> {
	data: T[];
	columns: TableColumn[];
	selectedIndex?: number;
	loading?: boolean;
}

// Helper function to truncate text for responsive display
function truncateText(text: string, maxLength: number = 50): string {
	if (text.length <= maxLength) {
		return text;
	}
	return text.slice(0, maxLength - 3) + '...';
}

export function Table<T = any>({
	data,
	columns,
	selectedIndex = -1,
	loading = false,
}: TableProps<T>) {
	if (loading) {
		return (
			<Box flexDirection="column">
				<Text>Loading...</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			{/* Header */}
			<Box flexDirection="row">
				{columns.map(column => (
					<Box key={column.key} width={column.width}>
						<Text color="blue" bold>
							{column.header}
						</Text>
					</Box>
				))}
			</Box>

			{/* Data rows */}
			{data.length === 0 ? (
				<Box marginTop={1}>
					<Text color="gray">No data available</Text>
				</Box>
			) : (
				data.map((row, rowIndex) => (
					<Box key={rowIndex} flexDirection="row">
						<Box width="3">
							<Text color={selectedIndex === rowIndex ? 'green' : 'white'}>
								{selectedIndex === rowIndex ? '>' : ' '}
							</Text>
						</Box>
						{columns.map(column => {
							const cellValue = String((row as any)[column.key] || '');

							return (
								<Box key={column.key} width={column.width}>
									<Text color={selectedIndex === rowIndex ? 'green' : 'white'}>
										{truncateText(cellValue)}
									</Text>
								</Box>
							);
						})}
					</Box>
				))
			)}
		</Box>
	);
}
