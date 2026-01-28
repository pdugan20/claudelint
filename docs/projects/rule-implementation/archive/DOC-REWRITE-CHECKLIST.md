# Documentation Rewrite Checklist

Track progress on rewriting all 27 rule docs to follow new template.

## Batch 1: Worst Offenders (500+ lines) - HIGH PRIORITY

- [x] mcp-invalid-env-var.md (644 → 133 lines) ✅ DONE
- [x] plugin-invalid-manifest.md (630 → 111 lines) ✅ DONE
- [x] plugin-invalid-version.md (605 → 108 lines) ✅ DONE
- [x] mcp-invalid-server.md (591 → 154 lines) ✅ DONE
- [x] mcp-invalid-transport.md (585 → 141 lines) ✅ DONE
- [x] plugin-missing-file.md (574 → 124 lines) ✅ DONE

## Batch 2: Very Verbose (400-500 lines) - HIGH PRIORITY

- [x] hooks-invalid-config.md (533 → 128 lines) ✅ DONE
- [x] hooks-invalid-event.md (460 → 128 lines) ✅ DONE
- [x] settings-invalid-permission.md (446 → 133 lines) ✅ DONE
- [x] hooks-missing-script.md (427 → 127 lines) ✅ DONE

## Batch 3: Moderately Verbose (300-400 lines) - MEDIUM PRIORITY

- [x] settings-invalid-env-var.md (390 → 132 lines) ✅ DONE
- [x] settings-invalid-schema.md (365 → 136 lines) ✅ DONE
- [x] skill-deep-nesting.md (336 → 124 lines) ✅ DONE
- [x] skill-path-traversal.md (311 → 137 lines) ✅ DONE

## Batch 4: Acceptable Length (200-300 lines) - MEDIUM PRIORITY

- [x] skill-too-many-files.md (279 → 120 lines) ✅ DONE
- [x] skill-dangerous-command.md (273 → 114 lines) ✅ DONE
- [x] skill-naming-inconsistent.md (275 → 106 lines) ✅ DONE
- [x] skill-eval-usage.md (287 → 133 lines) ✅ DONE
- [x] skill-missing-comments.md (238 → 123 lines) ✅ DONE
- [x] skill-missing-examples.md (334 → 168 lines) ✅ DONE
- [x] skill-missing-version.md (165 → 86 lines) ✅ DONE
- [x] skill-missing-changelog.md (197 → 121 lines) ✅ DONE

## Batch 5: Close to Target (<200 lines) - LOW PRIORITY

- [x] import-circular.md (218 → 119 lines) ✅ DONE
- [x] import-missing.md (206 → 101 lines) ✅ DONE
- [x] size-error.md (191 → 94 lines) ✅ DONE
- [x] size-warning.md (143 → 86 lines) ✅ DONE
- [x] skill-missing-shebang.md (141 → 85 lines) ✅ DONE

---

## Validation Checklist

After completing each batch, verify:

- [x] Run `npm run audit:rule-docs` - All updated docs pass ✅
- [x] Run `npm run lint:md docs/rules/` - All updated docs pass (5 minor warnings) ✅
- [x] Manual review - Docs are clear and concise ✅
- [x] Consistency check - Similar rules use similar structure ✅

---

## Final Validation

After ALL docs are rewritten:

- [x] All 27 docs pass `npm run audit:rule-docs` with 0 errors ✅
- [x] All 27 docs pass markdownlint (5 minor warnings acceptable) ✅
- [x] Average line count < 200 (actual: 122 lines) ✅
- [x] 0% docs using old metadata table format ✅
- [x] 100% docs have source code links ✅
- [x] 0% docs with redundant sections ✅
- [x] Run `npm run check:all` - Everything passes ✅

**COMPLETE!** Ready to move to next phase.

---

## Progress Tracking

**Completed**: 27 / 27 (100%)

**Completed on**: 2026-01-28

**Target completion**: [Fill in date]
