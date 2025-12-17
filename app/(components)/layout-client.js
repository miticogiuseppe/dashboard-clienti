"use client";
import * as switcherdata from "../../shared/data/switcherdata/switcherdata";
import { ThemeChanger } from "../../shared/redux/action";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import GlobalContext from "@/context/GlobalContext";

const Layout = ({ local_varaiable, ThemeChanger, children, globalData }) => {
  const customstyles = {
    ...(local_varaiable.colorPrimaryRgb !== "" && {
      "--primary-rgb": local_varaiable.colorPrimaryRgb,
    }),
    ...(local_varaiable.bodyBg !== "" && {
      "--body-bg-rgb": local_varaiable.bodyBg,
    }),
    ...(local_varaiable.bodyBg2 !== "" && {
      "--body-bg-rgb2": local_varaiable.bodyBg2,
    }),
    ...(local_varaiable.lightRgb !== "" && {
      "--light-rgb": local_varaiable.lightRgb,
    }),
    ...(local_varaiable.formControlBg !== "" && {
      "--form-control-bg": local_varaiable.formControlBg,
    }),
    ...(local_varaiable.gray !== "" && { "--gray-3": local_varaiable.gray }),
    ...(local_varaiable.inputBorder !== "" && {
      "--input-border": local_varaiable.inputBorder,
    }),
  };

  const [_lateLoad, setlateLoad] = useState(false);

  useEffect(() => {
    switcherdata.LocalStorageBackup(ThemeChanger);
    setlateLoad(true);
  }, []);

  return (
    <html
      dir={local_varaiable.dir}
      data-theme-mode={local_varaiable.dataThemeMode}
      data-header-styles={local_varaiable.dataHeaderStyles}
      data-vertical-style={local_varaiable.dataVerticalStyle}
      data-nav-layout={local_varaiable.dataNavLayout}
      data-menu-styles={local_varaiable.dataMenuStyles}
      data-toggled={local_varaiable.toggled}
      data-nav-style={local_varaiable.dataNavStyle}
      hor-style={local_varaiable.horStyle}
      data-page-style={local_varaiable.dataPageStyle}
      data-width={local_varaiable.dataWidth}
      data-menu-position={local_varaiable.dataMenuPosition}
      data-header-position={local_varaiable.dataHeaderPosition}
      data-icon-overlay={local_varaiable.iconOverlay}
      data-bg-img={local_varaiable.bgImg}
      icon-text={local_varaiable.iconText}
      style={customstyles}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* <title></title> */}
        <meta name="Author" content="Spruko Technologies Private Limited" />
        <meta
          name="keywords"
          content="nextjs, nextjs app router, nextjs template, nextjs firebase, admin, firebase nextjs, nextjs dashboard template, next js react, dashboard admin, router admin, router admin panel, dashboard, nextjs admin, reactbootstrap, nextjs admin template"
        />
      </head>
      <body>
        <GlobalContext.Provider value={globalData}>
          {children}
        </GlobalContext.Provider>
      </body>
    </html>
  );
};

const mapStateToProps = (state) => ({
  local_varaiable: state,
});

export default connect(mapStateToProps, { ThemeChanger })(Layout);
