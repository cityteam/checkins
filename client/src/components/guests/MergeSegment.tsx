// MergeSegment --------------------------------------------------------------

// Top-level view for merging Guests to eliminate duplicates.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import GuestOptions from "./GuestOptions";
import FacilityContext from "../facilities/FacilityContext";
import MutatingProgress from "../general/MutatingProgress";
import LoginContext from "../login/LoginContext";
import {HandleAction, HandleGuest, Scope} from "../../types";
import useMutateGuest from "../../hooks/useMutateGuest";
import Checkin from "../../models/Checkin";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

const MergeSegment = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canMerge, setCanMerge] = useState<boolean>(false);
    const [fromGuest, setFromGuest] = useState<Guest>(new Guest());
    const [message, setMessage] = useState<string>("");
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [toGuest, setToGuest] = useState<Guest>(new Guest());

    const mutateGuest = useMutateGuest({
        alertPopup: false,
    });

    const onConfirm: HandleAction = () => {

        // Verify that we can actually do this merge
        const toCheckinDates: Map<string, Checkin> = new Map();
        if (toGuest.checkins) {
            for (const toCheckin of toGuest.checkins) {
                toCheckinDates.set(toCheckin.checkinDate, toCheckin);
            }
        }
        const overlaps: string[] = [];
        if (fromGuest.checkins) {
            for (const fromCheckin of fromGuest.checkins) {
                if (toCheckinDates.has(fromCheckin.checkinDate)) {
                    overlaps.push(fromCheckin.checkinDate);
                }
            }
        }
        if (overlaps.length > 0) {
            alert(`CANNOT MERGE:  Guests have overlapping Checkin Dates on ${overlaps}`)
            return;
        }

        // Ask the user to confirm this transaction
        setShowConfirm(true);

    }

    const onConfirmNegative: HandleAction = () => {
        setShowConfirm(false);
    }

    const onConfirmPositive: HandleAction = async () => {
        setShowConfirm(false);
        setMessage(`Merging Checkins FROM Guest '${fromGuest.firstName} ${fromGuest.lastName}'`
            + ` TO Guest '${toGuest.firstName} ${toGuest.lastName}'`);
        const merged = await mutateGuest.merge(toGuest, fromGuest);
        logger.debug({
            context: "MergeSegment.onConfirmPositive",
            message: "Merged Checkins and removed FROM Guest",
            fromGuest: Abridgers.GUEST(fromGuest),
            toGuest: Abridgers.GUEST(toGuest),
            merged: Abridgers.GUEST(merged),
        });
        setFromGuest(new Guest());
        setToGuest(new Guest());
    }

    useEffect(() => {

        logger.debug({
            context: "MergeSegment.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
        });

        const isAdmin = loginContext.validateFacility(facilityContext.facility, Scope.ADMIN);
        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanMerge(isAdmin || isSuperuser);

    }, [facilityContext.facility, loginContext, loginContext.data.loggedIn,
        fromGuest, toGuest]);

    const handleFromGuest: HandleGuest = (theGuest: Guest) => {
        setFromGuest(theGuest);
    }

    const handleToGuest: HandleGuest = (theGuest: Guest) => {
        setToGuest(theGuest);
    }

    return (
        <>

            {(canMerge) ? (

                <Container fluid id="MergeSegment">

                    <MutatingProgress
                        error={mutateGuest.error}
                        executing={mutateGuest.executing}
                        message={message}
                    />

                    <Row className="mb-3">
                        <Col className="text-center">
                            <strong>
                                <span>Merge Checkins for Duplicate Guests in Facility&nbsp;</span>
                                <span className="text-info">{facilityContext.facility.name}</span>
                            </strong>
                        </Col>
                    </Row>

                    <Row className="mb-3">

                        {/* Select FROM Guest subview */}
                        <Col className="bg-light">
                            <Row className="mb-3">
                                <Col className="text-center">
                                    <strong>
                                        <span>Merge Checkins FROM Guest:&nbsp;</span>
                                        {(fromGuest.id > 0) ? (
                                            <span className="text-info">
                                                {fromGuest.firstName} {fromGuest.lastName}
                                            </span>
                                        ) : (
                                            <span className="text-info">
                                                (Please Select)
                                            </span>
                                        )}
                                    </strong>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <GuestOptions
                                    checkinDates={true}
                                    handleEdit={handleFromGuest}
                                    prefix="From-"
                                    selectCheckinDates={true}
                                    updateSearch={true}
                                    withActive={false}
                                    withCheckinDates={true}
                                    withHeading={false}
                                />
                            </Row>
                        </Col>

                        {/* Select TO Guest subview */}
                        <Col>
                            <Row className="mb-3">
                                <Col className="text-center">
                                    <strong>
                                        <span>Merge Checkins TO Guest:&nbsp;</span>
                                        {(toGuest.id > 0) ? (
                                            <span className="text-info">
                                                {toGuest.firstName} {toGuest.lastName}
                                            </span>
                                        ) : (
                                            <span className="text-info">
                                                (Please Select)
                                            </span>
                                        )}
                                    </strong>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <GuestOptions
                                    checkinDates={true}
                                    handleEdit={handleToGuest}
                                    prefix="To-"
                                    selectCheckinDates={true}
                                    updateSearch={true}
                                    withActive={false}
                                    withCheckinDates={true}
                                    withHeading={false}
                                />
                            </Row>
                        </Col>

                    </Row>

                    <Row className="mb-3">
                        <Col className="text-center">
                            <Button
                                disabled={(fromGuest.id < 0) || (toGuest.id < 0) || (fromGuest.id === toGuest.id)}
                                onClick={onConfirm}
                                size="sm"
                                type="button"
                                variant="warning"
                            >
                                Merge
                            </Button>
                        </Col>
                    </Row>

                    {/* Merge Confirm Modal */}
                    <Modal
                        animation={false}
                        backdrop="static"
                        centered
                        dialogClassName="bg-warning"
                        onHide={onConfirmNegative}
                        show={showConfirm}
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>WARNING:  Potential Data Loss</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                Merging Checkins for the FROM Guest into the TO Guest
                                will also cause the FROM Guest to be removed.  Also,
                                this process is not reversible.  Are you sure you
                                want to do this?
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                onClick={onConfirmPositive}
                                size="sm"
                                type="button"
                                variant="warning"
                            >
                                Merge
                            </Button>
                            <Button
                                onClick={onConfirmNegative}
                                size="sm"
                                type="button"
                                variant="primary"
                            >
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </Container>

            ) : (
                <span><strong>You must be an administrator to merge Guests.</strong></span>
            )}

        </>
    );

}

export default MergeSegment;
