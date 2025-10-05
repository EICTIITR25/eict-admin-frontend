import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface ValidationErrors {
  category?: string;
  certificates?: string;
}

interface FormData {
  category: string;
  certificates: File[];
}

const AddNewCertificatePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    category: "",
    certificates: [],
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Select Category");
  const filters = [
    "Self Paced",
    "FDP",
    "Advance PG Course",
    "Short Term Training",
  ];
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { useCreate } = useCrud();
  const createCertificate = useCreate(
    "/certificates/upload/",
    "/certificate-management/all-uploads"
  );

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (!filters.includes(formData.category)) {
      newErrors.category = "Please select a valid category from the dropdown";
    }

    if (formData.certificates.length === 0) {
      newErrors.certificates = "At least one image must be uploaded";
    } else {
      const invalidFiles = formData.certificates.filter(
        (file) => !["image/jpeg", "image/png"].includes(file.type)
      );
      if (invalidFiles.length > 0) {
        newErrors.certificates = "Only JPG/PNG files are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) =>
        ["image/jpeg", "image/png"].includes(file.type)
      );
      if (files.length === 0) {
        setErrors((prev) => ({
          ...prev,
          certificates: "Only JPG/PNG files are allowed",
        }));
        return;
      }
      const previews = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        certificates: [...prev.certificates, ...files],
      }));
      setCertificatePreviews((prev) => [...prev, ...previews]);
      if (errors.certificates) {
        setErrors((prev) => ({ ...prev, certificates: undefined }));
      }
    }
  };

  const handleRemoveCertificate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
    setCertificatePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  };

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    setFormData((prev) => ({ ...prev, category: filter }));
    setShowCourseDropdown(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("category", formData.category);
    formData.certificates.forEach((certificate) => {
      formDataToSend.append("file", certificate);
    });

    createCertificate.mutate(formDataToSend, {
      onSuccess: () => {
        toast.success(
          `${formData.certificates.length} certificate${
            formData.certificates.length !== 1 ? "s" : ""
          } uploaded successfully!`
        );
        navigate("/certificate-management/all-uploads");
      },
      onError: (error: any) => {
        toast.error("Certificate already exists for this ID");
        setErrors({
          certificates: "Failed to upload images. Please try again.",
        });
      },
    });
  };

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
      certificatePreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [certificatePreviews]);

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Upload Certificate</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="Certificate_filter">
            <div className="form-group">
              <label htmlFor="courseName">Category</label>
              <div className="CategoryWrappFilter" ref={dropdownRef}>
                <button
                  type="button"
                  className="CategoryBtn"
                  onClick={() => setShowCourseDropdown((prev) => !prev)}
                  disabled={createCertificate.isPending}
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
                      <li
                        key={filter}
                        onClick={() => handleFilterClick(filter)}
                      >
                        <label>
                          <span>{filter}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.category && (
                <p
                  className="error"
                  style={{ color: "red", fontSize: "0.8em" }}
                >
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          <div className="UploadLogoForm">
            <label>Upload Image</label>
            <label htmlFor="Upload" className="Upload">
              <input
                type="file"
                id="Upload"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleCertificateUpload}
                disabled={createCertificate.isPending}
              />
              <span>Choose File</span>
            </label>
            <p>
              Note: you can add single JPG/PNG file or multiple JPG/PNG files
            </p>
            <p style={{ fontSize: "0.9em", color: "#333", marginTop: "5px" }}>
              {formData.certificates.length} image
              {formData.certificates.length !== 1 ? "s" : ""} selected
            </p>
            {errors.certificates && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.certificates}
              </p>
            )}
            {certificatePreviews.length > 0 && (
              <div
                className="certificate-preview"
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                  justifyContent: "center",
                }}
              >
                {certificatePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="cardCertificate"
                    style={{ textAlign: "center" }}
                  >
                    <div className="Upload-certificate">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      {formData.certificates[index].name}
                    </p>
                    <button
                      type="button"
                      className="BtnRemove"
                      onClick={() => handleRemoveCertificate(index)}
                      disabled={createCertificate.isPending}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 10px",
                        background: "#f8d7da",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        color: "#721c24",
                      }}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.93168 2.39694C6.07639 2.11595 6.37385 1.93848 6.6981 1.93848H9.92458C10.2488 1.93848 10.5463 2.11595 10.691 2.39694L10.8839 2.7678H13.4566C13.9309 2.7678 14.3141 3.13919 14.3141 3.59713C14.3141 4.05507 13.9309 4.42646 13.4566 4.42646H3.16613C2.69261 4.42646 2.30859 4.05507 2.30859 3.59713C2.30859 3.13919 2.69261 2.7678 3.16613 2.7678H5.73873L5.93168 2.39694ZM3.14201 5.25578H13.4566V13.5491C13.4566 14.4639 12.6875 15.2077 11.7415 15.2077H4.85708C3.93389 15.2077 3.14201 14.4639 3.14201 13.5491V5.25578ZM5.28585 7.3291V13.1344C5.28585 13.3625 5.50291 13.5491 5.71462 13.5491C5.97456 13.5491 6.14338 13.3625 6.14338 13.1344V7.3291C6.14338 7.10104 5.97456 6.91444 5.71462 6.91444C5.50291 6.91444 5.28585 7.10104 5.28585 7.3291ZM7.85845 7.3291V13.1344C7.85845 13.3625 8.07552 13.5491 8.28722 13.5491C8.54716 13.5491 8.74011 13.3625 8.74011 13.1344V7.3291C8.74011 7.10104 8.54716 6.91444 8.28722 6.91444C8.07552 6.91444 7.85845 7.10104 7.85845 7.3291ZM10.4552 7.3291V13.1344C10.4552 13.3625 10.6481 13.5491 10.8839 13.5491C11.1198 13.5091 11.3127 13.3625 11.3127 13.1344V7.3291C11.3127 7.10104 11.1198 6.91444 10.8839 6.91444C10.6481 6.91444 10.4552 7.10104 10.4552 7.3291Z"
                          fill="#721c24"
                        />
                      </svg>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={createCertificate.isPending}
            >
              {createCertificate.isPending ? "Uploading..." : "Submit"}
            </button>
            <Link to="/certificate-management/all-uploads" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewCertificatePage;
