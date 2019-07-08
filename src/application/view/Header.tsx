import React from 'react';

interface Props {
}

const Header = (props: Props) => {
    return (
        <React.Fragment>
            <div className="header">
                <p className="content-center">Welcome to the Accident Management Portal</p>
            </div>
        </React.Fragment>
    )
};

export default Header;