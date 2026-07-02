import { Controller } from 'react-hook-form';

/**
 * Wraps any input-like component (Input, Select, DateRangePicker) with
 * React Hook Form's Controller so it works the same way for every field
 * across every form in the app.
 *
 * Usage:
 * <FormField control={control} name="email" label="Email" as={Input} rules={{ required: 'Required' }} />
 */
export default function FormField({ control, name, rules, as: Component, ...rest }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Component {...field} {...rest} error={fieldState.error?.message} />
      )}
    />
  );
}
