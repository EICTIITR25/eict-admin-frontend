import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDynamicForm } from "../../../hooks/useDynamicForm";
import { validateFields, FieldErrorMap } from "../../../utils/validateFields";
import {
  defaultForm,
  keyMap,
  mapEditedFieldsToApiKeys,
  requiredFieldsMap,
} from "./formConfig";
import { buildFormData } from "../../../utils/buildFormData";
import { useCrud } from "../../../hooks/useCrud";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FAQForm from "../../../components/common/FAQForm";
import { GenericItems } from "../../../types";
import { getErrorMessage } from "../../../utils/helper";
import { setSelectedCourse } from "../../../redux/slices/coursesSlice";
import AddBrouchureModal from "../../../components/common/AddBrouchureModal";
import useTabCloseWarning from "../../../hooks/useTabCloseWarning";
import UploadCertificateModal from "../../../components/common/UploadCertificateModal";
interface AboutField {
  id: number;
  value: string;
}

const AddCoursePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCourse } = useSelector((state: RootState) => state.courses);
  const [isEditMode, setIsEditMode] = useState<boolean>(
    Boolean(selectedCourse?.id)
  );
  const [step, setStep] = useState(1);
  const [faqId, setFaqId] = useState<(string | number)[]>([]);
  const { useCreate, useFetch, useUpdate, useDelete } = useCrud();
  const [courseId, setCourseId] = useState(selectedCourse?.base_course_id);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showEditFAQModal, setShowEditFAQModal] = useState(false);
  const [selectedFAQItem, setSelectedFAQItem] = useState<GenericItems | null>(
    null
  );
  const {
    form,
    handleChange,
    setForm,
    errors,
    setErrors,
    isFieldsEmpty,
    editedFields,
    setOriginalData,
    setEditedFields,
    handleFileChange,
  } = useDynamicForm(defaultForm, isEditMode);
  //CREATE
  const { mutate: createFDPCourse } = useCreate(
    "/courses/fdp-courses/",
    ["/courses/fdp-courses/"],
    {
      onSuccess: (data) => {
        setStep((prev) => prev + 1);
        setCourseId(data?.base_course_id);
        toast.success("FDP created successfully.");
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: createFAQ } = useCreate(
    `/courses/fdp-courses/${courseId}/faqs/`,
    [
      `/courses/fdp-courses/${
        courseId || selectedCourse?.base_course_id
      }/faqs/`,
      "{}",
    ],
    {
      onSuccess: (data) => {
        setShowFAQModal(false);
        setFaqId((prev) => {
          if (prev.includes(data.id)) {
            return prev;
          }
          return [...prev, data.id];
        });
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );

  //GET
  const { data: faqList = [] } = useFetch(
    `/courses/fdp-courses/${courseId}/faqs/`,
    {},
    {
      enabled: !!(courseId || selectedCourse?.id),
      retry: false,
    }
  );

  const { data: courseListById = {} } = useFetch(
    courseId ? `/courses/fdp-courses/${courseId}/` : "",
    {},
    {
      enabled: !!courseId,
      retry: false,
    }
  );

  //DELETE

  const { mutate: deleteFAQ } = useDelete(
    `/courses/fdp-courses/${courseId}/faqs/`,
    `/courses/fdp-courses/${courseId}/faqs/`,
    {
      onSuccess: (data) => {
        setFaqId([]);
      },
    }
  );

  //UPDATE
  const { mutate: updateFAQ } = useUpdate(
    `/courses/fdp-courses/${courseId}/faqs/`,
    `/courses/fdp-courses/${courseId}/faqs/`
  );

  const { mutate: updateFDP } = useUpdate(
    `/courses/fdp-courses/${courseId}/`,
    `/courses/fdp-courses/${courseId}/`,
    {
      onError: (error) => {
        getErrorMessage(error);
      },
      onSuccess: () => {
        toast.success("FDP Course Updated Successfully.");
        navigate("/course-management/all-courses");
      },
    }
  );

  const goToNextStep = () => {
    const requiredFields = buildRequiredFields(step, form, requiredFieldsMap);
    const { isValid, errors } = validateFields(form, requiredFields);

    if (!isValid) {
      setErrors(errors);
      return;
    }
    setErrors({});
    if (step === 1 && !courseId) {
      const formData = buildFormData(form, keyMap, { is_active: true });
      createFDPCourse(formData);
    } else {
      setStep((prev) => prev + 1);
    }
  };
  const goToPreviousStep = () => setStep(step - 1);
  const cancel = () => {
    navigate("/course-management/all-courses");
    // Additional reset logic if needed
  };
  // About fields state
  const [aboutFields, setAboutFields] = useState<AboutField[]>([
    { id: Date.now(), value: "" },
  ]);

  // Derived state: disable Save if all fields are empty
  const isSaveDisabled = aboutFields.every(
    (field) => field.value.trim() === ""
  );

  // Add new input field
  const handleAddField = () => {
    setAboutFields([...aboutFields, { id: Date.now(), value: "" }]);
  };

  // Remove a field
  const handleRemoveField = (id: number) => {
    setAboutFields(aboutFields.filter((field) => field.id !== id));
  };

  // Update field value
  const handleInputChange = (id: number, value: string) => {
    const updatedFields = aboutFields.map((field) =>
      field.id === id ? { ...field, value } : field
    );
    setAboutFields(updatedFields);
  };

  // Handle Save
  const handleSave = () => {
    setShowChapterModal(false);
    setAboutFields([{ id: Date.now(), value: "" }]); // reset after save
  };

  const addCoordinator = () => {
    setForm((prev) => ({
      ...prev,
      coordinators: [
        ...(prev.coordinators || []),
        { name: "", phone: "", department: "" },
      ],
    }));
  };

  const removeCoordinator = (index: number) => {
    setForm((prev) => {
      const updated = [...(prev.coordinators || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        coordinators: updated,
      };
    });
  };

  const handleCoordinatorChange = useCallback(
    (index: number, key: string, value: any) => {
      setForm((prev) => {
        const clonedCoordinators = (prev.coordinators || []).map((c: any) => ({
          ...c,
        }));

        if (!clonedCoordinators[index]) clonedCoordinators[index] = {};
        clonedCoordinators[index][key] = value;

        return {
          ...prev,
          coordinators: clonedCoordinators,
        };
      });

      if (!isEditMode) return;

      setEditedFields((prev) => {
        const prevCoordinators = prev?.coordinators || form.coordinators || [];
        const clonedCoordinators = prevCoordinators.map((c: any) => ({ ...c }));

        if (!clonedCoordinators[index]) clonedCoordinators[index] = {};
        clonedCoordinators[index][key] = value;

        return {
          ...prev,
          coordinators: clonedCoordinators,
        };
      });
    },
    [isEditMode, form.coordinators]
  );

  const buildRequiredFields = (
    step: number,
    form: Record<string, any>,
    staticMap: Record<number, FieldErrorMap>
  ): FieldErrorMap => {
    const staticFields = staticMap[step] || {};
    const dynamicFields: FieldErrorMap = {};

    // if (form.coordinators && Array.isArray(form.coordinators)) {
    //   form.coordinators.forEach((_, index) => {
    //     dynamicFields[`coordinators.${index}.name`] =
    //       "Coordinator name is required";
    //     dynamicFields[`coordinators.${index}.phone`] =
    //       "Coordinator phone is required";
    //     dynamicFields[`coordinators.${index}.department`] =
    //       "Coordinator department is required";
    //   });
    // }

    return { ...staticFields, ...dynamicFields };
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isEditMode && Object.keys(editedFields).length > 0) {
      const dataToSend = mapEditedFieldsToApiKeys(editedFields);
      const formData = buildFormData(editedFields, dataToSend);
      updateFDP({
        data: formData,
      });
    } else {
      toast.success("FDP Course Created Successfully.");
      navigate("/course-management/all-courses");
    }
  };

  const handleCheckboxSelect = (field: string, value: string) => {
    handleChange(field, value === form[field] ? "" : value); // toggle on same click
  };

  const handleFaqSubmit = (faq: GenericItems) => {
    if (faq.id) {
      updateFAQ({ id: faq.id, data: faq });
    } else {
      const { id, ...payload } = faq;
      createFAQ(payload);
    }
  };
  useEffect(() => {
    if (courseListById && Object.keys(courseListById).length > 0) {
      dispatch(setSelectedCourse(courseListById));
      setIsEditMode(Boolean(courseListById?.id));
    }
  }, [courseListById, dispatch, isEditMode]);
  useEffect(() => {
    if (selectedCourse) {
      const initialForm = {
        name: selectedCourse?.title || "",
        description: selectedCourse?.description || "",
        venue: selectedCourse?.venue_type || "",
        course_venue: selectedCourse?.course_venue || "",
        hub_venue: selectedCourse?.hub_venue || "",
        spoke_venue: selectedCourse?.spoke_venue || "",
        conference_code: selectedCourse?.conference_code || "",
        start_from:
          new Date(selectedCourse?.start_date).toISOString().slice(0, 10) || "",
        end_date:
          new Date(selectedCourse?.end_date).toISOString().slice(0, 10) || "",
        deadline:
          new Date(selectedCourse?.application_deadline)
            .toISOString()
            .slice(0, 10) || "",
        investigator_name: selectedCourse?.investigator_name || "",
        investigator_email: selectedCourse?.investigator_email || "",
        investigator_phone: selectedCourse?.investigator_phone || "",
        sale_price: selectedCourse?.sales_price || "",
        gst: selectedCourse?.gst_percentage || "0",
        brochure_file: selectedCourse?.brochure || "",
        coordinators:
          selectedCourse?.coordinators?.length > 0
            ? selectedCourse?.coordinators
            : [{ name: "", phone: "", department: "" }],
        cover_media_file: selectedCourse?.cover_media,
        total_price: selectedCourse?.total_price || "",
      };
      setForm(initialForm);
      setOriginalData(initialForm);
    }
  }, [selectedCourse]);
  const shouldWarn = isEditMode
    ? Object.keys(editedFields).length > 0
    : Object.values(form).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string") return val.trim() !== "";
        if (val instanceof File) return true;
        return true;
      });
  useTabCloseWarning({ shouldWarn });
  useEffect(() => {
    const salePrice = Number(form["sale_price"]);
    const gst = Number(form["gst"]);
    const total = salePrice + (salePrice * gst) / 100;
    handleChange("total_price", total.toFixed(2));
  }, [form["sale_price"], form["gst"]]);
  return (
    <>
      {step === 1 && (
        <div className="admin_panel step1">
          <div className="Breadcrumbs">
            <h3>Add Course 1/2 (FDP Course)</h3>
            <div className="btn_grp">
              <button
                className="btn"
                onClick={cancel}
                style={{ color: "#000", background: "#e5e5e5" }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={goToNextStep}
                disabled={
                  !isFieldsEmpty([
                    "name",
                    "description",
                    "venue",
                    "conference_code",
                    "start_from",
                    "deadline",
                    "gst",
                    "end_date",
                    "sale_price",
                    "investigator_name",
                    "investigator_email",
                    "investigator_phone",
                    "brochure_file",
                    "cover_media_file",
                  ])
                }
              >
                Next
              </button>
            </div>
          </div>
          <div className="course_details">
            <div className="course_details_user">
              <div className="user_image">
                <label htmlFor="Photo" className="icon">
                  {form.cover_media_file ? (
                    <img
                      src={
                        typeof form.cover_media_file === "string"
                          ? form.cover_media_file
                          : URL.createObjectURL(form.cover_media_file)
                      }
                      alt="avatar"
                    />
                  ) : (
                    <svg
                      width="69"
                      height="69"
                      viewBox="0 0 69 69"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_931_14614)">
                        <path
                          d="M54.3646 14.7487V54.4154H14.6979V14.7487H54.3646ZM54.3646 9.08203H14.6979C11.5812 9.08203 9.03125 11.632 9.03125 14.7487V54.4154C9.03125 57.532 11.5812 60.082 14.6979 60.082H54.3646C57.4812 60.082 60.0312 57.532 60.0312 54.4154V14.7487C60.0312 11.632 57.4812 9.08203 54.3646 9.08203ZM40.5946 34.1854L32.0946 45.1504L26.0312 37.812L17.5312 48.7487H51.5312L40.5946 34.1854Z"
                          fill="#666666"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_931_14614">
                          <rect
                            width="68"
                            height="68"
                            fill="white"
                            transform="translate(0.53125 0.582031)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
                  <div className="upload_btn">
                    <label>
                      <input
                        type="file"
                        name="Upload"
                        id="Photo"
                        accept="image/*,video/*"
                        onChange={(e) =>
                          handleFileChange(e, "cover_media_file")
                        }
                      />
                      {form.cover_media_file ? (
                        <span>Edit Photo/Video</span>
                      ) : (
                        <span>Upload Photo/Video</span>
                      )}
                    </label>
                  </div>
                </label>
                <h3>{form.name}</h3>
              </div>
            </div>
            <div className="fromSection">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Name"
                      value={form["name"] || selectedCourse?.title}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Course Description"
                      value={form["description"]}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Venue</label>
                    <div className="Courses_checkbx">
                      <label htmlFor="all">
                        <input
                          type="checkbox"
                          id="all"
                          checked={form.venue === "Online"}
                          onChange={() =>
                            handleCheckboxSelect("venue", "Online")
                          }
                        />
                        <span>Online</span>
                      </label>
                      <label htmlFor="self">
                        <input
                          type="checkbox"
                          id="self"
                          checked={form.venue === "Hybrid"}
                          onChange={() =>
                            handleCheckboxSelect("venue", "Hybrid")
                          }
                        />
                        <span>Hybrid</span>
                      </label>
                      <label htmlFor="stt">
                        <input
                          type="checkbox"
                          id="stt"
                          checked={form.venue === "Physical"}
                          onChange={() =>
                            handleCheckboxSelect("venue", "Physical")
                          }
                        />
                        <span>Physical</span>
                      </label>
                    </div>
                    {errors.venue && (
                      <p style={{ color: "red" }}>{errors.venue}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter venue"
                      value={form["course_venue"]}
                      onChange={(e) =>
                        handleChange("course_venue", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Hub Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter venue"
                      value={form["hub_venue"]}
                      onChange={(e) =>
                        handleChange("hub_venue", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Spoke Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter venue"
                      value={form["spoke_venue"]}
                      onChange={(e) =>
                        handleChange("spoke_venue", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="from-group mb-3">
                    <label>Conference code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder=""
                      value={form["conference_code"]}
                      onChange={(e) =>
                        handleChange("conference_code", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label>Start From</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder=""
                      value={form["start_from"]}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        handleChange("start_from", e.target.value);
                        if (
                          !newDate ||
                          (form.end_date && form.end_date <= newDate)
                        ) {
                          handleChange("end_date", "");
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder=""
                      value={form["end_date"]}
                      disabled={!form.start_from}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                      min={form.start_from || undefined}
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="from-group mb-3">
                    <label>Chief Investigator (IIT Roorkee)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name"
                      value={form["investigator_name"]}
                      onChange={(e) =>
                        handleChange("investigator_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="from-group mb-3">
                    <input
                      type="email"
                      value={form["investigator_email"]}
                      onChange={(e) =>
                        handleChange("investigator_email", e.target.value)
                      }
                      className="form-control"
                      placeholder="Email"
                    />
                  </div>
                  <div className="from-group mb-3">
                    <input
                      type="tel"
                      maxLength={10}
                      value={form["investigator_phone"]}
                      onKeyPress={(e) => {
                        // Sirf numbers allow karo
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) =>
                        handleChange("investigator_phone", e.target.value)
                      }
                      className="form-control"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                {form?.coordinators.map((coord: any, index: number) => (
                  <div className="col-lg-6 col-md-12" key={index}>
                    <div className="from-group mb-3">
                      <div className="hd_bx">
                        <label>Course Coordinator {index + 1}</label>
                        {index === 0 ? (
                          <button
                            className="btn"
                            onClick={addCoordinator}
                            style={{ color: " #023e64" }}
                          >
                            + Add More
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn text-danger"
                            onClick={() => removeCoordinator(index)}
                          >
                            - Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Name"
                        className="form-control"
                        value={coord.name}
                        onChange={(e) =>
                          handleCoordinatorChange(index, "name", e.target.value)
                        }
                      />
                      {/* {errors[`coordinators.${index}.name`] && (
                        <p style={{ color: "red" }}>
                          {errors[`coordinators.${index}.name`]}
                        </p>
                      )} */}
                    </div>
                    <div className="from-group mb-3">
                      <input
                        type="tel"
                        maxLength={10}
                        onKeyPress={(e) => {
                          // Sirf numbers allow karo
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="Phone number"
                        className="form-control"
                        value={coord.phone}
                        onChange={(e) =>
                          handleCoordinatorChange(
                            index,
                            "phone",
                            e.target.value
                          )
                        }
                      />
                      {/* {errors[`coordinators.${index}.phone`] && (
                        <p style={{ color: "red" }}>
                          {errors[`coordinators.${index}.phone`]}
                        </p>
                      )} */}
                    </div>
                    <div className="from-group mb-3">
                      <input
                        type="text"
                        placeholder="Department and University"
                        className="form-control"
                        value={coord.department}
                        onChange={(e) =>
                          handleCoordinatorChange(
                            index,
                            "department",
                            e.target.value
                          )
                        }
                      />
                      {/* {errors[`coordinators.${index}.department`] && (
                        <p style={{ color: "red" }}>
                          {errors[`coordinators.${index}.department`]}
                        </p>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="row">
                <div className="col-lg-6 col-md-12">
                  <label htmlFor="">Last Date Registrarion</label>
                  <div className="from-group mb-3">
                    <input
                      type="date"
                      value={form["deadline"]}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      className="form-control"
                      disabled={!form["end_date"]}
                      placeholder="Department and University"
                      min={new Date().toISOString().split("T")[0]}
                      max={form.start_from}
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-12 relative">
                  <label htmlFor="">FDP Fees</label>
                  <div className="from-group mb-3">
                    <input
                      type="number"
                      name="category"
                      className="form-control"
                      value={form["sale_price"]}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) =>
                        handleChange("sale_price", e.target.value)
                      }
                    />
                    <span
                      className="icon"
                      style={{ left: "15px", top: "34px" }}
                    >
                      ₹{" "}
                    </span>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12 relative">
                  <label htmlFor="">GST%</label>
                  <div className="from-group mb-3">
                    <input
                      type="number"
                      name="category"
                      className="form-control"
                      value={form["gst"]}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => handleChange("gst", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-12 relative">
                  <label htmlFor="">Course Fees</label>
                  <div className="from-group mb-3">
                    <input
                      disabled
                      type="number"
                      name="category"
                      className="form-control"
                      value={form["total_price"]}
                    />
                  </div>
                </div>
                <AddBrouchureModal
                  brochureFile={form?.brochure_file}
                  onFileChange={(e) => handleFileChange(e, "brochure_file")}
                  onRemove={() =>
                    setForm((prev) => ({ ...prev, brochure_file: null }))
                  }
                />

                <div className="btn_grp">
                  <button
                    className="btn"
                    disabled={
                      !isFieldsEmpty([
                        "name",
                        "description",
                        "venue",
                        "conference_code",
                        "start_from",
                        "deadline",
                        "end_date",
                        "gst",
                        "sale_price",
                        "investigator_name",
                        "investigator_email",
                        "investigator_phone",
                        "brochure_file",
                        "cover_media_file",
                      ])
                    }
                    onClick={goToNextStep}
                  >
                    Next
                  </button>
                  <button className="btn" onClick={cancel}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="admin_panel step2">
          <div className="Breadcrumbs">
            <h3>Add Course 2/2 (FDP Course)</h3>
            <div className="btn_grp">
              <button
                className="btn"
                // disabled={courseId ? true : false}
                onClick={goToPreviousStep}
                style={{ color: "#000", background: "#e5e5e5" }}
              >
                Previous
              </button>
              <button className="btn" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
          <div className="course_details">
            <div className="course_details_user">
              <div className="user_image">
                <div className="icon">
                  <img
                    src={
                      typeof form.cover_media_file === "string"
                        ? form.cover_media_file
                        : URL.createObjectURL(form.cover_media_file)
                    }
                    alt="avatar"
                  />
                </div>
                <h3>{form.name}</h3>
              </div>
            </div>
            <div className="fromSection fromSection2">
              <div className="CardfromSection">
                <div className="head_bx">
                  <h3>Frequently Asked Questions</h3>
                  <div className="rgt_bx">
                    <button
                      className="btn"
                      onClick={() => setShowFAQModal(true)}
                    >
                      Add New FAQ
                    </button>
                    <button
                      className="btnDelate"
                      disabled={!faqId}
                      onClick={() => {
                        deleteFAQ({
                          body: {
                            faq_ids: faqId,
                          },
                        });
                      }}
                    >
                      <svg
                        width="14"
                        height="15"
                        viewBox="0 0 14 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.15426 0.518262C4.31784 0.200625 4.6541 0 5.02065 0H8.66797C9.03452 0 9.37077 0.200625 9.53436 0.518262L9.75247 0.9375H12.6606C13.1968 0.9375 13.63 1.35732 13.63 1.875C13.63 2.39268 13.1968 2.8125 12.6606 2.8125H1.02798C0.492698 2.8125 0.0585938 2.39268 0.0585938 1.875C0.0585938 1.35732 0.492698 0.9375 1.02798 0.9375H3.93614L4.15426 0.518262ZM1.00072 3.75H12.6606V13.125C12.6606 14.1592 11.7912 15 10.7219 15H2.93949C1.89589 15 1.00072 14.1592 1.00072 13.125V3.75ZM3.42419 6.09375V12.6562C3.42419 12.9141 3.66956 13.125 3.90888 13.125C4.20273 13.125 4.39357 12.9141 4.39357 12.6562V6.09375C4.39357 5.83594 4.20273 5.625 3.90888 5.625C3.66956 5.625 3.42419 5.83594 3.42419 6.09375ZM6.33235 6.09375V12.6562C6.33235 12.9141 6.57773 13.125 6.81704 13.125C7.11089 13.125 7.329 12.9141 7.329 12.6562V6.09375C7.329 5.83594 7.11089 5.625 6.81704 5.625C6.57773 5.625 6.33235 5.83594 6.33235 6.09375ZM9.26778 6.09375V12.6562C9.26778 12.9141 9.48589 13.125 9.75247 13.125C10.0191 13.125 10.2372 12.9141 10.2372 12.6562V6.09375C10.2372 5.83594 10.0191 5.625 9.75247 5.625C9.48589 5.625 9.26778 5.83594 9.26778 6.09375Z"
                          fill="#344563"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="listFaq">
                  {faqList?.results?.map((item: any, faqIndex: number) => (
                    <div className="card_item">
                      <div className="Courses_checkbx d-block">
                        <label htmlFor={`faq-${faqIndex}`}>
                          <input
                            type="checkbox"
                            id={`faq-${faqIndex}`}
                            value={item?.id}
                            checked={faqId.some((id) => id === item.id)}
                            onChange={() => {
                              const isSelected = faqId.includes(item.id);
                              const updatedFaqIds = isSelected
                                ? faqId.filter((id) => id !== item.id)
                                : [...faqId, item.id];

                              setFaqId(updatedFaqIds);
                            }}
                          />
                          <span></span>
                        </label>
                      </div>
                      <div className="content">
                        <h3>
                          <span>
                            <svg
                              width="21"
                              height="21"
                              viewBox="0 0 21 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <mask
                                id="mask0_4084_5585"
                                maskUnits="userSpaceOnUse"
                                x="0"
                                y="0"
                                width="21"
                                height="21"
                              >
                                <rect
                                  x="0.03125"
                                  y="0.871094"
                                  width="20"
                                  height="20"
                                  fill="#D9D9D9"
                                />
                              </mask>
                              <g mask="url(#mask0_4084_5585)">
                                <path
                                  d="M10.0286 14.2038L13.362 10.8704L12.1953 9.70378L10.862 11.0371V7.53711H9.19531V11.0371L7.86198 9.70378L6.69531 10.8704L10.0286 14.2038ZM10.0286 19.2038C8.87587 19.2038 7.79253 18.9849 6.77865 18.5471C5.76476 18.1099 4.88281 17.5163 4.13281 16.7663C3.38281 16.0163 2.7892 15.1343 2.35198 14.1204C1.9142 13.1066 1.69531 12.0232 1.69531 10.8704C1.69531 9.71766 1.9142 8.63433 2.35198 7.62044C2.7892 6.60655 3.38281 5.72461 4.13281 4.97461C4.88281 4.22461 5.76476 3.63072 6.77865 3.19294C7.79253 2.75572 8.87587 2.53711 10.0286 2.53711C11.1814 2.53711 12.2648 2.75572 13.2786 3.19294C14.2925 3.63072 15.1745 4.22461 15.9245 4.97461C16.6745 5.72461 17.2681 6.60655 17.7053 7.62044C18.1431 8.63433 18.362 9.71766 18.362 10.8704C18.362 12.0232 18.1431 13.1066 17.7053 14.1204C17.2681 15.1343 16.6745 16.0163 15.9245 16.7663C15.1745 17.5163 14.2925 18.1099 13.2786 18.5471C12.2648 18.9849 11.1814 19.2038 10.0286 19.2038ZM10.0286 17.5371C11.8759 17.5371 13.4489 16.8879 14.7478 15.5896C16.0461 14.2907 16.6953 12.7177 16.6953 10.8704C16.6953 9.02322 16.0461 7.45016 14.7478 6.15128C13.4489 4.85294 11.8759 4.20378 10.0286 4.20378C8.18142 4.20378 6.60865 4.85294 5.31031 6.15128C4.01142 7.45016 3.36198 9.02322 3.36198 10.8704C3.36198 12.7177 4.01142 14.2907 5.31031 15.5896C6.60865 16.8879 8.18142 17.5371 10.0286 17.5371Z"
                                  fill="#1C1B1F"
                                />
                              </g>
                            </svg>
                          </span>{" "}
                          {item.question}
                        </h3>
                        <button
                          className="btnEdit"
                          onClick={() => {
                            setSelectedFAQItem(item);
                            setShowEditFAQModal(true);
                            setFaqId([]);
                          }}
                        >
                          <svg
                            width="21"
                            height="21"
                            viewBox="0 0 21 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <mask
                              id="mask0_4084_5589"
                              maskUnits="userSpaceOnUse"
                              x="0"
                              y="0"
                              width="21"
                              height="21"
                            >
                              <rect
                                x="0.03125"
                                y="0.871094"
                                width="20"
                                height="20"
                                fill="#D9D9D9"
                              />
                            </mask>
                            <g mask="url(#mask0_4084_5589)">
                              <path
                                d="M4.19792 16.7038H5.36458L13.7396 8.34961L13.1562 7.74544L12.5521 7.16211L4.19792 15.5371V16.7038ZM2.53125 18.3704V14.8288L13.7396 3.64128C14.059 3.32183 14.4515 3.16211 14.9171 3.16211C15.3821 3.16211 15.7743 3.32183 16.0937 3.64128L17.2604 4.82878C17.5799 5.14822 17.7396 5.53711 17.7396 5.99544C17.7396 6.45378 17.5799 6.84266 17.2604 7.16211L6.07292 18.3704H2.53125ZM13.7396 8.34961L13.1562 7.74544L12.5521 7.16211L13.7396 8.34961Z"
                                fill="#1C1B1F"
                              />
                            </g>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <UploadCertificateModal
                courseId={courseId}
                sampleCertificate={
                  selectedCourse?.sample_certificate?.certificate_url
                }
                certificateId={"EICTIITR-FDP"}
              />
            </div>
          </div>
        </div>
      )}
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
                {aboutFields.map((field, index) => (
                  <div className="from-groug" key={field.id}>
                    <label>{index === 0 && "About course"}</label>
                    <div className="About_plus_mins d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter"
                        value={field.value}
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
                      />
                      {index === 0 ? (
                        <button
                          className="AddInput btn btn-success"
                          type="button"
                          onClick={handleAddField}
                        >
                          Add
                        </button>
                      ) : (
                        <button
                          className="RemoveInput btn btn-danger"
                          type="button"
                          onClick={() => handleRemoveField(field.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp d-flex justify-content-end gap-2">
                  <button
                    className="btn"
                    disabled={isSaveDisabled}
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="btn"
                    onClick={() => setShowChapterModal(false)}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <FAQForm
        item={null}
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        onSubmit={handleFaqSubmit}
      />
      <FAQForm
        item={selectedFAQItem}
        isOpen={showEditFAQModal}
        onClose={() => setShowEditFAQModal(false)}
        onSubmit={handleFaqSubmit}
      />
    </>
  );
};

export default AddCoursePage;
