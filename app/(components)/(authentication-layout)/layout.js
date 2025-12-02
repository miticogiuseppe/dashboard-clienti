"use client"
import React, { Fragment } from 'react'
import LandingSwitcher from '../../../shared/layouts-components/switcher/landing-switcher';


const Layout = ({ children }) => {
  return (
    <Fragment>
      <LandingSwitcher />
      {children}
    </Fragment>
  );
};

export default Layout;
