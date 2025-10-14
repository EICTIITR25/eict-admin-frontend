import { FieldErrorMap } from "../../../utils/validateFields";

export const requiredFieldsMap: Record<number, FieldErrorMap> = {
  1: {
    name: "Name is required",
    description: "Description is required",
    course_tags: "Course tags are required",
    course_sub_headings: "Course subheadings are required",
    why_should_i_join: "Why should I join is required",
    course_benefits: "Course benefits are required",
    course_highlights: "Course highlights are required",
    product_code: "Product code is required",
    start_from: "Start date is required",
    end_date: "End date is required",
    deadline: "Deadline is required",
    sale_price: "Sale price is required",
    gst: "GST is required",
    total_fees: "Total fees are required",
    educator: "Educator is required",
    cover_media_file: "Cover media file is required",
    brochure_file: "Brochure file is required",
  },
};

export const keyMap: Record<string, string> = {
  name: "title_write",
  description: "description_write",
  course_tags: "course_tags",
  course_sub_headings: "course_sub_headings",
  why_should_i_join: "why_should_i_join_id",
  features: "features_ids",
  course_benefits: "course_benefits_id",
  program_for: "program_for_id",
  course_highlights: "course_highlights_id",
  product_code: "product_code",
  category_id: "category_id",
  start_from: "start_date_write",
  end_date: "end_date",
  deadline: "application_deadline_write",
  sale_price: "sales_price_write",
  gst: "gst_percentage_write",
  total_fees: "total_price",
  educator: "faculty_ids",
  is_active: "is_active_write",
  cover_media_file: "cover_media_file",
  brochure_file: "brochure_file",
  duration: "course_duration",
};

export const defaultForm = {
  name: "",
  description: "",
  course_tags: "",
  course_sub_headings: "",
  why_should_i_join: [],
  features: [],
  course_benefits: [],
  program_for: [],
  course_highlights: [],
  product_code: "",
  category_id: "3",
  start_from: "",
  end_date: "",
  deadline: "",
  sale_price: "",
  gst: "0",
  total_fees: "",
  is_active: false,
  educator: [],
  cover_media_file: null,
  brochure_file: null,
  chapter_name: "",
  chapter_description: "",
  learning: [],
  career: [],
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
