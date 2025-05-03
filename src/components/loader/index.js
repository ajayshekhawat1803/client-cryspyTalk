import React from "react";
import { Spinner } from "react-bootstrap";
import "./loaderComponent.css"; 

const LoaderComponent = () => {
  return (
    <div className="loader-overlay d-flex justify-content-center align-items-center">
      <Spinner animation="border" variant="primary" />
    </div>
  );
};

export default LoaderComponent;