# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-05-13

### Added

- **Resources** (6) exposing Sansan data via `sansan://` URIs — Claude / Cursor can pull these into context directly without a tool call:
  - `sansan://bizcard/{id}` — single business card (JSON, includes tags)
  - `sansan://bizcard/{id}/image` — front-side JPEG (base64 blob)
  - `sansan://person/{id}` — consolidated person record
  - `sansan://tags` — full tag collection
  - `sansan://users` — tenant user roster (CSV)
  - `sansan://departments` — department tree (CSV)
- **Prompts** (5) — reusable sales-workflow templates surfaced as slash commands in compatible clients:
  - `weekly_sales_recap` — concise weekly summary grouped by company and activity type
  - `find_warm_contacts` — rank contacts at a target company by recency and engagement
  - `analyze_contact` — structured analysis of a single business card with focus options
  - `draft_followup_email` — context-aware JP/EN follow-up email with tone presets
  - `meeting_recap_to_report` — transcript → ready-to-confirm `create_report` payload

### Changed

- Server version bumped to 0.2.0.
- README and README.ja.md document the new Resources and Prompts surface.

## [0.1.0] - 2026-05-12

### Added

- Initial release.
- 14 tools across 6 Sansan API domains:
  - Business Cards: `search_bizcards`, `list_recent_bizcards`, `get_bizcard`, `get_bizcard_image`, `get_bizcard_tags`, `create_bizcard`
  - Persons: `get_person`
  - Tags: `list_tags`
  - Reports: `list_reports`, `create_report`
  - Users: `get_user`, `list_users`
  - Organization: `list_departments`, `list_organization_departments`
- Token-bucket rate limiter capped at 8 req/sec (Sansan caps at 10/sec).
- Typed errors for auth, not-found, rate-limit, and generic API failures.
- English and Japanese READMEs.
- Compatible with Claude Desktop, Claude Code, Cursor, Cline, Continue.
