---
description: |
  This workflow creates daily repo status reports. It gathers recent repository
  activity (issues, PRs, discussions, releases, code changes) and generates
  engaging GitHub issues with productivity insights, community highlights,
  and project recommendations.

on:
  schedule: daily
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read

network: defaults

tools:
  github:
    # If in a public repo, setting `lockdown: false` allows
    # reading issues, pull requests and comments from 3rd-parties
    # If in a private repo this has no particular effect.
    lockdown: false
    min-integrity: none # This workflow is allowed to examine and comment on any issues

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    title-prefix: "[repo-status] "
    labels: [report, daily-status]
    close-older-issues: true
# Forked from githubnext/agentics repo-status.md@d63b34de (upstream pin removed —
# this copy now carries care-specific QA-pipeline observability requirements and
# is canonically maintained in care-agentic-workflows).
source: amjithtitus09/care-agentic-workflows/workflows/daily-repo-status.md@main
---

# Repo Status

Create an upbeat daily status report for the repo as a GitHub issue.

## What to include

- Recent repository activity (issues, PRs, discussions, releases, code changes)
- Progress tracking, goal reminders and highlights
- Project status and recommendations
- Actionable next steps for maintainers

## Agentic QA pipeline observability (required section)

Include a dedicated "🤖 QA pipeline" section covering the last 24h of the
Jira → PR automation:

- **Enrolled PRs**: open PRs labelled `jira-agent`, and their current `state:*`
  label (or "in flight" if none).
- **Throughput**: how many PRs reached `state:qa-passed`, how many were merged.
- **Rework loops**: PRs that cycled through `state:needs-rework` — count the
  attempts per PR (use the QA state ledger comment on each PR, a JSON block in a
  comment starting with `<!-- qa-state-ledger -->`, as the authoritative history).
- **Watchdog interventions**: comments/actions by the QA watchdog (resets,
  escalations to `state:needs-human`).
- **Parked PRs**: anything in `state:needs-human`, with age. Link the open
  `needs-human-triage` issue if it exists.
- **Agentic workflow runs**: list runs of the agentic workflows (Visual QA,
  reviewer, fixer, rework) in the window with conclusion and duration; flag any
  that hit their timeout or max-turns.
- Call out anomalies (e.g. repeated QA failures on the same PR, unusually long
  runs, workflows that never fired).

## Style

- Be positive, encouraging, and helpful 🌟
- Use emojis moderately for engagement
- Keep it concise - adjust length based on actual activity

## Process

1. Gather recent activity from the repository
2. Study the repository, its issues and its pull requests
3. Create a new GitHub issue with your findings and insights
