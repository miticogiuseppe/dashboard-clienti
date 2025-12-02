"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Card, Col, Form, Nav, Tab } from "react-bootstrap";
import { basePath } from "../next.config";
import SpkAlert from "../shared/@spk-reusable-components/reusable-uielements/spk-alert";
import { auth } from "../shared/firebase/firebaseapi";
import { hardcodedUsers } from "@/shared/hardcodedUsers";

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
    router.push("/dashboard/copral/generalenew");
  };

  // Funzione login unica (admin hardcoded + Firebase)
  const handleLogin = async (e) => {
    e.preventDefault();

    //Check users
    const user = hardcodedUsers.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      localStorage.setItem("loggedUser", user.name);
      router.push(user.route);
      return;
    }

    // Login Firebase
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Utente loggato:", userCredential.user);
      RouteChange();
    } catch (error) {
      setError("Email o password non corretti.");
      setData({ email: "", password: "" });
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
                      }/assets/images/brand-logos/logo-supply-cerchio.png`}
                      alt="logo"
                      className="desktop-logo"
                    />
                  </a>
                </div>
                <Card className="custom-card my-4">
                  <Tab.Container
                    id="left-tabs-example"
                    defaultActiveKey="react"
                  >
                    <Tab.Content>
                      {/* React Tab (Hardcoded admin + Firebase login) */}
                      <Tab.Pane eventKey="react" className="border-0">
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
                                  onClick={() =>
                                    setpasswordshow1(!passwordshow1)
                                  }
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
                            <button
                              className="btn btn-primary"
                              onClick={handleLogin}
                            >
                              Sign In
                            </button>
                          </div>
                        </Card.Body>
                      </Tab.Pane>

                      {/* Firebase Tab (puoi aggiungere ulteriori login se vuoi) */}
                      <Tab.Pane eventKey="firebase" className="border-0">
                        <Card.Body>
                          <p className="h5 mb-2 text-center">
                            Firebase Sign In
                          </p>
                          <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                name="email"
                                placeholder="Inserisci email"
                                value={email}
                                onChange={changeHandler}
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Password</Form.Label>
                              <Form.Control
                                type={passwordshow1 ? "text" : "password"}
                                name="password"
                                placeholder="Inserisci password"
                                value={password}
                                onChange={changeHandler}
                              />
                            </Form.Group>
                            {err && <SpkAlert variant="danger">{err}</SpkAlert>}
                            <div className="d-grid mt-3">
                              <button type="submit" className="btn btn-primary">
                                Sign In
                              </button>
                            </div>
                          </Form>
                        </Card.Body>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
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
