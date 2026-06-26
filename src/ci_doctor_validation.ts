// Throwaway probe to validate the gh-aw ci-doctor + pr-fix loop.
// Intentionally contains an unused variable so "Lint Code Base" fails.
// This file lives only on a disposable validation PR and is never merged.
export function ciDoctorValidationProbe(): string {
  const unusedVariable = 42;
  return "ci-doctor validation probe";
}
