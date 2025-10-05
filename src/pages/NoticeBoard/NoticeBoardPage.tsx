import { Link } from "react-router-dom";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import moment from "moment";
import assets from "../../assets";
import { useCrud } from "../../hooks/useCrud";

interface Notice {
  id: number;
  title: string;
  description: string;
  posted_date: string;
  is_active: boolean;
}

const NoticeBoardPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showMainEditModal, setShowMainEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<Partial<Notice>>({
    title: "",
    description: "",
    posted_date: moment().format("YYYY-MM-DD"),
  });

  const [errors, setErrors] = useState<{
    title: string;
    posted_date: string;
    description: string;
  }>({
    title: "",
    posted_date: "",
    description: "",
  });

  const { useFetch, useCreate, useUpdate, useDelete } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Notice[];
  }>("/notice-board/", {
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

  const createNotice = useCreate("/notice-board/", "/notice-board/");
  const updateNotice = useUpdate("/notice-board/", "/notice-board/");
  const deleteNotice = useDelete("/notice-board/", "/notice-board/");

  const notices = data?.results ?? [];
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

  const toggleReadMore = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name !== "posted_date") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Partial<{
      title: string;
      posted_date: string;
      description: string;
    }> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.posted_date) newErrors.posted_date = "Date is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(
        validationErrors as {
          title: string;
          posted_date: string;
          description: string;
        }
      );
    } else {
      createNotice.mutate(formData, {
        onSuccess: () => {
          toast.success("Notice added successfully!");
          setShowMainModal(false);
          setShowUploadModal(true);
          setFormData({
            title: "",
            description: "",
            posted_date: moment().format("YYYY-MM-DD"),
          });
        },
        onError: (error: any) => {
          toast.error("Failed to add notice: " + error.message);
        },
      });
    }
  };

  const handleSubmitEdit = () => {
    if (!selectedNotice) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(
        validationErrors as {
          title: string;
          posted_date: string;
          description: string;
        }
      );
    } else {
      updateNotice.mutate(
        {
          id: selectedNotice.id,
          data: formData,
        },
        {
          onSuccess: () => {
            toast.success("Notice updated successfully!");
            setShowMainEditModal(false);
            setShowUpdateModal(true);
            setFormData({
              title: "",
              description: "",
              posted_date: moment().format("YYYY-MM-DD"),
            });
            setSelectedNotice(null);
          },
          onError: (error: any) => {
            toast.error("Failed to update notice: " + error.message);
          },
        }
      );
    }
  };

  const openEditModal = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      posted_date: notice.posted_date.split("T")[0],
    });
    setShowMainEditModal(true);
  };

  const openDeleteModal = (noticeId: number) => {
    setNoticeToDelete(noticeId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setNoticeToDelete(null);
  };

  const handleDelete = () => {
    if (noticeToDelete !== null) {
      deleteNotice.mutate(
        { id: noticeToDelete },
        {
          onSuccess: () => {
            toast.success("Notice deleted successfully!");
            setShowDeleteModal(false);
            setNoticeToDelete(null);

            const updatedTotalItems = totalItems - 1;
            const updatedTotalPages = Math.ceil(updatedTotalItems / pageSize);

            if (currentPage > updatedTotalPages && updatedTotalPages > 0) {
              setCurrentPage(updatedTotalPages);
            } else if (updatedTotalPages === 0) {
              setCurrentPage(1);
            }
          },
          onError: (error: any) => {
            toast.error("Failed to delete notice: " + error.message);
          },
        }
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading notices: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Notice Board</h3>
        <button className="btn" onClick={() => setShowMainModal(true)}>
          Add Notice Board
        </button>
      </div>

      <div className="filter_bx">
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

      <div className="tableData tableData_table">
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: "20px" }}>S.NO</th>
              <th>Title</th>
              <th style={{ width: "40%" }}>Description</th>
              <th style={{ width: "15%" }}>Posted Date</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.length > 0 ? (
              notices.map((notice, index) => (
                <tr key={notice.id}>
                  <td style={{ paddingLeft: "20px" }}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td>{notice.title}</td>
                  <td>
                    {expandedRows.includes(notice.id)
                      ? notice.description
                      : `${notice.description.slice(0, 50)}`}
                    <button
                      onClick={() => toggleReadMore(notice.id)}
                      className="readmore"
                    >
                      {expandedRows.includes(notice.id)
                        ? "Read Less"
                        : "Read More"}
                    </button>
                  </td>
                  <td>
                    <div className="text-green">
                      {moment(notice.posted_date).format("DD MMMM YYYY")}
                    </div>
                  </td>
                  <td>
                    <div className="custom-event">
                      <div className="icon-group">
                        <button
                          onClick={() => openEditModal(notice)}
                          className="btnView"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.626 0.566851C11.3584 -0.165513 12.5478 -0.165513 13.2803 0.566851L14.4346 1.72203C15.167 2.45416 15.167 3.64244 14.4346 4.37486L13.0166 5.79283L9.208 1.98482L10.626 0.566851ZM12.3545 6.45494L5.52245 13.284C5.21777 13.5887 4.83984 13.8143 4.42675 13.9344L0.901458 14.9715C0.654779 15.0448 0.387884 14.9774 0.20595 14.7694C0.024011 14.6141 -0.0440105 14.3475 0.0285871 14.0985L1.06552 10.5741C1.1874 10.161 1.41093 9.78306 1.71591 9.47837L8.54589 2.64751L12.3545 6.45494Z"
                              fill="white"
                            />
                          </svg>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => openDeleteModal(notice.id)}
                        >
                          <svg
                            width="14"
                            height="15"
                            viewBox="0 0 14 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.96094 0.518262C4.11914 0.200625 4.44434 0 4.79883 0H8.32617C8.68066 0 9.00586 0.200625 9.16406 0.518262L9.375 0.9375H12.1875C12.7061 0.9375 13.125 1.35732 13.125 1.875C13.125 2.39268 12.7061 2.8125 12.1875 2.8125H0.9375C0.419824 2.8125 0 2.39268 0 1.875C0 1.35732 0.419824 0.9375 0.9375 0.9375H3.75L3.96094 0.518262ZM0.911133 3.75H12.1875V13.125C12.1875 14.1592 11.3467 15 10.3125 15H2.78613C1.77686 15 0.911133 14.1592 0.911133 13.125V3.75ZM3.25488 6.09375V12.6562C3.25488 12.9141 3.49219 13.125 3.72363 13.125C4.00781 13.125 4.19238 12.9141 4.19238 12.6562V6.09375C4.19238 5.83594 4.00781 5.625 3.72363 5.625C3.49219 5.625 3.25488 5.83594 3.25488 6.09375ZM6.7168 6.09375V12.6562C6.7168 12.9141 6.9541 13.125 7.18555 13.125C7.46973 13.125 7.6543 12.9141 7.6543 12.6562V6.09375C7.6543 5.83594 7.46973 5.625 7.18555 5.625C6.9541 5.625 6.7168 5.83594 6.7168 6.09375ZM10.1787 6.09375V12.6562C10.1787 12.9141 10.416 13.125 10.6475 13.125C10.9317 13.125 11.1162 12.9141 11.1162 12.6562V6.09375C11.1162 5.83594 10.9317 5.625 10.6475 5.625C10.416 5.625 10.1787 5.83594 10.1787 6.09375Z"
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
              <div
                style={{ textAlign: "center", padding: "20px", color: "#888" }}
              >
                No notices found
              </div>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="items">
          <p>Items per page</p>
          <select
            className="formcontrol"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
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

      {/* Add Notice Modal */}
      <Modal
        show={showMainModal}
        centered
        onHide={() => {
          setShowMainModal(false);
          setFormData({
            title: "",
            description: "",
            posted_date: moment().format("YYYY-MM-DD"),
          });
          setErrors({ title: "", posted_date: "", description: "" });
        }}
        dialogClassName="modalfullCustom modalSM modalMd"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Add Notice Board</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Enter"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && (
                    <div className="error-text">{errors.title}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Date</label>
                  <input
                    type="date"
                    name="posted_date"
                    className="form-control"
                    value={formData.posted_date}
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                  {errors.posted_date && (
                    <div className="error-text">{errors.posted_date}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Description</label>
                  <textarea
                    name="description"
                    style={{ height: "110px" }}
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description && (
                    <div className="error-text">{errors.description}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp">
                  <button
                    className="btn"
                    onClick={() => {
                      setShowMainModal(false);
                      setFormData({
                        title: "",
                        description: "",
                        posted_date: moment().format("YYYY-MM-DD"),
                      });
                      setErrors({
                        title: "",
                        posted_date: "",
                        description: "",
                      });
                    }}
                  >
                    Close
                  </button>
                  <button
                    className="btn"
                    onClick={handleSubmit}
                    disabled={createNotice.isPending}
                  >
                    {createNotice.isPending ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Notice Modal */}
      <Modal
        show={showMainEditModal}
        centered
        onHide={() => {
          setShowMainEditModal(false);
          setFormData({
            title: "",
            description: "",
            posted_date: moment().format("YYYY-MM-DD"),
          });
          setErrors({ title: "", posted_date: "", description: "" });
          setSelectedNotice(null);
        }}
        dialogClassName="modalfullCustom modalSM modalMd"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Edit Notice Board</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Enter"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && (
                    <div className="error-text">{errors.title}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Date</label>
                  <input
                    type="date"
                    name="posted_date"
                    className="form-control"
                    value={moment(formData.posted_date).format("YYYY-MM-DD")}
                    readOnly
                  />
                  {errors.posted_date && (
                    <div className="error-text">{errors.posted_date}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Description</label>
                  <textarea
                    name="description"
                    style={{ height: "110px" }}
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description && (
                    <div className="error-text">{errors.description}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp">
                  <button
                    className="btn"
                    onClick={() => {
                      setShowMainEditModal(false);
                      setFormData({
                        title: "",
                        description: "",
                        posted_date: moment().format("YYYY-MM-DD"),
                      });
                      setErrors({
                        title: "",
                        posted_date: "",
                        description: "",
                      });
                      setSelectedNotice(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    className="btn"
                    onClick={handleSubmitEdit}
                    disabled={updateNotice.isPending}
                  >
                    {updateNotice.isPending ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        dialogClassName="modalfullCustom modalSM"
        show={showDeleteModal}
        onHide={closeDeleteModal}
      >
        <Modal.Body>
          <div className="modal_delete">
            <h3>Do you want to delete this Notice?</h3>
            <div className="btn_grp">
              <Button
                className="btn"
                onClick={handleDelete}
                disabled={deleteNotice.isPending}
              >
                {deleteNotice.isPending ? "Deleting..." : "Confirm"}
              </Button>
              <Button className="btn" onClick={closeDeleteModal}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default NoticeBoardPage;
