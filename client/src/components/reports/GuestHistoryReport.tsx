// GuestHistoryReport --------------------------------------------------------

// Top-level view for the Guest History Report.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import CheckinsTable from "../checkins/CheckinsTable";
import FacilityContext from "../facilities/FacilityContext";
import GuestsList from "../guests/GuestsList";
import {HandleGuest} from "../../types";
import useFetchCheckins from "../../hooks/useFetchCheckins";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

const GuestHistoryReport = () => {

    const facilityContext = useContext(FacilityContext);

    const [guest, setGuest] = useState<Guest | null>(null);

    const fetchCheckins = useFetchCheckins({
        guestId: guest ? guest.id : undefined,
        withGuest: true,
    });

    useEffect(() => {
        logger.info({
            context: "GuestHistoryReport.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            guest: guest ? Abridgers.GUEST(guest) : null,
        });
    }, [facilityContext.facility, guest])

    const handleGuest: HandleGuest = (theGuest) => {
        logger.trace({
            context: "GuestHistoryReport.handleGuest",
            guest: Abridgers.GUEST(theGuest),
        });
        setGuest(theGuest);
    }

    return (
        <Container fluid id="GuestHistoryReport">

            {/* List Guests View */}
            {(!guest) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            <span><strong>Select Guest for Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <GuestsList
                            canInsert={false}
                            canRemove={false}
                            canUpdate={false}
                            handleSelect={handleGuest}
                        />
                    </Row>

                </>
            ) : null}

            {/* List Checkins View */}
            {(guest) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="col-10 text-left">
                            <span><strong>History for Guest&nbsp;</strong></span>
                            <span className="text-info"><strong>{guest.firstName} {guest.lastName}&nbsp;</strong></span>
                            <span><strong>at Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                        <Col className="col-2 text-right">
                            <Button
                                onClick={() => setGuest(null)}
                                size="sm"
                                type="button"
                                variant="secondary"
                            >Back</Button>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <CheckinsTable
                            checkins={fetchCheckins.checkins}
                            withCheckinDate={true}
                        />
                    </Row>

                </>
            ) : null}

        </Container>
    )

}

export default GuestHistoryReport;
