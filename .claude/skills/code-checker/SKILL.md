---
name: code-checker
description: Structured rubric for code reviews. Use whenever performing a code review or audit, or when the code-reviewer agent enters Phase 2 of its workflow. Ensures consistent coverage across correctness, readability, maintainability, performance, error handling, tests, and documentation. Triggers on phrases like "review my code", "audit this", "check the PR", "look at these changes", or any code-quality assessment request.
tools: Read, Grep, Glob, Bash
version: 1.0.0
---

# Code Review Checklist

A senior-level rubric. Walk through each axis. For every issue, capture: **`(file:line) — observation — suggested fix — severity`**.

---

## 1. Correctness

- Does the code implement the stated intent? Match it against the PR description, ticket, or function docstring.
- Off-by-one errors in loops, slices, ranges.
- Boundary conditions: empty input, single element, max size, null / undefined.
- Concurrency: shared mutable state, race conditions, deadlock potential.
- Time zones, locales, encoding assumptions.
- Floating-point comparisons that should be tolerance-based.

## 2. Readability

- Names reveal intent. `processData` is a smell; `normalizeUserEmails` is a name.
- Functions do one thing. If you need "and" to describe it, split it.
- Cognitive load per function: nesting depth ≤ 3, cyclomatic complexity reasonable.
- Comments explain _why_, not _what_. A comment that paraphrases the code means the code needs renaming, not commenting.
- Dead code and commented-out blocks are deleted.

## 3. Maintainability

- DRY without being clever. Three repetitions justify extraction; two might not.
- Coupling: does a change in module A force changes in B, C, D?
- Public API surface area is minimal. Internal helpers stay internal.
- Magic numbers and strings live in named constants.
- Tests exist and exercise the new logic — not just the happy path.

## 4. Performance

- Algorithmic complexity matches data size. O(n²) on a 10-item list is fine; on a 10k list it isn't.
- N+1 queries in ORM and database code.
- Unnecessary allocations in hot paths (string concatenation in loops, redundant collection copies).
- Blocking I/O on async paths.
- Caching: present where appropriate, absent where it would cause staleness bugs.

## 5. Error Handling

- Every error path is intentional. No bare `except:` / `catch (e) {}` swallowing failures.
- Errors surface with enough context to debug (which input, which operation).
- User-facing errors don't leak internals (stack traces, SQL, secrets).
- Resources are released on failure (files, connections, locks). Use RAII / `try-finally` / `defer` / context managers.
- Retry logic is bounded and idempotent.

## 6. Security (Quick Pass)

This skill does a **light** security pass. The full audit lives in `security-audit`. At minimum, flag:

- User input concatenated into queries, paths, shell commands, or HTML.
- Cryptographic primitives rolled by hand.
- Hard-coded credentials, tokens, or API keys.

Then defer the rest to `security-audit`.

## 7. Tests

- New behavior has new tests. Bug fixes have regression tests.
- Tests are deterministic — no real network, no real time, no flaky randomness without a seed.
- Test names describe the scenario, not the function under test.
- Setup is minimal; helpers are extracted; no shared mutable state between tests.

## 8. Documentation

- Public APIs have docstrings or doc comments.
- README and CHANGELOG updated if behavior or interface changed.
- Migration notes for breaking changes.

---

## Severity Calibration

When in doubt, ask: _"What happens if this ships?"_

| Outcome                                                  | Severity    |
| -------------------------------------------------------- | ----------- |
| Production breaks, data is lost, attacker wins           | **BLOCKER** |
| Bug under realistic conditions, or significant tech debt | **MAJOR**   |
| Annoying but workable, or moderate tech debt             | **MINOR**   |
| Personal preference, polish                              | **NIT**     |

---

## Output Discipline

Every reported finding must:

1. Cite a concrete location (e.g. `src/auth.py:42-58`).
2. State the problem in one sentence.
3. Propose a fix — even a sketch is fine.
4. Carry a severity label.

A finding without a location is a hunch, not a finding.

---

<sub>Skill: code-checker · Version: 1.0.0 · Maintainer: Tkach Yevhenii</sub>
