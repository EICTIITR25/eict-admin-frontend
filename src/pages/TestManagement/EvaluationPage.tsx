import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import moment from "moment";
import { useCrud } from "../../hooks/useCrud";

interface Test {
  id: number;
  title: string;
  total_submissions: number;
  created_at: string;
}

const EvaluationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const { useFetch } = useCrud();
  const { data, isLoading, error } = useFetch<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Test[];
  }>("/tests/admin/tests/with-submissions/", {
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

  const tests = data?.results ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const filteredTests = tests.filter(
    (test) =>
      debouncedSearchTerm.length === 0 ||
      (debouncedSearchTerm.length >= 3 &&
        test.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  const paginatedTests = filteredTests.slice(0, pageSize);

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

  const handleTestClick = (testId: number, testTitle: string) => {
    navigate("/evaluation", { state: { testId, testTitle } });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tests: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Evaluation</h3>
      </div>
      <div className="Faculty_table test_wrapp">
        <div className="Facultyfilter_bx">
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
            <p>entries</p>
          </div>
          <div className="FacultyRigt">
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
        </div>
        <div className="Evaluation_list">
          {paginatedTests.length > 0 ? (
            paginatedTests.map((test, index) => (
              <div className="Evaluation_item" key={test.id}>
                <div className="num title_bx">#{startIndex + index + 1}</div>
                <div
                  className="title_bx"
                  onClick={() => handleTestClick(test.id, test.title)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{test.title}</h3>
                  <p>
                    Test created on{" "}
                    {moment(test.created_at).format("DD-MM-YYYY")}
                  </p>
                </div>
                <div className="title_bx">
                  <p>{test.total_submissions} Submissions</p>
                </div>
                <div className="title_bx">
                  <p>
                    {moment(test.created_at).format("DD-MM-YYYY | hh:mm A")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#888" }}
            >
              No evaluation available
            </div>
          )}
        </div>

        <div className="pagination">
          <div className="items">
            <p>Showing </p>
            <p>
              {startIndex + 1} - {endIndex} of {totalItems} entries
            </p>
          </div>
          <div className="pagenationRight">
            <button
              className="btn btnno"
              onClick={() => handlePagination("prev")}
              disabled={currentPage === 1}
            >
              <svg
                width="8"
                height="16"
                viewBox="0 0 8 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.00016 2.00117C6.25603 2.00117 6.51203 2.09883 6.70703 2.29414C7.09766 2.68477 7.09766 3.31758 6.70703 3.7082L2.41266 8.00117L6.70703 12.2949C7.09766 12.6855 7.09766 13.3184 6.70703 13.709C6.31641 14.0996 5.68359 14.0996 5.29297 13.709L0.292969 8.70898C-0.0976563 8.31836 -0.0634763 7.68555 0.292969 7.29492L5.29297 2.29492C5.48828 2.09805 5.74422 2.00117 6.00016 2.00117Z"
                  fill="black"
                />
              </svg>
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
              <svg
                width="8"
                height="16"
                viewBox="0 0 8 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.99984 13.9988C1.74397 13.9988 1.48797 13.9012 1.29297 13.7059C0.902344 13.3152 0.902344 12.6824 1.29297 12.2918L5.58734 7.99883L1.29297 3.70508C0.902344 3.31445 0.902344 2.68164 1.29297 2.29102C1.68359 1.90039 2.31641 1.90039 2.70703 2.29102L7.70703 7.29102C8.09766 7.68164 8.09766 8.31445 7.70703 8.70508L2.70703 13.7051C2.51172 13.902 2.25578 13.9988 1.99984 13.9988Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
