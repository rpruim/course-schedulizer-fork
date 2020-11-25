import FullCalendar from "@fullcalendar/react";
import { CalendarOptions } from "@fullcalendar/common";

// Plugins
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import timeGridPlugin from "@fullcalendar/timegrid";

import React from "react"; // Has to come after the FullCalendar/react package
import { INITIAL_DATE } from "utilities/constants";
import "./Calendar.scss";

export const Calendar = (props: CalendarOptions) => {
  return (
    <>
      <FullCalendar {...props} />
    </>
  );
};

Calendar.defaultProps = {
  allDaySlot: false,
  dayHeaderFormat: { weekday: "short" },
  droppable: false,
  editable: false, // TODO: Change to true if we can lock section meeting times
  headerToolbar: false,
  height: "auto",
  initialDate: INITIAL_DATE,
  initialView: "timeGridWeek",
  nowIndicator: false,
  plugins: [interactionPlugin, timeGridPlugin],
  selectable: true,
  slotMaxTime: "22:00:00",
  slotMinTime: "6:00:00",
  weekends: false,
};
