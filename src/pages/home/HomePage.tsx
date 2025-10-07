import React, { useEffect, useState } from "react";
import { Container } from "@mui/material";
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";
type Props = {};


const HomePage = (props: Props) => {
  const categoryList = [
    { id: 0, value: "All" },
    { id: 1, value: "Self Paced" },
    { id: 2, value: "FDP" },
    { id: 3, value: "PG Certification" },
    { id: 5, value: "Short Term Training" },
    { id: 6, value: "EICT-Third Party" },
  ];
  const { useFetch } = useCrud()
  const dayTabs = ["daily", "weekly", "monthly"];
  const [activeDayTab, setActiveDayTab] = useState("daily");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [progress, setProgress] = useState([]);
  const colorMap: Record<string, string> = {
    "Self Paced": "#c42730",
    "FDP’s": "#0373ba",
    "Advanced PG Courses": "#fcb03e",
    "Short Term Courses": "#156c3c"
  };

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  const { data: dashboardData = [] } = useFetch(
    `/dashboard/summary/`,
    {
      category: activeTab === 0 ? "" : activeTab,
      range: activeDayTab
    },
    {
      retry: false,
    }
  );


  useEffect(() => {
    if (dashboardData?.sales?.pie) {
      const response = dashboardData?.sales?.pie?.map((item: any, index: number) => ({
        label: item.label,
        value: item.value,
        percentage: item.percent,
        color: colorMap[item.label]
      }))
      setProgress(response)
    }
  }, [dashboardData])

  const radius = 100;
  const cx = 120;
  const cy = 120;
  let cumulative = 0;
  const totalPercent = 100;
  // if (!progress.some((item: any) => item.percentage > 0)) {
  //   return (
  //     <svg width="230" height="230" viewBox="0 0 230 230">
  //       <circle
  //         cx={cx}
  //         cy={cy}
  //         r={radius}
  //         fill="#ccc"
  //         stroke="#fff"
  //         strokeWidth={1}
  //       />
  //       <text
  //         x={cx}
  //         y={cy}
  //         fill="#000"
  //         fontSize="14"
  //         fontWeight="600"
  //         textAnchor="middle"
  //         alignmentBaseline="middle"
  //       >
  //         No Data
  //       </text>
  //     </svg>
  //   );
  // }
  const sectors = progress.map((item: any, index: number) => {
    if (item.percentage <= 0) return null;

    if (item.percentage === 100) {
      return (
        <g key={index}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={item.color}
            stroke="#fff"
            strokeWidth={1}
          />
          <text
            x={cx}
            y={cy}
            fill="#fff"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {item.label} ({item.percentage}%)
          </text>
        </g>
      );
    }

    const startAngle = (cumulative / totalPercent) * 360;
    const angle = (item.percentage / totalPercent) * 360;
    const endAngle = startAngle + angle;
    cumulative += item.percentage;

    const largeArc = angle > 180 ? 1 : 0;

    const startX = cx + radius * Math.cos((Math.PI / 180) * (startAngle - 90));
    const startY = cy + radius * Math.sin((Math.PI / 180) * (startAngle - 90));

    const endX = cx + radius * Math.cos((Math.PI / 180) * (endAngle - 90));
    const endY = cy + radius * Math.sin((Math.PI / 180) * (endAngle - 90));

    const midAngle = (startAngle + endAngle) / 2;
    const labelX = cx + (radius * 0.6) * Math.cos((Math.PI / 180) * (midAngle - 90));
    const labelY = cy + (radius * 0.6) * Math.sin((Math.PI / 180) * (midAngle - 90));

    return (
      <g key={index}>
        {/* Slice */}
        <path
          d={`M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`}
          fill={item.color}
          stroke="#fff"
          strokeWidth={1}
        />

        {/* Label */}
        <text
          x={labelX}
          y={labelY}
          fill="#fff"
          fontSize="12"
          fontWeight="400"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {item.label} ({item.percentage}%)
        </text>
      </g>
    );
  });

  return (
    <div className="dashwrapp">
      <div className="DashboardWrapp">
        <div className="tab_listDash">
          <ul>
            {
              categoryList.map((item: any, index: number) => (
                <li>
                  <button
                    className={`btn ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.id)}
                  >
                    {item.value}
                  </button>
                </li>
              ))
            }
          </ul>
        </div>
        <div className="content_tab">
          <div className={`tab-content`}>
            <div>
              <div className="payment_data_wrapp">
                <div className="left_bx">
                  <div className="crd_bx crd_dash">
                    <h3>Total Enrollments</h3>
                    <p>{dashboardData?.enrollments?.total}</p>
                    {/* <div className="progressbar">
                      <div className="progressline" style={{ width: "80%" }}></div>
                    </div>
                    <h4>{dashboardData?.enrollments?.new_in_last_n_days?.change_pct_vs_prev}% Increase in {dashboardData?.enrollments?.new_in_last_n_days?.days} Days</h4> */}
                  </div>
                  <div className="crd_bx crd_dash">
                    <h3>New Enrollments</h3>
                    <p>{dashboardData?.enrollments?.new_in_last_n_days?.count}</p>
                    {/* <div className="progressbar">
                      <div className="progressline" style={{ width: "50%" }}></div>
                    </div>
                    <h4>{dashboardData?.enrollments?.new_in_last_n_days?.change_pct_vs_prev}% Increase in {dashboardData?.enrollments?.new_in_last_n_days?.days} Days</h4> */}
                  </div>
                </div>
                <div className="rgt_bx crd_dash">
                  {
                    activeTab != 6 ? <>
                      <div className="hd_bx">
                        <h3>Payment Analytics</h3>
                        <div className="tab_day">
                          {dayTabs.map((day, index) => (
                            <button
                              key={index}
                              className={`btn ${activeDayTab === day ? "active" : ""}`}
                              onClick={() => setActiveDayTab(day)}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grap_payment">
                        <div className="grap">
                          <div
                            className="circle_grap">
                            <svg width="230" height="230" viewBox="0 0 230 230">
                              {sectors}
                            </svg>
                          </div>
                          <div className="grapPoint">
                            <ul>
                              {progress.map((item: any, index: number) => (
                                <li key={index}>
                                  {item.label}
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                        <div className="tatal_sale_wrapp">
                          <div className="hd_bx">
                            <h3>Total Sales</h3>
                            <h4>₹{dashboardData?.sales?.total}</h4>
                          </div>
                          <ul>
                            {progress.map((item: any, index: number) => (
                              <li key={index}>
                                <span>{item.label}</span>
                                <span>₹{item.value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div></> : <p>No Data Available</p>
                  }

                </div>
              </div>
              <div className="Upcomingevent_Wrapp">
                <div className="event_left_data crd_dash">
                  <div className="hd_bx">
                    <h3>Upcoming Events</h3>
                  </div>
                  <div className="UpcomingeventList">
                    {
                      dashboardData?.upcoming_live_classes?.length > 0 ? (
                        dashboardData.upcoming_live_classes.map((event: any, index: number) => (
                          <div className="card_event" key={index}>
                            <div className="date">{moment(event?.date).format("DD MMM")}</div>
                            <div className="event_dt">
                              <h3>{event.course_name}</h3>
                              <p>{moment(event.start_time, "HH:mm").format("hh:mm A")} - {moment(event?.end_time, "HH:mm").format("hh:mm A")}</p>
                              <h4>{event?.title}</h4>
                            </div>
                          </div>
                        ))
                      ) : <p>No Upcoming Events</p>
                    }
                  </div>
                </div>

                <div className="Upcomingevent_table_wrapp crd_dash">
                  <div className="hd_bx">
                    <h3>New FDP Requests</h3>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th style={{ width: "28%" }}>COLLEGE NAME</th>
                        <th>REQUEST DATE</th>
                        <th>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        dashboardData?.fdp_requests?.length > 0 ? (
                          dashboardData.fdp_requests.map((event: any, index: number) => (
                            <tr key={index}>
                              <td>{event.student_name}</td>
                              <td>{event.college_name}</td>
                              <td>{event.request_date}</td>
                              <td>{event.time}</td>
                            </tr>
                          ))
                        ) : <p>No FDP Request</p>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>




      </div>
    </div>
  );
};

export default HomePage;
