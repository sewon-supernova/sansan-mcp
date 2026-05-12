# Social posts for sansan-mcp launch

## X (Japanese, primary)

```
Sansan の Open API を Claude / Cursor / Cline から触れる MCP サーバーを作って公開しました 💼

`npx -y sansan-mcp` で導入できます。

名刺検索、人物取得、営業活動報告の登録など 14 ツール。
TypeScript + Zod + レート制限まで詰めた MIT ライセンス。

https://github.com/sewon-supernova/sansan-mcp

#MCP #Sansan #Claude
```

## X (English)

```
Built an MCP server for Sansan (Japan's largest business card platform, 60k+ companies).

Claude / Cursor / Cline can now search 名刺, log sales meetings, and pull org structure straight from the API.

14 tools, TypeScript, rate-limit aware, MIT.

https://github.com/sewon-supernova/sansan-mcp
```

## LinkedIn (English, for B2B reach)

```
For anyone working with Japanese sales teams: I've open-sourced sansan-mcp, an MCP server for Sansan — Japan's largest business card and contact management platform (60,000+ companies).

It lets Claude, Cursor, Cline, and any MCP-compatible AI client directly:

→ Search business cards by company / name / email / phone / tag
→ Pull consolidated Person records across multiple cards
→ Log sales activity reports (meetings, calls, emails) back into Sansan
→ Sync the user roster and department tree

Built on Sansan's Open API v6.0 (free for all tenants). TypeScript, Zod-validated, rate-limit aware, MIT licensed.

GitHub: https://github.com/sewon-supernova/sansan-mcp

If your team uses Sansan and Claude / Cursor / Cline, this should drop in directly with one config block. Feedback welcome.
```

## Zenn / Qiita (Japanese)

See `zenn-article.ja.md` in this folder.

## Reddit r/ClaudeAI / r/mcp (English)

```
Title: [Release] sansan-mcp — MCP server for Sansan, Japan's largest business-card platform

I just open-sourced an MCP server for Sansan, which is the dominant business card / contact management platform in Japan (used by 60k+ companies). Their Open API is free but had basically no AI-side tooling — only a tiny sub-package on a generic agent kit existed.

14 tools across 6 API domains: business cards (search/get/image/tags/create), persons, tags, sales activity reports (list/create), users, departments.

Stack: TypeScript, Zod input validation, typed errors, token-bucket rate limiter (8 req/sec under Sansan's 10/sec cap). No SDK dependency, just fetch + the MCP SDK.

Repo: https://github.com/sewon-supernova/sansan-mcp

Works out of the box with Claude Desktop, Claude Code, Cursor, Cline, Continue.

Would love feedback from anyone working with Japanese B2B SaaS or running AI agents over a CRM.
```

## Hacker News Show HN (English)

```
Show HN: sansan-mcp — bring Japan's largest business card platform into Claude / Cursor

https://github.com/sewon-supernova/sansan-mcp

Sansan is the dominant contact-management SaaS in Japan with 60,000+ companies. Their Open API is free and well-documented, but there hasn't been a real MCP server for it — just a one-file sub-package buried in a generic agent kit.

sansan-mcp exposes 14 tools across 6 domains: business cards, persons, tags, sales activity reports, users, departments. Stack is TypeScript with Zod validation, typed errors, and a token-bucket rate limiter sized comfortably under Sansan's 10 req/sec cap.

What this unlocks day-to-day:
- "Find anyone at @acme.com I exchanged cards with this quarter."
- "Draft a polite Japanese follow-up to the 3 people I met from Sansan last week."
- "Log today's 14:00 meeting with Tanaka-san as a Sansan report."

Built it because I run engineering at a Tokyo product company and our sales side lives in Sansan. The amount of low-value glue work (search a name, copy contact info, log a meeting) that AI agents could absorb is huge once the surface area is wired up.

MIT licensed. PRs welcome — image-OCR upload and bulk-import endpoints are next.
```
