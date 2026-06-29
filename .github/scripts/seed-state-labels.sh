#!/usr/bin/env bash
#
# Seed the QA state-machine labels for the care_fe label-driven QA pipeline.
#
# These `state:*` labels are the AUTHORITATIVE stage of the pipeline implemented by
# the agentic workflows pr-qa-playwright.md (QA), pr-rework.md (fixer),
# qa-watchdog.md (stall sweeper) and the deterministic workflows
# qa-bootstrap-enroll.yml (entry) and qa-mark-running.yml (marks QA running). Exactly
# one `state:*` label is active on a PR at any time (the workflows enforce this with
# `add-labels: { max: 1 }` + a `remove-labels` of the whole set on every transition).
#
# The set is intentionally namespaced under `state:` so it never collides with the
# repository's pre-existing label automation (`needs testing`, `needs review`,
# `changes required`, `Tested`, `reviewed`, driven by pr-automation.yml) — the two
# label dimensions are independent.
#
# State model (see .github/QA_STATE_MACHINE.md for the full diagram):
#   state:needs-qa     entry / re-enter  -> QA runs
#   state:qa-running   QA in progress    (set by qa-mark-running.yml; crash-detectable)
#   state:qa-passed    TERMINAL          (awaiting human merge — merge is always human)
#   state:needs-rework defect found      -> automated fixer runs
#   state:needs-human  TERMINAL          escalation; a human must take over
#
# Usage (idempotent — safe to re-run; `--force` updates colour/description in place):
#   ./.github/scripts/seed-state-labels.sh                 # current repo (gh-detected)
#   ./.github/scripts/seed-state-labels.sh owner/repo      # explicit repo
#
# Requires the GitHub CLI (`gh`) authenticated with `repo` scope.
set -euo pipefail

REPO="${1:-}"
if [[ -z "${REPO}" ]]; then
  REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
fi

echo "Seeding QA state-machine labels on ${REPO} ..."

seed() {
  local name="$1" color="$2" desc="$3"
  # `--force` makes this create-or-update, so the script is idempotent.
  gh label create "${name}" --repo "${REPO}" --color "${color}" --description "${desc}" --force
}

seed "state:needs-qa"     "1D76DB" "QA state machine: queued for backend-seeded visual QA"
seed "state:qa-running"   "FBCA04" "QA state machine: visual QA in progress"
seed "state:qa-passed"    "0E8A16" "QA state machine: visual QA passed — awaiting human merge"
seed "state:needs-rework" "D93F0B" "QA state machine: a UI defect was found — automated rework queued"
seed "state:needs-human"  "B60205" "QA state machine: escalated — needs a human"

echo "Done. Active state labels on ${REPO}:"
gh label list --repo "${REPO}" --search "state:" 2>/dev/null || true
