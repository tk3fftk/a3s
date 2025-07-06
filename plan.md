# a3s MVP Implementation Plan

## 概要
k9s ライクな AWS リソース閲覧 TUI。ハイブリッド・バックエンド方式（AWS SDK v3 + AWS CLI フォールバック）でMVP実装。

## アーキテクチャ設計

### 1. プロジェクト構造
```
src/
├── cli.tsx              # エントリーポイント
├── app.tsx              # メインアプリケーション
├── providers/           # バックエンドプロバイダー
│   ├── types.ts         # Provider インターフェース
│   ├── sdk-provider.ts  # AWS SDK v3 実装
│   ├── cli-provider.ts  # AWS CLI 実装
│   └── factory.ts       # プロバイダーファクトリー
├── ui/                  # UI コンポーネント
│   ├── home.tsx         # ホーム画面
│   ├── resource-list.tsx # リソース一覧
│   ├── status-bar.tsx   # ステータスバー
│   └── error-display.tsx # エラー表示
├── hooks/               # カスタムフック
│   └── use-resources.ts # リソース取得・更新
├── utils/               # ユーティリティ
│   └── config.ts        # 環境変数管理
└── types/               # 型定義
    └── resources.ts     # リソース型
```

### 2. 主要インターフェース

#### Provider インターフェース
```typescript
interface Provider {
  listEC2(): Promise<EC2Instance[]>;
  listS3(): Promise<S3Bucket[]>;
  listLambda(): Promise<LambdaFunction[]>;
  listRDS(): Promise<RDSInstance[]>;
}
```

#### リソース型
```typescript
interface EC2Instance {
  id: string;
  name: string;
  state: string;
  type: string;
  publicIp?: string;
  privateIp?: string;
}

interface S3Bucket {
  name: string;
  region: string;
  creationDate: string;
}
```

### 3. バックエンド戦略

#### SdkProvider
- AWS SDK v3 を使用
- 未実装 API は `NotImplementedYet` エラーを throw

#### CliProvider
- execa で AWS CLI を実行
- `aws ec2 describe-instances --output json` など
- stdout を JSON.parse して結果を返す

#### Factory パターン
- 環境変数 `A3S_BACKEND` で選択
- `auto` モードでは SDK → CLI へフォールバック

### 4. UI 設計

#### 画面遷移
1. Home 画面（EC2, S3, Lambda, RDS メニュー）
2. ↑↓ / j k で選択、Enter でリスト画面
3. リスト画面（テーブル表示、フィルタ機能）
4. q で戻る

#### キーバインド
- `↑↓` / `j k`: 選択移動
- `Enter`: 画面遷移
- `/`: フィルタ入力
- `r`: 手動リフレッシュ
- `q`: 戻る/終了
- `P`: AWS プロファイル切り替えメニュー
- `:profile` + Enter: プロファイル一覧・切り替え
- `:profile profile-name` + Enter: 直接プロファイル切り替え

#### ステータスバー
- `Backend: SDK|CLI|SDK+CLI` 表示
- 現在の画面名
- 更新時刻
- AWS アカウント ID
- AWS プロファイル名

### 5. 環境変数
- `A3S_BACKEND=sdk|cli|auto` (デフォルト: auto)
- `AWS_PROFILE`: AWS プロファイル
- `COLOR_BLIND=1`: カラーブラインド対応
- `AWS_ENDPOINT_URL`: カスタム AWS エンドポイント (LocalStack 等)
- `AWS_ACCESS_KEY_ID`: AWS アクセスキー (AWS_PROFILE 未設定時のみ必要)
- `AWS_SECRET_ACCESS_KEY`: AWS シークレット (AWS_PROFILE 未設定時のみ必要)
- `AWS_DEFAULT_REGION`: AWS リージョン (デフォルト: us-east-1)

## 実装タスク

### Phase 1: 基盤実装
1. **依存関係更新**
   - AWS SDK v3, execa, ink-table, jest 追加
   - 既存の AVA から Jest へ移行

2. **Provider 実装**
   - `Provider` インターフェース定義
   - `SdkProvider` 実装（EC2 のみ）
   - `CliProvider` 実装（EC2, S3）
   - `Factory` 実装

3. **UI 基盤**
   - 画面遷移管理
   - キーバインド処理
   - ステータスバー

### Phase 2: 機能実装
1. **Home 画面**
   - サービス一覧表示
   - 選択機能

2. **リソース一覧画面**
   - テーブル表示
   - フィルタ機能
   - 自動更新（10秒）

3. **プロファイル切り替え機能**
   - AWS プロファイル一覧表示
   - 実行時プロファイル切り替え
   - ステータスバーへのアカウント ID・プロファイル名表示

4. **エラーハンドリング**
   - 画面下部にエラー表示
   - Provider フォールバック

### Phase 3: テスト・文書化
1. **テスト実装**
   - Provider 切替テスト
   - UI スナップショットテスト

2. **README 作成**
   - セットアップ手順
   - キーバインド一覧
   - バックエンド切替方法

## 技術的考慮事項

### パフォーマンス
- useResources フックで効率的な状態管理
- 10秒自動更新のメモリリーク防止
- 大量データの仮想化（将来対応）

### エラーハンドリング
- 認証エラー、権限エラーの適切な表示
- ネットワークエラー時の再試行
- CLI 未インストール時の警告

### 拡張性
- 新サービス追加の容易さ
- カスタムフィルタ機能
- 設定ファイル対応（将来）

## TDD 開発ルール

### 必須ルール
1. **Red-Green-Refactor サイクル厳守**
   - 失敗するテストを書く (Red)
   - 最小限のコードで通す (Green)
   - リファクタリング (Refactor)

2. **テストファースト**
   - 実装コードを書く前に必ずテストを書く
   - テストが通らない限り実装を進めない

3. **小さなステップ**
   - 一度に一つの機能のみ実装
   - 各コミットは必ずテストが通る状態

### テスト戦略
- **Unit Tests**: Provider, Factory, Utils
- **Integration Tests**: Provider 切替動作
- **UI Tests**: コンポーネント動作
- **E2E Tests**: 全体的な画面遷移

### 実装順序（TDD）

1. **Provider インターフェース** (TDD)
   - テスト: Provider 型定義
   - 実装: types.ts

2. **SdkProvider EC2** (TDD)
   - テスト: EC2 一覧取得
   - 実装: sdk-provider.ts

3. **CliProvider EC2** (TDD)
   - テスト: AWS CLI 実行・JSON パース
   - 実装: cli-provider.ts

4. **Factory** (TDD)
   - テスト: 環境変数による切替
   - 実装: factory.ts

5. **NotImplementedYet フォールバック** (TDD)
   - テスト: SDK → CLI 自動切替
   - 実装: フォールバック機能

6. **Home 画面** (TDD)
   - テスト: メニュー表示・選択
   - 実装: home.tsx

7. **リスト画面** (TDD)
   - テスト: テーブル表示・フィルタ
   - 実装: resource-list.tsx

8. **S3 対応** (TDD)
   - テスト: S3 CliProvider
   - 実装: S3 機能追加

## 初回リリース範囲

- EC2: SdkProvider, CliProvider
- S3:SdkProvider, CliProvider

## 未実装（対応予定）
- Lambda: 両 Provider
- RDS: 両 Provider
- S3: SdkProvider

この計画により、段階的かつ確実に a3s MVP を実装できます。

# Reference

k9sの実装を参考にする場合はこのページを参照してください。

- https://k9scli.io/ 
- https://github.com/derailed/k9s
