// useFetchUsers ---------------------------------------------------------

// Custom hook to fetch User objects that correspond to input properties.

// External Modules ----------------------------------------------------------

import {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import Api from "../clients/Api";
import LoginContext from "../components/login/LoginContext";
import User, {USERS_BASE} from "../models/User";
import * as Abridgers from "../util/Abridgers";
import logger from "../util/ClientLogger";
import {queryParameters} from "../util/QueryParameters";
import ReportError from "../util/ReportError";

// Incoming Properties and Outgoing State ------------------------------------

export interface Props {
    active?: boolean;                   // Select only active Users? [false]
    alertPopup?: boolean;               // Pop up browser alert on error? [true]
    currentPage?: number;               // One-relative page number [1]
    pageSize?: number;                  // Number of Users to be returned [25]
    username?: string;                  // Select Users with matching username? [none]
    withAccessTokens?: boolean;         // Include child Access Tokens? [false]
    withRefreshTokens?: boolean;        // Include child Refresh Tokens? [false]
}

export interface State {
    error: Error | null;                // I/O error (if any)
    loading: boolean;                   // Are we currently loading?
    users: User[];                      // Fetched Users
}

// Hook Details --------------------------------------------------------------

const useFetchUsers = (props: Props): State => {

    const loginContext = useContext(LoginContext);

    const [alertPopup] = useState<boolean>((props.alertPopup !== undefined) ? props.alertPopup : true);
    const [error, setError] = useState<Error | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {

        const fetchUsers = async () => {

            setError(null);
            setLoading(true);
            let theUsers: User[] = [];

            const limit = props.pageSize ? props.pageSize : 25;
            const offset = props.currentPage ? (limit * (props.currentPage - 1)) : 0;
            const parameters = {
                active: props.active ? "" : undefined,
                limit: limit,
                offset: offset,
                username: props.username ? props.username : undefined,
                withAccessTokens: props.withAccessTokens ? "" : undefined,
                withRefreshTokens: props.withRefreshTokens ? "" : undefined,
            }

            try {
                if (loginContext.data.loggedIn) {
                    theUsers = (await Api.get(USERS_BASE
                        + `${queryParameters(parameters)}`)).data;
                    logger.debug({
                        context: "useFetchUsers.fetchUsers",
                        parameters: parameters,
                        users: Abridgers.USERS(theUsers),
                    });
                }
            } catch (anError) {
                setError(anError as Error);
                ReportError("useFetchUsers.fetchUsers", anError, {
                    parameters: parameters,
                }/*, alertPopup*/);
            }

            setUsers(theUsers);
            setLoading(false);

        }

        fetchUsers();

    }, [props.active, props.currentPage, props.pageSize,
        props.username, props.withAccessTokens, props.withRefreshTokens,
        alertPopup,
        loginContext.data.loggedIn]);

    return {
        error: error ? error : null,
        loading: loading,
        users: users,
    }

}

export default useFetchUsers;
