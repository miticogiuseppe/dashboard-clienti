import React from "react";

const REACT_LOGO_PATH = "/bouncing-circles.svg";

const Preloader = (props) => {
  const { show } = props;
  // Preloader Component in attesa al caricamento dei dati

  return (
    <div
      className={`preloader bg-soft flex-column justify-content-center align-items-center ${
        show ? "" : "hide"
      }`}
    >
      <img
        src={`${
          process.env.NODE_ENV === "production" ? basePath : ""
        }/assets/images/media/loader.svg`}
        alt="Loading..."
      />
    </div>
  );
};

export default Preloader;
