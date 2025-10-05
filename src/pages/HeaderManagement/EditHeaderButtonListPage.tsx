import React, { useState, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface HeaderButton {
  id: number;
  title: string;
  link: string;
  is_active: boolean;
}

interface FormData {
  title: string;
  link: string;
}

const EditHeaderButtonListPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { button } = location.state as { button: HeaderButton } || {};
  
  const [formData, setFormData] = useState<FormData>({
    title: button?.title || "",
    link: button?.link || "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { useUpdate } = useCrud();
  
  const updateButton = useUpdate<HeaderButton>("/header-buttons/", "/header-buttons/");

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Link Title is required";
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
    if (!button || !validateForm()) {
      return;
    }

    updateButton.mutate(
      {
        id: button.id,
        data: {
          title: formData.title,
          link: formData.link,
          is_active: button.is_active,
        },
      },
      {
        onSuccess: () => {
          toast.success("Header button updated successfully!");
          navigate("/header-management/header-buttons");
        },
        onError: (error: any) => {
          console.error("Failed to update header button:", error);
          toast.error("Failed to update header button");
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

  if (!button) {
    return (
      <div className="admin_panel">
        <div className="Breadcrumbs">
          <h3>Edit Link</h3>
        </div>
        <div className="card_bx">
          <p>No button data available. Please select a button to edit.</p>
          <Link to="/header-management/header-buttons" className="btn">
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Edit Link</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Link Title</label>
            <input
              className="form-control"
              type="text"
              id="title"
              name="title"
              placeholder="Enter"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="error" style={{ color: "red", fontSize: "0.8em" }}>{errors.title}</p>}
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
              disabled={updateButton.isPending}
            >
              {updateButton.isPending ? "Submitting..." : "Submit"}
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

export default EditHeaderButtonListPage;