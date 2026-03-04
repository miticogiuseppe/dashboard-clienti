"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import SpkBreadcrumb from "../../@spk-reusable-components/reusable-uielements/spk-breadcrumb";

const Pageheader = (props) => {
  // Stato per memorizzare i dati dell'utente loggato
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Recupero dati utente dal token per mostrare il nominativo in alto
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Non autorizzato");
        return res.json();
      })
      .then((data) => {
        if (data && data.nominativo) {
          setUser({
            nome: data.nominativo.toUpperCase(),
            codice: data.codice_agente,
          });
        }
      })
      .catch((err) => {
        console.log("Sessione non rilevata dal Pageheader");
      });
  }, []);

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
          {/* Gestione dinamica dei Breadcrumb */}
          <SpkBreadcrumb Customclass="mb-1">
            <li className="breadcrumb-item">
              <Link scroll={false} href="#!">
                {props.title}
              </Link>
            </li>
            {props.subtitle && (
              <li className="breadcrumb-item">
                <Link scroll={false} href="#!">
                  {props.subtitle}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {props.currentpage}
            </li>
          </SpkBreadcrumb>

          {/* Titolo Pagina + Info Utente Loggato */}
          <h1 className="page-title fw-medium fs-18 mb-0">
            {props.activepage}

            {user && (
              <span className="ms-2 fs-14 text-muted fw-normal">
                | <i className="ri-user-star-line me-1 align-middle"></i>
                {user.nome} ({user.codice})
              </span>
            )}
          </h1>
        </div>

        {/* ZONA FILTRI DINAMICI (props.children):
    - Se showActions è true, mostra i filtri passati come children
        */}
        <div className="d-flex btn-list mt-md-0 mt-2 gap-2">
          {props.children}
        </div>
      </div>
    </Fragment>
  );
};

export default Pageheader;
