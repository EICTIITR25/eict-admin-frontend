/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import assets from "../../../assets";
import {
  defaultForm,
  keyMap,
  mapEditedFieldsToApiKeys,
  requiredFieldsMap,
} from "./formConfig";
import { useDynamicForm } from "../../../hooks/useDynamicForm";
import { useCrud } from "../../../hooks/useCrud";
import { validateFields } from "../../../utils/validateFields";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { buildFormData } from "../../../utils/buildFormData";
import { GenericItems } from "../../../types";
import FAQForm from "../../../components/common/FAQForm";
import { Modal } from "react-bootstrap";
import AddFeatureModal from "../../../components/common/AddFeatureModal";
import AddWhoJoin from "../../../components/common/AddWhoJoin";
import { getErrorMessage } from "../../../utils/helper";
import { setSelectedCourse } from "../../../redux/slices/coursesSlice";
import AddBrouchureModal from "../../../components/common/AddBrouchureModal";
import useTabCloseWarning from "../../../hooks/useTabCloseWarning";
interface Option {
  label: string;
  value: string;
}

const AddCoursePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCourse } = useSelector((state: RootState) => state.courses);
  const [isEditMode, setIsEditMode] = useState<boolean>(
    Boolean(selectedCourse?.id)
  );
  const { useCreate, useFetch, useUpdate, useDelete } = useCrud();
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(selectedCourse?.base_course_id);
  const [selectedItem, setSelectedItem] = useState<GenericItems | null>(null);
  const [faqId, setFaqId] = useState<(string | number)[]>([]);
  const [moduleId, setModuleId] = useState("");
  const {
    form,
    handleChange,
    setForm,
    errors,
    setErrors,
    isFieldsEmpty,
    setOriginalData,
    editedFields,
    handleFileChange,
  } = useDynamicForm(defaultForm, isEditMode);

  //CREATE
  const { mutate: createHighlight } = useCreate(
    "/courses/highlights/",
    "/courses/highlights/"
  );
  const { mutate: createBenifit } = useCreate(
    "/courses/benefits/",
    "/courses/benefits/"
  );
  const { mutate: createEictCourse } = useCreate(
    "/courses/eict-third-party-courses/",
    [`/courses/eict-third-party-courses/`],
    {
      onSuccess: (data) => {
        setStep((prev) => prev + 1);
        setCourseId(data?.base_course_id);
        toast.success("Added Successfully.");
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: createFAQ } = useCreate(
    `/courses/eict-third-party-courses/${courseId || selectedCourse?.base_course_id
    }/faqs/`,
    [
      `/courses/eict-third-party-courses/${courseId || selectedCourse?.base_course_id
      }/faqs/`,
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

  const { mutate: createModule } = useCreate(
    `/courses/courses/${courseId || selectedCourse?.base_course_id
    }/curriculum/`,
    [
      `/courses/courses/${courseId || selectedCourse?.base_course_id
      }/curriculum/`,
    ],
    {
      onSuccess: () => {
        setShowModule(false);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: createProgramFor } = useCreate(
    "/courses/program-for/",
    "/courses/program-for/"
  );

  //GET
  const { data: product_code = {} } = useFetch(
    !courseId ? `/courses/latest-product-codes?category_id=6` : "",
    {},
    {
      enabled: !!!courseId,
      retry: false,
    }
  );

  const { data: featureList = [] } = useFetch(
    `/courses/features/?type=eict-third-party`,
    {},
    {
      retry: false,
    }
  );
  const { data: facultyList = [] } = useFetch(
    `/faculties/list/`,
    {},
    {
      retry: false,
    }
  );
  const { data: faqList = [] } = useFetch(
    `/courses/eict-third-party-courses/${courseId || selectedCourse?.base_course_id
    }/faqs/`,
    {},
    {
      enabled: !!(courseId || selectedCourse?.id),
      retry: false,
    }
  );
  const { data: moduleList = [] } = useFetch(
    `/courses/courses/${courseId || selectedCourse?.base_course_id
    }/curriculum/`,
    {},
    {
      enabled: !!(courseId || selectedCourse?.id),
      retry: false,
    }
  );
  const { data: courseListById = {} } = useFetch(
    courseId ? `/courses/eict-third-party-courses/${courseId}/` : "",
    {},
    {
      enabled: !!courseId,
      retry: false,
    }
  );
  const { data: benifits = [] } = useFetch("/courses/benefits/");
  const { data: highlights = [] } = useFetch("/courses/highlights/");
  const { data: program_for = [] } = useFetch("/courses/program-for/");
  const { data: whoJoin = [] } = useFetch("/courses/why-should-i-join/", {});
  //DELETE
  const { mutate: deleteModule } = useDelete(
    `/courses/curriculum/`,
    `/courses/courses/${courseId}/curriculum/`
  );

  const { mutate: deleteFAQ } = useDelete(
    `/courses/eict-third-party-courses/${courseId}/faqs/`,
    `/courses/eict-third-party-courses/${courseId}/faqs/`,
    {
      onSuccess: (data) => {
        setFaqId([]);
      },
    }
  );

  //UPDATE
  const { mutate: updateHighlights } = useUpdate(
    `/courses/highlights/${courseId}/`,
    `/courses/highlights/${courseId}/`
  );

  const { mutate: updateBenifits } = useUpdate(
    `/courses/benefits/${courseId}/`,
    `/courses/benefits/${courseId}/`
  );

  const { mutate: updateFAQ } = useUpdate(
    `/courses/eict-third-party-courses/${courseId}/faqs/`,
    `/courses/eict-third-party-courses/${courseId}/faqs/`
  );

  const { mutate: updateModule } = useUpdate(
    `/courses/curriculum/`,
    `/courses/curriculum/`
  );
  const { mutate: updateProgramFor } = useUpdate(
    `/courses/program-for/${courseId}/`,
    `/courses/program-for/${courseId}/`
  );

  const { mutate: updateEICT } = useUpdate(
    `/courses/eict-third-party-courses/${courseId}/`,
    [`/courses/eict-third-party-courses/${courseId}/`, "{}"],
    {
      onError: (error) => {
        getErrorMessage(error);
      },
      onSuccess: () => {
        toast.success("Third Party Course Updated Successfully.");
        navigate("/course-management/all-courses");
      },
    }
  );

  const goToNextStep = () => {
    const requiredFields = requiredFieldsMap[step];
    const { isValid, errors } = validateFields(form, requiredFields);

    if (!isValid) {
      setErrors(errors);
      return;
    }
    setErrors({});
    if (step === 1 && !courseId) {
      const formData = buildFormData(form, keyMap);
      createEictCourse(formData);
    } else {
      setStep((prev) => prev + 1);
    }
  };
  const goToPreviousStep = () => setStep(step - 1);
  const cancel = () => {
    navigate("/course-management/all-courses");
  };
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [showEditHighlightsModal, setShowEditHighlightsModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showEditBenefitsModal, setShowEditBenefitsModal] = useState(false);
  const [showprogramModal, setShowprogramModal] = useState(false);
  const [showEditprogramModal, setShowEditprogramModal] = useState(false);
  const [showWhoJoin, setShowWhoJoin] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showModule, setShowModule] = useState(false);
  const [showEditModule, setShowEditModule] = useState(false);
  const [showEditFAQModal, setShowEditFAQModal] = useState(false);

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

  const handleHighlightsSubmit = (highlights: GenericItems) => {
    if (highlights.id) {
      updateHighlights({ id: highlights.id, data: highlights });
    } else {
      const { id, ...payload } = highlights;
      createHighlight(payload);
    }
  };

  const handleBenifitsSubmit = (benifits: GenericItems) => {
    if (benifits.id) {
      updateBenifits({ id: benifits.id, data: benifits });
    } else {
      const { id, ...payload } = benifits;
      createBenifit(payload);
    }
  };

  const handleModuleSubmit = (module: GenericItems) => {
    if (module.id) {
      const updateBody = {
        title: module.question,
        description: module.answer,
        is_active: true,
      };
      updateModule({ id: module.id, data: updateBody });
    } else {
      const { id, ...payload } = module;
      const curriculum_data = [
        {
          title: payload.question,
          description: payload.answer,
          is_active: true,
        },
      ];
      createModule({ curriculum_data: curriculum_data });
    }
  };

  const handleProgramForSubmit = (programFor: GenericItems) => {
    if (programFor.id) {
      updateProgramFor({ id: programFor.id, data: programFor });
    } else {
      const { id, ...payload } = programFor;
      createProgramFor(payload);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isEditMode && Object.keys(editedFields).length > 0) {
      const dataToSend = mapEditedFieldsToApiKeys(editedFields);
      const formData = buildFormData(editedFields, dataToSend);
      updateEICT({
        data: formData,
      });
    } else {
      toast.success("Third Party Course Created Successfully.");
      navigate("/course-management/all-courses");
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
      const selectedCourseIds =
        selectedCourse?.features?.map((item: any) => item.id) || [];
      const selectedHiglightes = selectedCourse?.course_highlights?.map(
        (item: any) => item.id || []
      );
      const selectedWhyShouldJoin = selectedCourse?.why_should_i_join?.map(
        (item: any) => item.id || []
      );
      const selectedProgramFor = selectedCourse?.program_for?.map(
        (item: any) => item.id || []
      );
      const selectedProgramBenifits = selectedCourse?.course_benefits?.map(
        (item: any) => item.id || []
      );
      const selectedFacultyId =
        selectedCourse?.faculty?.map((item: any) => item.id) || [];
      const initialForm = {
        name: selectedCourse.title || "",
        cover_media_file: selectedCourse?.cover_media,
        description: selectedCourse?.description || "",
        duration: selectedCourse?.course_duration || "",
        course_tags: selectedCourse?.course_tags || "",
        course_sub_headings: selectedCourse?.course_sub_headings || "",
        course_feature: selectedCourseIds,
        why_should_i_join: selectedWhyShouldJoin,
        course_highlights: selectedHiglightes,
        program_for: selectedProgramFor,
        product_code: selectedCourse?.product_code || "",
        start_from:
          new Date(selectedCourse.start_date).toISOString().slice(0, 10) || "",
        end_date:
          new Date(selectedCourse.end_date).toISOString().slice(0, 10) || "",
        deadline:
          new Date(selectedCourse.application_deadline)
            .toISOString()
            .slice(0, 10) || "",
        sale_price: selectedCourse?.sales_price || "",
        gst: selectedCourse?.gst_percentage || "",
        total_fees: selectedCourse?.total_price || "",
        educator: selectedFacultyId || [],
        program_benifits: selectedProgramBenifits,
        brochure_file: selectedCourse?.brochure || "",
        payment_link: selectedCourse?.payment_link || ""
      };
      setForm(initialForm);
      setOriginalData(initialForm);
      setSelectedOptions(selectedCourse?.faculty);
    }
  }, [selectedCourse]);

  useEffect(() => {
    const salePrice = Number(form["sale_price"]);
    const gst = Number(form["gst"]);
    const total = salePrice + (salePrice * gst) / 100;
    handleChange("total_fees", total.toFixed(2));
  }, [form["sale_price"], form["gst"]]);

  useEffect(() => {
    if (product_code && !courseId) {
      setForm((prev) => ({ ...prev, product_code: product_code?.code }));
    }
  }, [product_code]);
  const shouldWarn = isEditMode
    ? Object.keys(editedFields).length > 0
    : Object.values(form).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === "string") return val.trim() !== "";
      if (val instanceof File) return true;
      return true;
    });
  useTabCloseWarning({ shouldWarn });

  const [selectedOptions, setSelectedOptions] = useState<GenericItems[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleOptionSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const selectedValue = Number(e.currentTarget.dataset.value);
    const selectedOption = facultyList?.results?.find(
      (option: any) => option.id === selectedValue
    );

    if (selectedOption) {
      const alreadySelected = selectedOptions.some(
        (option) => option.id === selectedOption.id
      );

      if (!alreadySelected) {
        setSelectedOptions((prevSelected) => [...prevSelected, selectedOption]);
        handleChange("educator", [...(form.educator || []), selectedOption.id]);
      }
    }
  };

  const handleOptionRemove = (value: string) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.filter((option) => option.id !== value)
    );
    const updatedEducators = form.educator.filter(
      (option: any) => option !== Number(value)
    );
    handleChange("educator", updatedEducators);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {step === 1 && (
        <div className="admin_panel step1">
          <div className="Breadcrumbs">
            <h3>Add Course 1/3 (EICT Third Party)</h3>
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
                disabled={
                  !isFieldsEmpty([
                    "name",
                    "description",
                    "duration",
                    "course_tags",
                    "course_sub_headings",
                    "why_should_i_join",
                    "course_highlights",
                    "course_feature",
                    "program_for",
                    "product_code",
                    "start_from",
                    "deadline",
                    "sale_price",
                    "gst",
                    "total_fees",
                    "educator",
                    "brochure_file",
                    "end_date",
                    "program_benifits",
                    "cover_media_file",
                  ])
                }
                onClick={goToNextStep}
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
                      <span>Upload Photo/Video</span>
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
                      value={form["name"] || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    {errors?.name && (
                      <p style={{ color: "red" }}>{errors.name}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Name"
                      value={form["description"] || ""}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                    {errors?.description && (
                      <p style={{ color: "red" }}>{errors.description}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter"
                      value={form["course_tags"] || ""}
                      onChange={(e) =>
                        handleChange("course_tags", e.target.value)
                      }
                    />
                    {errors?.course_tags && (
                      <p style={{ color: "red" }}>{errors.course_tags}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Sub Heading</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter"
                      value={form["course_sub_headings"] || ""}
                      onChange={(e) =>
                        handleChange("course_sub_headings", e.target.value)
                      }
                    />
                    {errors?.course_sub_headings && (
                      <p style={{ color: "red" }}>
                        {errors.course_sub_headings}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <div className="hd_bx">
                      <label>Why Should Join this Course</label>
                      <button
                        className="btn"
                        onClick={() => setShowWhoJoin(true)}
                        style={{ color: " #023e64" }}
                      >
                        + Add More
                      </button>
                    </div>
                    <div className="Courses_checkbx">
                      {whoJoin?.map((item: any) => (
                        <label>
                          <input
                            type="checkbox"
                            id={`course-${item.id}`}
                            checked={form.why_should_i_join.includes(item.id)}
                            onChange={() => {
                              const isSelected =
                                form.why_should_i_join.includes(item.id);
                              const updatedCourseIds = isSelected
                                ? form.why_should_i_join.filter(
                                  (id: any) => id !== item.id
                                )
                                : [...form.why_should_i_join, item.id];

                              handleChange(
                                "why_should_i_join",
                                updatedCourseIds
                              );
                            }}
                          />

                          <span>{item?.title}</span>
                        </label>
                      ))}
                    </div>
                    {errors?.why_should_i_join && (
                      <p style={{ color: "red" }}>{errors.why_should_i_join}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <div className="hd_bx">
                      <label>Course Benifits</label>
                      <button
                        className="btn"
                        onClick={() => setShowChapterModal(true)}
                        style={{ color: " #023e64" }}
                      >
                        + Add More
                      </button>
                    </div>
                    <div className="Courses_checkbx">
                      {featureList?.results?.map((item: any) => (
                        <label>
                          <input
                            type="checkbox"
                            id={`course_feature-${item.id}`}
                            checked={form.course_feature.includes(item.id)}
                            onChange={() => {
                              const isSelected = form.course_feature.includes(
                                item.id
                              );
                              const updatedCourseIds = isSelected
                                ? form.course_feature.filter(
                                  (id: any) => id !== item.id
                                )
                                : [...form.course_feature, item.id];

                              handleChange("course_feature", updatedCourseIds);
                            }}
                          />
                          <span>{item.name}</span>
                        </label>
                      ))}
                    </div>
                    {errors?.course_feature && (
                      <p style={{ color: "red" }}>{errors.course_feature}</p>
                    )}
                  </div>
                </div>

                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label>Product Code</label>
                    <input
                      type="text"
                      disabled
                      value={form["product_code"] || ""}
                      // onChange={(e) =>
                      //   handleChange("product_code", e.target.value)
                      // }
                      className="form-control"
                    />
                    {errors?.product_code && (
                      <p style={{ color: "red" }}>{errors.product_code}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label>Start From</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder="dd/mm/yyyy"
                      value={form["start_from"] || ""}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        handleChange("start_from", newDate);
                        if (!newDate) {
                          handleChange("deadline", "");
                          handleChange("end_date", "");
                        }
                      }}
                    />
                    {errors?.start_from && (
                      <p style={{ color: "red" }}>{errors.start_from}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder="dd/mm/yyyy"
                      disabled={!form.start_from}
                      min={form["start_from"] || undefined}
                      value={form["end_date"] || ""}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                    />
                    {errors?.end_date && (
                      <p style={{ color: "red" }}>{errors.end_date}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Application Deadline</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder=""
                      value={form["deadline"] || ""}
                      disabled={!form.end_date}
                      min={new Date().toISOString().split("T")[0]}
                      max={form.start_from}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                    />
                    {errors?.deadline && (
                      <p style={{ color: "red" }}>{errors.deadline}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Duration</label>
                    <input
                      type="text"
                      value={form["duration"] || ""}
                      onChange={(e) => handleChange("duration", e.target.value)}
                      className="form-control"
                      placeholder=""
                    />
                    {errors?.duration && (
                      <p style={{ color: "red" }}>{errors.duration}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3 relative">
                    <label>Sales Price</label>
                    <input
                      type="number"
                      style={{ paddingLeft: "30px" }}
                      value={form["sale_price"] || ""}
                      onChange={(e) =>
                        handleChange("sale_price", e.target.value)
                      }
                      className="form-control"
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Sale Price"
                    />
                    <span
                      className="icon"
                      style={{ left: "15px", top: "34px" }}
                    >
                      ₹{" "}
                    </span>
                    {errors?.sale_price && (
                      <p style={{ color: "red" }}>{errors.sale_price}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">GST%</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder=""
                      value={form["gst"] || ""}
                      onChange={(e) => handleChange("gst", e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors?.gst && (
                      <p style={{ color: "red" }}>{errors.gst}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Total Fees</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder=""
                      disabled
                      value={form["total_fees"] || ""}
                    />
                    {errors?.total_fees && (
                      <p style={{ color: "red" }}>{errors.total_fees}</p>
                    )}
                  </div>
                </div>

                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Payment Link</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="link"
                      value={form["payment_link"] || ""}
                      onChange={(e) =>
                        handleChange("payment_link", e.target.value)
                      }
                    />
                    {errors?.payment_link && (
                      <p style={{ color: "red" }}>{errors.payment_link}</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Course Faculty</label>
                    <div className="CourseFacultyMultiSelect">
                      <div className="multi-select-container" ref={dropdownRef}>
                        <div
                          className="selected-options"
                          onClick={toggleDropdown}
                        >
                          {selectedOptions.length > 0 ? (
                            selectedOptions.map((option) => (
                              <span key={option?.id} className="selected-item">
                                {option?.first_name}
                                <div
                                  className="remove-icon"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent dropdown toggle
                                    handleOptionRemove(option.id);
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <mask
                                      id="mask0_436_10605"
                                      maskUnits="userSpaceOnUse"
                                      x="0"
                                      y="0"
                                      width="16"
                                      height="16"
                                    >
                                      <rect
                                        x="0.53125"
                                        y="0.584961"
                                        width="15"
                                        height="15"
                                        fill="#D9D9D9"
                                      />
                                    </mask>
                                    <g mask="url(#mask0_436_10605)">
                                      <path
                                        d="M5.78125 11.21L8.03125 8.95996L10.2812 11.21L11.1562 10.335L8.90625 8.08496L11.1562 5.83496L10.2812 4.95996L8.03125 7.20996L5.78125 4.95996L4.90625 5.83496L7.15625 8.08496L4.90625 10.335L5.78125 11.21ZM8.03125 14.335C7.16667 14.335 6.35417 14.1708 5.59375 13.8425C4.83333 13.5145 4.17188 13.0693 3.60938 12.5068C3.04688 11.9443 2.60167 11.2829 2.27375 10.5225C1.94542 9.76204 1.78125 8.94954 1.78125 8.08496C1.78125 7.22038 1.94542 6.40788 2.27375 5.64746C2.60167 4.88704 3.04688 4.22559 3.60938 3.66309C4.17188 3.10059 4.83333 2.65517 5.59375 2.32684C6.35417 1.99892 7.16667 1.83496 8.03125 1.83496C8.89583 1.83496 9.70833 1.99892 10.4688 2.32684C11.2292 2.65517 11.8906 3.10059 12.4531 3.66309C13.0156 4.22559 13.4608 4.88704 13.7887 5.64746C14.1171 6.40788 14.2812 7.22038 14.2812 8.08496C14.2812 8.94954 14.1171 9.76204 13.7887 10.5225C13.4608 11.2829 13.0156 11.9443 12.4531 12.5068C11.8906 13.0693 11.2292 13.5145 10.4688 13.8425C9.70833 14.1708 8.89583 14.335 8.03125 14.335ZM8.03125 13.085C9.41667 13.085 10.5965 12.5981 11.5706 11.6243C12.5444 10.6502 13.0312 9.47038 13.0312 8.08496C13.0312 6.69954 12.5444 5.51975 11.5706 4.54559C10.5965 3.57184 9.41667 3.08496 8.03125 3.08496C6.64583 3.08496 5.46625 3.57184 4.4925 4.54559C3.51833 5.51975 3.03125 6.69954 3.03125 8.08496C3.03125 9.47038 3.51833 10.6502 4.4925 11.6243C5.46625 12.5981 6.64583 13.085 8.03125 13.085Z"
                                        fill="white"
                                      />
                                    </g>
                                  </svg>
                                </div>
                              </span>
                            ))
                          ) : (
                            <span>Select Faculty</span>
                          )}
                        </div>

                        {isDropdownOpen && (
                          <div className="options-list">
                            {facultyList?.results?.map((option: any) => (
                              <div
                                key={option.value}
                                className="option-item"
                                data-value={option.id}
                                onClick={handleOptionSelect}
                              >
                                {option.first_name}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* <div className="icondrp">
                          <svg
                            width="12"
                            height="7"
                            viewBox="0 0 12 7"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M-0.000781059 0.999844C-0.000781059 0.743969 0.0968752 0.487969 0.292188 0.292969C0.682813 -0.0976562 1.31563 -0.0976562 1.70625 0.292969L5.99922 4.58734L10.293 0.292969C10.6836 -0.0976562 11.3164 -0.0976562 11.707 0.292969C12.0977 0.683594 12.0977 1.31641 11.707 1.70703L6.70703 6.70703C6.31641 7.09766 5.68359 7.09766 5.29297 6.70703L0.292969 1.70703C0.0960937 1.51172 -0.000781059 1.25578 -0.000781059 0.999844Z"
                              fill="black"
                            />
                          </svg>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="head_bx">
                    <h3>Course Highlights</h3>
                    <div className="rgt_bx">
                      <button
                        className="btn"
                        onClick={() => setShowHighlightsModal(true)}
                      >
                        Add New Course Highlights
                      </button>
                    </div>
                  </div>
                  {highlights?.map((item: any) => (
                    <div className="listFaq">
                      <div className="card_item">
                        <div className="Courses_checkbx d-block">
                          <label>
                            <input
                              type="checkbox"
                              id={`course_highlights-${item.id}`}
                              checked={form.course_highlights.includes(item.id)}
                              onChange={() => {
                                const isSelected =
                                  form.course_highlights.includes(item.id);
                                const updatedCourseIds = isSelected
                                  ? form.course_highlights.filter(
                                    (id: any) => id !== item.id
                                  )
                                  : [...form.course_highlights, item.id];

                                handleChange(
                                  "course_highlights",
                                  updatedCourseIds
                                );
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
                            onClick={() => setShowEditHighlightsModal(true)}
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
                    </div>
                  ))}
                </div>
                <div className="col-sm-12 mt-3">
                  <div className="head_bx">
                    <h3>Program Benefits</h3>
                    <div className="rgt_bx">
                      <button
                        className="btn"
                        onClick={() => setShowBenefitsModal(true)}
                      >
                        Add New Program Benefits
                      </button>
                    </div>
                  </div>
                  {benifits?.map((item: any) => (
                    <div className="listFaq">
                      <div className="card_item">
                        <div className="Courses_checkbx d-block">
                          <label>
                            <input
                              type="checkbox"
                              id={`program_benifits-${item.id}`}
                              checked={form.program_benifits.includes(item.id)}
                              onChange={() => {
                                const isSelected =
                                  form.program_benifits.includes(item.id);
                                const updatedCourseIds = isSelected
                                  ? form.program_benifits.filter(
                                    (id: any) => id !== item.id
                                  )
                                  : [...form.program_benifits, item.id];

                                handleChange(
                                  "program_benifits",
                                  updatedCourseIds
                                );
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
                            onClick={() => setShowEditBenefitsModal(true)}
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
                    </div>
                  ))}
                </div>
                <div className="col-sm-12 mt-3">
                  <div className="head_bx">
                    <h3>Who is this program for</h3>
                    <div className="rgt_bx">
                      <button
                        className="btn"
                        onClick={() => setShowprogramModal(true)}
                      >
                        Add New Feature{" "}
                      </button>
                    </div>
                  </div>
                  {program_for?.map((item: any) => (
                    <div className="listFaq">
                      <div className="card_item">
                        <div className="Courses_checkbx d-block">
                          <label>
                            <input
                              type="checkbox"
                              checked={form.program_for.includes(item.id)}
                              onChange={() => {
                                const isSelected = form.program_for.includes(
                                  item.id
                                );
                                const updatedCourseIds = isSelected
                                  ? form.program_for.filter(
                                    (id: any) => id !== item.id
                                  )
                                  : [...form.program_for, item.id];

                                handleChange("program_for", updatedCourseIds);
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
                            onClick={() => setShowEditprogramModal(true)}
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
                    </div>
                  ))}
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
                        "duration",
                        "course_tags",
                        "course_sub_headings",
                        "why_should_i_join",
                        "course_highlights",
                        "course_feature",
                        "program_for",
                        "product_code",
                        "start_from",
                        "deadline",
                        "sale_price",
                        "gst",
                        "total_fees",
                        "educator",
                        "brochure_file",
                        "end_date",
                        "program_benifits",
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
            <h3>Add Course 2/3 (EICT Third Party)</h3>
            <div className="btn_grp">
              <button
                className="btn"
                onClick={goToPreviousStep}
                style={{ color: "#000", background: "#e5e5e5" }}
              >
                Previous
              </button>
              <button className="btn" onClick={goToNextStep}>
                Next
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
            <div className="fromSection">
              <div className="head_bx">
                <h3>Course Curriculum</h3>
                <div className="rgt_bx">
                  <button className="btn" onClick={() => setShowModule(true)}>
                    Add New Module
                  </button>
                  <button
                    className="btnDelate"
                    disabled={!moduleId}
                    onClick={() => {
                      deleteModule({ id: moduleId });
                      setModuleId("");
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
                {moduleList?.map((item: any, moduleIndex: number) => (
                  <div className="card_item">
                    <div className="Courses_checkbx d-block">
                      <label htmlFor={`module-${moduleIndex}`}>
                        <input
                          type="checkbox"
                          id={`module-${moduleIndex}`}
                          value={item?.id}
                          onChange={() => setModuleId(item?.id)}
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
                        {item.title}
                      </h3>
                      <button
                        className="btnEdit"
                        onClick={() => {
                          setSelectedItem({
                            id: item.id,
                            question: item.title,
                            answer: item.description,
                          });
                          setShowEditModule(true);
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
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="admin_panel step2">
          <div className="Breadcrumbs">
            <h3>Add Course 3/3 (EICT Third Party)</h3>
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
            <div className="fromSection">
              <div className="head_bx">
                <h3>Frequently Asked Questions</h3>
                <div className="rgt_bx">
                  <button className="btn" onClick={() => setShowFAQModal(true)}>
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
                          setSelectedItem(item);
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
          </div>
        </div>
      )}

      <FAQForm
        item={null}
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        onSubmit={handleFaqSubmit}
      />
      <FAQForm
        item={selectedItem}
        isOpen={showEditFAQModal}
        onClose={() => setShowEditFAQModal(false)}
        onSubmit={handleFaqSubmit}
      />
      {/*Course Highlights*/}
      <FAQForm
        title={"Course Highlights"}
        item={null}
        isOpen={showHighlightsModal}
        onClose={() => setShowHighlightsModal(false)}
        onSubmit={handleHighlightsSubmit}
      />
      <FAQForm
        title={"Course Highlights"}
        item={selectedItem}
        isOpen={showEditHighlightsModal}
        onClose={() => setShowEditHighlightsModal(false)}
        onSubmit={handleHighlightsSubmit}
      />

      {/* Program Benefits */}
      <FAQForm
        title={"Program Benefits"}
        item={null}
        isOpen={showBenefitsModal}
        onClose={() => setShowBenefitsModal(false)}
        onSubmit={handleBenifitsSubmit}
      />
      <FAQForm
        title={"Program Benefits"}
        item={selectedItem}
        isOpen={showEditBenefitsModal}
        onClose={() => setShowEditBenefitsModal(false)}
        onSubmit={handleBenifitsSubmit}
      />

      {/* Who is this program for */}
      <FAQForm
        title={"Who is this program for"}
        item={null}
        isOpen={showprogramModal}
        onClose={() => setShowprogramModal(false)}
        onSubmit={handleProgramForSubmit}
      />
      <FAQForm
        title={"Who is this program for"}
        item={selectedItem}
        isOpen={showEditprogramModal}
        onClose={() => setShowEditprogramModal(false)}
        onSubmit={handleProgramForSubmit}
      />
      <AddFeatureModal
        showChapterModal={showChapterModal}
        setShowChapterModal={setShowChapterModal}
        type={"eict-third-party"}
      />
      <AddWhoJoin showWhoJoin={showWhoJoin} setShowWhoJoin={setShowWhoJoin} />

      <FAQForm
        title={"Module"}
        item={null}
        isOpen={showModule}
        onClose={() => setShowModule(false)}
        onSubmit={handleModuleSubmit}
        module={"Module"}
        sub_module={"Sub Module"}
      />
      <FAQForm
        title={"Module"}
        item={selectedItem}
        isOpen={showEditModule}
        onClose={() => setShowEditModule(false)}
        onSubmit={handleModuleSubmit}
        module={"Module"}
        sub_module={"Sub Module"}
      />
    </>
  );
};

export default AddCoursePage;
