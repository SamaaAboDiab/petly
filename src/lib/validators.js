const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const rules = {
  required: (label) => (value) => (String(value ?? '').trim() ? null : `${label} is required`),
  email: () => (value) => (EMAIL_RE.test(value) ? null : 'Enter a valid email address'),
  minLength: (min, label) => (value) =>
    String(value ?? '').length >= min ? null : `${label} must be at least ${min} characters`,
  positive: (label) => (value) => (Number(value) > 0 ? null : `${label} must be greater than 0`),
  matches: (field, message) => (value, values) => (value === values[field] ? null : message),
  checked: (message) => (value) => (value ? null : message),
};

/** Runs a schema of `{ field: [rule, ...] }` and returns `{ field: firstError }`. */
export function validate(schema, values) {
  return Object.entries(schema).reduce((errors, [field, fieldRules]) => {
    const error = fieldRules.map((rule) => rule(values[field], values)).find(Boolean);
    if (error) errors[field] = error;
    return errors;
  }, {});
}

/** 0–4 score used by the password strength meter. */
export function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
