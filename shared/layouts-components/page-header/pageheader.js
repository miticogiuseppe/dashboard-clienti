import Link from "next/link";
import React, { Fragment } from "react";
import SpkButton from "../../@spk-reusable-components/reusable-uielements/spk-button";
import SpkBreadcrumb from "../../@spk-reusable-components/reusable-uielements/spk-breadcrumb";

const Pageheader = (props) => {
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
          </h1>
        </div>

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
