import React, { useState, useEffect, useMemo, memo } from "react";
import { GenericItems } from "../../types";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { toast } from "react-toastify";
import { useEscToClose } from "../../hooks/useEscToClose";

interface FAQFormProps {
  title?: string;
  module?: string;
  sub_module?: string;
  item?: GenericItems | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (faq: GenericItems) => void;
}

const defaultForm = {
  id: "",
  answer: "",
  question: "",
};

const FAQForm: React.FC<FAQFormProps> = memo(
  ({
    title = "FAQ",
    item,
    isOpen,
    onClose,
    onSubmit,
    module = "Question",
    sub_module = "Answer",
  }) => {
    useEscToClose(isOpen, onClose);
    const { form, handleChange, setForm, isFieldsEmpty } =
      useDynamicForm(defaultForm);

    useEffect(() => {
      if (item) {
        setForm((prev) => ({
          ...prev,
          id: item?.id,
          answer: item?.answer,
          question: item?.question,
        }));
      }
    }, [item, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(form);
      onClose();
      setForm(defaultForm);
    };
    if (!isOpen) return null;
    return (
      <Modal
        show={isOpen}
        centered
        dialogClassName="modalfullCustom modalSM  modalVideo"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>{item ? `Edit New ${title}` : `Add New ${title}`}</h3>
          </div>
          <div className="p-3">
            <div className="from-group mb-3">
              <label>{module}</label>
              <input
                type="text"
                className="form-control"
                value={form["question"]}
                onChange={(e) => handleChange("question", e.target.value)}
              />
            </div>
            <div className="from-group mb-3">
              <label>{sub_module}</label>
              {item ? (
                <input
                  type="text"
                  className="form-control"
                  value={form["answer"]}
                  disabled={!form.question}
                  onChange={(e) => handleChange("answer", e.target.value)}
                />
              ) : (
                <textarea
                  style={{ minHeight: "209px" }}
                  value={form["answer"]}
                  disabled={!form.question}
                  onChange={(e) => handleChange("answer", e.target.value)}
                  className="form-control"
                />
              )}
            </div>
            <div className="btn_grp btnRight_grp mt-4 d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                style={{ background: "#1e3a8a", color: "#fff" }}
                onClick={() => {
                  onClose();
                  setForm(defaultForm);
                }}
              >
                Close
              </button>
              <div
                onClick={(e) => {
                  if (!isFieldsEmpty(["question", "answer"])) {
                    toast.warn("Please fill out question and answer.");
                  } else {
                    handleSubmit(e); // will only run if fields are filled
                  }
                }}
              >
                <button
                  className="btn btn-primary"
                  style={{ background: "#e5e5e5", color: "#000" }}
                  disabled={!isFieldsEmpty(["question", "answer"])}
                  // onClick={handleSubmit}
                >
                  {item ? "Confirm" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
);

export default FAQForm;
