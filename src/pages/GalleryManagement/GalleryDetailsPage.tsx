import React, { useState } from "react";
import assets from "../../assets";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";

const GalleryDetailsPage = () => {
    const [showMainModal, setShowMainModal] = useState(false);

    const [partners, setPartners] = useState([
        {
            id: 1,
            name: "Lorem ipsum dolor sit amet consectetur. ",
            image: assets.images.Image,
        },
        {
            id: 2,
            name: "Lorem ipsum dolor sit amet consectetur. ",
            image: assets.images.Image,
        },
        {
            id: 3,
            name: "Lorem ipsum dolor sit amet consectetur. ",
            image: assets.images.Image,
        },
        {
            id: 4,
            name: "Lorem ipsum dolor sit amet consectetur. ",
            image: assets.images.Image,
        },
        {
            id: 5,
            name: "Lorem ipsum dolor sit amet consectetur. ",
            image: assets.images.Image,
        },
        {
            id: 6,
            name: "Lorem ipsum dolor sit amet consectetur. ",
            image: assets.images.Image,
        },
    ]);

    const handleDelete = (id: number) => {
        setPartners((prev) => prev.filter((partner) => partner.id !== id));
    };

    return (
        <>
            <div className="admin_panel">
                <div className="Breadcrumbs">
                    <h3>Artificial Intelligence & Machine Learning</h3>
                    <Link to="/gallery-management/add-gallery" className="btn">Add Category</Link>
                </div>

                <div className="HeaderList">
                    {partners.map((partner) => (
                        <div key={partner.id} className="Headercard_bx">
                            <div className="image_bx">
                                <img src={partner.image} alt={partner.name} />
                            </div>
                            <div className="ContentHeader">
                                <h3>{partner.name}</h3>
                                <div className="btn_grpHeader">
                                    <Link to="/gallery-management/edit-gallery/" className="btn btnEdit">
                                        {/* Edit Icon */}
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M2.16667 13.8327H3.33333L11.7083 5.47852L11.125 4.87435L10.5208 4.29102L2.16667 12.666V13.8327ZM0.5 15.4993V11.9577L11.7083 0.770182C12.0278 0.450738 12.4203 0.291016 12.8858 0.291016C13.3508 0.291016 13.7431 0.450738 14.0625 0.770182L15.2292 1.95768C15.5486 2.27713 15.7083 2.66602 15.7083 3.12435C15.7083 3.58268 15.5486 3.97157 15.2292 4.29102L4.04167 15.4993H0.5Z" fill="#1C1B1F" />
                                        </svg>
                                    </Link>
                                    <button
                                        className="btn DeleteBtn"
                                        onClick={() => handleDelete(partner.id)}
                                    >
                                        {/* Delete Icon */}
                                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                                            <path d="M10.0957 6.10029C10.2592 5.78266 10.5955 5.58203 10.9621 5.58203H14.6094C14.9759 5.58203 15.3122 5.78266 15.4758 6.10029L15.6939 6.51953H18.602C19.1382 6.51953 19.5714 6.93936 19.5714 7.45703C19.5714 7.97471 19.1382 8.39453 18.602 8.39453H6.96939C6.4341 8.39453 6 7.97471 6 7.45703C6 6.93936 6.4341 6.51953 6.96939 6.51953H9.87755L10.0957 6.10029ZM6.94212 9.33203H18.602V18.707C18.602 19.7412 17.7326 20.582 16.6633 20.582H8.8809C7.83729 20.582 6.94212 19.7412 6.94212 18.707V9.33203ZM9.36559 11.6758V18.2383C9.36559 18.4961 9.61097 18.707 9.85029 18.707C10.1441 18.707 10.335 18.4961 10.335 18.2383V11.6758C10.335 11.418 10.1441 11.207 9.85029 11.207C9.61097 11.207 9.36559 11.418 9.36559 11.6758ZM12.2738 11.6758V18.2383C12.2738 18.4961 12.5191 18.707 12.7585 18.707C13.0523 18.707 13.2704 18.4961 13.2704 18.2383V11.6758C13.2704 11.418 13.0523 11.207 12.7585 11.207C12.5191 11.207 12.2738 11.418 12.2738 11.6758ZM15.2092 11.6758V18.2383C15.2092 18.4961 15.4273 18.707 15.6939 18.707C15.9605 18.707 16.1786 18.4961 16.1786 18.2383V11.6758C16.1786 11.418 15.9605 11.207 15.6939 11.207C15.4273 11.207 15.2092 11.418 15.2092 11.6758Z" fill="#1C1B1F" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default GalleryDetailsPage;
