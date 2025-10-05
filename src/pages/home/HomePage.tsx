import React, { useState } from "react";
import { Container } from "@mui/material";
type CourseProgress = {
  label: string;
  value: number;
  color: string;
};
type Props = {};


const HomePage = (props: Props) => {
  const dayTabs = ["Daily", "Weekly", "Monthly"];
  const [activeDayTab, setActiveDayTab] = useState("Daily");
  const [activeTab, setActiveTab] = useState<string>('selfPaced');

  // Handling the tab change
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const fdpRequests = Array(7).fill({
    name: "Nirmala Sitaraman",
    course: "Fundamentals of Analog and Digital Communication System",
    date: "18 August 2022",
    time: "10:15",
  });

  // Corrected course progress values to be numbers
  const courseProgress = [
    { label: 'Self Paced', value: 35, color: '#c42730' },
    { label: "FDP's", value: 40, color: '#0373ba' },
    { label: 'Advanced PG Courses', value: 25, color: '#fcb03e' },
    { label: 'Short Term Courses', value: 15, color: '#156c3c' },
  ];
  const radius = 100;
  const cx = 120;
  const cy = 120;
  const total = courseProgress.reduce((sum, item) => sum + item.value, 0);

  let cumulative = 0;

  const sectors = courseProgress.map((item, index) => {
    const startAngle = (cumulative / total) * 360;
    const angle = (item.value / total) * 360;
    const endAngle = startAngle + angle;
    cumulative += item.value;

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
        <path
          d={`M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`}
          fill={item.color}  stroke="#fff"   
          strokeWidth={1} 
        />
        <text
          x={labelX}
          y={labelY}
          fill="#fff"
          fontSize="12"
          fontWeight="400"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {item.value} %
        </text>
      </g>
    );
  });

  return (
    <div className="dashwrapp">
      <div className="DashboardWrapp">
        <div className="tab_listDash">
          <ul>
            <li>
              <button
                className={`btn ${activeTab === 'selfPaced' ? 'active' : ''}`}
                onClick={() => handleTabClick('selfPaced')}
              >
                Self Paced
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'fdp' ? 'active' : ''}`}
                onClick={() => handleTabClick('fdp')}
              >
                FDP’s
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'advancePG' ? 'active' : ''}`}
                onClick={() => handleTabClick('advancePG')}
              >
                Advance PG Course
              </button>
            </li>
            <li>
              <button
                className={`btn ${activeTab === 'shortTerm' ? 'active' : ''}`}
                onClick={() => handleTabClick('shortTerm')}
              >
                Short Term Training
              </button>
            </li>
          </ul>
        </div>
        <div className="content_tab">
          <div className={`tab-content`}>
             <div>
              <div className="payment_data_wrapp">
                <div className="left_bx">
                  <div className="crd_bx crd_dash">
                    <h3>Total Enrollments</h3>
                    <p>3280</p>
                    <div className="progressbar">
                      <div className="progressline" style={{ width: "80%" }}></div>
                    </div>
                    <h4>80% Increase in 20 Days</h4>
                  </div>
                  <div className="crd_bx crd_dash">
                    <h3>New Enrollments</h3>
                    <p>245</p>
                    <div className="progressbar">
                      <div className="progressline" style={{ width: "50%" }}></div>
                    </div>
                    <h4>50% Increase in 20 Days</h4>
                  </div>
                </div>
                <div className="rgt_bx crd_dash">
                  <div className="hd_bx">
                    <h3>Payment Analytics</h3>
                    <div className="tab_day">
                      {dayTabs.map((day, index) => (
                        <button
                          key={index}
                          className={`btn ${activeDayTab === day ? "active" : ""}`}
                          onClick={() => setActiveDayTab(day)}
                        >
                          {day}
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
                          {courseProgress.map((item, index) => (
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
                        <h4>₹25160</h4>
                      </div>
                      <ul>
                        {courseProgress.map((item, index) => (
                          <li key={index}>
                            <span>{item.label}</span>
                            <span>₹25160</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Upcomingevent_Wrapp">
                <div className="event_left_data crd_dash">
                  <div className="hd_bx">
                    <h3>Upcoming Events</h3>
                  </div>
                  <div className="UpcomingeventList">
                    {Array(8).fill(0).map((_, index) => (
                      <div className="card_event" key={index}>
                        <div className="date">11<span>May</span></div>
                        <div className="event_dt">
                          <h3>{index % 2 === 0 ? "UPSC Pre Live Class" : "Test Series- SSC"}</h3>
                          <p>08:30 - 12:30</p>
                          <h4>Kanishka Singh, Srishti Mishra</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="Upcomingevent_table_wrapp crd_dash">
                  <div className="hd_bx">
                    <h3>New FDP Requests</h3>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>STUDENT NAME</th>
                        <th style={{ width: "28%" }}>COURSE NAME</th>
                        <th>REQUEST DATE</th>
                        <th>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fdpRequests.map((req, index) => (
                        <tr key={index}>
                          <td>{req.name}</td>
                          <td>{req.course}</td>
                          <td>{req.date}</td>
                          <td>{req.time}</td>
                        </tr>
                      ))}
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
