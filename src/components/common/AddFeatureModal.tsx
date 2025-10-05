import React, { memo } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { buildFormData } from "../../utils/buildFormData";
import { GenericItems } from "../../types";
import { useCrud } from "../../hooks/useCrud";
import { getErrorMessage } from "../../utils/helper";
import { useEscToClose } from "../../hooks/useEscToClose";
interface AddCourseModalProps {
  showChapterModal: boolean;
  type: string;
  setShowChapterModal: (show: boolean) => void;
}
const defaultForm = {
  about_course_name: "",
  about_course_description: "",
};
const AddFeatureModal: React.FC<AddCourseModalProps> = ({
  showChapterModal,
  setShowChapterModal,
  type,
}) => {
  useEscToClose(showChapterModal, () => setShowChapterModal(false));
  const { form, setForm, handleChange, isFieldsEmpty } =
    useDynamicForm(defaultForm);
  const { useCreate } = useCrud();
  const { mutate: createFeature } = useCreate(
    `/courses/features/manage/`,
    [`/courses/features/?type=${type}`, "{}"],
    {
      onError: (error) => {
        getErrorMessage(error);
      },
      onSuccess: () => {
        setForm(defaultForm);
      },
    }
  );
  if (!showChapterModal) return null;
  return (
    <Modal
      show={showChapterModal}
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
                    value={form["about_course_name"] || ""}
                    onChange={(e) => {
                      handleChange("about_course_name", e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        about_course_description: e.target.value,
                      }));
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
                  disabled={
                    !isFieldsEmpty([
                      "about_course_name",
                      "about_course_description",
                    ])
                  }
                  onClick={() => {
                    const formData = buildFormData(
                      {
                        about_course_name: form["about_course_name"],
                        about_course_description:
                          form["about_course_description"],
                        about_course_type: type,
                      },
                      {
                        about_course_name: "name",
                        about_course_description: "description",
                        about_course_type: "type",
                      }
                    );
                    createFeature(formData);
                    setShowChapterModal(false);
                  }}
                >
                  Save
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      about_course_description: "",
                      about_course_name: "",
                    }));
                    setShowChapterModal(false);
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
