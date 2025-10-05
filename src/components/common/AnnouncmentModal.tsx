import React, { memo, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { GenericItems } from "../../types";
import { useCrud } from "../../hooks/useCrud";
import { useEscToClose } from "../../hooks/useEscToClose";
interface AnnouncementModalProps {
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
  title: "",
  description: "",
  category: {},
  course: {},
};
const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
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

  const { data: courseList = [], refetch } = useFetch(
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
          (item) => item.value === list?.course_category
        );
        setForm({
          title: list?.title || "",
          description: list?.description || "",
          category: selectedCategory || {},
          course: {},
        });
      } else {
        setForm(defaultForms);
      }
    }
  }, [showMainModal, list, setForm]);
  useEffect(() => {
    if (showMainModal && form.category?.id) {
      refetch().then((res: any) => {
        const courses = res?.data?.results || [];

        if (list?.course_title) {
          const filteredCourse = courses.find(
            (course: any) =>
              course.title?.toLowerCase() === list.course_title?.toLowerCase()
          );

          setForm((prev) => ({
            ...prev,
            course: filteredCourse || {},
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            course: {},
          }));
        }
      });
    }
  }, [showMainModal, form.category?.id]);
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
          <h3>Make an announcement</h3>
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
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            width="24"
                            height="24"
                            transform="matrix(0 -1 1 0 0 24)"
                            fill="white"
                            fill-opacity="0.01"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M10.2929 15.7079C10.4818 15.8947 10.7368 15.9995 11.0024 15.9995C11.2681 15.9995 11.523 15.8947 11.7119 15.7079L14.6769 12.7689C14.8919 12.5509 14.9989 12.2689 14.9989 11.9899C14.9989 11.7109 14.8919 11.4339 14.6769 11.2209L11.7219 8.29093C11.5329 8.10437 11.278 7.99976 11.0124 7.99976C10.7469 7.99976 10.492 8.10437 10.3029 8.29093C10.2098 8.38276 10.1358 8.4922 10.0853 8.61289C10.0347 8.73358 10.0087 8.8631 10.0087 8.99393C10.0087 9.12476 10.0347 9.25429 10.0853 9.37497C10.1358 9.49566 10.2098 9.6051 10.3029 9.69693L12.6199 11.9949L10.2929 14.3019C10.2001 14.394 10.1264 14.5035 10.0762 14.6241C10.0259 14.7448 10 14.8742 10 15.0049C10 15.1356 10.0259 15.2651 10.0762 15.3857C10.1264 15.5064 10.2001 15.6159 10.2929 15.7079Z"
                            fill="black"
                          />
                        </svg>
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
              <>
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
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                width="24"
                                height="24"
                                transform="matrix(0 -1 1 0 0 24)"
                                fill="white"
                                fill-opacity="0.01"
                              />
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M10.2929 15.7079C10.4818 15.8947 10.7368 15.9995 11.0024 15.9995C11.2681 15.9995 11.523 15.8947 11.7119 15.7079L14.6769 12.7689C14.8919 12.5509 14.9989 12.2689 14.9989 11.9899C14.9989 11.7109 14.8919 11.4339 14.6769 11.2209L11.7219 8.29093C11.5329 8.10437 11.278 7.99976 11.0124 7.99976C10.7469 7.99976 10.492 8.10437 10.3029 8.29093C10.2098 8.38276 10.1358 8.4922 10.0853 8.61289C10.0347 8.73358 10.0087 8.8631 10.0087 8.99393C10.0087 9.12476 10.0347 9.25429 10.0853 9.37497C10.1358 9.49566 10.2098 9.6051 10.3029 9.69693L12.6199 11.9949L10.2929 14.3019C10.2001 14.394 10.1264 14.5035 10.0762 14.6241C10.0259 14.7448 10 14.8742 10 15.0049C10 15.1356 10.0259 15.2651 10.0762 15.3857C10.1264 15.5064 10.2001 15.6159 10.2929 15.7079Z"
                                fill="black"
                              />
                            </svg>
                          </span>
                        </button>
                        {showCourseDropdown && (
                          <ul className="FiltersdropDownCategory">
                            {courseList?.results.map((item: any) => (
                              <li
                                key={item?.id}
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    course: item,
                                  }));
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
              </>
            )}
          </div>
          <div className="row">
            {Object.keys(form?.category).length > 0 && (
              <>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form["title"]}
                      disabled={
                        !(
                          Object.keys(form?.category).length > 0 &&
                          Object.keys(form?.course).length > 0
                        )
                      }
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form["description"]}
                      disabled={
                        !(
                          Object.keys(form?.category).length > 0 &&
                          Object.keys(form?.course).length > 0
                        )
                      }
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
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
                    !isFieldsEmpty(["title", "description", "category"])
                  }
                  onClick={() => {
                    setIsSubmitting(true);
                    onSubmit(
                      list
                        ? {
                            body: {
                              title: form?.title,
                              message: form?.course?.title,
                              description: form?.description,
                              course: form?.course?.id,
                            },
                          }
                        : {
                            title: form?.title,
                            message: form?.course?.title,
                            description: form?.description,
                            course: form?.course?.id,
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

export default memo(AnnouncementModal);
