# AGENTS.md — content-editor project dispatcher

## Governance

- 最上位 contract: [`constitution/CONSTITUTION.md`](constitution/CONSTITUTION.md)
- current Operating Model: [`organization/profiles/release-driven-solo.md`](organization/profiles/release-driven-solo.md)
- product / schema / API documentation: `docs/` の relevant canonical document

## Working rules

- SQLite schema, content portability, API behavior, and access-control semantics are not inferred from implementation fragments when a canonical document exists.
- Read the relevant document under `docs/` before changing that surface.
- Preserve content database files and unrelated user data. Do not use destructive cleanup as a validation shortcut.
- Use repository-controlled package scripts and existing package-manager state; do not silently switch toolchains as part of unrelated work.
- Durable work/dependency state belongs in GitHub Issues, review/integration evidence in Pull Requests, and source state in Git.
- Bind validation claims to the candidate commit and the exact schema/data fixtures used.
