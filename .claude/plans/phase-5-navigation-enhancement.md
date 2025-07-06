# Phase 5: Navigation Enhancement

**Status**: 📋 FUTURE  
**Priority**: MEDIUM  
**Estimated Duration**: 2-3 days  
**Dependencies**: Phase 4 (Data Integration)

## Overview

Enhance the navigation system with advanced keyboard controls, arrow key navigation, pagination for large datasets, search functionality, and improved user experience patterns.

## Goals

### Primary Objectives

- Implement arrow key navigation for menu items and tables
- Add pagination support for large resource lists
- Create search and filtering capabilities
- Improve keyboard shortcuts and help system
- Add resource detail views with navigation

### Secondary Objectives

- Implement breadcrumb navigation
- Add sorting capabilities for table columns
- Create customizable keyboard shortcuts
- Add navigation history and bookmarks
- Implement context-sensitive help

## Technical Requirements

### 1. Arrow Key Navigation

#### Enhanced Home Component

```typescript
// src/ui/Home.tsx - Arrow key navigation
export function Home({onSelect, onQuit}: HomeProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => Math.min(services.length - 1, prev + 1));
		} else if (key.return) {
			onSelect(services[selectedIndex].name);
		} else if (input === 'q') {
			onQuit();
		}
	});

	// Visual selection indicator
	return (
		<Box flexDirection="column">
			{services.map((service, index) => (
				<Text
					key={service.name}
					color={index === selectedIndex ? 'green' : 'gray'}
					backgroundColor={index === selectedIndex ? 'white' : undefined}
				>
					{index === selectedIndex ? '> ' : '  '}
					{service.name}
				</Text>
			))}
		</Box>
	);
}
```

#### Table Navigation

```typescript
// src/ui/Table.tsx - Row navigation
export function Table({data, columns, onSelect}: TableProps) {
	const [selectedRow, setSelectedRow] = useState(0);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedRow(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedRow(prev => Math.min(data.length - 1, prev + 1));
		} else if (key.return && onSelect) {
			onSelect(data[selectedRow]);
		}
	});

	return (
		<Box flexDirection="column">
			{data.map((row, index) => (
				<Box
					key={index}
					backgroundColor={index === selectedRow ? 'blue' : undefined}
				>
					{/* Row content */}
				</Box>
			))}
		</Box>
	);
}
```

### 2. Pagination System

#### Pagination Component

```typescript
// src/ui/Pagination.tsx
interface PaginationProps {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalItems: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	currentPage,
	totalPages,
	pageSize,
	totalItems,
	onPageChange,
}: PaginationProps) {
	useInput((input, key) => {
		if (key.leftArrow && currentPage > 1) {
			onPageChange(currentPage - 1);
		} else if (key.rightArrow && currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	});

	return (
		<Box justifyContent="space-between" padding={1}>
			<Text color="gray">
				Showing {(currentPage - 1) * pageSize + 1}-
				{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
			</Text>
			<Text color="gray">
				Page {currentPage} of {totalPages} | ←→ Navigate • Enter Select
			</Text>
		</Box>
	);
}
```

#### Paginated Resource List

```typescript
// src/hooks/usePagination.ts
export function usePagination<T>(data: T[], pageSize: number = 10) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(data.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const currentData = data.slice(startIndex, endIndex);

	const nextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
	const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
	const goToPage = (page: number) =>
		setCurrentPage(Math.max(1, Math.min(totalPages, page)));

	return {
		currentData,
		currentPage,
		totalPages,
		nextPage,
		prevPage,
		goToPage,
		hasNext: currentPage < totalPages,
		hasPrev: currentPage > 1,
	};
}
```

### 3. Search and Filtering

#### Search Component

```typescript
// src/ui/Search.tsx
interface SearchProps {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
}

export function Search({placeholder, value, onChange, onClear}: SearchProps) {
	const [isActive, setIsActive] = useState(false);

	useInput((input, key) => {
		if (key.ctrl && input === 'f') {
			setIsActive(true);
		} else if (key.escape) {
			setIsActive(false);
			onClear();
		} else if (isActive) {
			if (key.backspace) {
				onChange(value.slice(0, -1));
			} else if (input && input.length === 1) {
				onChange(value + input);
			}
		}
	});

	return (
		<Box borderStyle="single" padding={1}>
			<Text color={isActive ? 'green' : 'gray'}>
				🔍 {placeholder}: {value}
				{isActive && <Text color="yellow"> (typing...)</Text>}
			</Text>
		</Box>
	);
}
```

#### Filtering Hook

```typescript
// src/hooks/useFilter.ts
export function useFilter<T>(
	data: T[],
	searchTerm: string,
	filterFn: (item: T, term: string) => boolean,
) {
	return useMemo(() => {
		if (!searchTerm.trim()) return data;
		return data.filter(item => filterFn(item, searchTerm.toLowerCase()));
	}, [data, searchTerm, filterFn]);
}

// Usage example for EC2 instances
const filteredEC2 = useFilter(
	ec2Data,
	searchTerm,
	(instance, term) =>
		instance.name?.toLowerCase().includes(term) ||
		instance.id.toLowerCase().includes(term) ||
		instance.state.toLowerCase().includes(term),
);
```

### 4. Resource Detail Views

#### Detail View Component

```typescript
// src/ui/ResourceDetail.tsx
interface ResourceDetailProps {
	resource: any;
	resourceType: string;
	onBack: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

export function ResourceDetail({
	resource,
	resourceType,
	onBack,
	onEdit,
	onDelete,
}: ResourceDetailProps) {
	const [selectedAction, setSelectedAction] = useState(0);
	const actions = ['Back', 'Edit', 'Delete'].filter(Boolean);

	useInput((input, key) => {
		if (key.leftArrow || key.escape) {
			onBack();
		} else if (key.upArrow) {
			setSelectedAction(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedAction(prev => Math.min(actions.length - 1, prev + 1));
		} else if (key.return) {
			switch (actions[selectedAction]) {
				case 'Back':
					onBack();
					break;
				case 'Edit':
					onEdit?.();
					break;
				case 'Delete':
					onDelete?.();
					break;
			}
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="blue">
				{resourceType} Details
			</Text>

			{/* Resource properties */}
			<Box flexDirection="column" marginY={1}>
				{Object.entries(resource).map(([key, value]) => (
					<Box key={key} justifyContent="space-between">
						<Text color="gray">{key}:</Text>
						<Text>{String(value)}</Text>
					</Box>
				))}
			</Box>

			{/* Actions */}
			<Box flexDirection="column" borderStyle="single" padding={1}>
				<Text bold>Actions:</Text>
				{actions.map((action, index) => (
					<Text
						key={action}
						color={index === selectedAction ? 'green' : 'gray'}
					>
						{index === selectedAction ? '> ' : '  '}
						{action}
					</Text>
				))}
			</Box>
		</Box>
	);
}
```

### 5. Help System

#### Help Modal Component

```typescript
// src/ui/Help.tsx
export function Help({
	isVisible,
	onClose,
}: {
	isVisible: boolean;
	onClose: () => void;
}) {
	useInput((input, key) => {
		if (key.escape || input === 'q' || input === '?') {
			onClose();
		}
	});

	if (!isVisible) return null;

	return (
		<Box
			position="absolute"
			top={2}
			left={2}
			right={2}
			bottom={2}
			borderStyle="double"
			padding={1}
			backgroundColor="black"
		>
			<Box flexDirection="column">
				<Text bold color="yellow">
					Keyboard Shortcuts
				</Text>

				<Box flexDirection="column" marginTop={1}>
					<Text color="green">Navigation:</Text>
					<Text> ↑↓ - Navigate menu/list</Text>
					<Text> ←→ - Previous/Next page</Text>
					<Text> Enter - Select item</Text>
					<Text> Esc/← - Go back</Text>

					<Text color="green" marginTop={1}>
						Application:
					</Text>
					<Text> q - Quit application</Text>
					<Text> r - Refresh data</Text>
					<Text> ? - Show this help</Text>
					<Text> Ctrl+f - Search</Text>

					<Text color="green" marginTop={1}>
						Resource Actions:
					</Text>
					<Text> Enter - View details</Text>
					<Text> e - Edit resource</Text>
					<Text> d - Delete resource</Text>
				</Box>

				<Text color="gray" marginTop={1}>
					Press '?' or 'q' to close this help
				</Text>
			</Box>
		</Box>
	);
}
```

## Implementation Plan

### Phase 5.1: Basic Navigation (Day 1)

#### Tasks:

1. **Implement arrow key navigation**

   - Update Home component with up/down navigation
   - Add visual selection indicators
   - Test keyboard interaction

2. **Add table row navigation**

   - Implement row selection in Table component
   - Add visual highlighting for selected rows
   - Enable Enter key selection

3. **Create pagination component**
   - Build reusable Pagination component
   - Implement pagination hook
   - Add page navigation controls

#### Success Criteria:

- Arrow keys navigate menu items
- Table rows can be selected and highlighted
- Pagination works for large datasets
- All navigation feels responsive

### Phase 5.2: Search and Filtering (Day 2)

#### Tasks:

1. **Implement search functionality**

   - Create Search component
   - Add search input handling
   - Implement real-time filtering

2. **Add advanced filtering**

   - Create filter hooks
   - Add filter by resource state/type
   - Implement compound filters

3. **Create resource detail views**
   - Build ResourceDetail component
   - Add navigation between list and detail
   - Implement action selection

#### Success Criteria:

- Search filters resources in real-time
- Multiple filter criteria work together
- Resource details display correctly
- Navigation between list and detail is smooth

### Phase 5.3: Advanced Features (Day 3)

#### Tasks:

1. **Add help system**

   - Create Help modal component
   - Implement context-sensitive help
   - Add keyboard shortcut documentation

2. **Implement sorting**

   - Add column sorting to tables
   - Visual sort indicators
   - Multi-column sorting support

3. **Enhanced UX features**
   - Add breadcrumb navigation
   - Implement navigation history
   - Add keyboard shortcut customization

#### Success Criteria:

- Help system provides useful information
- Table sorting works correctly
- Advanced navigation features enhance UX
- All features are well-documented

## Testing Strategy

### Unit Tests

```typescript
// Test navigation components
describe('Navigation', () => {
	it('should navigate with arrow keys', () => {
		// Test Home component navigation
		// Test Table component navigation
		// Verify selection state changes
	});

	it('should handle pagination correctly', () => {
		// Test pagination hook
		// Verify page calculations
		// Test boundary conditions
	});
});
```

### Integration Tests

```typescript
// Test full navigation flows
describe('Navigation Flow', () => {
	it('should navigate from home to resource detail', () => {
		// Navigate through menu
		// Select resource list
		// Open resource detail
		// Navigate back
	});
});
```

### Accessibility Tests

- Screen reader compatibility
- Keyboard-only navigation
- Color contrast verification
- Focus management testing

## User Experience Design

### Visual Feedback

- Clear selection indicators
- Smooth state transitions
- Consistent color scheme
- Responsive animations

### Keyboard Patterns

- Industry-standard shortcuts
- Consistent key mappings
- Context-sensitive help
- Muscle memory optimization

### Information Hierarchy

- Clear visual structure
- Logical navigation flow
- Prominent action indicators
- Effective use of whitespace

## Performance Considerations

### Large Dataset Handling

- Virtual scrolling for huge lists
- Lazy loading of details
- Efficient search algorithms
- Memory usage optimization

### Responsive Navigation

- Debounced search input
- Efficient re-rendering
- Minimal state updates
- Optimized event handling

## Definition of Done

### Functional Requirements

- [ ] Arrow key navigation works in all components
- [ ] Pagination handles large datasets effectively
- [ ] Search and filtering provide instant feedback
- [ ] Resource detail views are fully navigable
- [ ] Help system provides comprehensive guidance
- [ ] All keyboard shortcuts work consistently

### Technical Requirements

- [ ] All tests pass (target: 85+ tests)
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Performance remains acceptable with large datasets
- [ ] Memory usage stays within reasonable bounds

### User Experience

- [ ] Navigation feels intuitive and responsive
- [ ] Visual feedback is clear and immediate
- [ ] Keyboard shortcuts follow conventions
- [ ] Help system is easily accessible
- [ ] Error states are handled gracefully

## Future Enhancements

### Advanced Navigation

- Tab-based interface for multiple resources
- Split-pane views for comparison
- Floating action panels
- Customizable layouts

### Productivity Features

- Quick actions and shortcuts
- Batch operations on multiple resources
- Saved searches and filters
- Navigation bookmarks

### Accessibility

- Full screen reader support
- High contrast mode
- Font size customization
- Voice navigation support

---

**Target Completion**: After Phase 4  
**Previous Phase**: [Phase 4: Data Integration](phase-4-data-integration.md)  
**Next Phase**: [Phase 6: Service Expansion](phase-6-service-expansion.md)
