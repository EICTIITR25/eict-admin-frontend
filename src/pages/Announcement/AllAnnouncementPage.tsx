import { useState, useEffect } from "react";
import assets from "../../assets";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../hooks/useCrud";
import { GenericItems } from "../../types";
import PaginatedTable from "../../components/common/PaginatedTableModal";
import ShowDeleteModal from "../../components/common/ShowDeleteModal";
import { getErrorMessage } from "../../utils/helper";
import AnnouncmentModal from "../../components/common/AnnouncmentModal";
import moment from "moment";
const AllAnnouncementPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { useFetch, useDelete, useCreate, useUpdate } = useCrud();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showUploadvModal, setShowUploadvModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editList, setEditList] = useState<GenericItems | null>(null);

  //GET
  const { data: announcementList = [] } = useFetch(
    "/announcements/",
    {
      page: 1,
      search: searchTerm,
      page_size: pageSize,
    },
    { retry: false }
  );

  //DELETE
  const { mutate: deleteAnnouncement } = useDelete(
    `/announcements/${courseToDelete}/`,
    ["/announcements/", "{}"],
    {
      onSuccess: () => {
        setIsSubmitting(false);
        setCourseToDelete(null);
        setShowDeleteModal(false);
      },
      onError: (error) => {
        setIsSubmitting(false);
        getErrorMessage(error);
      },
    }
  );

  //CREATE
  const { mutate: createAnnouncement } = useCreate(
    "/announcements/",
    ["/announcements/", "{}"],
    {
      onSuccess: () => {
        setIsSubmitting(false);
        setShowMainModal(false);
      },
      onError: (error) => {
        setIsSubmitting(false);
        getErrorMessage(error);
      },
    }
  );

  //UPDATE
  const { mutate: updateAnnouncement } = useUpdate(
    `/announcements/${editList?.id}/`,
    ["/announcements/", "{}"],
    {
      onSuccess: () => {
        setIsSubmitting(false);
        setShowMainModal(false);
      },
      onError: (error) => {
        setIsSubmitting(false);
        getErrorMessage(error);
      },
    }
  );

  const toggleReadMore = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const totalItems = announcementList?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const handlePagination = (action: string) => {
    if (action === "first") setCurrentPage(1);
    else if (action === "prev") setCurrentPage((prev) => Math.max(prev - 1, 1));
    else if (action === "next")
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    else if (action === "last") setCurrentPage(totalPages);
  };

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
  const columns = [
    { key: "sno", label: "S.NO" },
    { key: "title", label: "Title" },
    { key: "course_title", label: "Course Name", style: { width: "20%" } },
    { key: "course_category", label: "Course Category" },
    {
      key: "description",
      label: "Description",
      style: { width: "20%" },
      render: (row: GenericItems) => (
        <>
          {expandedRows.includes(row.id)
            ? row.description
            : row.description.slice(0, 50)}
          <button onClick={() => toggleReadMore(row.id)} className="readmore">
            {expandedRows.includes(row.id) ? "Read Less" : "Read More"}
          </button>
        </>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row: GenericItems) => (
        <p>{moment(row?.created_at).format("DD-MM-YYYY hh:mm A")}</p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      style: { width: "7%" },
      render: (row: GenericItems) => (
        <div className="custom-event">
          <div className="icon-group">
            <button
              onClick={() => {
                setShowMainModal(true);
                setEditList(row);
              }}
              className="btnView"
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
            </button>
            <button
              onClick={() => openDeleteModal(row.id)}
              className="btn-delete"
            >
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.96094 0.518262C4.11914 0.200625 4.44434 0 4.79883 0H8.32617C8.68066 0 9.00586 0.200625 9.16406 0.518262L9.375 0.9375H12.1875C12.7061 0.9375 13.125 1.35732 13.125 1.875C13.125 2.39268 12.7061 2.8125 12.1875 2.8125H0.9375C0.419824 2.8125 0 2.39268 0 1.875C0 1.35732 0.419824 0.9375 0.9375 0.9375H3.75L3.96094 0.518262ZM0.911133 3.75H12.1875V13.125C12.1875 14.1592 11.3467 15 10.3125 15H2.78613C1.77686 15 0.911133 14.1592 0.911133 13.125V3.75ZM3.25488 6.09375V12.6562C3.25488 12.9141 3.49219 13.125 3.72363 13.125C4.00781 13.125 4.19238 12.9141 4.19238 12.6562V6.09375C4.19238 5.83594 4.00781 5.625 3.72363 5.625C3.49219 5.625 3.25488 5.83594 3.25488 6.09375ZM6.7168 6.09375V12.6562C6.7168 12.9141 6.9541 13.125 7.18555 13.125C7.46973 13.125 7.6543 12.9141 7.6543 12.6562V6.09375C7.6543 5.83594 7.46973 5.625 7.18555 5.625C6.9541 5.625 6.7168 5.83594 6.7168 6.09375ZM10.1787 6.09375V12.6562C10.1787 12.9141 10.416 13.125 10.6475 13.125C10.9317 13.125 11.1162 12.9141 11.1162 12.6562V6.09375C11.1162 5.83594 10.9317 5.625 10.6475 5.625C10.416 5.625 10.1787 5.83594 10.1787 6.09375Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
      ),
    },
  ];

  const openDeleteModal = (courseId: number) => {
    setCourseToDelete(courseId);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue); // actual search term update after delay
    }, 1000); // 1000ms = 1 sec

    return () => {
      clearTimeout(handler); // cleanup on every new keystroke
    };
  }, [inputValue]);

  return (
    <>
      <div className="admin_panel">
        <div className="Breadcrumbs">
          <h3>All Announcement</h3>
          <button
            className="btn"
            onClick={() => {
              setEditList(null);
              setShowMainModal(true);
            }}
          >
            Add Announcement
          </button>
        </div>

        <div className="filter_bx">
          <div className="grp_search">
            <input
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        <PaginatedTable<GenericItems>
          columns={columns}
          data={announcementList?.results || []}
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

      <AnnouncmentModal
        list={editList}
        showMainModal={showMainModal}
        setShowMainModal={setShowMainModal}
        onSubmit={editList ? updateAnnouncement : createAnnouncement}
        setIsSubmitting={setIsSubmitting}
        isSubmitting={isSubmitting}
      />
      <Modal
        show={showUploadvModal}
        centered
        onHide={() => setShowUploadvModal(false)}
        dialogClassName="modalfullCustom modalSM modalSucss"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="modalSucess">
            <div className="modalSucess_inner">
              <div className="icon">
                {" "}
                <img src={assets.images.sucess} />
              </div>
              <h3>Announcement Added Successfully </h3>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ShowDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        onSubmit={deleteAnnouncement}
        title={"Do you want to delete announcement"}
      />

      {/* <Modal
                show={showUpdateModal}
                centered
                onHide={() => setShowUpdateModal(false)}
                dialogClassName="modalfullCustom modalSM modalSucss"
                aria-labelledby="example-custom-modal-styling-title" >
                <Modal.Body>
                    <div className="modalSucess">
                        <div className="modalSucess_inner">
                            <div className='icon'> <img src={assets.images.sucess} /></div>
                            <h3>Announcement Update Successfully  </h3>
                        </div>
                    </div>
                </Modal.Body>
            </Modal> */}
    </>
  );
};

export default AllAnnouncementPage;
