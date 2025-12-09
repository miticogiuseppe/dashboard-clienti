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
        className="loader-element animate__animated animate__jackInTheBox"
        src={REACT_LOGO_PATH}
        height={80}
        alt="React Logo"
      />
    </div>
  );
};

export default Preloader;
