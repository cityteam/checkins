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
import DateSelector from "../general/DateSelector";
import FacilityContext from "../facilities/FacilityContext";
import LoginContext from "../login/LoginContext";
import {HandleCheckin, HandleDate, Scope} from "../../types";
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
    const [stage, setStage] = useState<Stage>(Stage.None);

    useEffect(() => {

        logger.debug({
            context: "CheckinsView.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
        });

        setCanProcess(loginContext.validateFacility(facilityContext.facility, Scope.REGULAR)
            || loginContext.validateFacility(facilityContext.facility, Scope.ADMIN));

    }, [facilityContext.facility, loginContext]);

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

    const handleCheckinDate: HandleDate = (theCheckinDate) => {
        logger.trace({
            context: "CheckinsView.handleCheckinDate",
            checkinDate: theCheckinDate,
        });
        setCheckinDate(theCheckinDate);
        handleStage(Stage.List);
    }

    const handleCompleted: HandleCheckin = (theCompleted) => {
        logger.debug({
            context: "CheckinsView.handleCompletion",
            checkin: Abridgers.CHECKIN(theCompleted),
        });
        handleStage(Stage.List);
    }

    const handleStage = (theStage: Stage): void => {
        logger.trace({
            context: "CheckinsView.handleStage",
            stage: theStage,
        });
        setStage(theStage);
    }

    return (
        <Container fluid id="CheckinsView">

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
                    handleCompleted={handleCompleted}
                />
            ) : null}

        </Container>
    )

}

export default CheckinsView;
