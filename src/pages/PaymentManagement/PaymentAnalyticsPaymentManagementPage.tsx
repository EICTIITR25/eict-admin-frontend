import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import assets from "../../assets";
import { useCrud } from "../../hooks/useCrud";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { GenericItems } from "../../types";
import moment from "moment";
type Course = {
  id: number;
  date: string;
  orders: string;
  gross: string;
  coupons: string;
  netsales: string;
  taxes: string;
  total: string;
};

const defaultForm = {
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
    .toISOString()
    .split("T")[0],
};
const PaymentAnalyticsPaymentManagementPage = () => {
  const { useFetch } = useCrud();
  const { form, handleChange } = useDynamicForm(defaultForm);
  const [categoryId, setCategoryId] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [csv, setCSV] = useState("");
  const { data: analyticsList = [] } = useFetch(
    form?.start_date && form?.end_date ? "/payments/analytics/" : "",
    {
      page: currentPage,
      start_date: form?.start_date,
      end_date: form?.end_date,
      category_id: categoryId,
      page_size: pageSize,
    },
    {
      enabled: !!(form.start_date && form.end_date),
      retry: false,
    }
  );
  const { data: studentCsvData = [] } = useFetch(
    csv === 'csv' ? "/payments/analytics/" : "",
    {

      page: currentPage,
      start_date: form?.start_date,
      end_date: form?.end_date,
      category_id: categoryId,
      page_size: pageSize,
      export: "csv",
    },
    { retry: false, enabled: !!csv } // default off rakho
  );
  const downloadCsvString = (csvText: string, fileName = "Analytics.csv") => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const totalItems = analyticsList?.pagination?.total_records || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const categoryList = [
    { id: 1, value: "Self Paced" },
    { id: 2, value: "FDP" },
    { id: 3, value: "PG Certification" },
    { id: 5, value: "Short Term Training" },
    { id: 6, value: "EICT-Third Party" },
  ];
  // useEffect(() => {
  //   if (csv === "csv" && studentCsvData && typeof studentCsvData === "string") {
  //     downloadCsvString(studentCsvData);
  //   }
  // }, [csv, studentCsvData]);
  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Payment Analytics</h3>
      </div>
      <div className="pay_grp">
        <div className="range_card">
          <h3>Date range:</h3>
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            placeholder="dd/mm/yyyy"
            value={form["start_date"]}
            onChange={(e) => {
              handleChange("end_date", "");
              const newDate = e.target.value;
              handleChange("start_date", newDate);
              if (!newDate || (form.end_date && form.end_date <= newDate)) {
                handleChange("end_date", "");
              }
            }}
          />
          <label>End date</label>
          <input
            type="date"
            className="form-control"
            disabled={!form.start_date}
            value={form["end_date"]}
            onChange={(e) => handleChange("end_date", e.target.value)}
            min={form.start_date}
          />
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
      <div className="payAnalyticsList">
        <div className="paycard_bx">
          <h3>Gross Sales</h3>
          <p>
            <span>₹{analyticsList?.gross_sales || 0.0}</span>
          </p>
        </div>
        {/* <div className="paycard_bx">
          <h3>Coupons</h3>
          <p>
            <span>₹{analyticsList?.coupons || 0.0}</span>
          </p>
        </div> */}
        <div className="paycard_bx">
          <h3>Net Sales</h3>
          <p>
            <span>₹{analyticsList?.net_sales || 0.0}</span>
          </p>
        </div>
        <div className="paycard_bx">
          <h3>GST</h3>
          <p>
            <span>₹{analyticsList?.gst || 0.0}</span>
          </p>
        </div>
      </div>

      <div className="payAnalyticsCard">
        <div className="head_top_table">
          <h3>Transaction Details</h3>
          <div onClick={() => setCSV("csv")}>
            <span>
              <svg
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.8125 13.0625H12.8584L11.1792 14.7417C10.732 15.1889 10.1346 15.4375 9.5 15.4375C8.86543 15.4375 8.26945 15.1905 7.8208 14.7417L6.1416 13.0625H1.1875C0.531777 13.0625 0 13.5943 0 14.25V17.8125C0 18.4682 0.531777 19 1.1875 19H17.8125C18.4682 19 19 18.4682 19 17.8125V14.25C19 13.5932 18.4693 13.0625 17.8125 13.0625ZM16.0312 16.9219C15.5414 16.9219 15.1406 16.5211 15.1406 16.0312C15.1406 15.5414 15.5414 15.1406 16.0312 15.1406C16.5211 15.1406 16.9219 15.5414 16.9219 16.0312C16.9219 16.5211 16.5211 16.9219 16.0312 16.9219ZM8.66133 13.9012C8.89141 14.135 9.1957 14.25 9.5 14.25C9.8043 14.25 10.1079 14.134 10.3394 13.9021L15.0894 9.1521C15.5529 8.68823 15.5529 7.93677 15.0894 7.4729C14.6255 7.00903 13.8737 7.00903 13.4102 7.4729L10.6875 10.1977V1.1875C10.6875 0.531777 10.1557 0 9.5 0C8.84316 0 8.3125 0.531777 8.3125 1.1875V10.1977L5.58867 7.47383C5.12518 7.00996 4.37334 7.00996 3.90947 7.47383C3.44598 7.9377 3.44598 8.68916 3.90947 9.15303L8.66133 13.9012Z"
                  fill="#666666"
                />
              </svg>
            </span>{" "}
            Download
          </div>
        </div>
        <div className="PaymentTable">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Gross Sales</th>
                {/* <th>Coupons</th> */}
                <th>Net Sales</th>
                <th>Taxes</th>
                {/* <th>Total Sales</th> */}
                <th style={{ width: "15%" }}></th>
              </tr>
            </thead>
            <tbody>
              {analyticsList?.transaction_details?.map((payment: any) => (
                <tr key={payment.id}>
                  <td>{moment(payment.date).format("DD-MM-YYYY")}</td>
                  <td>{payment.total_courses}</td>
                  <td>₹ {payment.gross_sales}</td>
                  {/* <td>₹ {payment.coupons}</td> */}
                  <td>₹ {payment.net_sales}</td>
                  <td>₹ {payment.tax_amount}</td>
                  {/* <td>₹ {payment.total_sales}</td> */}
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination_new">
          <h3>
            {" "}
            Page {startIndex + 1} - {endIndex} of {totalItems}
          </h3>
          <div className="pagination_mid">
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <svg
                width="8"
                height="16"
                viewBox="0 0 8 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.00016 2.00117C6.25603 2.00117 6.51203 2.09883 6.70703 2.29414C7.09766 2.68477 7.09766 3.31758 6.70703 3.7082L2.41266 8.00117L6.70703 12.2949C7.09766 12.6855 7.09766 13.3184 6.70703 13.709C6.31641 14.0996 5.68359 14.0996 5.29297 13.709L0.292969 8.70898C-0.0976563 8.31836 -0.0976563 7.68555 0.292969 7.29492L5.29297 2.29492C5.48828 2.09805 5.74422 2.00117 6.00016 2.00117Z"
                  fill="black"
                />
              </svg>
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <svg
                width="8"
                height="16"
                viewBox="0 0 8 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.99984 13.9988C1.74397 13.9988 1.48797 13.9012 1.29297 13.7059C0.902344 13.3152 0.902344 12.6824 1.29297 12.2918L5.58734 7.99883L1.29297 3.70508C0.902344 3.31445 0.902344 2.68164 1.29297 2.29102C1.68359 1.90039 2.31641 1.90039 2.70703 2.29102L7.70703 7.29102C8.09766 7.68164 8.09766 8.31445 7.70703 8.70508L2.70703 13.7051C2.51172 13.902 2.25578 13.9988 1.99984 13.9988Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
          <div className="items">
            <p>Go to page</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalyticsPaymentManagementPage;
