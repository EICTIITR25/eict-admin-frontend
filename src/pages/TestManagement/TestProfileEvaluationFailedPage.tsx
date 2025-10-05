import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
interface Student {
  id: number;
  name: string;
  questionsAttempted: number;
  duration: string;
  date: string;
  status: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
}
const TestProfileEvaluationFailedPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDraftModal, setShoDraftModal] = useState(false);
  useEffect(() => {
    // Mock data for students
    const mockStudents: Student[] = [
      {
        id: 1,
        name: "Navya C",
        questionsAttempted: 10,
        duration: "1h",
        date: "20-10-2025 10:30PM",
        status: " Passed",
      },
      {
        id: 2,
        name: "Navya C",
        questionsAttempted: 8,
        duration: "45m",
        date: "20-10-2025 10:30PM",
        status: " Failed",
      },
      {
        id: 3,
        name: "Navya C",
        questionsAttempted: 10,
        duration: "1h",
        date: "20-10-2025 10:30PM",
        status: " Failed",
      },
      {
        id: 4,
        name: "Navya C",
        questionsAttempted: 8,
        duration: "45m",
        date: "20-10-2025 10:30PM",
        status: " Failed",
      },
      {
        id: 5,
        name: "Navya C",
        questionsAttempted: 10,
        duration: "1h",
        date: "20-10-2025 10:30PM",
        status: " Failed",
      },
      {
        id: 6,
        name: "Navya C",
        questionsAttempted: 8,
        duration: "45m",
        date: "20-10-2025 10:30PM",
        status: "Passed",
      },
    ];

    // Mock data for questions
    const mockQuestions: Question[] = [
      {
        id: 1,
        question: "What is TypeScript?",
        options: ["A language", "A library", "A framework"],
      },
      {
        id: 2,
        question: "What is React?",
        options: ["A library", "A language", "A framework"],
      },
    ];

    // Setting state with mock data
    setStudents(mockStudents);
    setQuestions(mockQuestions);
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
            Name of Test - Evaluation
          </Link>
        </div>
        <div className="test_paperWrapp">
          <div className="Test_left">
            <div className="head_bx">
              <div className="ListFilter">
                <h3>List of Students</h3>
                <p>
                  Total: <span>36</span>
                </p>
              </div>
              <div className="filter_bx">
                <p>Search:</p>
                <div className="grp_search">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="table_test">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>No.</th>
                    <th>Name</th>
                    <th>
                      Attempted <br />
                      Questions
                    </th>
                    <th>Duration</th>
                    <th>
                      Date <br />
                      /Time
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>
                        <div className="Courses_checkbx">
                          <label htmlFor={`${student.id}`}>
                            <input
                              type="checkbox"
                              name="Courses"
                              id={`${student.id}`}
                            />
                            <span></span>
                          </label>
                        </div>
                      </td>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.questionsAttempted}</td>
                      <td>{student.duration}</td>
                      <td>{student.date}</td>
                      <td>
                        {student.status}{" "}
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
                  ))}
                </tbody>
              </table>
              <button className="btnExport">Export as CSV</button>
            </div>
          </div>
          <div className="test_right">
            <div className="header_top">
              <div className="hd_title">
                <p>
                  Name of the Student:<span>Vivek</span>
                </p>
                <p>
                  Status:<span style={{ color: "#db4b4b" }}>Failed</span>
                </p>
              </div>
              <div className="mark_bx">
                <div className="mrk_grp">
                  <label>Total Marks:</label>
                  <input type="text" placeholder="2" />
                </div>
                <div className="mrk_grp">
                  <label>Total Marks Obtain:</label>
                  <input type="text" placeholder="2" />
                </div>
              </div>
              <button className="nextbtn">Next</button>
            </div>
            <div className="Ques_list_Wrapp">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="crd_quest">
                  <div className="questionWrapp">
                    <h3>Question</h3>
                    <div className="Qst_name">{question.question}</div>
                  </div>
                  <div className="option_qust">
                    <h3>Answers</h3>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option">
                        <div className="radio_bx">
                          <input
                            type="radio"
                            id={`question-${questionIndex}-option-${optionIndex}`}
                            name={`question-${questionIndex}`}
                          />
                          <label
                            htmlFor={`question-${questionIndex}-option-${optionIndex}`}
                          >
                            {option}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="from-grp bottm-top">
                <p>Teacher’s Evaluation</p>
                <textarea
                  name="link"
                  style={{ height: "110px" }}
                  className="form-control"
                  placeholder="Evaluation And Remarks  "
                ></textarea>
                <div className="btn_grp">
                  <button
                    className="btn"
                    onClick={() => setShoDraftModal(true)}
                  >
                    Add Re-Attempt
                  </button>
                  <button className="btn">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showDraftModal}
        centered
        onHide={() => setShoDraftModal(false)}
        dialogClassName="modalfullCustom modalSM modalSucss"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="fund_draft">
            <h3>Certificate Generate successfully </h3>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TestProfileEvaluationFailedPage;
