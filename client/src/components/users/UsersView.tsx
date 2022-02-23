// UsersView -----------------------------------------------------------------

// Top-level view for managing User objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import UserForm from "./UserForm";
import UsersList from "./UsersList";
import LoginContext from "../login/LoginContext";
import {HandleUser, OnAction, Scope} from "../../types";
import useMutateUser from "../../hooks/useMutateUser";
import User from "../../models/User";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

const UsersView = () => {

    const loginContext = useContext(LoginContext);

    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const mutateUser = useMutateUser({
    });

    useEffect(() => {

        logger.debug({
            context: "UsersView.useEffect",
        });

        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isSuperuser);
        setCanRemove(isSuperuser);
        setCanUpdate(isSuperuser);

    }, [loginContext]);

    const handleAdd: OnAction = () => {
        setUser(new User({
            active: true,
            name: null,
            password: null,
            scope: null,
            username: null,
        }));
    }

    const handleInsert: HandleUser = async (theUser) => {
        mutateUser.insert(theUser);
        setUser(null);
    }

    const handleRemove: HandleUser = async (theUser) => {
        mutateUser.remove(theUser);
        setUser(null);
    }

    const handleSelect: HandleUser = (theUser) => {
        setUser(theUser);
    }

    const handleUpdate: HandleUser = async (theUser) => {
        mutateUser.update(theUser);
        setUser(null);
    }

    return (
        <Container fluid id="UsersView">

            {/* List View */}
            {(!user) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            <span><strong>Select or Create User</strong></span>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <UsersList
                            canInsert={canInsert}
                            canRemove={canRemove}
                            canUpdate={canUpdate}
                            handleAdd={handleAdd}
                            handleSelect={handleSelect}
                        />
                    </Row>

                </>
            ) : null }

            {/* Detail View */}
            {(user) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            {(user.id > 0) ? (
                                <span><strong>Edit Existing</strong></span>
                            ) : (
                                <span><strong>Add New</strong></span>
                            )}
                            <span><strong>&nbsp;User</strong></span>
                        </Col>
                        <Col className="text-right">
                            <Button
                                onClick={() => setUser(null)}
                                size="sm"
                                type="button"
                                variant="secondary"
                            >Back</Button>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <UserForm
                            autoFocus={true}
                            canRemove={canRemove}
                            canSave={canInsert || canRemove}
                            handleInsert={handleInsert}
                            handleRemove={handleRemove}
                            handleUpdate={handleUpdate}
                            user={user}
                        />
                    </Row>

                </>
            ) : null }

        </Container>
    )

}

export default UsersView;

