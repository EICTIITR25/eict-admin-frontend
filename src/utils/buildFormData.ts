export const buildFormData = (
  form: Record<string, any>,
  keyMap: Record<string, string>,
  extraFields: Record<string, any> = {}
): FormData => {
  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    const apiKey = keyMap[key] || key;

    const value = form[key];

    // Handle Files
    if (value instanceof File) {
      formData.append(apiKey, value);
    }
    // Handle booleans
    else if (typeof value === "boolean") {
      formData.append(apiKey, String(value));
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      if (value.length > 0 && value[0] instanceof File) {
        value.forEach((file: File) => {
          formData.append(`${apiKey}`, file);
        });
      } else {
        if (key === "coordinators") {
          formData.append(apiKey, JSON.stringify(value));
          return;
        }
        formData.append(apiKey, value.join(","));
      }
    } else if (typeof value === "object" && value !== null) {
      formData.append(apiKey, JSON.stringify(value));
    }
    // Normal strings/numbers
    else if (value !== null && value !== undefined) {
      formData.append(apiKey, String(value));
    }
  });
  Object.entries(extraFields).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  return formData;
};
