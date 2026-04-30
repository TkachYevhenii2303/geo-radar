---
name: telegram-reporter
description: Sends a formatted code-review summary with a 1-10 score to a Telegram chat via the Bot API. Use as the final step of the code-reviewer agent workflow, after findings are collected and a score is computed. Triggers on phrases like "send the review to Telegram", "post the report", or as Phase 5 of the code-reviewer agent. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.
allowed-tools: Bash, Read
version: 1.0.0
---

# Telegram Reporter

Delivers the final review summary to Telegram. This is the only side effect the `code-reviewer` agent produces.

---

## Prerequisites

Two environment variables must be set in the `.env` in this telegram-reporter/commands/ folder:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

If either variable is missing, the script fails fast with a clear error. **Surface that error to the user** — do not silently skip the report.

---

## Invocation

Use the bundled script. Do not reimplement the HTTP call inline.

```bash
python3 .claude/skills/telegram-reporter/scripts/send_report.py \
  --score 8 \
  --scope "src/auth/login.py" \
  --summary "Solid implementation; one minor input-validation gap" \
  --findings-file /tmp/review-findings.md
```

### Arguments

| Flag              | Required | Description                                          |
| ----------------- | -------- | ---------------------------------------------------- |
| `--score`         | yes      | Integer 1-10.                                        |
| `--scope`         | yes      | What was reviewed (file path, PR number, range).     |
| `--summary`       | yes      | One-line verdict.                                    |
| `--findings-file` | yes      | Path to a Markdown file with the full findings list. |

The script handles formatting, message-length splitting (Telegram caps at 4096 chars), and MarkdownV2 escaping.

---

## Workflow Integration

In Phase 5 of the `code-reviewer` agent:

1. Write the formatted findings list to a temp file (e.g. `/tmp/review-<timestamp>.md`).
2. Run the script with `--score`, `--scope`, `--summary`, `--findings-file`.
3. Parse the exit code:

| Exit code | Meaning                            | What to tell the user                                           |
| --------- | ---------------------------------- | --------------------------------------------------------------- |
| `0`       | Delivered                          | "📨 Telegram report sent ✅"                                    |
| `2`       | Missing or invalid env vars / args | "Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, then re-run." |
| `3`       | Telegram API error                 | Echo the API response body verbatim.                            |
| `4`       | Unexpected failure                 | Echo `stderr`.                                                  |

---

## Score Formatting Convention

The script renders the score with a visual indicator:

| Score | Indicator                |
| ----- | ------------------------ |
| 9-10  | 🟢 Excellent             |
| 7-8   | 🟢 Good                  |
| 5-6   | 🟡 Needs work            |
| 3-4   | 🟠 Significant issues    |
| 1-2   | 🔴 Major rework required |

Do not override this convention; consistency makes the bot output scannable over time.

---

## Failure Modes

- **Network blocked** — the agent runs in a sandboxed environment. `api.telegram.org` must be reachable. If it isn't, ask the user to whitelist it.
- **Bot not started by user** — Telegram requires the user to send `/start` to the bot before the bot can DM them. A `403 Forbidden` from the API means this step was skipped.
- **Wrong chat ID** — `400 Bad Request: chat not found`. Ask the user to re-fetch via `getUpdates`.

---

## Security Note

The bot token is a credential. The script reads it from environment variables only — it never logs it, never prints it, and never includes it in error messages echoed back to the user. The provided script follows this rule; preserve it if you modify the script.

---

<sub>Skill: `telegram-reporter` · Version: 1.0.0 · Maintainer: Tkach Yevhenii</sub>
