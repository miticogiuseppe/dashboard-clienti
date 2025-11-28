import React, { Fragment } from 'react';

const SpkActivityCard = ({ productactivity }) => {
    const imgSrc = productactivity?.img;
    return (
        <Fragment>
            <div className="">
                <span className={`${productactivity?.IconSize} ${productactivity?.Iconclass} avatar avatar-rounded`}>
                    <i className={productactivity?.Icon}></i>
                </span>
            </div>
            <div className="activity-content">
                <span className="d-block fw-medium">
                    {productactivity?.Title ? (
                        <span dangerouslySetInnerHTML={{ __html: productactivity.Title }} />
                    ) : (
                        ''
                    )}
                </span>
                <span className={`d-block fs-12 text-muted ${!productactivity?.ChildContent ? 'pb-0' : 'pb-2'}`}>
                    {productactivity?.Desc ? (
                        <span dangerouslySetInnerHTML={{ __html: productactivity.Desc }} />
                    ) : (
                        ''
                    )}
                </span>
                {imgSrc && imgSrc.length > 0 && imgSrc.map((src, index) => (
                    <a href="#!" key={index} className="avatar avatar-sm bg-gray-200 me-1">
                        <img src={src} alt={`Activity Image ${index}`} />
                    </a>
                ))}
                {productactivity?.ChildContent && (
                    <div dangerouslySetInnerHTML={{ __html: String(productactivity.ChildContent) }} />
                )}
            </div>
            <div className="flex-fill text-end">
                <span className={productactivity?.DurationClass}>{productactivity?.Duration}</span>
            </div>
        </Fragment>
    );
};

export default SpkActivityCard;
