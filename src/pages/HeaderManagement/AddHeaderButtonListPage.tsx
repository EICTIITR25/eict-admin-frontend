import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  link: string;
}

const AddHeaderButtonListPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    link: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const navigate = useNavigate();
  const { useCreate } = useCrud();

  const createButton = useCreate("/header-buttons/", "/header-buttons/");

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Link Title is required";
    }
    if (!formData.link.trim()) {
      newErrors.link = "Link URL is required";
    } else if (!/^https?:\/\/.+/i.test(formData.link)) {
      newErrors.link = "Please enter a valid URL (starting with http:// or https://)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    createButton.mutate(
      {
        title: formData.name,
        link: formData.link,
        // status: true,
      },
      {
        onSuccess: () => {
          toast.success("Header button added successfully!");
          navigate("/header-management/header-buttons");
        },
        onError: (error: any) => {
          console.error("Failed to add header button:", error);
          toast.error("Header button with this link already exists.");
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Add Link</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Link Title</label>
            <input
              className="form-control"
              type="text"
              id="name"
              name="name"
              placeholder="Enter"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error" style={{ color: "red", fontSize: "0.8em" }}>{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="link">Link URL</label>
            <input
              className="form-control"
              type="text"
              id="link"
              name="link"
              placeholder="Enter"
              value={formData.link}
              onChange={handleChange}
            />
            {errors.link && <p className="error" style={{ color: "red", fontSize: "0.8em" }}>{errors.link}</p>}
          </div>
          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={createButton.isPending}
            >
              {createButton.isPending ? "Submitting..." : "Submit"}
            </button>
            <Link to="/header-management/header-buttons" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHeaderButtonListPage;