import { useEffect, useState } from "react";
import { generateHlsThumbnail } from "../../utils/helper";

function VideoThumbnail({ url, alt }: { url: string; alt: string }) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    generateHlsThumbnail(url)
      .then(setThumbnail)
      .catch(() => {
        setThumbnail(null);
      });
  }, [url]);

  if (!thumbnail) return <p>...</p>;

  return <img src={thumbnail} alt={alt} />;
}
export default VideoThumbnail;
