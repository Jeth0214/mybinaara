/**
 * Same character classes as Angular's built-in Validators.email, but requires
 * at least one `.label` group after the @ so single-label domains like
 * "user@test" (which Validators.email accepts) are rejected.
 */
export const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
