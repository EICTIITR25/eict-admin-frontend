import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import PaginatedTable from "../../components/common/PaginatedTableModal";
import { GenericItems } from "../../types";
import moment from "moment";
import { useCrud } from "../../hooks/useCrud";
import { setSelectedCourse } from "../../redux/slices/coursesSlice";
import { useDispatch } from "react-redux";
import ShowDeleteModal from "../../components/common/ShowDeleteModal";
import { getErrorMessage } from "../../utils/helper";

const PastCourseManagementPage = () => {
  const navigate = useNavigate();
  const { useFetch, useDelete } = useCrud();
  const dispatch = useDispatch();
  //   const [show, setShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<GenericItems[]>([]);
  console.log("courses :", courses.length);
  const [inputValue, setInputValue] = useState("");

  //   const filteredCourses = coursesData.filter((course) =>
  //     course.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  const { mutate: deletePastCourse } = useDelete(
    "/courses/past-courses/",
    ["/courses/past-courses/", "{}"],
    {
      onSuccess: () => {
        setCourses([]);
        setShowDeleteModal(false);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { data: pastCourseList = [] } = useFetch(
    "/courses/past-courses/",
    {
      page: 1,
      search: searchTerm,
      page_size: pageSize,
    },
    { retry: false }
  );

  const handlePagination = (action: string) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
  };

  const totalItems = pastCourseList?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  let pagesToDisplay = [];
  if (totalPages <= 5) {
    pagesToDisplay = pageNumbers; // Show all pages if less than 5
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
      pagesToDisplay = [1, 2, 3, "...", totalPages];
    }
  }
  const toggleSelection = (id: number) => {
    // setCourses((prev) =>
    //   prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    // );
  };
  //   const handleClose = () => setShow(false);
  //   const handleShow = () => setShow(true);

  const handleDelete = () => {
    const cousrseIds = courses?.map((item) => item.id);
    deletePastCourse({
      body: {
        ids: cousrseIds,
      },
    });
  };
  const [showMainModal, setShowMainModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showUploadvModal, setShowUploadvModal] = useState(false);

  const columns = [
    {
      key: "id",
      label: "",
      render: (row: GenericItems) => (
        <input
          type="checkbox"
          value={row?.id}
          onChange={() => {
            const isSelected = courses.some(
              (course: any) => course?.id === row.id
            );

            const updatedCourses: GenericItems[] = isSelected
              ? courses.filter((course: any) => course.id !== row.id) // remove
              : [...courses, row]; // add full row
            setCourses(updatedCourses);
          }}
        />
      ),
    },
    { key: "sno", label: "S.NO" },
    { key: "name", label: "Name of Course" },
    { key: "mode", label: "Mode" },
    { key: "phase", label: "Phase" },
    {
      key: "start_date",
      label: "Start Date",
      render: (row: GenericItems) => (
        <span>{moment(row.start_date).format("DD-MMM,YYYY")}</span>
      ),
    },
    {
      key: "end_date",
      label: "End Date",
      render: (row: GenericItems) => (
        <span>{moment(row.end_date).format("DD-MMM,YYYY")}</span>
      ),
    },
    { key: "category", label: "Course Category" },
    { key: "no_of_participants", label: "Participation" },
    { key: "venue", label: "Venue" },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue); // actual search term update after delay
    }, 500); // 1000ms = 1 sec

    return () => {
      clearTimeout(handler); // cleanup on every new keystroke
    };
  }, [inputValue]);

  useEffect(() => {
    if (courses.length === 1) {
      const data: any = courses[0];
      dispatch(setSelectedCourse(data));
    }
  }, [courses]);
  return (
    <>
      <div className="admin_panel">
        <div className="Breadcrumbs">
          <h3>All Past Course</h3>
          <button
            className="btn"
            onClick={() => navigate("/past-course-management/add-past-course")}
          >
            {" "}
            Add New Past Course{" "}
          </button>
        </div>

        <div className="filter_bx">
          <div className="grp_search">
            <input
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            <span className="icon">
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.6562 19.3345C16.0745 19.3345 19.6562 15.7528 19.6562 11.3345C19.6562 6.91619 16.0745 3.33447 11.6562 3.33447C7.23797 3.33447 3.65625 6.91619 3.65625 11.3345C3.65625 15.7528 7.23797 19.3345 11.6562 19.3345Z"
                  stroke="#B0B0B0"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M21.6547 21.3344L17.3047 16.9844"
                  stroke="#B0B0B0"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="btnRight">
            <Link
              to={"/past-course-management/edit-past-course"}
              className="btnEdit"
            >
              <button
                style={{
                  borderRadius: "3px",
                  padding: "6px 20px",
                  height: "33px",
                  background: "#1e3a8a",
                  color: "#fff",
                  fontWeight: "400",
                  fontSize: "13px",
                }}
                className="btn"
                disabled={!(courses?.length === 1)}
              >
                Edit
              </button>
            </Link>
            <button
              className="btnDelte"
              disabled={!(courses?.length !== 0)}
              onClick={() => setShowDeleteModal(true)}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.0957 9.51826C13.2592 9.20063 13.5955 9 13.9621 9H17.6094C17.9759 9 18.3122 9.20063 18.4758 9.51826L18.6939 9.9375H21.602C22.1382 9.9375 22.5714 10.3573 22.5714 10.875C22.5714 11.3927 22.1382 11.8125 21.602 11.8125H9.96939C9.4341 11.8125 9 11.3927 9 10.875C9 10.3573 9.4341 9.9375 9.96939 9.9375H12.8776L13.0957 9.51826ZM9.94212 12.75H21.602V22.125C21.602 23.1592 20.7326 24 19.6633 24H11.8809C10.8373 24 9.94212 23.1592 9.94212 22.125V12.75ZM12.3656 15.0938V21.6562C12.3656 21.9141 12.611 22.125 12.8503 22.125C13.1441 22.125 13.335 21.9141 13.335 21.6562V15.0938C13.335 14.8359 13.1441 14.625 12.8503 14.625C12.611 14.625 12.3656 14.8359 12.3656 15.0938ZM15.2738 15.0938V21.6562C15.2738 21.9141 15.5191 22.125 15.7585 22.125C16.0523 22.125 16.2704 21.9141 16.2704 21.6562V15.0938C16.2704 14.8359 16.0523 14.625 15.7585 14.625C15.5191 14.625 15.2738 14.8359 15.2738 15.0938ZM18.2092 15.0938V21.6562C18.2092 21.9141 18.4273 22.125 18.6939 22.125C18.9605 22.125 19.1786 21.9141 19.1786 21.6562V15.0938C19.1786 14.8359 18.9605 14.625 18.6939 14.625C18.4273 14.625 18.2092 14.8359 18.2092 15.0938Z"
                  fill="#344563"
                />
              </svg>
            </button>
          </div>
        </div>

        <PaginatedTable<GenericItems>
          columns={columns}
          data={pastCourseList?.results || []}
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={totalItems}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          pagesToDisplay={pagesToDisplay}
          handlePagination={handlePagination}
        />
      </div>
      {/* <Modal
        show={showCsvModal}
        centered
        dialogClassName="modal-90w modalfullCustom"
        aria-labelledby="csv-import-modal"
      >
        <Modal.Body>
          <div className="tableData">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>S.NO</th>
                  <th>NAME OF THE COURSE</th>
                  <th>MODE</th>
                  <th>START DATE</th>
                  <th>END DATE</th>
                  <th>
                    COURSE <br /> CATEGORY
                  </th>
                  <th>VENUE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={courses.includes(course.id)}
                        onChange={() => toggleSelection(course.id)}
                      />
                    </td>
                    <td>{course.id}</td>
                    <td>{course.name}</td>
                    <td>{course.mode}</td>
                    <td>{course.startDate}</td>
                    <td>{course.endDate}</td>
                    <td>{course.category}</td>
                    <td>{course.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <div className="items">
              <p>Items per page</p>
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
              <p>
                {startIndex + 1} - {endIndex} of {totalItems} entries
              </p>
            </div>

            <div className="pagenationRight">
              <button
                className="btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faAnglesLeft} /> First
              </button>
              <button
                className="btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faAngleLeft} /> Back
              </button>
              <span className="currentPage btn btnno"> {currentPage}</span>
              <button
                className="btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next <FontAwesomeIcon icon={faAngleRight} />
              </button>
              <button
                className="btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last <FontAwesomeIcon icon={faAnglesRight} />
              </button>
            </div>
          </div>
          <div className="btn_grp">
            <button
              type="submit"
              className="btn"
              onClick={() => {
                setShowCsvModal(false);
                setShowUploadvModal(true);
              }}
            >
              Submit
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowCsvModal(false);
                setShowMainModal(true);
              }}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal> */}

      <Modal
        show={showUploadvModal}
        centered
        onHide={() => setShowUploadvModal(false)}
        dialogClassName="modalfullCustom modalSM"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="Uploadcourses">
            <h3 style={{ fontSize: "23px", fontWeight: "700" }}>
              {" "}
              You have upload 7 courses successfully
            </h3>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showMainModal}
        centered
        onHide={() => setShowMainModal(false)}
        dialogClassName="modalfullCustom modalSM"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Add New Past Course Via</h3>
          </div>

          <div className="btnPastCourse">
            <Link to="/past-course-management/add-past-course" className="btn">
              Mannual Entry
            </Link>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setShowMainModal(false);
                setShowCsvModal(true);
              }}
            >
              Import Via CSV
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <ShowDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        onSubmit={handleDelete}
        title={"Do you want to delete past course"}
      />
    </>
  );
};

export default PastCourseManagementPage;
