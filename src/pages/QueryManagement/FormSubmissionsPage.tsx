import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { Modal } from "react-bootstrap";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";
import { toast } from "react-toastify";
import axios from "axios";

interface FormSubmission {
  id: number;
  form_type: string;
  name: string;
  email: string;
  phone?: string;
  mobile_number?: string;
  message: string;
  submitted_at: string;
  college_name: string;
  proposed_date: string;
}

const FormSubmissionsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [showMainModal, setShowMainModal] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const products = [
    { label: "All Forms", value: null },
    { label: "Contact Us", value: "ContactUs" },
    { label: "FDP Contact Request", value: "FDPContactRequest" },
  ];

  const getFormTypeLabel = (formType: string) => {
    const product = products.find((p) => p.value === formType);
    return product ? product.label : formType;
  };

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

  // Reset page when other filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProduct, startDate, endDate]);

  const queryParams: Record<string, any> = {
    page: currentPage,
    page_size: pageSize,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
    ...(debouncedSearchTerm.length >= 3 && { search: debouncedSearchTerm }),
    ...(selectedProduct !== null && { form_type: selectedProduct }),
  };

  const { useFetch } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: FormSubmission[];
  }>("/queries/forms/submissions/", queryParams);

  const submissions = data?.results ?? [];
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

  const handleRowClick = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setShowMainModal(true);
  };

  const handleExportCSV = async () => {
    try {
      const exportParams = {
        ...queryParams,
        export: "csv",
      };

      const token = localStorage.getItem("access");

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/queries/forms/submissions/`,
        {
          params: exportParams,
          responseType: "blob",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `form_submissions_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export CSV. Please try again.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading submissions: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Form Submissions</h3>
      </div>
      <div className="Breadcrumbs filter_query">
        <div className="lft_bx">
          <div className="date_grp">
            <input
              type="date"
              className="form-control"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setStartDate(e.target.value)
              }
            />
          </div>
          <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_436_6199"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="25"
            >
              <rect y="0.5" width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_436_6199)">
              <path
                d="M14 18.5L12.6 17.05L16.15 13.5H4V11.5H16.15L12.6 7.95L14 6.5L20 12.5L14 18.5Z"
                fill="#1C1B1F"
              />
            </g>
          </svg>
          <div className="date_grp">
            <input
              className="form-control"
              type="date"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEndDate(e.target.value)
              }
            />
          </div>
          <div className="search_grp ms-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter at least 3 characters..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>
          <div className="FiltersDay">
            <div className="FiltersButton">
              <div className="LastWrappFilter" style={{ width: "300px" }}>
                <button
                  className="LastdayTime"
                  onClick={() => setShowProductDropdown((prev) => !prev)}
                >
                  <span className="text">
                    {products.find((p) => p.value === selectedProduct)?.label ||
                      "All Forms"}
                  </span>
                  <span className="icon">
                    <svg
                      width="19"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <mask
                        id="mask0_4120_707"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="19"
                        height="18"
                      >
                        <rect
                          x="0.0195312"
                          width="18"
                          height="18"
                          fill="#D9D9D9"
                        />
                      </mask>
                      <g mask="url(#mask0_4120_707)">
                        <path
                          d="M7.06953 13.5L6.01953 12.45L9.46953 9L6.01953 5.55L7.06953 4.5L11.5695 9L7.06953 13.5Z"
                          fill="#1C1B1F"
                        />
                      </g>
                    </svg>
                  </span>
                </button>
                {showProductDropdown && (
                  <ul className="FiltersdropDownDay chooseDown">
                    {products.map((product) => (
                      <li key={product.value || "all-forms"}>
                        <label>
                          <input
                            type="radio"
                            name="productFilter"
                            checked={selectedProduct === product.value}
                            onChange={() => {
                              setSelectedProduct(product.value);
                              setShowProductDropdown(false);
                            }}
                          />
                          <span>{product.label}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="filterWrapp">
        <div className="items">
          <p>Show</p>
          <select
            className="form-control"
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
          <p>entries</p>
        </div>
        <button className="btnDownload" onClick={handleExportCSV}>
          <span>
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_436_9099"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="17"
                height="17"
              >
                <rect width="17" height="17" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_436_9099)">
                <path
                  d="M4.60286 14.1668C3.52856 14.1668 2.6108 13.7949 1.84957 13.0512C1.08788 12.3074 0.707031 11.3984 0.707031 10.3241C0.707031 9.40326 0.984462 8.58277 1.53932 7.86263C2.09418 7.14249 2.82023 6.68207 3.71745 6.48138C3.91814 5.63138 4.41988 4.8227 5.22266 4.05534C6.02543 3.28798 6.88134 2.9043 7.79036 2.9043C8.17995 2.9043 8.51357 3.04289 8.79124 3.32009C9.06843 3.59776 9.20703 3.93138 9.20703 4.32096V8.60638L10.3404 7.50846L11.332 8.50013L8.4987 11.3335L5.66536 8.50013L6.65703 7.50846L7.79036 8.60638V4.32096C6.89314 4.48624 6.19661 4.91998 5.70078 5.62217C5.20495 6.32484 4.95703 7.04805 4.95703 7.7918H4.60286C3.91814 7.7918 3.33377 8.03381 2.84974 8.51784C2.36571 9.00187 2.1237 9.58624 2.1237 10.271C2.1237 10.9557 2.36571 11.5401 2.84974 12.0241C3.33377 12.5081 3.91814 12.7501 4.60286 12.7501H13.1029C13.5987 12.7501 14.0178 12.5789 14.3602 12.2366C14.7025 11.8942 14.8737 11.4751 14.8737 10.9793C14.8737 10.4835 14.7025 10.0644 14.3602 9.722C14.0178 9.37964 13.5987 9.20846 13.1029 9.20846H12.0404V7.7918C12.0404 7.22513 11.9105 6.69671 11.6508 6.20655C11.3911 5.71685 11.0487 5.30082 10.6237 4.95846V3.31159C11.4973 3.72478 12.1879 4.33584 12.6956 5.14476C13.2032 5.9532 13.457 6.83555 13.457 7.7918C14.2716 7.88624 14.9476 8.23734 15.485 8.84509C16.0219 9.45331 16.2904 10.1647 16.2904 10.9793C16.2904 11.8647 15.9806 12.6174 15.361 13.2375C14.741 13.857 13.9883 14.1668 13.1029 14.1668H4.60286Z"
                  fill="#1E3A8A"
                />
              </g>
            </svg>
          </span>{" "}
          Download
        </button>
      </div>
      <div className="Query_table">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Contact No.</th>
              <th>Email</th>
              <th>Form Type</th>
              <th>Message</th>
              <th style={{ width: "13%" }}>Submission Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr
                key={submission.id}
                onClick={() => handleRowClick(submission)}
                style={{ cursor: "pointer" }}
              >
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td className="text-truncate" style={{ maxWidth: "150px" }}>
                  {submission.name}
                </td>
                <td>{submission.phone || submission.mobile_number || "N/A"}</td>
                <td className="text-truncate" style={{ maxWidth: "200px" }}>
                  {submission.email}
                </td>
                <td>
                  <span className="badge bg-primary rounded-pill">
                    {getFormTypeLabel(submission.form_type)}
                  </span>
                </td>
                <td className="text-truncate" style={{ maxWidth: "180px" }}>
                  {submission.message}
                </td>
                <td className="text-center">
                  {moment(submission.submitted_at).format("DD-MM-YYYY")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
                className={`btn btnno ${currentPage === page ? "active" : ""}`}
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
      <Modal
        show={showMainModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
        onHide={() => setShowMainModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedSubmission?.name || "Form Submission Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "16px 16px 20px" }}>
          <div className="row">
            <div className="col-lg-6 col-md-12">
              <div className="form-group mb-3">
                <label>Name</label>
                <p className="form-control-plaintext">
                  {selectedSubmission?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="form-group mb-3">
                <label>Contact No.</label>
                <p className="form-control-plaintext">
                  {selectedSubmission?.phone ||
                    selectedSubmission?.mobile_number ||
                    "N/A"}
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="form-group mb-3">
                <label>Email</label>
                <p className="form-control-plaintext">
                  {selectedSubmission?.email || "N/A"}
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="form-group mb-3">
                <label>Form Type</label>
                <p className="form-control-plaintext">
                  {selectedSubmission
                    ? getFormTypeLabel(selectedSubmission.form_type)
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="form-group mb-3">
                <label className="form-label">Submitted Date & Time</label>
                <p className="form-control-plaintext">
                  {selectedSubmission
                    ? moment(selectedSubmission.submitted_at).format(
                        "DD-MM-YYYY hh:mm A"
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="form-group mb-3">
                <label>Message</label>
                <div
                  className="border rounded p-3"
                  style={{ minHeight: "100px", backgroundColor: "#f8f9fa" }}
                >
                  {selectedSubmission?.message || "No message provided"}
                </div>
              </div>
            </div>
            {selectedSubmission?.form_type === "FDPContactRequest" && (
              <>
                <div className="col-lg-6 col-md-12">
                  <div className="form-group mb-3">
                    <label>College Name</label>
                    <p className="form-control-plaintext">
                      {selectedSubmission?.college_name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="form-group mb-3">
                    <label className="form-label">Proposed Date</label>
                    <p className="form-control-plaintext">
                      {selectedSubmission
                        ? moment(selectedSubmission.proposed_date).format(
                            "DD-MM-YYYY hh:mm A"
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowMainModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormSubmissionsPage;
