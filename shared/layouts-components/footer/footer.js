"use client";
import Link from "next/link";
import React, { Fragment } from "react";
import GlobalContext from "@/context/GlobalContext";
import { useContext } from "react";

const Footer = () => {
  const { tenant } = useContext(GlobalContext);

  return (
    <Fragment>
      <footer className="footer mt-auto py-3 bg-white text-center">
        <div className="container">
          <span className="text-muted">
            {tenant} – Powered by SupplyChainItalia
          </span>
        </div>
      </footer>
    </Fragment>
  );
};

export default Footer;
