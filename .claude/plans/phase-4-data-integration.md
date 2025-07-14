# Phase 4: Data Integration

**Status**: 🔥 IN PROGRESS  
**Priority**: HIGH - CRITICAL PATH  
**Estimated Duration**: 1-2 days

## Overview

Implement real AWS data fetching and display functionality to show actual EC2 instances, S3 buckets, and other AWS resources in the TUI. This phase will connect the UI components with the provider architecture to create a fully functional AWS resource browser.

**Current State**: The UI and navigation are complete, but the app shows empty data arrays. This phase is critical to make the application functional.

## Goals

### Primary Objectives

- Connect ResourceList components to real AWS data
- Implement loading states and error handling
- Add data refresh mechanisms
- Support pagination for large datasets
- Integrate with existing provider architecture

### Secondary Objectives

- Add resource filtering capabilities
- Implement resource search functionality
- Add resource detail views
- Support multiple AWS regions

## Technical Requirements

### 1. Data Fetching Integration

#### useResources Hook Implementation

```typescript
// src/hooks/useResources.ts
export function useResources(resourceType: string, backend: string) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const provider = await createProvider(backend);
			const resources = await provider.listEC2(); // or other services
			setData(resources);
			setError(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [resourceType, backend]);

	return {data, loading, error, refresh};
}
```

#### App Component Updates

```typescript
// src/app.tsx - Connect data to ResourceList
const {data, loading, error, refresh} = useResources(
	currentScreen,
	process.env['A3S_BACKEND'] || 'auto',
);

<ResourceList
	resourceType={currentScreen}
	data={data}
	loading={loading}
	error={error}
	onRefresh={refresh}
	onBack={handleBack}
	onQuit={handleQuit}
/>;
```

### 2. Enhanced ResourceList Component

#### Props Interface Update

```typescript
interface ResourceListProps {
	resourceType: string;
	data: any[];
	loading?: boolean;
	error?: string | null;
	selectedIndex?: number;
	onBack?: () => void;
	onQuit?: () => void;
	onRefresh?: () => void;
	onSelect?: (resource: any) => void;
}
```

#### Error State Handling

```typescript
// Error display component
if (error) {
	return (
		<Box flexDirection="column" padding={1}>
			<Text color="red" bold>
				Error: {error}
			</Text>
			<Text color="gray">Press 'r' to retry or '←' to go back</Text>
		</Box>
	);
}
```

### 3. Service-Specific Implementations

#### EC2 Instance Display

```typescript
const ec2Columns: TableColumn[] = [
	{key: 'id', header: 'Instance ID', width: 20},
	{key: 'name', header: 'Name', width: 15},
	{key: 'state', header: 'State', width: 10},
	{key: 'type', header: 'Type', width: 10},
	{key: 'publicIp', header: 'Public IP', width: 15},
	{key: 'privateIp', header: 'Private IP', width: 15},
	{key: 'availabilityZone', header: 'AZ', width: 12},
	{key: 'launchTime', header: 'Launch Time', width: 20},
];
```

#### S3 Bucket Display

```typescript
const s3Columns: TableColumn[] = [
	{key: 'name', header: 'Bucket Name', width: 30},
	{key: 'region', header: 'Region', width: 15},
	{key: 'creationDate', header: 'Created', width: 20},
	{key: 'publicAccess', header: 'Public Access', width: 15},
];
```

### 4. Provider Extensions

#### Extend Provider Interface

```typescript
export interface Provider {
	listEC2(): Promise<EC2Instance[]>;
	listS3(): Promise<S3Bucket[]>;
	listLambda(): Promise<LambdaFunction[]>;
	listRDS(): Promise<RDSInstance[]>;
	// Add region support
	setRegion(region: string): void;
	getRegion(): string;
}
```

#### Enhanced Error Handling

```typescript
// Standardized error responses
interface ProviderError {
	code: string;
	message: string;
	service: string;
	retryable: boolean;
}
```

## Implementation Status

### 🔥 Current Blockers

1. **ResourceList shows empty data**

   - `data=[]` is hardcoded in app.tsx
   - No useResources hook exists
   - Providers are not connected to UI

2. **Limited Provider Implementation**
   - Only EC2 listInstances() is implemented
   - S3, Lambda, RDS throw NotImplementedYet
   - SDK provider missing default region

### 🎯 Immediate Next Steps

1. **Create useResources hook** (src/hooks/useResources.ts)
2. **Connect providers to UI** in app.tsx
3. **Implement remaining provider methods**
4. **Add loading and error states**

## Implementation Plan

### Phase 4.1: Basic Data Integration (Day 1)

#### Tasks:

1. [ ] **Create useResources hook**

   - Implement basic data fetching
   - Add loading and error states
   - Include refresh functionality

2. [ ] **Update App component**

   - Integrate useResources hook
   - Pass data to ResourceList
   - Handle loading/error states

3. [ ] **Enhance ResourceList component**

   - Accept and display real data
   - Show loading spinner
   - Display error messages
   - Add refresh capability

4. [ ] **Extend provider implementations**
   - Add S3, Lambda, RDS methods to SDK provider
   - Add corresponding CLI provider methods
   - Update factory for new methods

#### Success Criteria:

- EC2 instances display in ResourceList
- Loading states work correctly
- Error handling shows meaningful messages
- Refresh functionality works
- All existing tests pass

### Phase 4.2: Enhanced Features (Day 2)

#### Tasks:

1. [ ] **Multi-service support**

   - Implement S3 bucket listing
   - Add Lambda function listing
   - Include RDS instance listing

2. [ ] **Pagination support**

   - Handle large datasets
   - Add next/previous navigation
   - Show page indicators

3. [ ] **Region selection**

   - Add region switching capability
   - Update StatusBar to show current region
   - Persist region selection
   - Dynamic region selection menu:
     - 'R' key to open region selector
     - List available AWS regions
     - Update all providers with new region
     - Refresh data after region change
   - Profile region priority (implemented):
     - AWS_REGION env var (highest priority)
     - AWS profile region from ~/.aws/config
     - AWS_DEFAULT_REGION env var
     - Default to 'us-east-1'

4. [ ] **Search and filtering**
   - Add search input field
   - Implement client-side filtering
   - Add filter by resource state

#### Success Criteria:

- All AWS services show real data
- Pagination works for large datasets
- Region switching functions correctly
- Search filters resources effectively

## Testing Strategy

### Unit Tests

```typescript
// Test useResources hook
describe('useResources', () => {
	it('should fetch EC2 data correctly', async () => {
		// Mock provider
		// Test data fetching
		// Verify loading states
	});

	it('should handle errors gracefully', async () => {
		// Mock provider error
		// Verify error state
		// Test retry functionality
	});
});
```

### Integration Tests

```typescript
// Test full data flow
describe('Data Integration', () => {
	it('should display real AWS data', async () => {
		// Use LocalStack
		// Create test resources
		// Verify display in UI
	});
});
```

### Manual Testing

- Test with real AWS credentials
- Verify LocalStack integration
- Test error scenarios (no credentials, network issues)
- Test with large datasets

## Risk Assessment

### High Risk

- **AWS API rate limits**: Implement caching and throttling
- **Large datasets**: Pagination and virtualization needed
- **Credential issues**: Clear error messages required

### Medium Risk

- **Network latency**: Loading states and timeouts
- **Service availability**: Graceful degradation
- **Data consistency**: Refresh mechanisms

### Mitigation Strategies

- Implement request caching
- Add retry logic with exponential backoff
- Provide offline mode with cached data
- Clear error messages and recovery suggestions

## Performance Considerations

### Caching Strategy

```typescript
// Cache implementation
const cache = new Map<string, {data: any[]; timestamp: number}>();
const CACHE_TTL = 30000; // 30 seconds

function getCachedData(key: string) {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data;
	}
	return null;
}
```

### Pagination

```typescript
// Pagination parameters
interface PaginationOptions {
	pageSize: number;
	nextToken?: string;
	maxItems?: number;
}
```

## User Experience

### Loading States

- Spinner animation during data fetch
- Progress indicators for long operations
- Skeleton loading for table rows

### Error Handling

- Clear error messages
- Suggested actions (retry, check credentials)
- Graceful fallback to cached data

### Navigation

- Consistent keyboard shortcuts
- Visual indicators for interactive elements
- Breadcrumb navigation for deep views

## Dependencies

### Required

- Existing provider architecture (Phase 1)
- UI components (Phase 2)
- Integration setup (Phase 3)

### New Dependencies

- None (using existing AWS SDK and CLI)

## Definition of Done

### Functional Requirements

- [ ] Real AWS data displays in all service views
- [ ] Loading states work correctly
- [ ] Error handling provides meaningful feedback
- [ ] Refresh functionality updates data
- [ ] Multiple AWS services supported
- [ ] Search and filtering work

### Technical Requirements

- [ ] All tests pass (target: 70+ tests)
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Performance acceptable (<2s load time)
- [ ] Memory usage reasonable

### Documentation

- [ ] Update CLAUDE.md with new features
- [ ] Add troubleshooting guide
- [ ] Document keyboard shortcuts
- [ ] Update README with examples

## Future Enhancements

### Resource Actions

- Start/stop EC2 instances
- Create/delete S3 buckets
- Invoke Lambda functions
- Connect to RDS instances

### Advanced Features

- Resource tagging display
- Cost information
- Resource relationships
- CloudFormation stack views

### Performance

- Background data refresh
- Streaming for real-time updates
- Virtual scrolling for huge datasets
- Request batching and optimization

---

**Target Completion**: 2025-07-11  
**Previous Phase**: [Phase 3: Integration](phase-3-integration.md) ✅  
**Next Phase**: [Phase 6: Service Expansion](phase-6-service-expansion.md)

**Note**: Phase 5 (Navigation Enhancement) was completed ahead of schedule and is already integrated into the current implementation.
