"use client";
import Footer from "../../../shared/layouts-components/footer/footer";
import Header from "../../../shared/layouts-components/header/header";
import Sidebar from "../../../shared/layouts-components/sidebar/sidebar";
import Switcher from "../../../shared/layouts-components/switcher/switcher";
import React, { Fragment } from "react";
import { connect } from "react-redux";
import { ThemeChanger } from "../../../shared/redux/action";
import Backtotop from "../../../shared/layouts-components/backtotop/backtotop";
import Loader from "../../../shared/layouts-components/loader/loader";
import { useContext } from "react";
import GlobalContext from "@/context/GlobalContext";

const Layout = ({ children }) => {
  const { menu } = useContext(GlobalContext);

  return (
    <Fragment>
      <Switcher />
      <Loader />
      <div className="page">
        <Header
          showProfile={false}
          showLanguages={false}
          showCart={false}
          showNotifications={false}
        />

        <Sidebar menu={menu} />
        <div className="main-content app-content">
          <div className="container-fluid">{children}</div>
        </div>
        <Footer />
      </div>
      <Backtotop />
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  local_varaiable: state,
});

export default connect(mapStateToProps, { ThemeChanger })(Layout);
