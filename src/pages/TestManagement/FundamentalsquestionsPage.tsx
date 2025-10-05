import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useCrud } from "../../hooks/useCrud";
import { toast } from "react-toastify";
import Select from "react-select";

interface Option {
  id?: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  text: string;
  marks: number;
  solution: string;
  options: Option[];
}

interface Course {
  id: number;
  title: string;
  category_name: string;
}

interface Test {
  id: number;
  title: string;
  is_draft: boolean;
  questions: Question[];
  duration_hours: number;
  duration_minutes: number;
  course_id: number | null;
  course_name: string | null;
}

interface ValidationErrors {
  questions?: string;
  currentQuestion?: string;
  testName?: string;
  duration?: string;
}

const categoryOptions = [
  { id: 1, value: "Self Paced", label: "Self Paced" },
  { id: 2, value: "FDP", label: "FDP" },
  { id: 5, value: "Short Term Training", label: "Short Term Training" },
  {
    value: "PG Certification",
    label: "PG Certification",
    options: [
      { id: 4, value: "Advance PG Course", label: "Advance PG Course" },
      { id: 6, value: "EICT-Third Party", label: "EICT-Third Party" },
    ],
  },
];

const FundamentalsquestionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const testData = location.state?.testData || {
    title: "",
    duration_hours: 0,
    duration_minutes: 0,
  };
  const test: Test | undefined = location.state?.test;
  const isEditMode = !!test;

  const { useCreate, useUpdate, useFetch } = useCrud();
  const createTest = useCreate("/tests/create/", "/test-management/all-test");
  const updateTest = useUpdate("/tests/create/", "/test-management/all-test");

  const [sections, setSections] = useState<
    {
      id: number;
      name: string;
      isAccordionOpen: boolean;
      hasQuestion: boolean;
      questions: Question[];
    }[]
  >([
    {
      id: 1,
      name: "Section 1",
      isAccordionOpen: true,
      hasQuestion: false,
      questions: [],
    },
  ]);

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showQuestionEditModal, setShowQuestionEditModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState<string>("");
  const [solution, setSolution] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);
  const [tempQuestions, setTempQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [testName, setTestName] = useState<string>(
    isEditMode ? test!.title : testData.title
  );
  const [durationHours, setDurationHours] = useState<string>(
    (isEditMode ? test!.duration_hours : testData.duration_hours).toString()
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    (isEditMode ? test!.duration_minutes : testData.duration_minutes)
      .toString()
      .padStart(2, "0")
  );

  const {
    data: courseData,
    isLoading: isLoadingCourses,
    error: courseError,
  } = useFetch<Course[]>(
    "/courses/courses-list-2/",
    {
      category: selectedCategory?.id || "",
    },
    { enabled: !!selectedCategory?.id }
  );

  // Initialize state for edit mode
  useEffect(() => {
    if (isEditMode && test) {
      setSections([
        {
          id: 1,
          name: "Section 1",
          isAccordionOpen: true,
          hasQuestion: test.questions.length > 0,
          questions: test.questions.map((q) => ({
            ...q,
            id: q.id || Date.now() + Math.random(),
          })),
        },
      ]);
      if (test.course_id && test.course_name) {
        setSelectedCourse({ value: test.course_id, label: test.course_name });

        let categoryId = null;

        if (test.course_name.includes("Self Paced")) {
          categoryId = 1;
        } else if (test.course_name.includes("FDP")) {
          categoryId = 2;
        } else if (test.course_name.includes("Short Term Training")) {
          categoryId = 5;
        } else if (test.course_name.includes("Advance PG Course")) {
          categoryId = 4;
        } else if (test.course_name.includes("EICT-Third Party")) {
          categoryId = 6;
        }

        if (!categoryId) {
          setSelectedCategoryById(1);
        } else {
          setSelectedCategoryById(categoryId);
        }
      }
      setIsDraft(test.is_draft);
    }
  }, [isEditMode, test]);

  useEffect(() => {
    if (courseData) {
      const courses = courseData.map((course: Course) => ({
        value: course.id,
        label: course.title,
      }));
      setCourseOptions(courses);
      if (isEditMode && test?.course_id) {
        const matchingCourse = courses.find(
          (course) => course.value === test.course_id
        );
        if (matchingCourse) {
          setSelectedCourse(matchingCourse);
        }
      }
    } else {
      setCourseOptions([]);
    }
    if (courseError) {
      toast.error("Failed to fetch courses.");
      setCourseOptions([]);
    }
  }, [courseData, courseError, isEditMode, test]);

  useEffect(() => {
    if (!isEditMode || !test?.course_id) {
      setSelectedCourse(null);
    }
  }, [selectedCategory, isEditMode, test]);

  const setSelectedCategoryById = (categoryId: number) => {
    let foundCategory = null;

    for (const category of categoryOptions) {
      if (category.id === categoryId) {
        foundCategory = category;
        break;
      }

      if (category.options) {
        for (const subCategory of category.options) {
          if (subCategory.id === categoryId) {
            foundCategory = category;
            break;
          }
        }
        if (foundCategory) break;
      }
    }

    if (foundCategory) {
      setSelectedCategory(foundCategory);
    }
  };

  const validateCurrentQuestion = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!questionText.trim()) {
      newErrors.currentQuestion = "Question text is required.";
    } else if (!marks || parseInt(marks) <= 0) {
      newErrors.currentQuestion = "Marks must be positive.";
    } else if (!solution.trim()) {
      newErrors.currentQuestion = "Solution is required.";
    } else if (options.length < 2) {
      newErrors.currentQuestion = "At least two options are required.";
    } else if (options.some((opt) => !opt.text.trim())) {
      newErrors.currentQuestion = "All options must have text.";
    } else if (!options.some((opt) => opt.is_correct)) {
      newErrors.currentQuestion = "One correct option must be selected.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllQuestions = (): boolean => {
    const newErrors: ValidationErrors = {};
    const allQuestions = sections
      .flatMap((section) => section.questions)
      .concat(tempQuestions);
    if (allQuestions.length === 0) {
      newErrors.questions = "At least one question is required.";
    } else {
      const invalidQuestions = allQuestions.filter(
        (q) =>
          !q.text.trim() ||
          !q.marks ||
          parseInt(String(q.marks)) <= 0 ||
          !q.solution.trim() ||
          q.options.length < 2 ||
          q.options.some((opt) => !opt.text.trim()) ||
          !q.options.some((opt) => opt.is_correct)
      );
      if (invalidQuestions.length > 0) {
        newErrors.questions =
          "All questions must have text, positive marks, a solution, at least two options, and one correct option.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTestDetails = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!testName.trim()) {
      newErrors.testName = "Test Name is required";
    }
    if (Number(durationHours) === 0 && Number(durationMinutes) === 0) {
      newErrors.duration = "At least one duration field must be non-zero";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleQuestionModalShow = (sectionId: number) => {
    setActiveSectionId(sectionId);
    setTempQuestions([]);
    setCurrentQuestionIndex(0);
    resetQuestionForm();
    setShowQuestionModal(true);
  };

  const handleQuestionEditModalShow = (
    sectionId: number,
    question?: Question
  ) => {
    setActiveSectionId(sectionId);
    if (question) {
      setQuestionText(question.text);
      setMarks(String(question.marks));
      setSolution(question.solution);
      setOptions(
        question.options.length
          ? question.options
          : [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ]
      );
      setQuestionToDelete(question);
    }
    setShowQuestionEditModal(true);
  };

  const handleQuestionModalClose = () => {
    setShowQuestionModal(false);
    setTempQuestions([]);
    setCurrentQuestionIndex(0);
    resetQuestionForm();
    setErrors({});
  };

  const handleQuestionEditModalClose = () => {
    setShowQuestionEditModal(false);
    resetQuestionForm();
    setQuestionToDelete(null);
  };

  const handleTestDetailsModalShow = () => {
    setTestName(isEditMode ? test!.title : testData.title);
    setDurationHours(
      (isEditMode ? test!.duration_hours : testData.duration_hours).toString()
    );
    setDurationMinutes(
      (isEditMode ? test!.duration_minutes : testData.duration_minutes)
        .toString()
        .padStart(2, "0")
    );
    setErrors({});
    setShowTestDetailsModal(true);
  };

  const handleTestDetailsModalClose = () => {
    setShowTestDetailsModal(false);
    setErrors({});
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setMarks("");
    setSolution("");
    setOptions([
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ]);
  };

  const saveCurrentQuestion = () => {
    const currentQuestion: Question = {
      id: Date.now() + currentQuestionIndex,
      text: questionText,
      marks: parseInt(marks) || 0,
      solution,
      options: options.map((opt) => ({ ...opt })),
    };
    setTempQuestions((prev) => {
      const updated = [...prev];
      while (updated.length <= currentQuestionIndex) {
        updated.push({
          id: Date.now() + updated.length,
          text: "",
          marks: 1,
          solution: "",
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
        });
      }
      updated[currentQuestionIndex] = currentQuestion;
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (!validateCurrentQuestion()) {
      toast.error(
        errors.currentQuestion || "Please fix the current question errors."
      );
      return;
    }
    saveCurrentQuestion();
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    if (nextIndex < tempQuestions.length) {
      const nextQuestion = tempQuestions[nextIndex];
      setQuestionText(nextQuestion.text || "");
      setMarks(String(nextQuestion.marks || 1));
      setSolution(nextQuestion.solution || "");
      setOptions(
        nextQuestion.options.length
          ? nextQuestion.options
          : [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ]
      );
    } else {
      resetQuestionForm();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentQuestion();
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      const prevQuestion = tempQuestions[prevIndex];
      setQuestionText(prevQuestion.text || "");
      setMarks(String(prevQuestion.marks || 1));
      setSolution(prevQuestion.solution || "");
      setOptions(
        prevQuestion.options.length
          ? prevQuestion.options
          : [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ]
      );
    }
  };

  const handleSaveAllQuestions = () => {
    if (!validateCurrentQuestion()) {
      toast.error(
        errors.currentQuestion || "Please fix the current question errors."
      );
      return;
    }

    saveCurrentQuestion();

    const validQuestions = tempQuestions
      .filter(
        (q, idx) =>
          idx !== currentQuestionIndex &&
          q.text.trim() &&
          parseInt(String(q.marks)) > 0 &&
          q.solution.trim() &&
          q.options.length >= 2 &&
          q.options.every((opt) => opt.text.trim()) &&
          q.options.some((opt) => opt.is_correct)
      )
      .concat({
        id: Date.now() + currentQuestionIndex,
        text: questionText,
        marks: parseInt(marks) || 0,
        solution,
        options: options.map((opt) => ({ ...opt })),
      })
      .filter(
        (q) =>
          q.text.trim() &&
          parseInt(String(q.marks)) > 0 &&
          q.solution.trim() &&
          q.options.length >= 2 &&
          q.options.every((opt) => opt.text.trim()) &&
          q.options.some((opt) => opt.is_correct)
      );

    if (validQuestions.length === 0) {
      toast.error("At least one valid question is required.");
      return;
    }

    const updatedSections = sections.map((section) => {
      if (section.id === activeSectionId) {
        return {
          ...section,
          hasQuestion: true,
          questions: [
            ...section.questions,
            ...validQuestions.map((q, idx) => ({
              ...q,
              id: q.id || Date.now() + idx,
            })),
          ],
        };
      }
      return section;
    });

    setSections(updatedSections);
    handleQuestionModalClose();
  };

  const handleSaveQuestion = () => {
    if (!validateCurrentQuestion()) {
      toast.error(
        errors.currentQuestion || "Please fix the current question errors."
      );
      return;
    }
    if (!questionToDelete) return;
    const updatedSections = sections.map((section) => {
      if (section.id === activeSectionId) {
        return {
          ...section,
          questions: section.questions.map((q) =>
            q.id === questionToDelete.id
              ? {
                  id: q.id,
                  text: questionText,
                  marks: parseInt(marks) || 0,
                  solution,
                  options: options.map((opt) => ({ ...opt })),
                }
              : q
          ),
        };
      }
      return section;
    });
    setSections(updatedSections);
    handleQuestionEditModalClose();
  };

  const handleSaveTestDetails = () => {
    if (!validateTestDetails()) {
      return;
    }

    if (isEditMode) {
      const payload = {
        id: test!.id,
        data: {
          title: testName,
          duration_hours: Number(durationHours),
          duration_minutes: Number(durationMinutes),
          is_draft: test!.is_draft,
          questions: sections.flatMap((section) => section.questions),
          ...(test!.course_id ? { course_id: test!.course_id } : {}),
        },
      };

      updateTest.mutate(payload, {
        onSuccess: () => {
          toast.success("Test details updated successfully!");
          setShowTestDetailsModal(false);
          navigate("/test-management/all-test");
          if (test) {
            test.title = testName;
            test.duration_hours = Number(durationHours);
            test.duration_minutes = Number(durationMinutes);
          }
        },
        onError: () => {
          toast.error("Failed to update test details.");
        },
      });
    } else {
      testData.title = testName;
      testData.duration_hours = Number(durationHours);
      testData.duration_minutes = Number(durationMinutes);
      setShowTestDetailsModal(false);
      toast.success("Test details updated locally!");
    }
  };

  const toggleAccordion = (id: number) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, isAccordionOpen: !section.isAccordionOpen }
          : section
      )
    );
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { text: "", is_correct: false }]);
  };

  const handleDeleteOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("At least two options are required.");
      return;
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };

  const handleOptionCorrectChange = (index: number) => {
    const newOptions = options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === index,
    }));
    setOptions(newOptions);
  };

  const handleDeleteQuestion = (sectionId: number, questionId: number) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
              hasQuestion: section.questions.length > 1,
            }
          : section
      )
    );
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  const handleSubmit = (isDraftStatus: boolean) => {
    if (!validateAllQuestions()) {
      toast.error(
        errors.questions || "Please fix the errors before submitting."
      );
      return;
    }
    const payload = {
      title: testName,
      is_draft: isDraftStatus,
      duration_hours: Number(durationHours),
      duration_minutes: Number(durationMinutes),
      questions: sections.flatMap((section) => section.questions),
      ...(isDraftStatus === false && selectedCourse
        ? { course_id: selectedCourse.value }
        : {}),
    };

    if (isEditMode) {
      updateTest.mutate(
        {
          id: test!.id,
          data: payload,
        },
        {
          onSuccess: () => {
            toast.success(
              `Test ${
                isDraftStatus ? "saved as draft" : "updated"
              } successfully!`
            );
            navigate("/test-management/all-test");
          },
          onError: (error: any) => {
            console.error("Failed to update test:", error);
            toast.error("Failed to update test. Please try again.");
            setErrors({
              questions: "Failed to update test. Please try again.",
            });
          },
        }
      );
    } else {
      createTest.mutate(payload, {
        onSuccess: () => {
          toast.success(
            `Test ${isDraftStatus ? "saved as draft" : "created"} successfully!`
          );
          navigate("/test-management/all-test");
        },
        onError: (error: any) => {
          console.error("Failed to create test:", error);
          toast.error("Failed to create test. Please try again.");
          setErrors({ questions: "Failed to create test. Please try again." });
        },
      });
    }
  };

  const hoursOptions = Array.from({ length: 5 }, (_, i) => ({
    value: i.toString(),
    label: `${i} hr${i > 1 ? "s" : ""}`,
  }));

  const minutesOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: `${i.toString().padStart(2, "0")} min`,
  }));

  return (
    <>
      <div
        className="TestProfileEvaluationWrapp"
        style={{ background: "#f5f5f5" }}
      >
        <div className="head_bx">
          <Link to="/test-management/all-test">
            <span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 15L3 9L9 3L9.7875 3.7875L5.1375 8.4375H15V9.5625H5.1375L9.7875 14.2125L9 15Z"
                  fill="black"
                />
              </svg>
            </span>{" "}
            {isEditMode ? "Edit Test Questions" : "Create Test Questions"}
          </Link>
          <div className="btn_grp">
            <button
              className="btn"
              onClick={() => {
                setIsDraft(true);
                setShowDraftModal(true);
                handleSubmit(true);
              }}
              disabled={
                createTest.isPending ||
                updateTest.isPending ||
                sections.flatMap((s) => s.questions).length === 0
              }
            >
              Save as a Draft
            </button>
            <button
              className="btn"
              onClick={() => {
                setIsDraft(false);
                setShowMainModal(true);
              }}
              disabled={
                createTest.isPending ||
                updateTest.isPending ||
                sections.flatMap((s) => s.questions).length === 0
              }
            >
              Save Align to Course
            </button>
          </div>
        </div>

        <div className="Fundamentals_wrapp">
          <div className="left_bx">
            <button
              className="btn"
              onClick={() => handleQuestionModalShow(sections[0].id)}
            >
              <span>Create Questions</span>
              <span className="arrow">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.2929 15.7081C10.4818 15.8949 10.7368 15.9996 11.0024 15.9996C11.2681 15.9996 11.523 15.8949 11.7119 15.7081L14.6769 12.7691C14.8919 12.5511 14.9989 12.2691 14.9989 11.9901C14.9989 11.7111 14.8919 11.4341 14.6769 11.2211L11.7219 8.29105C11.5329 8.10449 11.278 7.99988 11.0124 7.99988C10.7469 7.99988 10.492 8.10449 10.3029 8.29105C10.2098 8.38288 10.1358 8.49233 10.0853 8.61301C10.0347 8.7337 10.0087 8.86322 10.0087 8.99405C10.0087 9.12488 10.0347 9.25441 10.0853 9.37509C10.1358 9.49578 10.2098 9.60522 10.3029 9.69705L12.6199 11.9951L10.2929 14.3021C10.2001 14.3941 10.1264 14.5036 10.0762 14.6243C10.0259 14.7449 10 14.8743 10 15.0051C10 15.1358 10.0259 15.2652 10.0762 15.3858C10.1264 15.5065 10.2001 15.616 10.2929 15.7081Z"
                    fill="black"
                  />
                </svg>
              </span>
            </button>
          </div>

          <div className="right_bx">
            <div className="hd_bx">
              <button className="btn_edit" onClick={handleTestDetailsModalShow}>
                {testName}
                <span>
                  <svg
                    width="15"
                    height="16"
                    viewBox="0 0 15 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.626 1.06685C11.3584 0.334487 12.5478 0.334487 13.2803 1.06685L14.4346 2.22203C15.167 2.95416 15.167 4.14244 14.4346 4.87486L13.0166 6.29283L9.208 2.48482L10.626 1.06685ZM12.3545 6.95494L5.52245 13.784C5.21777 14.0887 4.83984 14.3143 4.42675 14.4344L0.901458 15.4715C0.654779 15.5448 0.387884 15.4774 0.20595 15.2694C0.024011 15.1141 -0.0440105 14.8475 0.0285871 14.5985L1.06552 11.0741C1.1874 10.661 1.41093 10.2831 1.71591 9.97837L8.54589 3.14751L12.3545 6.95494Z"
                      fill="black"
                    />
                  </svg>
                </span>
              </button>
              <p>
                Test Duration:{" "}
                <span>
                  {durationHours} hr(s), {durationMinutes} min(s)
                </span>
              </p>
              <div className="instr_bx">
                <ol>
                  <li>
                    The test consists of{" "}
                    {sections.flatMap((s) => s.questions).length} questions,
                    each question has multiple options out of which only one
                    option will be correct.
                  </li>
                  <li>Marks will be awarded based on question settings.</li>
                  <li>
                    No marks will be awarded or deducted for un-answered
                    questions.
                  </li>
                </ol>
              </div>
            </div>
            {errors.questions && (
              <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
                {errors.questions}
              </p>
            )}
            {sections.map((section) => (
              <div className="ques_section" key={section.id}>
                <div
                  className="header_bx"
                  onClick={() => toggleAccordion(section.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="lft_bx">
                    <h3>
                      {section.name} - {section.questions.length} Questions
                    </h3>
                    <p>
                      Max. Section Marks:{" "}
                      {section.questions.reduce(
                        (sum, q) => sum + parseInt(String(q.marks)),
                        0
                      )}
                      .00
                    </p>
                  </div>
                  <div className="rgt_bx">
                    <button className="edit_btn">
                      <span>
                        <svg
                          width="15"
                          height="16"
                          viewBox="0 0 15 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.125 12.375H4L10.2812 6.10938L9.84375 5.65625L9.39062 5.21875L3.125 11.5V12.375ZM1.875 13.625V10.9688L10.2812 2.57813C10.5208 2.33854 10.8152 2.21875 11.1644 2.21875C11.5131 2.21875 11.8073 2.33854 12.0469 2.57813L12.9219 3.46875C13.1615 3.70833 13.2812 4.0026 13.2812 4.34375C13.2812 4.6875 13.1615 4.97917 12.9219 5.21875L4.53125 13.625H1.875Z"
                            fill="#0373BA"
                          />
                        </svg>
                      </span>
                      Edit Details
                    </button>
                    <button className="arrow">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17 10L12 15L7 10H17Z" fill="#0373BA" />
                      </svg>
                    </button>
                  </div>
                </div>

                {section.isAccordionOpen && (
                  <div className="body_ques">
                    {!section.hasQuestion ? (
                      <div className="dataNotFound">
                        <div className="inner_bx">
                          <h3>Let’s add questions</h3>
                          <p>
                            You can use the <b>‘Create Questions’</b> button or{" "}
                            <b>‘Create Test’</b> panel on left to add questions
                            to a section.
                          </p>
                          <button
                            className="btn"
                            onClick={() => handleQuestionModalShow(section.id)}
                          >
                            Create Questions
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="question_Fund">
                        {section.questions.map((q, idx) => (
                          <div className="qst_lq" key={q.id}>
                            <div className="card_ques">
                              <h3>
                                <span>{idx + 1}.</span> {q.text}
                              </h3>
                              <div className="list_option">
                                {q.options.map((opt, i) => (
                                  <label key={i}>
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      checked={opt.is_correct}
                                      readOnly
                                    />
                                    <span>{opt.text}</span>
                                  </label>
                                ))}
                              </div>
                              <p>Solution: {q.solution}</p>
                            </div>
                            <div className="qus_gr">
                              <div className="qus_mark">+{q.marks}</div>
                              <div className="btn_grpquest">
                                <button
                                  onClick={() =>
                                    handleQuestionEditModalShow(section.id, q)
                                  }
                                  className="btn"
                                >
                                  <span>
                                    <svg
                                      width="15"
                                      height="15"
                                      viewBox="0 0 15 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M3.125 11.875H4L10.2812 5.60938L9.84375 5.15625L9.39062 4.71875L3.125 11V11.875ZM1.875 13.125V10.4688L10.2812 2.07813C10.5208 1.83854 10.8152 1.71875 11.1644 1.71875C11.5131 1.71875 11.8073 1.83854 12.0469 2.07813L12.9219 2.96875C13.1615 3.20833 13.2812 3.5 13.2812 3.84375C13.2812 4.1875 13.1615 4.47917 12.9219 4.71875L4.53125 13.125H1.875Z"
                                        fill="#666666"
                                      />
                                    </svg>
                                  </span>{" "}
                                  Edit
                                </button>
                                <button className="btn">
                                  <span>
                                    <svg
                                      width="15"
                                      height="15"
                                      viewBox="0 0 15 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5.625 11.25C5.28125 11.25 4.98708 11.1277 4.7425 10.8831C4.4975 10.6381 4.375 10.3438 4.375 10V2.5C4.375 2.15625 4.4975 1.86187 4.7425 1.61687C4.98708 1.37229 5.28125 1.25 5.625 1.25H11.25C11.5938 1.25 11.8881 1.37229 12.1331 1.61687C12.3777 1.86187 12.5 2.15625 12.5 2.5V10C12.5 10.3438 12.3777 10.6381 12.1331 10.8831C11.8881 11.1277 11.5938 11.25 11.25 11.25H5.625ZM5.625 10H11.25V2.5H5.625V10ZM3.125 13.75C2.78125 13.75 2.48687 13.6277 2.24187 13.3831C1.99729 13.1381 1.875 12.8438 1.875 12.5V3.75H3.125V12.5H10V13.75H3.125Z"
                                        fill="#666666"
                                      />
                                    </svg>
                                  </span>{" "}
                                  Copy
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveSectionId(section.id);
                                    setQuestionToDelete(q);
                                    setShowDeleteModal(true);
                                  }}
                                  className="btn"
                                >
                                  <span>
                                    <svg
                                      width="15"
                                      height="15"
                                      viewBox="0 0 15 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M5 11.875H10V5.625H5V11.875ZM3.125 3.75V2.5H5.3125L5.9375 1.875H9.0625L9.6875 2.5H11.875V3.75H3.125ZM5 13.125C4.65625 13.125 4.36208 13.0027 4.1175 12.7581C3.8725 12.5131 3.75 12.2188 3.75 11.875V4.375H11.25V11.875C11.25 12.2188 11.1277 12.5131 10.8831 12.7581C10.6381 13.0027 10.3438 13.125 10 13.125H5Z"
                                        fill="#666666"
                                      />
                                    </svg>
                                  </span>{" "}
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Details Modal */}
      <Modal
        show={showTestDetailsModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>{isEditMode ? "Edit Test Details" : "Create Test Details"}</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-12 mb-3">
                <label>
                  Test Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="testName"
                  placeholder="Enter"
                  className="form-control"
                  value={testName}
                  onChange={(e) => {
                    setTestName(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, testName: undefined }));
                    }
                  }}
                  required
                />
                {errors.testName && (
                  <small style={{ color: "red" }}>{errors.testName}</small>
                )}
              </div>
              <div className="col-md-12 mb-3">
                <label>
                  Test Duration <span style={{ color: "red" }}>*</span>
                </label>
                <div className="d-flex gap-3">
                  <div style={{ flex: 1 }}>
                    <label>Hours</label>
                    <Select
                      options={hoursOptions}
                      value={hoursOptions.find(
                        (opt) => opt.value === durationHours
                      )}
                      onChange={(selected) => {
                        setDurationHours(selected?.value || "0");
                        if (
                          selected?.value !== "0" ||
                          Number(durationMinutes) > 0
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            duration: undefined,
                          }));
                        }
                      }}
                      isSearchable={false}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Minutes</label>
                    <Select
                      options={minutesOptions}
                      value={minutesOptions.find(
                        (opt) => opt.value === durationMinutes
                      )}
                      onChange={(selected) => {
                        setDurationMinutes(selected?.value || "00");
                        if (
                          selected?.value !== "00" ||
                          Number(durationHours) > 0
                        ) {
                          setErrors((prev) => ({
                            ...prev,
                            duration: undefined,
                          }));
                        }
                      }}
                      isSearchable={false}
                      required
                    />
                  </div>
                </div>
                {errors.duration && (
                  <small style={{ color: "red" }}>{errors.duration}</small>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="col-md-5 d-flex align-items-end justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={handleTestDetailsModalClose}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveTestDetails}
              disabled={
                !!errors.testName || !!errors.duration || updateTest.isPending
              }
            >
              {updateTest.isPending ? "Saving..." : "Submit"}
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Question Modal */}
      <Modal
        show={showQuestionModal}
        centered
        dialogClassName="modalfull_mcq"
      >
        <Modal.Body>
          <div className="header_bx">
            <div className="lft_bx">
              <h3>
                Question {currentQuestionIndex + 1} of {tempQuestions.length} -
                Multiple Choice
              </h3>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  value={marks}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setMarks(value);
                  }}
                  placeholder="Enter marks"
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="btn_grp">
              <button
                className="btn"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button className="btn" onClick={handleNextQuestion}>
                Next
              </button>
              <button className="btn" onClick={handleSaveAllQuestions}>
                Save Question{tempQuestions.length > 1 ? "s" : ""}
              </button>
              <button className="btnClose" onClick={handleQuestionModalClose}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.33333 15.8333L4.16667 14.6667L8.83333 10L4.16667 5.33333L5.33333 4.16667L10 8.83333L14.6667 4.16667L15.8333 5.33333L11.1667 10L15.8333 14.6667L14.6667 15.8333L10 11.1667L5.33333 15.8333Z"
                    fill="#666666"
                  />
                </svg>
              </button>
            </div>
          </div>
          {errors.currentQuestion && (
            <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
              {errors.currentQuestion}
            </p>
          )}
          <div className="form-group mb-3">
            <h3>Question</h3>
            <input
              type="text"
              className="form-control"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question..."
            />
          </div>
          <div className="form-Answers">
            <h3>Answers</h3>
            {options.map((opt, idx) => (
              <div className="option" key={idx}>
                <div className="radio_bx">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.is_correct}
                    onChange={() => handleOptionCorrectChange(idx)}
                  />
                </div>
                <div className="optionDetails">
                  <input
                    type="text"
                    className="form-control"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionTextChange(idx, e.target.value)
                    }
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleDeleteOption(idx)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 11.875H10V5.625H5V11.875ZM3.125 3.75V2.5H5.3125L5.9375 1.875H9.0625L9.6875 2.5H11.875V3.75H3.125ZM5 13.125C4.65625 13.125 4.36208 13.0027 4.1175 12.7581C3.8725 12.5131 3.75 12.2188 3.75 11.875V4.375H11.25V11.875C11.25 12.2188 11.1277 12.5131 10.8831 12.7581C10.6381 13.0027 10.3438 13.125 10 13.125H5Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button className="btnAdd" onClick={handleAddOption}>
              Add a new option
            </button>
          </div>
          <div className="from-Solution">
            <h3>Solution</h3>
            <input
              type="text"
              className="form-control"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter detailed solution for your students"
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* Question Edit Modal */}
      <Modal
        show={showQuestionEditModal}
        centered
        dialogClassName="modalfull_mcq"
        onHide={handleQuestionEditModalClose}
      >
        <Modal.Body>
          <div className="header_bx">
            <div className="lft_bx">
              <h3>Edit Question - Multiple Choice</h3>
              <input
                type="text"
                className="form-control"
                value={marks}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) setMarks(value);
                }}
                placeholder="Enter marks"
                inputMode="numeric"
              />
            </div>
            <div className="btn_grp">
              <button className="btn" onClick={handleSaveQuestion}>
                Save
              </button>
              <button
                className="btnClose"
                onClick={handleQuestionEditModalClose}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.33333 15.8333L4.16667 14.6667L8.83333 10L4.16667 5.33333L5.33333 4.16667L10 8.83333L14.6667 4.16667L15.8333 5.33333L11.1667 10L15.8333 14.6667L14.6667 15.8333L10 11.1667L5.33333 15.8333Z"
                    fill="#666666"
                  />
                </svg>
              </button>
            </div>
          </div>
          {errors.currentQuestion && (
            <p className="error" style={{ color: "red", fontSize: "0.8em" }}>
              {errors.currentQuestion}
            </p>
          )}
          <div className="form-group mb-3">
            <h3>Question</h3>
            <input
              type="text"
              className="form-control"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question..."
            />
          </div>
          <div className="form-Answers">
            <h3>Answers</h3>
            {options.map((opt, idx) => (
              <div className="option" key={idx}>
                <div className="radio_bx">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.is_correct}
                    onChange={() => handleOptionCorrectChange(idx)}
                  />
                </div>
                <div className="optionDetails">
                  <input
                    type="text"
                    className="form-control"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionTextChange(idx, e.target.value)
                    }
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleDeleteOption(idx)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 11.875H10V5.625H5V11.875ZM3.125 3.75V2.5H5.3125L5.9375 1.875H9.0625L9.6875 2.5H11.875V3.75H3.125ZM5 13.125C4.65625 13.125 4.36208 13.0027 4.1175 12.7581C3.8725 12.5131 3.75 12.2188 3.75 11.875V4.375H11.25V11.875C11.25 12.2188 11.1277 12.5131 10.8831 12.7581C10.6381 13.0027 10.3438 13.125 10 13.125H5Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button className="btnAdd" onClick={handleAddOption}>
              Add a new option
            </button>
          </div>
          <div className="from-Solution">
            <h3>Solution</h3>
            <input
              type="text"
              className="form-control"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter detailed solution for your students"
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* Link to Course Modal */}
      <Modal
        show={showMainModal}
        centered
        dialogClassName="modalfullCustom modalSM modalMd"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="headerModal">
            <h3>Link to Course</h3>
          </div>
          <div className="fromSection">
            <div className="row">
              <div className="col-lg-12">
                <div className="from-group mb-3">
                  <label>Category</label>
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Select Category"
                    isClearable
                  />
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="from-group mb-3">
                  <label>Link Course</label>
                  <Select
                    options={courseOptions}
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                    placeholder="Select Course"
                    isClearable
                    isLoading={isLoadingCourses}
                    isDisabled={!selectedCategory?.id || isLoadingCourses}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="btn_grp btnRight_grp">
                  <button
                    className="btn"
                    onClick={() => {
                      setShowMainModal(false);
                      setSelectedCategory(null);
                      setSelectedCourse(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!selectedCourse) {
                        toast.error("Please select a course.");
                        return;
                      }
                      handleSubmit(false);
                      setShowMainModal(false);
                      setSelectedCategory(null);
                      setSelectedCourse(null);
                    }}
                    disabled={
                      createTest.isPending ||
                      updateTest.isPending ||
                      !selectedCourse
                    }
                  >
                    {createTest.isPending || updateTest.isPending
                      ? "Submitting..."
                      : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Draft Modal */}
      <Modal
        show={showDraftModal}
        centered
        onHide={() => setShowDraftModal(false)}
        dialogClassName="modalfullCustom modalSM modalSucss"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Body>
          <div className="fund_draft">
            <h3>
              {createTest.isPending || updateTest.isPending
                ? "Saving..."
                : `Test has been saved to Draft`}
            </h3>
            {!(createTest.isPending || updateTest.isPending) && (
              <div className="btn_grp">
                <button
                  className="btn"
                  onClick={() => {
                    setShowDraftModal(false);
                    navigate("/test-management/all-test");
                  }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal
        centered
        dialogClassName="modalfullCustom modalSM modalSucss"
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Body>
          <div className="fund_delete">
            <h3>Are you sure you want to delete this question?</h3>
            <div className="btn_grp">
              <Button className="btn" onClick={() => setShowDeleteModal(false)}>
                No
              </Button>
              <Button
                className="btn"
                onClick={() => {
                  if (activeSectionId && questionToDelete) {
                    handleDeleteQuestion(activeSectionId, questionToDelete.id);
                  }
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FundamentalsquestionsPage;
