import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import assets from "../../assets";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { useCrud } from "../../hooks/useCrud";
import { GenericItems } from "../../types";

const AllOrdersPaymentManagementPage = () => {
  const { useFetch } = useCrud();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  // const [showDropdown, setShowDropdown] = useState(false);
  // const [selectedFilter, setSelectedFilter] = useState("Last 30 Days");
  // const [showProductDropdown, setShowProductDropdown] = useState(false);
  // const [selectedProduct, setSelectedProduct] = useState("Choose your product");

  const [inputValue, setInputValue] = useState("");
  const [categoryId, setCategoryId] = useState();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [csv, setCSV] = useState("");
  const shouldApplyDateFilter = startDate && endDate;
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: orderList = [] } = useFetch(
    "/payments/orders/",
    {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      category_id: categoryId,
      status: status,
      ...(shouldApplyDateFilter && {
        star_date: startDate,
        end_date: endDate,
      }),
    },
    {
      retry: false,
    }
  );
  const { data: CsvData = [] } = useFetch(
    "/payments/orders/export-by-ids",
    {
      page: currentPage,
      page_size: pageSize,
      search: searchTerm,
      category_id: categoryId,
      status: status,
      order_ids: selectedIds.length > 0 ? selectedIds.join(",") : "",
      ...(shouldApplyDateFilter && {
        star_date: startDate,
        end_date: endDate,
      }),
    },
    {
      retry: false,
      enabled: csv === "csv"
    }
  );
  const orders = orderList?.results?.orders || [];
  const downloadCsvString = (csvText: string, fileName = "Order.csv") => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filters = [
    "Last day",
    "Last 15 days",
    "Last 30 days",
    "Last quarter",
    "Last year",
  ];
  const categoryList = [
    { id: 1, value: "Self Paced" },
    { id: 2, value: "FDP" },
    { id: 3, value: "PG Certification" },
    { id: 5, value: "Short Term Training" },
    { id: 6, value: "EICT-Third Party" },
  ];

  const products = ["Academic Courses", "Non-Academic Courses", "Test Series"];

  const totalItems = orderList.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue); // actual search term update after delay
    }, 1000); // 1000ms = 1 sec

    return () => {
      clearTimeout(handler); // cleanup on every new keystroke
    };
  }, [inputValue]);
  useEffect(() => {
    if (csv === "csv" && CsvData && typeof CsvData === "string") {
      downloadCsvString(CsvData);
      setCSV("")
    }
  }, [csv, CsvData]);


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = orders.map((o: any) => o.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;
  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>All Orders</h3>
      </div>
      <div className="card_radi5">
        <div className="oderHeaderTop">
          <div className="lftbx">
            <p>Showing all Orders </p>
            <ul>
              <li>
                <span onClick={() => setStatus("all")}> All </span>
                <span>{orderList?.results?.counts?.all}</span>
              </li>
              <li>
                <span onClick={() => setStatus("completed")}>Completed </span>
                <span>({orderList?.results?.counts?.completed})</span>
              </li>
              <li>
                <span onClick={() => setStatus("failed")}>Failed </span>
                <span>({orderList?.results?.counts?.failed}) </span>
              </li>
              <li>
                <span onClick={() => setStatus("partial")}>
                  Partially Paid{" "}
                </span>
                <span> ({orderList?.results?.counts?.partial})</span>
              </li>
            </ul>
          </div>
          <div className="Courses_checkbx">
            {categoryList.map((type: GenericItems) => (
              <label key={type?.id} htmlFor={type?.id}>
                <input
                  type="checkbox"
                  id={type?.id}
                  checked={categoryId === type?.id}
                  onChange={() => {
                    setCategoryId((prev) =>
                      prev === type?.id ? null : type?.id
                    );
                  }}
                />
                <span>{type?.value}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="allorderFilter">
          <div className="filterLeft">
            <div className="items">
              <p>Show</p>
              <select
                className="formcontrol"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
              <p> entries</p>
            </div>
            <div className="FiltersWrapp2">
              <div className="innerLeft">
                <div className="FiltersDay">
                  <div className="FiltersButton">
                    <p>Start Date:</p>
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Start Date"
                      value={startDate}
                      onChange={(e) => {
                        setEndDate("");
                        const newDate = e.target.value;
                        setStartDate(newDate);
                        if (!newDate || (endDate && endDate <= newDate)) {
                          setEndDate("");
                        }
                      }}
                    />
                    <p>End Date:</p>
                    <input
                      type="date"
                      className="form-control"
                      placeholder="End Date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="filter_bx">
              <div className="grp_search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button className="btnDownload" onClick={() => setCSV("csv")}>
            <span>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <mask
                  id="mask0_436_9099"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="17"
                  height="17"
                >
                  <rect width="17" height="17" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_436_9099)">
                  <path
                    d="M4.60286 14.1668C3.52856 14.1668 2.6108 13.7949 1.84957 13.0512C1.08788 12.3074 0.707031 11.3984 0.707031 10.3241C0.707031 9.40326 0.984462 8.58277 1.53932 7.86263C2.09418 7.14249 2.82023 6.68207 3.71745 6.48138C3.91814 5.63138 4.41988 4.8227 5.22266 4.05534C6.02543 3.28798 6.88134 2.9043 7.79036 2.9043C8.17995 2.9043 8.51357 3.04289 8.79124 3.32009C9.06843 3.59776 9.20703 3.93138 9.20703 4.32096V8.60638L10.3404 7.50846L11.332 8.50013L8.4987 11.3335L5.66536 8.50013L6.65703 7.50846L7.79036 8.60638V4.32096C6.89314 4.48624 6.19661 4.91998 5.70078 5.62217C5.20495 6.32484 4.95703 7.04805 4.95703 7.7918H4.60286C3.91814 7.7918 3.33377 8.03381 2.84974 8.51784C2.36571 9.00187 2.1237 9.58624 2.1237 10.271C2.1237 10.9557 2.36571 11.5401 2.84974 12.0241C3.33377 12.5081 3.91814 12.7501 4.60286 12.7501H13.1029C13.5987 12.7501 14.0178 12.5789 14.3602 12.2366C14.7025 11.8942 14.8737 11.4751 14.8737 10.9793C14.8737 10.4835 14.7025 10.0644 14.3602 9.722C14.0178 9.37964 13.5987 9.20846 13.1029 9.20846H12.0404V7.7918C12.0404 7.22513 11.9105 6.69671 11.6508 6.20655C11.3911 5.71685 11.0487 5.30082 10.6237 4.95846V3.31159C11.4973 3.72478 12.1879 4.33584 12.6956 5.14476C13.2032 5.9532 13.457 6.83555 13.457 7.7918C14.2716 7.88624 14.9476 8.23734 15.485 8.84509C16.0219 9.45331 16.2904 10.1647 16.2904 10.9793C16.2904 11.8647 15.9806 12.6174 15.361 13.2375C14.741 13.857 13.9883 14.1668 13.1029 14.1668H4.60286Z"
                    fill="#1E3A8A"
                  />
                </g>
              </svg>
            </span>{" "}
            Download
          </button>
        </div>
        <div className="orderTable">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>
                  {" "}
                  <input type="checkbox" checked={isAllSelected}
                    onChange={handleSelectAll} />
                </th>
                <th>Order Id.</th>
                <th>Name</th>
                <th>Product Name</th>
                <th>Status</th>
                <th>Mobile No.</th>
                <th>Transaction Date</th>
                <th>Amount</th>
                {/* <th></th> */}
              </tr>
            </thead>
            <tbody>
              {orderList?.results?.orders?.map((course: any) => (
                <tr key={course.id}>
                  <td>
                    <input type="checkbox" checked={selectedIds.includes(course.id)}
                      onChange={() => handleSelectOne(course.id)} />
                  </td>
                  <td>
                    <Link to={`/paymentManagement/taxes/${course.id}`}>
                      #{course.razorpay_order_id}
                    </Link>
                  </td>
                  <td>{course?.user_name}</td>
                  <td>{course?.course_names[0]}</td>
                  <td>
                    {" "}
                    <div
                      className={course.status
                        .toLowerCase()
                        .replace(/\s/g, "-")}
                    >
                      {course.status.toUpperCase()}
                    </div>
                  </td>
                  <td>{course.mobile_number}</td>
                  <td>{course.transaction_date}</td>
                  <td>{course.amount}</td>
                  {/* <td>
                                        <div className="btnDownload">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_4072_1909)">
                                                    <path d="M14.0625 10.3125H10.1514L8.82568 11.6382C8.47266 11.9912 8.00098 12.1875 7.5 12.1875C6.99902 12.1875 6.52852 11.9925 6.17432 11.6382L4.84863 10.3125H0.9375C0.419824 10.3125 0 10.7323 0 11.25V14.0625C0 14.5802 0.419824 15 0.9375 15H14.0625C14.5802 15 15 14.5802 15 14.0625V11.25C15 10.7314 14.5811 10.3125 14.0625 10.3125ZM12.6562 13.3594C12.2695 13.3594 11.9531 13.043 11.9531 12.6562C11.9531 12.2695 12.2695 11.9531 12.6562 11.9531C13.043 11.9531 13.3594 12.2695 13.3594 12.6562C13.3594 13.043 13.043 13.3594 12.6562 13.3594ZM6.83789 10.9746C7.01953 11.1592 7.25977 11.25 7.5 11.25C7.74023 11.25 7.97988 11.1584 8.16269 10.9753L11.9127 7.22534C12.2786 6.85913 12.2786 6.26587 11.9127 5.89966C11.5465 5.53345 10.9529 5.53345 10.587 5.89966L8.4375 8.05078V0.9375C8.4375 0.419824 8.01768 0 7.5 0C6.98145 0 6.5625 0.419824 6.5625 0.9375V8.05078L4.41211 5.90039C4.04619 5.53418 3.45264 5.53418 3.08643 5.90039C2.72051 6.2666 2.72051 6.85986 3.08643 7.22607L6.83789 10.9746Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_4072_1909">
                                                        <rect width="15" height="15" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                    </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination pagination2">
          <div className="items">
            <p>Showin</p>
            <p>
              {startIndex + 1} - {endIndex} of {totalItems} entries
            </p>
          </div>

          <div className="pagenationRight">
            <button
              className="btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faAnglesLeft} /> First
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faAngleLeft} /> Back
            </button>
            <span className="currentPage btn btnno"> {currentPage}</span>
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next <FontAwesomeIcon icon={faAngleRight} />
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last <FontAwesomeIcon icon={faAnglesRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrdersPaymentManagementPage;
