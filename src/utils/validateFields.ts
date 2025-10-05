export type GenericFormData = Record<string, any>;
export type FieldErrorMap = Record<string, string>;
export type ValidationResult = {
  isValid: boolean;
  errors: FieldErrorMap;
};

export function validateFields(
  formData: GenericFormData,
  requiredFields: FieldErrorMap
): ValidationResult {
  const errors: FieldErrorMap = {};

  for (const key in requiredFields) {
    const path = key.split(".");
    let value: any = formData;

    for (const p of path) {
      value = value?.[p];
    }

    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "number" && isNaN(value));

    if (isEmpty) {
      errors[key] = requiredFields[key];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
