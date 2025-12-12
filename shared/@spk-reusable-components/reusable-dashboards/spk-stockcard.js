import React, { Fragment } from 'react';
import { Card } from 'react-bootstrap';
import Spkapexcharts from '../reusable-plugins/spk-apexcharts';

const SpkStockCard = ({ width, height, stock }) => {
    return (
        <Fragment>
            <Card className="custom-card">
                <Card.Body>
                    <div className="d-flex gap-2 flex-wrap align-items-start justify-content-between">
                        <div className="d-flex flex-fill align-items-center">
                            <div className="me-2">
                                <span className={`avatar avatar-rounded bg-${stock.color}-transparent p-2 avatar-sm`}>

                                    <i className={stock.icon}></i>
                                </span>
                            </div>
                            <div>
                                <span className="d-block text-default fs-14">{stock.name}</span>
                            </div>
                        </div>
                        <div className="fs-12 text-end">
                            <span className={`d-block ${stock.changeColor}`}>{stock.change}</span>
                            <span className="d-block fw-medium fs-14">{stock.symbol}</span>
                        </div>
                    </div>
                    <div className="d-flex flex-fill align-items-end gap-2 justify-content-between">
                        <div>
                            <span className="d-block text-muted">Current Value:</span>
                            <span className="d-block ms-auto fs-15 fw-medium">
                                {stock.currentValue}
                                <i className={`ri-arrow-${stock.icon1}-s-fill ${stock.changeColor} lh-1 align-middle fs-20 ms-1`}></i>
                            </span>
                        </div>
                        <div className="stock-sparkline-charts">
                            <Spkapexcharts
                                chartOptions={stock.chartOptions}
                                chartSeries={stock.chartSeries}
                                type={stock.type}
                                width={width}
                                height={height}
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Fragment>
    );
}

export default SpkStockCard;
