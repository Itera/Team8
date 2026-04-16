# Ceremonies

> Team meetings that happen before or after work. Each squad configures their own.

## Pre-PR State Flush

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | any agent is about to open a PR (`gh pr create`) |
| **Facilitator** | scribe |
| **Participants** | scribe only |
| **Time budget** | minimal (file ops only) |
| **Enabled** | ✅ yes |

**What happens:**
1. Coordinator spawns Scribe **synchronously** with `MODE: pre-pr-flush` and the current issue number.
2. Scribe merges decision inbox → `decisions.md`, deduplicates, then commits all `.squad/` changes to the feature branch.
3. Only after Scribe reports success does the agent run `gh pr create`.

> ⚠️ This ceremony is a hard gate. A PR MUST NOT be opened until this ceremony completes successfully. If Scribe fails, the coordinator must retry or escalate to the user — never skip.

---

## Design Review

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | multi-agent task involving 2+ agents modifying shared systems |
| **Facilitator** | lead |
| **Participants** | all-relevant |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. Review the task and requirements
2. Agree on interfaces and contracts between components
3. Identify risks and edge cases
4. Assign action items

---

## Retrospective

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | after |
| **Condition** | build failure, test failure, or reviewer rejection |
| **Facilitator** | lead |
| **Participants** | all-involved |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. What happened? (facts only)
2. Root cause analysis
3. What should change?
4. Action items for next iteration
