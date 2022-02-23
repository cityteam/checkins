// LoginContext --------------------------------------------------------------

// React Context containing information about the currently logged in user,
// if there is one.  If there is not, the LOGIN_CONTEXT global variable will be
// null, and the loggedIn context method will return false.

// External Modules ----------------------------------------------------------

import React, {createContext, useState} from "react";

// Internal Modules ----------------------------------------------------------

import {Scope} from "../../types";
import TokenResponse from "../../models/TokenResponse";
import Facility from "../../models/Facility";
import logger, {setLevel} from "../../util/ClientLogger";

// Context Properties -------------------------------------------------------

// Data that is visible to HTTP clients not part of the React component hierarchy
export interface Data {
    accessToken: string | null;         // Current access token (if logged in)
    expires: Date | null;               // Absolute expiration time
    loggedIn: boolean;                  // Is a user currently logged in?
    refreshToken: string | null;        // Current refresh token (if logged in and returned)
    scope: string | null;               // Allowed scope(s) (if logged in)
    username: string | null;            // Logged in username (if logged in)
}

// State (including data) visible to LoginContext consumers
export interface State {
    data: Data;
    handleLogin: (username: string, tokenResponse: TokenResponse) => void;
    handleLogout: () => void;
    validateFacility: (facility: Facility, scope?: Scope) => boolean;
                                        // Can the logged in User access this Facility?
    validateScope: (scope: string) => boolean;
                                        // Does the logged in User have the specified scope?
}

export const LoginContext = createContext<State>({
    data: {
        accessToken: null,
        expires: null,
        loggedIn: false,
        refreshToken: null,
        scope: null,
        username: null,
    },
    handleLogin: (username, tokenResponse): void => {
        // Will be replaced in the real returned context information
    },
    handleLogout: (): void => {
        // Will be replaced in the real returned context information
    },
    validateFacility: (facility: Facility): boolean => { return false },
    validateScope: (scope: string): boolean => { return false },
});

// Context Provider ----------------------------------------------------------

// For use by HTTP clients to include in their requests
export let LOGIN_DATA: Data = {
    accessToken: null,
    expires: null,
    loggedIn: false,
    refreshToken: null,
    scope: null,
    username: null,
};

// Log level configuration
export const LOG_DEFAULT = "info";      // Default log level
export const LOG_PREFIX = "log:";       // Prefix for scope values defining log level

export const LoginContextProvider = (props: any) => {

    const [alloweds, setAlloweds] = useState<string[]>([]);
    const [data, setData] = useState<Data>({
        accessToken: null,
        expires: null,
        loggedIn: false,
        refreshToken: null,
        scope: null,
        username: null,
    });

    const handleLogin = async (username: string, tokenResponse: TokenResponse): Promise<void> => {

        logger.info({
            context: "LoginContext.handleLogin",
            username: username,
            scope: tokenResponse.scope,
        });

        // Save allowed scope(s) and set logging level
        let found = false;
        if (tokenResponse.scope) {
            const theAlloweds = tokenResponse.scope.split(" ");
            setAlloweds(theAlloweds);
            theAlloweds.forEach(allowed => {
                if (allowed.startsWith(LOG_PREFIX)) {
                    setLevel(allowed.substr(LOG_PREFIX.length));
                    found = true;
                }
            })
        } else {
            setAlloweds([]);
        }
        if (!found) {
            setLevel(LOG_DEFAULT);
        }

        // Prepare the data that will be visible to components and statically
        const theData: Data = {
            accessToken: tokenResponse.access_token,
            expires: new Date((new Date()).getTime() + (tokenResponse.expires_in * 1000)),
            loggedIn: true,
            refreshToken: tokenResponse.refresh_token ? tokenResponse.refresh_token : null,
            scope: tokenResponse.scope,
            username: username,
        }
        LOGIN_DATA = {    // No corrupting real internal state allowed
            ...theData,
        }
        logger.trace({
            context: "LoginContext.handleLogin",
            msg: "Setting context data after login",
            data: theData,
        });
        setData(theData);

    }

    const handleLogout = async (): Promise<void> => {

        logger.info({
            context: "LoginContext.handleLogout",
            username: data.username,
        });

        const theData = {
            accessToken: null,
            expires: null,
            loggedIn: false,
            refreshToken: null,
            scope: null,
            username: null,
        };
        LOGIN_DATA = {    // No corrupting real internal state allowed
            ...theData
        };
        logger.trace({
            context: "LoginContext.handleLogout",
            msg: "Setting context data after logout",
            data: theData,
        });
        setData(theData);

        setLevel(LOG_DEFAULT);

    }

    // Does the currently logged in User possess access to the specified Facility?
    const validateFacility = (facility: Facility, scope?: Scope): boolean => {
        if (scope) {
            return validateScope(`${facility.scope}:${scope}`);
        } else {
            return validateScope(`${facility.scope}:${Scope.ADMIN}`)
                || validateScope(`${facility.scope}:${Scope.REGULAR}`);
        }
    }

    // Does the currently logged in User possess the requested scope permissions?
    const validateScope = (scope: string): boolean => {

        // Users not logged in will never pass scope requirements
        if (!data.loggedIn) {
            return false;
        }

        // Special handling for superuser scope
        if (alloweds.includes(Scope.SUPERUSER)) {
            return true;
        }

        // Special handling for a logged in user with *any* scope
        if (scope === "") {
            return true;
        }

        // Otherwise, check required scope(s) versus allowed scope(s)
        const requireds = scope ? scope.split(" ") : [];
        if (requireds.length === 0) {
            return true;
        }
        let missing = false;
        requireds.forEach(required => {
            if (!alloweds.includes(required)) {
                missing = true;
            }
        });
        if (missing) {
            return false;
        }

        // The requested scope is allowed
        return true;

    }

    const loginContext: State = {
        data: data,
        handleLogin: handleLogin,
        handleLogout: handleLogout,
        validateFacility: validateFacility,
        validateScope: validateScope,
    }

    return (
        <LoginContext.Provider value={loginContext}>
            {props.children}
        </LoginContext.Provider>
    )

}

export default LoginContext;
