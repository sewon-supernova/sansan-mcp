# sansan-mcp

[![npm version](https://img.shields.io/npm/v/sansan-mcp.svg?style=flat-square)](https://www.npmjs.com/package/sansan-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg?style=flat-square)](https://modelcontextprotocol.io)

**[Sansan](https://www.sansan.com/) と連携する Model Context Protocol サーバーです。** Claude / Cursor / Claude Code / Cline / Continue など、MCP に対応する任意のクライアントから、名刺 / 人物 / タグ / 営業活動報告 / ユーザー / 部署を操作できます。

> The English README is at [README.md](README.md).

---

## できること

導入すると、AI アシスタントから以下のような操作が可能になります。

- **人物検索が速い**：「今年トヨタと交換した名刺を Sansan から検索して」
- **連絡履歴に基づくフォローメールの下書き**：「直近 3 名の Sansan 株式会社の方に丁寧な挨拶メールを書いて」
- **会議の議事録から営業活動報告を自動作成**：「本日 14:00 の田中様との打ち合わせを Sansan に報告として登録して」
- **名刺画像の取得**：OCR 再処理、署名照合、RAG 用インデックス化など下流処理に利用可能
- **ユーザー / 部署マスタの同期**：CSV エクスポート用の独自スクリプトが不要

Sansan の [Open API v6.0](https://docs.ap.sansan.com/ja/api/openapi/index.html) に準拠し、10 req/sec のレート制限にも対応済みです。

---

## クイックスタート

### 1. Sansan API キーを発行する

Sansan の **設定 → API → Open API** から、32 桁の英数字キーを発行してください。Open API は全ての Sansan テナントで **無料** で利用できます。

### 2. MCP クライアントに登録する

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) または `%APPDATA%\Claude\claude_desktop_config.json` (Windows) を編集：

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

**Claude Code**:

```bash
claude mcp add sansan -e SANSAN_API_KEY=your-key -- npx -y sansan-mcp
```

**Cursor / Cline / Continue** — 同じく `npx -y sansan-mcp` コマンドと環境変数を設定すれば動作します。

### 3. クライアントを再起動して試す

> 「Sansan から sansan.com ドメインのメールアドレスを持つ人を検索して」

---

## ツール一覧

| ツール | 機能 |
|--------|------|
| `search_bizcards` | 会社名 / 氏名 / メール / 電話 / タグで名刺を検索 |
| `list_recent_bizcards` | 指定期間内に更新された名刺の一覧 |
| `get_bizcard` | ID で名刺 1 件を取得 |
| `get_bizcard_image` | 名刺画像 (表 / 裏) を base64 で取得 |
| `get_bizcard_tags` | 名刺に付与されたタグ一覧 |
| `create_bizcard` | 構造化データから名刺を新規作成 |
| `get_person` | 人物 (Person) レコードを取得 |
| `list_tags` | タグ一覧 |
| `list_reports` | 営業活動報告の一覧 |
| `create_report` | 商談 / 電話 / メール / オンライン会議の報告を登録 |
| `get_user` | ユーザー 1 件取得 |
| `list_users` | ユーザー一覧 (CSV) |
| `list_departments` | 部署一覧 |
| `list_organization_departments` | 部署階層 (CSV) |

すべて構造化された JSON を返します。画像と CSV エンドポイントはメタデータ付きで生のペイロードを返します。

---

## 設定

| 環境変数 | 必須 | 説明 |
|---------|------|------|
| `SANSAN_API_KEY` | はい | Sansan Open API キー (32 桁の英数字) |
| `SANSAN_APP_ID` | いいえ | Sansan Partner Program のアプリ ID。パートナー登録済みの連携でのみ必要 |
| `SANSAN_BASE_URL` | いいえ | API ベース URL の上書き。デフォルトは `https://api.sansan.com/v6.0` |

---

## 設計方針

- **エンドツーエンドで厳密な型付け**：全ツール入力を Zod で検証。HTTP クライアントは型付きエラー (`SansanAuthError`, `SansanNotFoundError`, `SansanRateLimitError`, `SansanApiError`) を返します。
- **レート制限を意識**：トークンバケットでクライアント側のスループットを 8 req/sec に制限。Sansan のサーバー側 10 req/sec を確実に下回ります。リトライループも不要、突発的な 429 もありません。
- **SDK 非依存**：`fetch` で直接実装。起動が速く、依存関係は `@modelcontextprotocol/sdk` と `zod` のみ。
- **ステートレス**：ローカルストレージなし、トークンキャッシュなし。再起動安全。

---

## 開発

```bash
git clone https://github.com/sewon-supernova/sansan-mcp.git
cd sansan-mcp
npm install
cp .env.example .env  # SANSAN_API_KEY を設定
npm run typecheck
npm run test
npm run build
npm start
```

プルリクエスト歓迎です。リリースノートは [CHANGELOG.md](CHANGELOG.md) を参照してください。

---

## ライセンス

[MIT](LICENSE) © [Sewon Kim](https://github.com/sewon-supernova)

Built in Tokyo · 東京. Sansan 株式会社とは無関係の非公式プロジェクトです。
