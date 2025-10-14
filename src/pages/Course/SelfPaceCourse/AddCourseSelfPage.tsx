/* eslint-disable react-hooks/exhaustive-deps */
import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import assets from "../../../assets";
import { Modal } from "react-bootstrap";
import { useCrud } from "../../../hooks/useCrud";
import { validateFields } from "../../../utils/validateFields";
import { useDynamicForm } from "../../../hooks/useDynamicForm";
import {
  defaultForm,
  keyMap,
  mapEditedFieldsToApiKeys,
  requiredFieldsMap,
} from "./formConfig";
import { buildFormData } from "../../../utils/buildFormData";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import VideoUploaderComponent from "../../../components/common/UploadVideoModal";
import { GenericItems } from "../../../types";
import FAQForm from "../../../components/common/FAQForm";
import AddDocumentModal from "../../../components/common/AddDocumentModal";
import AddImageModal from "../../../components/common/AddImageModal";
import AddSelectiveTestModal from "../../../components/common/AddSelectiveTestModal";
import { formatSecondsToHHMMSS, getErrorMessage } from "../../../utils/helper";
import AddCourseModal from "../../../components/common/AddFeatureModal";
import AddFeatureModal from "../../../components/common/AddFeatureModal";
import UploadCertificateModal from "../../../components/common/UploadCertificateModal";
import { setSelectedCourse } from "../../../redux/slices/coursesSlice";
import ShowDeleteModal from "../../../components/common/ShowDeleteModal";
import AddBrouchureModal from "../../../components/common/AddBrouchureModal";
import { useEscToClose } from "../../../hooks/useEscToClose";
import useTabCloseWarning from "../../../hooks/useTabCloseWarning";
import VideoThumbnail from "../../../components/common/VideoThumbnail";

interface Option {
  label: string;
  value: string;
}

const AddCourseSelfPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCourse } = useSelector((state: RootState) => state.courses);
  const [isEditMode, setIsEditMode] = useState<boolean>(
    Boolean(selectedCourse?.id)
  );
  const [step, setStep] = useState(1);
  const isEnable = step === 1;
  const [showMainModal, setShowMainModal] = useState(false);
  const [showUploadvModal, setShowUploadvModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showSectionalTestModal, setShowSectionalTestModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showEditFAQModal, setShowEditFAQModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [chapterId, setChapterId] = useState<GenericItems[]>([]);
  const [chapterData, setChapterData] = useState<GenericItems | null>(null);
  const [resourceData, setRescourceData] = useState<GenericItems | null>(null);
  const [markAsFree, setMarkAsFree] = useState<boolean>(false);
  const [faqId, setFaqId] = useState<(string | number)[]>([]);
  const [resourceId, setResourceId] = useState<GenericItems[]>([]);
  const [courseId, setCourseId] = useState(selectedCourse?.base_course_id);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
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
    handleFileChange,
  } = useDynamicForm(defaultForm, isEditMode);
  const { useCreate, useFetch, useDelete, useUpdate } = useCrud();

  //CREATE
  const { mutate: createSelfPlacedCourse } = useCreate(
    "/courses/self-paced-courses/",
    ["/courses/self-paced-courses/"],
    {
      onSuccess: (data) => {
        setStep((prev) => prev + 1);
        setCourseId(data?.base_course_id);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: createChapter } = useCreate(
    "/courses/chapters/",
    `/courses/courses/${courseId || selectedCourse?.base_course_id}/chapters/`,
    {
      onSuccess: (data) => {
        setChapterId([]);
        setResourceId([]);
        setChapterId([{ id: data.id, title: data.title }]);
        setChapterData(data);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: createFAQ } = useCreate(
    `/courses/self-paced-courses/${courseId}/faqs/`,
    [`/courses/self-paced-courses/${courseId}/faqs/`, "{}"],
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
  const { data: product_code = {} } = useFetch(
    !courseId ? `/courses/latest-product-codes?category_id=1` : "",
    {},
    {
      enabled: !!!courseId,
      retry: false,
    }
  );
  const { data: chapterList = [] } = useFetch(
    `/courses/courses/${courseId}/chapters/`,
    {},
    {
      enabled: !!(courseId || selectedCourse?.id),
      retry: false,
    }
  );

  const { data: faqList = [] } = useFetch(
    `/courses/self-paced-courses/${courseId}/faqs/`,
    {},
    {
      enabled: !!courseId,
      retry: false,
    }
  );

  const { data: facultyList = [] } = useFetch(
    `/faculties/list/`,
    {
      page: 1,
      page_size: 100,
    },
    {
      retry: false,
    }
  );

  const { data: featureList = [] } = useFetch(
    `/courses/features/?type=self-paced`,
    {},
    {
      retry: false,
    }
  );
  const { data: courseListById = {} } = useFetch(
    courseId ? `/courses/self-paced-courses/${courseId}/` : "",
    {},
    {
      enabled: !!courseId,
      retry: false,
    }
  );

  //DELETE
  const { mutate: deleteChapter } = useDelete(
    `/courses/chapters/`,
    `/courses/courses/${courseId}/chapters/`
  );

  const { mutate: deleteResource } = useDelete(
    `/courses/resources/`,
    `/courses/courses/${courseId}/chapters/`
  );

  const { mutate: deleteFAQ } = useDelete(
    `/courses/self-paced-courses/${courseId}/faqs/`,
    `/courses/self-paced-courses/${courseId}/faqs/`,
    {
      onSuccess: (data) => {
        setFaqId([]);
      },
    }
  );

  //UPDATE
  const { mutate: updateFAQ } = useUpdate(
    `/courses/self-paced-courses/${courseId}/faqs/`,
    `/courses/self-paced-courses/${courseId}/faqs/`
  );
  const { mutate: updateMarkAsRead } = useUpdate(
    `/courses/resources/${resourceData?.id}`,
    [`/courses/courses/${courseId}/chapters/`, "{}"],
    {
      onSuccess: () => {
        toast.success("Added Successfully.");
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: updateSelfPage } = useUpdate(
    `/courses/self-paced-courses/${courseId}/`,
    `/courses/self-paced-courses/${courseId}/`,
    {
      onError: (error) => {
        getErrorMessage(error);
      },
      onSuccess: () => {
        toast.success("Self Paced Course Updated Successfully.");
        navigate("/course-management/all-courses");
      },
    }
  );

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEditMode && Object.keys(editedFields).length > 0) {
      const dataToSend = mapEditedFieldsToApiKeys(editedFields);
      const formData = buildFormData(editedFields, dataToSend);
      updateSelfPage({
        data: formData,
      });
    } else {
      toast.success("Self Paced Course Created Successfully.");
      navigate("/course-management/all-courses");
    }
  };

  const handleFaqSubmit = (faq: GenericItems) => {
    if (faq.id) {
      updateFAQ({ id: faq.id, data: faq });
    } else {
      const { id, ...payload } = faq;
      createFAQ(payload);
    }
  };
  const goToNextStep = () => {
    const requiredFields = requiredFieldsMap[step];
    const { isValid, errors } = validateFields(form, requiredFields);

    if (!isValid) {
      setErrors(errors);
      return;
    }
    setErrors({});
    if (step === 1 && !selectedCourse?.base_course_id) {
      const formData = buildFormData(form, keyMap, { is_active: true });
      createSelfPlacedCourse(formData);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => setStep(step - 1);
  const cancel = () => {
    // console.log(Object.keys(form).length);
    // console.log(Object.keys(editedFields).length);
    // const confirmLeave = window.confirm(
    //   "Are you sure you want to cancel? Any unsaved changes will be lost."
    // );
    // if (confirmLeave ) {
    navigate("/course-management/all-courses");
    // }
  };
  useEscToClose(showMainModal, () => setShowMainModal(false));
  useEffect(() => {
    if (selectedCourse) {
      const selectedCourseIds =
        selectedCourse?.about_course?.map((item: any) => item.id) || [];
      const selectedFacultyId =
        selectedCourse?.course_faculty?.map((item: any) => item.id) || [];
      const initialForm = {
        name: selectedCourse.title || "",
        description: selectedCourse?.description || "",
        duration: selectedCourse?.course_duration_months || "",
        code: selectedCourse?.product_code || "",
        start_date:
          new Date(selectedCourse.start_date).toISOString().slice(0, 10) || "",
        end_date: moment(selectedCourse?.end_date).format("MMMM D, YYYY") || "",
        deadline:
          new Date(selectedCourse.application_deadline)
            .toISOString()
            .slice(0, 10) || "",
        sale_price: selectedCourse?.sales_price || "",
        gst: selectedCourse?.gst_percentage || "0",
        total_price: selectedCourse?.total_price || "",
        course_faculty_id: selectedFacultyId || [],
        brochure_file: selectedCourse?.brochure || "",
        course_id: selectedCourseIds,
        cover_media_file: selectedCourse?.cover_media,
        about_the_course: selectedCourse?.about_the_course
      };
      setForm(initialForm);
      setOriginalData(initialForm);
      setSelectedOptions(selectedCourse?.course_faculty);
    }
  }, [selectedCourse]);
  useEffect(() => {
    const salePrice = Number(form["sale_price"]);
    const gst = Number(form["gst"]);
    const total = salePrice + (salePrice * gst) / 100;
    handleChange("total_price", total.toFixed(2));
  }, [form["sale_price"], form["gst"]]);

  useEffect(() => {
    markAsFree &&
      updateMarkAsRead({
        body: {
          resource_type: "video",
          mask_as_free: true,
        },
      });
    setMarkAsFree(false);
    setRescourceData(null);
  }, [markAsFree]);

  useEffect(() => {
    if (courseListById && Object.keys(courseListById).length > 0) {
      dispatch(setSelectedCourse(courseListById));
      setIsEditMode(Boolean(courseListById?.id));
    }
  }, [courseListById, dispatch, isEditMode]);

  useEffect(() => {
    if (product_code && !courseId) {
      setForm((prev) => ({ ...prev, code: product_code?.code }));
    }
  }, [product_code]);

  const handleDeleteModal = () => {
    const chapterIds = chapterId?.map((item) => item?.id) || [];
    const resourceIds = resourceId?.map((item) => item?.id) || [];

    try {
      // Delete chapters if any selected
      if (chapterIds.length > 0) {
        deleteChapter({
          body: {
            chapter_ids: chapterIds,
          },
        });
      }

      // Delete resources if any selected (assuming you have deleteResource function)
      if (resourceIds.length > 0) {
        deleteResource({
          body: {
            resource_ids: resourceIds,
          },
        });
      }

      // Clear all selected items after successful deletion
      setChapterId([]);
      setResourceId([]);
      setChapterData(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };
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
        handleChange("course_faculty_id", [
          ...(form?.course_faculty_id || []),
          selectedOption.id,
        ]);
      }
    }
  };

  const handleOptionRemove = (value: string) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.filter((option) => option.id !== value)
    );
    const updatedEducators = form.course_faculty_id.filter(
      (option: any) => option !== Number(value)
    );
    handleChange("course_faculty_id", updatedEducators);
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
            <h3>Add Course 1/3 (Self Pace Course)</h3>
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
                    "duration",
                    "code",
                    "start_date",
                    "deadline",
                    "sale_price",
                    "gst",
                    "total_price",
                    "course_faculty_id",
                    "brochure_file",
                    "course_id",
                    "cover_media_file",
                    "about_the_course"
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
                <h3>{form?.name}</h3>
                {errors?.cover_media_file && (
                  <p style={{ color: "red" }}>{errors.cover_media_file}</p>
                )}
              </div>
              <div className="tab_userList Disable">
                <div className="hd_bx">
                  <h3>Add Content</h3>
                </div>
                <ul className="tab_viewData">
                  <li>
                    <button
                      className="btn"
                      disabled={step === 1}
                    // onClick={() => setShowMainModal(true)}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_1422"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_1422)">
                            <path
                              d="M4.14062 16.5967C3.73785 16.5967 3.38715 16.4474 3.08854 16.1488C2.78993 15.8502 2.64062 15.4995 2.64062 15.0967V6.09668C2.64062 5.68418 2.78993 5.33106 3.08854 5.03731C3.38715 4.74356 3.73785 4.59668 4.14062 4.59668H8.64062L10.6406 6.59668H17.1406C17.5531 6.59668 17.9062 6.74356 18.2 7.03731C18.4937 7.33106 18.6406 7.68418 18.6406 8.09668V15.0967C18.6406 15.4995 18.4937 15.8502 18.2 16.1488C17.9062 16.4474 17.5531 16.5967 17.1406 16.5967H4.14062ZM4.14062 15.0967H17.1406V8.09668H10.0156L8.01562 6.09668H4.14062V15.0967Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Chapter</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      onClick={() => {
                        setShowUploadvModal(true);
                      }}
                      disabled={step === 1}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_7711"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_7711)">
                            <path
                              d="M5.14062 4.59668L6.64062 7.59668H8.64062L7.14062 4.59668H8.64062L10.1406 7.59668H12.1406L10.6406 4.59668H12.1406L13.6406 7.59668H15.6406L14.1406 4.59668H17.1406C17.5531 4.59668 17.9062 4.74599 18.2 5.0446C18.4937 5.34321 18.6406 5.6939 18.6406 6.09668V15.0967C18.6406 15.4995 18.4937 15.8502 18.2 16.1488C17.9062 16.4474 17.5531 16.5967 17.1406 16.5967H4.14062C3.73785 16.5967 3.38715 16.4474 3.08854 16.1488C2.78993 15.8502 2.64062 15.4995 2.64062 15.0967V6.09668C2.64062 5.6939 2.78299 5.34321 3.06771 5.0446C3.35243 4.74599 3.71007 4.59668 4.14062 4.59668H5.14062ZM4.14062 9.09668V15.0967H17.1406V9.09668H4.14062Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Video</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      disabled={step === 1}
                      onClick={() => {
                        setShowSectionalTestModal(true);
                      }}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_1440"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_1440)">
                            <path
                              d="M5.14062 17.5967C4.72812 17.5967 4.375 17.4498 4.08125 17.1561C3.7875 16.8623 3.64062 16.5092 3.64062 16.0967V5.09668C3.64062 4.68418 3.7875 4.33106 4.08125 4.03731C4.375 3.74356 4.72812 3.59668 5.14062 3.59668H16.1406C16.5531 3.59668 16.9062 3.74356 17.2 4.03731C17.4937 4.33106 17.6406 4.68418 17.6406 5.09668V10.4717C17.4031 10.3917 17.1594 10.3228 16.9094 10.265C16.6594 10.2072 16.4031 10.165 16.1406 10.1383V5.09668H5.14062V16.0967H10.1615C10.1875 16.3677 10.2287 16.6265 10.2852 16.8729C10.3416 17.1193 10.4115 17.3606 10.4948 17.5967H5.14062ZM5.14062 16.0967V5.09668V10.1383V10.0967V16.0967ZM6.64062 14.5967H10.224C10.2795 14.3328 10.3503 14.0761 10.4363 13.8266C10.5222 13.577 10.6181 13.3337 10.724 13.0967H6.64062V14.5967ZM6.64062 11.3467H12.1406C12.5017 11.0689 12.8906 10.8293 13.3073 10.6279C13.724 10.4265 14.1684 10.2842 14.6406 10.2008V9.84668H6.64062V11.3467ZM6.64062 8.09668H14.6406V6.59668H6.64062V8.09668ZM15.6359 19.5967C14.5279 19.5967 13.5851 19.2062 12.8073 18.4253C12.0295 17.6444 11.6406 16.6999 11.6406 15.592C11.6406 14.484 12.0311 13.5411 12.812 12.7633C13.5929 11.9856 14.5374 11.5967 15.6453 11.5967C16.7533 11.5967 17.6962 11.9871 18.474 12.7681C19.2517 13.549 19.6406 14.4934 19.6406 15.6014C19.6406 16.7094 19.2502 17.6522 18.4692 18.43C17.6883 19.2078 16.7439 19.5967 15.6359 19.5967ZM15.1406 17.5967H16.1406V16.0967H17.6406V15.0967H16.1406V13.5967H15.1406V15.0967H13.6406V16.0967H15.1406V17.5967Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Subjective Test</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      disabled={step === 1}
                      onClick={() => {
                        setShowDocumentModal(true);
                      }}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_2732"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_2732)">
                            <path
                              d="M6.64062 14.5967H8.14062L13.0365 9.70085L11.5365 8.20085L6.64062 13.0967V14.5967ZM13.7448 8.99251L14.4948 8.24251C14.6059 8.1314 14.6615 8.01335 14.6615 7.88835C14.6615 7.76335 14.6059 7.64529 14.4948 7.53418L13.7031 6.74251C13.592 6.6314 13.474 6.57585 13.349 6.57585C13.224 6.57585 13.1059 6.6314 12.9948 6.74251L12.2448 7.49251L13.7448 8.99251ZM5.14062 17.5967C4.72812 17.5967 4.375 17.4498 4.08125 17.1561C3.7875 16.8623 3.64062 16.5092 3.64062 16.0967V5.09668C3.64062 4.68418 3.7875 4.33106 4.08125 4.03731C4.375 3.74356 4.72812 3.59668 5.14062 3.59668H8.70312C8.81424 3.16612 9.04688 2.80849 9.40104 2.52376C9.75521 2.23904 10.1684 2.09668 10.6406 2.09668C11.1128 2.09668 11.526 2.23904 11.8802 2.52376C12.2344 2.80849 12.467 3.16612 12.5781 3.59668H16.1406C16.5531 3.59668 16.9062 3.74356 17.2 4.03731C17.4937 4.33106 17.6406 4.68418 17.6406 5.09668V16.0967C17.6406 16.5092 17.4937 16.8623 17.2 17.1561C16.9062 17.4498 16.5531 17.5967 16.1406 17.5967H5.14062ZM5.14062 16.0967H16.1406V5.09668H5.14062V16.0967ZM10.6406 4.59668C10.7851 4.59668 10.9045 4.54946 10.999 4.45501C11.0934 4.36057 11.1406 4.24112 11.1406 4.09668C11.1406 3.95224 11.0934 3.83279 10.999 3.73835C10.9045 3.6439 10.7851 3.59668 10.6406 3.59668C10.4962 3.59668 10.3767 3.6439 10.2823 3.73835C10.1878 3.83279 10.1406 3.95224 10.1406 4.09668C10.1406 4.24112 10.1878 4.36057 10.2823 4.45501C10.3767 4.54946 10.4962 4.59668 10.6406 4.59668Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Document</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      disabled={step === 1}
                      onClick={() => {
                        setShowImageModal(true);
                      }}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_3041"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_3041)">
                            <path
                              d="M5.14062 17.5967C4.72812 17.5967 4.375 17.4498 4.08125 17.1561C3.7875 16.8623 3.64062 16.5092 3.64062 16.0967V5.09668C3.64062 4.68418 3.7875 4.33106 4.08125 4.03731C4.375 3.74356 4.72812 3.59668 5.14062 3.59668H11.6406V5.09668H5.14062V16.0967H16.1406V9.59668H17.6406V16.0967C17.6406 16.5092 17.4937 16.8623 17.2 17.1561C16.9062 17.4498 16.5531 17.5967 16.1406 17.5967H5.14062ZM14.6406 8.09668V6.59668H13.1406V5.09668H14.6406V3.59668H16.1406V5.09668H17.6406V6.59668H16.1406V8.09668H14.6406ZM6.14062 14.5967H15.1406L12.1406 10.5967L9.89062 13.5967L8.39062 11.5967L6.14062 14.5967Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Image</span>
                    </button>
                  </li>
                </ul>
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
                      value={form["name"]}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    {errors?.name && (
                      <p style={{ color: "red" }}>{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <label>Course Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter"
                      value={form["description"]}
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
                    <label>About The Course</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter"
                      value={form["about_the_course"]}
                      onChange={(e) =>
                        handleChange("about_the_course", e.target.value)
                      }
                    />
                    {errors?.description && (
                      <p style={{ color: "red" }}>{errors.description}</p>
                    )}
                  </div>
                </div>

                <div className="col-lg-12 col-md-12">
                  <div className="from-group mb-3">
                    <div className="hd_bx">
                      <label>About the Course</label>
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
                            id={`course-${item.id}`}
                            checked={form.course_id.includes(item.id)}
                            onChange={() => {
                              const isSelected = form.course_id.includes(
                                item.id
                              );
                              const updatedCourseIds = isSelected
                                ? form.course_id.filter(
                                  (id: any) => id !== item.id
                                )
                                : [...form.course_id, item.id];

                              handleChange("course_id", updatedCourseIds);
                            }}
                          />
                          <span>{item.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="from-group mb-3">
                    <label>Product Code</label>
                    <input
                      type="text"
                      name="code"
                      className="form-control"
                      placeholder="To be auto refilled"
                      disabled
                      value={form["code"]}
                    // onChange={(e) => handleChange("code", e.target.value)}
                    />
                    {/* {errors?.code && (
                      <p style={{ color: "red" }}>{errors.code}</p>
                    )} */}
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3 relative">
                    <label>Start From</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder="dd/mm/yyyy"
                      value={form["start_date"]}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        handleChange("start_date", newDate);
                        if (
                          !newDate ||
                          (form.deadline && form.deadline <= newDate)
                        ) {
                          handleChange("deadline", "");
                        }
                      }}
                    />
                    {errors?.start_date && (
                      <p style={{ color: "red" }}>{errors.start_date}</p>
                    )}
                  </div>
                </div>

                <div className="col-lg-3 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Course Duration</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter no. of months"
                      onChange={(e) => handleChange("duration", e.target.value)}
                      value={form["duration"]}
                    />

                    {errors?.duration && (
                      <p style={{ color: "red" }}>{errors.duration}</p>
                    )}
                  </div>
                </div>

                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3 relative">
                    <label>Sales Price</label>
                    <input
                      type="number"
                      style={{ paddingLeft: "30px" }}
                      className="form-control"
                      placeholder=""
                      onChange={(e) =>
                        handleChange("sale_price", e.target.value)
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      value={form["sale_price"]}
                    />
                    {errors?.sale_price && (
                      <p style={{ color: "red" }}>{errors.sale_price}</p>
                    )}
                    <span
                      className="icon"
                      style={{ left: "15px", top: "34px" }}
                    >
                      ₹{" "}
                    </span>
                  </div>
                </div>

                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">GST%</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder=""
                      onChange={(e) => handleChange("gst", e.target.value)}
                      value={form["gst"]}
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

                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3 relative">
                    <label>Total Fees</label>
                    <input
                      type="number"
                      style={{ paddingLeft: "30px" }}
                      className="form-control"
                      placeholder=""
                      disabled
                      value={form["total_price"]}
                    />
                    <span
                      className="icon"
                      style={{ left: "15px", top: "34px" }}
                    >
                      ₹{" "}
                    </span>
                  </div>
                </div>

                <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Application Deadline</label>
                    <input
                      type="date"
                      id="date"
                      className="form-control"
                      placeholder=""
                      disabled={!form.start_date}
                      value={form["deadline"]}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      max={form.start_date}
                    />
                    {errors?.deadline && (
                      <p style={{ color: "red" }}>{errors.deadline}</p>
                    )}
                  </div>
                </div>

                {/* <div className="col-lg-4 col-md-12">
                  <div className="from-group mb-3">
                    <label htmlFor="">Course Faculty</label>
                    <select
                      name="course_faculty_id"
                      className="form-control"
                      value={form["course_faculty_id"]}
                      onChange={(e) =>
                        // setForm((prev) => ({
                        //   ...prev,
                        //   course_faculty_id: e.target.value,
                        // }))
                        handleChange("course_faculty_id", e.target.value)
                      }
                    >
                      <option value="">Select Faculty</option>
                      {facultyList?.results?.map((item: any) => (
                        <option key={item.id} value={item.id}>
                          {item.first_name}
                        </option>
                      ))}
                    </select>



                    
                  </div>
                </div> */}
                <div className="col-lg-4 col-md-12">
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
                              <span key={option.id} className="selected-item">
                                {option.first_name}
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
                                key={option.id}
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
                <AddBrouchureModal
                  brochureFile={form?.brochure_file}
                  onFileChange={(e) => handleFileChange(e, "brochure_file")}
                  onRemove={() =>
                    setForm((prev) => ({ ...prev, brochure_file: null }))
                  }
                />
                {/* <div className="col-lg-12 col-md-12 mt-3">
                  {form.brochure_file || selectedCourse?.brochure ? (
                    <span>
                      {form.brochure_file?.name || selectedCourse?.brochure}
                    </span>
                  ) : (
                    <>
                      <label htmlFor="">Upload Brochure</label>
                      <div className="upload_file">
                        <label htmlFor="Brochure">
                          <input
                            type="file"
                            name="Uploadf"
                            id="Brochure"
                            accept="application/pdf"
                            onChange={handleFileChange}
                          />
                          <span>
                            <span>
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <mask
                                  id="mask0_931_14551"
                                  maskUnits="userSpaceOnUse"
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                >
                                  <rect width="24" height="24" fill="#D9D9D9" />
                                </mask>
                                <g mask="url(#mask0_931_14551)">
                                  <path
                                    d="M11 17H13V13H17V11H13V7H11V11H7V13H11V17ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"
                                    fill="#1E3A8A"
                                  />
                                </g>
                              </svg>
                            </span>{" "}
                            Upload PDF Brochure
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="hd_bx">
                    <div></div>
                    <button
                      className="btn"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, brochure_file: null }));
                      }}
                    >
                      Remove Brochure
                    </button>
                  </div>
                </div> */}
                <div className="btn_grp">
                  <button
                    className="btn"
                    onClick={goToNextStep}
                    disabled={
                      !isFieldsEmpty([
                        "name",
                        "description",
                        "duration",
                        "code",
                        "start_date",
                        "deadline",
                        "sale_price",
                        "gst",
                        "total_price",
                        "course_faculty_id",
                        "brochure_file",
                        "course_id",
                        "cover_media_file",
                        "about_the_course"
                      ])
                    }
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
            <h3>Add Course 2/3 (Self Pace Course)</h3>
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
              <div className="tab_userList">
                <div className="hd_bx">
                  <h3>Add Content</h3>
                </div>
                <ul className="tab_viewData">
                  <li>
                    <button
                      className="btn"
                      disabled={isEnable}
                      onClick={() => setShowMainModal(true)}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_1422"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_1422)">
                            <path
                              d="M4.14062 16.5967C3.73785 16.5967 3.38715 16.4474 3.08854 16.1488C2.78993 15.8502 2.64062 15.4995 2.64062 15.0967V6.09668C2.64062 5.68418 2.78993 5.33106 3.08854 5.03731C3.38715 4.74356 3.73785 4.59668 4.14062 4.59668H8.64062L10.6406 6.59668H17.1406C17.5531 6.59668 17.9062 6.74356 18.2 7.03731C18.4937 7.33106 18.6406 7.68418 18.6406 8.09668V15.0967C18.6406 15.4995 18.4937 15.8502 18.2 16.1488C17.9062 16.4474 17.5531 16.5967 17.1406 16.5967H4.14062ZM4.14062 15.0967H17.1406V8.09668H10.0156L8.01562 6.09668H4.14062V15.0967Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Chapter</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      onClick={() => {
                        setShowUploadvModal(true);
                      }}
                      disabled={!chapterId[0]?.id}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_7711"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_7711)">
                            <path
                              d="M5.14062 4.59668L6.64062 7.59668H8.64062L7.14062 4.59668H8.64062L10.1406 7.59668H12.1406L10.6406 4.59668H12.1406L13.6406 7.59668H15.6406L14.1406 4.59668H17.1406C17.5531 4.59668 17.9062 4.74599 18.2 5.0446C18.4937 5.34321 18.6406 5.6939 18.6406 6.09668V15.0967C18.6406 15.4995 18.4937 15.8502 18.2 16.1488C17.9062 16.4474 17.5531 16.5967 17.1406 16.5967H4.14062C3.73785 16.5967 3.38715 16.4474 3.08854 16.1488C2.78993 15.8502 2.64062 15.4995 2.64062 15.0967V6.09668C2.64062 5.6939 2.78299 5.34321 3.06771 5.0446C3.35243 4.74599 3.71007 4.59668 4.14062 4.59668H5.14062ZM4.14062 9.09668V15.0967H17.1406V9.09668H4.14062Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Video</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      onClick={() => {
                        setShowSectionalTestModal(true);
                      }}
                      disabled={!(resourceId[0]?.resource_type === "video")}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_1440"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_1440)">
                            <path
                              d="M5.14062 17.5967C4.72812 17.5967 4.375 17.4498 4.08125 17.1561C3.7875 16.8623 3.64062 16.5092 3.64062 16.0967V5.09668C3.64062 4.68418 3.7875 4.33106 4.08125 4.03731C4.375 3.74356 4.72812 3.59668 5.14062 3.59668H16.1406C16.5531 3.59668 16.9062 3.74356 17.2 4.03731C17.4937 4.33106 17.6406 4.68418 17.6406 5.09668V10.4717C17.4031 10.3917 17.1594 10.3228 16.9094 10.265C16.6594 10.2072 16.4031 10.165 16.1406 10.1383V5.09668H5.14062V16.0967H10.1615C10.1875 16.3677 10.2287 16.6265 10.2852 16.8729C10.3416 17.1193 10.4115 17.3606 10.4948 17.5967H5.14062ZM5.14062 16.0967V5.09668V10.1383V10.0967V16.0967ZM6.64062 14.5967H10.224C10.2795 14.3328 10.3503 14.0761 10.4363 13.8266C10.5222 13.577 10.6181 13.3337 10.724 13.0967H6.64062V14.5967ZM6.64062 11.3467H12.1406C12.5017 11.0689 12.8906 10.8293 13.3073 10.6279C13.724 10.4265 14.1684 10.2842 14.6406 10.2008V9.84668H6.64062V11.3467ZM6.64062 8.09668H14.6406V6.59668H6.64062V8.09668ZM15.6359 19.5967C14.5279 19.5967 13.5851 19.2062 12.8073 18.4253C12.0295 17.6444 11.6406 16.6999 11.6406 15.592C11.6406 14.484 12.0311 13.5411 12.812 12.7633C13.5929 11.9856 14.5374 11.5967 15.6453 11.5967C16.7533 11.5967 17.6962 11.9871 18.474 12.7681C19.2517 13.549 19.6406 14.4934 19.6406 15.6014C19.6406 16.7094 19.2502 17.6522 18.4692 18.43C17.6883 19.2078 16.7439 19.5967 15.6359 19.5967ZM15.1406 17.5967H16.1406V16.0967H17.6406V15.0967H16.1406V13.5967H15.1406V15.0967H13.6406V16.0967H15.1406V17.5967Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Subjective Test</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      onClick={() => {
                        setShowDocumentModal(true);
                      }}
                      // disabled={!chapterId[0]?.id}
                      disabled={!(resourceId[0]?.resource_type === "video")}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_2732"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_2732)">
                            <path
                              d="M6.64062 14.5967H8.14062L13.0365 9.70085L11.5365 8.20085L6.64062 13.0967V14.5967ZM13.7448 8.99251L14.4948 8.24251C14.6059 8.1314 14.6615 8.01335 14.6615 7.88835C14.6615 7.76335 14.6059 7.64529 14.4948 7.53418L13.7031 6.74251C13.592 6.6314 13.474 6.57585 13.349 6.57585C13.224 6.57585 13.1059 6.6314 12.9948 6.74251L12.2448 7.49251L13.7448 8.99251ZM5.14062 17.5967C4.72812 17.5967 4.375 17.4498 4.08125 17.1561C3.7875 16.8623 3.64062 16.5092 3.64062 16.0967V5.09668C3.64062 4.68418 3.7875 4.33106 4.08125 4.03731C4.375 3.74356 4.72812 3.59668 5.14062 3.59668H8.70312C8.81424 3.16612 9.04688 2.80849 9.40104 2.52376C9.75521 2.23904 10.1684 2.09668 10.6406 2.09668C11.1128 2.09668 11.526 2.23904 11.8802 2.52376C12.2344 2.80849 12.467 3.16612 12.5781 3.59668H16.1406C16.5531 3.59668 16.9062 3.74356 17.2 4.03731C17.4937 4.33106 17.6406 4.68418 17.6406 5.09668V16.0967C17.6406 16.5092 17.4937 16.8623 17.2 17.1561C16.9062 17.4498 16.5531 17.5967 16.1406 17.5967H5.14062ZM5.14062 16.0967H16.1406V5.09668H5.14062V16.0967ZM10.6406 4.59668C10.7851 4.59668 10.9045 4.54946 10.999 4.45501C11.0934 4.36057 11.1406 4.24112 11.1406 4.09668C11.1406 3.95224 11.0934 3.83279 10.999 3.73835C10.9045 3.6439 10.7851 3.59668 10.6406 3.59668C10.4962 3.59668 10.3767 3.6439 10.2823 3.73835C10.1878 3.83279 10.1406 3.95224 10.1406 4.09668C10.1406 4.24112 10.1878 4.36057 10.2823 4.45501C10.3767 4.54946 10.4962 4.59668 10.6406 4.59668Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Document</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn"
                      onClick={() => {
                        setShowImageModal(true);
                      }}
                      // disabled={!chapterId[0]?.id}
                      disabled={!(resourceId[0]?.resource_type === "video")}
                    >
                      <span className="icon">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_4001_3041"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="21"
                            height="21"
                          >
                            <rect
                              x="0.640625"
                              y="0.59668"
                              width="20"
                              height="20"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_4001_3041)">
                            <path
                              d="M5.14062 17.5967C4.72812 17.5967 4.375 17.4498 4.08125 17.1561C3.7875 16.8623 3.64062 16.5092 3.64062 16.0967V5.09668C3.64062 4.68418 3.7875 4.33106 4.08125 4.03731C4.375 3.74356 4.72812 3.59668 5.14062 3.59668H11.6406V5.09668H5.14062V16.0967H16.1406V9.59668H17.6406V16.0967C17.6406 16.5092 17.4937 16.8623 17.2 17.1561C16.9062 17.4498 16.5531 17.5967 16.1406 17.5967H5.14062ZM14.6406 8.09668V6.59668H13.1406V5.09668H14.6406V3.59668H16.1406V5.09668H17.6406V6.59668H16.1406V8.09668H14.6406ZM6.14062 14.5967H15.1406L12.1406 10.5967L9.89062 13.5967L8.39062 11.5967L6.14062 14.5967Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>
                      <span>Image</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="fromSection">
              <div className="head_bx">
                <h3>Course Content</h3>
                <div className="rgt_bx">
                  <button
                    className="btn borderbtn"
                    onClick={() => setShowMainModal(true)}
                  >
                    Create a Chapter
                  </button>
                  <button
                    className="btnDelate"
                    disabled={
                      !(chapterId?.length > 0 || resourceId?.length > 0)
                    }
                    onClick={() => setShowDeleteModal(true)}
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
              {chapterList?.results?.length === 0 || undefined || null ? (
                <div className="data_notFound">
                  <div className="inner_bx">
                    <div className="icon">
                      <img
                        src={assets.images.notFound}
                        alt="No content found"
                      />
                    </div>
                    <h3>
                      Add Content from the left panel to start adding here.
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="CourseContentWrapp">
                  <div className="CourseContentList">
                    {chapterList?.results?.map(
                      (course: any, courseIndex: number) => (
                        <div
                          className="card_list_CourseContent"
                          key={courseIndex}
                        >
                          <div className="card_CourseContent">
                            <div className="left_bx">
                              <div className="Courses_checkbx d-block">
                                <label htmlFor={`course-${courseIndex}`}>
                                  <input
                                    type="checkbox"
                                    id={`course-${courseIndex}`}
                                    value={course?.id}
                                    checked={chapterId.some(
                                      (item) => item.id === course.id
                                    )}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      const courseObj = {
                                        id: course?.id,
                                        title: course?.title,
                                      };
                                      // if (isChecked) {
                                      //   setResourceId((prev) =>
                                      //     prev.filter(
                                      //       (item) =>
                                      //         item.courseId !== course?.id
                                      //     )
                                      //   );
                                      // }

                                      setChapterId((prev) => {
                                        if (isChecked) {
                                          const alreadyExists = prev.some(
                                            (item) => item.id === course.id
                                          );
                                          return alreadyExists
                                            ? prev
                                            : [...prev, courseObj];
                                        } else {
                                          return prev.filter(
                                            (item) => item.id !== course.id
                                          );
                                        }
                                      });

                                      if (isChecked) {
                                        setResourceId([]);
                                        setChapterId((prev) => {
                                          const already = prev.some(
                                            (item) => item.id === course.id
                                          );
                                          return already
                                            ? prev
                                            : [...prev, courseObj];
                                        });
                                        setChapterData(course);
                                      } else {
                                        setChapterId((prev) =>
                                          prev.filter(
                                            (item) => item.id !== course?.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <span></span>
                                </label>
                              </div>
                              <div className="drag_handle">
                                <img
                                  src={assets.images.draghandle}
                                  alt="Drag"
                                />
                              </div>
                              <div className="num">{courseIndex + 1}</div>
                              <div className="ques_name">{course.title}</div>
                            </div>
                            <div className="right_bx">
                              <div className="timer">{course.duration}</div>
                            </div>
                          </div>

                          {course?.resources?.length > 0 && (
                            <div className="card_Child_list">
                              {course.resources.map(
                                (child: any, childIndex: any) => (
                                  <>
                                    <div className="card_Child" key={childIndex}>
                                      <div className="left_bx">
                                        <div className="Courses_checkbx d-block">
                                          <label
                                            htmlFor={`child-${courseIndex}-${childIndex}`}
                                          >
                                            <input
                                              type="checkbox"
                                              id={`child-${courseIndex}-${childIndex}`}
                                              value={child?.id}
                                              // Add checked prop to control the resource checkbox state
                                              checked={
                                                resourceId?.some(
                                                  (item) => item.id === child?.id
                                                ) || false
                                              }
                                              onChange={(e) => {
                                                const isChecked =
                                                  e.target.checked;
                                                const resourceObj = {
                                                  id: child?.id,
                                                  title: child?.title,
                                                  resource_type:
                                                    child?.resource_type,
                                                  courseId: course?.id,
                                                };
                                                setChapterId([]);

                                                setResourceId((prev) => {
                                                  const selectedChapterIds =
                                                    Array.from(
                                                      new Set(
                                                        prev.map(
                                                          (item) => item.courseId
                                                        )
                                                      )
                                                    );

                                                  const isSameChapter =
                                                    selectedChapterIds.length ===
                                                    0 ||
                                                    selectedChapterIds.includes(
                                                      course?.id
                                                    );

                                                  if (isChecked) {
                                                    const filtered = isSameChapter
                                                      ? prev
                                                      : [];

                                                    const alreadyExists =
                                                      filtered.some(
                                                        (item) =>
                                                          item.id === child?.id
                                                      );
                                                    return alreadyExists
                                                      ? filtered
                                                      : [
                                                        ...filtered,
                                                        resourceObj,
                                                      ];
                                                  } else {
                                                    return prev.filter(
                                                      (item) =>
                                                        item.id !== child?.id
                                                    );
                                                  }
                                                });

                                                if (isChecked) {
                                                  setRescourceData(child);
                                                }
                                              }}
                                            />
                                            <span></span>
                                          </label>
                                        </div>
                                        <div className="drag_handle">
                                          <img
                                            src={assets.images.draghandle}
                                            alt="Drag"
                                          />
                                        </div>
                                        <div className="num">{`${courseIndex + 1
                                          }.${childIndex + 1}`}</div>
                                        {child?.resource_type === "pdf" ? (
                                          <>
                                            <div className="Ques_docoment">
                                              <img
                                                src={assets.images.docoument}
                                                alt="Document"
                                              />
                                            </div>
                                            <div className="ques_name">
                                              {child.title}
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="ques_img">
                                              <img
                                                src={
                                                  child?.resource_type ===
                                                    "video"
                                                    ? assets.images
                                                      .otherProduct01
                                                    : child.url
                                                }
                                                alt={child.original_video_name}
                                              />
                                            </div>
                                            <div className="ques_name">
                                              {child?.resource_type === "video"
                                                ? child.original_video_name
                                                : child.title}
                                            </div>
                                          </>
                                        )}
                                        {/* <div className="ques_name">
                                        {child.original_video_name}
                                      </div> */}
                                      </div>
                                      <div className="right_bx">
                                        {child?.resource_type === "video" &&
                                          !child?.mask_as_free ? (
                                          <button
                                            className="mark_btn"
                                            onClick={() => {
                                              setRescourceData(child);
                                              setMarkAsFree(true);
                                            }}
                                          >
                                            Mark as a free lecture
                                          </button>
                                        ) : (
                                          child?.resource_type === "video" && (
                                            <button
                                              className="mark_btn"
                                              disabled
                                            // onClick={() => {
                                            //   setRescourceData(child);
                                            //   setMarkAsFree(true);
                                            // }}
                                            >
                                              Demo Lecture
                                            </button>
                                          )
                                        )}
                                        {child?.resource_type === "video" && (
                                          <div className="timer">
                                            {formatSecondsToHHMMSS(
                                              child.original_duration
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {child?.sectional_tests.length>0 && child?.sectional_tests?.map((test:any,testIdx:any)=>(
                                      <div
                                        className="card_Child"
                                        key={`sectional-test-${childIndex}-${testIdx}`}
                                      >
                                        <div className="left_bx">
                                          <div className="Courses_checkbx d-block">
                                            <label
                                              htmlFor={`sectional-test-${courseIndex}-${childIndex}-${testIdx}`}
                                            >
                                              <input
                                                type="checkbox"
                                                id={`sectional-test-${courseIndex}-${childIndex}-${testIdx}`}
                                                value={test.id}
                                                // checked={
                                                //   sectionalTestId?.some(
                                                //     (item) =>
                                                //       item.id ===
                                                //       child.sectional_tests.id
                                                //   ) || false
                                                // }
                                                onChange={(e) => {
                                                  const isChecked =
                                                    e.target.checked;
                                                  const sectionalTestObj = {
                                                    id: test.id,
                                                    title:
                                                      test
                                                        .title,
                                                    resourceId: child.id,
                                                  };
                                                  setChapterId([]);
                                                  setResourceId([]);

                                                  // setSectionalTestId((prev) => {
                                                  //   if (isChecked) {
                                                  //     const alreadyExists =
                                                  //       prev.some(
                                                  //         (item) =>
                                                  //           item.id ===
                                                  //           child.sectional_tests
                                                  //             .id
                                                  //       );
                                                  //     return alreadyExists
                                                  //       ? prev
                                                  //       : [
                                                  //           ...prev,
                                                  //           sectionalTestObj,
                                                  //         ];
                                                  //   } else {
                                                  //     return prev.filter(
                                                  //       (item) =>
                                                  //         item.id !==
                                                  //         child.sectional_tests
                                                  //           .id
                                                  //     );
                                                  //   }
                                                  // });

                                                  if (isChecked) {
                                                    setRescourceData(child);
                                                  }
                                                }}
                                              />
                                              <span></span>
                                            </label>
                                          </div>
                                          <div className="drag_handle">
                                            <img
                                              src={assets.images.draghandle}
                                              alt="Drag"
                                            />
                                          </div>
                                          <div className="num">{`${courseIndex + 1
                                            }.${childIndex + 1}.${testIdx+1}`}</div>
                                          <div className="ques_name">
                                            {test.title}
                                          </div>
                                        </div>
                                        <div className="right_bx">
                                          <div className="timer">
                                            {formatSecondsToHHMMSS(
                                              test.test_trigger_duration
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )) }
                                  </>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="admin_panel step2">
          <div className="Breadcrumbs">
            <h3>Add Course 3/3</h3>
            <div className="btn_grp">
              <button
                className="btn"
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
                      disabled={!faqId.length}
                      onClick={() => {
                        deleteFAQ({
                          body: {
                            faq_ids: faqId,
                          },
                        });
                        setFaqId([]);
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
                certificateId={'EICTIITR-SPC'}
              />
            </div>
          </div>
        </div>
      )}

      <AddFeatureModal
        showChapterModal={showChapterModal}
        setShowChapterModal={setShowChapterModal}
        type={"self-paced"}
      />

      <Modal
        show={showMainModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Create a Chapter</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Chapter Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    value={form["chapter_name"] || selectedCourse?.name}
                    onChange={(e) =>
                      handleChange("chapter_name", e.target.value)
                    }
                  />
                </div>
                <div className="from-group mb-3">
                  <label>Chapter Description</label>
                  <input
                    type="text"
                    name="category"
                    className="form-control"
                    placeholder="Enter Name"
                    value={form["chapter_description"] || ""}
                    onChange={(e) =>
                      handleChange("chapter_description", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp">
                  <button
                    className="btn"
                    style={{ background: "#1e3a8a", color: "#fff" }}
                    disabled={
                      !isFieldsEmpty(["chapter_name", "chapter_description"])
                    }
                    onClick={() => {
                      createChapter({
                        title: form["chapter_name"],
                        course_id: courseId || selectedCourse?.base_course_id,
                        description: form["chapter_description"],
                      });
                      setForm((prev) => ({
                        ...prev,
                        chapter_name: "",
                        chapter_description: "",
                      }));
                      setShowMainModal(false);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn"
                    style={{ background: "#e5e5e5", color: "#000" }}
                    onClick={() => {
                      setShowMainModal(false);
                      setForm((prev) => ({
                        ...prev,
                        chapter_name: "",
                        chapter_description: "",
                      }));
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

      <VideoUploaderComponent
        showUploadModal={showUploadvModal}
        setShowUploadModal={setShowUploadvModal}
        chapterData={chapterData}
        courseId={courseId}
      />

      <AddDocumentModal
        showDocumentModal={showDocumentModal}
        setShowDocumentModal={setShowDocumentModal}
        chapterData={resourceData}
        courseId={courseId}
      />
      <AddImageModal
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        chapterData={resourceData}
        courseId={courseId}
      />
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

      <AddSelectiveTestModal
        showSectionalTestModal={showSectionalTestModal}
        setShowSectionalTestModal={setShowSectionalTestModal}
        resourceData={resourceData}
        courseId={courseId}
      />

      <ShowDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        onSubmit={handleDeleteModal}
        title={"Do you want to delete Chapter"}
      />
    </>
  );
};

export default AddCourseSelfPage;
