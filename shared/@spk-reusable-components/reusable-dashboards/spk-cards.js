import React, { Fragment } from "react";
import { Card } from "react-bootstrap";

const Spkcardscomponent = ({
  card,
  cardClass,
  Icon,
  svgIcon,
  mainClass,
  parentClass,
  dataClass,
  badgeClass,
  headingClass,
  badgeColor,
  iconClass,
  useFlex,
}) => {
  return (
    <Fragment>
      <Card className={`custom-card ${cardClass}`}>
        <Card.Body>
          <div className={`${mainClass}`}>
            <div className={parentClass}>
              <span className={`text-muted ${headingClass}`}>{card.title}</span>
              <h4 className={`fw-medium  ${dataClass}`}>{card.count}</h4>
            </div>

            <div
              className={`avatar avatar-${badgeClass} bg-${card.backgroundColor} ${badgeColor} `}
            >
              {svgIcon ||
                (Icon ? <i className={` ${iconClass} fs-5`} /> : null)}
            </div>
          </div>
          <div
            className={`text-muted fs-13 ${
              useFlex ? "d-flex flex-wrap gap-2" : ""
            }`}
          >
            {card.inc}
            <span className={`text-${card.color} mx-1`}>
              {card.percentageChange} <i className={` ${card.icon} fs-16`}></i>
            </span>
          </div>
        </Card.Body>
      </Card>
    </Fragment>
  );
};

export default Spkcardscomponent;
