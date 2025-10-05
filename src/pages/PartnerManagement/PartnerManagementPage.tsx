import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";
import assets from "../../assets";

interface Partner {
  id: number;
  name: string;
  logo: string | null;
  category: string;
  is_active: boolean;
}

const PartnerManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filters = ["All", "Academic", "Industry"];
  const { useFetch, useUpdate, useDelete } = useCrud();
  const { data, isLoading, error } = useFetch<Partner[]>("/partners/");

  const updatePartner = useUpdate<Partner>("/partners/", "/partners/");
  const deletePartner = useDelete("/partners/", "/partners/");

  // Frontend filtering logic
  const filteredPartners = (data ?? []).filter((partner) => {
    const matchesSearch = partner.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedFilter === "All" || partner.category === selectedFilter;
    return matchesSearch && matchesCategory;
  });

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
  };

  const togglePartnerStatus = (partner: Partner) => {
    const newStatus = !partner.is_active;
    updatePartner.mutate(
      {
        id: partner.id,
        data: { is_active: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Partner status updated successfully!");
        },
        onError: (error: any) => {
          console.error("Failed to update partner status:", error);
          toast.error("Failed to update partner status");
        },
      }
    );
  };

  const openDeleteModal = (partnerId: number) => {
    setPartnerToDelete(partnerId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPartnerToDelete(null);
  };

  const handleDelete = () => {
    if (partnerToDelete !== null) {
      deletePartner.mutate(
        { id: partnerToDelete },
        {
          onSuccess: () => {
            toast.success("Partner deleted successfully!");
            setShowDeleteModal(false);
            setPartnerToDelete(null);
          },
          onError: (error: any) => {
            console.error("Failed to delete partner:", error);
            toast.error("Failed to delete partner");
          },
        }
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading partners: {error.message}</div>;

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>All Partners</h3>
        <Link to="/partner-management/add-partner" className="btn">
          Add Partner
        </Link>
      </div>
      <div className="Partner_filter">
        <div className="form-group">
          <label>Filter</label>
          <div className="CategoryWrappFilter" ref={dropdownRef}>
            <button
              type="button"
              className="CategoryBtn"
              onClick={() => setShowCourseDropdown((prev) => !prev)}
            >
              {selectedFilter}
              <span className={`arrow ${showCourseDropdown ? "show" : ""}`}>
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
                {filters.map((filter) => (
                  <li key={filter} onClick={() => handleFilterClick(filter)}>
                    <label>
                      <span>{filter}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="filter_bx">
          <p>Search:</p>
          <div className="grp_search">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="PartnerList">
        {filteredPartners.length > 0 ? (
          filteredPartners.map((partner) => (
            <div key={partner.id} className="card_bx">
              <div className="image_bx">
                <img
                  src={partner.logo || assets.images.Avatar}
                  alt={partner.name}
                />
                <div className="status-toggle textwith-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={partner.is_active}
                      onChange={() => togglePartnerStatus(partner)}
                      disabled={updatePartner.isPending}
                    />
                    <span className="slider"></span>
                  </label>
                  <span
                    className={`status-text ${
                      partner.is_active ? "enabled" : "disabled"
                    }`}
                  >
                    {partner.is_active ? "Enable" : "Disable"}
                  </span>
                </div>
              </div>
              <h3>{partner.name}</h3>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
            No partners available
          </div>
        )}
      </div>

      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        centered
        aria-labelledby="deleteModalLabel"
      >
        <Modal.Header closeButton>
          <Modal.Title id="deleteModalLabel">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this partner?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deletePartner.isPending}
          >
            {deletePartner.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PartnerManagementPage;
