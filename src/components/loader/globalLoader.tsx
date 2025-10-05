import React from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import "./loader.css";

const GlobalLoader: React.FC = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="loader-container">
      <img src="/loader-logo.png" alt="Loading..." className="loader-image" />
    </div>
  );
};

export default GlobalLoader;
