# Phase 2: UI Components

**Status**: ✅ COMPLETED  
**Duration**: UI implementation phase  
**Test Coverage**: 29 tests passing

## Overview

Implemented a complete React-based terminal user interface using Ink v4, providing an intuitive k9s-style navigation experience for AWS resource browsing.

## Architecture Design

### Component Hierarchy

```
App (src/app.tsx)
├── Home (src/ui/Home.tsx)
│   └── Service selection menu
├── ResourceList (src/ui/ResourceList.tsx)
│   └── Table (src/ui/Table.tsx)
└── StatusBar (src/ui/StatusBar.tsx)
```

### Core Components

1. **App Component** (`src/app.tsx`)

   - Main application container
   - Screen routing and state management
   - Global keyboard event handling
   - Quit functionality with 'q' key

2. **Home Component** (`src/ui/Home.tsx`)

   - AWS service selection menu
   - Navigation instructions
   - Service descriptions
   - Interactive keyboard controls

3. **ResourceList Component** (`src/ui/ResourceList.tsx`)

   - Resource display with table view
   - Back navigation support
   - Loading states
   - Service-specific column configurations

4. **Table Component** (`src/ui/Table.tsx`)

   - Generic data table implementation
   - Configurable columns and widths
   - Row selection highlighting
   - Loading state display

5. **StatusBar Component** (`src/ui/StatusBar.tsx`)
   - Backend status indicator
   - AWS profile display
   - System information

## Implementation Details

### Screen Management

```typescript
type Screen = 'home' | 'ec2' | 's3' | 'lambda' | 'rds';

const [currentScreen, setCurrentScreen] = useState<Screen>('home');
```

### Keyboard Navigation

- **Enter**: Select service/item
- **←/Escape**: Back to previous screen
- **q/Ctrl+C**: Quit application
- **↑↓**: Navigate menu items (future)

### Component Props Interface

```typescript
interface HomeProps {
	onSelect: (service: string) => void;
	selectedIndex?: number;
	onQuit?: () => void;
}

interface ResourceListProps {
	resourceType: string;
	data: EC2Instance[];
	selectedIndex?: number;
	loading?: boolean;
	onBack?: () => void;
	onQuit?: () => void;
}
```

## Test Strategy

### Component Testing

- Ink Testing Library for React components
- Render testing for all components
- Props validation and behavior testing
- Keyboard interaction testing (non-test env only)

### Test Coverage

- Home component: 7 tests
- ResourceList component: 7 tests
- Table component: 7 tests
- StatusBar component: 8 tests

## Key Features Implemented

✅ **React-based TUI**

- Modern React patterns with hooks
- Ink v4 framework integration
- TypeScript for type safety

✅ **Service Selection Menu**

- Four AWS services: EC2, S3, Lambda, RDS
- Visual selection indicators
- Service descriptions

✅ **Resource Display**

- Table-based data presentation
- Configurable column layouts
- Loading state management

✅ **Navigation System**

- Intuitive keyboard controls
- Back navigation support
- Consistent UX patterns

✅ **Status Information**

- Backend type display
- AWS profile indication
- System status visibility

✅ **Interactive Controls**

- Global quit functionality
- Screen-specific key handlers
- Test environment safety

## File Structure

```
src/
├── app.tsx                   # Main application
├── ui/
│   ├── Home.tsx              # Service selection
│   ├── Home.test.tsx         # Home tests
│   ├── ResourceList.tsx      # Resource display
│   ├── ResourceList.test.tsx # ResourceList tests
│   ├── Table.tsx             # Data table
│   ├── Table.test.tsx        # Table tests
│   ├── StatusBar.tsx         # Status display
│   └── StatusBar.test.tsx    # StatusBar tests
└── types/
    └── resources.ts          # Type definitions
```

## Technical Decisions

### Why Ink v4?

- **React Paradigm**: Familiar development model
- **Component Reusability**: Modular UI architecture
- **Testing Support**: Comprehensive testing tools
- **Performance**: Efficient terminal rendering

### Why Component-based Architecture?

- **Separation of Concerns**: Each component has single responsibility
- **Reusability**: Components can be reused across screens
- **Testability**: Easy to test individual components
- **Maintainability**: Clear code organization

### Why TypeScript Props?

- **Type Safety**: Compile-time prop validation
- **IDE Support**: Auto-completion and error detection
- **Documentation**: Props serve as component API docs
- **Refactoring**: Safe interface changes

## Design Patterns

### Container-Presentational Pattern

- **App**: Container component managing state
- **UI Components**: Presentational components receiving props
- **Clear Separation**: Logic vs. presentation

### Event Delegation

- **Global Events**: Handled at App level
- **Component Events**: Handled at component level
- **Event Bubbling**: Proper event propagation

### Conditional Rendering

- **Environment-aware**: Different behavior in test vs. runtime
- **State-based**: Rendering based on application state
- **Progressive Enhancement**: Graceful feature degradation

## User Experience Design

### Visual Hierarchy

- **Color Coding**: Different colors for different states
- **Typography**: Bold text for emphasis
- **Spacing**: Consistent padding and margins

### Navigation Patterns

- **k9s-inspired**: Familiar to kubectl/k9s users
- **Consistent Keys**: Same keys work across screens
- **Visual Feedback**: Clear selection indicators

### Information Architecture

- **Service Overview**: Clear service descriptions
- **Resource Details**: Comprehensive table columns
- **Status Information**: Always-visible status bar

## Lessons Learned

1. **Test Environment Handling**: useInput hooks need environment checks
2. **Component Composition**: Small, focused components work better
3. **Props Interface Design**: Clear interfaces improve maintainability
4. **Event Handling**: Global vs. local event management
5. **Visual Design**: Terminal UI requires careful color/spacing choices

## Future Enhancements

- Add arrow key navigation for menu items
- Implement resource detail views
- Add search and filtering capabilities
- Improve visual design with better colors
- Add help screen with keyboard shortcuts
- Implement resource refresh functionality

---

**Completed**: 2025-07-06  
**Previous Phase**: [Phase 1: Provider Architecture](phase-1-provider-architecture.md)  
**Next Phase**: [Phase 3: Integration](phase-3-integration.md)
