import { Link } from "react-router-dom";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Modal, Button } from "react-bootstrap";
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

const AllGalleryPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<GalleryCategory | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { useFetch, useDelete, useUpdate } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: GalleryCategory[];
  }>("/gallery/categories/", {
    page: currentPage,
    page_size: pageSize,
    ...(debouncedSearchTerm.length >= 3 && { search: debouncedSearchTerm }),
  });

  // Custom debounce effect for search term
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      debounceTimeout.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to first page on search
      }, 500);
    } else {
      setDebouncedSearchTerm("");
      setCurrentPage(1); // Reset to first page when search is cleared
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  const updateCategory = useUpdate<GalleryCategory>(
    "/gallery/category/status/",
    "/gallery/categories/"
  );

  const deleteCategory = useDelete(
    "/gallery/delete-multiple/",
    "/gallery/categories/"
  );

  const categories = data?.results ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePagination = (action: string | number) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
    else if (typeof action === "number") setCurrentPage(action);
  };

  const handleToggleStatus = (category: GalleryCategory) => {
    const newStatus = !category.status;
    updateCategory.mutate(
      {
        data: { category: category.category, is_active: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Category status updated successfully!");
        },
        onError: (error: any) => {
          console.error("Failed to update category status:", error);
          toast.error("Failed to update category status.");
        },
      }
    );
  };

  const openDeleteModal = (category: GalleryCategory) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleDelete = () => {
    if (categoryToDelete !== null) {
      const imageIds = categoryToDelete.images.map((image) => image.id);
      deleteCategory.mutate(
        { body: { ids: imageIds } },
        {
          onSuccess: () => {
            toast.success("Category deleted successfully!");
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            const updatedTotalItems = totalItems - 1;
            const updatedTotalPages = Math.ceil(updatedTotalItems / pageSize);

            if (currentPage > updatedTotalPages && updatedTotalPages > 0) {
              setCurrentPage(updatedTotalPages);
            } else if (updatedTotalPages === 0) {
              setCurrentPage(1);
            }
          },
          onError: (error: any) => {
            console.error("Failed to delete category:", error);
            toast.error("Failed to delete category.");
          },
        }
      );
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  let pagesToDisplay: (number | string)[] = [];
  if (totalPages <= 5) {
    pagesToDisplay = pageNumbers;
  } else if (currentPage <= 3) {
    pagesToDisplay = [1, 2, 3, 4, 5, "..."];
  } else if (currentPage >= totalPages - 2) {
    pagesToDisplay = [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  } else {
    pagesToDisplay = [
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Gallery</h3>
        <Link className="btn" to="/gallery-management/add-gallery">
          Add Category
        </Link>
      </div>

      <div className="card_bx">
        {/* Filter + Search */}
        <div className="filterWrapp">
          <div className="items">
            <p>Show</p>
            <select
              className="formcontrol"
              value={pageSize}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
            <p>entries</p>
          </div>

          <div className="filter_bx">
            <p>Search:</p>
            <div className="grp_search">
              <input
                type="text"
                placeholder="Enter at least 3 characters..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="tableData2">
          <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Category</th>
                <th>No. of Images</th>
                <th>Status</th>
                <th style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr
                    key={
                      category.category ||
                      `uncategorized-${category.image_count}`
                    }
                  >
                    <td>
                      <Link
                        to="/gallery-management/gallery-details"
                        state={{ category }}
                      >
                        {category.category || "Uncategorized"}
                      </Link>
                    </td>
                    <td>{category.image_count}</td>
                    <td>
                      <div className="status-toggle textwith-toggle">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={category.status}
                            onChange={() => handleToggleStatus(category)}
                            disabled={updateCategory.isPending}
                          />
                          <span className="slider"></span>
                        </label>
                        <span
                          className={`status-text ${
                            category.status ? "enabled" : "disabled"
                          }`}
                        >
                          {category.status ? "Enable" : "Disable"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="custom-event">
                        <div className="icon-group">
                          <Link
                            to="/gallery-management/edit-gallery"
                            state={{ category }}
                            className="btnView"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                            >
                              <path
                                d="M10.626 0.566851C11.3584 -0.165513 12.5478 -0.165513 13.2803 0.566851L14.4346 1.72203C15.167 2.45416 15.167 3.64244 14.4346 4.37486L13.0166 5.79283L9.208 1.98482L10.626 0.566851ZM12.3545 6.45494L5.52245 13.284C5.21777 13.5887 4.83984 13.8143 4.42675 13.9344L0.901458 14.9715C0.654779 15.0448 0.387884 14.9774 0.20595 14.7694C0.024011 14.6141 -0.0440105 14.3475 0.0285871 14.0985L1.06552 10.5741C1.1874 10.161 1.41093 9.78306 1.71591 9.47837L8.54589 2.64751L12.3545 6.45494Z"
                                fill="white"
                              />
                            </svg>
                          </Link>
                          <button
                            className="btn-delete"
                            onClick={() => openDeleteModal(category)}
                          >
                            <svg
                              width="14"
                              height="15"
                              viewBox="0 0 14 15"
                              fill="none"
                            >
                              <path
                                d="M3.96094 0.518262C4.11914 0.200625 4.44434 0 4.79883 0H8.32617C8.68066 0 9.00586 0.200625 9.16406 0.518262L9.375 0.9375H12.1875C12.7061 0.9375 13.125 1.35732 13.125 1.875C13.125 2.39268 12.7061 2.8125 12.1875 2.8125H0.9375C0.419824 2.8125 0 2.39268 0 1.875C0 1.35732 0.419824 0.9375 0.9375 0.9375H3.75L3.96094 0.518262ZM0.911133 3.75H12.1875V13.125C12.1875 14.1592 11.3467 15 10.3125 15H2.78613C1.77686 15 0.911133 14.1592 0.911133 13.125V3.75Z"
                                fill="white"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="no-categories-message">
                    <p>No gallery categories available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="Faculty_table test_wrapp">
          <div className="pagination">
            <div className="items">
              <p>Showing </p>
              <p>
                {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
                entries
              </p>
            </div>
            <div className="pagenationRight">
              <button
                className="btn btnno"
                onClick={() => handlePagination("prev")}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>
              {pagesToDisplay.map((page, index) =>
                page === "..." ? (
                  <span key={index} className="dots">
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    className={`btn btnno ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePagination(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="btn btnno"
                onClick={() => handlePagination("next")}
                disabled={currentPage === totalPages}
              >
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
            </div>
          </div>
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
          Are you sure you want to delete this gallery category?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
          >
            {deleteCategory.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllGalleryPage;
