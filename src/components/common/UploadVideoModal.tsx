import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { Modal, Table, ProgressBar } from "react-bootstrap";
import Hls from "hls.js";
import { useCrud } from "../../hooks/useCrud"; // Adjust import path as needed
import { GenericItems } from "../../types";
import { useEscToClose } from "../../hooks/useEscToClose";
import { formatSecondsToHHMMSS, getErrorMessage } from "../../utils/helper";

// Types
interface UploadedVideo {
  id?: string;
  name: string;
  duration: string;
  src: string;
  streamUrl?: string;
  file?: File; // Store the original file for later upload
  uploadStatus?: "pending" | "uploading" | "completed" | "failed";
}

interface UploadedPart {
  PartNumber: number;
  ETag: string;
}

interface VideoUploaderProps {
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  chapterData: GenericItems | null;
  courseId?: GenericItems | null;
}

// Configuration
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

const VideoUploaderComponent: React.FC<VideoUploaderProps> = memo(
  ({ showUploadModal, setShowUploadModal, chapterData, courseId }) => {
    // Initialize CRUD hooks
    useEscToClose(showUploadModal, () => setShowUploadModal(false));
    const { useCreate: useCreateMutation } = useCrud();

    // Upload state
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [showTable, setShowTable] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);

    // Video management
    const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
    const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(
      null
    );
    const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(
      null
    );

    const videoRef = useRef<HTMLVideoElement>(null);

    // Mutation hooks for different API calls
    const initiateUploadMutation = useCreateMutation("/initiate-upload/");
    const addVidoWithoutText = useCreateMutation(
      `/courses/chapters/${chapterData?.id}/resources/`,
      [`/courses/courses/${courseId}/chapters/`, "{}"],
      {
        onSuccess: (data) => {
          // setShowUploadModal(false);
          // setShowTable(false);
          // setShowProgress(false);
          // setUploadProgress(0);
          setMessage("");
          // setUploadedVideos([]);
        },
        onError: (error) => {
          // setShowUploadModal(false);
          // setShowTable(false);
          // setShowProgress(false);
          // setUploadProgress(0);
          setMessage("");
          // setUploadedVideos([]);
          getErrorMessage(error)
        }
      }
    );
    const getPartUrlMutation = useCreateMutation("/get-part-url/");
    const completeUploadMutation = useCreateMutation("/complete-upload/");

    // HLS setup for streaming
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !currentStreamUrl) return;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(currentStreamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error("HLS error:", data);
          setMessage(`❌ HLS playback error: ${data.type} - ${data.details}`);
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS support
        video.src = currentStreamUrl;
      }
    }, [currentStreamUrl]);

    // Custom fetch function for stream URL (since it's a GET request)
    const fetchStreamUrl = useCallback(
      async (videoId: string): Promise<string> => {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL
          }/stream-url/?video_id=${encodeURIComponent(videoId)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch stream URL: ${errorData.error || response.statusText
            }`
          );
        }

        const { playlist_url } = await response.json();
        if (!playlist_url) {
          throw new Error("No playlist URL returned from server");
        }

        return playlist_url;
      },
      []
    );

    // Custom fetch function for part upload (PUT request to S3)
    const uploadPartToS3 = useCallback(
      async (
        partUrl: string,
        chunk: Blob,
        fileType: string
      ): Promise<string> => {
        const uploadRes = await fetch(partUrl, {
          method: "PUT",
          headers: { "Content-Type": fileType },
          body: chunk,
        });

        if (!uploadRes.ok) {
          throw new Error(
            `Part upload failed with status: ${uploadRes.status}`
          );
        }

        const eTag = uploadRes.headers.get("ETag")?.replace(/"/g, "");
        if (!eTag) {
          throw new Error("No ETag returned from S3 upload");
        }

        return eTag;
      },
      []
    );

    // Get video duration helper
    const getVideoDuration = useCallback((file: File): Promise<number> => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          const seconds = video.duration;
          resolve(Math.floor(seconds));
        };

        video.onerror = () => {
          resolve(0); // fallback value, or you can reject instead
        };
      });
    }, []);

    // Upload single video to server (called only when Create is clicked)
    const uploadVideoToServer = useCallback(
      async (file: File, videoIndex: number): Promise<UploadedVideo> => {
        try {
          // Update status to uploading
          setUploadedVideos((prev) =>
            prev.map((video, index) =>
              index === videoIndex
                ? { ...video, uploadStatus: "uploading" as const }
                : video
            )
          );

          // Step 1: Initiate multipart upload
          const initData = await new Promise<any>((resolve, reject) => {
            initiateUploadMutation.mutate(
              { file_name: file.name, content_type: file.type },
              {
                onSuccess: (data: any) => resolve(data),
                onError: (error: any) =>
                  reject(new Error("Failed to initiate upload")),
              }
            );
          });

          const { upload_id, key } = initData;

          // Step 2: Upload parts
          const totalParts = Math.ceil(file.size / CHUNK_SIZE);
          const uploadedParts: UploadedPart[] = [];

          for (let i = 1; i <= totalParts; i++) {
            const start = (i - 1) * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            // Get part URL
            const partData = await new Promise<any>((resolve, reject) => {
              getPartUrlMutation.mutate(
                { key, upload_id, part_number: i },
                {
                  onSuccess: (data: any) => resolve(data),
                  onError: (error: any) =>
                    reject(new Error(`Failed to get part URL for part ${i}`)),
                }
              );
            });

            const { part_url } = partData;

            // Upload part to S3
            const eTag = await uploadPartToS3(part_url, chunk, file.type);
            uploadedParts.push({ PartNumber: i, ETag: eTag });

            // Update progress for this part
            const partProgress = (i / totalParts) * 100;
            setUploadProgress(partProgress);
          }

          // Step 3: Complete upload
          const completeData = await new Promise<any>((resolve, reject) => {
            completeUploadMutation.mutate(
              { key, upload_id, parts: uploadedParts },
              {
                onSuccess: (data: any) => resolve(data),
                onError: (error: any) =>
                  reject(new Error("Failed to complete upload")),
              }
            );
          });

          const video_id = completeData.video_id || completeData.stream_url;

          if (!video_id || video_id === "undefined") {
            throw new Error("Invalid video_id returned from server");
          }

          // Step 4: Get stream URL
          const playlist_url = await fetchStreamUrl(video_id);

          // Step 5: Add video to chapter resources

          const duration: any = await getVideoDuration(file);
          await new Promise<any>((resolve, reject) => {
            addVidoWithoutText.mutate(
              {
                title: chapterData?.title,
                resource_type: "video",
                url: playlist_url,
                original_video_name: file.name,
                original_duration: duration,
              },
              {
                onSuccess: (data: any) => resolve(data),
                onError: (error: any) =>
                  reject(new Error("Failed to add video to chapter")),
              }
            );
          });
          return {
            id: video_id,
            name: file.name,
            duration,
            src: URL.createObjectURL(file), // For thumbnail/preview
            streamUrl: playlist_url,
            uploadStatus: "completed",
          };
        } catch (error) {
          console.error("Upload error:", error);
          throw error;
        }
      },
      [
        fetchStreamUrl,
        getVideoDuration,
        initiateUploadMutation,
        uploadPartToS3,
        getPartUrlMutation,
        completeUploadMutation,
        addVidoWithoutText,
        chapterData?.title,
      ]
    );

    // Handle file selection (no upload yet)
    const handleFileUpload = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setMessage("Processing selected files...");

        try {
          const newVideos: UploadedVideo[] = [];

          for (const file of files) {
            const duration: any = await getVideoDuration(file);

            newVideos.push({
              name: file.name,
              duration,
              src: URL.createObjectURL(file),
              file, // Store the original file for later upload
              uploadStatus: "pending",
            });
          }

          setUploadedVideos((prev) => [...prev, ...newVideos]);
          setShowTable(true);
          setMessage(`${files.length} video(s) selected and ready to upload`);
        } catch (error) {
          console.error("File processing error:", error);
          setMessage(
            `❌ File processing failed: ${error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      },
      [getVideoDuration]
    );

    // Handle Create button click - this is where the actual upload happens
    const handleCreate = useCallback(async () => {
      const pendingVideos = uploadedVideos.filter(
        (video) => video.uploadStatus === "pending" && video.file
      );

      if (pendingVideos.length === 0) {
        setMessage("No videos to upload");
        return;
      }

      setIsCreating(true);
      setShowProgress(true);
      setUploadProgress(0);
      setMessage("Starting upload process...");

      try {
        const totalVideos = pendingVideos.length;

        for (let i = 0; i < totalVideos; i++) {
          const video = pendingVideos[i];
          const videoIndex = uploadedVideos.findIndex((v) => v === video);

          setMessage(`Uploading ${video.name} (${i + 1} of ${totalVideos})...`);

          try {
            const uploadedVideo = await uploadVideoToServer(video.file!, videoIndex);

            setUploadedVideos((prev) =>
              prev.map((v, index) => (index === videoIndex ? uploadedVideo : v))
            );

            setUploadProgress(((i + 1) / totalVideos) * 100);
          } catch (error) {
            console.error(`Failed to upload ${video.name}:`, error);

            setUploadedVideos((prev) =>
              prev.map((v, index) =>
                index === videoIndex
                  ? { ...v, uploadStatus: "failed" as const }
                  : v
              )
            );
          }
        }

        // ✅ All done → close modal
        setMessage("All videos uploaded successfully!");
        setShowUploadModal(false);
        setShowTable(false);
        setShowProgress(false);
        setUploadProgress(0);
        setUploadedVideos([]);
      } catch (error) {
        console.error("Create process error:", error);
        setMessage(
          `❌ Upload failed: ${error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsCreating(false);
        setMessage('');

      }
    }, [uploadedVideos, uploadVideoToServer]);


    // Handle video deletion
    const handleDelete = useCallback(
      (index: number) => {
        const videoToDelete = uploadedVideos[index];

        // Revoke object URL to free memory
        if (videoToDelete.src.startsWith("blob:")) {
          URL.revokeObjectURL(videoToDelete.src);
        }

        setUploadedVideos((prev) => prev.filter((_, i) => i !== index));

        // If deleted video was currently playing, clear stream
        if (playingVideoIndex === index) {
          setCurrentStreamUrl(null);
          setPlayingVideoIndex(null);
        }
        setMessage("");
      },
      [uploadedVideos, playingVideoIndex]
    );

    // Handle video streaming
    const handleStreamVideo = useCallback(
      (video: UploadedVideo, index: number) => {
        if (video.streamUrl) {
          setCurrentStreamUrl(video.streamUrl);
          setPlayingVideoIndex(index);
          setMessage(`🎥 Now streaming: ${video.name}`);
        } else {
          setMessage(`❌ No stream available for ${video.name}`);
        }
      },
      []
    );

    // Get status badge color
    const getStatusBadge = (status: string) => {
      switch (status) {
        case "pending":
          return <span className="badge bg-warning">Pending</span>;
        case "uploading":
          return <span className="badge bg-info">Uploading...</span>;
        case "completed":
          return <span className="badge bg-success">Completed</span>;
        case "failed":
          return <span className="badge bg-danger">Failed</span>;
        default:
          return <span className="badge bg-secondary">Unknown</span>;
      }
    };

    return (
      <div className="video-uploader-container">
        {/* Upload Modal */}
        <Modal
          show={showUploadModal}
          centered
          dialogClassName="modalfullCustom modalSM modalVideo"
          aria-labelledby="video-upload-modal"
        >
          <Modal.Body>
            <div
              className="headerModal"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Upload Videos</h3>
              <button
                disabled={isCreating}
                className="btnClose"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => {
                  setShowUploadModal(false);
                  setShowTable(false);
                  setMessage("");
                  setUploadedVideos([]);
                }}
              >
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_436_7813"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="20"
                    height="21"
                  >
                    <rect y="0.205078" width="20" height="20" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_436_7813)">
                    <path
                      d="M5.33073 16.0378L4.16406 14.8711L8.83073 10.2044L4.16406 5.53776L5.33073 4.37109L9.9974 9.03776L14.6641 4.37109L15.8307 5.53776L11.1641 10.2044L15.8307 14.8711L14.6641 16.0378L9.9974 11.3711L5.33073 16.0378Z"
                      fill="#666666"
                    />
                  </g>
                </svg>
              </button>
            </div>

            {/* Upload Section */}
            <div className="UploadVideo_btn">
              <label className="btnUpload" htmlFor="uploadVideoInput">
                <span>
                  <svg
                    width="23"
                    height="16"
                    viewBox="0 0 23 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.53125 16C4.01458 16 2.71875 15.475 1.64375 14.425C0.56875 13.375 0.03125 12.0917 0.03125 10.575C0.03125 9.275 0.422917 8.11667 1.20625 7.1C1.98958 6.08333 3.01458 5.43333 4.28125 5.15C4.69792 3.61667 5.53125 2.375 6.78125 1.425C8.03125 0.475 9.44792 0 11.0312 0C12.9812 0 14.6354 0.679167 15.9938 2.0375C17.3521 3.39583 18.0312 5.05 18.0312 7C19.1812 7.13333 20.1354 7.62917 20.8938 8.4875C21.6521 9.34583 22.0312 10.35 22.0312 11.5C22.0312 12.75 21.5938 13.8125 20.7188 14.6875C19.8438 15.5625 18.7812 16 17.5312 16H12.0312C11.4812 16 11.0104 15.8042 10.6188 15.4125C10.2271 15.0208 10.0312 14.55 10.0312 14V8.85L8.43125 10.4L7.03125 9L11.0312 5L15.0312 9L13.6313 10.4L12.0312 8.85V14H17.5312C18.2313 14 18.8229 13.7583 19.3062 13.275C19.7896 12.7917 20.0312 12.2 20.0312 11.5C20.0312 10.8 19.7896 10.2083 19.3062 9.725C18.8229 9.24167 18.2313 9 17.5312 9H16.0312V7C16.0312 5.61667 15.5438 4.4375 14.5688 3.4625C13.5938 2.4875 12.4146 2 11.0312 2C9.64792 2 8.46875 2.4875 7.49375 3.4625C6.51875 4.4375 6.03125 5.61667 6.03125 7H5.53125C4.56458 7 3.73958 7.34167 3.05625 8.025C2.37292 8.70833 2.03125 9.53333 2.03125 10.5C2.03125 11.4667 2.37292 12.2917 3.05625 12.975C3.73958 13.6583 4.56458 14 5.53125 14H8.03125V16H5.53125Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <input
                  type="file"
                  name="Upload"
                  id="uploadVideoInput"
                  multiple
                  accept="video/*"
                  onChange={handleFileUpload}
                // disabled={isCreating}
                />
                Upload from your PC
              </label>
              <h3>Supported file formats: mp4, webm, mkv, mov, avi, etc.</h3>
              <p>Select multiple videos from your local storage.</p>
            </div>

            {/* Progress Section */}
            {showProgress && (
              <div className="upload_file">
                <label>Upload Status</label>
                <ProgressBar now={uploadProgress} />
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className="mt-3">
                <p className="font-semibold">{message}</p>
              </div>
            )}

            {/* Videos Table */}
            {showTable && uploadedVideos.length > 0 && (
              <div className="table_Videos">
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Video</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedVideos.map((video, index) => (
                      <tr key={index}>
                        <td>
                          <video width="100" controls>
                            <source src={video.src} />
                          </video>
                        </td>
                        <td>{video.name}</td>
                        <td>
                          {formatSecondsToHHMMSS(Number(video?.duration))}
                        </td>
                        <td>
                          {getStatusBadge(video.uploadStatus || "pending")}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {video.streamUrl && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleStreamVideo(video, index)}
                                title="Stream Video"
                              >
                                ▶️
                              </button>
                            )}
                            <button
                              className="btn btn_delete"
                              onClick={() => handleDelete(index)}
                              title="Delete Video"
                              disabled={video.uploadStatus === "uploading"}
                            >
                              <svg
                                width="14"
                                height="15"
                                viewBox="0 0 14 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3.99219 0.518262C4.15039 0.200625 4.47559 0 4.83008 0H8.35742C8.71191 0 9.03711 0.200625 9.19531 0.518262L9.40625 0.9375H12.2188C12.7373 0.9375 13.1562 1.35732 13.1562 1.875C13.1562 2.39268 12.7373 2.8125 12.2188 2.8125H0.96875C0.451074 2.8125 0.03125 2.39268 0.03125 1.875C0.03125 1.35732 0.451074 0.9375 0.96875 0.9375H3.78125L3.99219 0.518262ZM0.942383 3.75H12.2188V13.125C12.2188 14.1592 11.3779 15 10.3438 15H2.81738C1.80811 15 0.942383 14.1592 0.942383 13.125V3.75ZM3.28613 6.09375V12.6562C3.28613 12.9141 3.52344 13.125 3.75488 13.125C4.03906 13.125 4.22363 12.9141 4.22363 12.6562V6.09375C4.22363 5.83594 4.03906 5.625 3.75488 5.625C3.52344 5.625 3.28613 5.83594 3.28613 6.09375ZM6.09863 6.09375V12.6562C6.09863 12.9141 6.33594 13.125 6.56738 13.125C6.85156 13.125 7.0625 12.9141 7.0625 12.6562V6.09375C7.0625 5.83594 6.85156 5.625 6.56738 5.625C6.33594 5.625 6.09863 5.83594 6.09863 6.09375ZM8.9375 6.09375V12.6562C8.9375 12.9141 9.14844 13.125 9.40625 13.125C9.66406 13.125 9.875 12.9141 9.875 12.6562V6.09375C9.875 5.83594 9.66406 5.625 9.40625 5.625C9.14844 5.625 8.9375 5.83594 8.9375 6.09375Z"
                                  fill="white"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Stream Player */}
            {currentStreamUrl && (
              <div className="mt-4">
                <h4>🎥 Stream Player:</h4>
                <video
                  ref={videoRef}
                  controls
                  width="100%"
                  style={{ maxWidth: "720px", backgroundColor: "#000" }}
                />
                <p className="mt-2 text-sm text-muted">
                  Playing via CloudFront with signed URL (HLS Stream).
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="btn_grp btnRight_grp mt-4 d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUploadModal(false);
                  setShowTable(false);
                  setMessage("");
                  setUploadedVideos([]);
                }}
                disabled={isCreating}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={
                  !uploadedVideos.some((v) => v.uploadStatus === "pending") ||
                  isCreating
                }
              >
                {/* {isCreating
                  ? "Creating..."
                  : `Create (${
                      uploadedVideos.filter((v) => v.uploadStatus === "pending")
                        .length
                    } videos)`} */}
                {isCreating ? "Uploading" : "Create"}
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
);

export default VideoUploaderComponent;
