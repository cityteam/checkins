// CheckinsUnassignedSubview -------------------------------------------------

// Process a Checkin for a currently unassigned mat, in two steps:
// - Search for and select an existing Guest, or create and select a new one.
// - Assign the selected Guest (with approprite details) to the
//   previously unassigned Checkin.

// External Modules -----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import AssignDetails from "../assigns/AssignDetails";
import GuestDetails from "../guests/GuestDetails";
import GuestOptions from "../guests/GuestOptions";
import {HandleAssign, HandleCheckin, HandleGuest, OnAction} from "../../types";
import useMutateGuest from "../../hooks/useMutateGuest";
import Assign from "../../models/Assign";
import Checkin from "../../models/Checkin";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import MutatingProgress from "../general/MutatingProgress";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkin: Checkin;                   // The (unassigned) Checkin to process
    checkinDate: string;                // Checkin date we are assigning for
    handleAssigned: HandleAssign;       // Handle assignment of a Guest to this Checkin
    handleCompleted: HandleCheckin;     // Handle Checkin after completion
}

// Component Details ---------------------------------------------------------

const CheckinsUnassignedSubview = (props: Props) => {

    const [adding, setAdding] = useState<boolean>(false);
    const [assign, setAssign] = useState<Assign | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [message, setMessage] = useState<string>("");

    const mutateGuest = useMutateGuest({
        alertPopup: false,
    });

    useEffect(() => {
        logger.debug({
            context: "CheckinsUnassignedSubview.useEffect",
            checkin: Abridgers.CHECKIN(props.checkin),
            guest: (guest) ? Abridgers.GUEST(guest) : undefined,
        });
    }, [adding, guest, props.checkin]);

    const configureAssign = (theGuest: Guest): Assign => {
        return new Assign({
            guestId: theGuest.id,
            paymentAmount: 5.00,
            paymentType: "$$"
        });
    }

    const handleBack: OnAction = () => {
        logger.error({
            context: "CheckinsUnassignedSubview.handleBack",
            msg: "What do we do?"
        });
    }

    // Handle add of a new Guest
    const handleInsertedGuest: HandleGuest = async (theGuest) => {
        setMessage(`Handling insert of Guest '${theGuest.lastName}, ${theGuest.firstName}'`);
        const inserted: Guest = await mutateGuest.insert(theGuest);
        logger.debug({
            context: "CheckinsUnassignedSubview.handleInsertedGuest",
            guest: Abridgers.GUEST(inserted),
        });
        setAssign(configureAssign(inserted));
        setGuest(inserted);
    }

    // Handle request to add a new Guest
    const handleNewGuest: OnAction = () => {
        setAdding(true);
    }

    const handleRemovedGuest: HandleGuest = async (theGuest) => {
        logger.error({
            context: "CheckinsUnassignedSubview.handleRemovedGuest",
            msg: "This should never be called",
            guest: Abridgers.GUEST(theGuest),
        });
    }

    // Handle a request to propose a specific Guest for assignment
    const handleSelectedGuest: HandleGuest = (theGuest) => {
        logger.debug({
            context: "CheckinsUnassignedSubview.handleSelectedGuest",
            guest: Abridgers.GUEST(theGuest),
        });
        // Ensure this Guest has not already been checked in today
        if (theGuest.checkins) {
            let matNumber = -1;
            theGuest.checkins.forEach(checkin => {
                if (checkin.checkinDate === props.checkinDate) {
                    matNumber = checkin.matNumber;
                }
            });
            if (matNumber > 0) {
                alert(`This Guest is already checked in for mat ${matNumber}`);
                return;
            }
        }
        // Ensure this Guest does not have an active Ban for today
        let banned = false;
        if (theGuest.bans) {
            theGuest.bans.forEach(ban => {
                if (ban.active && (ban.fromDate <= props.checkinDate) && (ban.toDate >= props.checkinDate)) {
                    banned = true;
                }
            });
        }
        if (banned) {
            alert(`This Guest has an active Ban for ${props.checkinDate} and may not be checked in`);
            return;
        }
        // Perform the assignment of this guest
        setAssign(configureAssign(theGuest));
        setGuest(theGuest);
    }

    const handleUpdatedGuest: HandleGuest = async (theGuest) => {
        logger.error({
            context: "CheckinsUnassignedSubview.handleUpdatedGuest",
            msg: "This should never be called",
            guest: Abridgers.GUEST(theGuest),
        });
    }

    return (
        <Container fluid id="CheckinsUnassignedSubview">

            <MutatingProgress
                error={mutateGuest.error}
                executing={mutateGuest.executing}
                message={message}
            />

            {/* Overall Header and Back Link */}
            <Row className="mb-3">
                <Col/>
                <Col className="text-end">
                    <Button
                        onClick={() => props.handleCompleted(props.checkin)}
                        size="sm"
                        type="button"
                        variant="secondary"
                    >
                        Back
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3">

                {/* Step 1 ----------------------------------------------- */}
                <Col className="col-8 bg-light mb-1">

                    <h6 className="text-center">
                        Step 1: Select or Add A Guest To Assign
                    </h6>
                    <hr/>
                    <h6 className={"mb-3 text-center"}>
                        Mat Number:&nbsp;
                        <span className="text-info">
                            {props.checkin.matNumber}{props.checkin.features}
                        </span>
                    </h6>

                    {(adding) ? (
                        <>
                            <Row className="ms-1 me-1">
                                <GuestDetails
                                    autoFocus
                                    guest={new Guest({facilityId: -1, id: -1})}
                                    handleBack={handleBack}
                                    handleInsert={handleInsertedGuest}
                                    handleRemove={handleRemovedGuest}
                                    handleUpdate={handleUpdatedGuest}
                                />
                            </Row>
                        </>
                    ) : (
                        <>
                            <GuestOptions
                                checkinDates={true}
                                handleAdd={handleNewGuest}
                                handleEdit={handleSelectedGuest}
                                withActive={false}
                                withCheckinDates={true}
                                withHeading={false}
                            />
                        </>
                    )}

                </Col>

                {/* Step 2 ----------------------------------------------- */}
                <Col className="col mb-1">
                    <h6 className={"text-center"}>
                        Step 2: Complete Assignment Details
                    </h6>
                    <hr/>
                    {(guest) ? (
                        <h6 className={"text-center"}>
                            Guest:&nbsp;&nbsp;
                            <span className="text-info">
                                {guest.firstName} {guest.lastName}
                            </span>
                        </h6>
                    ) : null }
                    {(assign) ? (
                        <AssignDetails
                            assign={assign}
                            handleAssign={props.handleAssigned}
                        />
                    ) : null }
                </Col>

            </Row>

        </Container>
    )

}

export default CheckinsUnassignedSubview;
