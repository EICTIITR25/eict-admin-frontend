import { ChangeEvent, useCallback, useState } from "react";

export type DynamicForm = Record<string, any>;
export type FieldErrorMap = Record<string, string>;

export const areFieldsValid = (
  form: DynamicForm,
  fields: string[]
): boolean => {
  return fields.every((field) => {
    const value = form[field];

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    // Handle other values (null, undefined, empty string)
    return value !== "" && value !== null && value !== undefined;
  });
};
const isEqual = (a: any, b: any): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  if (typeof a === "object" && typeof b === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return String(a) === String(b); // handles string/number coercion
};

export const useDynamicForm = (
  initialForm: DynamicForm,
  isEditMode: boolean = false
) => {
  const [form, setForm] = useState<DynamicForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});
  const [originalData, setOriginalData] = useState<Record<string, any>>({});

  const handleChange = useCallback(
    (key: string, value: any, skipTracking = false) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
      if (!isEditMode || skipTracking) return;
      // if (key === "cover_media" || key === "brochure_file") {
      //   setEditedFields((prev) => ({ ...prev, [key]: value }));
      //   return;
      // }
      if (!isEqual(value, originalData[key])) {
        setEditedFields((prev) => ({ ...prev, [key]: value }));
      } else {
        // If user reverts value, remove from editedFields
        setEditedFields((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      }
    },
    [
      setForm,
      setErrors,
      setEditedFields,
      editedFields,
      originalData,
      isEditMode,
    ]
  );
  const handleFileChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      fieldKey: "brochure_file" | "cover_media_file",
      skipTracking = false
    ) => {
      const file = e.target.files?.[0] || null;
      setForm((prev) => ({ ...prev, [fieldKey]: file }));
      setErrors((prev) => ({ ...prev, [fieldKey]: "" }));

      if (!isEditMode || skipTracking) return;

      if (!isEqual(file, originalData[fieldKey])) {
        setEditedFields((prev) => ({ ...prev, [fieldKey]: file }));
      } else {
        setEditedFields((prev) => {
          const updated = { ...prev };
          delete updated[fieldKey];
          return updated;
        });
      }
    },
    [isEditMode, originalData]
  );
  const isFieldsEmpty = (fields: string[]): boolean => {
    return areFieldsValid(form, fields);
  };
  return {
    form,
    setForm,
    handleChange,
    errors,
    setErrors,
    areFieldsValid,
    isFieldsEmpty,
    editedFields,
    setEditedFields,
    setOriginalData,
    originalData,
    handleFileChange,
  };
};
