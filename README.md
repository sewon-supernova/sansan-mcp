# sansan-mcp

[![npm version](https://img.shields.io/npm/v/sansan-mcp.svg?style=flat-square)](https://www.npmjs.com/package/sansan-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg?style=flat-square)](https://modelcontextprotocol.io)

**A Model Context Protocol server for [Sansan](https://www.sansan.com/), Japan's largest business card / contact management platform (60,000+ companies).** Brings Sansan's business cards, persons, tags, sales activity reports, users, and departments into Claude, Cursor, Claude Code, Cline, Continue, or any MCP-compatible client.

**14 tools** for actions, **6 resources** for direct context loading via `sansan://` URIs, **5 prompts** for sales-workflow slash commands.

> 日本語版の README は [README.ja.md](README.ja.md) にあります。

---

## What you can do

Once installed, your AI assistant can:

- **Find people fast.** *"Search Sansan for anyone at Toyota I exchanged cards with this year."*
- **Draft follow-up emails grounded in real contact history.** *"Draft a polite Japanese intro email to the last 3 people I met from Sansan Inc."*
- **Log meetings back into Sansan from a transcript.** *"Create a Sansan report for today's 14:00 meeting with Tanaka-san at Acme — minutes attached."*
- **Pull a digitized business card image** for downstream OCR, signature verification, or RAG indexing.
- **Sync the user roster and department tree** to your own systems without a one-off export script.

The server speaks Sansan's [Open API v6.0](https://docs.ap.sansan.com/en/api/openapi/index.html) and respects its 10 req/sec rate limit out of the box.

---

## Quick start

### 1. Get your Sansan API key

In Sansan, go to **Settings → API → Open API** and issue a 32-character key. The Open API is **free of charge** for all Sansan tenants.

### 2. Add to your MCP client

**Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "sansan": {
      "command": "npx",
      "args": ["-y", "sansan-mcp"],
      "env": {
        "SANSAN_API_KEY": "your-32-character-key"
      }
    }
  }
}
```

**Claude Code**:

```bash
claude mcp add sansan -e SANSAN_API_KEY=your-key -- npx -y sansan-mcp
```

**Cursor / Cline / Continue** — point them at the same `npx -y sansan-mcp` command with the environment variable set.

### 3. Restart your client and try a prompt

> "Search Sansan for anyone at sansan.com with email ending in @sansan.com — return their cards."

---

## Tools

| Tool | What it does |
|------|--------------|
| `search_bizcards` | Search business cards by company, name, email, phone, or tag. |
| `list_recent_bizcards` | List cards updated in an ISO 8601 time window. |
| `get_bizcard` | Fetch a single card by ID with all extracted fields. |
| `get_bizcard_image` | Get the JPEG image (front or back) as base64. |
| `get_bizcard_tags` | List tags attached to a card. |
| `create_bizcard` | Register a card from structured fields (no image). |
| `get_person` | Fetch a consolidated Person record across cards. |
| `list_tags` | List tags by visibility, owner, or name prefix. |
| `list_reports` | List sales activity reports in a time window. |
| `create_report` | Log a meeting, call, email, or online meeting. |
| `get_user` | Fetch a single tenant user. |
| `list_users` | Download the user roster as CSV. |
| `list_departments` | Paginated department list. |
| `list_organization_departments` | Download the full department hierarchy as CSV. |

All tools return structured JSON. Image and CSV endpoints return raw payloads wrapped with metadata.

---

## Resources

Resources expose Sansan data via stable `sansan://` URIs. In Claude Desktop / Code, you can reference them directly with `@` mentions — the client pulls the resource into context without explicitly calling a tool.

| URI | Mime | Description |
|-----|------|-------------|
| `sansan://bizcard/{id}` | `application/json` | Full business card (with tags). |
| `sansan://bizcard/{id}/image` | `image/jpeg` | Front-side card image (base64 blob). |
| `sansan://person/{id}` | `application/json` | Consolidated person record across cards. |
| `sansan://tags` | `application/json` | All tags visible to the API key. |
| `sansan://users` | `text/csv` | Tenant user roster. |
| `sansan://departments` | `text/csv` | Department hierarchy. |

Example prompt: *"@sansan://bizcard/abc123 — draft a follow-up email to this contact in Japanese keigo."*

---

## Prompts

Prompts are pre-built sales-workflow templates. In compatible clients they appear as slash commands.

| Prompt | What it does |
|--------|--------------|
| `/weekly_sales_recap` | Weekly recap of Sansan activity, grouped by company and type, with follow-up suggestions. |
| `/find_warm_contacts` | Rank contacts at a target company by recency and engagement signals. |
| `/analyze_contact` | Structured analysis of a single contact (fit, deal potential, or relationship health). |
| `/draft_followup_email` | Draft a context-aware follow-up email in JP keigo or business EN. |
| `/meeting_recap_to_report` | Convert a meeting transcript into a confirm-and-send `create_report` payload. |

Each prompt takes structured arguments (e.g. `bizcard_id`, `language`, `tone`) that the client surfaces as fields.

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SANSAN_API_KEY` | yes | Your Sansan Open API key (32 alphanumeric chars). |
| `SANSAN_APP_ID` | no | Sansan Partner Program app ID. Only required for partner-registered integrations. |
| `SANSAN_BASE_URL` | no | Override the API base URL. Defaults to `https://api.sansan.com/v6.0`. |

---

## Design notes

- **Strict typing end-to-end.** Every tool input is validated by Zod. The HTTP client returns typed errors (`SansanAuthError`, `SansanNotFoundError`, `SansanRateLimitError`, `SansanApiError`).
- **Rate-limit aware.** A token bucket caps client-side throughput at 8 req/sec, comfortably below Sansan's 10/sec server limit. No retry loops, no surprise 429s.
- **No SDK dependency.** Built directly on `fetch`. Boot time is fast and the dependency footprint is just `@modelcontextprotocol/sdk` + `zod`.
- **Stateless.** No local storage, no token caching. Restart-safe.

---

## Development

```bash
git clone https://github.com/sewon-supernova/sansan-mcp.git
cd sansan-mcp
npm install
cp .env.example .env  # fill in SANSAN_API_KEY
npm run typecheck
npm run test
npm run build
npm start
```

Pull requests welcome. See [CHANGELOG.md](CHANGELOG.md) for release notes.

---

## License

[MIT](LICENSE) © [Sewon Kim](https://github.com/sewon-supernova)

Built in Tokyo · 東京. Not affiliated with Sansan, Inc.
