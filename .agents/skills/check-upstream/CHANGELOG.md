# Changelog

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-12

### Added

- Initial release, replacing `check-schema-drift`
- Baseline refresh step that surfaces new, previously unwatched docs pages
- Offline conformance check step (`npm run check:upstream`) for deterministic drift
- Prose-diff review step for constraints that cannot be checked mechanically
