import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import assets from "../../assets";
import { Modal } from "react-bootstrap";
const CreateCertificatePage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [showMainModal, setShowMainModal] = useState(false);
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [showUploadvModal, setShowUploadvModal] = useState(false);
    const partners = [
        {
            id: 1,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 2,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 3,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 4,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 5,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 6,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 6,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 7,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
        {
            id: 8,
            name: "FDP Course",
            title: "Electronics & ICT Academy IIT Roorkee (E&ICT IITR)",
            date: "July 1, 2016 to July 10, 2016",
            image: assets.images.Coursescertif,
        },
    ];
    const totalItems = partners.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const currentPartners = partners.slice(startIndex, endIndex);

    const pagesToDisplay = (() => {
        const pages = [];
        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage, "...", totalPages);
            }
        }
        return pages;
    })();

    const handlePagination = (action: string) => {
        if (action === "first") setCurrentPage(1);
        else if (action === "prev" && currentPage > 1)
            setCurrentPage(currentPage - 1);
        else if (action === "next" && currentPage < totalPages)
            setCurrentPage(currentPage + 1);
        else if (action === "last") setCurrentPage(totalPages);
    };

    return (
        <>
            <div className="admin_panel">
                <div className="Breadcrumbs">
                    <h3>All Certificate</h3>
                    <button className="btn"  onClick={() => {setShowMainModal(true);}}>Create Certificate</button>
                </div>
                <div className="filter_page">
                    <div className="grp_search">
                        <label htmlFor="">Sort by</label>
                        <select className="form-control">
                            <option value="">Select</option>
                            <option value="">FDP Course</option>
                        </select>
                    </div>
                </div>

                <div className="CertificateList">
                    {currentPartners.map((partner) => (
                        <div key={partner.id} className="card_bx_Certificate">
                            <div className="image_bx">
                                <img src={partner.image} alt={partner.name} />

                            </div>
                            <h3>{partner.name}</h3>
                            <p>{partner.title}</p>
                            <h6>{partner.date}</h6>

                        </div>
                    ))}
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
                            <option value={6}>6</option>
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

                        {pagesToDisplay.map((page, index) =>
                            page === "..." ? (
                                <span key={index} className="dots">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={index}
                                    className={`btn btnno ${currentPage === page ? "active" : ""
                                        }`}
                                    onClick={() => setCurrentPage(Number(page))}
                                >
                                    {page}
                                </button>
                            )
                        )}

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
                show={showMainModal}
                centered
                onHide={() => setShowMainModal(false)}
                dialogClassName="modalfullCustom modalSM"
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Body>
                    <div className="headerModal">
                        <h3>Add New Certificate</h3>
                    </div>

                    <div className="Uploadcourses btnUpload">
                        <Link to="/certificate-management/upload-certificate" className="btn">
                        Upload Sample Certificate
                        </Link>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default CreateCertificatePage;
