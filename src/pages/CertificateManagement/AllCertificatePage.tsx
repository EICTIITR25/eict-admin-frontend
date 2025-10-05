import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
import moment from "moment";
import Select from "react-select";

interface Certificate {
  id: number;
  category: string;
  certificate_id: string;
  file_url: string;
  uploaded_at: string;
}

const AllCertificatePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(18);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{
    value: string | null;
    label: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] =
    useState<Certificate | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    { value: null, label: "All Categories" },
    { value: "Self Paced", label: "Self Paced" },
    { value: "FDP", label: "FDP" },
    { value: "Advance PG Course", label: "Advance PG Course" },
    { value: "Short Term Training", label: "Short Term Training" },
  ];

  const { useFetch, useDelete } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Certificate[];
  }>("/certificates/list/", {
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearchTerm.length >= 3 ? debouncedSearchTerm : "",
    ...(selectedCategory?.value && { category: selectedCategory.value }),
  });

  const deleteCertificate = useDelete(
    "/certificates/delete/",
    "/certificates/list/"
  );

  const certificates = data?.results ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Custom debounce effect for search term
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 1000);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePagination = (action: string | number) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
    else if (typeof action === "number") setCurrentPage(action);
  };

  const openDeleteModal = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCertificateToDelete(null);
  };

  const handleDelete = () => {
    if (certificateToDelete !== null) {
      deleteCertificate.mutate(
        { id: certificateToDelete.id },
        {
          onSuccess: () => {
            toast.success("Certificate deleted successfully!");
            setShowDeleteModal(false);
            setCertificateToDelete(null);
          },
          onError: (error: any) => {
            toast.error("Failed to delete certificate.");
          },
        }
      );
    }
  };

  const pagesToDisplay = (() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  })();

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      width: "300px",
      backgroundColor: "#fff",
      borderColor: "#ccc",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#888",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      width: "300px",
      zIndex: 1000,
    }),
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading certificates: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>All Certificates</h3>
        <Link className="btn" to="/certificate-management/create-certificate">
          Upload Certificates
        </Link>
      </div>

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
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="FiltersDay ms-3">
          <Select
            options={categories}
            value={selectedCategory}
            onChange={(option) => {
              setSelectedCategory(option);
            }}
            placeholder="Select Category"
            styles={customStyles}
            isSearchable={false}
          />
        </div>
      </div>

      <div className="CertificateList">
        {certificates.length > 0 ? (
          certificates.map((certificate) => (
            <div key={certificate.id} className="card_bx_Certificate">
              <div className="image_bx">
                <a
                  href={certificate.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={certificate.file_url}
                    alt={certificate.certificate_id}
                  />
                </a>
              </div>
              <div className="ContentCertificate">
                <h3>{certificate.category}</h3>
                <p>{certificate.certificate_id}</p>
                <h6>
                  {moment(certificate.uploaded_at).format("DD MMMM YYYY")}
                </h6>
                <div
                  className="btn_grpCertificate"
                  style={{ textAlign: "right" }}
                >
                  <button
                    className="btn DeleteBtn"
                    onClick={() => openDeleteModal(certificate)}
                  >
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <path
                        d="M10.0957 6.10029C10.2592 5.78266 10.5955 5.58203 10.9621 5.58203H14.6094C14.9759 5.58203 15.3122 5.78266 15.4758 6.10029L15.6939 6.51953H18.602C19.1382 6.51953 19.5714 6.93936 19.5714 7.45703C19.5714 7.97471 19.1382 8.39453 18.602 8.39453H6.96939C6.4341 8.39453 6 7.97471 6 7.45703C6 6.93936 6.4341 6.51953 6.96939 6.51953H9.87755L10.0957 6.10029ZM6.94212 9.33203H18.602V18.707C18.602 19.7412 17.7326 20.582 16.6633 20.582H8.8809C7.83729 20.582 6.94212 19.7412 6.94212 18.707V9.33203ZM9.36559 11.6758V18.2383C9.36559 18.4961 9.61097 18.707 9.85029 18.707C10.1441 18.707 10.335 18.4961 10.335 18.2383V11.6758C10.335 11.418 10.1441 11.207 9.85029 11.207C9.61097 11.207 9.36559 11.418 9.36559 11.6758ZM12.2738 11.6758V18.2383C12.2738 18.4961 12.5191 18.707 12.7585 18.707C13.0523 18.707 13.2704 18.4961 13.2704 18.2383V11.6758C13.2704 11.418 13.0523 11.207 12.7585 11.207C12.5191 11.207 12.2738 11.418 12.2738 11.6758ZM15.2092 11.6758V18.2383C15.2092 18.4961 15.4273 18.707 15.6939 18.707C15.9605 18.707 16.1786 18.4961 16.1786 18.2383V11.6758C16.1786 11.418 15.9605 11.207 15.6939 11.207C15.4273 11.207 15.2092 11.418 15.2092 11.6758Z"
                        fill="#1C1B1F"
                      />
                    </svg>{" "}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
            No certificates available
          </div>
        )}
      </div>

      <div className="pagination">
        <div className="items">
          <p>
            Showing {(currentPage - 1) * pageSize + 1} -{" "}
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
                className={`btn btnno ${currentPage === page ? "active" : ""}`}
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
          Are you sure you want to delete this certificate?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteCertificate.isPending}
          >
            {deleteCertificate.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllCertificatePage;
