"use client";
import SpkProfilefriendscard from "@/shared/@spk-reusable-components/reusable-pages/spkprofilefriendscard";
import SpkBadge from "@/shared/@spk-reusable-components/reusable-uielements/spk-badge";
import SpkButton from "@/shared/@spk-reusable-components/reusable-uielements/spk-button";
import { Profilecarddata, Profilelist } from "@/shared/data/pages/profiledata";
import Pageheader from "@/shared/layouts-components/page-header/pageheader";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Card, Col, Dropdown, Form, Nav, Row, Tab } from "react-bootstrap";
import Seo from "@/shared/layouts-components/seo/seo";
const CreatableSelect = dynamic(() => import("react-select/creatable"), {
  ssr: false,
});

const ProfileComponent = () => {
  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label) => ({
    label,
    value: label,
  });

  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState([
    createOption("Leadership"),
    createOption("Project Management"),
    createOption("Data Analysis"),
    createOption("Marketing Strategy"),
    createOption("Graphic Design"),
    createOption("Content Creation"),
    createOption("Market Research"),
    createOption("Client Relations"),
    createOption("Event Planning"),
    createOption("Budgeting and Finance"),
    createOption("Negotiation Skills"),
    createOption("Team Collaboration"),
    createOption("Adaptability"),
  ]);
  const handleKeyDown = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setValue((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
    }
  };
  const [isSearchable] = useState(true);

  return (
    <Fragment>
      {/* <!-- Page Header --> */}
      <Seo title="Pages-Profile" />

      <Pageheader title="Pages" currentpage="Profile" activepage="Profile" />

      {/* <!-- Page Header Close --> */}

      {/* <!-- Start:: row-1 --> */}
      <Row>
        <Col xl={12}>
          <Card className="custom-card profile-card">
            <div className="profile-banner-img">
              <img
                src="../../assets/images/media/media-3.jpg"
                className="card-img-top"
                alt="..."
              />
            </div>
            <Card.Body className=" pb-0 position-relative">
              <div className="row profile-content">
                <Col xl={3}>
                  <Card className="custom-card overflow-hidden border">
                    <Card.Body className=" border-bottom border-block-end-dashed">
                      <div className="text-center">
                        <span className="avatar avatar-xxl avatar-rounded online mb-3">
                          <img src="../../assets/images/faces/11.jpg" alt="" />
                        </span>
                        <h5 className="fw-semibold mb-1">Spencer Robin</h5>
                        <span className="d-block fw-medium text-muted mb-2">
                          Software Development Manager
                        </span>
                        <p className="fs-12 mb-0 text-muted">
                          {" "}
                          <span className="me-3">
                            <i className="ri-building-line me-1 align-middle"></i>
                            Hamburg
                          </span>{" "}
                          <span>
                            <i className="ri-map-pin-line me-1 align-middle"></i>
                            Germany
                          </span>{" "}
                        </p>
                      </div>
                    </Card.Body>
                    <div className="d-flex mb-0 flex-wrap gap-3 p-3 border-bottom border-block-end-dashed">
                      <div className="border-dashed rounded text-center flex-fill">
                        <div className="main-card-icon mb-2 primary1">
                          <div className="avatar avatar-sm bg-primary1">
                            <i className="fs-15 ti ti-user-check"></i>
                          </div>
                        </div>
                        <div className="d-flex gap-2 justify-content-center align-items-end">
                          <p className="fw-semibold fs-20 mb-0">15k</p>
                          <p className="mb-1 text-muted">Followers</p>
                        </div>
                      </div>
                      <div className="border-dashed rounded text-center flex-fill">
                        <div className="main-card-icon mb-2 secondary">
                          <div className="avatar avatar-sm bg-secondary">
                            <i className="fs-15 ti ti-user-plus"></i>
                          </div>
                        </div>
                        <div className="d-flex gap-2 justify-content-center align-items-end">
                          <p className="fw-semibold fs-20 mb-0">241</p>
                          <p className="mb-1 text-muted">Following</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pb-1 d-flex flex-wrap justify-content-between">
                      <div className="fw-medium fs-15 text-primary1">
                        Basic Info :
                      </div>
                    </div>
                    <Card.Body className=" border-bottom border-block-end-dashed p-0">
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item pt-2 border-0">
                          <div>
                            <span className="fw-medium me-2 mx-1">Name :</span>
                            <span className="text-muted">Spencer Robin</span>
                          </div>
                        </li>
                        <li className="list-group-item pt-2 border-0">
                          <div>
                            <span className="fw-medium me-2 mx-1">
                              Designation :
                            </span>
                            <span className="text-muted">
                              Software Development Manager
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item pt-2 border-0">
                          <div>
                            <span className="fw-medium me-2 mx-1">Email :</span>
                            <span className="text-muted">
                              spencer.robin22@example.com
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item pt-2 border-0">
                          <div>
                            <span className="fw-medium me-2 mx-1">Phone :</span>
                            <span className="text-muted">
                              +1 (222) 111 - 57840
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item pt-2 border-0">
                          <div>
                            <span className="fw-medium me-2 mx-1">
                              Experience :
                            </span>
                            <span className="text-muted">10 Years</span>
                          </div>
                        </li>
                        <li className="list-group-item pt-2 border-0">
                          <div>
                            <span className="fw-medium me-2 mx-1">Age :</span>
                            <span className="text-muted">28</span>
                          </div>
                        </li>
                      </ul>
                    </Card.Body>
                    <div className="p-3 pb-1 d-flex flex-wrap justify-content-between">
                      <div className="fw-medium fs-15 text-primary1">
                        Followers :
                      </div>
                      <Link
                        scroll={false}
                        href="#!"
                        className="fs-12 text-muted"
                      >
                        {" "}
                        View All
                        <i className="ti ti-arrow-narrow-right ms-1 d-inline-block"></i>{" "}
                      </Link>
                    </div>
                    <Card.Body className=" p-0">
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item border-0 py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="lh-1">
                              <span className="avatar avatar-sm avatar-rounded">
                                <img
                                  src="../../assets/images/faces/1.jpg"
                                  alt=""
                                />
                              </span>
                            </div>
                            <div className="flex-fill">
                              <span className="fw-medium">Iliana Lilly</span>
                            </div>
                            <div>
                              <SpkButton
                                Buttonvariant="primary-light"
                                Size="sm"
                                Customclass="btn-icon"
                              >
                                {" "}
                                <i className="ri-add-line lh-1 align-middle"></i>{" "}
                              </SpkButton>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item border-0 py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="lh-1">
                              <span className="avatar avatar-sm avatar-rounded">
                                <img
                                  src="../../assets/images/faces/14.jpg"
                                  alt=""
                                />
                              </span>
                            </div>
                            <div className="flex-fill">
                              <span className="fw-medium">Charlie Edson</span>
                            </div>
                            <div>
                              <SpkButton
                                Buttonvariant="primary-light"
                                Size="sm"
                                Customclass="btn-icon"
                              >
                                {" "}
                                <i className="ri-add-line lh-1 align-middle"></i>{" "}
                              </SpkButton>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item border-0 py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="lh-1">
                              <span className="avatar avatar-sm avatar-rounded">
                                <img
                                  src="../../assets/images/faces/3.jpg"
                                  alt=""
                                />
                              </span>
                            </div>
                            <div className="flex-fill">
                              <span className="fw-medium">Aurora Reed</span>
                            </div>
                            <div>
                              <SpkButton
                                Buttonvariant="primary-light"
                                Size="sm"
                                Customclass="btn-icon"
                              >
                                {" "}
                                <i className="ri-add-line lh-1 align-middle"></i>{" "}
                              </SpkButton>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item border-0 py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="lh-1">
                              <span className="avatar avatar-sm avatar-rounded">
                                <img
                                  src="../../assets/images/faces/10.jpg"
                                  alt=""
                                />
                              </span>
                            </div>
                            <div className="flex-fill">
                              <span className="fw-medium">Spencer Robin</span>
                            </div>
                            <div>
                              <SpkButton
                                Buttonvariant="primary-light"
                                Size="sm"
                                Customclass="btn-icon"
                              >
                                {" "}
                                <i className="ri-add-line lh-1 align-middle"></i>{" "}
                              </SpkButton>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xl={9}>
                  <Card className="custom-card overflow-hidden border">
                    <Card.Body className="">
                      <Tab.Container defaultActiveKey="about">
                        <Nav
                          className="nav-tabs tab-style-6 mb-3 p-0"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item className="" role="presentation">
                            <Nav.Link
                              eventKey="about"
                              className="w-100 text-start"
                              id="profile-about-tab"
                              data-bs-toggle="tab"
                              data-bs-target="#profile-about-tab-pane"
                              type="button"
                              role="tab"
                              aria-controls="profile-about-tab-pane"
                              aria-selected="true"
                            >
                              About
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item className="" role="presentation">
                            <Nav.Link
                              eventKey="edit"
                              className="w-100 text-start"
                              id="edit-profile-tab"
                              data-bs-toggle="tab"
                              data-bs-target="#edit-profile-tab-pane"
                              type="button"
                              role="tab"
                              aria-controls="edit-profile-tab-pane"
                              aria-selected="true"
                            >
                              Edit Profile
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item className="" role="presentation">
                            <Nav.Link
                              eventKey="timeline"
                              className="w-100 text-start"
                              id="timeline-tab"
                              data-bs-toggle="tab"
                              data-bs-target="#timeline-tab-pane"
                              type="button"
                              role="tab"
                              aria-controls="timeline-tab-pane"
                              aria-selected="false"
                            >
                              Timeline
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item className="" role="presentation">
                            <Nav.Link
                              eventKey="gallery"
                              className="w-100 text-start"
                              id="gallery-tab"
                              data-bs-toggle="tab"
                              data-bs-target="#gallery-tab-pane"
                              type="button"
                              role="tab"
                              aria-controls="gallery-tab-pane"
                              aria-selected="false"
                            >
                              Gallery
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item className="" role="presentation">
                            <Nav.Link
                              eventKey="friends"
                              className="w-100 text-start"
                              id="friends-tab"
                              data-bs-toggle="tab"
                              data-bs-target="#friends-tab-pane"
                              type="button"
                              role="tab"
                              aria-controls="friends-tab-pane"
                              aria-selected="false"
                            >
                              Friends
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                        <Tab.Content id="profile-tabs">
                          <Tab.Pane
                            eventKey="about"
                            className="p-0 border-0"
                            id="profile-about-tab-pane"
                            role="tabpanel"
                            aria-labelledby="profile-about-tab"
                            tabIndex={0}
                          >
                            <ul className="list-group list-group-flush border rounded-3">
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  <span className="me-1">&#10024;</span>About
                                  Info :
                                </span>
                                <p className="text-muted mb-2">
                                  Hello, I'm [Your Name], a dedicated [Your
                                  Profession/Interest] based in [Your Location].
                                  I have a genuine passion for [Your
                                  Hobbies/Interests] and enjoy delving into the
                                  nuances of [Your Industry/Field].
                                </p>
                                <p className="text-muted mb-0">
                                  Specializing in [Your Specialization/Area of
                                  Expertise], I strive to infuse innovation into
                                  every project I undertake. With a track record
                                  of [Key Achievements] and valuable
                                  experiences, I'm committed to continual growth
                                  and eagerly anticipate the opportunities that
                                  lie ahead.
                                </p>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  Contact Info :
                                </span>
                                <div className="text-muted">
                                  <p className="mb-3">
                                    <span className="avatar avatar-sm avatar-rounded text-primary p-1 bg-primary-transparent me-2">
                                      <i className="ri-mail-line align-middle fs-15"></i>
                                    </span>
                                    <span className="fw-medium text-default">
                                      Email :{" "}
                                    </span>{" "}
                                    spencer.robin22@example.com
                                  </p>
                                  <p className="mb-3">
                                    <span className="avatar avatar-sm avatar-rounded text-primary1 p-1 bg-primary1-transparent me-2">
                                      <i className="ri-map-pin-line align-middle fs-15"></i>
                                    </span>
                                    <span className="fw-medium text-default">
                                      Website :{" "}
                                    </span>{" "}
                                    www.yourwebsite.com
                                  </p>
                                  <p className="mb-3">
                                    <span className="avatar avatar-sm avatar-rounded text-primary2 p-1 bg-primary2-transparent me-2">
                                      <i className="ri-building-line align-middle fs-15"></i>
                                    </span>
                                    <span className="fw-medium text-default">
                                      Location :{" "}
                                    </span>{" "}
                                    City, Country
                                  </p>
                                  <p className="mb-0">
                                    <span className="avatar avatar-sm avatar-rounded text-primary3 p-1 bg-primary3-transparent me-2">
                                      <i className="ri-phone-line align-middle fs-15"></i>
                                    </span>
                                    <span className="fw-medium text-default">
                                      Phone :{" "}
                                    </span>{" "}
                                    +1 (222) 111 - 57840
                                  </p>
                                </div>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  Skills :
                                </span>
                                <div className="w-75">
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Leadership
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Project Management
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Technical Proficiency
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Communication
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Team Building
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Problem-Solving
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Strategic Thinking
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Decision Making
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Adaptability
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Stakeholder Management
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Conflict Resolution
                                    </SpkBadge>
                                  </Link>
                                  <Link scroll={false} href="#!">
                                    <SpkBadge
                                      variant="light"
                                      Customclass="text-muted m-1 border"
                                    >
                                      Continuous Improvement
                                    </SpkBadge>
                                  </Link>
                                </div>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  Social Media :
                                </span>
                                <div className="d-flex align-items-center gap-5 flex-wrap">
                                  <div className="d-flex align-items-center gap-3 me-2">
                                    <div>
                                      <span className="avatar avatar-md bg-primary">
                                        <i className="ri-github-line fs-16"></i>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="d-block fw-medium text-primay">
                                        Github
                                      </span>
                                      <span className="text-muted fw-medium">
                                        github.com/spruko
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center gap-3 me-2">
                                    <div>
                                      <span className="avatar avatar-md bg-primary1">
                                        <i className="ri-twitter-x-line fs-16"></i>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="d-block fw-medium text-primay1">
                                        Twitter
                                      </span>
                                      <span className="text-muted fw-medium">
                                        twitter.com /spruko.me
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center gap-3 me-2">
                                    <div>
                                      <span className="avatar avatar-md bg-primary2">
                                        <i className="ri-linkedin-line fs-16"></i>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="d-block fw-medium text-primay2">
                                        Linkedin
                                      </span>
                                      <span className="text-muted fw-medium">
                                        linkedin.com /in/spruko
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center gap-3">
                                    <div>
                                      <span className="avatar avatar-md bg-primary3">
                                        <i className="ri-briefcase-line fs-16"></i>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="d-block fw-medium text-primay3">
                                        My Portfolio
                                      </span>
                                      <span className="text-muted fw-medium">
                                        spruko.com/
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </Tab.Pane>
                          <Tab.Pane
                            eventKey="edit"
                            className="p-0 border-0"
                            id="edit-profile-tab-pane"
                            role="tabpanel"
                            aria-labelledby="edit-profile-tab"
                            tabIndex={0}
                          >
                            <ul className="list-group list-group-flush border rounded-3">
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  Personal Info :
                                </span>
                                <div className="row gy-3 align-items-center">
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        User Name :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="Spencer Robin"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        First Name :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="Spencer"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Last Name :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="Robin"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Designation :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="Software Development Manager"
                                    />
                                  </Col>
                                </div>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  Contact Info :
                                </span>
                                <div className="row gy-3 align-items-center">
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">Email :</span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="email"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="spencer.robin22@example.com"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">Phone :</span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="+1 (222) 111 - 57840"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Website :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="www.yourwebsite.com"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Location :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="City, Country"
                                    />
                                  </Col>
                                </div>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  Social Info :
                                </span>
                                <div className="row gy-3 align-items-center">
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Github :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="github.com/spruko"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Twitter :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="twitter.com/spruko.me"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Linkedin :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="linkedin.com/in/spruko"
                                    />
                                  </Col>
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Portfolio :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Placeholder"
                                      defaultValue="spruko.com/"
                                    />
                                  </Col>
                                </div>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  About Info :
                                </span>
                                <div className="row gy-3 align-items-center">
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        Biographical Info :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <Form.Control
                                      as="textarea"
                                      className="form-control"
                                      id="text-area"
                                      defaultValue="Hello, I'm [Your Name], a dedicated [Your Profession/Interest] based in [Your Location]. I have a genuine passion for [Your Hobbies/Interests] and enjoy delving into the nuances of [Your Industry/Field].
Specializing in [Your Specialization/Area of Expertise], I strive to infuse innovation into every project I undertake. With a track record of [Key Achievements] and valuable experiences, I'm committed to continual growth and eagerly anticipate the opportunities that lie ahead."
                                    />
                                  </Col>
                                </div>
                              </li>
                              <li className="list-group-item p-3">
                                <span className="fw-medium fs-15 d-block mb-3">
                                  SKILLS :
                                </span>
                                <div className="row gy-3 align-items-center">
                                  <Col xl={3}>
                                    <div className="lh-1">
                                      <span className="fw-medium">
                                        skills :
                                      </span>
                                    </div>
                                  </Col>
                                  <Col xl={9}>
                                    <CreatableSelect
                                      components={components}
                                      classNamePrefix="react-select"
                                      inputValue={inputValue}
                                      isClearable
                                      isMulti
                                      menuIsOpen={false}
                                      onChange={(newValue) => {
                                        // Ensure newValue is an array (or empty array) of objects
                                        if (Array.isArray(newValue)) {
                                          setValue(newValue);
                                        } else {
                                          // Handle the case when newValue is not an array
                                          setValue([]);
                                        }
                                      }}
                                      onInputChange={(newValue) =>
                                        setInputValue(newValue)
                                      }
                                      onKeyDown={handleKeyDown}
                                      placeholder="Type something and press enter..."
                                      value={value}
                                    />
                                  </Col>
                                </div>
                              </li>
                            </ul>
                          </Tab.Pane>
                          <Tab.Pane
                            eventKey="timeline"
                            className=""
                            id="timeline-tab-pane"
                            role="tabpanel"
                            aria-labelledby="timeline-tab"
                            tabIndex={0}
                          >
                            <ul className="list-unstyled profile-timeline">
                              <li>
                                <div>
                                  <span className="avatar avatar-sm bg-primary-transparent avatar-rounded profile-timeline-avatar">
                                    <img
                                      src="../../assets/images/faces/3.jpg"
                                      alt=""
                                    />
                                  </span>
                                  <div className="d-flex gap-2 flex-wrap mb-2">
                                    <p className="mb-0">
                                      <span className="fw-semibold">
                                        Photos{" "}
                                      </span>
                                      from their recent vacation and writes a
                                      caption describing their experience..
                                    </p>
                                    <span className="text-end ms-auto fs-11 text-muted">
                                      15,May 2024 - 18:47
                                    </span>
                                  </div>
                                  <p className="profile-activity-media mb-0">
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-17.jpg"
                                        alt=""
                                      />
                                    </Link>
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-18.jpg"
                                        alt=""
                                      />
                                    </Link>
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-19.jpg"
                                        alt=""
                                      />
                                    </Link>
                                  </p>
                                  <div className="d-flex align-items-end justify-content-between gap-2 flex-wrap mt-2">
                                    <div>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Leadership
                                        </SpkBadge>
                                      </Link>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Solving
                                        </SpkBadge>
                                      </Link>
                                    </div>
                                    <div className="btn-list text-end">
                                      <SpkButton
                                        Buttonvariant="primary-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-message-3-line"></i> 4
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-thumb-up-line"></i> 2
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary2-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-heart-line"></i> 3
                                      </SpkButton>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div>
                                  <span className="avatar avatar-sm avatar-rounded profile-timeline-avatar">
                                    <img
                                      src="../../assets/images/faces/11.jpg"
                                      alt=""
                                    />
                                  </span>
                                  <div className="d-flex gap-2 flex-wrap mb-2">
                                    <p className="mb-0">
                                      Friend comments on the post, expressing
                                      admiration for the picturesque location a.{" "}
                                      <span className="text-primary fw-medium text-decoration-underline">
                                        #Trip-photos
                                      </span>
                                      .
                                    </p>
                                    <span className="text-end ms-auto fs-11 text-muted">
                                      18,Dec 2024 - 12:16
                                    </span>
                                  </div>
                                  <p className="text-muted mb-0">
                                    Asking about the user's favorite part of the
                                    trip. emporibus inventore ullam tempora
                                    eligendi libero sequi dignissimos cumque, et
                                    a sint tenetur consequatur omnis!
                                  </p>
                                  <div className="d-flex align-items-end justify-content-between gap-2 flex-wrap mt-2">
                                    <div>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Leadership
                                        </SpkBadge>
                                      </Link>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Solving
                                        </SpkBadge>
                                      </Link>
                                    </div>
                                    <div className="btn-list text-end">
                                      <SpkButton
                                        Buttonvariant="primary-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-message-3-line"></i> 4
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-thumb-up-line"></i> 2
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary2-light"
                                        Size="sm"
                                        Customclass=" waves-effect waves-light"
                                      >
                                        <i className="ri-heart-line"></i> 3
                                      </SpkButton>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div>
                                  <span className="avatar avatar-sm avatar-rounded profile-timeline-avatar">
                                    <img
                                      src="../../assets/images/faces/4.jpg"
                                      alt=""
                                    />
                                  </span>
                                  <div className="d-flex gap-2 flex-wrap mb-2">
                                    <p className="text-muted mb-0">
                                      <span className="text-default">
                                        <span className="text-primary1 fw-medium">
                                          Varun Sonu{" "}
                                        </span>{" "}
                                        asking for recommendations on places to
                                        visit in the vacation destination
                                      </span>
                                      .
                                    </p>
                                    <span className="text-end ms-auto fs-11 text-muted">
                                      26,May 2024 - 12:45
                                    </span>
                                  </div>
                                  <p className="profile-activity-media mb-0">
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/file-manager/3.png"
                                        alt=""
                                      />
                                    </Link>
                                    <span className="fs-11 text-muted">
                                      432.87KB
                                    </span>
                                  </p>
                                  <div className="d-flex align-items-end justify-content-between gap-2 flex-wrap mt-2">
                                    <div>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Leadership
                                        </SpkBadge>
                                      </Link>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Solving
                                        </SpkBadge>
                                      </Link>
                                    </div>
                                    <div className="btn-list text-end">
                                      <SpkButton
                                        Buttonvariant="primary-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-message-3-line"></i> 4
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-thumb-up-line"></i> 2
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary2-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-heart-line"></i> 3
                                      </SpkButton>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div>
                                  <span className="avatar avatar-sm bg-success avatar-rounded profile-timeline-avatar">
                                    K
                                  </span>
                                  <div className="d-flex gap-2 flex-wrap mb-2">
                                    <p className="text-muted mb-0">
                                      <span className="text-default">
                                        On a trending news topic, offering their
                                        perspective and engaging with other
                                        group members'{" "}
                                        <span className="text-primary2 fw-medium text-decoration-underline">
                                          #viewpoints
                                        </span>
                                      </span>
                                      .
                                    </p>
                                    <span className="text-end ms-auto fs-11 text-muted">
                                      28,May 2024 - 22:09
                                    </span>
                                  </div>
                                  <p className="profile-activity-media mb-2">
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-75.jpg"
                                        alt=""
                                      />
                                    </Link>
                                  </p>
                                  <div className="d-flex align-items-end justify-content-between gap-2 flex-wrap mt-2">
                                    <div>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Leadership
                                        </SpkBadge>
                                      </Link>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Solving
                                        </SpkBadge>
                                      </Link>
                                    </div>
                                    <div className="btn-list text-end">
                                      <SpkButton
                                        Buttonvariant="primary-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-message-3-line"></i> 4
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-thumb-up-line"></i> 2
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary2-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-heart-line"></i> 3
                                      </SpkButton>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div>
                                  <span className="avatar avatar-sm avatar-rounded profile-timeline-avatar">
                                    <img
                                      src="../../assets/images/faces/5.jpg"
                                      alt=""
                                    />
                                  </span>
                                  <div className="d-flex gap-2 flex-wrap mb-1">
                                    <p className="text-muted mb-0">
                                      <span className="text-default">
                                        Reminiscing about a memorable trip they
                                        took together and suggesting planning
                                        another adventure soon.{" "}
                                        <span className="fw-semibold text-primary3 text-decoration-underline">
                                          #Europe
                                        </span>{" "}
                                        trip was a landmark in our lifes!
                                      </span>
                                      .
                                    </p>
                                    <span className="text-end ms-auto fs-11 text-muted">
                                      29,May 2024 - 16:42
                                    </span>
                                  </div>
                                  <p className="text-muted">
                                    "Every time, our Europe trip still lies
                                    vividly before our eyes."
                                  </p>
                                  <p className="profile-activity-media mb-0">
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-59.jpg"
                                        className="m-1"
                                        alt=""
                                      />
                                    </Link>
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-60.jpg"
                                        className="m-1"
                                        alt=""
                                      />
                                    </Link>
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-61.jpg"
                                        className="m-1"
                                        alt=""
                                      />
                                    </Link>
                                  </p>
                                  <div className="d-flex align-items-end justify-content-between gap-2 flex-wrap mt-2">
                                    <div>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Leadership
                                        </SpkBadge>
                                      </Link>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Solving
                                        </SpkBadge>
                                      </Link>
                                    </div>
                                    <div className="btn-list text-end">
                                      <SpkButton
                                        Buttonvariant="primary-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-message-3-line"></i> 4
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-thumb-up-line"></i> 2
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary2-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-heart-line"></i> 3
                                      </SpkButton>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              <li>
                                <div>
                                  <span className="avatar avatar-sm avatar-rounded profile-timeline-avatar">
                                    <img
                                      src="../../assets/images/media/media-39.jpg"
                                      alt=""
                                    />
                                  </span>
                                  <div className="d-flex gap-2 flex-wrap mb-1">
                                    <p className="mb-1">
                                      <span className="fw-semibold text-primary2">
                                        Invitation
                                      </span>{" "}
                                      to a virtual networking event from a
                                      professional connection, expressing
                                      interest and RSVPing for attendance.
                                    </p>
                                    <span className="text-end ms-auto fs-11 text-muted">
                                      06,Jun 2024 - 08:40
                                    </span>
                                  </div>
                                  <p className="profile-activity-media mb-0">
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-26.jpg"
                                        alt=""
                                      />
                                    </Link>
                                    <Link scroll={false} href="#!">
                                      <img
                                        src="../../assets/images/media/media-29.jpg"
                                        alt=""
                                      />
                                    </Link>
                                  </p>
                                  <div className="d-flex align-items-end justify-content-between gap-2 flex-wrap mt-2">
                                    <div>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Leadership
                                        </SpkBadge>
                                      </Link>
                                      <Link scroll={false} href="#!">
                                        <SpkBadge
                                          variant="light"
                                          Customclass="text-muted m-1 border"
                                        >
                                          #Solving
                                        </SpkBadge>
                                      </Link>
                                    </div>
                                    <div className="btn-list text-end">
                                      <SpkButton
                                        Buttonvariant="primary-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-message-3-line"></i> 4
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-thumb-up-line"></i> 2
                                      </SpkButton>
                                      <SpkButton
                                        Buttonvariant="primary1-light"
                                        Size="sm"
                                        Customclass="waves-effect waves-light"
                                      >
                                        <i className="ri-heart-line"></i> 3
                                      </SpkButton>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </Tab.Pane>
                          <Tab.Pane
                            eventKey="gallery"
                            className="p-0 border-0"
                            id="gallery-tab-pane"
                            role="tabpanel"
                            aria-labelledby="gallery-tab"
                            tabIndex={0}
                          >
                            <Profilelist />
                          </Tab.Pane>
                          <Tab.Pane
                            eventKey="friends"
                            className="p-0 border-0"
                            id="friends-tab-pane"
                            role="tabpanel"
                            aria-labelledby="friends-tab"
                            tabIndex={0}
                          >
                            <Row>
                              {Profilecarddata.map((idx) => (
                                <Col
                                  xxl={4}
                                  xl={4}
                                  lg={6}
                                  md={6}
                                  sm={12}
                                  className=""
                                  key={Math.random()}
                                >
                                  <SpkProfilefriendscard
                                    Navigate="#!"
                                    Imgsrc={idx.src}
                                    Name={idx.name}
                                    Mail={idx.mail}
                                    Color={idx.color}
                                    Role={idx.role}
                                  />
                                </Col>
                              ))}
                              <Col xl={12}>
                                <div className="text-center">
                                  <SpkButton Buttonvariant="primary-light">
                                    Show All
                                  </SpkButton>
                                </div>
                              </Col>
                            </Row>
                          </Tab.Pane>
                        </Tab.Content>
                      </Tab.Container>
                    </Card.Body>
                  </Card>
                </Col>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* <!-- End:: row-1 --> */}
    </Fragment>
  );
};

export default ProfileComponent;
