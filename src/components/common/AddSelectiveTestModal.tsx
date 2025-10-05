import React, { memo, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { GenericItems } from "../../types";
import { useCrud } from "../../hooks/useCrud";
import {
  convertTimeToMinutes,
  formatSecondsToHHMMSS,
  formatSecondsToHHMMSS2,
  getErrorMessage,
  isDisabled,
} from "../../utils/helper";
import { useEscToClose } from "../../hooks/useEscToClose";

interface AddSelectiveTestModalProps {
  showSectionalTestModal: boolean;
  setShowSectionalTestModal: (show: boolean) => void;
  resourceData: GenericItems | null;
  courseId?: GenericItems | null;
}

interface Option {
  id: number;
  value: string;
}
const defaultForm = {
  answer: [{ id: Date.now(), value: "" }],
  question: "",
  time: {
    hh: "",
    mm: "",
    ss: "",
  },
  solution: "",
};
const AddSelectiveTestModal: React.FC<AddSelectiveTestModalProps> = ({
  showSectionalTestModal,
  setShowSectionalTestModal,
  resourceData,
  courseId,
}) => {
  const time = formatSecondsToHHMMSS2(resourceData?.original_duration);
  useEscToClose(showSectionalTestModal, () => setShowSectionalTestModal(false));
  const { form, handleChange, setForm, isFieldsEmpty } =
    useDynamicForm(defaultForm);
  const { useCreate } = useCrud();

  const { mutate: createTest } = useCreate(
    `/courses/resources/${resourceData?.id}/add_sectional_test/`,
    [`/courses/courses/${courseId}/chapters/`, "{}"],
    {
      onSuccess: (data) => {
        setForm((prev) => ({
          ...prev,
          answer: [],
          quesiton: "",
          solution: "",
          time: {
            hh: "",
            mm: "",
            ss: "",
          },
        }));
        setShowSectionalTestModal(false);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );

  const handleAddOption = () => {
    setForm((prevForm) => ({
      ...prevForm,
      answer: [...prevForm.answer, { id: Date.now(), value: "" }],
    }));
  };

  const handleDeleteOption = (id: number) => {
    setForm((prevForm) => ({
      ...prevForm,
      answer: prevForm.answer.filter((opt: Option) => opt.id !== id),
    }));
  };

  const handleInputChange = (id: number, newValue: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      answer: prevForm.answer.map((opt: Option) =>
        opt.id === id ? { ...opt, value: newValue } : opt
      ),
    }));
  };

  return (
    <Modal
      show={showSectionalTestModal}
      centered
      dialogClassName="modalfull_mcq"
    >
      <Modal.Body>
        <div className="header_bx">
          <div className="lft_bx">
            <h3>1. Sectional Test</h3>
            <div className="ques_type">
              <label htmlFor="">Enter time stamp</label>
              <div className="time_bx">
                <select
                  name="hh"
                  className="form-control"
                  value={form.time.hh}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      time: { ...prev.time, hh: e.target.value },
                    }))
                  }
                >
                  <option value="">HH</option>
                  {[...Array(24)].map((_, i) => {
                    const val = String(i).padStart(2, "0");
                    const disabled = isDisabled("hh", i, form.time, time);
                    return (
                      <option key={val} value={val} disabled={disabled}>
                        {val}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="mm"
                  className="form-control"
                  value={form.time.mm}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      time: { ...prev.time, mm: e.target.value },
                    }))
                  }
                >
                  <option value="">MM</option>
                  {[...Array(60)].map((_, i) => {
                    const val = String(i).padStart(2, "0");
                    const disabled = isDisabled("mm", i, form.time, time);
                    return (
                      <option key={val} value={val} disabled={disabled}>
                        {val}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="ss"
                  className="form-control"
                  value={form.time.ss}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      time: { ...prev.time, ss: e.target.value },
                    }))
                  }
                >
                  <option value="">SS</option>
                  {[...Array(60)].map((_, i) => {
                    const val = String(i).padStart(2, "0");
                    const disabled = isDisabled("ss", i, form.time, time);
                    return (
                      <option key={val} value={val} disabled={disabled}>
                        {val}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="btn_grp">
            <button
              className="btn"
              disabled={
                !isFieldsEmpty(["question", "answer", "time", "solution"])
              }
              onClick={() => {
                const answerList = form?.answer.map((item: any) => item.value);
                createTest({
                  title: `${resourceData?.title}`,
                  questions: [
                    {
                      question: form.question,
                      options: answerList,
                      correct_answer: form.solution,
                    },
                  ],
                  trigger_hours: Number(form?.time.hh),
                  trigger_minutes: Number(form?.time.mm),
                  trigger_seconds: Number(form?.time.ss),
                });
              }}
            >
              Save
            </button>
            <button
              className="btnClose"
              onClick={() => {
                setShowSectionalTestModal(false);
                setForm(defaultForm);
              }}
            >
              {" "}
              <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_436_7813"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="20"
                  height="21"
                >
                  <rect y="0.205078" width="20" height="20" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_436_7813)">
                  <path
                    d="M5.33073 16.0378L4.16406 14.8711L8.83073 10.2044L4.16406 5.53776L5.33073 4.37109L9.9974 9.03776L14.6641 4.37109L15.8307 5.53776L11.1641 10.2044L15.8307 14.8711L14.6641 16.0378L9.9974 11.3711L5.33073 16.0378Z"
                    fill="#666666"
                  />
                </g>
              </svg>
            </button>
          </div>
        </div>
        <div className="form-group mb-3">
          <p>Question</p>
          <input
            type="text"
            className="form-control"
            placeholder="Enter question..."
            onChange={(e) => handleChange("question", e.target.value)}
          />
        </div>
        <div className="form-Answers">
          <p>Answers</p>

          {form?.answer?.map((option: any, index: any) => (
            <div className="option" key={option.id}>
              <div className="radio_bx">
                <input type="radio" name="answer" />
              </div>

              <div className="optionDetails">
                <input
                  className="form-control"
                  value={option.value}
                  placeholder={`Option ${index + 1}`}
                  onChange={(e) => handleInputChange(option.id, e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn"
                onClick={() => handleDeleteOption(option.id)}
              >
                <span>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_1166_30503"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="15"
                      height="15"
                    >
                      <rect width="15" height="15" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_1166_30503)">
                      <path
                        d="M5 11.875H10V5.625H5V11.875ZM3.125 3.75V2.5H5.3125L5.9375 1.875H9.0625L9.6875 2.5H11.875V3.75H3.125ZM5 13.125C4.65625 13.125 4.36208 13.0027 4.1175 12.7581C3.8725 12.5131 3.75 12.2188 3.75 11.875V4.375H11.25V11.875C11.25 12.2188 11.1277 12.5131 10.8831 12.7581C10.6381 13.0027 10.3438 13.125 10 13.125H5Z"
                        fill="#1C1B1F"
                      />
                    </g>
                  </svg>
                </span>{" "}
                Delete
              </button>
            </div>
          ))}

          <button className="btnAdd" onClick={handleAddOption}>
            Add a new option
          </button>
        </div>
        <div className="from-Solution">
          <p>Solution</p>
          <input
            type="text"
            className="form-control"
            placeholder="Enter detailed solution for your students"
            value={form.solution}
            onChange={(e) => handleChange("solution", e.target.value)}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default memo(AddSelectiveTestModal);
