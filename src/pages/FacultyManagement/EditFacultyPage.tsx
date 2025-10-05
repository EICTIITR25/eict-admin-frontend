import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import assets from "../../assets";
import { useCrud } from "../../hooks/useCrud";

type FacultyForm = {
  firstName: string;
  lastName: string;
  department: string;
  professorPage: string;
  description: string;
  picture: File | null;
};

// Subset type for text fields only, excluding 'picture'
type TextFields = Omit<FacultyForm, "picture">;

type FacultyErrors = Partial<
  Record<keyof FacultyForm, string> & { general?: string }
>;

interface Faculty {
  id: number;
  first_name: string;
  last_name: string;
  picture_url: string | null;
  department: string;
  professor_page: string;
  status: boolean;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface LocationState {
  faculty?: Faculty;
}

const EditFacultyPage = () => {
  const { state } = useLocation() as { state: LocationState | null };
  const navigate = useNavigate();

  const faculty: Faculty | undefined = state?.faculty;

  const { useUpdate } = useCrud();
  const updateFaculty = useUpdate<Faculty>(
    `/faculties/manage/`,
    "/faculties/list/"
  );

  const [formData, setFormData] = useState<FacultyForm>({
    firstName: "",
    lastName: "",
    department: "",
    professorPage: "",
    description: "",
    picture: null,
  });

  const [errors, setErrors] = useState<FacultyErrors>({});
  const [currentPictureUrl, setCurrentPictureUrl] = useState<string | null>(
    null
  );

  // Initialize form only if faculty data is present
  React.useEffect(() => {
    if (!faculty) {
      navigate("/faculty-management/", { replace: true });
      return;
    }

    setFormData({
      firstName: faculty.first_name,
      lastName: faculty.last_name,
      department: faculty.department,
      professorPage: faculty.professor_page,
      description: faculty.description,
      picture: null,
    });
    setCurrentPictureUrl(faculty.picture_url);
  }, [faculty, navigate]);

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
    setCurrentPictureUrl(
      file ? URL.createObjectURL(file) : faculty?.picture_url || null
    );
  };

  const validate = (): FacultyErrors => {
    const newErrors: FacultyErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.professorPage.trim())
      newErrors.professorPage = "Professor Page is required";
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

    updateFaculty.mutate(
      { id: faculty!.id, data: payload },
      {
        onSuccess: () => {
          navigate("/faculty-management/");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update faculty";
          setErrors({ general: errorMessage });
        },
      }
    );
  };

  // Prevent rendering until redirect if faculty is missing
  if (!faculty) return null;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Edit Faculty</h3>
      </div>
      <div className="Facultycard_bx">
        <p>Basic Info</p>
        {errors.general && (
          <div className="text-danger mb-3">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row">
            {(
              [
                {
                  label: "First Name",
                  name: "firstName",
                  placeholder: "First Name",
                },
                { label: "Last Name", name: "lastName", placeholder: "Last Name" },
                {
                  label: "Department",
                  name: "department",
                  placeholder: "Enter Department",
                },
                {
                  label: "Professor Page",
                  name: "professorPage",
                  placeholder: "Enter Link",
                },
              ] as Array<{
                label: string;
                name: keyof TextFields;
                placeholder: string;
              }>
            ).map(({ label, name, placeholder }) => (
              <div key={name} className="col-lg-6 col-sm-12">
                <div className="form-group">
                  <label htmlFor={name}>{label}</label>
                  <input
                    className="form-control"
                    type="text"
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                  />
                  {errors[name] && (
                    <div className="text-danger">{errors[name]}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="col-lg-6 col-sm-12">
              <div className="user_profile">
                <div className="user_image">
                  <div className="edit_image">
                    <img
                      src={currentPictureUrl || assets.images.avatar}
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
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                />
                {errors.description && (
                  <div className="text-danger">{errors.description}</div>
                )}
              </div>
            </div>
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={updateFaculty.isPending}
            >
              {updateFaculty.isPending ? "Saving..." : "Save"}
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

export default EditFacultyPage;
