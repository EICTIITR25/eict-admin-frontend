import { useEffect } from "react";

type Options = {
  shouldWarn: boolean;
};
const useTabCloseWarning = ({ shouldWarn }: Options) => {
  useEffect(() => {
    if (!shouldWarn) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // required for native browser alert
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldWarn]);
};

export default useTabCloseWarning;
