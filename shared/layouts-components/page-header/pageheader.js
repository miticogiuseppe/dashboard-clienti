"use client"; // Obbligatorio per usare useState e useEffect

import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import SpkButton from "../../@spk-reusable-components/reusable-uielements/spk-button";
import SpkBreadcrumb from "../../@spk-reusable-components/reusable-uielements/spk-breadcrumb";

const Pageheader = (props) => {
  // Stato per memorizzare i dati dell'utente
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Chiamata alla tua nuova API per recuperare i dati dal token
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Non autorizzato");
        return res.json();
      })
      .then((data) => {
        // Se nel token c'è il nominativo (che hai aggiunto alla login) lo salviamo
        if (data && data.nominativo) {
          setUser({
            nome: data.nominativo.toUpperCase(),
            codice: data.codice_agente,
          });
        }
      })
      .catch((err) => {
        // Se c'è un errore (es. non loggato), user rimane null e non si vede nulla
        console.log("Sessione non rilevata dal Pageheader");
      });
  }, []);

  return (
    <Fragment>
      <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
        <div>
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

          <h1 className="page-title fw-medium fs-18 mb-0">
            {props.activepage}

            {/* Se l'utente è loggato, mostriamo il nome accanto al titolo */}
            {user && (
              <span className="ms-2 fs-14 text-muted fw-normal">
                | <i className="ri-user-star-line me-1 align-middle"></i>
                {user.nome} ({user.codice})
              </span>
            )}
          </h1>
        </div>

        {/* Lasciamo commentato il blocco azioni come nel tuo originale */}
        {/* {props.showActions !== false && (
          <div className="btn-list">
            <SpkButton Buttonvariant="white">
              <i className="ri-filter-3-line align-middle me-1 lh-1"></i> Filter
            </SpkButton>
            <SpkButton Buttonvariant="primary" Customclass="me-0">
              <i className="ri-share-forward-line me-1"></i> Share
            </SpkButton>
          </div>
        )} */}
      </div>
    </Fragment>
  );
};

export default Pageheader;
