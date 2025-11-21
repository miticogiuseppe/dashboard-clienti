"use client";
const SpkSelect = dynamic(
  () =>
    import(
      "../../../../shared/@spk-reusable-components/reusable-plugins/spk-reactselect"
    ),
  { ssr: false }
);

import SpkButton from "../../../../shared/@spk-reusable-components/reusable-uielements/spk-button";
import Pageheader from "../../../../shared/layouts-components/page-header/pageheader";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Card, Col, Form, Nav, Tab } from "react-bootstrap";
import Seo from "../../../../shared/layouts-components/seo/seo";

const ProfileSettings = () => {
  const [success1, setsuccess1] = useState("on");
  const [success2, setsuccess2] = useState("off");
  const [success3, setsuccess3] = useState("off");
  const [success4, setsuccess4] = useState("on");

  const Languagedata = [
    { value: "Arabic", label: "Arabic" },
    { value: "Korean", label: "Korean" },
    { value: "Us English", label: "Us English" },
    { value: "Hindi", label: "Hindi" },
  ];

  return (
    <Fragment>
      {/* <!-- Page Header --> */}
      <Seo title="Pages-Profilesettings" />

      <Pageheader
        title="Pages"
        currentpage="Profile Settings"
        activepage="Profile Settings"
      />

      {/* <!-- Page Header Close --> */}

      {/* <!-- Start::row-1 --> */}
      <div className="row gap-3 justify-content-center">
        <Col xl={9}>
          <Card className="custom-card">
            <Tab.Container defaultActiveKey="account">
              <Nav
                className="nav-tabs tab-style-8 scaleX rounded m-3 profile-settings-tab gap-2"
                id="myTab4"
                role="tablist"
              >
                <Nav.Item className=" me-1" role="presentation">
                  <Nav.Link
                    eventKey="account"
                    className="px-4 bg-primary-transparent"
                    id="account"
                    data-bs-toggle="tab"
                    data-bs-target="#account-pane"
                    type="button"
                    role="tab"
                    aria-controls="account-pane"
                    aria-selected="true"
                  >
                    Account
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className=" me-1" role="presentation">
                  <Nav.Link
                    eventKey="notification"
                    className="px-4 bg-primary-transparent"
                    id="notification-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#notification-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="notification-tab-pane"
                    aria-selected="false"
                  >
                    Notification
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="" role="presentation">
                  <Nav.Link
                    eventKey="security"
                    className="px-4 bg-primary-transparent"
                    id="security-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#security-tab-pane"
                    type="button"
                    role="tab"
                    aria-controls="security-tab-pane"
                    aria-selected="false"
                    tabIndex={-1}
                  >
                    Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className="p-3 border-bottom border-top border-block-end-dashed">
                <Tab.Pane
                  eventKey="account"
                  className="overflow-hidden p-0 border-0"
                  id="account-pane"
                  role="tabpanel"
                  aria-labelledby="account"
                  tabIndex={0}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-1">
                    <div className="fw-semibold d-block fs-15">
                      Account Settings :
                    </div>
                    <div className="btn btn-primary btn-sm">
                      <i className="ri-loop-left-line lh-1 me-2"></i>Restore
                      Changes
                    </div>
                  </div>
                  <div className="row gy-3">
                    <Col xl={12}>
                      <div className="d-flex align-items-start flex-wrap gap-3">
                        <div>
                          <span className="avatar avatar-xxl">
                            <img src="../../assets/images/faces/9.jpg" alt="" />
                          </span>
                        </div>
                        <div>
                          <span className="fw-medium d-block mb-2">
                            Profile Picture
                          </span>
                          <div className="btn-list mb-1">
                            <SpkButton Buttonvariant="primary" Size="sm">
                              <i className="ri-upload-2-line me-1"></i>Change
                              Image
                            </SpkButton>
                            <SpkButton Buttonvariant="primary1-light" Size="sm">
                              <i className="ri-delete-bin-line me-1"></i>Remove
                            </SpkButton>
                          </div>
                          <span className="d-block fs-12 text-muted">
                            Use JPEG, PNG, or GIF. Best size: 200x200 pixels.
                            Keep it under 5MB
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col xl={6}>
                      <Form.Label htmlFor="profile-user-name" className="">
                        User Name :
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className=""
                        id="profile-user-name"
                        defaultValue=""
                        placeholder="Enter Name"
                      />
                    </Col>
                    <Col xl={6}>
                      <Form.Label htmlFor="profile-email" className="">
                        Email :
                      </Form.Label>
                      <Form.Control
                        type="email"
                        className=""
                        id="profile-email"
                        defaultValue=""
                        placeholder="Enter Email"
                      />
                    </Col>
                    <Col xl={6}>
                      <Form.Label htmlFor="profile-designation" className="">
                        Designation :
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className=""
                        id="profile-designation"
                        defaultValue=""
                        placeholder="Enter Designation"
                      />
                    </Col>
                    <Col xl={6}>
                      <Form.Label htmlFor="profile-language" className="">
                        Language :
                      </Form.Label>
                      <SpkSelect
                        searchable
                        name="colors"
                        option={Languagedata}
                        menuplacement="auto"
                        classNameprefix="Select2"
                        defaultvalue={[Languagedata[2]]}
                      />
                    </Col>
                    <Col xl={6}>
                      <Form.Label htmlFor="profile-phn-no" className="">
                        Phone No :
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className=""
                        id="profile-phn-no"
                        defaultValue=""
                        placeholder="Enter Number"
                      />
                    </Col>
                    <Col xl={6}>
                      <Form.Label htmlFor="website" className="">
                        Website :
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className=" bg-light"
                        id="website"
                        placeholder="https://"
                        defaultValue="https://www.website.com"
                      />
                    </Col>
                    <Col xl={12}>
                      <Form.Label htmlFor="profile-address" className="">
                        Address :
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        defaultValue=""
                        className=""
                        id="profile-address"
                        rows={3}
                        placeholder="Address"
                      />
                    </Col>
                  </div>
                </Tab.Pane>
                <Tab.Pane
                  eventKey="notification"
                  className="overflow-hidden p-0 border-0"
                  id="notification-tab-pane"
                  role="tabpanel"
                  aria-labelledby="notification-tab"
                  tabIndex={0}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-1">
                    <div className="fw-semibold d-block fs-15">
                      Notifications Settings:
                    </div>
                    <div className="btn btn-primary btn-sm">
                      <i className="ri-loop-left-line lh-1 me-2"></i>Restore
                      Changes
                    </div>
                  </div>
                  <div className="row gx-5 gy-3">
                    <Col xl={12}>
                      <p className="fs-14 mb-1 fw-medium">
                        Configure Notifications
                      </p>
                      <p className="fs-12 mb-0 text-muted">
                        Users can tailor their experience to receive alerts for
                        the types of events that matter to them.
                      </p>
                    </Col>
                    <Col xl={12}>
                      <div className="d-flex align-items-top justify-content-between mt-3">
                        <div className="mail-notification-settings">
                          <p className="fs-14 mb-1 fw-medium">
                            Push Notifications
                          </p>
                          <p className="fs-12 mb-0 text-muted">
                            Alerts sent to the user's mobile device or desktop.
                          </p>
                        </div>
                        <div
                          className={`toggle mb-0 float-sm-end  toggle-success ${success1}`}
                          onClick={() => {
                            success1 == "on"
                              ? setsuccess1("off")
                              : setsuccess1("on");
                          }}
                        >
                          <span></span>
                        </div>
                      </div>
                      <div className="d-flex align-items-top justify-content-between mt-3">
                        <div className="mail-notification-settings">
                          <p className="fs-14 mb-1 fw-medium">
                            Email Notifications
                          </p>
                          <p className="fs-12 mb-0 text-muted">
                            Messages sent to the user's email address.
                          </p>
                        </div>
                        <div
                          className={`toggle mb-0 float-sm-end  toggle-success ${success2}`}
                          onClick={() => {
                            success2 == "on"
                              ? setsuccess2("off")
                              : setsuccess2("on");
                          }}
                        >
                          <span></span>
                        </div>
                      </div>
                      <div className="d-flex align-items-top justify-content-between mt-3">
                        <div className="mail-notification-settings">
                          <p className="fs-14 mb-1 fw-medium">
                            In-App Notifications
                          </p>
                          <p className="fs-12 mb-0 text-muted">
                            Alerts that appear within the application interface.
                          </p>
                        </div>
                        <div
                          className={`toggle mb-0 float-sm-end  toggle-success ${success3}`}
                          onClick={() => {
                            success3 == "on"
                              ? setsuccess3("off")
                              : setsuccess3("on");
                          }}
                        >
                          <span></span>
                        </div>
                      </div>
                      <div className="d-flex align-items-top justify-content-between mt-3">
                        <div className="mail-notification-settings">
                          <p className="fs-14 mb-1 fw-medium">
                            SMS Notifications
                          </p>
                          <p className="fs-12 mb-0 text-muted">
                            Text messages sent to the user's mobile phone.
                          </p>
                        </div>
                        <div
                          className={`toggle mb-0 float-sm-end  toggle-success ${success4}`}
                          onClick={() => {
                            success4 == "on"
                              ? setsuccess4("off")
                              : setsuccess4("on");
                          }}
                        >
                          <span></span>
                        </div>
                      </div>
                    </Col>
                  </div>
                </Tab.Pane>
                <Tab.Pane
                  eventKey="security"
                  className="overflow-hidden p-0 border-0"
                  id="security-tab-pane"
                  role="tabpanel"
                  aria-labelledby="security-tab"
                  tabIndex={0}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-1">
                    <div className="fw-semibold d-block fs-15">
                      Security Settings :
                    </div>
                    <div className="btn btn-primary btn-sm">
                      <i className="ri-loop-left-line lh-1 me-2"></i>Restore
                      Changes
                    </div>
                  </div>
                  <div className="d-sm-flex d-block align-items-top justify-content-between">
                    <div className="w-50">
                      <p className="fs-14 mb-1 fw-medium">Verification</p>
                      <p className="fs-12 mb-0 text-muted">
                        Control how your profile information is verified for
                        security purposes.
                      </p>
                    </div>
                    <div className="d-flex gap-4">
                      <div className="form-check ">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="email-notifications01"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="email-notifications01"
                        >
                          Email
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="sms-notifications01"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="sms-notifications01"
                        >
                          SMS
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="phone-notifications"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="phone-notifications"
                        >
                          Phone
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="d-sm-flex d-block align-items-top justify-content-between mt-3">
                    <div className="w-50">
                      <p className="fs-14 mb-1 fw-medium">Login Verification</p>
                      <p className="fs-12 mb-0 text-muted">
                        This helps protect accounts from unauthorized access,
                        even if a password is compromised.
                      </p>
                    </div>
                    <Link
                      scroll={false}
                      href="#!"
                      className="link-primary text-decoration-underline"
                    >
                      Set Up Verification
                    </Link>
                  </div>
                  <div className="d-sm-flex d-block align-items-top justify-content-between mt-3">
                    <div className="w-50">
                      <p className="fs-14 mb-1 fw-medium">
                        Password Verification
                      </p>
                      <p className="fs-12 mb-0 text-muted">
                        This additional step helps ensure that the person
                        attempting to modify account details is the legitimate
                        account owner.
                      </p>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultValue=""
                        id="personal-details"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="personal-details"
                      >
                        Require Personal Details
                      </label>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
            <div className="card-footer border-top-0">
              <div className="btn-list float-end">
                <SpkButton Buttonvariant="primary2">
                  Deactivate Account
                </SpkButton>
                <SpkButton Buttonvariant="primary">Save Changes</SpkButton>
              </div>
            </div>
          </Card>
        </Col>
      </div>
      {/* <!--End::row-1 --> */}
    </Fragment>
  );
};

export default ProfileSettings;
