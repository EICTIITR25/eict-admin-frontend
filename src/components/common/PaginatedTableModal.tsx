import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAnglesLeft,
  faAngleRight,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { GenericItems } from "../../types";

type Column<T> = {
  key: keyof T | "sno" | "actions";
  label: string;
  style?: React.CSSProperties;
  render?: (row: T, index: number) => React.ReactNode;
};

type PaginatedTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  pagesToDisplay: (number | string)[];
  handlePagination: (action: "first" | "prev" | "next" | "last") => void;
};

function PaginatedTable<T extends GenericItems>({
  columns,
  data,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  pagesToDisplay,
  handlePagination,
}: PaginatedTableProps<T>) {
  return (
    <>
      <div className="tableData tableData_table">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={col.style || {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={col.style || {}}>
                    {col.render
                      ? col.render(row, startIndex + rowIndex)
                      : col.key === "sno"
                      ? startIndex + rowIndex + 1
                      : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <div className="items">
          <p>Items per page</p>
          <select
            className="formcontrol"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 15].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <p>
            {startIndex + 1} - {endIndex} of {totalItems} entries
          </p>
        </div>

        <div className="pagenationRight">
          <button
            className="btn"
            onClick={() => handlePagination("first")}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAnglesLeft} /> First
          </button>
          <button
            className="btn"
            onClick={() => handlePagination("prev")}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAngleLeft} /> Back
          </button>

          {pagesToDisplay.map((page, index) =>
            page === "..." ? (
              <span key={index} className="dots">
                ...
              </span>
            ) : (
              <button
                key={index}
                className={`btn btnno ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(Number(page))}
              >
                {page}
              </button>
            )
          )}

          <button
            className="btn"
            onClick={() => handlePagination("next")}
            disabled={currentPage === totalPages}
          >
            Next <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button
            className="btn"
            onClick={() => handlePagination("last")}
            disabled={currentPage === totalPages}
          >
            Last <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </>
  );
}

export default PaginatedTable;
