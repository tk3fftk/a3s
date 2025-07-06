import React from 'react';
import {Box, Text} from 'ink';

export interface TableColumn {
	key: string;
	header: string;
	width: number;
}

export interface TableProps<T = any> {
	data: T[];
	columns: TableColumn[];
	selectedIndex?: number;
	loading?: boolean;
}

function truncateText(text: string, maxWidth: number): string {
	if (text.length <= maxWidth) {
		return text;
	}
	return text.slice(0, maxWidth - 3) + '...';
}

function padText(text: string, width: number): string {
	return text.padEnd(width).slice(0, width);
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
				{columns.map((column, index) => (
					<Text key={column.key} color="blue" bold>
						{padText(column.header, column.width)}
						{index < columns.length - 1 ? ' ' : ''}
					</Text>
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
						<Text color={selectedIndex === rowIndex ? 'green' : 'white'}>
							{selectedIndex === rowIndex ? '>' : ' '}
						</Text>
						<Text> </Text>
						{columns.map((column, colIndex) => {
							const cellValue = String((row as any)[column.key] || '');
							const truncatedValue = truncateText(cellValue, column.width);
							const paddedValue = padText(truncatedValue, column.width);

							return (
								<Text
									key={column.key}
									color={selectedIndex === rowIndex ? 'green' : 'white'}
								>
									{paddedValue}
									{colIndex < columns.length - 1 ? ' ' : ''}
								</Text>
							);
						})}
					</Box>
				))
			)}
		</Box>
	);
}
