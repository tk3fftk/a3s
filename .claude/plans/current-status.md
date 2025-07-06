# a3s - 現在の実装状況

## プロジェクト概要

k9s 風の AWS リソースブラウザ TUI - Ink v4 と TypeScript で構築

### アーキテクチャ設計

**プロジェクト構造**（完成時）:

```
src/
├── cli.tsx              # エントリーポイント
├── app.tsx              # メインアプリケーション
├── providers/           # バックエンドプロバイダー ✅
│   ├── types.ts         # Provider インターフェース ✅
│   ├── sdk-provider.ts  # AWS SDK v3 実装 ✅
│   ├── cli-provider.ts  # AWS CLI 実装 ✅
│   └── factory.ts       # プロバイダーファクトリー ✅
├── ui/                  # UI コンポーネント ✅
│   ├── Home.tsx         # ホーム画面 ✅
│   ├── ResourceList.tsx # リソース一覧 ✅
│   ├── StatusBar.tsx    # ステータスバー ✅
│   └── Table.tsx        # テーブル表示 ✅
├── hooks/               # カスタムフック（未実装）
│   └── useResources.ts  # リソース取得・更新
├── utils/               # ユーティリティ（未実装）
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

### 5. Testing ✅

- **テスト数**: 59 個のテストケース
- **カバレッジ**: 全コンポーネントとプロバイダー
- **フレームワーク**: Vitest + ink-testing-library
- **TDD**: 完全な TDD プロセスで開発済み

## 現在の問題点

### 1. エントリーポイントの不整合

- **問題**: `source/` ディレクトリに古いボイラープレートが残存
- **現状**: `source/app.tsx`と`source/cli.tsx`が古い"Hello World"実装
- **解決策**: 新しいアーキテクチャに合わせてエントリーポイントを更新

### 2. テストの小さな問題

- **SDK Provider**: AWS EC2 クライアントのリージョン設定が未設定
- **Integration Test**: エラーハンドリングの期待値が実際の動作と不一致

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

### 完了済み (Phase 1-2)

- [x] プロジェクト構造設計
- [x] Provider アーキテクチャ実装
- [x] UI コンポーネント実装
- [x] テスト完備
- [x] 型定義完了

### 次のステップ (Phase 3)

- [ ] エントリーポイントの統合
- [ ] テストの問題修正
- [ ] 実際の AWS リソース取得機能
- [ ] キーボードナビゲーション実装

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

_最終更新: 2025-07-06_
