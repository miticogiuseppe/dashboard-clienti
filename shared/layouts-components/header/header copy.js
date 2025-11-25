"use client";
import Link from "next/link";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Dropdown, Form, ListGroup, Modal } from "react-bootstrap";
import { ThemeChanger, removeFromCart } from "../../redux/action";
import { connect, useDispatch, useSelector } from "react-redux";
import { MENUITEMS } from "../sidebar/index";
import SimpleBar from "simplebar-react";
import { basePath } from "../../../next.config";
import SpkButton from "../../@spk-reusable-components/reusable-uielements/spk-button";
import SpkDropdown from "../../@spk-reusable-components/reusable-uielements/spk-dropdown";
import SpkListgroup from "../../@spk-reusable-components/reusable-uielements/spk-listgroup";
import SpkBadge from "../../@spk-reusable-components/reusable-uielements/spk-badge";
import store from "../../redux/store";

const Header = ({ local_varaiable, ThemeChanger }) => {
  //full screen
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (
      !document.fullscreenElement &&
      !document.fullscreenElement &&
      !document.fullscreenElement
    ) {
      // Enter fullscreen mode
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
    };
  }, []);

  //MenuClose

  function menuClose() {
    const theme = store.getState();
    if (window.innerWidth <= 992) {
      ThemeChanger({ ...theme, toggled: "close" });
    }
    if (window.innerWidth >= 992) {
      ThemeChanger({
        ...theme,
        toggled: local_varaiable.toggled ? local_varaiable.toggled : "",
      });
    }
  }

  //Toggle-Function

  function toggleSidebar() {
    const theme = store.getState();
    let sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        let verticalStyle = theme.dataVerticalStyle;
        const navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          // closed
          case "closed":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "close-menu-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "close-menu-close" });
            }
            break;
          // icon-overlay
          case "overlay":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "icon-overlay-close") {
              ThemeChanger({ ...theme, toggled: "", iconOverlay: "" });
            } else {
              if (window.innerWidth >= 992) {
                ThemeChanger({
                  ...theme,
                  toggled: "icon-overlay-close",
                  iconOverlay: "",
                });
              }
            }
            break;
          // icon-text
          case "icontext":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "icon-text-close") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-text-close" });
            }
            break;
          // doublemenu
          case "doublemenu":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.toggled === "double-menu-open") {
              ThemeChanger({ ...theme, toggled: "double-menu-close" });
            } else {
              let sidemenu = document.querySelector(".side-menu__item.active");
              if (sidemenu) {
                ThemeChanger({ ...theme, toggled: "double-menu-open" });
                if (sidemenu.nextElementSibling) {
                  sidemenu.nextElementSibling.classList.add(
                    "double-menu-active"
                  );
                } else {
                  ThemeChanger({ ...theme, toggled: "double-menu-close" });
                }
              }
            }
            break;
          // detached
          case "detached":
            if (theme.toggled === "detached-close") {
              ThemeChanger({ ...theme, toggled: "", iconOverlay: "" });
            } else {
              ThemeChanger({
                ...theme,
                toggled: "detached-close",
                iconOverlay: "",
              });
            }

            break;

          // default
          case "default":
            ThemeChanger({ ...theme, toggled: "" });
        }
        switch (navStyle) {
          case "menu-click":
            if (theme.toggled === "menu-click-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "menu-click-closed" });
            }
            break;
          // icon-overlay
          case "menu-hover":
            if (theme.toggled === "menu-hover-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "menu-hover-closed" });
            }
            break;
          case "icon-click":
            if (theme.toggled === "icon-click-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-click-closed" });
            }
            break;
          case "icon-hover":
            if (theme.toggled === "icon-hover-closed") {
              ThemeChanger({ ...theme, toggled: "" });
            } else {
              ThemeChanger({ ...theme, toggled: "icon-hover-closed" });
            }
            break;
        }
      }
    } else {
      if (theme.toggled === "close") {
        ThemeChanger({ ...theme, toggled: "open" });

        setTimeout(() => {
          if (theme.toggled == "open") {
            const overlay = document.querySelector("#responsive-overlay");

            if (overlay) {
              overlay.classList.add("active");
              overlay.addEventListener("click", () => {
                const overlay = document.querySelector("#responsive-overlay");

                if (overlay) {
                  overlay.classList.remove("active");
                  menuClose();
                }
              });
            }
          }

          window.addEventListener("resize", () => {
            if (window.screen.width >= 992) {
              const overlay = document.querySelector("#responsive-overlay");

              if (overlay) {
                overlay.classList.remove("active");
              }
            }
          });
        }, 100);
      } else {
        ThemeChanger({ ...theme, toggled: "close" });
      }
    }
  }

  //Dark Model

  const toggledark = () => {
    ThemeChanger({
      ...local_varaiable,
      dataThemeMode: local_varaiable.dataThemeMode == "dark" ? "light" : "dark",
      dataHeaderStyles:
        local_varaiable.dataThemeMode == "dark" ? "light" : "dark",
      dataMenuStyles:
        local_varaiable.dataNavLayout == "horizontal"
          ? local_varaiable.dataThemeMode == "dark"
            ? "light"
            : "dark"
          : "dark",
    });
    const theme = store.getState();

    if (theme.dataThemeMode != "dark") {
      ThemeChanger({
        ...theme,
        bodyBg: "",
        lightRgb: "",
        bodyBg2: "",
        inputBorder: "",
        formControlBg: "",
        gray: "",
      });
      localStorage.setItem("xintralighttheme", "light");
      localStorage.removeItem("xintradarktheme");
      localStorage.removeItem("xintraMenu");
      localStorage.removeItem("xintraHeader");
      localStorage.removeItem("bodyBg");
      localStorage.removeItem("bodyBg2");
      localStorage.removeItem("inputBorder");
      localStorage.removeItem("lightRgb");
      localStorage.removeItem("formControlBg");
      localStorage.removeItem("gray");
    } else {
      localStorage.setItem("xintradarktheme", "dark");
      localStorage.removeItem("xintralighttheme");
      localStorage.removeItem("xintraMenu");
      localStorage.removeItem("xintraHeader");
    }
  };

  //Switcher-Icon

  const Switchericon = () => {
    document.querySelector(".offcanvas-end")?.classList.toggle("show");
    if (
      document.querySelector(".switcher-backdrop")?.classList.contains("d-none")
    ) {
      document.querySelector(".switcher-backdrop")?.classList.add("d-block");
      document.querySelector(".switcher-backdrop")?.classList.remove("d-none");
    }
  };

  //Search Functionality

  const searchRef = useRef(null);

  const handleClick = (event) => {
    const searchInput = searchRef.current;

    if (
      searchInput &&
      (searchInput === event.target || searchInput.contains(event.target))
    ) {
      document.querySelector(".header-search")?.classList.add("searchdrop");
    } else {
      document.querySelector(".header-search")?.classList.remove("searchdrop");
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, []);
  const [showa, setShowa] = useState(false);
  const [InputValue, setInputValue] = useState("");
  const [show2, setShow2] = useState(false);
  const [searchcolor, setsearchcolor] = useState("text-dark");
  const [searchval, setsearchval] = useState("Type something");
  const [NavData, setNavData] = useState([]);

  useEffect(() => {
    const clickHandler = (_event) => {
      const searchResult = document.querySelector(".search-result");
      if (searchResult) {
        searchResult.classList.add("d-none");
      }
    };

    document.addEventListener("click", clickHandler);

    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  const myfunction = (inputvalue) => {
    document.querySelector(".search-result")?.classList.remove("d-none");

    const i = [];
    const allElement2 = [];
    MENUITEMS.forEach((mainLevel) => {
      if (mainLevel.children) {
        setShowa(true);
        mainLevel.children.forEach((subLevel) => {
          i.push(subLevel);
          if (subLevel.children) {
            subLevel.children.forEach((subLevel1) => {
              i.push(subLevel1);
              if (subLevel1.children) {
                subLevel1.children.forEach((subLevel2) => {
                  i.push(subLevel2);
                });
              }
            });
          }
        });
      }
    });
    for (const allElement of i) {
      if (allElement.title.toLowerCase().includes(inputvalue.toLowerCase())) {
        if (
          allElement.title.toLowerCase().startsWith(inputvalue.toLowerCase())
        ) {
          setShow2(true);

          // Check if the element has a path and doesn't already exist in allElement2 before pushing
          if (
            allElement.path &&
            !allElement2.some((el) => el.title === allElement.title)
          ) {
            allElement2.push(allElement);
          }
        }
      }
    }

    if (!allElement2.length || inputvalue === "") {
      if (inputvalue === "") {
        setShow2(false);
        setsearchval("Type something");
        setsearchcolor("text-dark");
      }
      if (!allElement2.length) {
        setShow2(false);
        setsearchcolor("text-danger");
        setsearchval("There is no component with this name");
      }
    }
    setNavData(allElement2);
  };

  //Responsive Search
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //Notification
  const img = (
    <span className="avatar avatar-md avatar-rounded bg-primary">
      {" "}
      <img
        src={`${
          process.env.NODE_ENV === "production" ? basePath : ""
        }/assets/images/faces/1.jpg`}
        alt="user1"
      />{" "}
    </span>
  );
  const img1 = (
    <span className="avatar avatar-md bg-primary avatar-rounded fs-20">
      {" "}
      <i className="fe fe-shopping-cart lh-1 "></i>{" "}
    </span>
  );
  const img2 = (
    <span className="avatar avatar-md bg-orange avatar-rounded">
      {" "}
      <img
        src={`${
          process.env.NODE_ENV === "production" ? basePath : ""
        }/assets/images/faces/10.jpg`}
        alt="user1"
      />{" "}
    </span>
  );
  const img3 = (
    <span className="avatar avatar-md bg-success avatar-rounded">
      {" "}
      <img
        src={`${
          process.env.NODE_ENV === "production" ? basePath : ""
        }/assets/images/faces/11.jpg`}
        alt="user1"
      />{" "}
    </span>
  );
  const img4 = (
    <span className="avatar avatar-md bg-primary2 avatar-rounded">
      {" "}
      <i className="ri-gift-line lh-1 fs-16"></i>{" "}
    </span>
  );

  const content = (
    <div className="text-muted fw-normal fs-12 header-notification-text text-truncate">
      Jane Sam sent you a message.
    </div>
  );
  const content1 = (
    <div className="text-muted fw-normal fs-12 header-notification-text text-truncate">
      Order <span className="text-primary1">#54321</span> has been shipped.
    </div>
  );
  const content2 = (
    <div className="text-muted fw-normal fs-12 header-notification-text text-truncate">
      Reacted: <span className="text-primary3">John Richard</span> on your next
      purchase!
    </div>
  );
  const content3 = (
    <div className="text-muted fw-normal fs-12 header-notification-text text-truncate">
      <span className="text-info">Kelin Brown</span> has sent you the request.
    </div>
  );
  const content4 = (
    <div className="text-muted fw-normal fs-12 header-notification-text text-truncate">
      Enjoy<span className="text-success"> 20% off</span> on your next purchase!
    </div>
  );

  const Notifications = [
    { id: 1, src: img, heading: "New Messages", data: content, data1: "Now" },
    {
      id: 2,
      src: img1,
      heading: "Order Updates",
      data: content1,
      data1: "2 hours ago",
    },
    {
      id: 3,
      src: img2,
      heading: "Comment on Post",
      data: content2,
      data1: "2 hours ago",
    },
    {
      id: 4,
      src: img3,
      heading: "Follow Request",
      data: content3,
      data1: "1 Day ago",
    },
    {
      id: 5,
      src: img4,
      heading: "Exclusive Offers",
      data: content4,
      data1: "5 hours ago",
    },
  ];

  const [notifications, setNotifications] = useState(Notifications); // assuming 'data' is an array of notifications
  const [unreadCount, setUnreadCount] = useState(5); // initial unread count

  const hasNotifications = notifications.length > 0;

  const handleRemove1 = (id) => {
    // Filter out the notification by id
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id
    );
    setNotifications(updatedNotifications);
    setUnreadCount(unreadCount - 1); // decrease unread count
  };

  //Cart function

  const cartProduct = [
    {
      id: 1,
      productpicture: "/assets/images/ecommerce/png/30.png",
      title: "Wireless Headphones",
      price: "$78",
      discount: "$75",
      quantity: "1",
      data: "Wireless freedom with crystal-clear sound and comfortable ",
    },
    {
      id: 2,
      productpicture: "/assets/images/ecommerce/png/29.png",
      title: "Ladies Hand Bag",
      price: "$30",
      discount: "$15",
      quantity: "2",
      data: "Both fashion and functionality. ",
    },
    {
      id: 3,
      productpicture: "/assets/images/ecommerce/png/32.png",
      title: "Alarm Clock",
      price: "$84",
      discount: "$84",
      quantity: "1",
      data: "Add natural beauty to your space ",
    },
    {
      id: 4,
      productpicture: "/assets/images/ecommerce/png/12.png",
      title: "Kids' Party Wear Frock",
      price: "$37",
      discount: "$37",
      quantity: "1",
      data: "Crafted from soft, breathable fabric and adorned with delightful ",
    },
    {
      id: 5,
      productpicture: "/assets/images/ecommerce/png/16.png",
      title: "Advanced Smart Watch",
      price: "$29",
      discount: "$48",
      quantity: "2",
      data: "ultimate in wearable technology,combining cutting-edge ",
    },
  ];

  const maxDisplayItems = 5;

  const dispatch = useDispatch();
  const reduxCart = useSelector((state) => state.cart);
  const [localCart, setLocalCart] = useState(cartProduct);
  const [remainingCount2, setRemainingCount2] = useState(0);

  // Combine local and redux carts whenever they change
  const card = [...localCart, ...reduxCart];

  useEffect(() => {
    setRemainingCount2(card.length);
    setCartItemCount(localCart.length);
  }, [card, localCart]);

  const handleDelete = (id, event) => {
    event.stopPropagation();
    // Remove item from local cart
    const updatedLocalCart = localCart.filter((item) => item.id !== id);
    setLocalCart(updatedLocalCart);
    // Update cart item count
    setCartItemCount(updatedLocalCart.length);
    // Remove item from redux cart
    dispatch(removeFromCart(id));
  };
  const [cartItems, setCartItems] = useState([...cartProduct]);
  const [cartItemCount, setCartItemCount] = useState(cartProduct.length);

  useEffect(() => {
    setCartItemCount(localCart.length);
  }, [localCart]);

  const handleRemove = (itemId, event) => {
    event.stopPropagation();
    const updatedCart = localCart.filter((item) => item.id !== itemId);
    setLocalCart(updatedCart);
    setCartItemCount(updatedCart.length);
  };

  return (
    <Fragment>
      <header className="app-header sticky" id="header">
        {/* <!-- Start::main-header-container --> */}
        <div className="main-header-container container-fluid">
          {/* <!-- Start::header-content-left --> */}
          <div className="header-content-left">
            {/* <!-- Start::header-element --> */}
            <div className="header-element">
              <div className="horizontal-logo">
                <Link href="#!" className="header-logo">
                  <img
                    src={`${
                      process.env.NODE_ENV === "production" ? basePath : ""
                    }/assets/images/brand-logos/desktop-logo.png`}
                    alt="logo"
                    className="desktop-logo"
                  />
                  <img
                    src={`${
                      process.env.NODE_ENV === "production" ? basePath : ""
                    }/assets/images/brand-logos/toggle-dark.png`}
                    alt="logo"
                    className="toggle-dark"
                  />
                  <img
                    src={`${
                      process.env.NODE_ENV === "production" ? basePath : ""
                    }/assets/images/brand-logos/desktop-dark.png`}
                    alt="logo"
                    className="desktop-dark"
                  />
                  <img
                    src={`${
                      process.env.NODE_ENV === "production" ? basePath : ""
                    }/assets/images/brand-logos/toggle-logo.png`}
                    alt="logo"
                    className="toggle-logo"
                  />
                  <img
                    src={`${
                      process.env.NODE_ENV === "production" ? basePath : ""
                    }/assets/images/brand-logos/toggle-white.png`}
                    alt="logo"
                    className="toggle-white"
                  />
                  <img
                    src={`${
                      process.env.NODE_ENV === "production" ? basePath : ""
                    }/assets/images/brand-logos/desktop-white.png`}
                    alt="logo"
                    className="desktop-white"
                  />
                </Link>
              </div>
            </div>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <div className="header-element mx-lg-0 mx-2">
              <Link
                aria-label="Hide Sidebar"
                onClick={() => toggleSidebar()}
                className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle"
                data-bs-toggle="sidebar"
                scroll={false}
                href="#!"
              >
                <span></span>
              </Link>
            </div>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}

            <div className="header-element header-search d-md-block d-none my-auto auto-complete-search">
              {/* Start::header-link */}
              <input
                type="text"
                className="header-search-bar form-control"
                id="header-search"
                placeholder="Search for Results..."
                onClick={() => {}}
                autoComplete="off"
                ref={searchRef}
                defaultValue={InputValue}
                onChange={(ele) => {
                  myfunction(ele.target.value);
                  setInputValue(ele.target.value);
                }}
                autoCapitalize="off"
              />
              {showa ? (
                <div className="card search-result position-absolute">
                  <div className="card-header">
                    <div className="card-title mb-0 text-break">
                      Search result of {InputValue}
                    </div>
                  </div>
                  <div className="card-body overflow-auto">
                    <SpkListgroup CustomClass="m-2">
                      {show2 ? (
                        NavData.map((e) => (
                          <ListGroup.Item key={Math.random()} className="">
                            <Link
                              href={`${e.path}/`}
                              className="search-result-item"
                              onClick={() => {
                                setShowa(false), setInputValue("");
                              }}
                            >
                              {e.title}
                            </Link>
                          </ListGroup.Item>
                        ))
                      ) : (
                        <b className={`${searchcolor} `}>{searchval}</b>
                      )}
                    </SpkListgroup>
                  </div>
                </div>
              ) : (
                ""
              )}
              <Link
                scroll={false}
                href="#!"
                className="header-search-icon border-0"
              >
                <i className="ri-search-line"></i>
              </Link>
            </div>
            {/* <!-- End::header-element --> */}
          </div>
          {/* <!-- End::header-content-left --> */}

          {/* <!-- Start::header-content-right --> */}
          <ul className="header-content-right">
            {/* <!-- Start::header-element --> */}
            <li className="header-element d-md-none d-block">
              <Link
                href="#!"
                scroll={false}
                className="header-link"
                onClick={handleShow}
              >
                {/* <!-- Start::header-link-icon --> */}
                <i className="bi bi-search header-link-icon lh-1"></i>
                {/* <!-- End::header-link-icon --> */}
              </Link>
            </li>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <SpkDropdown
              Customclass="header-element country-selector"
              autoClose="outside"
              toggleas="a"
              Navigate="#!"
              Customtoggleclass="header-link dropdown-toggle no-caret"
              Svgicon="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
              SvgClass="w-6 h-6 header-link-icon"
              Svg={true}
              Menuclass="main-header-dropdown dropdown-menu-end"
              Align="end"
            >
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                        <img
                          src={`${
                            process.env.NODE_ENV === "production"
                              ? basePath
                              : ""
                          }/assets/images/flags/us_flag.jpg`}
                          alt="img"
                        />
                      </span>
                      English
                    </div>
                  </div>
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/spain_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  español
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/french_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  français
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/uae_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  عربي
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/germany_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  Deutsch
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/china_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  中国人
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/italy_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  Italiano
                </Dropdown.Item>
              </li>
              <li>
                <Dropdown.Item className="d-flex align-items-center" href="#!">
                  <span className="avatar avatar-rounded avatar-xs lh-1 me-2">
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/flags/russia_flag.jpg`}
                      alt="img"
                    />
                  </span>
                  Русский
                </Dropdown.Item>
              </li>
            </SpkDropdown>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <li className="header-element header-theme-mode">
              {/* <!-- Start::header-link|layout-setting --> */}
              <Link
                href="#!"
                scroll={false}
                className="header-link layout-setting"
                onClick={() => toggledark()}
              >
                <span className="light-layout">
                  {/* <!-- Start::header-link-icon --> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 header-link-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                    />
                  </svg>
                  {/* <!-- End::header-link-icon --> */}
                </span>

                <span className="dark-layout">
                  {/* <!-- Start::header-link-icon --> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 header-link-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                    />
                  </svg>
                  {/* <!-- End::header-link-icon --> */}
                </span>
              </Link>
              {/* <!-- End::header-link|layout-setting --> */}
            </li>

            <SpkDropdown
              Customclass="header-element cart-dropdown"
              toggleas="a"
              Navigate="#!"
              Svg={true}
              Customtoggleclass="header-link dropdown-toggle no-caret"
              Badgetag={true}
              Badgeclass="header-icon-badge"
              Menuclass="main-header-dropdown dropdown-menu-start"
              Badgecolor="secondary"
              Badgeid="cart-icon-badge"
              Badgetext={remainingCount2}
              Badgepill={true}
              SvgClass="w-6 h-6 header-link-icon"
              Svgicon="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            >
              <div className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="mb-0 fs-15 fw-medium">
                    Cart Items
                    <SpkBadge
                      variant="primary2"
                      Customclass="text-fixed-white ms-1 fs-12 rounded-circle"
                      Id="cart-data"
                    >
                      {remainingCount2} {remainingCount2 !== 1 ? "" : ""}
                    </SpkBadge>
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-12 fw-medium text-muted">
                      Sub Total :{" "}
                    </span>
                    <h6 className="mb-0"> $740</h6>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <SimpleBar
                className="list-unstyled mb-0"
                id="header-cart-items-scroll"
              >
                {card.slice(0, maxDisplayItems).map((idx, index) => (
                  <li className="dropdown-item" key={index}>
                    {!card.includes(idx.id) && (
                      <div
                        className="d-flex align-items-center cart-dropdown-item gap-3"
                        key={Math.random()}
                      >
                        <div className="lh-1">
                          <span className="avatar avatar-xl bg-primary-transparent">
                            <img
                              src={`${
                                process.env.NODE_ENV === "production"
                                  ? basePath
                                  : ""
                              }${idx.productpicture}`}
                              alt="Wireless Headphones"
                            />
                          </span>
                        </div>
                        <div className="flex-fill">
                          <div className="d-flex align-items-center justify-content-between mb-0">
                            <div className="mb-0 fs-14 fw-medium">
                              <Link href="#!">{idx.title}</Link>
                              <div className="text-truncate">
                                <p className="mb-0 header-cart-text text-truncate fs-11 text-muted">
                                  {idx.data}
                                </p>
                                <h6 className="fw-medium mb-0 mt-1">
                                  <span className="text-success fw-normal me-1 fs-11 d-inline-block">
                                    (Qty : 1)
                                  </span>
                                  {idx.price}
                                </h6>
                              </div>
                            </div>
                            <div className="text-end">
                              <Link
                                href="#!"
                                onClick={(event) => handleDelete(idx.id, event)}
                                className="header-cart-remove dropdown-item-close"
                              >
                                <i className="ri-close-line"></i>
                              </Link>
                              <h6 className="fw-medium mb-0 mt-3">
                                <span className="text-info op-4 fw-normal me-1 fs-11 d-inline-block">
                                  Total :
                                </span>
                                {idx.discount}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </SimpleBar>
              <div
                className={`p-3 empty-header-item border-top d-flex gap-2 align-items-center ${
                  cartItemCount === 0 ? "d-none" : "d-block"
                }`}
              >
                <Link
                  href="#!"
                  className={`btn flex-fill btn-primary btn-wave ${
                    cartItemCount === 0 ? "d-none" : "d-block"
                  }`}
                >
                  Proceed to checkout
                </Link>
              </div>
              <div
                className={`p-5 empty-item ${
                  cartItemCount === 0 ? "d-block" : "d-none"
                }`}
              >
                <div className="text-center">
                  <span className="avatar avatar-xl avatar-rounded bg-primary-transparent">
                    <i className="ri-shopping-cart-2-line fs-2"></i>
                  </span>
                  <h6 className="fw-medium mb-1 mt-3">Your Cart is Empty</h6>
                  <span className="mb-3 fw-normal fs-13 d-block">
                    Add some items to make me happy :)
                  </span>
                  <Link
                    href="#!"
                    className="btn btn-primary1 btn-wave btn-sm m-1"
                    data-abc="true"
                  >
                    continue shopping <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
              {/* <!-- End::main-header-dropdown --> */}
            </SpkDropdown>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <SpkDropdown
              Togglevariant=""
              Customtoggleclass="header-link no-caret"
              Customclass="header-element notifications-dropdown d-xl-block d-none"
              Navigate="#!"
              Id="messageDropdown"
              Svg={true}
              SvgClass="w-6 h-6 header-link-icon"
              Badgetag={true}
              Badgecolor="primary2"
              Badgeclass="header-icon-pulse rounded pulse pulse-secondary custom-header-icon-pulse"
              Menuclass="main-header-dropdown dropdown-menu-start"
              Svgicon="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
            >
              <div className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="mb-0 fs-15 fw-medium">Notifications</p>
                  <SpkBadge
                    variant="secondary"
                    Customclass="text-fixed-white"
                    Id="notification-data"
                  >
                    {unreadCount} Unread
                  </SpkBadge>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <SimpleBar
                className="list-unstyled mb-0"
                id="header-notification-scroll"
              >
                {hasNotifications ? (
                  notifications.map((notification) => (
                    <li className="dropdown-item" key={notification.id}>
                      <div className="d-flex align-items-center">
                        <div className="pe-2 lh-1">{notification.src}</div>
                        <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                          <div>
                            <p className="mb-0 fw-medium">
                              <Link href="#!">{notification.heading}</Link>
                            </p>
                            {notification.data}
                            <div className="fw-normal fs-10 text-muted op-8">
                              {notification.data1}
                            </div>
                          </div>
                          <div>
                            <Link
                              href="#!"
                              scroll={false}
                              className="min-w-fit-content dropdown-item-close1"
                              onClick={() => handleRemove1(notification.id)}
                            >
                              <i className="ri-close-line"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="p-5 empty-item1">
                    <div className="text-center">
                      <span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
                        <i className="ri-notification-off-line fs-2"></i>
                      </span>
                      <h6 className="fw-medium mt-3">No New Notifications</h6>
                    </div>
                  </div>
                )}
              </SimpleBar>

              {hasNotifications && (
                <div className="p-3 empty-header-item1 border-top">
                  <div className="d-grid">
                    <Link href="#!" className="btn btn-primary btn-wave">
                      View All
                    </Link>
                  </div>
                </div>
              )}
              {/* </Dropdown.Menu> */}
            </SpkDropdown>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <li className="header-element header-fullscreen">
              {/* <!-- Start::header-link --> */}
              <Link
                href="#!"
                className="header-link"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 full-screen-close header-link-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 full-screen-open header-link-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                )}
              </Link>
              {/* <!-- End::header-link --> */}
            </li>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <SpkDropdown
              Customclass="header-element"
              toggleas="a"
              Navigate="#!"
              Customtoggleclass="header-link no-caret"
              Id="mainHeaderProfile"
              Imagetag={true}
              Imageclass="d-flex align-items-center avatar avatar-sm"
              Imagesrc={`${
                process.env.NODE_ENV === "production" ? basePath : ""
              }/assets/images/faces/15.jpg`}
              Menuclass="main-header-dropdown pt-0 overflow-hidden header-profile-dropdown dropdown-menu-start"
              Menulabel="mainHeaderProfile"
            >
              <Dropdown.Item className="text-center border-bottom">
                <div>
                  <span>Mr.Henry</span>
                  <span className="d-block fs-12 text-muted">
                    UI/UX Designer
                  </span>
                </div>
              </Dropdown.Item>
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center"
                  href="#!"
                >
                  <i className="fe fe-user p-1 rounded-circle bg-primary-transparent me-2 fs-16"></i>
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center"
                  href="#!"
                >
                  <i className="fe fe-mail p-1 rounded-circle bg-primary-transparent me-2 fs-16"></i>
                  Mail Inbox
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center"
                  href="#!"
                >
                  <i className="fe fe-database p-1 rounded-circle bg-primary-transparent klist me-2 fs-16"></i>
                  File Manger
                  <SpkBadge
                    variant="primary1"
                    Customclass="text-fixed-white ms-auto fs-9"
                  >
                    2
                  </SpkBadge>
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center"
                  href="#!"
                >
                  <i className="fe fe-settings p-1 rounded-circle bg-primary-transparent ings me-2 fs-16"></i>
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item dropdown-item d-flex align-items-center"
                  href="#!"
                >
                  <i className="fe fe-help-circle p-1 rounded-circle bg-primary-transparent set me-2 fs-16"></i>
                  Help
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center"
                  href="#!"
                >
                  <i className="fe fe-lock p-1 rounded-circle bg-primary-transparent ut me-2 fs-16"></i>
                  Log Out
                </Link>
              </li>
            </SpkDropdown>
            {/* <!-- End::header-element --> */}

            {/* <!-- Start::header-element --> */}
            <li className="header-element">
              {/* <!-- Start::header-link|switcher-icon --> */}
              <Link
                href="#!"
                scroll={false}
                className="header-link switcher-icon"
                data-bs-toggle="offcanvas"
                data-bs-target="#switcher-canvas"
                onClick={() => Switchericon()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 header-link-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </Link>
              {/* <!-- End::header-link|switcher-icon --> */}
            </li>
            {/* <!-- End::header-element --> */}
          </ul>
          {/* <!-- End::header-content-right --> */}
        </div>
        {/* <!-- End::main-header-container --> */}
      </header>
      <Modal
        show={show}
        onHide={handleClose}
        className="fade"
        id="header-responsive-search"
        tabIndex={-1}
        aria-labelledby="header-responsive-search"
      >
        <div className="modal-content">
          <Modal.Body>
            <div className="input-group">
              <Form.Control
                type="text"
                className="border-end-0"
                placeholder="Search Anything ..."
                aria-label="Search Anything ..."
                aria-describedby="button-addon2"
              />
              <SpkButton
                Buttonvariant="primary"
                Buttontype="button"
                Id="button-addon2"
              >
                <i className="bi bi-search"></i>
              </SpkButton>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  local_varaiable: state,
});
export default connect(mapStateToProps, { ThemeChanger })(Header);
