# claudelint Setup Guide

You are setting up claudelint for the user's project. Follow each step in order.

Create a task list with these items before you begin:

1. Install claude-code-lint
2. Configure linting preset
3. Set up SessionStart hook
4. Run initial validation
5. Install Claude Code plugin

Work through each task sequentially. Mark each task complete as you finish it.

## Step 1: Install

Ask the user how they want to install:

- **Project dependency** (recommended for teams): `npm install --save-dev claude-code-lint`
- **Global** (recommended for individual use): `npm install -g claude-code-lint`

Run the chosen command. Verify it succeeds before continuing.

## Step 2: Configure

Ask the user which rule preset they want:

- **Recommended** (best for most projects)
- **Strict** (additional quality checks)
- **All** (every rule enabled)

Run: `npx claudelint init --yes --preset <chosen-preset>`

This creates `.claudelintrc.json` and `.claudelintignore`.

## Step 3: Hooks

Ask the user: "Set up a SessionStart hook? This runs claudelint automatically when you start a Claude Code session."

If yes, run: `npx claudelint init --yes --hooks --force`

This creates `.claude/hooks/hooks.json` with a SessionStart command hook.

## Step 4: Validate

Run: `npx claudelint check-all`

Report the results to the user. If there are errors or warnings, offer to help fix them before continuing.

## Step 5: Plugin

The plugin is installed via slash commands that the user must type themselves.

Tell the user to type this in the chat:

```text
/plugin marketplace add pdugan20/claudelint
```

Wait for the user to confirm before continuing.

Then tell the user to type:

```text
/plugin install claudelint@pdugan20-plugins
```

The user will be prompted to choose an installation scope. Explain the options:

- **User scope** (default) — available in all your projects. Best for individual developers.
- **Project scope** — saved to `.claude/settings.json` and shared with collaborators. Best for teams.
- **Local scope** — only you, only this repo.

Wait for the user to confirm before continuing.

## Step 6: Done

Mark all tasks complete. Confirm setup is finished.

Tell the user these slash commands are now available:

- `/validate-all` — run all validators on the project
- `/optimize-cc-md` — interactively optimize CLAUDE.md
- `/format-cc` — auto-format Claude Code files

Tell the user they can run `claudelint` at any time to validate their project, or ask Claude to do it.
