// HomeView ------------------------------------------------------------------

// Welcome page view.

// External Modules ----------------------------------------------------------

import React, {useContext} from "react";
import Container from "react-bootstrap/Container";

// Internal Modules ----------------------------------------------------------

import LoginContext from "../login/LoginContext";

// Component Details ---------------------------------------------------------

const HomeView = () => {

    const loginContext = useContext(LoginContext);

    return (
        <Container fluid id="HomeView">
            <p><strong>Welcome to the CityTeam Guests Checkin App!</strong></p>
            {(loginContext.data.loggedIn) ? (
                <>
                <p>Welcome user <strong>{loginContext.data.username}</strong>!</p>
                <p>Select the <strong>Checkins</strong> link on the Navigation Bar
                    above to begin checking in Guests.
                </p>
                </>
            ) : (
               <p>Click the&nbsp;
                   <img src="/helptext/button-login-top.png" alt="Login Button"/>
                   &nbsp;and fill in your username and password, to begin.
               </p>
            )}
        </Container>
    )

}

export default HomeView;
