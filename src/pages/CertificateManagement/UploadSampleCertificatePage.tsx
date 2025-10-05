import React, { useState, useRef, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
const UploadSampleCertificatePage = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [showMainModal, setShowMainModal] = useState(false);

        const [showCourseDropdown, setShowCourseDropdown] = useState(false);
        const [selectedFilter, setSelectedFilter] = useState("Select Category");
        const filters = ["Self Paced", "FDP’s", "Advance PG Course","Short Term Training"];
        const dropdownRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
          };


    return (
        <>
            <div className="admin_panel">
                <div className="Breadcrumbs">
                    <h3>Upload  Sample Certificate</h3>
                </div>
                <div className="card_bx">
                    <form>
                        <div className="form-group">
                            <label htmlFor="courseName">Category</label>
                            <div className="CategoryWrappFilter" ref={dropdownRef}>
                            <button
                                type="button"
                                className="CategoryBtn"
                                onClick={() => setShowCourseDropdown((prev) => !prev)}
                            >
                                {selectedFilter}
                                <span className={`arrow ${showCourseDropdown ? "show" : ""}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="24" transform="matrix(0 -1 1 0 0 24)" fill="white" fill-opacity="0.01" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.2929 15.7079C10.4818 15.8947 10.7368 15.9995 11.0024 15.9995C11.2681 15.9995 11.523 15.8947 11.7119 15.7079L14.6769 12.7689C14.8919 12.5509 14.9989 12.2689 14.9989 11.9899C14.9989 11.7109 14.8919 11.4339 14.6769 11.2209L11.7219 8.29093C11.5329 8.10437 11.278 7.99976 11.0124 7.99976C10.7469 7.99976 10.492 8.10437 10.3029 8.29093C10.2098 8.38276 10.1358 8.4922 10.0853 8.61289C10.0347 8.73358 10.0087 8.8631 10.0087 8.99393C10.0087 9.12476 10.0347 9.25429 10.0853 9.37497C10.1358 9.49566 10.2098 9.6051 10.3029 9.69693L12.6199 11.9949L10.2929 14.3019C10.2001 14.394 10.1264 14.5035 10.0762 14.6241C10.0259 14.7448 10 14.8742 10 15.0049C10 15.1356 10.0259 15.2651 10.0762 15.3857C10.1264 15.5064 10.2001 15.6159 10.2929 15.7079Z" fill="black" />
                                    </svg>
                                </span>
                            </button>
                            {showCourseDropdown && (
                                <ul className="FiltersdropDownCategory">
                                    {filters.map((filter) => (
                                        <li key={filter} onClick={() => handleFilterClick(filter)}>
                                            <label style={{padding:"0"}}>
                                                <span>{filter}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        </div>
                        <div className="UploadLogoForm">
                            <label>Upload Certificate</label>
                            <label htmlFor="Upload" className="Upload" >
                                <input type="file" name="Upload" id="Upload" />
                                <span>Choose File</span>
                            </label>
                            <p>Note: you can add single pdf/jpg file or pdf/jpg multiple files</p>
                        </div>

                        <div className="btn_grp">
                            <button
                                type="button"
                                onClick={() => setShowMainModal(true)}
                                className="btn"
                                style={{ width: "160px" }}
                            >
                                Import CSV File
                            </button>
                        </div>
                    </form>
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
                    <div className="Uploadcourses btnUpload">
                        <h3>You have upload 20 files successfully</h3>
                        <Link to="/certificate-management/create-certificate" className="btn">
                            <span><svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 16C4.48333 16 3.1875 15.475 2.1125 14.425C1.0375 13.375 0.5 12.0917 0.5 10.575C0.5 9.275 0.891667 8.11667 1.675 7.1C2.45833 6.08333 3.48333 5.43333 4.75 5.15C5.16667 3.61667 6 2.375 7.25 1.425C8.5 0.475 9.91667 0 11.5 0C13.45 0 15.1042 0.679167 16.4625 2.0375C17.8208 3.39583 18.5 5.05 18.5 7C19.65 7.13333 20.6042 7.62917 21.3625 8.4875C22.1208 9.34583 22.5 10.35 22.5 11.5C22.5 12.75 22.0625 13.8125 21.1875 14.6875C20.3125 15.5625 19.25 16 18 16H12.5C11.95 16 11.4792 15.8042 11.0875 15.4125C10.6958 15.0208 10.5 14.55 10.5 14V8.85L8.9 10.4L7.5 9L11.5 5L15.5 9L14.1 10.4L12.5 8.85V14H18C18.7 14 19.2917 13.7583 19.775 13.275C20.2583 12.7917 20.5 12.2 20.5 11.5C20.5 10.8 20.2583 10.2083 19.775 9.725C19.2917 9.24167 18.7 9 18 9H16.5V7C16.5 5.61667 16.0125 4.4375 15.0375 3.4625C14.0625 2.4875 12.8833 2 11.5 2C10.1167 2 8.9375 2.4875 7.9625 3.4625C6.9875 4.4375 6.5 5.61667 6.5 7H6C5.03333 7 4.20833 7.34167 3.525 8.025C2.84167 8.70833 2.5 9.53333 2.5 10.5C2.5 11.4667 2.84167 12.2917 3.525 12.975C4.20833 13.6583 5.03333 14 6 14H8.5V16H6Z" fill="white" />
                            </svg></span>   Upload and  Continue
                        </Link>

                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default UploadSampleCertificatePage;
