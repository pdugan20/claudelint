---
description: 'Schema reference for settings.json including permissions, attribution, and sandbox configuration.'
---

# Settings

<SchemaRef
  validator="Settings" validator-link="/validators/settings"
  docs="Settings" docs-link="https://code.claude.com/docs/en/settings"
  schema="claude-code-settings.json" schema-link="https://json.schemastore.org/claude-code-settings.json"
/>

The `settings.json` file configures Claude Code behavior. It can be located at `~/.claude/settings.json` (global), `.claude/settings.json` (project), or `.claude/settings.local.json` (local, gitignored).

## Fields

### Permissions

| Field                          | Type     | Required | Description                                                   |
| ------------------------------ | -------- | -------- | ------------------------------------------------------------- |
| `allow`                        | string[] | no       | Permission patterns to auto-allow (e.g., `"Bash(npm run *)"`) |
| `deny`                         | string[] | no       | Permission patterns to always deny                            |
| `ask`                          | string[] | no       | Permission patterns to always prompt                          |
| `defaultMode`                  | string   | no       | `acceptEdits`, `bypassPermissions`, `default`, or `plan`      |
| `disableBypassPermissionsMode` | string   | no       | Set to `"disable"` to prevent bypass                          |
| `additionalDirectories`        | string[] | no       | Extra directories to allow access to                          |

### Attribution

| Field    | Type   | Required | Description             |
| -------- | ------ | -------- | ----------------------- |
| `commit` | string | no       | Commit message template |
| `pr`     | string | no       | PR description template |

### Sandbox

| Field                       | Type     | Required | Description                      |
| --------------------------- | -------- | -------- | -------------------------------- |
| `enabled`                   | boolean  | no       | Enable sandboxing                |
| `autoAllowBashIfSandboxed`  | boolean  | no       | Auto-allow bash in sandbox       |
| `excludedCommands`          | string[] | no       | Commands excluded from sandbox   |
| `allowUnsandboxedCommands`  | string[] | no       | Commands allowed outside sandbox |
| `network.allowedHosts`      | string[] | no       | Allowed network hosts            |
| `network.allowedPorts`      | number[] | no       | Allowed network ports            |
| `enableWeakerNestedSandbox` | boolean  | no       | Allow weaker nested sandbox      |
| `ignoreViolations`          | boolean  | no       | Ignore sandbox violations        |

## Example

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git *)", "Read", "Edit"],
    "deny": ["Bash(rm -rf *)"]
  },
  "sandbox": {
    "enabled": true,
    "network": {
      "allowedDomains": ["registry.npmjs.org"]
    }
  }
}
```

## Full field reference

Every top-level key `SettingsSchema` models, generated from the schema itself. Descriptions are abridged from the [official settings reference](https://code.claude.com/docs/en/settings).

| Field                             | Type    | Required | Description                                                                                          |
| --------------------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `$schema`                         | string  | No       | —                                                                                                    |
| `advisorModel`                    | string  | No       | Model for the server-side advisor tool. Accepts a model alias such as `"opus"`, `"sonnet"`, or `"fab |
| `agent`                           | string  | No       | Run the main thread as a named subagent, and set the default agent for sessions dispatched from `cla |
| `agentPushNotifEnabled`           | boolean | No       | **Default**: `false`. When Remote Control is connected, allow Claude to send proactive push notifica |
| `allowAllClaudeAiMcps`            | boolean | No       | (Managed settings only) Load claude.ai connectors alongside a deployed `managed-mcp.json`, which oth |
| `allowManagedHooksOnly`           | boolean | No       | (Managed settings only) Only managed hooks, SDK hooks, and hooks from plugins force-enabled in manag |
| `allowManagedMcpServersOnly`      | boolean | No       | Treated as `true`                                                                                    |
| `allowManagedPermissionRulesOnly` | boolean | No       | (Managed settings only) Prevent user and project settings from defining `allow`, `ask`, or `deny` pe |
| `allowedChannelPlugins`           | array   | No       | (Managed settings only) Allowlist of channel plugins that may push messages. Replaces the default An |
| `allowedHttpHookUrls`             | array   | No       | Allowlist of URL patterns that HTTP hooks may target. Supports `*` as a wildcard. When set, hooks wi |
| `allowedMcpServers`               | array   | No       | Enforced as an empty allowlist, so no MCP servers are admitted until the value is fixed. An individu |
| `alwaysThinkingEnabled`           | boolean | No       | Enable extended thinking by default for all sessions. Typically configured via the `/config` command |
| `apiKeyHelper`                    | string  | No       | Custom command, run through the system shell (`/bin/sh` on macOS and Linux, `cmd` on Windows), to ge |
| `askUserQuestionTimeout`          | string  | No       | **Default**: `"never"`. Idle time before an unanswered `AskUserQuestion` dialog auto-continues with  |
| `attribution`                     | object  | No       | Customize attribution for git commits and pull requests. See Attribution settings                    |
| `autoCompactEnabled`              | boolean | No       | **Default**: `true`. Automatically compact the conversation when context approaches the limit. Appea |
| `autoMemoryDirectory`             | string  | No       | Custom directory for auto memory storage. Accepts an absolute path or a `~/`-prefixed path. From pro |
| `autoMemoryEnabled`               | boolean | No       | **Default**: `true`. Enable auto memory. When `false`, Claude does not read from or write to the aut |
| `autoMode`                        | object  | No       | Customize what the auto mode classifier blocks and allows. Contains `environment`, `allow`, `soft_de |
| `autoScrollEnabled`               | boolean | No       | **Default**: `true`. In fullscreen rendering, follow new output to the bottom of the conversation. A |
| `autoUpdatesChannel`              | string  | No       | **Default**: `"latest"`. Release channel to follow for updates. Use `"stable"` for a version that is |
| `availableModels`                 | array   | No       | Enforced as an empty allowlist, so only the Default model is available until the value is fixed. An  |
| `awaySummaryEnabled`              | boolean | No       | Show a one-line session recap when you return to the terminal after a few minutes away. Set to `fals |
| `awsAuthRefresh`                  | string  | No       | Custom script that modifies the `.aws` directory (see advanced credential configuration)             |
| `awsCredentialExport`             | string  | No       | Custom script that outputs JSON with AWS credentials (see advanced credential configuration)         |
| `axScreenReader`                  | boolean | No       | Render screen-reader friendly output: flat text without decorative borders or animations. Screen-rea |
| `blockedMarketplaces`             | array   | No       | (Managed settings only) Blocklist of marketplace sources. Enforced on marketplace add and on plugin  |
| `browserExternalPageTools`        | string  | No       | (Managed settings only) Set to `"disabled"` to prevent Claude from using tools to read or act on ext |
| `channelsEnabled`                 | boolean | No       | (Managed settings only) Allow channels for the organization. On claude.ai Team and Enterprise plans, |
| `claudeMd`                        | string  | No       | (Managed settings only) CLAUDE.md-style instructions injected as organization-managed memory. Only h |
| `claudeMdExcludes`                | array   | No       | Glob patterns or absolute paths of `CLAUDE.md` files to skip when loading memory. Patterns match aga |
| `cleanupPeriodDays`               | number  | No       | **Default**: `30` days, minimum `1`. Claude Code deletes session files and other application data ol |
| `companyAnnouncements`            | array   | No       | Announcement to display to users at startup. If multiple announcements are provided, they will be cy |
| `defaultShell`                    | string  | No       | **Default**: `"bash"`, or `"powershell"` on Windows when Bash isn't available. Default shell for inp |
| `deniedMcpServers`                | array   | No       | An individual invalid entry is stripped and the valid subset is enforced. A wholly invalid value is  |
| `disableAgentView`                | boolean | No       | Set to `true` to turn off background agents and agent view: `claude agents`, `--bg`, `/background`,  |
| `disableAllHooks`                 | boolean | No       | Disable all hooks and any custom status line                                                         |
| `disableArtifact`                 | boolean | No       | Set to `true` to disable the Artifact tool, which publishes session output as a private web page on  |
| `disableAutoMode`                 | string  | No       | Set to `"disable"` to prevent auto mode from being activated. Removes `auto` from the `Shift+Tab` cy |
| `disableBundledSkills`            | boolean | No       | Set to `true` to disable the skills and workflows included with Claude Code: bundled skills and work |
| `disableClaudeAiConnectors`       | boolean | No       | Disable claude.ai MCP connectors so they are not auto-fetched or connected. Set in any settings scop |
| `disableDeepLinkRegistration`     | string  | No       | Set to `"disable"` to prevent Claude Code from registering the `claude-cli://` protocol handler with |
| `disableRemoteControl`            | boolean | No       | Disable Remote Control: blocks `claude remote-control`, the `--remote-control` flag, auto-start, and |
| `disableSideloadFlags`            | boolean | No       | (Managed settings only) Reject the `--plugin-dir`, `--plugin-url`, `--agents`, and `--mcp-config` CL |
| `disableSkillShellExecution`      | boolean | No       | Disable inline shell execution for `` !`...` `` and ` ```! ` blocks in skills and custom commands fr |
| `disableWorkflows`                | boolean | No       | **Default**: `false`. Disable dynamic workflows and the bundled workflow commands. Equivalent to set |
| `disabledMcpjsonServers`          | array   | No       | List of specific MCP servers from `.mcp.json` files to reject                                        |
| `editorMode`                      | string  | No       | **Default**: `"normal"`. Key binding mode for the input prompt: `"normal"` or `"vim"`. Appears in `/ |
| `effortLevel`                     | string  | No       | Persist the effort level across sessions. Accepts `"low"`, `"medium"`, `"high"`, or `"xhigh"`. Writt |
| `enableAllProjectMcpServers`      | boolean | No       | Automatically approve all MCP servers defined in project `.mcp.json` files. As of v2.1.196, `claude  |
| `enableArtifact`                  | boolean | No       | Enable or disable the Artifact tool for this user. When unset, the default follows the feature's ava |
| `enabledMcpjsonServers`           | array   | No       | List of specific MCP servers from `.mcp.json` files to approve. As of v2.1.196, `claude mcp list` an |
| `enabledPlugins`                  | object  | No       | —                                                                                                    |
| `enforceAvailableModels`          | boolean | No       | Treated as `true`. Applies in v2.1.175 and later                                                     |
| `env`                             | object  | No       | Environment variables applied to every session and to subprocesses Claude Code spawns from it. As of |
| `extraKnownMarketplaces`          | object  | No       | —                                                                                                    |
| `fallbackModel`                   | array   | No       | Fallback model(s) to try in order when the primary model is overloaded or unavailable. Claude Code s |
| `fastModePerSessionOptIn`         | boolean | No       | When `true`, fast mode does not persist across sessions. Each session starts with fast mode off, req |
| `feedbackSurveyRate`              | number  | No       | Probability (0–1) that the session quality survey appears when eligible. Set to `0` to suppress enti |
| `fileCheckpointingEnabled`        | boolean | No       | **Default**: `true`. Snapshot files before each edit so `/rewind` can restore them. Appears in `/con |
| `fileSuggestion`                  | object  | No       | Configure a custom script for `@` file autocomplete. See File suggestion settings                    |
| `footerLinksRegexes`              | array   | No       | Render extra clickable badges in the footer when a regex matches turn output. Each entry has a `patt |
| `forceLoginGatewayUrl`            | string  | No       | Pre-fills and locks the gateway URL on the `/login` Cloud gateway screen. Either this key or `forceL |
| `forceLoginMethod`                | string  | No       | Use `claudeai` to restrict login to Claude.ai accounts, `console` to restrict login to Claude Consol |
| `forceLoginOrgUUID`               | string  | No       | No organization is permitted to log in until the value is fixed                                      |
| `forceRemoteSettingsRefresh`      | boolean | No       | (Managed settings only) Block CLI startup until remote managed settings are freshly fetched from the |
| `gcpAuthRefresh`                  | string  | No       | Custom script that refreshes GCP Application Default Credentials when they expire or cannot be loade |
| `hooks`                           | object  | No       | Configure custom commands to run at lifecycle events. See hooks documentation for format             |
| `httpHookAllowedEnvVars`          | array   | No       | Allowlist of environment variable names HTTP hooks may interpolate into headers. When set, each hook |
| `includeGitInstructions`          | boolean | No       | **Default**: `true`. Include built-in commit and PR workflow instructions and the git status snapsho |
| `inputNeededNotifEnabled`         | boolean | No       | **Default**: `false`. When Remote Control is connected, send a push notification to your phone when  |
| `language`                        | string  | No       | Configure Claude's preferred response language (e.g., `"japanese"`, `"spanish"`, `"french"`). Claude |
| `minimumVersion`                  | string  | No       | Floor that prevents background auto-updates and `claude update` from installing a version below this |
| `model`                           | string  | No       | Override the default model to use for Claude Code. `--model` and `ANTHROPIC_MODEL` override this for |
| `modelOverrides`                  | object  | No       | Map Anthropic model IDs to provider-specific model IDs such as Amazon Bedrock inference profile ARNs |
| `otelHeadersHelper`               | string  | No       | Script to generate dynamic OpenTelemetry headers. Runs at startup and periodically. Set the refresh  |
| `outputStyle`                     | string  | No       | Configure an output style to adjust the system prompt. See output styles documentation               |
| `parentSettingsBehavior`          | string  | No       | (Managed settings only) **Default**: `"first-wins"`. Controls whether managed settings supplied prog |
| `permissions`                     | object  | No       | See table below for structure of permissions                                                         |
| `plansDirectory`                  | string  | No       | **Default**: `~/.claude/plans`. Customize where plan files are stored. Path is relative to project r |
| `pluginSuggestionMarketplaces`    | array   | No       | (Managed settings only) Marketplace names whose plugins can appear as contextual install suggestions |
| `pluginTrustMessage`              | string  | No       | (Managed settings only) Custom message appended to the plugin trust warning shown before installatio |
| `policyHelper`                    | object  | No       | Admin-deployed executable that computes managed settings dynamically at startup. Only honored from M |
| `prUrlTemplate`                   | string  | No       | URL template for the PR badge shown in the footer and in tool-result summaries. Substitutes `{host}` |
| `preferredNotifChannel`           | string  | No       | **Default**: `"auto"`. Method for task-complete and permission-prompt notifications: `"auto"`, `"ter |
| `prefersReducedMotion`            | boolean | No       | Reduce or disable UI animations (spinners, shimmer, flash effects) for accessibility                 |
| `remoteControlAtStartup`          | boolean | No       | Connect Remote Control automatically when each interactive session starts, instead of waiting for `/ |
| `requiredMaximumVersion`          | string  | No       | Managed settings only. Maximum Claude Code version allowed to start. If the running version is newer |
| `requiredMinimumVersion`          | string  | No       | Managed settings only. Minimum Claude Code version required to start. If the running version is olde |
| `respectGitignore`                | boolean | No       | **Default**: `true`. Control whether the `@` file picker respects `.gitignore` patterns. When `true` |
| `respondToBashCommands`           | boolean | No       | **Default**: `true`. Whether Claude responds after an input-box `!` shell command runs. Set to `fals |
| `sandbox`                         | object  | No       | —                                                                                                    |
| `showClearContextOnPlanAccept`    | boolean | No       | **Default**: `false`. Show the "clear context" option on the plan accept screen. Set to `true` to re |
| `showThinkingSummaries`           | boolean | No       | **Default**: `false`. Show extended thinking summaries in interactive sessions. When unset or `false |
| `showTurnDuration`                | boolean | No       | **Default**: `true`. Show turn duration messages after responses, e.g. "Cooked for 1m 6s". Appears i |
| `skillListingBudgetFraction`      | number  | No       | **Default**: `0.01`. Fraction of the model's context window reserved for the skill listing Claude se |
| `skillListingMaxDescChars`        | number  | No       | **Default**: `1536`. Per-skill character cap on the combined `description` and `when_to_use` text in |
| `skillOverrides`                  | object  | No       | Per-skill visibility overrides keyed by skill name. Value is `"on"`, `"name-only"`, `"user-invocable |
| `skipWebFetchPreflight`           | boolean | No       | Skip the WebFetch domain safety check that sends each requested hostname to `api.anthropic.com` befo |
| `spinnerTipsEnabled`              | boolean | No       | **Default**: `true`. Show tips in the spinner while Claude is working. Set to `false` to disable tip |
| `spinnerTipsOverride`             | object  | No       | Override spinner tips with custom strings. `tips`: array of tip strings. `excludeDefault`: if `true` |
| `spinnerVerbs`                    | object  | No       | Customize the action verbs shown while a turn is in progress. Set `mode` to `"replace"` to use only  |
| `sshConfigs`                      | array   | No       | SSH connections to show in the Desktop environment dropdown. Each entry requires `id`, `name`, and ` |
| `statusLine`                      | object  | No       | Configure a custom status line to display context. The object's optional `padding`, `refreshInterval |
| `strictKnownMarketplaces`         | array   | No       | (Managed settings only) Allowlist of plugin marketplace sources. Undefined = no restrictions, empty  |
| `strictPluginOnlyCustomization`   | array   | No       | (Managed settings only) Block skills, agents, hooks, and MCP servers from user and project sources,  |
| `syntaxHighlightingDisabled`      | boolean | No       | Disable syntax highlighting in diffs, code blocks, and file previews                                 |
| `teammateMode`                    | string  | No       | **Default**: `in-process`. How agent team teammates display: `in-process`, `auto` (split panes when  |
| `terminalProgressBarEnabled`      | boolean | No       | **Default**: `true`. Show the terminal progress bar in supported terminals: ConEmu, Ghostty 1.2.0+,  |
| `theme`                           | string  | No       | **Default**: `"dark"`. Color theme for the interface: `"auto"`, `"dark"`, `"light"`, `"dark-daltoniz |
| `tui`                             | string  | No       | Terminal UI renderer. Use `"fullscreen"` for the flicker-free alt-screen renderer with virtualized s |
| `ultracode`                       | boolean | No       | Turn on ultracode for the current session. This key isn't read from `settings.json`. Set it through  |
| `useAutoModeDuringPlan`           | boolean | No       | **Default**: `true`. Whether plan mode uses auto mode semantics when auto mode is available. Not rea |
| `verbose`                         | boolean | No       | **Default**: `false`. Show full tool output instead of truncated summaries. Appears in `/config` as  |
| `viewMode`                        | string  | No       | Default transcript view mode on startup: `"default"`, `"verbose"`, or `"focus"`. Overrides the stick |
| `voice`                           | object  | No       | Voice dictation settings: `enabled` turns dictation on, `mode` selects `"hold"` or `"tap"`, and `aut |
| `voiceEnabled`                    | boolean | No       | Legacy alias for `voice.enabled`. Prefer the `voice` object                                          |
| `wheelScrollAccelerationEnabled`  | boolean | No       | **Default**: `true`. In fullscreen rendering, accelerate mouse-wheel scroll speed during fast scroll |
| `workflowKeywordTriggerEnabled`   | boolean | No       | **Default**: `true`. Whether the keyword `ultracode` in a prompt triggers a dynamic workflow. Set to |
| `wslInheritsWindowsSettings`      | boolean | No       | (Windows managed settings only) When `true`, Claude Code on WSL reads managed settings from the Wind |
