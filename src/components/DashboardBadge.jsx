import React from 'react';

const DashboardBadge = ({ url, teamId, hidden }) => {
    if (hidden) {
        return null;
    }

    return (
        <>
            <a href={url} target="_blank" rel="noopener noreferrer">
                <img
                    src={`https://img.shields.io/badge/Bluejay-Dashboard_${teamId}-blue.svg`}
                    alt="Bluejay Dashboard"
                />
            </a>
            <br />
            If you want to add the badge to your repo's README.md you can copy the following markdown:
            <br />
            <i>
                [![Bluejay Dashboard](https://img.shields.io/badge/Bluejay-Dashboard_{teamId}-blue.svg)]({url})
            </i>
        </>
    );
};

export default DashboardBadge;
