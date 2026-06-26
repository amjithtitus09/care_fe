// Throwaway probe to validate the gh-aw pr-fix REWORK CAP / escalation path.
// Intentionally contains an unused variable so "Lint Code Base" fails, giving the
// fixer a real failure to look at — but with 3 prior "attempt" markers seeded on
// the PR, the loop guard must ESCALATE (needs-human) instead of pushing a fix.
// Disposable; never merged.
export function reworkCapProbe(): string {
  const unusedValue = 7;
  return "rework-cap validation probe";
}
