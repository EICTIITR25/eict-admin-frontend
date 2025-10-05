import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCrud } from "../../hooks/useCrud";

interface HeaderImage {
  id: number;
  header_title: string;
  image_url: string;
  is_active: boolean;
}

const EditHeaderManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const image: HeaderImage | undefined = location.state?.image;

  const [headerTitle, setHeaderTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { useUpdate } = useCrud();
  const updateImage = useUpdate("/headers-images/");

  useEffect(() => {
    if (image) {
      setHeaderTitle(image.header_title);
    }
  }, [image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) return;

    const formData = new FormData();
    formData.append("header_title", headerTitle);
    if (selectedFile) {
      formData.append("image_file", selectedFile);
    }

    updateImage.mutate(
      { id: image.id, data: formData },
      {
        onSuccess: () => {
          toast.success("Header image updated successfully!");
          navigate("/header-management/header-images");
        },
        onError: (error: any) => {
          console.error("Failed to update image:", error);
          toast.error("Failed to update image.");
        },
      }
    );
  };

  if (!image) {
    return <div>No image data available</div>;
  }

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Edit Header</h3>
      </div>
      <div className="card_bx">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="headerTitle">Header Title</label>
            <input
              className="form-control"
              type="text"
              id="headerTitle"
              name="headerTitle"
              placeholder="Enter header title"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              required
            />
          </div>
          <div className="UploadLogoForm">
            <label>Upload Header Image</label>
            <label htmlFor="Upload" className="Upload">
              <input
                type="file"
                name="Upload"
                id="Upload"
                accept="image/jpeg,image/png,image/pdf"
                onChange={handleFileChange}
              />
              <span>Choose File</span>
            </label>
            <p>Note: you can add single pdf/jpg file</p>
            {image.image_url && (
              <div className="current-image">
                <p>Current Image:</p>
                <img
                  src={image.image_url}
                  alt="Current header"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              </div>
            )}
          </div>

          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              disabled={updateImage.isPending}
            >
              {updateImage.isPending ? "Updating..." : "Submit"}
            </button>
            <Link to="/header-management/header-images" className="btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHeaderManagementPage;
