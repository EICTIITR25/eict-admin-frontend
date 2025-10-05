import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import assets from "../../assets";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";
const OrderDetailsPaymentManagement = () => {
  const { useFetch, useCreate } = useCrud();
  const { id } = useParams();
  const [timeList, setTimeList] = useState([]);

  const { data: orderById = [] } = useFetch(
    `/payments/orders/${id}`,
    {},
    {
      retry: false,
    }
  );

  const { mutate: sendInvoice } = useCreate(
    `/payments/orders/${id}/send-invoice/`
  );
  useEffect(() => {
    if (orderById) {
      const splitTime = orderById?.created_time?.split(":");
      setTimeList(splitTime);
    }
  }, [orderById]);
  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Order Details</h3>
      </div>
      <div className="OrderDetailsCard">
        <div className="hd_bx">
          <ul>
            <li>
              <h3>Order #{orderById?.razorpay_order_id} details</h3>
              <p>Payment via {orderById?.payment_method}</p>
            </li>
            <li>
              <p>
                Paid on{" "}
                {moment(
                  `${orderById?.created_date} ${orderById?.created_time}`,
                  "YYYY-MM-DD HH:mm"
                ).format("MMMM DD, YYYY @ hh:mm A")}
              </p>
            </li>
          </ul>
        </div>
        <div className="listoderHead">
          <div className="GeneralDatecreated">
            <p>General</p>
            <label htmlFor="">Date created:</label>
            <div className="general_filed mb-3">
              <input
                type="text"
                disabled
                className="from-control"
                value={orderById?.created_date}
              />{" "}
              @
              <div className="time">
                <input
                  type="text"
                  disabled
                  value={timeList?.[0]}
                  className="from-control"
                />{" "}
                {":"}
                <input
                  type="text"
                  disabled
                  className="from-control"
                  value={timeList?.[1]}
                />
              </div>
            </div>
            <label htmlFor="">Status:</label>
            <input
              type="text"
              disabled
              className="from-control"
              value={orderById?.status_display}
            />
          </div>
          <div className="Billing_bx">
            <p>Billing</p>
            <h6>{orderById?.user_name}</h6>
            <label htmlFor="">Email address: </label>
            <ul>
              <li>
                <p>{orderById?.user_email}</p>
              </li>
              <li>
                <p onClick={() => sendInvoice({})}>
                  {" "}
                  <span>
                    <svg
                      width="15"
                      height="16"
                      viewBox="0 0 15 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <mask
                        id="mask0_436_8888"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="15"
                        height="16"
                      >
                        <rect y="0.5" width="15" height="15" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_436_8888)">
                        <path
                          d="M7.5 8.625L2.5 5.5V11.75H8.125V13H2.5C2.15625 13 1.86208 12.8777 1.6175 12.6331C1.3725 12.3881 1.25 12.0938 1.25 11.75V4.25C1.25 3.90625 1.3725 3.61208 1.6175 3.3675C1.86208 3.1225 2.15625 3 2.5 3H12.5C12.8438 3 13.1381 3.1225 13.3831 3.3675C13.6277 3.61208 13.75 3.90625 13.75 4.25V8.625C13.5521 8.625 13.349 8.625 13.1406 8.625C12.9323 8.625 12.7188 8.625 12.5 8.625V5.5L7.5 8.625ZM7.5 7.375L12.5 4.25H2.5L7.5 7.375ZM11.875 14.875L11 14L11.9844 13H9.375V11.75H11.9844L10.9844 10.75L11.875 9.875L14.375 12.375L11.875 14.875ZM2.5 5.5V11.75V12.375C2.5 11.3333 2.5 10.4479 2.5 9.71875C2.5 8.98958 2.5 8.625 2.5 8.625C2.5 8.625 2.5 8.6275 2.5 8.6325C2.5 8.63792 2.5 8.65104 2.5 8.67188V5.5Z"
                          fill="#0373BA"
                        />
                      </g>
                    </svg>
                  </span>{" "}
                  Send invoice via Email
                </p>
              </li>
            </ul>
            <label htmlFor="">Phone:</label>
            <p>{orderById?.user_phone}</p>
            <label htmlFor="">University:</label>
            <p>{orderById?.user_institution_name}</p>
          </div>
        </div>
      </div>
      <div className="table_OrderDetails">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Cost</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orderById?.items?.map((item: any) => (
              <tr>
                <td>
                  <div className="oderName">
                    <div className="image">
                      <img
                        src={assets.images.Coursescertif}
                        alt="Course Thumbnail"
                      />
                    </div>
                    <h3>{item.course_title}</h3>
                  </div>
                </td>
                <td>₹{item.course_price}</td>
                <td>x 1</td>
                <td>₹{item.price}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right" }}>
                Items Subtotal:
              </td>
              <td>₹{orderById?.amount}</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ textAlign: "right" }}>
                Order Total:
              </td>
              <td>₹{orderById?.amount}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderDetailsPaymentManagement;
