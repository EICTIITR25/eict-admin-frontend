import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Modal, Form } from "react-bootstrap";
import moment from "moment";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";

interface Submission {
  id: number;
  student_name: string;
  submitted_at: string;
  total_score: number;
  status: string;
  teacher_remarks: string | null;
  allow_reattempt: boolean;
  total_marks: number;
  questions_attempted: number;
  total_students: number;
  time_taken: string;
}

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Answer {
  question: string;
  marks: number;
  options: Option[];
  selected_option: { id: number; text: string } | null;
  is_correct: boolean | null;
}

interface SubmissionDetails {
  submission: {
    id: number;
    submitted_at: string;
    total_score: number;
    status: string;
    teacher_remarks: string | null;
    allow_reattempt: boolean;
    total_marks: number;
    questions_attempted: number;
    time_taken: string;
  };
  answers: Answer[];
}

const useFetchSubmissionDetails = (
  testId: string | undefined,
  submissionId: number | null
) => {
  const { useFetch } = useCrud();
  const { data, error, isLoading } = useFetch<SubmissionDetails>(
    testId && submissionId
      ? `/tests/admin/tests/submissions/${submissionId}/`
      : undefined,
    {},
    { enabled: !!testId && !!submissionId }
  );

  return { data, error, isLoading };
};

const TestProfileEvaluationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId, testTitle } = location.state || {};

  // Separate raw input and debounced search term
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [submissionDetails, setSubmissionDetails] =
    useState<SubmissionDetails | null>(null);
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [showReattemptModal, setShowReattemptModal] = useState(false);
  const [selectedCheckboxIds, setSelectedCheckboxIds] = useState<number[]>([]);

  const { useFetch, useUpdate, useCreate } = useCrud();

  const statusOptions = ["Passed", "Failed", "Started"];

  // Debounce search term update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput.length === 0 || searchInput.length >= 3) {
        setSearchTerm(searchInput);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams: Record<string, any> = {
    ...(searchTerm && { search: searchTerm }),
    ...(selectedStatuses.length > 0 && { status: selectedStatuses.join(",") }),
  };

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useFetch<{
    total_submissions: number;
    results: Submission[];
  }>(
    testId ? `/tests/admin/tests/${testId}/submissions/` : undefined,
    queryParams
  );

  const {
    data: submissionData,
    error: submissionError,
    isLoading: submissionLoading,
  } = useFetchSubmissionDetails(testId, selectedSubmission?.id || null);

  const updateSubmission = useUpdate(
    `/tests/admin/tests/submissions/`,
    `/tests/admin/tests/submissions/`
  );

  const generateCertificates = useCreate(
    `/tests/admin/tests/submissions/generate-certificates/`
  );

  useEffect(() => {
    if (
      submissionsData?.results &&
      submissionsData.results.length > 0 &&
      !selectedSubmission
    ) {
      setSelectedSubmission(submissionsData.results[0]);
    }
  }, [submissionsData, selectedSubmission]);

  useEffect(() => {
    if (submissionLoading) return;

    if (submissionData) {
      setSubmissionDetails(submissionData);
      setTeacherRemarks(submissionData.submission.teacher_remarks || "");
    }
    if (submissionError) {
      toast.error(
        `Failed to fetch submission details: ${submissionError.message}`
      );
    }
  }, [submissionData, submissionError, submissionLoading]);

  useEffect(() => {
    if (!testId) {
      toast.error("No test selected");
      navigate("/test-management/evaluation");
    }
  }, [testId, navigate]);

  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleSelectAllPassed = () => {
    if (
      selectedCheckboxIds.length ===
      filteredSubmissions.filter((sub) => sub.status === "Passed").length
    ) {
      // If all "Passed" submissions are selected, deselect all
      setSelectedCheckboxIds([]);
    } else {
      // Select all submissions with "Passed" status
      const passedSubmissionIds = filteredSubmissions
        .filter((submission) => submission.status === "Passed")
        .map((submission) => submission.id);
      setSelectedCheckboxIds(passedSubmissionIds);
    }
  };

  const handleCheckboxChange = (submissionId: number) => {
    setSelectedCheckboxIds((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleAddReattempt = () => {
    if (!selectedSubmission) return;

    // Prepare payload with both allow_reattempt and teacher_remarks
    const payload = {
      allow_reattempt: true,
      teacher_remarks: teacherRemarks || "",
    };

    updateSubmission.mutate(
      {
        id: selectedSubmission.id,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success(
            "Re-attempt allowed and remarks submitted successfully!"
          );
          setShowReattemptModal(true);
          setSelectedSubmission({
            ...selectedSubmission,
            allow_reattempt: true,
            teacher_remarks: teacherRemarks || "",
          });
          setSubmissionDetails({
            ...submissionDetails!,
            submission: {
              ...submissionDetails!.submission,
              allow_reattempt: true,
              teacher_remarks: teacherRemarks || "",
            },
          });
        },
        onError: (error: any) => {
          toast.error(
            "Failed to allow re-attempt or submit remarks: " + error.message
          );
        },
      }
    );
  };

  const handleGenerateCertificates = () => {
    if (selectedCheckboxIds.length === 0) {
      toast.error(
        "Please select at least one submission to generate certificates."
      );
      return;
    }

    const payload = {
      submission_ids: selectedCheckboxIds,
    };

    generateCertificates.mutate(payload, {
      onSuccess: () => {
        toast.success("Certificates generated successfully!");
        setSelectedCheckboxIds([]); // Clear selections after success
      },
      onError: (error: any) => {
        toast.error("Failed to generate certificates: " + error.message);
      },
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "No.",
      "Name",
      "Attempted Questions",
      "Duration",
      "Date/Time",
      "Status",
    ];
    const rows = filteredSubmissions.map((submission, index) => [
      index + 1,
      submission.student_name,
      submission.questions_attempted,
      submission.time_taken,
      moment(submission.submitted_at).format("DD-MM-YYYY hh:mm A"),
      submission.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `test_${testId}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions = (submissionsData?.results ?? []).filter(
    (submission) =>
      submission.student_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      (selectedStatuses.length === 0 ||
        selectedStatuses.includes(submission.status))
  );

  if (!testId) return null;
  if (submissionsLoading) return <div>Loading...</div>;
  if (submissionsError)
    return <div>Error loading submissions: {submissionsError.message}</div>;

  return (
    <div className="TestProfileEvaluationWrapp">
      <div className="head_bx">
        <Link to="/test-management/evaluation">
          <span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 15L3 9L9 3L9.7875 3.7875L5.1375 8.4375H15V9.5625H5.1375L9.7875 14.2125L9 15Z"
                fill="black"
              />
            </svg>
          </span>{" "}
          Test Evaluation
        </Link>
        <h3>{testTitle || "Test Details"}</h3>
        <div className="btn_grp">
          <button
            className="btn"
            onClick={handleGenerateCertificates}
            disabled={
              selectedCheckboxIds.length === 0 || generateCertificates.isPending
            }
          >
            {generateCertificates.isPending
              ? "Generating..."
              : "Submit & Generate Certificate"}
          </button>
        </div>
      </div>
      <div className="test_paperWrapp">
        <div className="Test_left">
          <div className="head_bx">
            <div className="ListFilter">
              <h3>List of Students</h3>
              <p>
                Total: <span>{submissionsData?.total_submissions || 0}</span>
              </p>
            </div>
            <div
              className="filter_bx"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <div className="grp_search">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchInput(e.target.value)
                  }
                />
              </div>

              <div
                className="status-filter"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "15px",
                  marginTop: "5px",
                }}
              >
                {statusOptions.map((status) => (
                  <label
                    key={status}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => handleStatusChange(status)}
                      style={{ marginRight: "5px" }}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="table_test">
            <button className="btnExport" onClick={handleExportCSV}>
              Export as CSV
            </button>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <div className="Courses_checkbx">
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            selectedCheckboxIds.length ===
                            filteredSubmissions.filter(
                              (sub) => sub.status === "Passed"
                            ).length
                          }
                          onChange={handleSelectAllPassed}
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                  </th>
                  <th>No.</th>
                  <th>Name</th>
                  <th>
                    Attempted <br /> Questions
                  </th>
                  <th>Duration</th>
                  <th style={{ width: "25%" }}>
                    Date <br /> /Time
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, index) => {
                  const statusBgColor =
                    submission.status === "Passed"
                      ? "#e6f4ea"
                      : submission.status === "Failed"
                      ? "#f8e1e1"
                      : submission.status === "Started"
                      ? "#e6e6e6"
                      : "transparent";
                  return (
                    <tr
                      key={submission.id}
                      onClick={() => handleSubmissionClick(submission)}
                      style={{
                        cursor: "pointer",
                        ...(selectedSubmission?.id === submission.id
                          ? {
                              outline: "2px solid #007bff",
                              backgroundColor: "rgba(0, 123, 255, 0.1)",
                            }
                          : {}),
                      }}
                      className={
                        selectedSubmission?.id === submission.id ? "active" : ""
                      }
                    >
                      <td style={{ backgroundColor: statusBgColor }}>
                        <div className="Courses_checkbx">
                          <label htmlFor={`${submission.id}`}>
                            <input
                              type="checkbox"
                              name="Courses"
                              id={`${submission.id}`}
                              checked={selectedCheckboxIds.includes(
                                submission.id
                              )}
                              onChange={() =>
                                handleCheckboxChange(submission.id)
                              }
                            />
                            <span></span>
                          </label>
                        </div>
                      </td>
                      <td style={{ backgroundColor: statusBgColor }}>
                        {index + 1}
                      </td>
                      <td style={{ backgroundColor: statusBgColor }}>
                        {submission.student_name}
                      </td>
                      <td style={{ backgroundColor: statusBgColor }}>
                        {submission.questions_attempted}
                      </td>
                      <td style={{ backgroundColor: statusBgColor }}>
                        {submission.time_taken}
                      </td>
                      <td style={{ backgroundColor: statusBgColor }}>
                        {moment(submission.submitted_at).format(
                          "DD-MM-YYYY hh:mm A"
                        )}
                      </td>
                      <td style={{ backgroundColor: statusBgColor }}>
                        {submission.status}{" "}
                        <span>
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <mask
                              id="mask0_1495_17949"
                              maskUnits="userSpaceOnUse"
                              x="0"
                              y="0"
                              width="18"
                              height="18"
                            >
                              <rect
                                x="0.765625"
                                y="0.5"
                                width="17"
                                height="17"
                                fill="#D9D9D9"
                              />
                            </mask>
                            <g mask="url(#mask0_1495_17949)">
                              <path
                                d="M6.4526 16.0827L5.19531 14.8254L11.0214 8.99935L5.19531 3.17331L6.4526 1.91602L13.5359 8.99935L6.4526 16.0827Z"
                                fill="#1C1B1F"
                              />
                            </g>
                          </svg>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div className="test_right">
          {selectedSubmission && submissionDetails ? (
            <>
              <div className="header_top">
                <div className="hd_title">
                  <p>
                    Name of the Student:{" "}
                    <span>{selectedSubmission.student_name}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          selectedSubmission.status === "Passed"
                            ? "#156c3c"
                            : "#db4b4b",
                      }}
                    >
                      {selectedSubmission.status}
                    </span>
                  </p>
                </div>
                <div className="mark_bx">
                  <div className="mrk_grp">
                    <label>Total Marks:</label>
                    <input
                      type="text"
                      value={selectedSubmission.total_marks}
                      readOnly
                    />
                  </div>
                  <div className="mrk_grp">
                    <label>Total Marks Obtained:</label>
                    <input
                      type="text"
                      value={selectedSubmission.total_score}
                      readOnly
                    />
                  </div>
                </div>
                <button
                  className="nextbtn"
                  onClick={() => {
                    const currentIndex = filteredSubmissions.findIndex(
                      (s) => s.id === selectedSubmission.id
                    );
                    if (currentIndex < filteredSubmissions.length - 1) {
                      handleSubmissionClick(
                        filteredSubmissions[currentIndex + 1]
                      );
                    }
                  }}
                  disabled={
                    filteredSubmissions.findIndex(
                      (s) => s.id === selectedSubmission.id
                    ) ===
                    filteredSubmissions.length - 1
                  }
                >
                  Next
                </button>
              </div>
              <div className="Ques_list_Wrapp">
                {submissionDetails.answers.map((answer, index) => (
                  <div key={index} className="crd_quest">
                    <div className="questionWrapp">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>Question {index + 1}</h3>
                        <div style={{ fontWeight: "600", color: "#007bff" }}>
                          Marks: {answer.marks}
                        </div>
                      </div>
                      <div className="Qst_name">{answer.question}</div>
                    </div>
                    <div className="option_qust">
                      <h3>Student's Answer</h3>
                      <div className="option">
                        {answer.options.map((option) => (
                          <div key={option.id} className="radio_bx">
                            <Form.Check
                              type="radio"
                              id={`option-${option.id}`}
                              name={`answer-${index}`}
                              label={
                                <>
                                  {option.text}
                                  {option.is_correct && (
                                    <span
                                      style={{
                                        color: "green",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      (Correct)
                                    </span>
                                  )}
                                  {answer.selected_option?.id === option.id &&
                                    answer.is_correct === false && (
                                      <span
                                        style={{
                                          color: "red",
                                          marginLeft: "8px",
                                        }}
                                      >
                                        (Incorrect)
                                      </span>
                                    )}
                                </>
                              }
                              checked={answer.selected_option?.id === option.id}
                              disabled
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {["Failed", "Started"].includes(selectedSubmission.status) && (
                  <div className="from-grp bottm-top">
                    <p>Teacher’s Evaluation</p>
                    <textarea
                      name="teacher_remarks"
                      style={{ height: "110px" }}
                      className="form-control"
                      placeholder="Evaluation And Remarks"
                      value={teacherRemarks}
                      onChange={(e) => setTeacherRemarks(e.target.value)}
                    ></textarea>
                    <div className="btn_grp">
                      <button
                        className="btn"
                        onClick={handleAddReattempt}
                        disabled={
                          selectedSubmission.allow_reattempt ||
                          updateSubmission.isPending
                        }
                      >
                        {updateSubmission.isPending
                          ? "Processing..."
                          : "Add Re-Attempt"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        show={showReattemptModal}
        centered
        onHide={() => setShowReattemptModal(false)}
        dialogClassName="modalfullCustom modalSM modalSucss"
      >
        <Modal.Body>
          <div className="login_wrap">
            <div className="log_hd">Reattempt Allowed</div>
            <div className="sucssfull_bx">
              <img src="/images/icons/success.gif" alt="" />
              <p>Reattempt has been successfully allowed for this student.</p>
              <button
                className="btn"
                onClick={() => setShowReattemptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TestProfileEvaluationPage;
