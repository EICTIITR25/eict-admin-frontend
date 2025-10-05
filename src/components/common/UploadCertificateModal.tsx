import React, { memo, useEffect, useState } from "react";
import { GenericItems } from "../../types";

import { useDynamicForm } from "../../hooks/useDynamicForm";
import { useCrud } from "../../hooks/useCrud";
import { getErrorMessage } from "../../utils/helper";
import { buildFormData } from "../../utils/buildFormData";

interface UploadCertificateModalProps {
  courseId?: GenericItems | null;
  sampleCertificate?: string | undefined | any;
  certificateId?: string;
  courseCode?: boolean;
}
const defaultValue = {
  certificate_file: null,
};
const UploadCertificateModal: React.FC<UploadCertificateModalProps> = ({
  courseId,
  sampleCertificate,
  certificateId = "EICTIITR",
  courseCode = false,
}) => {
  const { useCreate } = useCrud();
  const { form, setForm, handleChange } = useDynamicForm(defaultValue);
  const { mutate: createCertificate } = useCreate(
    "/courses/sample-certificates/",
    ["{}"],
    {
      onSuccess: () => {},
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );

  const currentYear = new Date().getFullYear();
  const [selectedCourseCode, setSelectedCourseCode] = useState("CCD");

  const sampleId = courseCode
    ? `${certificateId}-PGC-${selectedCourseCode}-${currentYear}-[SerialNo]`
    : `${certificateId}-${currentYear}-[SerialNo]`;

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.type.startsWith("image/")) {
      handleChange("certificate_file", URL.createObjectURL(file));

      const formData = buildFormData(
        {
          certificate_file: file,
          is_active: true,
          course_id: courseId,
        },
        {
          certificate_file: "certificate_file",
          is_active: "is_active",
          course_id: "course_id",
        }
      );
      createCertificate(formData);
    }
  };

  useEffect(() => {
    if (sampleCertificate) {
      handleChange("certificate_file", sampleCertificate);
    }
  }, []);

  return (
    <div className="CardfromSection">
      <div className="head_bx">
        <h3>Upload Sample Certificate</h3>
      </div>

      <div
        className="uploadCertificate"
        // style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
      >
        <div className="certificateIdSample" style={{ flex: "1" }}>
          {courseCode && (
            <div style={{ marginBottom: "10px" }}>
              <label
                htmlFor="courseCodeDropdown"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                }}
              >
                Course Code
              </label>
              <select
                id="courseCodeDropdown"
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "40%",
                }}
              >
                <option value="CCD">CCD</option>
                <option value="EVT">EVT</option>
                <option value="DSA">DSA</option>
                <option value="CSS">CSS</option>
              </select>
            </div>
          )}

          <p style={{ marginBottom: "8px", fontWeight: 500 }}>
            Certificate ID Sample
          </p>
          <p style={{ fontWeight: "500", color: "#1E3A8A" }}>{sampleId}</p>
        </div>
        <hr />

        <div
          className="upload_file"
          style={{
            flex: "2",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {!form.certificate_file ? (
            <label style={{ cursor: "pointer" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleCertificateChange}
                style={{ display: "none" }}
              />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#1E3A8A",
                  fontWeight: 500,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_931_14551"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                  >
                    <rect width="24" height="24" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_931_14551)">
                    <path
                      d="M11 17H13V13H17V11H13V7H11V11H7V13H11V17ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"
                      fill="#1E3A8A"
                    />
                  </g>
                </svg>
                Upload Certificate
              </span>
            </label>
          ) : (
            <>
              <img
                src={form.certificate_file}
                alt="Certificate Preview"
                style={{
                  maxWidth: "100%",
                  marginTop: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <button
                className="btn"
                style={{ marginTop: "8px" }}
                onClick={() =>
                  setForm((prev) => ({ ...prev, certificate_file: null }))
                }
              >
                Remove Image
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default memo(UploadCertificateModal);
