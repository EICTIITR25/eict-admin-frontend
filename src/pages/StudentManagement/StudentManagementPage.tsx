import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import assets from "../../assets";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";

const StudentManagementPage = () => {
  const navigate = useNavigate();
  const { useFetch } = useCrud();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [csv, setCSV] = useState("");

  const shouldApplyDateFilter = startDate && endDate;
  // 👇 Normal student list
  const { data: studentList = [] } = useFetch(
    "/students/enrollments",
    {
      page: currentPage,
      search: searchTerm,
      page_size: pageSize,
      category: selectedProduct,
      ...(shouldApplyDateFilter && {
        start_date: startDate,
        end_date: endDate,
      }),
    },
    { retry: false }
  );

  // 👇 CSV export ke liye
  // const { data: studentCsvData = [] } = useFetch(
  //   csv === 'csv' ? "/students/enrollments" : "",
  //   {
  //     page: currentPage,
  //     search: searchTerm,
  //     page_size: pageSize,
  //     category: selectedProduct,
  //     export: "csv",
  //     ...(shouldApplyDateFilter && {
  //       start_date: startDate,
  //       end_date: endDate,
  //     }),
  //   },
  //   { retry: false, enabled: !!csv } // default off rakho
  // );


  const totalItems = studentList?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(inputValue), 800);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const downloadCsvString = (csvText: string, fileName = "Students.csv") => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCSV("");
  };

  // useEffect(() => {
  //   if (csv === "csv") 
  //     downloadCsvString(studentCsvData);
  // }, [csv, currentPage, searchTerm, selectedProduct, startDate, endDate]);
  return (
    <div style={{ padding: "20px", background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#1e3a8a" }}>
          All Students
        </h2>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        {/* 🔹 Filters Section */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "20px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Show</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Search</label>
            <input
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                minWidth: "200px",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setEndDate("");
                setStartDate(e.target.value);
              }}
              style={{
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* <button
            onClick={() => setCSV("csv")}
            style={{
              marginLeft: "auto",
              padding: "7px 14px",
              border: "none",
              borderRadius: "6px",
              background: "#047857",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Download CSV
          </button> */}
        </div>

        {/* 🔹 Table Section */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Mobile", "Email", "Created Date", "Action"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        background: "#f3f4f6",
                        textAlign: "left",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {studentList?.results?.map((course: any) => (
                <tr key={course.id}>
                  <td
                    style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}
                  >
                    <Link
                      to={`/student-management-student-detail/${course.id}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <img
                          src={course.profile_picture || assets.images.Avatar}
                          alt="profile"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span>
                          {course.first_name} {course.last_name}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td
                    style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}
                  >
                    {course.mobile_number || "-"}
                  </td>
                  <td
                    style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}
                  >
                    {course.email}
                  </td>
                  <td
                    style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}
                  >
                    {moment(course?.enrollments_date).format(
                      "DD-MM-YYYY hh:mm A"
                    ) || "-"}
                  </td>
                  <td
                    style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}
                  >
                    <button
                      onClick={() => navigate(`/student-management-student-detail/${course.id}`)}
                      style={{
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#1e3a8a",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <img src={assets.images.EditButton} alt="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 Pagination Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "18px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "14px" }}>
            Showing {startIndex + 1} - {endIndex} of {totalItems} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                background: "#e5e7eb",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              <FontAwesomeIcon icon={faAnglesLeft} /> First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: "#e5e7eb",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              <FontAwesomeIcon icon={faAngleLeft} /> Back
            </button>
            <span
              style={{
                background: "#1e3a8a",
                color: "white",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                background: "#e5e7eb",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next <FontAwesomeIcon icon={faAngleRight} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                background: "#e5e7eb",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Last <FontAwesomeIcon icon={faAnglesRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagementPage;
