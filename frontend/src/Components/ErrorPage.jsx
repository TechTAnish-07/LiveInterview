
import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Oops!</h1>
      <p>Something went wrong.</p>
      <pre style={{ color: "red" }}>
        {error?.statusText || error?.message}
      </pre>
    </div>
  );
};

export default ErrorPage;
