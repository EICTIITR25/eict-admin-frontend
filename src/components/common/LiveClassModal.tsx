import React, { memo, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { GenericItems } from "../../types";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";
import { useEscToClose } from "../../hooks/useEscToClose";
import { convertTo24HourFormat } from "../../utils/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface LiveClassModalProps {
  list: GenericItems | null;
  showMainModal: boolean;
  setShowMainModal: (show: boolean) => void;
  onSubmit: (data: GenericItems) => void;
  isSubmitting: boolean;
  setIsSubmitting: (show: boolean) => void;
}

const categoryDropDownList = [
  { id: 1, value: "Self Paced" },
  { id: 2, value: "FDP" },
  { id: 3, value: "PG Certification" },
  { id: 5, value: "Short Term Training" },
  { id: 6, value: "EICT-Third Party" },
];

const defaultForms = {
  startTime: "",
  endTime: "",
  link: "",
  date: "",
  className: "",
  category: {},
  course: {},
};

const LiveClassModal: React.FC<LiveClassModalProps> = ({
  showMainModal,
  setShowMainModal,
  list,
  onSubmit,
  isSubmitting,
  setIsSubmitting,
}) => {
  useEscToClose(showMainModal, () => setShowMainModal(false));
  const { useFetch } = useCrud();
  const categoryDropdownRef = useRef(null);
  const courseListDropdownRef = useRef(null);
  const { form, setForm, handleChange, isFieldsEmpty } =
    useDynamicForm(defaultForms);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  const { data: courseList = [] } = useFetch(
    `/courses/courses-list/?page=1&page_size=1000&category=${form.category?.id}`,
    {},
    {
      enabled: !!form.category?.id,
      retry: false,
    }
  );

  useEffect(() => {
    if (showMainModal) {
      if (list) {
        const selectedCategory = categoryDropDownList?.find(
          (item) => item.value === list?.course_category_name
        );
        setForm({
          startTime:
            moment(list?.start_time, "HH:mm:ss").format("hh:mm A") || "",
          endTime: moment(list?.end_time, "HH:mm:ss").format("hh:mm A") || "",
          date: list?.date || "",
          link: list?.meeting_link || "",
          className: list?.title || "",
          category: selectedCategory || {},
          course: {},
        });
      } else {
        setForm(defaultForms);
      }
    }
  }, [showMainModal, list, setForm]);

  useEffect(() => {
    if (courseList?.results && list?.course_name) {
      const selectedCourse = courseList.results.find(
        (course: any) => course.title === list.course_name
      );
      if (selectedCourse) {
        setForm((prev) => ({
          ...prev,
          course: selectedCourse,
        }));
      }
    }
  }, [courseList, list?.course_title]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !(categoryDropdownRef.current as any).contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        courseListDropdownRef.current &&
        !(courseListDropdownRef.current as any).contains(event.target as Node)
      ) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Modal
      show={showMainModal}
      centered
      dialogClassName="modalfullCustom modalSM modalMd"
      aria-labelledby="example-custom-modal-styling-title"
    >
      <Modal.Body>
        <div className="headerModal">
          <h3>Start A Live Class</h3>
        </div>
        <div className="fromSection">
          <div className="row">
            <div className="col-lg-6 col-md-12">
              <div className="Certificate_filter">
                <div className="form-group mb-3" style={{ padding: "0" }}>
                  <label htmlFor="courseName">Category</label>
                  <div
                    className="CategoryWrappFilter"
                    ref={categoryDropdownRef}
                  >
                    <button
                      type="button"
                      className="CategoryBtn"
                      onClick={() => setShowCategoryDropdown((prev) => !prev)}
                    >
                      {form?.category?.value}
                      <span
                        className={`arrow ${
                          showCategoryDropdown ? "show" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {showCategoryDropdown && (
                      <ul className="FiltersdropDownCategory">
                        {categoryDropDownList?.map((item: any) => (
                          <li
                            key={item?.id}
                            onClick={() => {
                              setForm((prev) => ({ ...prev, category: item }));
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <label>
                              <span style={{ fontWeight: "bold" }}>
                                {item?.value}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {Object.keys(form?.category).length > 0 && (
              <div className="col-lg-12 col-md-12">
                <div className="Certificate_filter">
                  <div className="form-group mb-3" style={{ padding: "0" }}>
                    <label htmlFor="courseName">Course List</label>
                    <div
                      className="CategoryWrappFilter"
                      ref={courseListDropdownRef}
                    >
                      <button
                        type="button"
                        className="CategoryBtn"
                        onClick={() => setShowCourseDropdown((prev) => !prev)}
                      >
                        {form.course?.title}
                        <span
                          className={`arrow ${
                            showCourseDropdown ? "show" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                      {showCourseDropdown && (
                        <ul className="FiltersdropDownCategory">
                          {courseList?.results.map((item: any) => (
                            <li
                              key={item?.id}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, course: item }));
                                setShowCourseDropdown(false);
                              }}
                            >
                              <label>
                                <span>{item?.title}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row">
            {Object.keys(form?.category).length > 0 && (
              <>
                <div className="col-lg-12">
                  <div className="from-group mb-3">
                    <label>Class Name</label>
                    <input
                      type="text"
                      name="className"
                      className="form-control"
                      placeholder="Enter"
                      disabled={
                        !(
                          Object.keys(form?.category).length > 0 &&
                          Object.keys(form?.course).length > 0
                        )
                      }
                      value={form.className}
                      onChange={(e) =>
                        handleChange("className", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Start Time */}
                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3">
                    <label>Start Time</label>
                    <DatePicker
                      selected={
                        form.startTime
                          ? new Date(
                              `1970-01-01T${moment(
                                form.startTime,
                                "hh:mm A"
                              ).format("HH:mm:ss")}`
                            )
                          : null
                      }
                      onChange={(date: Date | null) =>
                        handleChange(
                          "startTime",
                          date ? moment(date).format("hh:mm A") : ""
                        )
                      }
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="hh:mm aa"
                      placeholderText="Select Start Time"
                      className="form-control"
                      disabled={
                        !(
                          Object.keys(form?.category).length > 0 &&
                          Object.keys(form?.course).length > 0
                        )
                      }
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3">
                    <label>End Time</label>
                    <DatePicker
                      selected={
                        form.endTime
                          ? new Date(
                              `1970-01-01T${moment(
                                form.endTime,
                                "hh:mm A"
                              ).format("HH:mm:ss")}`
                            )
                          : null
                      }
                      onChange={(date: Date | null) =>
                        handleChange(
                          "endTime",
                          date ? moment(date).format("hh:mm A") : ""
                        )
                      }
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="hh:mm aa"
                      placeholderText="Select End Time"
                      className="form-control"
                      disabled={!form.startTime}
                      minTime={
                        form.startTime
                          ? new Date(
                              `1970-01-01T${moment(
                                form.startTime,
                                "hh:mm A"
                              ).format("HH:mm:ss")}`
                            )
                          : undefined
                      }
                      maxTime={new Date("1970-01-01T23:59:00")}
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3">
                    <label>Date</label>
                    <DatePicker
                      selected={form.date ? new Date(form.date) : null}
                      onChange={(date: Date | null) =>
                        handleChange(
                          "date",
                          date ? moment(date).format("YYYY-MM-DD") : ""
                        )
                      }
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      className="form-control"
                      disabled={
                        !(
                          Object.keys(form?.category).length > 0 &&
                          Object.keys(form?.course).length > 0
                        )
                      }
                      minDate={new Date()}
                    />
                  </div>
                </div>

                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Link</label>
                    <input
                      type="text"
                      disabled={
                        !(
                          Object.keys(form?.category).length > 0 &&
                          Object.keys(form?.course).length > 0
                        )
                      }
                      className="form-control"
                      placeholder="Enter"
                      value={form.link}
                      onChange={(e) => handleChange("link", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="col-lg-12">
              <div className="btn_grp btnRight_grp">
                <button
                  className="btn"
                  onClick={() => {
                    setShowMainModal(false);
                  }}
                >
                  Close
                </button>
                <button
                  className="btn"
                  disabled={
                    isSubmitting ||
                    !isFieldsEmpty([
                      "startTime",
                      "endTime",
                      "date",
                      "link",
                      "className",
                    ])
                  }
                  onClick={() => {
                    setIsSubmitting(true);
                    onSubmit(
                      list
                        ? {
                            body: {
                              title: form?.className,
                              date: form?.date,
                              start_time: moment(
                                form?.startTime,
                                "hh:mm A"
                              ).format("HH:mm:ss"),
                              end_time: moment(form?.endTime, "hh:mm A").format(
                                "HH:mm:ss"
                              ),
                              course: form?.course?.id,
                              meeting_link: form?.link,
                              category: form?.category?.id,
                            },
                          }
                        : {
                            title: form?.className,
                            date: form?.date,
                            start_time: moment(
                              form?.startTime,
                              "hh:mm A"
                            ).format("HH:mm:ss"),
                            end_time: moment(form?.endTime, "hh:mm A").format(
                              "HH:mm:ss"
                            ),
                            course: form?.course?.id,
                            meeting_link: form?.link,
                            category: form?.category?.id,
                          }
                    );
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default memo(LiveClassModal);
