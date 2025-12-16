"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Form, Nav, Tab } from "react-bootstrap";
import { basePath } from "../next.config";
import SpkAlert from "../shared/@spk-reusable-components/reusable-uielements/spk-alert";
import { restPost } from "@/utils/restUtils";

const page = () => {
  const [passwordshow1, setpasswordshow1] = useState(false);
  const [err, setError] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = data;
  const router = useRouter();

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError("");
  };

  const RouteChange = () => {
    router.push("/redirect");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // login
    try {
      await restPost("login", { username: email, password });
      RouteChange();
    } catch (e) {
      console.log(e.request.response);
      setError("Email o password non corretti.");
    }
  };

  useEffect(() => {
    document.querySelector("body")?.classList.add("authentication-background");
    return () => {
      document
        .querySelector("body")
        ?.classList.remove("authentication-background");
    };
  }, []);

  return (
    <Fragment>
      <html lang="it">
        <body className="">
          <div className="container">
            <div className="row justify-content-center align-items-center authentication authentication-basic h-100 pt-3">
              <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                <div className="mb-3 d-flex justify-content-center">
                  <a
                    href="https://alfredsupply.it"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${
                        process.env.NODE_ENV === "production" ? basePath : ""
                      }/assets/images/brand-logos/logo-supply.png`}
                      alt="logo"
                      className="desktop-logo"
                    />
                  </a>
                </div>
                <Card className="custom-card my-4 p-3">
                  <Card.Body>
                    <p className="h5 mb-2 text-center">Sign In</p>

                    <div className="row gy-3">
                      {err && <SpkAlert variant="danger">{err}</SpkAlert>}
                      <Col xl={12}>
                        <Form.Label
                          htmlFor="signin-username"
                          className="text-default"
                        >
                          User Name
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          id="email"
                          placeholder="user name"
                          value={email}
                          onChange={changeHandler}
                        />
                      </Col>
                      <div className="col-xl-12 mb-2">
                        <Form.Label
                          htmlFor="signin-password"
                          className="text-default d-block"
                        >
                          Password
                          <Link
                            href="/authentication/reset-password/basic"
                            className="float-end text-danger"
                          >
                            Forget password ?
                          </Link>
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            name="password"
                            type={passwordshow1 ? "text" : "password"}
                            value={password}
                            onChange={changeHandler}
                            className="create-password-input"
                            id="signin-password"
                            placeholder="password"
                          />
                          <Link
                            href="#!"
                            scroll={false}
                            className="show-password-button text-muted"
                            id="button-addon2"
                            onClick={() => setpasswordshow1(!passwordshow1)}
                          >
                            <i
                              className={`${
                                passwordshow1
                                  ? "ri-eye-line"
                                  : "ri-eye-off-line"
                              } align-middle`}
                            />
                          </Link>
                        </div>
                        <div className="mt-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              value=""
                              id="defaultCheck1"
                            />
                            <label
                              className="form-check-label text-muted fw-normal"
                              htmlFor="defaultCheck1"
                            >
                              Remember password ?
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-grid mt-4">
                      <button className="btn btn-primary" onClick={handleLogin}>
                        Sign In
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </div>
          </div>
        </body>
      </html>
    </Fragment>
  );
};

export default page;
