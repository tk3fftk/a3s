# 元の plan.md のアーカイブ

> このファイルは、元々の plan.md の内容をアーカイブしたものです。
> 現在は.claude/plans/システムに統合され、より整理された形で管理されています。

## TDD 開発ルール（元 plan.md より）

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

## 技術的考慮事項（元 plan.md より）

### パフォーマンス

- useResources フックで効率的な状態管理
- 10 秒自動更新のメモリリーク防止
- 大量データの仮想化（将来対応）

### エラーハンドリング

- 認証エラー、権限エラーの適切な表示
- ネットワークエラー時の再試行
- CLI 未インストール時の警告

### 拡張性

- 新サービス追加の容易さ
- カスタムフィルタ機能
- 設定ファイル対応（将来）

## 初回リリース範囲（元 plan.md より）

- EC2: SdkProvider, CliProvider
- S3: SdkProvider, CliProvider

## 未実装（対応予定）

- Lambda: 両 Provider
- RDS: 両 Provider

## 参考資料

- https://k9scli.io/
- https://github.com/derailed/k9s

---

_このアーカイブは 2025-07-06 に作成されました_
_現在の計画は.claude/plans/current-status.md と roadmap.md を参照してください_
