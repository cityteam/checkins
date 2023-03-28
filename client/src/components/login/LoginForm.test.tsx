import React from "react";
import {act, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "./LoginForm";

const elements = (): {
    // Fields
    username: HTMLElement,
    password: HTMLElement,
    // Buttons
    login: HTMLElement,
} => {

    const username = screen.getByLabelText("Username:");
    expect(username).toBeInTheDocument();
    const password = screen.getByLabelText("Password:");
    expect(password).toBeInTheDocument();

    const login = screen.getByRole("button", { name: "Log In" });
    expect(login).toBeInTheDocument();

    return {
        username,
        password,
        login,
    };

}

test("invalid data does not submit", async () => {

    const handleCredentials = jest.fn();
    await act(async () => {
        render(<LoginForm handleLogin={handleCredentials}/>);
    });

    const {login} = elements();
    const client = userEvent.setup();

    await client.click(login);

    await waitFor(() => {
        expect(handleCredentials).not.toBeCalled();
    })

});

// NOTE - whines about "Warning: The current testing environment is not configured to support act(...)"
xtest("valid data with enter after last field", async () => {

    const VALID_USERNAME = "myusername";
    const VALID_PASSWORD = "mypassword";
    const handleCredentials = jest.fn();
    await act(async () => {
        render(<LoginForm handleLogin={handleCredentials}/>);
    });

    const {username, password} = elements();
    const client = userEvent.setup();

    await client.type(username, VALID_USERNAME);
    await client.type(password, VALID_PASSWORD + "{enter}");

    await waitFor(() => {
        expect(handleCredentials).toHaveBeenCalledWith({
            username: VALID_USERNAME,
            password: VALID_PASSWORD,
        });
    });

});

test("valid data with submit button", async () => {

    const VALID_USERNAME = "myusername";
    const VALID_PASSWORD = "mypassword";
    const handleCredentials = jest.fn();
    await act(async () => {
        render(<LoginForm handleLogin={handleCredentials}/>);
    });

    const {username, password, login} = elements();
    const client = userEvent.setup();

    await client.type(username, VALID_USERNAME);
    await client.type(password, VALID_PASSWORD);
    await client.click(login);

    await waitFor(() => {
        expect(handleCredentials).toHaveBeenCalledWith({
            username: VALID_USERNAME,
            password: VALID_PASSWORD,
        });
    });

});
