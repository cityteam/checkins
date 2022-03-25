// LoggedInUser.test ---------------------------------------------------------

// Unit tests for LoggedInUser.

// External Modules ----------------------------------------------------------

import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {act, render, screen, waitFor} from "@testing-library/react";

// Internal Modules ----------------------------------------------------------

import LoggedInUser from "./LoggedInUser";
import LoginContext from "./LoginContext";
import * as MockUserServices from "../../test/MockUserServices";
import * as SeedData from "../../test/SeedData";
import * as State from "../../test/State";

// Test Infrastructure -------------------------------------------------------

type Elements = {
    // Fields
    loggedInUsername: HTMLElement,
    // Buttons
    logIn: HTMLElement | null,
    logOut: HTMLElement | null,
}

const elements = function (): Elements {

    const loggedInUsername = screen.getByRole("textbox");
    expect(loggedInUsername).toBeInTheDocument();

    // One or the other will be present, depending on logged in status
    const logIn = screen.queryByRole("button", { name: "Log In" });
    const logOut = screen.queryByRole("button", { name: "Log Out" });

    return {
        loggedInUsername: loggedInUsername,
        logIn: logIn,
        logOut: logOut,
    }

}

// Test Methods --------------------------------------------------------------

describe('When logged in', function () {

    it("should show logged in presentation", async () => {

        const user = MockUserServices.exact(SeedData.USER_USERNAME_REGULAR);
        await act(async () => {
            // NOTE - we need the Router because the component uses useNavigate
            render(
                <LoginContext.Provider value={State.loginContext(user)}>
                    <Router>
                        <LoggedInUser/>
                    </Router>
                </LoginContext.Provider>
            );
        });
        const {loggedInUsername, logIn, logOut} = elements();

        await waitFor(() => {
            expect(loggedInUsername).toHaveValue(user.username);
            expect(logIn).not.toBeInTheDocument();
            expect(logOut).toBeInTheDocument();
        });

    })

})

describe('When logged out', function () {

    it("should show logged out presentation", async () => {

        await act(async () => {
            render(
                // NOTE - we need the Router because the component uses useNavigate
                <LoginContext.Provider value={State.loginContext(null)}>
                    <Router>
                        <LoggedInUser/>
                    </Router>
                </LoginContext.Provider>
            );
        });
        const {loggedInUsername, logIn, logOut} = elements();

        await waitFor(() => {
            expect(loggedInUsername).toHaveValue("-----");
            expect(logIn).toBeInTheDocument();
            expect(logOut).not.toBeInTheDocument();
        });

    })

})

