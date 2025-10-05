import { Link } from "react-router-dom";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface HeaderButton {
  id: number;
  title: string;
  link: string;
  is_active: boolean;
}

const ListHeaderButtonPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [buttonToDelete, setButtonToDelete] = useState<number | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { useFetch, useDelete, useUpdate } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: HeaderButton[];
  }>("/header-buttons/", {
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
      }, 1000);
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

  const updateButton = useUpdate<HeaderButton>(
    "/header-buttons/",
    "/header-buttons/"
  );

  const deleteButton = useDelete("/header-buttons/", "/header-buttons/");

  const buttons = data?.results ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const isAddButtonDisabled = totalItems >= 10;

  const handlePagination = (action: string | number) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
    else if (typeof action === "number") setCurrentPage(action);
  };

  const toggleButtonStatus = (button: HeaderButton) => {
    const newStatus = !button.is_active;
    updateButton.mutate(
      {
        id: button.id,
        data: { is_active: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Button status updated successfully!");
        },
        onError: (error: any) => {
          console.error("Failed to update button status:", error);
          toast.error("Failed to update button status");
        },
      }
    );
  };

  const openDeleteModal = (buttonId: number) => {
    setButtonToDelete(buttonId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setButtonToDelete(null);
  };

  const handleDelete = () => {
    if (buttonToDelete !== null) {
      deleteButton.mutate(
        { id: buttonToDelete },
        {
          onSuccess: () => {
            toast.success("Button deleted successfully!");
            setShowDeleteModal(false);
            setButtonToDelete(null);

            const updatedTotalItems = totalItems - 1;
            const updatedTotalPages = Math.ceil(updatedTotalItems / pageSize);

            if (currentPage > updatedTotalPages && updatedTotalPages > 0) {
              setCurrentPage(updatedTotalPages);
            } else if (updatedTotalPages === 0) {
              setCurrentPage(1);
            }
          },
          onError: (error: any) => {
            console.error("Failed to delete button:", error);
            toast.error("Failed to delete button");
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
  if (error) return <div>Error loading buttons: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Link</h3>
        <div>
          <span
            data-tooltip-id="add-link-tooltip"
            data-tooltip-content={
              isAddButtonDisabled ? "Maximum limit of 10 links reached" : ""
            }
            data-tooltip-place="top"
          >
            <Link
              className={`btn ${isAddButtonDisabled ? "disabled" : ""}`}
              to={isAddButtonDisabled ? "#" : "/header-management/add-link"}
            >
              Add Link
            </Link>
          </span>
          {isAddButtonDisabled && (
            <ReactTooltip
              id="add-link-tooltip"
              clickable={true}
              style={{
                backgroundColor: "#333",
                color: "#fff",
                borderRadius: "6px",
                padding: "5px",
                zIndex: 1,
              }}
            />
          )}
        </div>
      </div>

      <div className="card_bx">
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

        <div className="tableData2">
          <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Title</th>
                <th>Link</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {buttons.length > 0 ? (
                buttons.map((button) => (
                  <tr key={button.id}>
                    <td>{button.title}</td>
                    <td>
                      <a
                        href={button.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "underline", color: "#333" }}
                      >
                        {button.link}
                      </a>
                    </td>
                    <td>
                      <div className="status-toggle textwith-toggle">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={button.is_active}
                            onChange={() => toggleButtonStatus(button)}
                            disabled={updateButton.isPending}
                          />
                          <span className="slider"></span>
                        </label>
                        <span
                          className={`status-text ${
                            button.is_active ? "enabled" : "disabled"
                          }`}
                        >
                          {button.is_active ? "Enable" : "Disable"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="custom-event">
                        <div className="icon-group">
                          <Link
                            to="/header-management/edit-link"
                            state={{ button }}
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
                            onClick={() => openDeleteModal(button.id)}
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
                  <td colSpan={4} className="no-buttons-message">
                    <p>No header buttons available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination pagination2">
          <div className="items">
            <p>Showing</p>
            <p>
              {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
              entries
            </p>
          </div>
          <div className="pagenationRight">
            <button
              className="btn"
              onClick={() => handlePagination("first")}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faAnglesLeft} /> First
            </button>
            <button
              className="btn"
              onClick={() => handlePagination("prev")}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faAngleLeft} /> Back
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
              className="btn"
              onClick={() => handlePagination("next")}
              disabled={currentPage === totalPages}
            >
              Next <FontAwesomeIcon icon={faAngleRight} />
            </button>
            <button
              className="btn"
              onClick={() => handlePagination("last")}
              disabled={currentPage === totalPages}
            >
              Last <FontAwesomeIcon icon={faAnglesRight} />
            </button>
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
          Are you sure you want to delete this header button?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteButton.isPending}
          >
            {deleteButton.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListHeaderButtonPage;
