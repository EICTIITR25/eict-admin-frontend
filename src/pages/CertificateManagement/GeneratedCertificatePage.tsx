import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useCrud } from "../../hooks/useCrud";
import CourseCertificatesPage from "./CourseCertificatesPage";

interface Certificate {
  course_id: number;
  course_name: string;
  category_name: string;
  certificate_count: number;
}

const categoryOptions = [
  { id: 1, value: "Self Paced", label: "Self Paced" },
  { id: 2, value: "FDP", label: "FDP" },
  { id: 5, value: "Short Term Training", label: "Short Term Training" },
  {
    value: "PG Certification",
    label: "PG Certification",
    options: [
      { id: 4, value: "Advance PG Course", label: "Advance PG Course" },
      { id: 6, value: "EICT-Third Party", label: "EICT-Third Party" },
    ],
  },
];

const GeneratedCertificatePage: React.FC = () => {
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([""]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Certificate | null>(
    null
  );
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const tdStyle = {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "middle",
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 1000);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters]);

  const { useFetch } = useCrud();
  const {
    data: certificateData,
    isLoading: isLoadingCertificates,
    error: certificateError,
  } = useFetch<{
    count: number;
    total_pages: number;
    current_page: number;
    results: Certificate[];
  }>("/certificates/certificates/summary/", {
    page: currentPage,
    page_size: pageSize,
    ...(debouncedSearchTerm.length >= 3 && { search: debouncedSearchTerm }),
    category_id:
      selectedFilters.length > 0 && !selectedFilters.includes("")
        ? selectedFilters.join(",")
        : undefined,
  });

  const certificates = certificateData?.results ?? [];
  const totalItems = certificateData?.count ?? 0;
  const totalPages = certificateData?.total_pages ?? 1;

  const handlePagination = (direction: "first" | "prev" | "next" | "last") => {
    switch (direction) {
      case "first":
        setCurrentPage(1);
        break;
      case "prev":
        setCurrentPage((prev) => Math.max(prev - 1, 1));
        break;
      case "next":
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        break;
      case "last":
        setCurrentPage(totalPages);
        break;
    }
  };

  const handleRowSelect = (courseId: number) => {
    setSelectedRow(courseId);
  };

  const handleExport = async () => {
    if (!selectedRow) {
      toast.error("Please select a course to export.");
      return;
    }

    try {
      const response = await fetch(
        `/certificates/certificates/export/${selectedRow}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export certificates.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates_${selectedRow}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificates exported successfully!");
    } catch (error) {
      toast.error("Failed to export certificates.");
    }
  };

  const handleViewCertificates = (certificate: Certificate) => {
    setSelectedCourse(certificate);
  };

  const handleFilterChange = (filterId: string) => {
    setCurrentPage(1);
    setSelectedFilters((prev) => {
      if (filterId === "") {
        return [""];
      }
      if (prev.includes("")) return [filterId];
      if (prev.includes(filterId)) {
        const newFilters = prev.filter((id) => id !== filterId);
        return newFilters.length === 0 ? [""] : newFilters;
      }
      return [...prev.filter((id) => id !== ""), filterId];
    });
  };

  const pagesToDisplay = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 1, totalPages));

  if (isLoadingCertificates) return <div>Loading...</div>;
  if (certificateError)
    return <div>Error loading certificates: {certificateError.message}</div>;

  return (
    <>
      <div className="admin_panel">
        {!selectedCourse ? (
          <>
            <div className="Breadcrumbs">
              <h3>Generated Certificates</h3>
              <div className="btn_grp">
                <button
                  className="btn"
                  onClick={handleExport}
                  disabled={!selectedRow}
                >
                  Export
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                marginTop: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <p style={{ margin: 0, fontWeight: 500 }}>Show</p>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                  <p style={{ margin: 0, fontWeight: 500 }}>entries</p>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <p style={{ margin: 0, fontWeight: 500 }}>Search:</p>
                  <input
                    type="text"
                    placeholder="Enter at least 3 characters..."
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      minWidth: "200px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "16px 24px",
                  marginTop: "4px",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "16px",
                    flex: 1,
                  }}
                >
                  <strong style={{ fontSize: "14px" }}>Filter:</strong>
                  {[
                    { id: "", label: "All" },
                    { id: "1", label: "Self Paced" },
                    { id: "5", label: "Short Term Training" },
                    { id: "2", label: "FDP" },
                    { id: "4", label: "Advance PG Course" },
                    { id: "6", label: "EICT-Third Party" },
                  ].map((filter) => (
                    <label
                      key={filter.id}
                      htmlFor={filter.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        id={filter.id}
                        checked={selectedFilters.includes(filter.id)}
                        onChange={() => handleFilterChange(filter.id)}
                      />
                      <span>{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                marginTop: "1rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "600px",
                }}
              >
                <thead style={{ backgroundColor: "#f3f4f6" }}>
                  <tr>
                    {[
                      "Select",
                      "S.NO",
                      "Course Name",
                      "Category",
                      "No. of Participants",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          borderBottom: "1px solid #e5e7eb",
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.length > 0 ? (
                    certificates.map((certificate, index) => (
                      <tr
                        key={certificate.course_id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={tdStyle}>
                          <input
                            type="radio"
                            name="certificateSelect"
                            checked={selectedRow === certificate.course_id}
                            onChange={() =>
                              handleRowSelect(certificate.course_id)
                            }
                          />
                        </td>
                        <td style={tdStyle}>
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td style={tdStyle}>{certificate.course_name}</td>
                        <td style={tdStyle}>{certificate.category_name}</td>
                        <td style={tdStyle}>{certificate.certificate_count}</td>
                        <td style={tdStyle}>
                          <button
                            style={{
                              backgroundColor: "#2563eb",
                              padding: "6px",
                              borderRadius: "4px",
                              border: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewCertificates(certificate)}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.5 0C8.15625 0 8.75 0.234375 9.21875 0.703125C9.6875 1.17188 9.921875 1.76562 9.921875 2.42188C9.921875 3.07812 9.6875 3.67188 9.21875 4.14062C8.75 4.60938 8.15625 4.84375 7.5 4.84375C6.84375 4.84375 6.25 4.60938 5.78125 4.14062C5.3125 3.67188 5.078125 3.07812 5.078125 2.42188C5.078125 1.76562 5.3125 1.17188 5.78125 0.703125C6.25 0.234375 6.84375 0 7.5 0ZM7.5 6.09375C8.46875 6.09375 9.375 6.48438 10.0312 7.14062C10.6875 7.79688 11.0781 8.70312 11.0781 9.67188C11.0781 10.6406 10.6875 11.5469 10.0312 12.2031C9.375 12.8594 8.46875 13.25 7.5 13.25C6.53125 13.25 5.625 12.8594 4.96875 12.2031C4.3125 11.5469 3.921875 10.6406 3.921875 9.67188C3.921875 8.70312 4.3125 7.79688 4.96875 7.14062C5.625 6.48438 6.53125 6.09375 7.5 6.09375Z"
                                fill="white"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No certificates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="items"></div>
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
                {pagesToDisplay.map((page) => (
                  <button
                    key={page}
                    className={`btn btnno ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
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
          </>
        ) : (
          <CourseCertificatesPage
            courseId={selectedCourse.course_id.toString()}
            course={selectedCourse}
            onBack={() => setSelectedCourse(null)}
          />
        )}
      </div>
    </>
  );
};

export default GeneratedCertificatePage;
