import { toast } from "react-toastify";
import { GenericItems } from "../types";
import Hls from "hls.js";

interface ApiError {
  [fieldName: string]: string[];
}
export const returnCategoryById = (category: number) => {
  if (category === 1) {
    return "self-paced-courses";
  } else if (category === 2) {
    return "fdp-courses";
  } else if (category === 3) {
    return "pg-certification-courses";
  } else if (category === 5) {
    return "short-term-courses";
  } else if (category === 6) {
    return "eict-third-party-courses";
  }
};

export const handleNavigationLinks = (selectedFilter: any) => {
  if (selectedFilter === "self-paced-courses") {
    return "/course/self-paced";
  } else if (selectedFilter === "fdp-courses") {
    return "/course/fdp";
  } else if (selectedFilter === "pg-certification-courses") {
    return "/course/advance-pg-course";
  } else if (selectedFilter === "short-term-courses") {
    return "/course/short-term-training";
  } else if (selectedFilter === "eict-third-party-courses") {
    return "/course-management/add-courses";
  }
};

export const getErrorMessage = (error: any) => {
  let errorData = error;

  // Handle axios error structure
  if (error?.response?.data) {
    errorData = error.response.data;
  }
  if (Array.isArray(errorData)) {
    errorData.forEach((msg, index) => {
      if (typeof msg === "string") {
        setTimeout(() => toast.error(msg), index * 500);
      }
    });
    return;
  }
  // Check if it's an object with validation errors
  if (typeof errorData === "object" && errorData !== null) {
    const errorFields = Object.keys(errorData);

    if (errorFields.length === 1) {
      // Single error - show field name with message
      const field = errorFields[0];
      if (Array.isArray(errorData[field]) && errorData[field].length > 0) {
        const fieldName = formatFieldName(field);
        const message = `${fieldName}: "${errorData[field][0]}"`;
        toast.error(message);
      }
    } else if (errorFields.length > 1) {
      // Multiple errors - show each with field name
      errorFields.forEach((field, index) => {
        if (Array.isArray(errorData[field]) && errorData[field].length > 0) {
          setTimeout(() => {
            const fieldName = formatFieldName(field);
            const message = `${fieldName}: "${errorData[field][0]}"`;
            toast.error(message);
          }, index * 500);
        }
      });
    } else {
      toast.error(error?.message || "An error occurred");
    }
  } else {
    toast.error(error?.message || "An error occurred");
  }
};

// Automatic field name formatting function
const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
    .split(" ") // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join back
};

export const convertMinutesToTime = (totalMinutes: any) => {
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes * 60) % 60);

  return {
    hh: String(hours).padStart(2, "0"),
    mm: String(remainingMinutes).padStart(2, "0"),
    ss: String(seconds).padStart(2, "0"),
  };
}; // assuming you're using toast for warnings

export const convertTimeToMinutes = (
  { hh, mm, ss }: GenericItems,
  maxMinutes?: any
) => {
  const hours = parseInt(hh || "0", 10);
  const minutes = parseInt(mm || "0", 10);
  const seconds = parseInt(ss || "0", 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  console.log("totalSeconds :", totalSeconds);

  if (typeof totalSeconds === "number" && totalSeconds >= maxMinutes) {
    toast.warn("EXCEEDS_LIMIT");
  }

  return totalSeconds;
};

export const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};

export const formatSecondsToHHMMSS2 = (totalSeconds: number): any => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return { hh, mm, ss };
};

export const isDisabled = (
  unit: "hh" | "mm" | "ss",
  value: number,
  current: { hh: string; mm: string; ss: string },
  max: { hh: string; mm: string; ss: string }
) => {
  const hh = parseInt(current.hh || "0");
  const mm = parseInt(current.mm || "0");
  const ss = parseInt(current.ss || "0");

  const maxH = parseInt(max.hh);
  const maxM = parseInt(max.mm);
  const maxS = parseInt(max.ss);

  if (unit === "hh") {
    return value > maxH;
  }

  if (unit === "mm") {
    if (hh < maxH) return false;
    return value > maxM;
  }

  if (unit === "ss") {
    if (hh < maxH || mm < maxM) return false;
    return value > maxS;
  }

  return false;
};
export const convertTo24HourFormat = (time12h: string) => {
  const [time, modifier] = time12h.split(" ");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};

export const generateHlsThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.style.display = "none";
    document.body.appendChild(video);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = 5; // Seek to 5 seconds
      });

      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg");

          // Cleanup
          hls.destroy();
          video.remove();

          resolve(dataUrl);
        } catch (err) {
          video.remove();
          reject(err);
        }
      });

      video.addEventListener("error", (e) => {
        video.remove();
        reject("Video error occurred");
      });
    } else {
      video.remove();
      reject("HLS not supported in this browser");
    }
  });
};
