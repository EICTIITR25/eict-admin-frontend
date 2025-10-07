import { FieldErrorMap } from "../../../utils/validateFields";

export const requiredFieldsMap: Record<number, FieldErrorMap> = {
  1: {
    name: "Name is required",
    description: "Description is required",
    code: "Code is required",
    course_id: "Course ID is required",
    course_faculty_id: "Faculty ID is required",
    start_date: "Start date is required",
    duration: "Duration is required",
    sale_price: "Sale price is required",
    total_price: "Total price is required",
    gst: "GST is required",
    deadline: "Deadline is required",
    brochure_file: "Brochure file is required",
    cover_media_file: "Cover media file is required",
    about_the_course: "About the course required."
  },
  // Add step 1, 2 etc. later if needed
};

export const defaultForm = {
  name: "",
  description: "",
  code: "",
  course_id: [],
  course_faculty_id: [],
  category_id: "1",
  start_date: "",
  duration: "",
  sale_price: "",
  is_active: false,
  total_price: "",
  gst: "",
  deadline: "",
  brochure_file: null,
  cover_media_file: null,
  chapter_name: "",
  chapter_description: "",
  about_the_course: "",
};

export const keyMap: Record<string, string> = {
  name: "title_write",
  description: "description_write",
  course_id: "about_course_ids",
  course_faculty_id: "course_faculty_id",
  category_id: "category_id",
  code: "product_code",
  sale_price: "sales_price_write",
  gst: "gst_percentage_write",
  total_price: "total_price",
  duration: "course_duration_months",
  is_active: "is_active_write",
  start_date: "start_date_write",
  deadline: "application_deadline_write",
  brochure_file: "brochure_file",
  cover_media_file: "cover_media_file",
  about_the_course: "about_the_course"
};

export const mapEditedFieldsToApiKeys = (
  editedFields: Record<string, any>
): Record<string, any> => {
  const mappedData: Record<string, any> = {};
  for (const key in editedFields) {
    mappedData[key] = keyMap[key];
  }
  return mappedData;
};
