import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface GalleryImage {
  id: number;
  image_url: string | null;
}

interface GalleryCategory {
  category: string | null;
  image_count: number;
  status: boolean;
  is_active: boolean;
  images: GalleryImage[];
}

interface FormData {
  category: string;
  newImages: File[];
}

interface ValidationErrors {
  category?: string;
  images?: string;
}

const EditGalleryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { category: initialCategory } = (location.state as {
    category: GalleryCategory;
  }) || { category: { category: "", images: [] } };

  const [formData, setFormData] = useState<FormData>({
    category: initialCategory.category || "",
    newImages: [],
  });
  const [existingImages, setExistingImages] = useState<GalleryImage[]>(
    initialCategory.images || []
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialCategory.images?.map((img) => img.image_url || "") || []
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { useCreate, useUpdate, useDelete } = useCrud();

  const renameCategory = useUpdate(
    "/gallery/category/rename/",
    "/gallery-management/"
  );
  const uploadImages = useCreate("/gallery/upload/", "/gallery-management/");
  const deleteImages = useDelete("/gallery/delete-multiple/");

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (!existingImages.some((img) => img.image_url === preview)) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews, existingImages]);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (formData.category.trim().length < 3) {
      newErrors.category = "Category must be at least 3 characters";
    }

    if (existingImages.length === 0 && formData.newImages.length === 0) {
      newErrors.images = "At least one image must be uploaded";
    } else if (formData.newImages.length > 0) {
      const invalidFiles = formData.newImages.filter(
        (file) => !["image/jpeg", "image/png"].includes(file.type)
      );
      if (invalidFiles.length > 0) {
        newErrors.images = "Only JPG/PNG files are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...filesArray],
      }));
      setImagePreviews((prev) => [
        ...prev,
        ...filesArray.map((file) => URL.createObjectURL(file)),
      ]);
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    if (index < existingImages.length) {
      const imageId = existingImages[index].id;
      deleteImages.mutate(
        { body: { ids: [imageId] } },
        {
          onSuccess: () => {
            toast.success("Image deleted successfully!");
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
            setImagePreviews((prev) => prev.filter((_, i) => i !== index));
          },
          onError: (error: any) => {
            console.error("Failed to delete image:", error);
            toast.error("Failed to delete image.");
          },
        }
      );
    } else {
      const newImageIndex = index - existingImages.length;
      setFormData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== newImageIndex),
      }));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    // Rename category if changed
    if (formData.category !== initialCategory.category) {
      renameCategory.mutate(
        {
          data: {
            old_name: initialCategory.category,
            new_name: formData.category,
          },
        },
        {
          onSuccess: () => {
            toast.success("Category renamed successfully!");
            navigate("/gallery-management/");
          },
          onError: (error: any) => {
            console.error("Failed to rename category:", error);
            toast.error("Failed to rename category.");
            setErrors({ category: "Failed to rename category." });
          },
        }
      );
    }

    // Upload new images if any
    if (formData.newImages.length > 0) {
      const formDataToSend = new FormData();
      formDataToSend.append("category", formData.category);
      formData.newImages.forEach((image) => {
        formDataToSend.append("images", image);
      });

      uploadImages.mutate(formDataToSend, {
        onSuccess: () => {
          toast.success("Images uploaded successfully!");
          navigate("/gallery-management/");
        },
        onError: (error: any) => {
          console.error("Failed to upload images:", error);
          toast.error("Failed to upload images.");
          setErrors({ images: "Failed to upload images. Please try again." });
        },
      });
    } else {
      // If no new images, navigate back if category rename was successful or no rename was needed
      if (formData.category === initialCategory.category) {
        navigate("/gallery-management/");
      }
    }
  };

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Edit Gallery</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={handleCategoryChange}
              placeholder="Enter category name"
              disabled={renameCategory.isPending || uploadImages.isPending}
              className="form-control"
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
                name="Upload"
                id="Upload"
                accept="image/png, image/jpeg"
                multiple
                onChange={handleImageUpload}
                disabled={uploadImages.isPending}
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
          </div>

          <div className="galleryUploadList">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="cardGallery">
                <div className="Upload-image">
                  <img
                    src={preview}
                    alt={`Uploaded ${index}`}
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
                  disabled={deleteImages.isPending || uploadImages.isPending}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.93168 2.39694C6.07639 2.11595 6.37385 1.93848 6.6981 1.93848H9.92458C10.2488 1.93848 10.5463 2.11595 10.691 2.39694L10.8839 2.7678H13.4566C13.9309 2.7678 14.3141 3.13919 14.3141 3.59713C14.3141 4.05507 13.9309 4.42646 13.4566 4.42646H3.16613C2.69261 4.42646 2.30859 4.05507 2.30859 3.59713C2.30859 3.13919 2.69261 2.7678 3.16613 2.7678H5.73873L5.93168 2.39694ZM3.14201 5.25578H13.4566V13.5491C13.4566 14.4639 12.6875 15.2077 11.7415 15.2077H4.85708C3.93389 15.2077 3.14201 14.4639 3.14201 13.5491V5.25578ZM5.28585 7.3291V13.1344C5.28585 13.3625 5.50291 13.5491 5.71462 13.5491C5.97456 13.5491 6.14338 13.3625 6.14338 13.1344V7.3291C6.14338 7.10104 5.97456 6.91444 5.71462 6.91444C5.50291 6.91444 5.28585 7.10104 5.28585 7.3291ZM7.85845 7.3291V13.1344C7.85845 13.3625 8.07552 13.5491 8.28722 13.5491C8.54716 13.5491 8.74011 13.3625 8.74011 13.1344V7.3291C8.74011 7.10104 8.54716 6.91444 8.28722 6.91444C8.07552 6.91444 7.85845 7.10104 7.85845 7.3291ZM10.4552 7.3291V13.1344C10.4552 13.3625 10.6481 13.5491 10.8839 13.5491C11.1198 13.5491 11.3127 13.3625 11.3127 13.1344V7.3291C11.3127 7.10104 11.1198 6.91444 10.8839 6.91444C10.6481 6.91444 10.4552 7.10104 10.4552 7.3291Z"
                      fill="#1C1B1F"
                    />
                  </svg>{" "}
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={
                renameCategory.isPending ||
                uploadImages.isPending ||
                deleteImages.isPending
              }
            >
              {renameCategory.isPending || uploadImages.isPending
                ? "Updating..."
                : "Update"}
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
