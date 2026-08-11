import { HttpErrorResponse } from '@angular/common/http';

/** Thrown for a timed account lockout (e.g. too many failed login attempts), carrying when it lifts. */
export class LockoutError extends Error {
  constructor(message: string, public readonly lockedUntil: Date) {
    super(message);
  }
}

/** Maps a failed HTTP call (or a pre-thrown Error) to a user-facing Error message. */
export function mapHttpError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }

  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return new Error('Unable to reach the server. Check your connection and try again.');
    }

    if (err.status === 422 && err.error?.errors) {
      const firstField = Object.values(err.error.errors)[0];
      const message = Array.isArray(firstField) ? firstField[0] : err.error.message;
      return new Error(message ?? 'The submitted data is invalid.');
    }

    if (err.status === 403 && err.error?.locked_until) {
      return new LockoutError(err.error.message, new Date(err.error.locked_until));
    }

    if (err.error?.message) {
      return new Error(err.error.message);
    }

    return new Error('Something went wrong. Please try again.');
  }

  return new Error('Something went wrong. Please try again.');
}
