# SKILL: Automated Atomic Commits & Visual Pull Requests

## Context

Use this skill when the user asks to "commit changes", "prepare a PR", or "automate the workflow" for current workspace modifications. This skill ensures high-quality git history and professional pull request documentation.

## 1. Analysis & Grouping

- **Scan Changes:** Execute `git diff --name-only` to identify all modified files.
- **Logic Grouping:** Categorize changes into atomic logical units (e.g., UI updates, API logic, bug fixes, documentation).
- **Conventional Commits:** Use the standard format: `<type>(<scope>): <description>` (e.g., `feat(auth): add JWT validation`).

## 2. Visual Verification (Playwright MCP)

- **UI Detection:** If changes involve CSS, HTML, React, Vue, or any frontend components:
  1. **Identify Dev Server:** Check `package.json` or project files for the start command (e.g., `yarn dev`).
  2. **Screenshot Capture:** Use `playwright` to navigate to the local URL (e.g., `http://localhost:3000`).
  3. **Action:** Capture screenshots of the affected UI elements.
  4. **Storage:** Save images to a temporary directory `./.claude/previews/`.

## 3. Human-in-the-loop (Validation Step)

- **Pre-Commit Report:** Before performing any git actions, present the user with:
  - A list of proposed logical commit groups.
  - A summary of the visual changes captured (if any).
- **Approval:** Ask: _"I have grouped your changes into [N] commits. Shall I proceed with local commits and visual PR preparation? (y/n)"_

## 4. Execution Workflow

- **Local Commits:** - For each group: `git add <files>` -> `git commit -m "<message>"`.
- **Pushing:** - Identify the current branch: `git branch --show-current`.
  - Push changes: `git push origin <branch_name>`.

## 5. Pull Request Generation

- **Command:** Use `gh pr create` (GitHub CLI) or `glab pr create` (GitLab CLI).
- **PR Template:**
  - **Title:** Summary of the primary feature/fix.
  - **Body (Markdown):**
    - `## Overview`: Concise explanation of why these changes were made.
    - `## Changes`: Bulleted list of technical implementations.
    - `## Visuals`: Embed the screenshots captured by Playwright.
    - `## Verification`: Confirmation that the dev server was tested.

## 6. Safety Guardrails

- **Secret Detection:** Scan diffs for hardcoded API keys or passwords. Abort and warn the user if found.
- **No Force Push:** Never use `--force` or `--hard` unless specifically instructed by the user.
- **Cleanup:** Terminate any dev server processes started during the Playwright phase.
