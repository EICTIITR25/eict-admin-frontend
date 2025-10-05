import React, { useState, ChangeEvent, memo } from "react";
import { Modal, ProgressBar } from "react-bootstrap";
import { GenericItems } from "../../types";
import { useCrud } from "../../hooks/useCrud";
import { buildFormData } from "../../utils/buildFormData";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { useEscToClose } from "../../hooks/useEscToClose";
import { toast } from "react-toastify";
interface AddDocumentModalProps {
  showDocumentModal: boolean;
  setShowDocumentModal: (show: boolean) => void;
  chapterData: GenericItems | null;
  courseId?: GenericItems | null;
}
const keyMap: Record<string, string> = {
  name: "title",
  description: "description",
  resourse_type: "resource_type",
  file: "file",
};

const defaultForm = {
  name: "",
  description: "",
  resourse_type: "",
  file: "",
};

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  showDocumentModal,
  setShowDocumentModal,
  chapterData,
  courseId,
}) => {
  useEscToClose(showDocumentModal, () => setShowDocumentModal(false));
  const { form, handleChange, setForm, errors, setErrors, isFieldsEmpty } =
    useDynamicForm(defaultForm);
  const { useCreate } = useCrud();
  const { mutate: createDocument } = useCreate(
    `/courses/chapters/${chapterData?.chapter}/resources/`,
    [`/courses/courses/${courseId}/chapters/`, "{}"],
    {
      onSuccess: () => {
        setShowDocumentModal(false);
        setForm((prev) => ({
          ...prev,
          name: "",
          description: "",
          resourse_type: "",
          file: "",
        }));
        setUploadProgress(0);
        setShowTable(false);
        setShowProgress(false);
      },
    }
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setShowProgress(true);
    setShowTable(false);
    setUploadProgress(0);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(Math.min(progress, 100));

      if (progress >= 100) {
        clearInterval(interval);
        setForm((prev) => ({ ...prev, resourse_type: "pdf", file: file }));
        setShowProgress(false);
        setShowTable(true);
      }
    }, 300);
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      resourse_type: "",
      file: "",
    }));
    setUploadProgress(0);
    setShowTable(false);
    setShowProgress(false);
  };
  return (
    <Modal
      show={showDocumentModal}
      centered
      dialogClassName="modalfullCustom modalSM  modalVideo"
      aria-labelledby="example-custom-modal-styling-title"
    >
      <Modal.Body>
        <div className="headerModal">
          <h3>Add Document</h3>
        </div>

        <div
          className="UploadVideo_btn"
          style={{ padding: "20px 0", margin: "20px 0" }}
        >
          <label className="btnUpload" htmlFor="uploadDocumentInput">
            <span>
              <svg
                width="23"
                height="16"
                viewBox="0 0 23 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.53125 16C4.01458 16 2.71875 15.475 1.64375 14.425C0.56875 13.375 0.03125 12.0917 0.03125 10.575C0.03125 9.275 0.422917 8.11667 1.20625 7.1C1.98958 6.08333 3.01458 5.43333 4.28125 5.15C4.69792 3.61667 5.53125 2.375 6.78125 1.425C8.03125 0.475 9.44792 0 11.0312 0C12.9812 0 14.6354 0.679167 15.9938 2.0375C17.3521 3.39583 18.0312 5.05 18.0312 7C19.1812 7.13333 20.1354 7.62917 20.8938 8.4875C21.6521 9.34583 22.0312 10.35 22.0312 11.5C22.0312 12.75 21.5938 13.8125 20.7188 14.6875C19.8438 15.5625 18.7812 16 17.5312 16H12.0312C11.4812 16 11.0104 15.8042 10.6188 15.4125C10.2271 15.0208 10.0312 14.55 10.0312 14V8.85L8.43125 10.4L7.03125 9L11.0312 5L15.0312 9L13.6313 10.4L12.0312 8.85V14H17.5312C18.2313 14 18.8229 13.7583 19.3062 13.275C19.7896 12.7917 20.0312 12.2 20.0312 11.5C20.0312 10.8 19.7896 10.2083 19.3062 9.725C18.8229 9.24167 18.2313 9 17.5312 9H16.0312V7C16.0312 5.61667 15.5438 4.4375 14.5688 3.4625C13.5938 2.4875 12.4146 2 11.0312 2C9.64792 2 8.46875 2.4875 7.49375 3.4625C6.51875 4.4375 6.03125 5.61667 6.03125 7H5.53125C4.56458 7 3.73958 7.34167 3.05625 8.025C2.37292 8.70833 2.03125 9.53333 2.03125 10.5C2.03125 11.4667 2.37292 12.2917 3.05625 12.975C3.73958 13.6583 4.56458 14 5.53125 14H8.03125V16H5.53125Z"
                  fill="white"
                />
              </svg>
            </span>
            <input
              type="file"
              name="Upload"
              id="uploadDocumentInput"
              multiple
              disabled={!isFieldsEmpty(["name", "description"])}
              onChange={handleFileUpload}
            />
            Upload from your PC
          </label>
        </div>
        <div className="from_doc">
          <div className="from-group mb-3">
            <label htmlFor="">Document Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="form-control"
              value={form["name"]}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="from-group">
            <label htmlFor="">Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Description goes here"
              value={form["description"]}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="upload_file">
          <label>Upload Status</label>
          <ProgressBar now={uploadProgress} />
          <span>{`${uploadProgress}%`}</span>
        </div>
        {showTable && (
          <div className="upload_Doc_data">
            <div className="name">{form.name}</div>
            <button className="btn btn_delete" onClick={resetForm}>
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.99219 0.518262C4.15039 0.200625 4.47559 0 4.83008 0H8.35742C8.71191 0 9.03711 0.200625 9.19531 0.518262L9.40625 0.9375H12.2188C12.7373 0.9375 13.1562 1.35732 13.1562 1.875C13.1562 2.39268 12.7373 2.8125 12.2188 2.8125H0.96875C0.451074 2.8125 0.03125 2.39268 0.03125 1.875C0.03125 1.35732 0.451074 0.9375 0.96875 0.9375H3.78125L3.99219 0.518262ZM0.942383 3.75H12.2188V13.125C12.2188 14.1592 11.3779 15 10.3438 15H2.81738C1.80811 15 0.942383 14.1592 0.942383 13.125V3.75ZM3.28613 6.09375V12.6562C3.28613 12.9141 3.52344 13.125 3.75488 13.125C4.03906 13.125 4.22363 12.9141 4.22363 12.6562V6.09375C4.22363 5.83594 4.03906 5.625 3.75488 5.625C3.52344 5.625 3.28613 5.83594 3.28613 6.09375ZM6.09863 6.09375V12.6562C6.09863 12.9141 6.33594 13.125 6.56738 13.125C6.85156 13.125 7.0625 12.9141 7.0625 12.6562V6.09375C7.0625 5.83594 6.85156 5.625 6.56738 5.625C6.33594 5.625 6.09863 5.83594 6.09863 6.09375ZM8.9375 6.09375V12.6562C8.9375 12.9141 9.14844 13.125 9.40625 13.125C9.66406 13.125 9.875 12.9141 9.875 12.6562V6.09375C9.875 5.83594 9.66406 5.625 9.40625 5.625C9.14844 5.625 8.9375 5.83594 8.9375 6.09375Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        )}
        {/* Action Buttons */}
        <div className="btn_grp btnRight_grp mt-4 d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => {
              resetForm();
              setShowDocumentModal(false);
            }}
          >
            Close
          </button>
          <div
            onClick={() => {
              if (!isFieldsEmpty(["name", "description", "file"])) {
                toast.warn("Please fill out the fields.");
              } else {
                const formData = buildFormData(form, keyMap);
                createDocument(formData);
              }
            }}
          >
            <button
              className="btn btn-primary"
              disabled={!isFieldsEmpty(["name", "description", "file"])}
              // onClick={() => {
              //   const formData = buildFormData(form, keyMap);
              //   createDocument(formData);
              // }}
            >
              Add
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default memo(AddDocumentModal);
