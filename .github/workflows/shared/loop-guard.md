---
description: >
  Reusable rework-cap and escalation guard for autonomous PR-fix loops. Inject
  this fragment into a workflow body with `{{#runtime-import}}` to enforce a hard
  maximum number of automated rework attempts per pull request and to escalate to
  a human instead of looping forever. Contains no GitHub Actions expressions so it
  is safe to runtime-import.
---

## Loop control and escalation (rework cap)

You are part of an automated rework loop. To avoid infinite loops you MUST
enforce a hard cap on the number of automated fix attempts for this pull request.

1. **Read the attempt counter** from cache memory at
   `/tmp/gh-aw/cache-memory/pr-<PR_NUMBER>-fix-attempts.json`, where `<PR_NUMBER>`
   is the number of the pull request you are working on (given in the workflow
   context above). If the file does not exist, treat the current count as `0`.
   As a durable cross-check (cache memory is best-effort and may be lost between
   runs), also scan the pull request's existing comments for prior automated
   fix-attempt markers (comments containing "automated fix attempt"). Use the
   **higher** of the cached count and the number of those comments as the
   effective attempt count, so the cap holds even if the cache was evicted.

2. The maximum number of automated attempts is **3**.

3. **If the current count is already `>= 3`, STOP.** Do not push any further
   changes. Instead, escalate:
   - Add the `needs-human` label to the PR using the `add-labels` safe output.
   - Assign the PR author (or a maintainer) using the `assign-to-user` safe
     output, when available.
   - Post a comment with `add-comment` explaining that the automated rework limit
     was reached, summarizing everything that was tried and why it did not work,
     and asking a human to take over.
   - Report `needs-human` status back to JIRA via the `jira_report` tool.
   - Then finish **without** making code changes.

4. **Otherwise**, proceed with the fix. Just before you push (see the push step),
   increment the counter and write it back to the cache file as JSON including:
   the new `count`, an ISO `timestamp`, the current workflow run id, and a
   one-line `summary` of what you tried.

5. Only treat an attempt as "used" when you actually push changes to the PR
   branch. If you make no changes (e.g. nothing to fix), do not increment the
   counter.

6. Keep each rework **minimal and surgical** — change only what is needed to make
   the failing checks pass. Never disable tests, weaken assertions, or remove
   functionality to make CI go green.
