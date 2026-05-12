# Changelog

All notable changes to this project will be documented in this file.

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
