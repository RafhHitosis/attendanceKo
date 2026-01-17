import React, { useMemo, useState } from "react";
import { format, isSameDay, isToday, isSunday, isSaturday } from "date-fns";
import { groupDatesByMonth, chunkDates } from "../utils/dateUtils";
import { isDateHoliday } from "../utils/holidays";
import { isNoClassDay } from "../utils/schedule";
import clsx from "clsx";
import { Plus, User, Trash2 } from "lucide-react";

export default function AttendanceTable({
  dates,
  students,
  attendance,
  toggleAttendance,
  addStudent,
  deleteStudent,
  stats,
  sectionId,
  customHolidays,
  totalSchoolDays,
}) {
  const [newStudentName, setNewStudentName] = useState("");

  // Pre-process columns
  const monthGroups = useMemo(() => groupDatesByMonth(dates), [dates]);
  const monthKeys = Object.keys(monthGroups);

  // Calculate pairs for each month
  const monthColumns = useMemo(() => {
    return monthKeys.map((month) => ({
      name: month,
      pairs: chunkDates(monthGroups[month], 2),
    }));
  }, [monthGroups, monthKeys]);

  const handleSubmitStudent = (e) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      addStudent(newStudentName.trim());
      setNewStudentName("");
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative">
      <div className="flex-1 overflow-auto relative shadow-inner">
        <table className="min-w-full border-collapse border-spacing-0 bg-white text-sm">
          {/* Calendar Header */}
          <thead className="sticky top-0 z-20 bg-white text-slate-800 shadow-sm font-semibold">
            {/* Row 1: Months */}
            <tr>
              <th className="sticky left-0 z-30 bg-white border border-slate-200 w-12 min-w-[3rem] p-0 text-center">
                NO
              </th>
              <th className="sticky left-12 z-30 bg-white border border-slate-200 min-w-[200px] text-left px-4">
                NAME
              </th>
              {monthColumns.map((group) => (
                <th
                  key={group.name}
                  colSpan={group.pairs.length}
                  className={clsx(
                    "text-center py-2 border border-slate-200 uppercase tracking-wider text-xs bg-slate-50 font-bold text-slate-700",
                  )}
                >
                  {group.name}
                </th>
              ))}
              <th className="sticky right-0 top-0 z-30 bg-slate-50 border border-slate-200 w-24 p-2 text-center text-xs font-bold text-slate-700">
                AT
              </th>
            </tr>

            {/* Row 2: Date Pairs */}
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 border border-slate-200 text-center align-middle">
                <span className="text-[10px] font-bold text-slate-400">
                  {students.length}
                </span>
              </th>
              <th className="sticky left-12 z-30 bg-slate-50 border border-slate-200 p-2">
                <form onSubmit={handleSubmitStudent} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add student..."
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </form>
              </th>

              {monthColumns.map((group) =>
                group.pairs.map((pair, idx) => {
                  const noClass1 = isNoClassDay(pair[0], sectionId);
                  const hol1Check = isDateHoliday(pair[0], customHolidays);
                  const isBlocked1 =
                    hol1Check.isHoliday ||
                    isSunday(pair[0]) ||
                    isSaturday(pair[0]) ||
                    noClass1.isBlocked;
                  const reason1 = hol1Check.isHoliday
                    ? hol1Check.name
                    : noClass1.isBlocked
                      ? noClass1.reason
                      : null;

                  const noClass2 = pair[1]
                    ? isNoClassDay(pair[1], sectionId)
                    : { isBlocked: false };
                  const hol2Check = pair[1]
                    ? isDateHoliday(pair[1], customHolidays)
                    : { isHoliday: false };
                  const isBlocked2 =
                    pair[1] &&
                    (hol2Check.isHoliday ||
                      isSunday(pair[1]) ||
                      isSaturday(pair[1]) ||
                      noClass2.isBlocked);
                  const reason2 =
                    pair[1] &&
                    (hol2Check.isHoliday
                      ? hol2Check.name
                      : noClass2.isBlocked
                        ? noClass2.reason
                        : null);

                  return (
                    <th
                      key={`${group.name}-${idx}`}
                      className="border border-slate-200 min-w-[3rem] p-0 align-top bg-white"
                    >
                      <div className="flex flex-col h-full">
                        {/* Day 1 */}
                        <div
                          className={clsx(
                            "flex-1 flex items-center justify-center py-1 border-b border-slate-300 text-xs",
                            isToday(pair[0]) &&
                              "bg-emerald-600 text-white font-bold",
                            hol1Check.isHoliday && "bg-red-100 text-red-700",
                            (isSunday(pair[0]) ||
                              isSaturday(pair[0]) ||
                              noClass1.isBlocked) &&
                              !hol1Check.isHoliday &&
                              "bg-slate-200 text-slate-500",
                          )}
                          title={`${format(pair[0], "EEEE")}${reason1 ? ` - ${reason1}` : isSunday(pair[0]) || isSaturday(pair[0]) ? " - Weekend" : ""}`}
                        >
                          {format(pair[0], "d")}
                        </div>

                        {/* Day 2 */}
                        {pair[1] ? (
                          <div
                            className={clsx(
                              "flex-1 flex items-center justify-center py-1 text-xs",
                              isToday(pair[1]) &&
                                "bg-emerald-600 text-white font-bold",
                              hol2Check.isHoliday && "bg-red-100 text-red-700",
                              (isSunday(pair[1]) ||
                                isSaturday(pair[1]) ||
                                noClass2.isBlocked) &&
                                !hol2Check.isHoliday &&
                                "bg-slate-200 text-slate-500",
                            )}
                            title={`${format(pair[1], "EEEE")}${reason2 ? ` - ${reason2}` : isSunday(pair[1]) || isSaturday(pair[1]) ? " - Weekend" : ""}`}
                          >
                            {format(pair[1], "d")}
                          </div>
                        ) : (
                          <div className="flex-1 bg-slate-50"></div>
                        )}
                      </div>
                    </th>
                  );
                }),
              )}
              <th className="sticky right-0 z-30 bg-slate-50 border border-slate-200 text-[10px] text-slate-500 p-1">
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <div className="flex-1 w-full flex items-center justify-center border-b border-slate-300">
                    <span className="text-emerald-700 font-bold text-[10px]">
                      PRES
                    </span>
                  </div>
                  <div className="flex-1 w-full flex items-center justify-center">
                    <span className="text-[10px] text-red-500 font-bold">
                      ABS
                    </span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white">
            {students.length === 0 && (
              <tr>
                <td
                  colSpan={100}
                  className="p-8 text-center text-slate-400 italic"
                >
                  No students added yet. Add one above.
                </td>
              </tr>
            )}
            {students.map((student, index) => (
              <StudentRow
                key={student.id}
                student={student}
                index={index}
                stats={stats}
                attendance={attendance}
                monthColumns={monthColumns}
                customHolidays={customHolidays}
                sectionId={sectionId}
                totalSchoolDays={totalSchoolDays}
                toggleAttendance={toggleAttendance}
                deleteStudent={deleteStudent}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const StudentRow = React.memo(
  ({
    student,
    index,
    stats,
    attendance,
    monthColumns,
    customHolidays,
    sectionId,
    totalSchoolDays,
    toggleAttendance,
    deleteStudent,
  }) => {
    const studentStats = stats.find((s) => s.studentId === student.id) || {
      totalAbsences: 0,
      totalPresent: 0,
    };

    return (
      <tr className="hover:bg-slate-50 group">
        <td className="sticky left-0 z-10 bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-mono">
          {index + 1}
        </td>
        <td className="sticky left-12 z-10 bg-white group-hover:bg-slate-50 border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 flex justify-between items-center h-[50px]">
          <span className="truncate max-w-[150px]">{student.name}</span>
          <button
            onClick={() => deleteStudent(student.id)}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
            title="Delete Student"
          >
            <Trash2 className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
          </button>
        </td>

        {monthColumns.map((group) =>
          group.pairs.map((pair, idx) => {
            const date1 = pair[0];
            const date2 = pair[1];
            const date1Key = format(date1, "yyyy-MM-dd");
            const date2Key = date2 ? format(date2, "yyyy-MM-dd") : null;

            const isAbs1 = attendance[date1Key]?.[student.id];
            const isAbs2 = date2Key && attendance[date2Key]?.[student.id];

            const hol1Check = isDateHoliday(date1, customHolidays);
            const hol2Check = date2
              ? isDateHoliday(date2, customHolidays)
              : { isHoliday: false };

            const isHol1 = hol1Check.isHoliday;
            const isHol2 = hol2Check.isHoliday;
            const isWknd1 = isSunday(date1) || isSaturday(date1);
            const isWknd2 = date2 && (isSunday(date2) || isSaturday(date2));

            const noClass1 = isNoClassDay(date1, sectionId);
            const noClass2 = date2
              ? isNoClassDay(date2, sectionId)
              : { isBlocked: false };

            const isBlocked1 = isHol1 || isWknd1 || noClass1.isBlocked;
            const isBlocked2 = isHol2 || isWknd2 || noClass2.isBlocked;

            const title1 = `${format(date1, "EEEE")}${isHol1 ? ` - Holiday: ${hol1Check.name}` : noClass1.isBlocked ? ` - ${noClass1.reason}` : isWknd1 ? " - Weekend" : isAbs1 ? " - Absent" : " - Present"}`;
            const title2 = date2
              ? `${format(date2, "EEEE")}${isHol2 ? ` - Holiday: ${hol2Check.name}` : noClass2.isBlocked ? ` - ${noClass2.reason}` : isWknd2 ? " - Weekend" : isAbs2 ? " - Absent" : " - Present"}`
              : "";

            return (
              <td
                key={`${group.name}-${idx}`}
                className="border border-slate-200 p-0 h-[50px] min-w-[3rem]"
              >
                <div className="flex flex-col h-full">
                  {/* Cell 1 */}
                  <div
                    className={clsx(
                      "flex-1 cursor-pointer transition-colors border-b border-slate-300 relative",
                      isBlocked1
                        ? "bg-slate-100 cursor-not-allowed"
                        : isAbs1
                          ? "bg-red-500 hover:bg-red-600"
                          : "hover:bg-blue-50",
                      isHol1 && "bg-red-100", // Holiday override color
                    )}
                    onClick={() =>
                      !isBlocked1 && toggleAttendance(student.id, date1)
                    }
                    title={title1}
                  ></div>

                  {/* Cell 2 */}
                  {date2 ? (
                    <div
                      className={clsx(
                        "flex-1 cursor-pointer transition-colors relative",
                        isBlocked2
                          ? "bg-slate-100 cursor-not-allowed"
                          : isAbs2
                            ? "bg-red-500 hover:bg-red-600"
                            : "hover:bg-blue-50",
                        isHol2 && "bg-red-100", // Holiday override color
                      )}
                      onClick={() =>
                        !isBlocked2 && toggleAttendance(student.id, date2)
                      }
                      title={title2}
                    ></div>
                  ) : (
                    <div className="flex-1 bg-slate-100"></div>
                  )}
                </div>
              </td>
            );
          }),
        )}

        <td className="sticky right-0 z-10 bg-slate-50 border border-slate-200 text-center font-bold text-xs">
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 w-full flex items-center justify-center border-b border-slate-300 bg-emerald-50/50">
              <span className="text-emerald-700 font-bold text-xs">
                {studentStats.totalPresent}
              </span>
            </div>
            <div className="flex-1 w-full flex items-center justify-center bg-red-50/50">
              <span className="text-red-600 font-bold text-xs">
                {studentStats.totalAbsences}
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  },
);
