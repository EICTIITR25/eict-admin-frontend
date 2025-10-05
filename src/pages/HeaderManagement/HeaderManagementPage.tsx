import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface HeaderImage {
  id: number;
  header_title: string;
  image_url: string;
  is_active: boolean;
}

const HeaderManagementPage: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const { useFetch, useDelete } = useCrud();
  const { data, isLoading, error } =
    useFetch<HeaderImage[]>("/headers-images/");
  const deleteImage = useDelete("/headers-images/", "/headers-images/");

  const images = data ?? [];

  const openDeleteModal = (imageId: number) => {
    setImageToDelete(imageId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const handleDelete = () => {
    if (imageToDelete !== null) {
      deleteImage.mutate(
        { id: imageToDelete },
        {
          onSuccess: () => {
            toast.success("Image deleted successfully!");
            setShowDeleteModal(false);
            setImageToDelete(null);
          },
          onError: (error: any) => {
            console.error("Failed to delete image:", error);
            toast.error("Failed to delete image.");
          },
        }
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading images: {error.message}</div>;

  return (
    <>
      <div className="admin_panel">
        <div className="Breadcrumbs">
          <h3>Header Management</h3>
          <Link to="/header-management/add-image" className="btn">
            Add Image
          </Link>
        </div>

        <div className="HeaderList">
          {images.length > 0 ? (
            images.map((image) => (
              <div key={image.id} className="Headercard_bx">
                <div className="image_bx">
                  <img
                    src={image.image_url}
                    alt={image.header_title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div className="ContentHeader">
                  <h3>{image.header_title}</h3>
                  <div className="btn_grpHeader">
                    <Link
                      to="/header-management/edit-image"
                      state={{ image }}
                      className="btn btnEdit"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2.16667 13.8327H3.33333L11.7083 5.47852L11.125 4.87435L10.5208 4.29102L2.16667 12.666V13.8327ZM0.5 15.4993V11.9577L11.7083 0.770182C12.0278 0.450738 12.4203 0.291016 12.8858 0.291016C13.3508 0.291016 13.7431 0.450738 14.0625 0.770182L15.2292 1.95768C15.5486 2.27713 15.7083 2.66602 15.7083 3.12435C15.7083 3.58268 15.5486 3.97157 15.2292 4.29102L4.04167 15.4993H0.5Z"
                          fill="#1C1B1F"
                        />
                      </svg>
                    </Link>
                    <button
                      className="btn DeleteBtn"
                      onClick={() => openDeleteModal(image.id)}
                    >
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 26 26"
                        fill="none"
                      >
                        <path
                          d="M10.0957 6.10029C10.2592 5.78266 10.5955 5.58203 10.9621 5.58203H14.6094C14.9759 5.58203 15.3122 5.78266 15.4758 6.10029L15.6939 6.51953H18.602C19.1382 6.51953 19.5714 6.93936 19.5714 7.45703C19.5714 7.97471 19.1382 8.39453 18.602 8.39453H6.96939C6.4341 8.39453 6 7.97471 6 7.45703C6 6.93936 6.4341 6.51953 6.96939 6.51953H9.87755L10.0957 6.10029ZM6.94212 9.33203H18.602V18.707C18.602 19.7412 17.7326 20.582 16.6633 20.582H8.8809C7.83729 20.582 6.94212 19.7412 6.94212 18.707V9.33203ZM9.36559 11.6758V18.2383C9.36559 18.4961 9.61097 18.707 9.85029 18.707C10.1441 18.707 10.335 18.4961 10.335 18.2383V11.6758C10.335 11.418 10.1441 11.207 9.85029 11.207C9.61097 11.207 9.36559 11.418 9.36559 11.6758ZM12.2738 11.6758V18.2383C12.2738 18.4961 12.5191 18.707 12.7585 18.707C13.0523 18.707 13.2704 18.4961 13.2704 18.2383V11.6758C13.2704 11.418 13.0523 11.207 12.7585 11.207C12.5191 11.207 12.2738 11.418 12.2738 11.6758ZM15.2092 11.6758V18.2383C15.2092 18.4961 15.4273 18.707 15.6939 18.707C15.9605 18.707 16.1786 18.4961 16.1786 18.2383V11.6758C16.1786 11.418 15.9605 11.207 15.6939 11.207C15.4273 11.207 15.2092 11.418 15.2092 11.6758Z"
                          fill="#1C1B1F"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-images-message">
              <p>No header images available</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
        aria-labelledby="deleteModalLabel"
      >
        <Modal.Header closeButton>
          <Modal.Title id="deleteModalLabel">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this header image?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteImage.isPending}
          >
            {deleteImage.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HeaderManagementPage;
