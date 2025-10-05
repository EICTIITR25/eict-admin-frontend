import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, ChangeEvent, useRef } from "react";
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
import Select from "react-select";

interface Test {
  id: number;
  title: string;
  is_draft: boolean;
  is_active: boolean;
  questions: {
    id: number;
    text: string;
    marks: number;
    options: { id: number; text: string; is_correct: boolean }[];
  }[];
  duration_hours: number;
  duration_minutes: number;
  course_name: string;
}

interface Course {
  id: number;
  title: string;
  category_name: string;
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

const TestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showMainModal, setShowMainModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [testName, setTestName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    testName?: string;
    duration?: string;
  }>({});
  const [DurationFilter, setDurationFilter] = useState<string>("0");
  const [DurationMinutesFilter, setDurationMinutesFilter] =
    useState<string>("00");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const tdStyle = {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "middle",
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
  }, [selectedFilters, isDraft]);

  const { useFetch, useDelete, useUpdate } = useCrud();
  const {
    data: testData,
    isLoading: isLoadingTests,
    error: testError,
  } = useFetch<{
    count: number;
    total_pages: number;
    current_page: number;
    results: Test[];
  }>("/tests/list/", {
    page: currentPage,
    page_size: pageSize,
    ...(debouncedSearchTerm.length >= 3 && { search: debouncedSearchTerm }),
    is_category:
      selectedFilters.length > 0 && !selectedFilters.includes("")
        ? selectedFilters.join(",")
        : undefined,
    is_draft: selectedFilters.includes("draft") ? isDraft : undefined,
  });

  const {
    data: courseData,
    isLoading: isLoadingCourses,
    error: courseError,
  } = useFetch<Course[]>(
    "/courses/courses-list-2/",
    {
      category: selectedCategory?.id || "",
    },
    { enabled: !!selectedCategory?.id }
  );

  const deleteTest = useDelete("/tests/create/", "/tests/list/");
  const linkCourse = useUpdate("/tests/create/", "/tests/list/");
  const updateTest = useUpdate<Test>("/tests/create/", "/tests/list/");

  const tests = testData?.results ?? [];
  const totalItems = testData?.count ?? 0;
  const totalPages = testData?.total_pages ?? 1;

  useEffect(() => {
    if (courseData) {
      const courses = courseData.map((course: Course) => ({
        value: course.id,
        label: course.title,
      }));
      setCourseOptions(courses);
    } else {
      setCourseOptions([]);
    }
    if (courseError) {
      toast.error("Failed to fetch courses.");
      setCourseOptions([]);
    }
  }, [courseData, courseError]);

  useEffect(() => {
    setSelectedCourse(null);
  }, [selectedCategory]);

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

  const openDeleteModal = (test: { id: number; title: string }) => {
    setSelectedTest(test);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedTest) {
      deleteTest.mutate(
        { id: selectedTest.id },
        {
          onSuccess: () => {
            toast.success("Test deleted successfully!");
            setShowDeleteModal(false);
            setSelectedTest(null);
            setSelectedRow(null);
          },
          onError: () => {
            toast.error("Failed to delete test.");
          },
        }
      );
    }
  };

  const handleRowSelect = (testId: number) => {
    setSelectedRow(testId);
    setSelectedTest(tests.find((test) => test.id === testId) || null);
  };

  const handleToggleActive = (test: Test) => {
    const newStatus = !test.is_active;
    updateTest.mutate(
      {
        id: test.id,
        data: { is_active: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Test status updated successfully!");
        },
        onError: (error: any) => {
          console.error("Failed to update test status:", error);
          toast.error("Failed to update test status.");
        },
      }
    );
  };

  const handleSubmitLinkCourse = () => {
    if (selectedRow && selectedCourse) {
      linkCourse.mutate(
        {
          id: selectedRow,
          data: { course_id: selectedCourse.value },
        },
        {
          onSuccess: () => {
            toast.success("Test linked to course successfully!");
            setShowMainModal(false);
            setSelectedCategory(null);
            setSelectedCourse(null);
            setSelectedRow(null);
            setSelectedTest(null);
          },
          onError: () => {
            toast.error("Failed to link test to course.");
          },
        }
      );
    } else {
      toast.error("Please select a test and a course.");
    }
  };

  const hoursOptions = Array.from({ length: 5 }, (_, i) => ({
    value: i.toString(),
    label: `${i} hr${i > 1 ? "s" : ""}`,
  }));

  const minutesOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: `${i.toString().padStart(2, "0")} min`,
  }));

  const pagesToDisplay = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 1, totalPages));

  const handleFilterChange = (filterId: string) => {
    setCurrentPage(1);
    if (filterId === "draft") {
      setIsDraft(true);
      setSelectedFilters((prev) => {
        if (prev.includes("draft")) {
          return prev.filter((id) => id !== "draft");
        }
        return [...prev, "draft"];
      });
    } else if (filterId === "") {
      setSelectedFilters([""]);
      setIsDraft(false);
    } else {
      setSelectedFilters((prev) => {
        if (prev.includes("")) return [filterId];
        if (prev.includes(filterId)) {
          const newFilters = prev.filter((id) => id !== filterId);
          return newFilters.length === 0 ? [""] : newFilters;
        }
        return [...prev.filter((id) => id !== ""), filterId];
      });
    }
  };

  const validateForm = () => {
    const newErrors: { testName?: string; duration?: string } = {};
    if (!testName.trim()) {
      newErrors.testName = "Test Name is required";
    }
    if (Number(DurationFilter) === 0 && Number(DurationMinutesFilter) === 0) {
      newErrors.duration = "At least one duration field must be non-zero";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      navigate("/test-management/fundamentals-questions", {
        state: {
          testData: {
            title: testName,
            duration_hours: Number(DurationFilter),
            duration_minutes: Number(DurationMinutesFilter),
          },
        },
      });
    }
  };

  if (isLoadingTests) return <div>Loading...</div>;
  if (testError) return <div>Error loading tests: {testError.message}</div>;

  return (
    <>
      <div className="admin_panel">
        <div className="Breadcrumbs">
          <h3>Test List</h3>
          <div className="btn_grp">
            <button
              className="btn"
              onClick={() => setShowMainModal(true)}
              disabled={!selectedRow}
            >
              Align to Course
            </button>
            <button className="btn" onClick={() => setShowCreateModal(true)}>
              Add New Test
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                { id: "draft", label: "Draft" },
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
              minWidth: "800px",
            }}
          >
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                {[
                  "Select",
                  "S.NO",
                  "Test Name",
                  "Course Aligned",
                  "Duration",
                  "No. of Questions",
                  "Active/Inactive",
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
              {tests.length > 0 ? (
                tests.map((test, index) => (
                  <tr key={test.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>
                      <input
                        type="radio"
                        name="testSelect"
                        checked={selectedRow === test.id}
                        onChange={() => handleRowSelect(test.id)}
                      />
                    </td>
                    <td style={tdStyle}>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td style={tdStyle}>{test.title}</td>
                    <td style={tdStyle}>
                      {test.is_draft ? "Draft" : test.course_name}
                    </td>
                    <td style={tdStyle}>
                      {test.duration_hours > 0
                        ? `${test.duration_hours} hr${
                            test.duration_hours > 1 ? "s" : ""
                          } `
                        : ""}
                      {test.duration_minutes > 0
                        ? `${test.duration_minutes} min${
                            test.duration_minutes > 1 ? "s" : ""
                          }`
                        : test.duration_hours === 0
                        ? "N/A"
                        : ""}
                    </td>
                    <td style={tdStyle}>{test.questions.length}</td>
                    <td style={tdStyle}>
                      <div className="Courses_checkbx">
                        <label htmlFor={`test-${test.id}`}>
                          <input
                            type="checkbox"
                            name="Tests"
                            id={`test-${test.id}`}
                            checked={test.is_active}
                            onChange={() => handleToggleActive(test)}
                            disabled={updateTest.isPending}
                          />
                          <span>{test.is_active ? "Active" : "Inactive"}</span>
                        </label>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          to="/test-management/fundamentals-questions"
                          state={{ test }}
                          style={{
                            backgroundColor: "#2563eb",
                            padding: "6px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
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
                          onClick={() => openDeleteModal(test)}
                          style={{
                            backgroundColor: "#dc2626",
                            padding: "6px",
                            borderRadius: "4px",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <svg
                            width="14"
                            height="15"
                            viewBox="0 0 14 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.96094 0.518262C4.11914 0.200625 4.44434 0 4.79883 0H8.32617C8.68066 0 9.00586 0.200625 9.16406 0.518262L9.375 0.9375H12.1875C12.7061 0.9375 13.125 1.35732 13.125 1.875C13.125 2.39268 12.7061 2.8125 12.1875 2.8125H0.9375C0.419824 2.8125 0 2.39268 0 1.875C0 1.35732 0.419824 0.9375 0.9375 0.9375H3.75L3.96094 0.518262ZM0.911133 3.75H12.1875V13.125C12.1875 14.1592 11.3467 15 10.3125 15H2.78613C1.77686 15 0.911133 14.1592 0.911133 13.125V3.75ZM3.25488 6.09375V12.6562C3.25488 12.9141 3.49219 13.125 3.72363 13.125C4.00781 13.125 4.19238 12.9141 4.19238 12.6562V6.09375C4.19238 5.83594 4.00781 5.625 3.72363 5.625C3.49219 5.625 3.25488 5.83594 3.25488 6.09375ZM6.7168 6.09375V12.6562C6.7168 12.9141 6.9541 13.125 7.18555 13.125C7.46973 13.125 7.6543 12.9141 7.6543 12.6562V6.09375C7.6543 5.83594 7.46973 5.625 7.18555 5.625C6.9541 5.625 6.7168 5.83594 6.7168 6.09375ZM10.1787 6.09375V12.6562C10.1787 12.9141 10.416 13.125 10.6475 13.125C10.9317 13.125 11.1162 12.9141 11.1162 12.6562V6.09375C11.1162 6.09375 10.9317 5.625 10.6475 5.625C10.416 5.625 10.1787 5.83594 10.1787 6.09375Z"
                              fill="white"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No tests found.
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
                className={`btn btnno ${currentPage === page ? "active" : ""}`}
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
      </div>

      <Modal
        dialogClassName="modalfullCustom modalSM modalSucss"
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Body>
          <div className="modal_delete" style={{ width: "100%" }}>
            <h3 style={{ textTransform: "capitalize" }}>
              Are you sure you want to delete
            </h3>
            <div>
              <div className="btn_grp">
                <Button
                  className="btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  No
                </Button>
                <Button
                  className="btn"
                  style={{ background: "#1e3a8a", color: "#fff" }}
                  onClick={confirmDelete}
                  disabled={deleteTest.isPending}
                >
                  {deleteTest.isPending ? "Deleting..." : "Yes"}
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showMainModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Link to Course</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-lg-12">
                <div className="from-group mb-3">
                  <label>Category</label>
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Select Category"
                    isClearable
                  />
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Link Course</label>
                  <Select
                    options={courseOptions}
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                    placeholder="Select Course"
                    isClearable
                    isLoading={isLoadingCourses}
                    isDisabled={!selectedCategory?.id || isLoadingCourses}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp">
                  <button
                    className="btn"
                    onClick={() => {
                      setShowMainModal(false);
                      setSelectedCategory(null);
                      setSelectedCourse(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    className="btn"
                    onClick={handleSubmitLinkCourse}
                    disabled={linkCourse.isPending || !selectedCourse}
                  >
                    {linkCourse.isPending ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showCreateModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Create New Test</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-12 mb-3">
                <label>
                  Test Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="testName"
                  placeholder="Enter"
                  className="form-control"
                  value={testName}
                  onChange={(e) => {
                    setTestName(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, testName: undefined }));
                    }
                  }}
                  required
                />
                {errors.testName && (
                  <small style={{ color: "red" }}>{errors.testName}</small>
                )}
              </div>
              <div className="col-md-12 mb-3">
                <label>
                  Test Duration <span style={{ color: "red" }}>*</span>
                </label>
                <div className="d-flex gap-3">
                  <div style={{ flex: 1 }}>
                    <label>Hours</label>
                    <Select
                      options={hoursOptions}
                      value={hoursOptions.find(
                        (opt) => opt.value === DurationFilter
                      )}
                      onChange={(selected) => {
                        setDurationFilter(selected?.value || "0");
                        if (
                          selected?.value !== "0" ||
                          Number(DurationMinutesFilter) > 0
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            duration: undefined,
                          }));
                        }
                      }}
                      isSearchable={false}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Minutes</label>
                    <Select
                      options={minutesOptions}
                      value={minutesOptions.find(
                        (opt) => opt.value === DurationMinutesFilter
                      )}
                      onChange={(selected) => {
                        setDurationMinutesFilter(selected?.value || "00");
                        if (
                          selected?.value !== "00" ||
                          Number(DurationFilter) > 0
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            duration: undefined,
                          }));
                        }
                      }}
                      isSearchable={false}
                      required
                    />
                  </div>
                </div>
                {errors.duration && (
                  <small style={{ color: "red" }}>{errors.duration}</small>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="col-md-5 d-flex align-items-end justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateModal(false);
                setTestName("");
                setDurationFilter("0");
                setDurationMinutesFilter("00");
                setErrors({});
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!!errors.testName || !!errors.duration}
            >
              Submit
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TestListPage;
