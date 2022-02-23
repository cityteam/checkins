// GuestsView -------------------------------------------------------------

// Top-level view for managing Guest objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import GuestForm from "./GuestForm";
import GuestsList from "./GuestsList";
import FacilityContext from "../facilities/FacilityContext";
import LoginContext from "../login/LoginContext";
import {HandleGuest, OnAction, Scope} from "../../types";
import useMutateGuest from "../../hooks/useMutateGuest";
import Guest from "../../models/Guest";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

const GuestsView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [guest, setGuest] = useState<Guest | null>(null);

    const mutateGuest = useMutateGuest({});

    useEffect(() => {

        logger.debug({
            context: "GuestsView.useEffect",
        });

        const isAdmin = loginContext.validateFacility(facilityContext.facility, Scope.ADMIN);
        const isRegular = loginContext.validateFacility(facilityContext.facility, Scope.REGULAR);
        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isAdmin || isRegular);
        setCanRemove(isSuperuser);
        setCanUpdate(isAdmin || isRegular);

    }, [facilityContext.facility, loginContext]);

    const handleAdd: OnAction = () => {
        setGuest(new Guest({
            active: true,
            comments: null,
            facilityId: facilityContext.facility.id,
            firstName: null,
            lastName: null,
        }));
    }

    const handleInsert: HandleGuest = async (theGuest) => {
        /*const inserted = */await mutateGuest.insert(theGuest);
        setGuest(null);
    }

    const handleRemove: HandleGuest = async (theGuest) => {
        /*const removed = */await mutateGuest.remove(theGuest);
        setGuest(null);
    }

    const handleSelect: HandleGuest = (theGuest) => {
        setGuest(theGuest);
    }

    const handleUpdate: HandleGuest = async (theGuest) => {
        /*const updated = */await mutateGuest.update(theGuest);
        setGuest(null);
    }

    return (
        <Container fluid id="GuestsView">

            {/* List View */}
            {(!guest) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            <span><strong>Select or Create Guests for Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <GuestsList
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
            {(guest) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            {(guest.id > 0) ? (
                                <span><strong>Edit Existing</strong></span>
                            ) : (
                                <span><strong>Add New</strong></span>
                            )}
                            <span><strong>&nbsp;Guest for Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                        <Col className="text-right">
                            <Button
                                onClick={() => setGuest(null)}
                                size="sm"
                                type="button"
                                variant="secondary"
                            >Back</Button>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <GuestForm
                            autoFocus={true}
                            canRemove={canRemove}
                            canSave={canInsert || canUpdate}
                            handleInsert={handleInsert}
                            handleRemove={handleRemove}
                            handleUpdate={handleUpdate}
                            guest={guest}
                        />
                    </Row>

                </>
            ) : null }

        </Container>

    )

}

export default GuestsView;
