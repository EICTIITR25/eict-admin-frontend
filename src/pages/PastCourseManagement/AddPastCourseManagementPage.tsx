import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FieldErrorMap, useDynamicForm } from "../../hooks/useDynamicForm";
import { validateFields } from "../../utils/validateFields";
import { useCrud } from "../../hooks/useCrud";
import { getErrorMessage } from "../../utils/helper";
import { toast } from "react-toastify";

const defaultValue = {
  name: "",
  mode: "",
  start_date: "",
  end_date: "",
  category: "",
  venue: "",
  phase: "",
  no_of_participants: "",
};

export const requiredFieldsMap: Record<number, FieldErrorMap> = {
  1: {
    name: "Course Name is required.",
    mode: "Mode is required.",
    start_date: "Start Date is required.",
    end_date: "End Date is required.",
    category: "Category is required.",
    venue: "Venu is required.",
    phase: "Phase is required.",
    no_of_participants: "Participation is required.",
  },
};
const modeList = [
  { key: "", value: "Select Mode" },
  { key: "online", value: "Online" },
  { key: "hybrid", value: "Hybrid" },
  { key: "physical", value: "Physical" },
];

const categoryDropDownList = [
  { key: "", value: "Select Category" },
  { key: "Self Paced", value: "Self Paced" },
  { key: "FDP", value: "FDP" },
  { key: "PG Certification", value: "PG Certification" },
  { key: "Short Term Training", value: "Short Term Training" },
  { key: "EICT-Third Party", value: "EICT-Third Party" },
];

const AddPastCourseManagementPage = () => {
  const navigate = useNavigate();
  const { form, errors, setErrors, handleChange, isFieldsEmpty } =
    useDynamicForm(defaultValue);
  const { useCreate } = useCrud();

  const { mutate: createPastCourse } = useCreate(
    "/courses/past-courses/",
    [""],
    {
      onSuccess: () => {
        toast.success("Added Successfully.");
        navigate("/past-course-management/all-past-courses");
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = requiredFieldsMap[1];
    const { isValid, errors } = validateFields(form, requiredFields);

    if (!isValid) {
      setErrors(errors);
      return;
    }
    setErrors({});
    createPastCourse(form);
  };

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Add Past Course</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseName">Course Name</label>
            <input
              className="form-control"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter course name"
            />
            {errors.courseName && <span className="error">{errors.name}</span>}
          </div>
          <div className="grid3">
            <div className="form-group">
              <label htmlFor="mode">Mode</label>
              <select
                className="form-control"
                value={form.mode}
                onChange={(e) => handleChange("mode", e.target.value)}
              >
                {modeList.map((item: any) => (
                  <option value={item.key}>{item.value}</option>
                ))}
              </select>
              {errors.mode && <span className="error">{errors.mode}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="particiapants">No of participants</label>
              <input
                className="form-control"
                type="text"
                value={form.no_of_participants}
                onChange={(e) =>
                  handleChange("no_of_participants", e.target.value)
                } // Use existing handler
                placeholder="No of participants"
              />
              {errors.particiapants && (
                <span className="error">{errors.particiapants}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                className="form-control"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
              {errors.startDate && (
                <span className="error">{errors.startDate}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                className="form-control"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
              {errors.endDate && (
                <span className="error">{errors.endDate}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="mode">Phase</label>
              <select
                className="form-control"
                value={form.phase}
                onChange={(e) => handleChange("phase", e.target.value)}
              >
                <option value="">Select Phase</option>
                <option value="phase 1">Phase 1</option>
                <option value="phase 2">Phase 2</option>
              </select>
              {errors.mode && <span className="error">{errors.mode}</span>}
            </div>
          </div>
          <div className="grid2">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                {categoryDropDownList.map((item: any) => (
                  <option key={item.key}>{item.value}</option>
                ))}
              </select>
              {errors.category && (
                <span className="error">{errors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue</label>
              <input
                type="text"
                className="form-control"
                value={form.venue}
                onChange={(e) => handleChange("venue", e.target.value)}
                placeholder="Enter venue"
              />
              {errors.venue && <span className="error">{errors.venue}</span>}
            </div>
          </div>
          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={
                !isFieldsEmpty([
                  "name",
                  "mode",
                  "start_date",
                  "end_date",
                  "category",
                  "no_of_participants",
                  "venue",
                ])
              }
            >
              Submit
            </button>
            <Link to="/past-course-management/all-past-courses" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPastCourseManagementPage;
