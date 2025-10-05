import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Course } from "../../types";

interface CoursesState {
  courses: Course;
  selectedCourse: Course | null;
  loading: {
    courses: boolean;
    selectedCourse: boolean;
  };
  errors: {
    courses: string | null;
    selectedCourse: string | null;
  };
}

const initialState: CoursesState = {
  courses: [],
  selectedCourse: null,
  loading: {
    courses: false,
    selectedCourse: false,
  },
  errors: {
    courses: null,
    selectedCourse: null,
  },
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    // Set all courses
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
      state.errors.courses = null;
    },
    setSelectedCourse: (state, action: PayloadAction<Course[] | null>) => {
      state.selectedCourse = action.payload;
      state.errors.selectedCourse = null;
    },
    // Set loading states
    setCoursesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.courses = action.payload;
    },

    setSelectedCourseLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.selectedCourse = action.payload;
    },

    // Set error states
    setCoursesError: (state, action: PayloadAction<string | null>) => {
      state.errors.courses = action.payload;
    },

    setSelectedCourseError: (state, action: PayloadAction<string | null>) => {
      state.errors.selectedCourse = action.payload;
    },

    // Clear all courses
    clearCourses: (state) => {
      state.courses = [];
      state.selectedCourse = null;
      state.errors = {
        courses: null,
        selectedCourse: null,
      };
    },
  },
});

export const {
  setCourses,
  setSelectedCourse,
  setCoursesLoading,
  setSelectedCourseLoading,
  setCoursesError,
  setSelectedCourseError,
  clearCourses,
} = coursesSlice.actions;

export default coursesSlice.reducer;
