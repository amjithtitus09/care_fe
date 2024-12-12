import { navigate } from "raviger";

import * as Notifications from "@/Utils/Notifications";

const notify = Notifications;

export function handleQueryError(error: Error) {
  const err = error as any; // Cast to any to access our custom properties

  // Ignore aborted requests
  if (err?.name === "AbortError") return;

  // Handle session expiry
  if (isSessionExpired(err)) {
    handleSessionExpiry();
    return;
  }

  // Handle bad requests
  if (isBadRequest(err)) {
    if (!err?.silent) notify.BadRequest({ errs: err });
    return;
  }

  // Handle not found
  if (isNotFound(err)) {
    handleNotFound();
    return;
  }

  // Handle other errors
  if (!err?.silent) {
    notify.Error({ msg: err?.detail || "Something went wrong!" });
  }
}

// Helper functions
function isSessionExpired(error: any) {
  return (
    error?.code === "token_not_valid" ||
    error?.detail === "Authentication credentials were not provided."
  );
}

function handleSessionExpiry() {
  if (!location.pathname.startsWith("/session-expired")) {
    navigate(`/session-expired?redirect=${window.location.href}`);
  }
}

function isBadRequest(error: any) {
  return error?.status === 400 || error?.status === 406;
}

function isNotFound(error: any) {
  return error?.status === 404 || error?.code === "not_found";
}

function handleNotFound() {
  if (!location.pathname.startsWith("/not-found")) {
    navigate("/not-found");
  }
}
