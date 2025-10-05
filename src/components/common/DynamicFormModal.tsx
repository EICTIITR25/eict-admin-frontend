import React, { memo, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { useCrud } from "../../hooks/useCrud";
import { getErrorMessage } from "../../utils/helper";
import { useEscToClose } from "../../hooks/useEscToClose";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}

interface DynamicFormModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  title?: string;
  createUrl: any;
  refetchKeys?: string[];
  fields: Field[];
  getPayload?: (form: Record<string, any>) => any;
}

const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  show,
  setShow,
  title = "Add Item",
  createUrl,
  refetchKeys = [],
  fields,
  getPayload,
}) => {
  useEscToClose(show, () => setShow(false));
  const defaultForm = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, any>);

  const { form, setForm, handleChange, isFieldsEmpty } =
    useDynamicForm(defaultForm);

  const { useCreate } = useCrud();
  const { mutate: createItem } = useCreate(createUrl, [...refetchKeys], {
    onSuccess: () => {
      setShow(false);
      setForm(defaultForm);
    },
    onError: (error) => getErrorMessage(error),
  });

  const handleSave = () => {
    const payload = getPayload ? getPayload(form) : form;
    createItem(payload);
  };

  const handleClose = () => {
    setForm(defaultForm);
    setShow(false);
  };

  if (!show) return null;

  return (
    <Modal
      show={show}
      centered
      dialogClassName="modalfullCustom modalSM modalMd"
    >
      <Modal.Body>
        <div className="headerModal">
          <h3>{title}</h3>
        </div>
        <div className="fromSection">
          <div className="row">
            {fields.map((field) => (
              <div className="col-lg-12 col-md-12" key={field.name}>
                <div className="from-groug">
                  <label>{field.label}</label>
                  <input
                    type={field.type || "text"}
                    className="form-control"
                    value={form[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder || ""}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            <div className="col-lg-12">
              <div className="btn_grp btnRight_grp d-flex justify-content-end gap-2">
                <button
                  className="btn"
                  disabled={!isFieldsEmpty(fields.map((f) => f.name))}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button className="btn" onClick={handleClose}>
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

export default memo(DynamicFormModal);
