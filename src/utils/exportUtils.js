import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format, isSaturday, isSunday, isDate } from "date-fns";
import { isDateHoliday } from "./holidays";
import { isNoClassDay } from "./schedule";
import { groupDatesByMonth, chunkDates } from "./dateUtils";

// Color Constants (ARGB)
const COLORS = {
  YELLOW_BG: "FFFFFF00", // Nov
  GREEN_BG: "FF90EE90", // Dec
  BLUE_BG: "FFADD8E6", // Jan/Feb
  PURPLE_BG: "FFE6E6FA", // Feb
  RED_TEXT: "FFFF0000",
  WHITE: "FFFFFFFF",
  SLATE_100: "FFF1F5F9", // Blocked
  RED_100: "FFFEE2E2", // Holiday
};

const MONTH_COLORS = {
  November: COLORS.YELLOW_BG,
  December: COLORS.GREEN_BG,
  January: COLORS.BLUE_BG,
  February: COLORS.BLUE_BG, // Using Blue for Feb based on image, or maybe different?
  March: COLORS.PURPLE_BG,
  April: COLORS.GREEN_BG,
};

// Helper: Apply Border to Cell
const applyBorder = (cell) => {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
};

export const exportToExcel = async ({
  sectionId,
  term,
  dates,
  students,
  attendance,
  customHolidays,
  stats,
  totalSchoolDays,
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Section ${sectionId} - ${term}`);

  // 1. Data Processing
  // Group and Chunk dates exactly like the UI
  const monthGroups = groupDatesByMonth(dates);
  const monthKeys = Object.keys(monthGroups);

  // Calculate Columns
  // Col 1: NO
  // Col 2: NAME
  // Col 3+: Date Pairs
  const COL_OFFSET = 3;
  let currentPairCol = COL_OFFSET;

  const pairColumns = []; // Store metadata for each column { month, pair: [d1, d2] }

  monthKeys.forEach((month) => {
    const mDates = monthGroups[month];
    const chunks = chunkDates(mDates, 2);
    chunks.forEach((chunk) => {
      pairColumns.push({
        month,
        pair: chunk,
        colIndex: currentPairCol,
      });
      currentPairCol++;
    });
  });

  const TOTAL_COLS = currentPairCol; // Last col index is this (Stats col)

  // 2. Setup Columns Widths
  worksheet.getColumn(1).width = 4; // NO
  worksheet.getColumn(2).width = 30; // NAME
  for (let i = 3; i < TOTAL_COLS; i++) {
    worksheet.getColumn(i).width = 4; // Date Cols narrow
  }
  worksheet.getColumn(TOTAL_COLS).width = 8; // TOTAL

  // 3. HEADERS

  // ROW 1: TITLE
  worksheet.mergeCells(1, 1, 1, TOTAL_COLS);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = `${term.toUpperCase()} ATTENDANCE`;
  titleCell.font = { bold: true, size: 16, name: "Arial" };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // ROW 2: MONTH HEADERS
  // We need to merge columns based on months in `pairColumns`
  let mStart = 3;
  let currM = pairColumns[0].month;

  for (let i = 0; i < pairColumns.length; i++) {
    const p = pairColumns[i];
    const isLast = i === pairColumns.length - 1;

    if (p.month !== currM || isLast) {
      let mEnd = isLast && p.month === currM ? p.colIndex : p.colIndex - 1;

      // Merge previous month span
      worksheet.mergeCells(2, mStart, 2, mEnd);
      const mCell = worksheet.getCell(2, mStart);
      mCell.value = currM;
      mCell.font = { bold: true };
      mCell.alignment = { horizontal: "center", vertical: "middle" };
      mCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: MONTH_COLORS[currM] || "FFFFFFFF" },
      };
      applyBorder(mCell);
      // Apply fill to all merged cells? ExcelJS usually handles merge, but better check style application.
      // We'll apply style to the range later if needed.

      currM = p.month;
      mStart = p.colIndex;
    }

    // If it's the very last distinct month (handling the loop edge case)
    if (isLast && p.month !== pairColumns[i - 1].month) {
      // This is a single col month at end or new month
      const mCell = worksheet.getCell(2, p.colIndex);
      mCell.value = p.month;
      mCell.font = { bold: true };
      mCell.alignment = { horizontal: "center", vertical: "middle" };
      mCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: MONTH_COLORS[p.month] || "FFFFFFFF" },
      };
      applyBorder(mCell);
    }
  }

  // ROW 3 & 4: DATES
  // Also "NO" and "NAME" spans Rows 2,3,4
  worksheet.mergeCells(2, 1, 4, 1); // NO
  const noHeader = worksheet.getCell(2, 1);
  noHeader.value = "NO";
  noHeader.font = { bold: true };
  noHeader.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(noHeader);

  worksheet.mergeCells(2, 2, 4, 2); // NAME
  const nameHeader = worksheet.getCell(2, 2);
  nameHeader.value = "NAME";
  nameHeader.font = { bold: true };
  nameHeader.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(nameHeader);

  // Stats Header
  worksheet.mergeCells(2, TOTAL_COLS, 4, TOTAL_COLS);
  const totalHeader = worksheet.getCell(2, TOTAL_COLS);
  totalHeader.value = "AT";
  totalHeader.font = { bold: true, size: 8 };
  totalHeader.alignment = {
    horizontal: "center",
    vertical: "middle",
  }; // Rotated like image? Or standard
  applyBorder(totalHeader);

  // Loop columns to set Dates
  pairColumns.forEach((colData) => {
    const colIdx = colData.colIndex;
    const d1 = colData.pair[0];
    const d2 = colData.pair[1];

    // Month Color for this column
    const monthColor = MONTH_COLORS[colData.month] || "FFFFFFFF";

    // Top Date
    const c1 = worksheet.getCell(3, colIdx);
    c1.value = parseInt(format(d1, "d"));
    c1.alignment = { horizontal: "center", vertical: "middle" };
    c1.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: monthColor },
    };
    c1.font = { size: 9 };
    applyBorder(c1);

    // Bottom Date
    const c2 = worksheet.getCell(4, colIdx);
    if (d2) {
      c2.value = parseInt(format(d2, "d"));
    } else {
      c2.value = ""; // Empty bottom slot
    }
    c2.alignment = { horizontal: "center", vertical: "middle" };
    c2.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: monthColor },
    };
    c2.font = { size: 9 };
    applyBorder(c2);
  });

  // 4. STUDENT ROWS
  let currentRow = 5;

  students.forEach((student, index) => {
    // Each student uses 2 rows: currentRow and currentRow+1

    // NO
    worksheet.mergeCells(currentRow, 1, currentRow + 1, 1);
    const cellNo = worksheet.getCell(currentRow, 1);
    cellNo.value = index + 1;
    cellNo.alignment = { horizontal: "center", vertical: "middle" };
    applyBorder(cellNo); // Top
    applyBorder(worksheet.getCell(currentRow + 1, 1)); // Bottom border implicit

    // NAME
    worksheet.mergeCells(currentRow, 2, currentRow + 1, 2);
    const cellName = worksheet.getCell(currentRow, 2);
    cellName.value = student.name;
    cellName.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    applyBorder(cellName);
    applyBorder(worksheet.getCell(currentRow + 1, 2));

    let studentPresentTotal = 0;

    // DATA COLUMNS
    pairColumns.forEach((colData) => {
      const d1 = colData.pair[0];
      const d2 = colData.pair[1];
      const colIdx = colData.colIndex;
      const monthColor = MONTH_COLORS[colData.month] || "FFFFFFFF";

      // --- TOP CELL (Date 1) ---
      const cell1 = worksheet.getCell(currentRow, colIdx);
      cell1.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: monthColor },
      };
      applyBorder(cell1);

      const { isBlocked: blocked1 } = isNoClassDay(d1, sectionId);
      const hol1 = isDateHoliday(d1, customHolidays).isHoliday;
      const wknd1 = isSunday(d1) || isSaturday(d1);

      if (blocked1 || hol1 || wknd1) {
        // Visualize blocked?
        // Image just keeps background color.
        // But maybe we X out? The web view grays it out.
        // Let's strictly follow image requests: "per section complete report same UI with the image".
        // The image has mostly empty cells.
        // If it is blocked, we probably normally shouldn't allow marking.
        // We'll leave it empty but maybe shade slightly darker if needed?
        // The prompt says "colors extend all the way down". So we keep month color.
      } else {
        // Check attendance
        const dateKey1 = format(d1, "yyyy-MM-dd");
        const isAbs1 = attendance[dateKey1]?.[student.id];

        if (isAbs1) {
          // If the user wants "Absent" marked, usually it's "A" or Red Cell?
          // Web view: Absent is RED.
          // We will define specific behavior: Red background?
          // The image doesn't show absences, just the grid.
          // But a report MUST show data.
          // I will assume standard: Absent = Red Text or Fill.
          // Let's use Red Text 'A' for visibility against month color.
          // Or "0".
          // Let's use "A" with Red Bold.
          cell1.value = "A";
          cell1.font = { color: { argb: COLORS.RED_TEXT }, bold: true };
        } else {
          studentPresentTotal++;
        }
      }

      // --- BOTTOM CELL (Date 2) ---
      const cell2 = worksheet.getCell(currentRow + 1, colIdx);
      cell2.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: monthColor },
      };
      applyBorder(cell2);

      if (d2) {
        const { isBlocked: blocked2 } = isNoClassDay(d2, sectionId);
        const hol2 = isDateHoliday(d2, customHolidays).isHoliday;
        const wknd2 = isSunday(d2) || isSaturday(d2);

        if (!blocked2 && !hol2 && !wknd2) {
          const dateKey2 = format(d2, "yyyy-MM-dd");
          const isAbs2 = attendance[dateKey2]?.[student.id];
          if (isAbs2) {
            cell2.value = "A";
            cell2.font = { color: { argb: COLORS.RED_TEXT }, bold: true };
          } else {
            studentPresentTotal++;
          }
        }
      } else {
        // No date 2 (empty slot at end of month)
        // Keep color.
      }
    });

    // TOTAL COL
    worksheet.mergeCells(currentRow, TOTAL_COLS, currentRow + 1, TOTAL_COLS);
    const cellTotal = worksheet.getCell(currentRow, TOTAL_COLS);
    cellTotal.value = studentPresentTotal;
    cellTotal.alignment = { horizontal: "center", vertical: "middle" };
    cellTotal.font = { bold: true };
    applyBorder(cellTotal);
    applyBorder(worksheet.getCell(currentRow + 1, TOTAL_COLS));

    currentRow += 2;
  });

  // 5. Generate
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(
    blob,
    `Attendance_${sectionId}_${term.toUpperCase()}_${format(new Date(), "yyyyMMdd")}.xlsx`,
  );
};
