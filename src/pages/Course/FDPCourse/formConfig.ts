import { FieldErrorMap } from "../../../utils/validateFields";

export const requiredFieldsMap: Record<number, FieldErrorMap> = {
  1: {
    name: "Name is required",
    description: "Description is required",
    venue: "Venue is required",
    // course_venue: "Course venue is required",
    // hub_venue: "Hub venue is required",
    // spoke_venue: "Spoke venue is required",
    conference_code: "Conference code is required",
    start_from: "Start date is required",
    end_date: "End date is required",
    investigator_name: "Investigator name is required",
    investigator_email: "Investigator email is required",
    investigator_phone: "Investigator phone is required",
    cover_media_file: "Cover media file is required",
    brochure_file: "Brochure file is required",
  },
};

export const keyMap: Record<string, string> = {
  name: "title_write",
  description: "description_write",
  category_id: "category_id",
  sale_price: "sales_price_write",
  gst: "gst_percentage_write",
  is_active: "is_active_write",
  start_from: "start_date_write",
  deadline: "application_deadline_write",
  brochure_file: "brochure_file",
  cover_media_file: "cover_media_file",
  venue: "venue_type",
  course_venue: "course_venue",
  hub_venue: "hub_venue",
  spoke_venue: "spoke_venue",
  conference_code: "conference_code",
  investigator_name: "investigator_name",
  investigator_email: "investigator_email",
  investigator_phone: "investigator_phone",
  coordinators: "coordinators",
  end_date: "end_date",
  total_price: "total_price"
};

export const defaultForm = {
  name: "",
  description: "",
  venue: "",
  course_venue: "",
  gst: "",
  category_id: "2",
  hub_venue: "",
  spoke_venue: "",
  conference_code: "",
  deadline: "",
  start_from: "",
  is_active: false,
  end_date: "",
  coordinators: [{ name: "", phone: "", department: "" }],
  investigator_name: "",
  investigator_email: "",
  investigator_phone: "",
  cover_media_file: null,
  brochure_file: null,
  total_price: ""
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
