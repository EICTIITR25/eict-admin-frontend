import { Link } from "react-router-dom";
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import assets from "../../assets";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";
import { toast } from "react-toastify";

interface Faculty {
  id: number;
  first_name: string;
  last_name: string;
  picture_url: string | null;
  department: string;
  professor_page: string;
  status: boolean;
  description: string;
  is_active: boolean;
  created_at: string;
}

const AllFacultyPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<number | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { useFetch, useDelete, useUpdate } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Faculty[];
  }>("/faculties/list/", {
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearchTerm.length >= 3 ? debouncedSearchTerm : "",
  });

  // Custom debounce effect
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  const updateFaculty = useUpdate<Faculty>(
    "/faculties/manage/",
    "/faculties/list/"
  );

  const faculties = data?.results ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const deleteFaculty = useDelete("/faculties/manage/", "/faculties/list/");

  const handlePagination = (action: string | number) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
    else if (typeof action === "number") setCurrentPage(action);
  };

  const handleToggleActive = (faculty: Faculty) => {
    const newStatus = !faculty.status;
    updateFaculty.mutate(
      {
        id: faculty.id,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Faculty status updated successfully!");
        },
        onError: (error: any) => {
          console.error("Failed to update faculty status:", error);
          toast.error("Failed to update faculty status.");
        },
      }
    );
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

  const openDeleteModal = (facultyId: number) => {
    setFacultyToDelete(facultyId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFacultyToDelete(null);
  };

  const handleDelete = () => {
    if (facultyToDelete !== null) {
      deleteFaculty.mutate(
        { id: facultyToDelete },
        {
          onSuccess: () => {
            toast.success("Faculty deleted successfully!");
            setShowDeleteModal(false);
            setFacultyToDelete(null);

            const updatedTotalItems = totalItems - 1;
            const updatedTotalPages = Math.ceil(updatedTotalItems / pageSize);

            if (currentPage > updatedTotalPages && updatedTotalPages > 0) {
              setCurrentPage(updatedTotalPages);
            } else if (updatedTotalPages === 0) {
              setCurrentPage(1);
            }
          },
        }
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading faculties: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>All Faculty</h3>
      </div>

      <div className="Faculty_table">
        <div className="Facultyfilter_bx">
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
            <p> entries</p>
          </div>
          <div className="FacultyRigt">
            <div className="filter_bx">
              <p>Search:</p>
              <div className="grp_search">
                <input
                  type="text"
                  placeholder="Enter at least 3 characters..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <Link to="/faculty-management/add-faculty" className="btn">
              Add Faculty
            </Link>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Inactive/Active</th>
              <th>Joining Date</th>
              <th style={{ width: "6%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculties.length > 0 ? (
              faculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td>
                    <div className="avtar">
                      <div className="icon" style={{ width: 32, height: 32 }}>
                        <img
                          className="logo"
                          src={faculty.picture_url || assets.images.Avatar}
                          alt={`${faculty.first_name} ${faculty.last_name}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                      <div className="content">
                        <h3>{`${faculty.first_name} ${faculty.last_name}`}</h3>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="Courses_checkbx">
                      <label htmlFor={`faculty-${faculty.id}`}>
                        <input
                          type="checkbox"
                          name="Courses"
                          id={`faculty-${faculty.id}`}
                          checked={faculty.status}
                          onChange={() => handleToggleActive(faculty)}
                          disabled={updateFaculty.isPending}
                        />
                        <span>{faculty.status ? "Active" : "Inactive"}</span>
                      </label>
                    </div>
                  </td>
                  <td>{moment(faculty.created_at).format("DD MMMM YYYY")}</td>
                  <td>
                    <div className="custom-event">
                      <div className="icon-group">
                        <Link
                          to={`/faculty-management/edit-faculty`}
                          state={{ faculty }}
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
                        </Link>
                        <button
                          className="btn-delete"
                          onClick={() => openDeleteModal(faculty.id)}
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
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
          Are you sure you want to delete this faculty member?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteFaculty.isPending}
          >
            {deleteFaculty.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllFacultyPage;
