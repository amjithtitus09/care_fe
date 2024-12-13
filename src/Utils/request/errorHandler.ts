import { navigate } from "raviger";

import * as Notifications from "@/Utils/Notifications";
import { ResponseError } from "@/Utils/response/responseError";

const notify = Notifications;

export function handleQueryError(error: Error) {
  // Cast to ResponseError if it matches our expected structure
  if (error instanceof ResponseError) {
    const errorCause = error.cause;

    // Ignore aborted requests
    if (error?.name === "AbortError") return;

    // Handle session expiry
    if (isSessionExpired(errorCause)) {
      handleSessionExpiry();
      return;
    }

    // Handle bad requests
    if (isBadRequest(errorCause)) {
      if (!errorCause?.silent) notify.BadRequest({ errs: errorCause });
      return;
    }

    // Handle not found
    if (isNotFound(errorCause)) {
      handleNotFound();
      return;
    }

    // Handle other errors
    if (!errorCause?.silent) {
      notify.Error({ msg: errorCause?.detail || "Something went wrong!" });
    }
  } else {
    // Handle non-ResponseError errors
    notify.Error({ msg: error.message || "Something went wrong!" });
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
