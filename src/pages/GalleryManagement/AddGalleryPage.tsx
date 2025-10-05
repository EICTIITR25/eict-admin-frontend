import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface ValidationErrors {
  category?: string;
  images?: string;
}

interface FormData {
  category: string;
  images: File[];
}

const EditGalleryPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    category: "",
    images: [],
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const navigate = useNavigate();
  const { useCreate } = useCrud();
  const createGallery = useCreate("/gallery/upload/", "/gallery-management/");

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (formData.category.trim().length < 3) {
      newErrors.category = "Category must be at least 3 characters";
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least one image must be uploaded";
    } else {
      const invalidFiles = formData.images.filter(
        (file) => !["image/jpeg", "image/png"].includes(file.type)
      );
      if (invalidFiles.length > 0) {
        newErrors.images = "Only JPG/PNG files are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
      setImagePreviews((prev) => [...prev, ...previews]);
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("category", formData.category);
    formData.images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    createGallery.mutate(formDataToSend, {
      onSuccess: () => {
        toast.success("Gallery images uploaded successfully!");
        navigate("/gallery-management/");
      },
      onError: (error: any) => {
        console.error("Failed to upload gallery images:", error);
        toast.error("Failed to upload gallery images");
        setErrors({ images: "Failed to upload images. Please try again." });
      },
    });
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Add Gallery</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              placeholder="Enter"
              className="form-control"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              disabled={createGallery.isPending}
            />
            {errors.category && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.category}
              </p>
            )}
          </div>

          <div className="UploadLogoForm">
            <label>Upload Image</label>
            <label htmlFor="Upload" className="Upload">
              <input
                type="file"
                id="Upload"
                accept="image/png, image/jpeg"
                multiple
                onChange={handleImageUpload}
                disabled={createGallery.isPending}
              />
              <span>Choose File</span>
            </label>
            <p>
              Note: you can add single jpg/png file or jpg/png multiple files
            </p>
            {errors.images && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.images}
              </p>
            )}
            {imagePreviews.length > 0 && (
              <div className="galleryUploadList">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="cardGallery">
                    <div className="Upload-image">
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
                    <button
                      type="button"
                      className="BtnEdit"
                      onClick={() => handleRemoveImage(index)}
                      disabled={createGallery.isPending}
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
                          fill="#1C1B1F"
                        />
                      </svg>{" "}
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
              disabled={createGallery.isPending}
            >
              {createGallery.isPending ? "Uploading..." : "Submit"}
            </button>
            <Link to="/gallery-management/" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGalleryPage;
