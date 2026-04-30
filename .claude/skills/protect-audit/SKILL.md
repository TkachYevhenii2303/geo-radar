---
name: protect-audit
description: Security-focused review checklist covering OWASP-class vulnerabilities, secret leakage, dependency risk, and unsafe patterns. Use when performing a security review, threat assessment, or audit of code that handles user input, authentication, authorization, network I/O, file I/O, cryptography, or dependency updates. Invoked by the code-reviewer agent during Phase 3. Triggers on phrases like "security review", "audit for vulnerabilities", "check for injection", or "is this safe to ship".
allowed-tools: Read, Grep, Glob, Bash
version: 1.0.0
---

# Security Audit

Focused security pass. This is **not** a substitute for SAST/DAST tooling — it's the human-judgment layer on top.

---

## Scan Order

Move through these categories in sequence. For each match, record location + severity.

### 1. Injection

- **SQL** — any string interpolation into a query is suspect. Look for `f"SELECT ... {var}"`, `"... " + var`, `${var}` in template strings reaching a DB driver. Confirm parameterized queries are used.
- **Command** — `os.system`, `subprocess.run(..., shell=True)`, `exec`, `eval`, backticks. Check whether user input reaches them.
- **Path traversal** — any user-controlled string used in `open`, `fs.read`, `Path()`. Look for missing normalization or `..` rejection.
- **HTML / template** — unescaped output in templates, `dangerouslySetInnerHTML`, `v-html`, `|safe` filters.
- **LDAP, XPath, NoSQL** — same pattern: user input concatenated into a query DSL.

### 2. Authentication & Session

- Password hashing uses a slow KDF (bcrypt, argon2, scrypt). Plain SHA / MD5 → BLOCKER.
- Tokens (JWT, session) are signed and verified. Algorithm is pinned (no `alg: none` acceptance).
- Session cookies set `Secure`, `HttpOnly`, `SameSite`.
- Logout invalidates server-side state, not just the cookie.
- Rate limiting on login, password reset, MFA endpoints.

### 3. Authorization

- Every endpoint checks "can THIS user do THIS action on THIS resource."
- IDs in URLs (`/users/123/profile`) verify ownership before returning data — IDOR is the most common real-world flaw.
- Role checks happen on the server. Hidden UI buttons are not authorization.
- Admin and debug endpoints are gated or removed in production builds.

### 4. Secrets

Search for:

- Names: `api_key`, `apikey`, `secret`, `token`, `password`, `BEGIN PRIVATE KEY`.
- Patterns: AWS-style `AKIA...`, GitHub `ghp_...`, generic high-entropy strings.
- Locations: `.env` files, fixtures, test files committed to the repo.
- Logging statements that print request bodies, headers (especially `Authorization`), or stack traces with secrets.
- Secrets in error messages returned to the client.

### 5. Cryptography

- No hand-rolled crypto. XOR, custom hashing, custom RNG → BLOCKER.
- `random` / `Math.random` used for security purposes → MAJOR. Should be `secrets`, `crypto.randomBytes`, `SecureRandom`.
- Hard-coded IVs, nonces, salts.
- ECB mode, MD5 / SHA1 for integrity.
- Certificate validation disabled (`verify=False`, `rejectUnauthorized: false`).

### 6. Deserialization & Parsing

- `pickle.loads`, `yaml.load` (without `SafeLoader`), `Marshal.load`, Java native deserialization on untrusted input → BLOCKER.
- XML parsers without XXE protection (`resolve_entities`, external DTD).
- ZIP / archive extraction without path validation (zip-slip).

### 7. Network & SSRF

- HTTP clients fetching user-supplied URLs without an allowlist.
- Internal metadata endpoints (`169.254.169.254`, `localhost`) reachable.
- Open redirects: user-controlled `?next=` or `?redirect=` parameters without validation.
- CORS configured with `*` plus `Allow-Credentials: true` → BLOCKER.

### 8. Dependencies

- Lockfile present and committed (`package-lock.json`, `poetry.lock`, `Cargo.lock`, `go.sum`).
- New dependencies: check maintenance status, last release, install count, known CVEs.
- Transitive dependencies pulled from non-default registries warrant a second look.

### 9. Logging & Monitoring

- Security events logged (auth failures, permission denials, input-validation failures).
- Logs do **not** contain secrets, tokens, or full PII.
- Logs are structured enough to be queryable.

### 10. Client-side Specifics (if applicable)

- CSP header present and not `unsafe-inline` / `unsafe-eval`.
- No `target="_blank"` without `rel="noopener noreferrer"`.
- `localStorage` not used for session tokens — use HttpOnly cookies.

---

## Severity Mapping

| Pattern                                            | Default severity         |
| -------------------------------------------------- | ------------------------ |
| Remote code execution, auth bypass, secret in repo | **BLOCKER**              |
| Injection with confirmed user-input path           | **BLOCKER**              |
| IDOR, missing authz check, weak crypto             | **BLOCKER** or **MAJOR** |
| Disabled cert validation, weak random for security | **MAJOR**                |
| Verbose error leakage, missing rate limit          | **MAJOR** or **MINOR**   |
| Missing security header, weak CSP                  | **MINOR**                |

Adjust based on exploitability and blast radius. SQL injection in an admin-only endpoint behind VPN is still MAJOR or BLOCKER, not MINOR — defense in depth.

---

## What This Skill Does NOT Do

- Run actual scanners (semgrep, bandit, trivy). Recommend them where appropriate.
- Test exploitability. Findings are static-analysis grade.
- Replace a threat model. Architectural risk is out of scope.

When uncertain, mark severity conservatively (higher) and note the assumption.

---

<sub>Skill: `protect-audit` · Version: 1.0.0 · Maintainer: Tkach Yevhenii</sub>
