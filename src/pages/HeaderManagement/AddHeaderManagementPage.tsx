import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";
import Cropper from "react-easy-crop";

interface HeaderForm {
  name: string;
  image: File | null;
}

interface HeaderErrors {
  name?: string;
  image?: string;
  general?: string;
}

const CROP_WIDTH = 665;
const CROP_HEIGHT = 680;
const ASPECT_RATIO = CROP_WIDTH / CROP_HEIGHT;

const AddHeaderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { useCreate } = useCrud();
  const createHeader = useCreate("/headers-images/");

  const [formData, setFormData] = useState<HeaderForm>({
    name: "",
    image: null,
  });
  const [errors, setErrors] = useState<HeaderErrors>({});

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

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

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
          setFormData((prev) => ({ ...prev, image: file }));
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

  useEffect(() => {
    return () => {
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
    };
  }, [croppedImage]);

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
            <input
              type="file"
              name="image"
              id="image"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />

            {errors.image && (
              <small className="text-danger">{errors.image}</small>
            )}

            {croppedImage && (
              <div
                className="image-preview"
                style={{ marginTop: "10px", textAlign: "center" }}
              >
                <img
                  src={croppedImage}
                  alt="Header Image Preview"
                  style={{ maxWidth: "200px", border: "1px solid #ddd" }}
                />
              </div>
            )}
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

export default AddHeaderManagementPage;
