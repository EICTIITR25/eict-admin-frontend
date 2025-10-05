import { Link, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useMemo } from "react";
import assets from "../../../assets";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../../hooks/useCrud";
import moment from "moment";
import {
  getErrorMessage,
  handleNavigationLinks,
  returnCategoryById,
} from "../../../utils/helper";
import { useDispatch } from "react-redux";
import {
  setCourses,
  setSelectedCourse,
} from "../../../redux/slices/coursesSlice";
import { GenericItems } from "../../../types";
import { toast } from "react-toastify";

const AllCoursesPage = () => {
  const categoryList = [
    { id: 0, value: "All" },
    { id: 1, value: "Self Paced" },
    { id: 2, value: "FDP" },
    { id: 3, value: "PG Certification" },
    { id: 5, value: "Short Term Training" },
    { id: 6, value: "EICT-Third Party" },
  ];
  const dispatch = useDispatch();
  const { useFetch, useCreate } = useCrud();

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTypes, setSelectedTypes] = useState<GenericItems | null>(null);
  const [showMainModal, setShowMainModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();
  const [disableId, setDisableId] = useState(null);
  const [courseType, setCourseType] = useState<string>();
  const [isDisable, setIsDisable] = useState<boolean>(false);

  const { data: allCourseList = [] } = useFetch("/courses/courses-list/", {
    page: currentPage,
    page_size: pageSize,
    category: selectedTypes?.id === 0 ? "" : selectedTypes?.id,
    search: searchTerm,
    is_active: isActive,
  });

  const { data: courseListById = {} } = useFetch(
    selectedId ? `/courses/${courseType}/${selectedId}/` : "",
    {},
    {
      enabled: !!selectedId,
      retry: false,
    }
  );

  const { mutate: updateStatus } = useCreate(
    `/courses/toggle-status/${disableId}/`,
    ["/courses/courses-list/", "{}"],
    {
      onSuccess: () => {
        toast.success("Updated Successfully.");
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const handleGetById = (id: any, category_id: number) => {
    const categoryName = returnCategoryById(category_id);
    setCourseType(categoryName);
    setSelectedId(id);
  };

  const handleCheckboxChange = (type: any) => {
    if (type?.id === 0) {
      setSelectedTypes(type);
    } else {
      setSelectedTypes((prev) => (prev === type ? null : type));
    }
  };

  const totalItems = allCourseList?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  let pagesToDisplay: (number | string)[] = [];
  if (totalPages <= 5) {
    pagesToDisplay = pageNumbers;
  } else {
    if (currentPage <= 3) {
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
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
  }
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Select Category");
  const filters = [
    "Self Paced",
    "FDP",
    "Short Term Training",
    {
      label: "PG Certification",
      children: ["Advance PG Course", "EICT-Thirt Party"],
    },
  ];
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    setShowCourseDropdown(false);
    dispatch(setSelectedCourse(null));
  };

  const handleNavigation = () => {
    if (selectedFilter === "Self Paced") {
      navigate("/course/self-paced");
    } else if (selectedFilter === "FDP") {
      navigate("/course/fdp");
    } else if (selectedFilter === "Advance PG Course") {
      navigate("/course/advance-pg-course");
    } else if (selectedFilter === "Short Term Training") {
      navigate("/course/short-term-training");
    } else if (selectedFilter === "EICT-Thirt Party") {
      navigate("/course-management/add-courses");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue); // actual search term update after delay
    }, 1000); // 1000ms = 1 sec

    return () => {
      clearTimeout(handler); // cleanup on every new keystroke
    };
  }, [inputValue]);

  useEffect(() => {
    if (courseListById && Object.keys(courseListById).length > 0) {
      dispatch(setSelectedCourse(courseListById));
      const navigationLink: any = handleNavigationLinks(courseType);
      navigate(navigationLink);
    }
  }, [courseListById, dispatch, courseType, navigate, selectedId]);

  useEffect(() => {
    if (disableId !== null) {
      updateStatus({
        is_active: !isDisable, // true if checked, false if unchecked
      });
      setIsDisable(false); // reset
      setDisableId(null);
    }
  }, [isDisable, disableId]);
  // useEffect(() => {
  //   if (error) {
  //     toast.error("Failed to load");
  //   }
  // }, [error]);

  // useEffect(() => {
  //   if (allCourseList) {
  //     dispatch(setCourses(allCourseList));
  //   }
  // }, [allCourseList, dispatch]);

  return (
    <>
      <div>
        <div className="Breadcrumbs">
          <h3>All Courses</h3>
          <div className="btn_grp">
            <button className="btn" onClick={() => setShowMainModal(true)}>
              Create Course
            </button>
          </div>
        </div>

        <div className="filterTest AllCoursesWrappFilter">
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
          <div className="testRight_bx">
            <div className="Courses_checkbx">
              {categoryList.map((type: GenericItems) => (
                <label key={type?.id} htmlFor={type?.id}>
                  <input
                    type="checkbox"
                    id={type?.id}
                    checked={selectedTypes?.id === type?.id}
                    onChange={() => handleCheckboxChange(type)}
                  />
                  <span>{type?.value}</span>
                </label>
              ))}
              <label key="isDisable">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <span>Disabled</span>
              </label>
            </div>
            <div className="filter_bx">
              <p>Search:</p>
              <div className="grp_search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="AllCoursesWrapp">
        {allCourseList?.results?.length > 0 ? (
          allCourseList?.results?.map((course: any) => (
            <div className="Card_Course" key={course.id}>
              <div className="img_bx">
                <img src={course.cover_media} alt={course.category_name} />
                <span className="NameTitle">{course.category_name}</span>
              </div>
              <div className="content_bx">
                <h4>
                  {moment(course.start_date).format("MMMM D, YYYY")} to{" "}
                  {moment(course.application_deadline).format("MMMM D, YYYY")}
                </h4>
                <h3>{course.title}</h3>
                <h4>{course.sales_price}</h4>
                <div className="Courses_checkbx">
                  <label htmlFor={`DisableCourse_${course.id}`}>
                    <input
                      type="checkbox"
                      checked={course.is_active ? false : true}
                      id={`DisableCourse_${course.id}`}
                      onChange={(e) => {
                        setDisableId(course.id);
                        setIsDisable(e.target.checked);
                      }}
                    />
                    <span>Disable Course</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => handleGetById(course?.id, course?.category_id)}
                // to={`/course${course.link}`}
                className="btn"
              >
                Edit Course{" "}
                <span>
                  <svg
                    width="19"
                    height="15"
                    viewBox="0 0 19 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.4478 0.50283C10.3541 0.595793 10.2797 0.706394 10.2289 0.828253C10.1782 0.950112 10.152 1.08082 10.152 1.21283C10.152 1.34484 10.1782 1.47555 10.2289 1.59741C10.2797 1.71927 10.3541 1.82987 10.4478 1.92283L15.0478 6.52283H1.50781C1.2426 6.52283 0.988242 6.62819 0.800706 6.81572C0.61317 7.00326 0.507812 7.25761 0.507812 7.52283C0.507812 7.78805 0.61317 8.0424 0.800706 8.22994C0.988242 8.41747 1.2426 8.52283 1.50781 8.52283H15.0278L10.4478 13.0928C10.2616 13.2802 10.157 13.5336 10.157 13.7978C10.157 14.062 10.2616 14.3155 10.4478 14.5028C10.6352 14.6891 10.8886 14.7936 11.1528 14.7936C11.417 14.7936 11.6705 14.6891 11.8578 14.5028L18.2178 8.14283C18.3034 8.0607 18.3715 7.96211 18.4181 7.85299C18.4646 7.74386 18.4886 7.62646 18.4886 7.50783C18.4886 7.3892 18.4646 7.2718 18.4181 7.16267C18.3715 7.05355 18.3034 6.95496 18.2178 6.87283L11.8678 0.50283C11.7748 0.409101 11.6642 0.334707 11.5424 0.283938C11.4205 0.23317 11.2898 0.207031 11.1578 0.207031C11.0258 0.207031 10.8951 0.23317 10.7732 0.283938C10.6514 0.334707 10.5408 0.409101 10.4478 0.50283Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </button>
            </div>
          ))
        ) : (
          <h3>Data not Found</h3>
        )}
      </div>
      <div
        className="Faculty_table"
        style={{ padding: "0", background: "transparent", boxShadow: "none" }}
      >
        <div className="pagination">
          <div className="items">
            {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="pagenationRight">
            <button
              className="btn btnno"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                  d="M6.00016 2.00117C6.25603 2.00117 6.51203 2.09883 6.70703 2.29414C7.09766 2.68477 7.09766 3.31758 6.70703 3.7082L2.41266 8.00117L6.70703 12.2949C7.09766 12.6855 7.09766 13.3184 6.70703 13.709C6.31641 14.0996 5.68359 14.0996 5.29297 13.709L0.292969 8.70898C-0.0976563 8.31836 -0.0976563 7.68555 0.292969 7.29492L5.29297 2.29492C5.48828 2.09805 5.74422 2.00117 6.00016 2.00117Z"
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
                  onClick={() => setCurrentPage(Number(page))}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="btn btnno"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
      <Modal
        show={showMainModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Choose Course Category</h3>
          </div>
          <div className="fromSection" style={{ minHeight: "250px" }}>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <label htmlFor="">Category</label>
                <div
                  className="CategoryWrappFilter ChooseCategory"
                  ref={dropdownRef}
                >
                  <button
                    type="button"
                    className="CategoryBtn"
                    onClick={() => setShowCourseDropdown((prev) => !prev)}
                  >
                    {selectedFilter}
                    <span
                      className={`arrow ${showCourseDropdown ? "show" : ""}`}
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
                      {filters.map((filter) =>
                        typeof filter === "string" ? (
                          <li
                            key={filter}
                            onClick={() => handleFilterClick(filter)}
                          >
                            <label>
                              <span>{filter}</span>
                            </label>
                          </li>
                        ) : (
                          <li key={filter.label} className="has-children">
                            <label>
                              <span>{filter.label}</span>
                            </label>
                            <ul className="child-dropdown">
                              {filter.children.map((child) => (
                                <li
                                  key={child}
                                  onClick={() => handleFilterClick(child)}
                                >
                                  <label>
                                    <span>{child}</span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp">
                  <button
                    className="btn"
                    style={{ background: "#1e3a8a", color: "#fff" }}
                    onClick={handleNavigation}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn"
                    onClick={() => setShowMainModal(false)}
                    style={{ background: "#e5e5e5", color: "#000" }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AllCoursesPage;
