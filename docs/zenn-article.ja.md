---
title: "Sansan の名刺・営業データを Claude / Cursor から触れる MCP サーバーを作った"
emoji: "💼"
type: "tech"
topics: ["mcp", "claude", "sansan", "ai", "typescript"]
published: false
---

## はじめに

[Sansan](https://www.sansan.com/) は国内 60,000 社以上が利用する名刺・接点管理プラットフォームで、Open API も無料で公開されています。一方で、Claude / Cursor / Cline などの MCP クライアントから直接触れるためのサーバーは、ほぼ存在しない状態でした。

今回、Sansan の Open API v6.0 をラップした MCP サーバー `sansan-mcp` を作って公開しました。

- リポジトリ: https://github.com/sewon-supernova/sansan-mcp
- npm: `npx -y sansan-mcp`
- ライセンス: MIT

この記事では、できること・導入方法・実装上のポイントを書きます。

## できること

AI アシスタントに以下のような指示が通るようになります。

> 今月トヨタと交換した名刺を Sansan から検索して、まだ返信していない人をリストアップして

> 田中様との打ち合わせの議事録を要約して、Sansan に営業活動報告として登録して

> Sansan の部署マスタを CSV で取得して、社内 Slack のチャネル設計と差分を確認して

商談メモを Claude に貼り付けて「Sansan に報告として登録して」と一言伝えるだけで、`create_report` ツールが呼ばれて Sansan 上に履歴が残ります。

## ツール一覧

合計 14 ツールを 6 つのドメインに分けて実装しています。

| ドメイン | ツール |
|---------|-------|
| 名刺 | `search_bizcards`, `list_recent_bizcards`, `get_bizcard`, `get_bizcard_image`, `get_bizcard_tags`, `create_bizcard` |
| 人物 | `get_person` |
| タグ | `list_tags` |
| 営業活動報告 | `list_reports`, `create_report` |
| ユーザー | `get_user`, `list_users` |
| 部署 | `list_departments`, `list_organization_departments` |

## 導入

### 1. Sansan API キーを発行

Sansan の **設定 → API → Open API** から 32 桁の英数字キーを発行します。Open API は全テナントで無料です。

### 2. Claude Desktop の場合

`~/Library/Application Support/Claude/claude_desktop_config.json` に以下を追記します。

```json
{
  "mcpServers": {
    "sansan": {
      "command": "npx",
      "args": ["-y", "sansan-mcp"],
      "env": {
        "SANSAN_API_KEY": "発行した32桁のキー"
      }
    }
  }
}
```

### 3. Claude Code の場合

```bash
claude mcp add sansan -e SANSAN_API_KEY=your-key -- npx -y sansan-mcp
```

### 4. Cursor / Cline / Continue

同じく `npx -y sansan-mcp` と環境変数を設定するだけで動きます。

## 使い方の例

クライアントを再起動した後、以下のように話しかけます。

> Sansan で「sansan.com」のメールドメインを持つ人を全部検索して、3 件だけ抜粋して表示して

Claude が `search_bizcards` を呼び、`email: sansan.com` の絞り込みで結果を返してくれます。

> 上から 3 人目の名刺画像を取得して、その人の役職を画像から読み取って

`get_bizcard_image` で base64 画像が返り、Claude が画像認識で役職を抽出します。

> 来週月曜の 10 時から 11 時、Acme の山田様と打ち合わせ予定。Sansan に営業活動報告として「予定」で登録して

`create_report` が `type: "Meeting"` で呼ばれ、Sansan 上に予定が登録されます。

## 実装のポイント

### 1. Zod による厳密な型バリデーション

ツール入力は全て Zod スキーマで検証しています。誤った日付フォーマット・存在しないステータス値・上限超過の `limit` などは、Sansan の API に到達する前にクライアント側で弾かれます。

```typescript
const ListReportType = z.enum(['Meeting', 'Call', 'Email', 'BizCardExchange', 'OnlineMeeting']);

inputSchema: {
  updatedFrom: z.string().describe('ISO 8601 lower bound (inclusive).'),
  updatedTo: z.string().describe('ISO 8601 upper bound (inclusive).'),
  type: z.array(ListReportType).optional(),
  // ...
}
```

### 2. トークンバケットによるレート制限制御

Sansan は API キーごとに 10 req/sec の制限があります。クライアント側で 8 req/sec のトークンバケットを実装し、サーバー側の上限を絶対に超えない設計にしています。

```typescript
this.bucket = new TokenBucket(8, 8);  // 8 burst, 8 refill/sec

async request<T>(options: RequestOptions): Promise<T> {
  await this.bucket.acquire();
  // ...
}
```

### 3. 型付きエラー

認証失敗・Not Found・レート制限・その他の API エラーをそれぞれ独立した例外クラスに分けています。エラーハンドリングの分岐がシンプルになります。

```typescript
if (res.status === 401) throw new SansanAuthError(endpoint, parsed);
if (res.status === 404) throw new SansanNotFoundError(endpoint, parsed);
if (res.status === 429) throw new SansanRateLimitError(endpoint, parsed);
```

### 4. SDK 非依存

`@kintone/rest-api-client` のような SDK は使わず、`fetch` を直接使っています。起動が速く、依存関係は `@modelcontextprotocol/sdk` と `zod` の 2 つだけです。

## 今後

- 名刺画像のアップロードによる OCR 登録 (`POST /bizCards/images`, multipart/form-data)
- 一括 import 系エンドポイント
- アクセス権設定 (管理者向け)

Issue / PR 歓迎です。

## まとめ

国内の SaaS 大手の多くが MCP サーバーを公開し始めていますが、Sansan はまだほぼ空白でした。`sansan-mcp` を使うと、Claude や Cursor から名刺データを直接検索したり、商談履歴を一行のプロンプトで Sansan に登録できます。

営業 / マーケティング / カスタマーサクセスの方の業務効率化に役立てば嬉しいです。

- GitHub: https://github.com/sewon-supernova/sansan-mcp
- 作者: [Sewon Kim](https://github.com/sewon-supernova) (Software engineer in Tokyo)
