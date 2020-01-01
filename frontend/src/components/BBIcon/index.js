import React from 'react';
import classNames from 'classnames';

export default function BBIcon({
    className, type, title, onClick, style,
}) {
    const clsString = classNames({
        bbicon: true,
        [`bbicon-${type}`]: true,
    }, className);
    return (
        <i className={clsString} style={style}
            title={title} onClick={onClick}
        />
    );
}
