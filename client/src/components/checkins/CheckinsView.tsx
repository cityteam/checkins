// CheckinsView --------------------------------------------------------------

// Regular user view for managing Guest Checkins.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {Dates} from "@craigmcc/shared-utils";

// Internal Modules ---------------------------------------------------------

import CheckinsAssignedSubview from "./CheckinsAssignedSubview";
import CheckinsListSubview from "./CheckinsListSubview";
import CheckinsUnassignedSubview from "./CheckinsUnassignedSubview";
import FacilityContext from "../facilities/FacilityContext";
import DateSelector from "../general/DateSelector";
import MutatingProgress from "../general/MutatingProgress";
import LoginContext from "../login/LoginContext";
import {HandleAssign, HandleCheckin, HandleDate, Scope} from "../../types";
import useMutateCheckin from "../../hooks/useMutateCheckin";
import Checkin from "../../models/Checkin";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

enum Stage {
    None = "None",
    List = "List",
    Assigned = "Assigned",
    Unassigned = "Unassigned",
}

const CheckinsView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canProcess, setCanProcess] = useState<boolean>(false);
    const [checkin, setCheckin] = useState<Checkin | null>(null);
    const [checkinDate, setCheckinDate] = useState<string>(Dates.today());
    const [message, setMessage] = useState<string>("");
    const [stage, setStage] = useState<Stage>(Stage.None);

    const mutateCheckin = useMutateCheckin({
        alertPopup: false,
        checkin: checkin ? checkin : new Checkin(),
    });

    useEffect(() => {

        logger.debug({
            context: "CheckinsView.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
        });

        setCanProcess(loginContext.validateFacility(facilityContext.facility, Scope.REGULAR)
            || loginContext.validateFacility(facilityContext.facility, Scope.ADMIN));

    }, [facilityContext.facility, loginContext]);

    // Handle assignment of a Guest to a particular Checkin
    const handleAssigned: HandleAssign = async (theAssign) => {
        setMessage(`Handling assignment to mat ${checkin?.matNumber}`);
        const assigned: Checkin = await mutateCheckin.assign(theAssign);
        logger.debug({
            context: "CheckinsView.handleAssigned",
            checkin: Abridgers.CHECKIN(assigned),
        });
        handleCompleted(assigned);
    }

    // Handle selection of a particular Checkin to be processed
    const handleCheckin: HandleCheckin = (theCheckin) => {
        logger.debug({
            context: "CheckinsView.handleCheckin",
            checkin: Abridgers.CHECKIN(theCheckin),
        });
        if (canProcess) {
            setCheckin(theCheckin);
            handleStage(theCheckin.guestId ? Stage.Assigned : Stage.Unassigned);
        }
    }

    // Handle updates to the requested Checkin date
    const handleCheckinDate: HandleDate = (theCheckinDate) => {
        logger.trace({
            context: "CheckinsView.handleCheckinDate",
            checkinDate: theCheckinDate,
        });
        setCheckinDate(theCheckinDate);
        handleStage(Stage.List);
    }

    // Handle completion of processing after assigned or unassigned work
    const handleCompleted: HandleCheckin = (theCompleted) => {
        logger.debug({
            context: "CheckinsView.handleCompletion",
            checkin: Abridgers.CHECKIN(theCompleted),
        });
        handleStage(Stage.List);
    }

    // Handle deassignment of an assigned Guest
    const handleDeassigned: HandleCheckin = async (theCheckin) => {
        setMessage(`Handling deassignment from mat ${checkin?.matNumber}`);
        const deassigned = await mutateCheckin.deassign(theCheckin);
        logger.debug({
            context: "CheckinsView.handleDeassigned",
            checkin: Abridgers.CHECKIN(deassigned),
        });
        handleCompleted(deassigned);
    }

    // Handle reassignment of a checked-in Guest to a different mat
    const handleReassigned: HandleAssign = async (theAssign) => {
        setMessage(`Handling reassignment from mat ${checkin?.matNumber}`);
        const reassigned = await mutateCheckin.reassign(theAssign);
        logger.debug({
            context: "CheckinsView.handleReassigned",
            checkin: Abridgers.CHECKIN(reassigned),
        });
        handleCompleted(reassigned);
    }

    // Handle selection of a new view Stage
    const handleStage = (theStage: Stage): void => {
        logger.trace({
            context: "CheckinsView.handleStage",
            stage: theStage,
        });
        setStage(theStage);
    }

    // Handle update of the Checkin details for an existing assignment
    const handleUpdated: HandleAssign = async (theAssign) => {
        const theCheckin = new Checkin({
            ...checkin,
            comments: theAssign.comments,
            // guestId: theAssign.guestId,     // Should not have been changed
            paymentAmount: theAssign.paymentAmount,
            paymentType: theAssign.paymentType,
            showerTime: theAssign.showerTime,
            wakeupTime: theAssign.wakeupTime,
        });
        setMessage(`Handling assignment to mat ${theCheckin.matNumber}`);
        const updated: Checkin = await mutateCheckin.update(theCheckin);
        logger.debug({
            context: "CheckinsView.handleUpdated",
            checkin: Abridgers.CHECKIN(updated),
        });
        handleCompleted(updated);
    }

    return (
        <Container fluid id="CheckinsView">

            <MutatingProgress
                error={mutateCheckin.error}
                executing={mutateCheckin.executing}
                message={message}
            />

            {/* Title and Checkin Date Selector always visible */}
            <Row className="mb-3 ms-1 me-1">
                <Col className="text-start">
                    <span><strong>Manage Checkins for Facility&nbsp;</strong></span>
                    <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                </Col>
                <Col className="text-end">
                    <DateSelector
                        autoFocus
                        handleDate={handleCheckinDate}
                        label="Checkin Date:"
                        required
                        value={checkinDate}
                    />
                </Col>
            </Row>

            {/* Selected Subview by stage */}
            {(stage === Stage.Assigned) ? (
                <CheckinsAssignedSubview
                    checkin={checkin ? checkin : new Checkin()}
                    handleCompleted={handleCompleted}
                    handleDeassigned={handleDeassigned}
                    handleReassigned={handleReassigned}
                    handleUpdated={handleUpdated}
                />
            ) : null}
            {(stage === Stage.List) ? (
                <CheckinsListSubview
                    checkinDate={checkinDate}
                    handleCheckin={handleCheckin}
                />
            ) : null}
            {(stage === Stage.Unassigned) ? (
                <CheckinsUnassignedSubview
                    checkin={checkin ? checkin : new Checkin()}
                    checkinDate={checkinDate}
                    handleAssigned={handleAssigned}
                    handleCompleted={handleCompleted}
                />
            ) : null}

        </Container>
    )

}

export default CheckinsView;
