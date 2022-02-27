// CheckinsAssignedSubview ---------------------------------------------------

// Process a Checkin for  currently assigned mat, with three options:
// - Edit the assignment details.
// - Move the assignment to a different unassigned mat on the same date.
// - Remove the assignment, making this mat unassigned and available again.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import CheckinSelector from "./CheckinSelector";
import AssignDetails from "../assigns/AssignDetails";
import {HandleAction, HandleAssign, HandleCheckin, OnAction} from "../../types";
import useFetchCheckins from "../../hooks/useFetchCheckins";
import useMutateCheckin from "../../hooks/useMutateCheckin";
import Assign from "../../models/Assign";
import Checkin from "../../models/Checkin";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkin: Checkin;                   // The (assigned) Checkin to process
    handleCompleted: HandleCheckin;     // Handle Checkin after completion
}

// Component Details ---------------------------------------------------------

const CheckinsAssignedSubview = (props: Props) => {

    // General Support -------------------------------------------------------

    const mutateCheckin = useMutateCheckin({
        checkin: props.checkin,
    });

    useEffect(() => {
        logger.debug({
            context: "CheckinsAssignedSubview.useEffect",
            checkin: Abridgers.CHECKIN(props.checkin),
        });
    }, [props.checkin]);

    // For Option 1 ----------------------------------------------------------

    const configureAssign = (theCheckin: Checkin): Assign => {
        return new Assign({
            comments: theCheckin.comments,
            guestId: theCheckin.guestId,
            paymentAmount: theCheckin.paymentAmount,
            paymentType: theCheckin.paymentType,
            showerTime: theCheckin.showerTime,
            wakeupTime: theCheckin.wakeupTime,
        });
    }

    const handleAssign: HandleAssign = async (theAssign) => {
        const theCheckin = new Checkin({
            ...props.checkin,
            comments: theAssign.comments,
            // guestId: theAssign.guestId,     // Should not have been changed
            paymentAmount: theAssign.paymentAmount,
            paymentType: theAssign.paymentType,
            showerTime: theAssign.showerTime,
            wakeupTime: theAssign.wakeupTime,
        });
        const updated: Checkin = await mutateCheckin.update(theCheckin);
        logger.debug({
            context: "CheckinsAssignedSubview.handleAssign",
            checkin: Abridgers.CHECKIN(updated),
        });
        props.handleCompleted(updated);
    }

    // For Option 2 ----------------------------------------------------------

    const [destination, setDestination] = useState<Checkin>(new Checkin());

    const fetchCheckins = useFetchCheckins({
        available: true,
        currentPage: 1,
        date: props.checkin.checkinDate,
        pageSize: 100,
        // Will not have any Guests, so we do not need withGuest here
    })

    const handleDestination: HandleCheckin = (theDestination) => {
        logger.debug({
            context: "CheckinsAssignedSubview.handleDestination",
            checkin: Abridgers.CHECKIN(theDestination),
        })
        setDestination(theDestination);
    }

    const handleReassign: HandleAction = async () => {
        if (destination.id > 0) {
            const assign = new Assign({
                checkinId: destination.id,
                comments: props.checkin.comments,
                guestId: props.checkin.guestId,
                paymentAmount: props.checkin.paymentAmount,
                paymentType: props.checkin.paymentType,
                showerTime: props.checkin.showerTime,
                wakeupTime: props.checkin.wakeupTime,
            });
            const reassigned = await mutateCheckin.reassign(assign);
            logger.debug({
                context: "CheckinsAssignedSubview.handleReassign",
                checkin: Abridgers.CHECKIN(reassigned),
            });
            props.handleCompleted(reassigned);
        }
    }

    // For Option 3 ----------------------------------------------------------

    const [showDeassignConfirm, setShowDeassignConfirm] = useState<boolean>(false);

    const onDeassignConfirm: OnAction = () => {
        setShowDeassignConfirm(true);
    }

    const onDeassignConfirmNegative: OnAction = () => {
        setShowDeassignConfirm(false);
    }

    const onDeassignConfirmPositive: OnAction = async () => {
        setShowDeassignConfirm(false);
        const removed: Checkin = await mutateCheckin.deassign(props.checkin);
        logger.debug({
            context: "CheckinsAssignedSubview.onDeassignConfirmPositive",
            checkin: Abridgers.CHECKIN(removed),
        });
        props.handleCompleted(removed);
    }

    // User Interface --------------------------------------------------------

    return (
        <Container fluid id="CheckinsAssignedSubview">

            {/* Overall Header and Back Link ----------------------------- */}
            <Row className="mb-3">
                <Col className="col-11 text-center">
                    <h6>
                        <span>Mat Number:&nbsp;</span>
                        <span className="text-info">
                            {props.checkin.matNumber}{props.checkin.features}
                        </span>
                        <span>
                            &nbsp;&nbsp;&nbsp;Guest:&nbsp;
                        </span>
                        <span className="text-info">
                            {props.checkin.guest ? props.checkin.guest.firstName : ""}&nbsp;
                            {props.checkin.guest ? props.checkin.guest.lastName : ""}
                        </span>
                    </h6>
                </Col>
                <Col className="text-right">
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

                {/* Option 1 --------------------------------------------- */}
                <Col className="col-6">
                    <>
                        <h6 className="text-center">
                            Option 1: Edit Assignment Details
                        </h6>
                        <hr className="mb-3"/>
                        <Row>
                            <AssignDetails
                                assign={configureAssign(props.checkin)}
                                handleAssign={handleAssign}
                            />
                        </Row>
                    </>
                </Col>

                {/* Option 2 --------------------------------------------- */}
                <Col className="col-3 bg-light">
                    <>
                        <h6 className="text-center">
                            Option 2: Move Guest to a Different Mat
                        </h6>
                        <hr className="mb-3"/>
                        <Row className="text-center mb-3 ml-5 mr-5">
                            Move this Guest (and related
                            assignment details) to a different mat.
                        </Row>
                        <Row className="text-center">
                            <Col>
                                <CheckinSelector
                                    checkins={fetchCheckins.checkins}
                                    handleCheckin={handleDestination}
                                    label="To Mat:"
                                    placeholder="(Select Mat)"
                                />
                            </Col>
                            <Col className="text-right">
                                <Button
                                    disabled={destination.id < 0}
                                    onClick={handleReassign}
                                    size="sm"
                                    variant="success"
                                >Move</Button>
                            </Col>
                        </Row>
                    </>
                </Col>

                {/* Option 3 --------------------------------------------- */}
                <Col className="col-3">
                    <>
                        <h6 className="text-center">
                            Option 3: Remove Assignment
                        </h6>
                        <hr className="mb-3"/>
                        <Row className="text-center ml-3 mr-3 mb-3">
                            Remove the current assignment, erasing any
                            of the details that were specified.
                        </Row>
                        <Row className="text-right">
                            <Col/>
                            <Button
                                onClick={onDeassignConfirm}
                                size="sm"
                                variant="danger"
                            >
                                Remove
                            </Button>
                        </Row>
                    </>
                </Col>

            </Row>

            {/* Option 3 Confirm Modal ----------------------------------- */}
            <Modal
                animation={false}
                backdrop="static"
                centered
                onHide={onDeassignConfirmNegative}
                show={showDeassignConfirm}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deassign</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Do you really want to remove this assignment
                        and erase the assignment details (including which
                        Guest was assigned to this mat)?
                    </p>
                    <p>
                        If you just want to move an assigned Guest to a
                        different available mat, use Option 2 instead.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={onDeassignConfirmPositive}
                        size="sm"
                        variant="danger"
                    >
                        Confirm
                    </Button>
                    <Button
                        onClick={onDeassignConfirmNegative}
                        size="sm"
                        variant="primary"
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>

    )

}

export default CheckinsAssignedSubview;
