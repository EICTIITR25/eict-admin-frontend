import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { CalendarApi } from "@fullcalendar/core";
import "./CalendarPage.scss"
import { useCrud } from "../../hooks/useCrud";
import moment from "moment";
const CalendarPage = () => {
  const { useFetch } = useCrud()
  const [viewRange, setViewRange] = useState<{ start: string; end: string } | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);
  const { data: calenderList = [] } = useFetch(
    viewRange
      ? `/liveclasses/calendar-events/?start_date=${viewRange.start}&end_date=${viewRange.end}`
      : "",
    {},
    {
      retry: false,
      enabled: !!viewRange,
    }
  );

  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (calenderList && calenderList?.events?.length > 0) {
      console.log('calenderList :', calenderList);
      const eventList = calenderList?.events?.map((item: any) => ({
        title: item.title,
        date: item.date
      }))
      setEvents(eventList)
    }
  }, [calenderList, viewRange])

  const handleTitleClick = () => {
    const calendarApi = calendarRef.current?.getApi();
    const currentDate = calendarApi?.getDate();
    // if (currentDate) {
    //  const monthName = currentDate.toLocaleString("default", { month: "long" });
    //  alert("Month name clicked: " + monthName);
    // }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const titleEl = document.querySelector(".fc-toolbar-title") as HTMLElement;
      if (titleEl && !titleEl.classList.contains("fc-clickable-title")) {
        titleEl.classList.add("fc-clickable-title");
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", handleTitleClick);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);
  const handleDatesSet = (arg: any) => {
    const current = moment(arg.view.currentStart);

    const startDate = current.clone().startOf("month").format("YYYY-MM-DD");
    const endDate = current.clone().endOf("month").format("YYYY-MM-DD");

    setViewRange({ start: startDate, end: endDate });
  };

  return (
    <div className="admin_panel">
      <div className="Breadcrumbs">
        <h3>Calendar</h3>
      </div>
      <div className="card_bx" style={{ padding: "20px", height: "100vh" }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="100%"
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          datesSet={handleDatesSet}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
