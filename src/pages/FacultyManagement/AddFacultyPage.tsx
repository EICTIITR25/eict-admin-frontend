import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../../assets";
import { useCrud } from "../../hooks/useCrud";
import { Faculty } from "../../types";

type FacultyForm = {
  firstName: string;
  lastName: string;
  department: string;
  professorPage: string;
  description: string;
  picture: File | null;
};

type FacultyErrors = Partial<
  Record<keyof Omit<FacultyForm, "picture">, string>
> & {
  general?: string;
};

const AddFacultyPage = () => {
  const navigate = useNavigate();
  const { useCreate } = useCrud<Faculty>();
  const createFaculty = useCreate("/faculties/manage/");

  const [formData, setFormData] = useState<FacultyForm>({
    firstName: "",
    lastName: "",
    department: "",
    professorPage: "",
    description: "",
    picture: null,
  });

  const [errors, setErrors] = useState<FacultyErrors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, picture: file }));
  };

  const validate = () => {
    const newErrors: FacultyErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.professorPage.trim())
      newErrors.professorPage = "Professor Page link is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = new FormData();
    payload.append("first_name", formData.firstName);
    payload.append("last_name", formData.lastName);
    payload.append("department", formData.department);
    payload.append("professor_page", formData.professorPage);
    payload.append("description", formData.description);
    if (formData.picture) {
      payload.append("picture", formData.picture);
    }

    createFaculty.mutate(payload, {
      onSuccess: () => {
        navigate("/faculty-management/");
      },
      onError: (error) => {
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Failed to add faculty",
        }));
      },
    });
  };

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Add Faculty</h3>
      </div>
      <div className="Facultycard_bx">
        <p>Basic Info</p>
        {errors.general && (
          <div className="text-danger mb-3">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6 col-sm-12">
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <small className="text-danger">{errors.firstName}</small>
                )}
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="form-control"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <small className="text-danger">{errors.lastName}</small>
                )}
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="form-group">
                <label>Department</label>
                <input
                  className="form-control"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter Department"
                />
                {errors.department && (
                  <small className="text-danger">{errors.department}</small>
                )}
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="form-group">
                <label>Professor Page</label>
                <input
                  className="form-control"
                  type="text"
                  name="professorPage"
                  value={formData.professorPage}
                  onChange={handleChange}
                  placeholder="Enter Link"
                />
                {errors.professorPage && (
                  <small className="text-danger">{errors.professorPage}</small>
                )}
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="user_profile">
                <div className="user_image">
                  <div className="edit_image">
                    <img
                      src={
                        formData.picture
                          ? URL.createObjectURL(formData.picture)
                          : assets.images.avatar
                      }
                      alt="avatar"
                    />
                    <label htmlFor="Edit">
                      <input
                        type="file"
                        name="picture"
                        id="Edit"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <span>Edit Photo</span>
                    </label>
                  </div>
                </div>
                <div className="chose_file">
                  <label htmlFor="File">
                    <input
                      type="file"
                      name="picture"
                      id="File"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <span>Choose File</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <small className="text-danger">{errors.description}</small>
                )}
              </div>
            </div>
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={createFaculty.isPending}
            >
              {createFaculty.isPending ? "Submitting..." : "Submit"}
            </button>
            <Link to="/faculty-management/" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyPage;
