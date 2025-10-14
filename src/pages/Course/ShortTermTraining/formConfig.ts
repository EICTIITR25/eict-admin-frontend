import { FieldErrorMap } from "../../../utils/validateFields";

export const requiredFieldsMap: Record<number, FieldErrorMap> = {
  1: {
    name: "Name is required",
    description: "Description is required",
    product_code: "Product code is required",
    start_from: "Start date is required",
    deadline: "Deadline is required",
    sale_price: "Sale price is required",
    gst: "GST is required",
    total_fees: "Total fees are required",
    cover_media_file: "Cover media file is required",
    brochure_file: "Brochure file is required",
    course_tags: "Course Tags are Required.",
  },
};

export const keyMap: Record<string, string> = {
  name: "title_write",
  description: "description_write",
  course_sub_headings: "sub_heading",
  product_code: "product_code",
  start_from: "start_date_write",
  deadline: "application_deadline_write",
  sale_price: "sales_price_write",
  gst: "gst_percentage_write",
  total_fees: "total_price",
  course_id: "tags_ids",
  course_tags: "course_tags",
  course_faculty_id: "faculty_id",
  program_benfits: "program_for_id",
  cover_media_file: "cover_media_file",
  brochure_file: "brochure_file",
  is_active: "is_active_write",
};

export const defaultForm = {
  name: "",
  description: "",
  course_sub_headings: "",
  product_code: "",
  start_from: "",
  end_date: "",
  sale_price: "",
  gst: "0",
  is_active: false,
  deadline: "",
  course_faculty_id: "",
  total_fees: "",
  cover_media_file: null,
  brochure_file: null,
  category_id: "5",
  course_id: [],
  course_tags: "",
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
