# a3s - 現在の実装状況

## プロジェクト概要

k9s 風の AWS リソースブラウザ TUI - Ink v4 と TypeScript で構築

### アーキテクチャ設計

**プロジェクト構造**（現在の状態）:

```
src/
├── cli.tsx              # エントリーポイント ✅
├── app.tsx              # メインアプリケーション ✅
├── providers/           # バックエンドプロバイダー ✅
│   ├── types.ts         # Provider インターフェース ✅
│   ├── sdk-provider.ts  # AWS SDK v3 実装 ✅ (EC2のみ実装)
│   ├── cli-provider.ts  # AWS CLI 実装 ✅ (EC2のみ実装)
│   └── factory.ts       # プロバイダーファクトリー ✅
├── ui/                  # UI コンポーネント ✅
│   ├── home.tsx         # ホーム画面 ✅
│   ├── resource-list.tsx # リソース一覧 ✅ (空データ表示)
│   ├── status-bar.tsx    # ステータスバー ✅
│   └── table.tsx        # テーブル表示 ✅
├── hooks/               # カスタムフック
│   └── useNavigation.ts # ナビゲーションフック ✅
│   └── useResources.ts  # リソース取得・更新（未実装）❌
├── utils/               # ユーティリティ（未実装）❌
│   └── config.ts        # 環境変数管理
└── types/               # 型定義 ✅
    └── resources.ts     # リソース型 ✅
```

**バックエンド戦略**:

- **SdkProvider**: AWS SDK v3 使用、未実装 API は`NotImplementedYet`エラー
- **CliProvider**: execa で AWS CLI 実行、JSON 解析
- **Factory**: 環境変数`A3S_BACKEND`で選択、`auto`モードで SDK→CLI フォールバック

## 実装済み機能

### 1. アーキテクチャ ✅

- **Provider Pattern**: AWS SDK v3 と CLI 両方のバックエンドサポート
- **Factory Pattern**: 環境変数による動的プロバイダー選択
- **Type Safety**: 完全な TypeScript 型定義
- **ES Modules**: モダンな JavaScript モジュール対応

### 2. Backend Providers ✅

- **SdkProvider** (`src/providers/sdk-provider.ts`): AWS SDK v3 を使用
- **CliProvider** (`src/providers/cli-provider.ts`): AWS CLI の execa 実行
- **ProviderFactory** (`src/providers/factory.ts`): 環境変数によるプロバイダー選択
- **型定義** (`src/providers/types.ts`): Provider 共通インターフェース

### 3. UI Components ✅

- **Home** (`src/ui/Home.tsx`): メイン画面とサービス選択
- **ResourceList** (`src/ui/ResourceList.tsx`): リソース一覧表示
- **StatusBar** (`src/ui/StatusBar.tsx`): ステータス表示
- **Table** (`src/ui/Table.tsx`): テーブル表示コンポーネント

### 4. Type Definitions ✅

- **Resources** (`src/types/resources.ts`): AWS リソース型定義

### 5. Navigation System ✅

- **useNavigation Hook** (`src/hooks/useNavigation.ts`): キーボードナビゲーション
- **矢印キー**: ↑↓ でメニュー選択移動
- **Vim キー**: j/k でメニュー選択移動
- **ラップアラウンド**: 最初 ↑ で最後へ、最後 ↓ で最初へ
- **Enter**: 選択実行
- **q**: 終了
- **Escape/←**: 前画面へ戻る

### 6. Testing ✅

- **テスト数**: 59+ 個のテストケース (全て合格)
- **カバレッジ**: 全コンポーネントとプロバイダー
- **フレームワーク**: Vitest + ink-testing-library
- **TDD**: 完全な TDD プロセスで開発済み

### 7. Build & DevOps ✅

- **Docker**: マルチステージビルド対応
- **Docker Compose**: LocalStack 統合開発環境
- **npm scripts**: 開発ワークフロー整備
- **Linting**: oxlint による品質チェック
- **Prettier**: コードフォーマット

## 現在の問題点

### 1. データ統合の欠如

- **問題**: ResourceList コンポーネントは常に空の`data=[]`を表示
- **原因**: `useResources`フックが未実装
- **影響**: UI とナビゲーションは完成しているが、実際の AWS データが表示されない

### 2. プロバイダーの部分的実装

- **EC2 のみ**: listInstances()メソッドのみ実装済み
- **S3, Lambda, RDS**: NotImplementedYet エラーを返す
- **SDK Provider**: デフォルトリージョン設定が欠如

## 技術スタック

### Dependencies

- **ink**: ^4.1.0 (UI Framework)
- **@aws-sdk/client-ec2**: ^3.843.0 (AWS SDK)
- **execa**: ^9.6.0 (CLI 実行)
- **meow**: ^11.0.0 (CLI 引数解析)
- **react**: ^18.2.0 (UI Library)

### Dev Dependencies

- **vitest**: ^3.2.4 (テストフレームワーク)
- **ink-testing-library**: ^3.0.0 (テストユーティリティ)
- **oxlint**: ^1.5.0 (Linter)
- **typescript**: ^5.0.3 (型チェック)

## 環境設定

### 環境変数

- `A3S_BACKEND`: プロバイダー選択 (sdk|cli|auto)
- `AWS_PROFILE`: AWS プロファイル設定
- `COLOR_BLIND`: カラーブラインド対応

### NPM Scripts

- `npm run build`: TypeScript → JavaScript コンパイル
- `npm run dev`: 開発モード（watch）
- `npm run test`: 全テスト実行
- `npm run test:watch`: TDD 用テスト watch
- `npm run lint`: コード品質チェック

## 進捗状況

### 完了済み (Phase 1-3, 5)

- [x] Phase 1: プロジェクト構造設計
- [x] Phase 2: Provider アーキテクチャ実装
- [x] Phase 2: UI コンポーネント実装
- [x] Phase 3: エントリーポイントの統合
- [x] Phase 5: キーボードナビゲーション実装
- [x] テスト完備 (59+ テスト全て合格)
- [x] 型定義完了
- [x] Docker 開発環境

### 次のステップ (Phase 4: データ統合)

- [ ] `useResources`フック実装 (データフェッチング)
- [ ] 実際の AWS リソース取得・表示
- [ ] ローディング状態とエラーハンドリング
- [ ] S3, Lambda, RDS プロバイダー実装
- [ ] データリフレッシュ機能
- [ ] フィルタリング機能

## UI・UX 設計

### 画面遷移

1. **Home 画面**: EC2, S3, Lambda, RDS メニュー
2. **↑↓ / j k** で選択、**Enter** でリスト画面
3. **リスト画面**: テーブル表示、フィルタ機能
4. **q** で戻る

### キーバインド

- `↑↓` / `j k`: 選択移動
- `Enter`: 画面遷移
- `/`: フィルタ入力
- `r`: 手動リフレッシュ
- `q`: 戻る/終了
- `P`: AWS プロファイル切り替えメニュー
- `:profile` + Enter: プロファイル一覧・切り替え
- `:profile profile-name` + Enter: 直接プロファイル切り替え

### ステータスバー

- `Backend: SDK|CLI|SDK+CLI` 表示
- 現在の画面名
- 更新時刻
- AWS アカウント ID
- AWS プロファイル名

## 品質指標

- **テスト**: 59 個全てのテストケース
- **型安全性**: 100% TypeScript
- **アーキテクチャ**: クリーンな Provider パターン
- **依存関係**: 最小限のサードパーティ依存

---

_最終更新: 2025-07-10_
