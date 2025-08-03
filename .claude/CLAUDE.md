# Claude Code 開発指示

## 基本開発方針

- **TDD アプローチ**: テスト駆動開発を厳格に実施する
- **日本語応答**: 回答は日本語で行う
- **高品質維持**: 98.3% テスト成功率 (113/115) を維持または向上させる

## テスト戦略指針

### Integration vs Component Testing の使い分け

#### Integration Testing を使用する場合:

- **App レベルのナビゲーション**: 複数コンポーネント間の相互作用
- **キーボード入力の end-to-end テスト**: 実際のユーザー操作の模擬
- **環境変数**: `ENABLE_TEST_INPUT=true` を設定してテスト入力を有効化

#### Component Testing を使用する場合:

- **個別コンポーネントの描画**: 構造とコンテンツのテスト
- **Props の処理**: コンポーネントが props を正しく処理するかのテスト
- **Mock useInput**: グローバル mock を使用し、stdin simulation は行わない

### useInput Mocking System

#### Sophisticated Mocking Pattern:

```typescript
// Integration tests (App.test.tsx)
let inputHandlers: Array<{callback: Function; options: any}> = [];

vi.mock('ink', async () => {
	const actual = await vi.importActual('ink');
	return {
		...actual,
		useInput: vi.fn((callback, options = {}) => {
			if (options.isActive !== false) {
				inputHandlers.push({callback, options});
			}
		}),
	};
});

// Selective handler triggering
const simulateKeyPress = (input: string, key: any = {}) => {
	const activeHandlers = inputHandlers.filter(
		handler => handler.options.isActive !== false,
	);

	// Navigation keys: first handler (useNavigation)
	// Back keys: last handler (ResourceList useInput)
	let handlerToTrigger;
	if (key.leftArrow || key.escape) {
		handlerToTrigger = activeHandlers.slice(-1);
	} else {
		handlerToTrigger = activeHandlers.slice(0, 1);
	}

	handlerToTrigger.forEach(handler => {
		handler.callback(input, key);
	});
};
```

### Hook Implementation Guidelines

#### Test-Friendly Hook Pattern:

```typescript
export function useNavigation(
	itemCount: number,
	onSelect?: (index: number) => void,
	onQuit?: () => void,
	isActive: boolean = true,
	allowTestInput: boolean = false,
) {
	// Always call useInput (React Hooks Rules)
	useInput(
		(input, key) => {
			// Navigation logic
		},
		{
			isActive:
				isActive &&
				(allowTestInput ||
					typeof process === 'undefined' ||
					process.env['NODE_ENV'] !== 'test'),
		},
	);

	// Return testable interface
	return {
		selectedIndex,
		moveUp: () => {
			/* programmatic interface */
		},
		moveDown: () => {
			/* programmatic interface */
		},
		select: () => onSelect?.(selectedIndex),
		quit: () => onQuit?.(),
	};
}
```

### Environment Variable Control

#### Integration Test Environment Setup:

```typescript
describe('App Integration Tests', () => {
	beforeEach(() => {
		process.env['ENABLE_TEST_INPUT'] = 'true';
	});

	afterEach(() => {
		delete process.env['ENABLE_TEST_INPUT'];
	});
});
```

## 品質保証指針

### React Hooks Rules 遵守

- **絶対に hook を条件付きで呼び出さない**
- **isActive オプション** を使用して動作を制御
- **同じ順序** で常に hook を呼び出す

### Test Coverage Standards

- **新機能**: 必ず対応するテストを実装
- **Regression 防止**: 既存テストの成功を維持
- **Integration + Unit**: 両レベルでのテストカバレッジ

### Code Review Points

- React Hooks Rules violation のチェック
- Test 環境での stdin.ref エラーの回避
- 重複テストの排除と統合
- 適切な test strategy の選択

## 開発ワークフロー

1. **計画**: 明確な目標設定
2. **TDD**: Red → Green → Refactor
3. **Feedback 対応**: 即座に品質問題を修正
4. **Document 更新**: 学習内容の記録
5. **Test 確認**: `npm test` での全テスト成功確認
