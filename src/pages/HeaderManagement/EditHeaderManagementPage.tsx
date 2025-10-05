import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCrud } from "../../hooks/useCrud";
import Cropper from "react-easy-crop";

interface HeaderImage {
  id: number;
  header_title: string;
  image_url: string;
  is_active: boolean;
}

const CROP_WIDTH = 665;
const CROP_HEIGHT = 680;
const ASPECT_RATIO = CROP_WIDTH / CROP_HEIGHT;

const EditHeaderManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const image: HeaderImage | undefined = location.state?.image;

  const [headerTitle, setHeaderTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const { useUpdate } = useCrud();
  const updateImage = useUpdate("/headers-images/");

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (image) {
      setHeaderTitle(image.header_title);
    }
  }, [image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please upload only jpg or png");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, crop: any): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      CROP_WIDTH,
      CROP_HEIGHT
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "cropped_image.jpg", {
            type: "image/jpeg",
          });
          setCroppedImage(URL.createObjectURL(blob));
          setSelectedFile(file);
          resolve(file);
        }
      }, "image/jpeg");
    });
  };

  const handleCropConfirm = async () => {
    if (imageSrc && croppedAreaPixels) {
      await getCroppedImg(imageSrc, croppedAreaPixels);
      setShowCropper(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
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
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
            <p>Note: Upload a single jpg/png file</p>

            {image.image_url && !croppedImage && (
              <div className="current-image">
                <p>Current Image:</p>
                <img
                  src={image.image_url}
                  alt="Current header"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              </div>
            )}

            {croppedImage && (
              <div style={{ marginTop: "10px" }}>
                <p>New Image Preview:</p>
                <img
                  src={croppedImage}
                  alt="Cropped header"
                  style={{ maxWidth: "200px", border: "1px solid #ddd" }}
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

      {showCropper && imageSrc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "600px",
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                position: "relative",
                height: "400px",
                background: "#333",
              }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIO}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                padding: "15px",
                borderTop: "1px solid #eee",
              }}
            >
              <button
                className="btn"
                type="button"
                onClick={handleCropConfirm}
                style={{
                  background: "#28a745",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Crop & Save
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => setShowCropper(false)}
                style={{
                  background: "#dc3545",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHeaderManagementPage;
