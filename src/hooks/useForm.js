import { useCallback, useState } from 'react';
import { validate } from '@/lib/validators';

/**
 * Minimal form state + validation.
 *   const { field, handleSubmit } = useForm(initial, schema);
 *   <Input {...field('email')} />
 */
export function useForm(initialValues, schema = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }, []);

  const field = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => setField(name, event.target.value),
  });

  const handleSubmit = (onValid) => async (event) => {
    event.preventDefault();
    const nextErrors = validate(schema, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await onValid(values);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return { values, errors, submitting, field, setField, setValues, setErrors, handleSubmit, reset };
}
