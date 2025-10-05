export interface User {
  email: string;
  first_name: string;
}
export interface AuthState {
  user: User | null;
  access: string | null;
  loading: boolean;
}
export interface Faculty {
  id: number | null;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  department: string | null;
  professor_page: string | null;
  status: boolean | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface FormFields {
  name: string;
  description: string;
  code: string;
  course_id: string;
  course_faculty_id: string;
  category_id: string;
  start_date: string;
  duration: string;
  sale_price: string;
  is_active: boolean;
  total_price: string;
  gst: string;
  deadline: string;
  brochure_file: File | null;
  cover_media_file: File | null;
}
export interface FormErrors {
  name?: string;
  description?: string;
  course_id?: string;
  code?: string;
  start_date?: string;
  category_id?: string;
  duration?: string;
  is_active?: boolean;
  sale_price?: string;
  total_price?: string;
  gst?: string;
  deadline?: string;
  brochure_file?: string;
  cover_media_file?: string;
}

export interface Course {
  [key: string]: any;
}

export interface GenericItems {
  [key: string]: any;
}
