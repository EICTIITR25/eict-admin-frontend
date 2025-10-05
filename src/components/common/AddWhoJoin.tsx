import React, { memo } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { useCrud } from "../../hooks/useCrud";
import { getErrorMessage } from "../../utils/helper";
import { useEscToClose } from "../../hooks/useEscToClose";
interface AddCourseModalProps {
  showWhoJoin: boolean;
  setShowWhoJoin: (show: boolean) => void;
}
const defaultForm = {
  title: "",
};
const AddFeatureModal: React.FC<AddCourseModalProps> = ({
  showWhoJoin,
  setShowWhoJoin,
}) => {
  useEscToClose(showWhoJoin, () => setShowWhoJoin(false));
  const { form, setForm, handleChange, isFieldsEmpty } =
    useDynamicForm(defaultForm);
  const { useCreate } = useCrud();
  const { mutate: createWhoJoin } = useCreate(
    `/courses/why-should-i-join/`,
    ["/courses/why-should-i-join/", "{}"],
    {
      onError: (error) => {
        getErrorMessage(error.message);
      },
    }
  );
  if (!showWhoJoin) return null;
  return (
    <Modal
      show={showWhoJoin}
      centered
      dialogClassName="modalfullCustom modalSM modalMd"
      aria-labelledby="example-custom-modal-styling-title"
    >
      <Modal.Body>
        <div className="headerModal">
          <h3>About the course</h3>
        </div>
        <div className="fromSection Aboutthecourse_modal">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="from-groug">
                <label>About course</label>
                <div className="About_plus_mins d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    value={form["title"] || ""}
                    onChange={(e) => {
                      handleChange("title", e.target.value);
                    }}
                    placeholder="Enter"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-lg-12">
              <div className="btn_grp btnRight_grp d-flex justify-content-end gap-2">
                <button
                  className="btn"
                  disabled={!isFieldsEmpty(["title"])}
                  onClick={() => {
                    createWhoJoin({
                      title: form["title"],
                      is_active: true,
                    });
                    setShowWhoJoin(false);
                  }}
                >
                  Save
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      title: "",
                    }));
                    setShowWhoJoin(false);
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default memo(AddFeatureModal);
