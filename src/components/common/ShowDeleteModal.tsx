import React, { memo } from "react";
import { Button, Modal } from "react-bootstrap";
import { GenericItems } from "../../types";
interface ShowDeleteModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  onSubmit: (show: GenericItems) => void;
  title?: string;
}
const ShowDeleteModal: React.FC<ShowDeleteModalProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  onSubmit,
  title,
}) => {
  return (
    <Modal
      centered
      dialogClassName="modalfullCustom modalSM"
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
    >
      <Modal.Body>
        <div className="modal_delete">
          <h3>{title}</h3>
          <div>
            <div className="btn_grp">
              <Button className="btn" onClick={onSubmit}>
                Confirm
              </Button>
              <Button className="btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default memo(ShowDeleteModal);
