import { PermissionDeniedError } from "@/lib/permissions";
import type { ActionResult } from "@/types/api";

export function handleActionError<T>(error: unknown): ActionResult<T> {
  if (error instanceof PermissionDeniedError) {
    return {
      success: false,
      error: "You do not have permission to perform this action.",
    };
  }

  // Re-throw Next.js redirects
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }

  console.error("[Action Error]", error);
  return {
    success: false,
    error: "An unexpected error occurred. Please try again.",
  };
}
