"use client"
import Backtotop from '../../../shared/layouts-components/backtotop/backtotop';
import LandingSwitcher from '../../../shared/layouts-components/switcher/landing-switcher';
import React, { Fragment, useEffect} from 'react'

const Layout = ({ children }) => {
  useEffect(() => {
    document.querySelector("body")?.classList.add("landing-body");

    return () => {
      document.querySelector("body")?.classList.remove("landing-body");
    };
  });

  return (
    <Fragment>
      <div>
        <LandingSwitcher />
        {children}
      </div>
      <Backtotop />
    </Fragment>
  );
};

export default Layout;
