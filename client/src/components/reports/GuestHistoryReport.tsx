// GuestHistoryReport --------------------------------------------------------

// Top-level view for the Guest History Report.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {FetchingProgress} from "@craigmcc/shared-react";

// Internal Modules ----------------------------------------------------------

import CheckinsTable from "../checkins/CheckinsTable";
import FacilityContext from "../facilities/FacilityContext";
import GuestOptions from "../guests/GuestOptions";
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
        alertPopup: false,
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

                    <Row className="mb-3 ms-1 me-1">
                        <Col className="text-left">
                            <span><strong>Select Guest for Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                    </Row>

                    <Row className="mb-3 ms-1 me-1">
                        <GuestOptions
                            handleEdit={handleGuest}
                            withActive={true}
                            withCheckinDates={false}
                            withHeading={false}
                        />
                    </Row>

                </>
            ) : null}

            {/* List Checkins View */}
            {(guest) ? (
                <>

                    <FetchingProgress
                        error={fetchCheckins.error}
                        loading={fetchCheckins.loading}
                        message="Fetching selected Checkins"
                    />

                    <Row className="mb-3 ms-1 me-1">
                        <Col className="col-10 text-start">
                            <span><strong>History for Guest&nbsp;</strong></span>
                            <span className="text-info"><strong>{guest.firstName} {guest.lastName}&nbsp;</strong></span>
                            <span><strong>at Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                        <Col className="col-2 text-end">
                            <Button
                                onClick={() => setGuest(null)}
                                size="sm"
                                type="button"
                                variant="secondary"
                            >Back</Button>
                        </Col>
                    </Row>

                    <Row className="mb-3 ms-1 me-1">
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
