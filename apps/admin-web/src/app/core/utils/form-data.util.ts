/**
 * Appends a value to FormData using Laravel's bracket notation for nested
 * objects/arrays (e.g. `location[full_address]`, `schedule[0][day]`).
 * Skips `null`/`undefined` leaves so optional fields are simply omitted.
 */
export function appendFormData(formData: FormData, key: string, value: unknown): void {
  if (value === null || value === undefined) {
    return;
  }

  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormData(formData, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) =>
      appendFormData(formData, `${key}[${childKey}]`, childValue)
    );
    return;
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0');
    return;
  }

  formData.append(key, String(value));
}
