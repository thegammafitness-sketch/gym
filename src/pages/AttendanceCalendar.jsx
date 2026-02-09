import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function AttendanceCalendar({ attendanceDates }) {
  function tileClassName({ date, view }) {
    if (view !== "month") return null;

    const today = new Date();
    const d = date.toISOString().split("T")[0];

    if (date > today) return "bg-gray-200";

    if (attendanceDates.includes(d)) {
      return "bg-green-500 text-white rounded-full";
    }

    return "bg-red-500 text-white rounded-full";
  }

  return (
    <div className="p-4 border rounded-xl">
      <Calendar tileClassName={tileClassName} />
    </div>
  );
}
