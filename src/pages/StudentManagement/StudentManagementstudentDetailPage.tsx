import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import assets from "../../assets";
import { Modal, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useCrud } from "../../hooks/useCrud";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { getErrorMessage } from "../../utils/helper";
import { useEscToClose } from "../../hooks/useEscToClose";
import moment from "moment";
import { toast } from "react-toastify";

const defaultForms = {
  category: "",
  course: "",
};
const StudentManagementstudentDetailPage = () => {
  const { form, setForm, isFieldsEmpty } = useDynamicForm(defaultForms);
  const { useFetch, useDelete, useCreate } = useCrud();
  const [deleteId, setDeleteId] = useState();
  const { id } = useParams();
  const { data: enrolled = [] } = useFetch(
    `/students/students/${id}/enrollments/`,
    {},
    {
      retry: false,
    }
  );
  const { data: courseList = [] } = useFetch(
    `/courses/courses-list/?page=1&page_size=1000&category=${form.category}`,
    {},
    {
      enabled: !!form.category,
      retry: false,
    }
  );
  const { mutate: addCourse } = useCreate(
    `/students/students/${id}/enrollments/add`,
    ["{}", `/students/students/${id}/enrollments/`],
    {
      onSuccess: () => {
        setShowCsvModal(false);
        setShowUploadvModal(true);
        setForm(defaultForms);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: deleteCourse } = useDelete(
    `/students/enrollments/${deleteId}/delete`,
    ["{}", `/students/students/${id}/enrollments/`],
    {
      onError: (error) => {
        getErrorMessage(error);
      },
      onSuccess: (data) => {
        toast.success(data?.message);
      },
    }
  );

  // const handleDelete = (indexToRemove: number) => {
  //   const updatedCourses = enrolledCourses.filter(
  //     (_, index) => index !== indexToRemove
  //   );
  //   setEnrolledCourses(updatedCourses);
  // };
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showUploadvModal, setShowUploadvModal] = useState(false);
  const categoryDropDownList = [
    { id: 1, value: "Self Paced" },
    { id: 2, value: "FDP" },
    { id: 3, value: "PG Certification" },
    { id: 5, value: "Short Term Training" },
    { id: 6, value: "EICT-Third Party" },
  ];
  useEscToClose(showCsvModal, () => setShowCsvModal(false));
  return (
    <>
      <div className="admin_panel">
        <div className="Breadcrumbs">
          <h3>Student Detail</h3>
        </div>
        <div className="detailsPage _user">
          <div className="userDetails">
            <div className="top_head">
              <div className="user_image">
                <img
                  src={enrolled?.profile_image || assets.images.avatar}
                  alt=""
                />
              </div>
              <h3>{enrolled?.full_name}</h3>
              {/* <Link to="#" className="PurchaseBnt">Download Purchase History</Link> */}
              <ul>
                <li>
                  <span>Date Registered</span>
                  <span>
                    {moment(enrolled?.created_at).format("DD/MM/YYYY")}
                  </span>
                </li>
                <li>
                  <span>Products Enrolled</span>
                  <span>{enrolled?.enrollments_count}</span>
                </li>
              </ul>
            </div>
            <div className="userFullDetails">
              <ul>
                <li>
                  <span>Email</span>
                  <span>{enrolled?.email}</span>
                </li>
                <li>
                  <span>Mobile</span>
                  <span>{enrolled?.mobile}</span>
                </li>
                <li>
                  <span>Address</span>
                  <span>{enrolled?.address}</span>
                </li>
                <li>
                  <span>University</span>
                  <span>{enrolled?.institution_name}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="user_details_table">
            <div className="header_top">
              <h3>Products Enrolled</h3>
              <button className="btn" onClick={() => setShowCsvModal(true)}>
                Add Course
              </button>
            </div>
            <div className="tableDatas">
              <div
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  overflowX: "auto",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "800px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Title
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Category
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Date of Joining
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Completion Date
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Active/Inactive
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Enrollment Type
                      </th>
                      <th
                        style={{
                          padding: "10px 12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {enrolled?.courses?.map((course: any, index: number) => (
                      <tr key={index}>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course.title}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course.category}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {moment(course.enrolled_on).format("DD-MM-YYYY")}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div className={course?.status?.toLowerCase()}>
                            {course.status}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course?.completed_on}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course?.is_active ? "Active" : "Inactive"}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course?.enrollment_type}
                        </td>
                        {
                          course?.is_active && <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #ddd",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteId(course.id);
                                deleteCourse({});
                              }}
                              style={{
                                background: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "5px 10px",
                                cursor: "pointer",
                              }}
                            >
                              🗑
                            </button>
                          </td>
                        }

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showCsvModal}
        centered
        dialogClassName="modalfullCustom modalSM"
        aria-labelledby="csv-import-modal"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Asign user to new course</h3>
          </div>
          <div className="fromSection">
            <div className="from-group">
              <label htmlFor="">Category</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category:
                      e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
              >
                <option value="">Select</option>
                {categoryDropDownList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="from-group">
              <label htmlFor="">Course</label>
              <select
                className="form-control"
                disabled={!form.category}
                value={form.course}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    course: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
              >
                <option value="">Select</option>
                {courseList?.results?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="btn_grp">
              <button
                className="btn"
                disabled={!isFieldsEmpty(["category", "course"])}
                onClick={() => {
                  addCourse({
                    user_id: id,
                    course_id: form.course,
                  });
                }}
              >
                Confirm
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowCsvModal(false);
                  setForm(defaultForms);
                }}
              >
                Back
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showUploadvModal}
        centered
        onHide={() => setShowUploadvModal(false)}
        dialogClassName="modalfullCustom modalSM modalSucss"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="modalSucess">
            <div className="icon">
              {" "}
              <img src={assets.images.sucess} alt="info" />
            </div>
            <h3>New Course has been added!</h3>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StudentManagementstudentDetailPage;
