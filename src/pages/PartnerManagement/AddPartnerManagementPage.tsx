import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  category: string;
  logo: File | null;
}

interface Errors {
  name?: string;
  category?: string;
  logo?: string;
}

const AddPartnerManagementPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    logo: null,
  });
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Select Category");
  const [errors, setErrors] = useState<Errors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const filters = ["Academic", "Industry"];
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { useCreate } = useCrud();

  const createPartner = useCreate("/partners/", "/partners/");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    setFormData((prev) => ({ ...prev, category: filter }));
    setShowCourseDropdown(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Partner Name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.logo) {
      newErrors.logo = "Logo is required";
    } else if (!formData.logo.type.startsWith("image/")) {
      newErrors.logo = "Please upload a valid image file";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    if (formData.logo) {
      formDataToSend.append("logo", formData.logo);
    }
    formDataToSend.append("is_active", "true");

    createPartner.mutate(formDataToSend, {
      onSuccess: () => {
        toast.success("Partner added successfully!");
        navigate("/partner-management/existing-partner");
      },
      onError: (error: any) => {
        console.error("Failed to add partner:", error);
        toast.error("Failed to add partner");
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files && files[0]) {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
      if (errors.logo) {
        setErrors((prev) => ({ ...prev, logo: undefined }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof Errors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

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
        <h3>Add Partner</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Partner Name</label>
            <input
              className="form-control"
              type="text"
              id="name"
              name="name"
              placeholder="Enter"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="CategoryWrappFilter" ref={dropdownRef}>
              <button
                type="button"
                className="CategoryBtn"
                onClick={() => setShowCourseDropdown((prev) => !prev)}
              >
                {selectedFilter}
                <span className={`arrow ${showCourseDropdown ? "show" : ""}`}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="24"
                      height="24"
                      transform="matrix(0 -1 1 0 0 24)"
                      fill="white"
                      fill-opacity="0.01"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10.2929 15.7079C10.4818 15.8947 10.7368 15.9995 11.0024 15.9995C11.2681 15.9995 11.523 15.8947 11.7119 15.7079L14.6769 12.7689C14.8919 12.5509 14.9989 12.2689 14.9989 11.9899C14.9989 11.7109 14.8919 11.4339 14.6769 11.2209L11.7219 8.29093C11.5329 8.10437 11.278 7.99976 11.0124 7.99976C10.7469 7.99976 10.492 8.10437 10.3029 8.29093C10.2098 8.38276 10.1358 8.4922 10.0853 8.61289C10.0347 8.73358 10.0087 8.8631 10.0087 8.99393C10.0087 9.12476 10.0347 9.25429 10.0853 9.37497C10.1358 9.49566 10.2098 9.6051 10.3029 9.69693L12.6199 11.9949L10.2929 14.3019C10.2001 14.394 10.1264 14.5035 10.0762 14.6241C10.0259 14.7448 10 14.8742 10 15.0049C10 15.1356 10.0259 15.2651 10.0762 15.3857C10.1264 15.5064 10.2001 15.6159 10.2929 15.7079Z"
                      fill="black"
                    />
                  </svg>
                </span>
              </button>
              {showCourseDropdown && (
                <ul className="FiltersdropDownCategory">
                  {filters.map((filter) => (
                    <li key={filter} onClick={() => handleFilterClick(filter)}>
                      <label>
                        <span style={{ fontWeight: "bold" }}>{filter}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.category && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.category}
              </p>
            )}
          </div>

          <div className="UploadLogoForm">
            <label>Upload Logo</label>
            <label htmlFor="logo" className="Upload">
              <input
                type="file"
                name="logo"
                id="logo"
                accept="image/*"
                onChange={handleChange}
              />
              <span>{formData.logo ? formData.logo.name : "Choose File"}</span>
            </label>
            {errors.logo && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.logo}
              </p>
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
                  alt="Logo Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={createPartner.isPending}
            >
              {createPartner.isPending ? "Submitting..." : "Submit"}
            </button>
            <Link to="/partner-management/existing-partner" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPartnerManagementPage;