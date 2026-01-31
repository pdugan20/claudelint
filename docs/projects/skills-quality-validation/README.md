# Skills Quality Validation Project

**Status**: **Planning Phase
**Progress**: 0/41 rules implemented (0%)
**Last Updated**: 2026-01-30

**Architecture Note**: Originally planned for 44 rules. Reduced to 41 after removing H10-H12 (shellcheck, pylint, markdownlint integration). These are now part of **Phase 0: Architecture Refactor** as universal file-type validators, not skill-specific rules.

---

## Quick Start

**New to this project?** Start here:

0. **PREREQUISITE**: Complete [Phase 0: Architecture Refactor](./PROGRESS-TRACKER.md#phase-0-architecture-refactor-prerequisite) first
1. Read [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - Understand goals and structure
2. Review [ANTHROPIC-BEST-PRACTICES-SUMMARY.md](./ANTHROPIC-BEST-PRACTICES-SUMMARY.md) - Key insights from official guide
3. Check [PROGRESS-TRACKER.md](./PROGRESS-TRACKER.md) - Track implementation progress
4. Check [SKILL-RULES-TRACKER.md](./SKILL-RULES-TRACKER.md) - See what needs to be done
5. Pick a rule from [EASY-RULES.md](./EASY-RULES.md) - Start implementing!

**Want to implement a rule?** Follow this flow:

```
Pick a rule → Read implementation guide → Write code → Test → Update tracker
     ↓              ↓                       ↓           ↓          ↓
  Tracker      EASY/MEDIUM/HARD-RULES   Rule file   Tests    Tracker
```

---

## Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](./README.md) | This file - quick navigation | Everyone |
| [PROGRESS-TRACKER.md](./PROGRESS-TRACKER.md) | **Active tracker** - mark tasks complete with checkboxes | Active contributors |
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Goals, metrics, structure | Project leads |
| [SKILL-RULES-TRACKER.md](./SKILL-RULES-TRACKER.md) | Centralized tracker - all rules, status, priorities | Implementers |
| [IMPLEMENTATION-PHASES.md](./IMPLEMENTATION-PHASES.md) | Detailed phase breakdown with tasks | Project managers |
| [ANTHROPIC-BEST-PRACTICES-SUMMARY.md](./ANTHROPIC-BEST-PRACTICES-SUMMARY.md) | Key insights from official 32-page guide | All contributors |
| [EASY-RULES.md](./EASY-RULES.md) | 12 easy rules with implementation details | Beginners |
| [MEDIUM-RULES.md](./MEDIUM-RULES.md) | 17 medium rules (parsing, logic) | Intermediate |
| [HARD-RULES.md](./HARD-RULES.md) | 12 hard rules (H10-H12 removed) | Advanced |

---

## Implementation Roadmap

### Phase 0: Architecture Refactor (PREREQUISITE)

**Status**: Not started
**Duration**: 2-3 days
**Priority**: CRITICAL - Must complete before any rule implementation

Refactor claudelint to match industry standards (ESLint/Prettier model):

- Move shellcheck, markdownlint, pylint to main linting command
- Keep only Prettier in format command
- Support --fix flag for autofix capabilities

See [PROGRESS-TRACKER.md](./PROGRESS-TRACKER.md#phase-0-architecture-refactor-prerequisite) for details.

---

### Phase 1: Easy Rules (2-3 days)

**Status**: Not started
**Priority**: Quick wins

- 12 simple pattern-matching rules
- File structure validation
- Frontmatter enhancements
- See [EASY-RULES.md](./EASY-RULES.md)

**Top Priorities**:

1. `skill-readme-forbidden` - Explicit requirement
2. `skill-body-word-count` - Align with guide
3. `skill-xml-tags-anywhere` - Security

---

### Phase 2: Medium Rules (1-2 weeks)

**Status**: Not started
**Priority**: Core quality validation

- 17 rules requiring parsing and logic
- **CRITICAL**: Description quality validation (M1-M3)
- Content structure validation
- File organization checks
- See [MEDIUM-RULES.md](./MEDIUM-RULES.md)

**Top Priorities**:

1. `skill-description-trigger-phrases` HIGH - Most impactful
2. `skill-description-structure` HIGH - Core quality
3. `skill-hardcoded-secrets` Security - Security critical
4. `skill-mcp-tool-qualified-name` - Prevent errors
5. `skill-progressive-disclosure` - Best practice

---

### Phase 3: Hard Rules (2-3 weeks)

**Status**: Not started
**Priority**: Advanced validation

- 12 rules requiring external integrations (H10-H12 removed)
- MCP server/tool validation
- LLM-based evaluation
- See [HARD-RULES.md](./HARD-RULES.md)

**Top Priorities**:

1. `skill-mcp-server-exists` - Prevent broken skills
2. `skill-mcp-tool-exists` - Runtime validation
3. `skill-trigger-phrase-quality` HIGH - LLM evaluation

**Note**: H10 (shellcheck), H11 (pylint), H12 (markdownlint) removed - now in Phase 0

---

## Current Status

```
┌─────────────────────────────────────────┐
│  Skills Quality Validation Progress     │
├─────────────────────────────────────────┤
│                                         │
│  Phase 0 (Arch):      [          ] 0%   │
│  Phase 1 (Easy):      [          ] 0%   │
│  Phase 2 (Medium):    [          ] 0%   │
│  Phase 3 (Hard):      [          ] 0%   │
│                                         │
│  Overall:             [          ] 0%   │
│                                         │
│  Total Rules: 0/41 implemented          │
│  (H10-H12 moved to Phase 0)             │
└─────────────────────────────────────────┘
```

**See [PROGRESS-TRACKER.md](./PROGRESS-TRACKER.md) for active tracking with checkboxes**
**See [SKILL-RULES-TRACKER.md](./SKILL-RULES-TRACKER.md) for detailed rule status**

---

## Key Learnings

### Coverage Analysis

We have **~60% coverage** of Anthropic's official guide (pages 8-13):

- DONE **Excellent** (90%): Structural/naming requirements
- DONE **Good** (75%): Basic security checks
- PARTIAL **Weak** (30%): Content quality validation
- MISSING **Missing** (0%): Progressive disclosure enforcement

### Critical Gaps Identified

1. **Description quality** - No validation of trigger phrases (most important!)
2. **README.md forbidden** - Explicit requirement not enforced
3. **Word count vs line count** - Using wrong metric
4. **Progressive disclosure** - Not validated at all
5. **MCP integration** - No validation of referenced servers/tools

### Impact Assessment

**High Impact Rules** (implement first):

- Description trigger phrase validation (M1-M3)
- File structure compliance (E1, E6)
- Security issues (M13)
- MCP integration validation (H1-H2)

---

## How to Contribute

### 1. Pick a Rule

Check [SKILL-RULES-TRACKER.md](./SKILL-RULES-TRACKER.md) for available rules:

- [NOT STARTED] Not Started - Available to claim
- [IN PROGRESS] In Progress - Someone working on it
- [COMPLETE] Complete - Already done

### 2. Read Implementation Guide

- **Easy rule?** → [EASY-RULES.md](./EASY-RULES.md)
- **Medium rule?** → [MEDIUM-RULES.md](./MEDIUM-RULES.md)
- **Hard rule?** → [HARD-RULES.md](./HARD-RULES.md)

### 3. Implement

Follow the pattern from the guide:

```typescript
export const rule: Rule = {
  meta: { /* ... */ },
  validate: (context) => { /* ... */ },
};
```

### 4. Test

Write tests for:

- DONE Good examples (should pass)
- MISSING Bad examples (should fail)
- Official Anthropic examples (should pass)

### 5. Update Tracker

Update your rule status in [SKILL-RULES-TRACKER.md](./SKILL-RULES-TRACKER.md)

---

## Reference Materials

### Anthropic Official Guide

**"The Complete Guide to Building Skills for Claude"** (32 pages, January 2026)

- Stored: `~/Downloads/Docs/claude-skills/The-Complete-Guide-to-Building-Skill-for-Claude.pdf`
- Key sections summarized in [ANTHROPIC-BEST-PRACTICES-SUMMARY.md](./ANTHROPIC-BEST-PRACTICES-SUMMARY.md)

### Existing Rules (Examples)

- **Easy**: `src/rules/skills/skill-missing-shebang.ts`
- **Medium**: `src/rules/skills/skill-dangerous-command.ts`
- **Schema**: `src/schemas/skill-frontmatter.schema.ts`

### Testing

- Test files: `tests/rules/skills/`
- Official examples: Check Anthropic skills repository

---

## FAQ

**Q: Where should I start?**
A: Start with Phase 1 (Easy rules). Pick E1 or E6 - they're straightforward and high impact.

**Q: What if I'm stuck?**
A: Check the implementation guide for your rule's difficulty level. Look at existing similar rules for patterns.

**Q: How do I know my rule is correct?**
A: Test against official Anthropic example skills - zero false positives is the goal.

**Q: What about rules requiring external services?**
A: Implement graceful degradation (see [HARD-RULES.md](./HARD-RULES.md)). Make them opt-in with config flags.

**Q: Can I modify an existing rule instead of creating new ones?**
A: Yes! Some new rules should replace/enhance existing ones (e.g., E6 replaces line-count with word-count).

---

## Success Metrics

### Project Success

- [ ] 90%+ alignment with Anthropic guide recommendations
- [ ] <5% false positive rate on official example skills
- [ ] Rules execute in <2 seconds for typical skill
- [ ] User satisfaction >4/5 based on feedback

### Individual Rule Success

- [ ] Catches all bad examples from guide
- [ ] Zero false positives on good examples
- [ ] Clear, actionable error messages
- [ ] Complete documentation with examples

---

## Related Projects

- Main project: [claude-lint](https://github.com/pdugan20/claudelint)
- Rules reference: [../rule-implementation/rules-reference.md](../rule-implementation/rules-reference.md)
- Anthropic skills: [github.com/anthropics/skills](https://github.com/anthropics/skills)

---

## Low Change Log

### 2026-01-30

- DONE Initial project structure created
- DONE Analysis of Anthropic guide completed
- DONE 44 new rules identified and documented
- DONE Implementation guides created for all difficulty levels
- DONE Centralized tracker with priorities established

### Next Actions

1. Begin Phase 1 implementation
2. Set up CI/CD for new rules
3. Create test harness for official examples

---

**Ready to contribute?** Start with [SKILL-RULES-TRACKER.md](./SKILL-RULES-TRACKER.md) to pick a rule!
