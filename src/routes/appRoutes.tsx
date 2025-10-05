import HomePage from "../pages/home/HomePage";
import StudentManagementPage from "../pages/StudentManagement/StudentManagementPage";
import { RouteType } from "./config";
import assets from "../assets";
import LiveClassPage from "../pages/LiveClass/LiveClassPage";
import PastCourseManagementPage from "../pages/PastCourseManagement/PastCourseManagementPage";
import CalendarPage from "../pages/Calendar/CalendarPage";
import StudentManagementstudentDetailPage from "../pages/StudentManagement/StudentManagementstudentDetailPage";
import AllAnnouncementPage from "../pages/Announcement/AllAnnouncementPage";
import AddPastCourseManagementPage from "../pages/PastCourseManagement/AddPastCourseManagementPage";
import EditPastCourseManagementPage from "../pages/PastCourseManagement/EditPastCourseManagementPage";
import NoticeBoardPage from "../pages/NoticeBoard/NoticeBoardPage";
import PartnerManagementPage from "../pages/PartnerManagement/PartnerManagementPage";
import AddPartnerManagementPage from "../pages/PartnerManagement/AddPartnerManagementPage";
import AllCertificatePage from "../pages/CertificateManagement/AllCertificatePage";
import CreateCertificatePage from "../pages/CertificateManagement/CreateCertificatePage";
import UploadSampleCertificatePage from "../pages/CertificateManagement/UploadSampleCertificatePage";
import AddNewCertificatePage from "../pages/CertificateManagement/AddNewCertificatePage";
import HeaderManagementPage from "../pages/HeaderManagement/HeaderManagementPage";
import AddHeaderButtonListPage from "../pages/HeaderManagement/AddHeaderButtonListPage";
import AddHeaderManagementPage from "../pages/HeaderManagement/AddHeaderManagementPage";
import ListHeaderButtonPage from "../pages/HeaderManagement/ListHeaderButtonPage";
import PaymentAnalyticsPaymentManagementPage from "../pages/PaymentManagement/PaymentAnalyticsPaymentManagementPage";
import AllOrdersPaymentManagementPage from "../pages/PaymentManagement/AllOrdersPaymentManagementPage";
import OrderDetailsPaymentManagement from "../pages/PaymentManagement/OrderDetailsPaymentManagement";
import AllFacultyPage from "../pages/FacultyManagement/AllFacultyPage";
import AddFacultyPage from "../pages/FacultyManagement/AddFacultyPage";
import EditFacultyPage from "../pages/FacultyManagement/EditFacultyPage";
import EvaluationPage from "../pages/TestManagement/EvaluationPage";
import TestListPage from "../pages/TestManagement/TestListPage";
import FormSubmissionsPage from "../pages/QueryManagement/FormSubmissionsPage";
import ContactRequestsPage from "../pages/QueryManagement/ContactRequestsPage";
import AddCoursePage from "../pages/Course/FDPCourse/AddCoursePage";
import ThridPartyAddingCourse from "../pages/Course/ThridPartyAddingCourse/ThridPartyAddingCourse";
import ShortTermTrainingPage from "../pages/Course/ShortTermTraining/ShortTermTrainingPage";
import AddCoursePgCetificationPage from "../pages/Course/PGCetification/AddCoursePgCetificationPage";
import AllCoursesPage from "../pages/Course/AllCourses/AllCoursesPage";
import AddCourseSelfPage from "../pages/Course/SelfPaceCourse/AddCourseSelfPage";
import FundamentalsquestionsPage from "../pages/TestManagement/FundamentalsquestionsPage";
import EditHeaderManagementPage from "../pages/HeaderManagement/EditHeaderManagementPage";
import EditHeaderButtonListPage from "../pages/HeaderManagement/EditHeaderButtonListPage";
import AllGalleryPage from "../pages/GalleryManagement/AllGalleryPage";
import AddGalleryPage from "../pages/GalleryManagement/AddGalleryPage";
import GalleryDetailsPage from "../pages/GalleryManagement/GalleryDetailsPage";
import EditGalleryPage from "../pages/GalleryManagement/EditGalleryPage";
const appRoutes: RouteType[] = [
  {
    path: "/announcement",
    element: <AllAnnouncementPage />,
    state: "Announcement",
  },
  {
    path: "/certificate-management/all-imports",
    element: <CreateCertificatePage />,
    state: "CertificateManagement",
  },
  {
    path: "/gallery-management/",
    element: <AllGalleryPage />,
    state: "GalleryManagement.AllGallery",
  },
  {
    path: "/gallery-management/gallery-details",
    element: <GalleryDetailsPage />,
    state: "GalleryManagement.GalleryDetails",
  },
  {
    path: "/gallery-management/edit-gallery",
    element: <EditGalleryPage />,
    state: "GalleryManagement.EditGallery",
  },
  {
    path: "/gallery-management/add-gallery",
    element: <AddGalleryPage />,
    state: "GalleryManagement.AllGallery",
  },
  {
    path: "/certificate-management/upload-certificate",
    element: <UploadSampleCertificatePage />,
    state: "CertificateManagement",
  },
  {
    path: "/certificate-management/create-certificate",
    element: <AddNewCertificatePage />,
    state: "CertificateManagement",
  },
  {
    path: "/past-course-management/add-past-course",
    element: <AddPastCourseManagementPage />,
    state: "PastCourseManagement",
  },
  {
    path: "/past-course-management/edit-past-course",
    element: <EditPastCourseManagementPage />,
    state: "PastCourseManagement",
  },
  {
    path: "/partner-management/add-partner",
    element: <AddPartnerManagementPage />,
    state: "PartnerManagement",
  },
  {
    path: "/header-management/add-link",
    element: <AddHeaderButtonListPage />,
    state: "HeaderManagement",
  },
  {
    path: "/header-management/edit-link",
    element: <EditHeaderButtonListPage />,
    state: "HeaderManagement",
  },
  {
    path: "/header-management/add-image",
    element: <AddHeaderManagementPage />,
    state: "HeaderManagement",
  },
  {
    path: "/header-management/header-buttons",
    element: <ListHeaderButtonPage />,
    state: "HeaderManagement",
  },
  {
    path: "/header-management/edit-image",
    element: <EditHeaderManagementPage />,
    state: "HeaderManagement",
  },
  {
    path: "/live-class",
    element: <LiveClassPage />,
    state: "LiveClass",
  },
  {
    path: "/student-management-student-detail/:id",
    element: <StudentManagementstudentDetailPage />,
    state: "AddPastCourse",
  },
  {
    path: "/paymentManagement/all-orders",
    element: <AllOrdersPaymentManagementPage />,
    state: "PaymentManagement",
  },
  {
    path: "/paymentManagement/taxes/:id",
    element: <OrderDetailsPaymentManagement />,
    state: "PaymentManagement",
  },

  {
    path: "/faculty-management/add-faculty",
    element: <AddFacultyPage />,
    state: "FacultyManagement",
  },
  {
    path: "/faculty-management/edit-faculty",
    element: <EditFacultyPage />,
    state: "FacultyManagement",
  },
  {
    path: "/test-management/evaluation",
    element: <EvaluationPage />,
    state: "TestManagement",
  },
  {
    path: "/test-management/all-test",
    element: <TestListPage />,
    state: "TestManagement",
  },
  {
    path: "/test-management/fundamentals-questions",
    element: <FundamentalsquestionsPage />,
    state: "TestManagement",
  },
  {
    path: "/query-management/contact-requests",
    element: <ContactRequestsPage />,
    state: "QueryManagement",
  },
  {
    path: "/query-management/form-submissions",
    element: <FormSubmissionsPage />,
    state: "QueryManagement",
  },
  {
    path: "/course/fdp",
    element: <AddCoursePage />,
    state: "CourseManagement",
  },
  {
    path: "/course/self-paced",
    element: <AddCourseSelfPage />,
    state: "CourseManagement",
  },
  {
    path: "/course-management/add-courses",
    element: <ThridPartyAddingCourse />,
    state: "CourseManagement",
  },
  {
    path: "/course/short-term-training",
    element: <ShortTermTrainingPage />,
    state: "CourseManagement",
  },
  {
    path: "/course/advance-pg-course",
    element: <AddCoursePgCetificationPage />,
    state: "CourseManagement",
  },
  {
    path: "/",
    element: <HomePage />,
    state: "Dashboard",
    sidebarProps: {
      displayText: "Dashboard",
      icon: <img className="logo" src={assets.images.icon} />,
    },
  },
  {
    path: "/course-management",
    element: <AllCoursesPage />,
    state: "CourseManagement",
    sidebarProps: {
      displayText: "Course Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/course-management/all-courses",
        element: <AllCoursesPage />,
        state: "CourseManagement.allCourses",
        sidebarProps: {
          displayText: "All Courses",
        },
      },
      // {
      //   path: "/course-management/all-courses",
      //   element: <AllCoursesPage />,
      //   state: "CourseManagement.addcourses",
      //   sidebarProps: {
      //     displayText: "Add Courses",
      //   },
      // },
    ],
  },

  {
    path: "/past-course-management",
    element: <PastCourseManagementPage />,
    state: "PastCourseManagement",
    sidebarProps: {
      displayText: "Past Course Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/past-course-management/all-past-courses",
        element: <PastCourseManagementPage />,
        state: "PastCourseManagement.allPastCourses",
        sidebarProps: {
          displayText: "All Past Courses",
        },
      },
      {
        path: "/past-course-management/add-past-course",
        element: <AddPastCourseManagementPage />,
        state: "PastCourseManagement.addnewpastcourse",
        sidebarProps: {
          displayText: "Add New Past Course",
        },
      },
    ],
  },
  {
    path: "/paymentManagement",
    element: <PaymentAnalyticsPaymentManagementPage />,
    state: "PaymentManagement",
    sidebarProps: {
      displayText: "Payment Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/paymentManagement/analytics",
        element: <PaymentAnalyticsPaymentManagementPage />,
        state: "PaymentManagement.Analytics",
        sidebarProps: {
          displayText: "Analytics",
        },
      },
      {
        path: "/paymentManagement/all-orders",
        element: <AllOrdersPaymentManagementPage />,
        state: "PaymentManagement.allOrders",
        sidebarProps: {
          displayText: "All Orders",
        },
      },
      // {
      //   path: "/paymentManagement/taxes",
      //   element: <OrderDetailsPaymentManagement />,
      //   state: "PaymentManagement.taxes",
      //   sidebarProps: {
      //     displayText: "Taxes"
      //   }
      // }
    ],
  },
  {
    path: "/student-management",
    element: <StudentManagementPage />,
    state: "StudentManagement",
    sidebarProps: {
      displayText: "Student Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
  },

  {
    path: "/faculty-management/",
    element: <AllFacultyPage />,
    state: "FacultyManagement",
    sidebarProps: {
      displayText: "Faculty Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/faculty-management/",
        element: <AllFacultyPage />,
        state: "FacultyManagement.allfaculty",
        sidebarProps: {
          displayText: "All Faculty",
        },
      },
      {
        path: "/faculty-management/add-faculty",
        element: <AddFacultyPage />,
        state: "FacultyManagement.addfaculty",
        sidebarProps: {
          displayText: "Add Faculty",
        },
      },
    ],
  },
  {
    path: "/certificate-management",
    element: <AllCertificatePage />,
    state: "CertificateManagement",
    sidebarProps: {
      displayText: "Certificate Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/certificate-management/all-uploads",
        element: <AllCertificatePage />,
        state: "CertificateManagement.alluploads",
        sidebarProps: {
          displayText: "All Uploads",
        },
      },
      // {
      //   path: "/certificate-management/all-imports",
      //   element: <CreateCertificatePage />,
      //   state: "CertificateManagement.allimports",
      //   sidebarProps: {
      //     displayText: "All Imports",
      //   },
      // },
      // {
      //   path: "/certificate-management/upload-certificate",
      //   element: <StudentManagementPage />,
      //   state: "CertificateManagement.uploadcertificate",
      //   sidebarProps: {
      //     displayText: "Upload Certificate",
      //   },
      // },
      {
        path: "/certificate-management/create-certificate",
        element: <CreateCertificatePage />,
        state: "CertificateManagement.createcertificate",
        sidebarProps: {
          displayText: "Create Certificate",
        },
      },
    ],
  },
  {
    path: "/partner-management",
    element: <PartnerManagementPage />,
    state: "PartnerManagement",
    sidebarProps: {
      displayText: "Partner Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/partner-management/existing-partner",
        element: <PartnerManagementPage />,
        state: "PartnerManagement.existingpartner",
        sidebarProps: {
          displayText: "Existing Partner",
        },
      },
      {
        path: "/partner-management/add-partner",
        element: <AddPartnerManagementPage />,
        state: "PartnerManagement.addpartner",
        sidebarProps: {
          displayText: "Add Partner",
        },
      },
    ],
  },
  {
    path: "/query-management",
    element: <ContactRequestsPage />,
    state: "QueryManagement",
    sidebarProps: {
      displayText: "Query Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/query-management/course-requests",
        element: <ContactRequestsPage />,
        state: "QueryManagement.Requests",
        sidebarProps: {
          displayText: "Course Queries",
        },
      },
      {
        path: "/query-management/form-submissions",
        element: <FormSubmissionsPage />,
        state: "QueryManagement.FormSubmissions",
        sidebarProps: {
          displayText: "New FDP and Contact US Request",
        },
      },
    ],
  },
  {
    path: "/test-management",
    element: <TestListPage />,
    state: "TestManagement",
    sidebarProps: {
      displayText: "Test Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/test-management/all-test",
        element: <TestListPage />,
        state: "TestManagement.alltest",
        sidebarProps: {
          displayText: "All Test",
        },
      },
      {
        path: "/test-management/evaluation",
        element: <EvaluationPage />,
        state: "TestManagement.evaluation",
        sidebarProps: {
          displayText: "Evaluation",
        },
      },
      // {
      //   path: "/test-management/fundamentals-questions",
      //   element: <FundamentalsquestionsPage />,
      //   state: "TestManagement.addtest",
      //   sidebarProps: {
      //     displayText: "Add Test",
      //   },
      // },
      // {
      //   path: "/test-management/fundamentals-questions",
      //   element: <AllAnnouncementPage />,
      //   state: "TestManagement.edittest",
      //   sidebarProps: {
      //     displayText: "Edit Test",
      //   },
      // },
    ],
  },
  {
    path: "/noticeBoard-management",
    element: <NoticeBoardPage />,
    state: "NoticeBoardManagement",
    sidebarProps: {
      displayText: "Notice Board Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/noticeBoard-management/notice-board",
        element: <StudentManagementPage />,
        state: "NoticeBoardManagement.noticeboard",
        sidebarProps: {
          displayText: "Notice Board",
        },
      },
      {
        path: "/noticeBoard-management/add-notice-board",
        element: <AllAnnouncementPage />,
        state: "NoticeBoardManagement.addnoticeboard",
        sidebarProps: {
          displayText: "Add Notice Board",
        },
      },
    ],
  },
  {
    path: "/calendar",
    element: <CalendarPage />,
    state: "Calendar",
    sidebarProps: {
      displayText: "Calendar",
      icon: <img className="logo" src={assets.images.icon} />,
    },
  },
  {
    path: "/header-management",
    element: <HeaderManagementPage />,
    state: "HeaderManagement",
    sidebarProps: {
      displayText: "Header Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/header-management/header-images",
        element: <HeaderManagementPage />,
        state: "HeaderManagement.images",
        sidebarProps: {
          displayText: "Images",
        },
      },
      {
        path: "/header-management/header-buttons",
        element: <ListHeaderButtonPage />,
        state: "HeaderManagement.buttons",
        sidebarProps: {
          displayText: "Buttons",
        },
      },
    ],
  },
  {
    path: "/gallery-management/",
    element: <HeaderManagementPage />,
    state: "GalleryManagement",
    sidebarProps: {
      displayText: "Gallery Management",
      icon: <img className="logo" src={assets.images.icon} />,
    },
    child: [
      {
        path: "/gallery-management/",
        element: <HeaderManagementPage />,
        state: "GalleryManagement.gallery-management",
        sidebarProps: {
          displayText: "All Gallery ",
        },
      },
      {
        path: "/gallery-management/add-gallery",
        element: <ListHeaderButtonPage />,
        state: "GalleryManagement.AddGallery",
        sidebarProps: {
          displayText: "Add Gallery",
        },
      },
    ],
  },
];

export default appRoutes;
