import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";

interface Certificate {
  id: number;
  user: string;
  user_name: string;
  course_title: string;
  category: string;
  file_name: string;
  file: string;
  created_at: string;
}

interface CourseCertificatesPageProps {
  courseId: string;
  course: {
    course_id: number;
    course_name: string;
    category_name: string;
    certificate_count: number;
  };
  onBack: () => void;
}

const CourseCertificatesPage: React.FC<CourseCertificatesPageProps> = ({
  courseId,
  course,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const { useFetch } = useCrud();
  const {
    data: certificateData,
    isLoading,
    error,
  } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Certificate[];
  }>(`/certificates/certificates/course/${courseId}/`, {
    page: currentPage,
    page_size: pageSize,
  });

  const certificates = certificateData?.results ?? [];
  const totalItems = certificateData?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePagination = (action: string | number) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
    else if (typeof action === "number") setCurrentPage(action);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/certificates/certificates/download/${courseId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download certificates.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates_course_${courseId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificates downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download certificates.");
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading certificates: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>{course.course_name} Certificates</h3>
        <div className="btn_grp">
          <button className="btn" onClick={onBack}>
            Back
          </button>
          <button className="btn" onClick={handleExport}>
            Export as ZIP
          </button>
        </div>
      </div>

      <div className="filterWrapp">
        <div className="items">
          <p>Show</p>
          <select
            className="formcontrol"
            value={pageSize}
            onChange={(e) => {
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
      </div>

      <div className="CertificateList">
        {certificates.length > 0 ? (
          certificates.map((certificate) => (
            <div key={certificate.id} className="card_bx_Certificate">
              <div className="image_bx">
                <a
                  href={certificate.file}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={certificate.file} alt={certificate.file_name} />
                </a>
              </div>
              <div className="ContentCertificate">
                <h3>{certificate.category}</h3>
                <p>{certificate.user_name}</p>
                <h6>{moment(certificate.created_at).format("DD MMMM YYYY")}</h6>
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
    </div>
  );
};

export default CourseCertificatesPage;
