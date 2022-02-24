// UserSegment ---------------------------------------------------------------

// Top-level view for managing User objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import UserDetails from "./UserDetails";
import UserOptions from "./UserOptions";
// NOTE - import SavingProgress from "../general/SavingProgress";
import LoginContext from "../login/LoginContext";
import {HandleAction, HandleUser, Scope} from "../../types";
import useMutateUser from "../../hooks/useMutateUser";
import User from "../../models/User";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

enum View {
    DETAILS = "Details",
    OPTIONS = "Options",
}

const UserSegment = () => {

    const loginContext = useContext(LoginContext);

    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [user, setUser] = useState<User>(new User());
    const [view, setView] = useState<View>(View.OPTIONS);

    const mutateUser = useMutateUser({
        // NOTE - alertPopup: false,
    });

    useEffect(() => {

        logger.debug({
            context: "UserSegment.useEffect",
            user: Abridgers.USER(user),
            view: view.toString(),
        });

        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isSuperuser);
        setCanRemove(isSuperuser);
        setCanUpdate(isSuperuser);

    }, [loginContext, loginContext.data.loggedIn,
        user, view]);

    // Create an empty User to be added
    const handleAdd: HandleAction = () => {
        const theUser = new User({
            active: true,
            name: null,
            password: null,
            scope: null,
            username: null,
        });
        logger.debug({
            context: "UserSegment.handleAdd",
            user: theUser,
        });
        setUser(theUser);
        setView(View.DETAILS);
    }

    // Handle selection of a User to edit details
    const handleEdit: HandleUser = (theUser) => {
        logger.debug({
            context: "UserSegment.handleEdit",
            user: Abridgers.USER(theUser),
        });
        setUser(theUser);
        setView(View.DETAILS);
    }

    // Handle insert of a new User
    const handleInsert: HandleUser = async (theUser) => {
        setTitle(theUser.username);
        const inserted = await mutateUser.insert(theUser);
        logger.debug({
            context: "UserSegment.handleInsert",
            title: title,
            user: Abridgers.USER(inserted),
        })
        setView(View.OPTIONS);
    }

    // Handle remove of an existing User
    const handleRemove: HandleUser = async (theUser) => {
        setTitle(theUser.username);
        const removed = await mutateUser.remove(theUser);
        logger.debug({
            context: "UserSegment.remove",
            title: title,
            user: Abridgers.USER(removed),
        });
        setView(View.OPTIONS);
    }

    // Handle return from View.DETAILS to redisplay View.OPTIONS
    const handleReturn: HandleAction = () => {
        logger.debug({
            context: "UserSegment.handleReturn",
        });
        setView(View.OPTIONS);
    }

    // Handle request to update an existing User
    const handleUpdate: HandleUser = async (theUser) => {
        setTitle(theUser.username);
        const updated = await mutateUser.update(theUser);
        logger.debug({
            context: "UserSegment.handleUpdate",
            title: title,
            user: Abridgers.USER(updated),
        })
        setView(View.OPTIONS);
    }

    return (
        <>

{/* NOTE - not yet implemented
            <SavingProgress
                error={mutateUser.error}
                executing={mutateUser.executing}
                title={title}
            />
*/}

            {(view === View.DETAILS) ? (
                <UserDetails
                    autoFocus
                    handleBack={handleReturn}
                    handleInsert={canInsert ? handleInsert : undefined}
                    handleRemove={canRemove ? handleRemove : undefined}
                    handleUpdate={canUpdate ? handleUpdate : undefined}
                    user={user}
                />
            ) : null }

            {(view === View.OPTIONS) ? (
                <UserOptions
                    handleAdd={handleAdd}
                    handleEdit={handleEdit}
                />
            ) : null }

        </>
    )

}

export default UserSegment;
