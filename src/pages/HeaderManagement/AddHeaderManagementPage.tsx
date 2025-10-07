import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface HeaderForm {
  name: string;
  image: File | null;
}

interface HeaderErrors {
  name?: string;
  image?: string;
  general?: string;
}

const AddHeaderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { useCreate } = useCrud();
  const createHeader = useCreate("/headers-images/");

  const [formData, setFormData] = useState<HeaderForm>({
    name: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<HeaderErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a valid image file (jpg/png)",
      }));
      setImagePreview(null);
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validate = () => {
    const newErrors: HeaderErrors = {};
    if (!formData.name.trim()) newErrors.name = "Header Title is required";
    if (!formData.image) newErrors.image = "Header Image is required";
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
    payload.append("header_title", formData.name);
    if (formData.image) {
      payload.append("image_file", formData.image);
    }

    createHeader.mutate(payload, {
      onSuccess: () => {
        toast.success("Header image added successfully!");
        navigate("/header-management/header-images");
      },
      onError: (error: any) => {
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Failed to add header image",
        }));
        toast.error("Failed to add header image.");
      },
    });
  };

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Add Header</h3>
      </div>
      <div className="card_bx">
        <p>Header Info</p>
        {errors.general && (
          <div className="text-danger mb-3">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Header Title</label>
            <input
              className="form-control"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter"
            />
            {errors.name && (
              <small className="text-danger">{errors.name}</small>
            )}
          </div>
          <div className="UploadLogoForm">
            <label>Upload Header Image</label>
            <label htmlFor="image" className="Upload">
              <input
                type="file"
                name="image"
                id="image"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />
              <span>Choose File</span>
            </label>
            {formData.image && (
              <p className="mt-2">Selected: {formData.image.name}</p>
            )}
            {errors.image && (
              <small className="text-danger">{errors.image}</small>
            )}
            {imagePreview && (
              <div
                className="image-preview"
                style={{
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Header Image Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <p>Note: Please upload a single jpg or png file</p>
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={createHeader.isPending}
            >
              {createHeader.isPending ? "Submitting..." : "Submit"}
            </button>
            <Link to="/header-management/" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHeaderManagementPage;
