// BansReport ----------------------------------------------------------------

// Report all Bans that cover the specified date.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import FacilityContext from "../facilities/FacilityContext";
import DateSelector from "../general/DateSelector";
import FetchingProgress from "../general/FetchingProgress";
import {HandleDate} from "../../types";
import useFetchBans from "../../hooks/useFetchBans";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import {todayDate} from "../../util/Dates"

// Component Details ---------------------------------------------------------

interface Entry {
    comments: string,
    firstName: string,
    fromDate: string,
    lastName: string,
    staff: string,
    toDate: string,
}

const BansReport = () => {

    const facilityContext = useContext(FacilityContext);

    const [actives, setActives] = useState<Entry[]>([]);
    const [inactives, setInactives] = useState<Entry[]>([]);
    const [reportDate, setReportDate] = useState<string>(todayDate());

    const fetchBans = useFetchBans({
        alertPopup: false,
        fromDate: reportDate,
        pageSize: 100,
        toDate: reportDate,
        withGuest: true,
    });

    useEffect(() => {

        logger.debug({
            context: "BansReport",
            facility: Abridgers.FACILITY(facilityContext.facility),
            reportDate: reportDate,
        });

        let theActives: Entry[] = [];
        let theInactives: Entry[] = [];
        fetchBans.bans.forEach(ban => {
            let firstName: string = `Guest ${ban.guestId} FN`;
            let lastName: string = `Guest ${ban.guestId} LN`;
            if (ban.guest) {
                firstName = ban.guest.firstName;
                lastName = ban.guest.lastName;
            }
            const entry = {
                comments: ban.comments,
                firstName: firstName,
                fromDate: ban.fromDate,
                lastName: lastName,
                staff: ban.staff,
                toDate: ban.toDate,
            };
            ban.active ? theActives.push(entry) : theInactives.push(entry);
        });
        setActives(sortEntries(theActives));
        setInactives(sortEntries(theInactives));
        logger.info({
            context: "BansReport.useEffect",
            bans: fetchBans.bans,
            actives: theActives,
            inactives: theInactives,
        });

    }, [facilityContext.facility, reportDate, fetchBans.bans]);

    const handleReportDate: HandleDate = (theDate) => {
        setReportDate(theDate);
    }

    const sortEntries = (entries: Entry[]): Entry[] => {
        return entries.sort(function (a, b) {
            if (a.lastName > b.lastName) {
                return 1;
            } else if (a.lastName < b.lastName) {
                return -1;
            } else {
                if (a.firstName > b.firstName) {
                    return 1;
                } else if (a.firstName < b.firstName) {
                    return -1;
                } else {
                    if (a.fromDate > b.fromDate) {
                        return 1;
                    } else if (a.fromDate < b.fromDate) {
                        return -1;
                    } else {
                        if (a.toDate > b.toDate) {
                            return 1;
                        } else if (a.toDate < b.toDate) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        })
    }

    return (
        <Container fluid id="BansReport">

            <FetchingProgress
                error={fetchBans.error}
                loading={fetchBans.loading}
                message="Fetching selected Bans"
            />

            <Row className="mb-3 ms-1 me-1">
                <Col className="text-start">
                    <span><strong>Scheduled Bans for Facility&nbsp;</strong></span>
                    <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                </Col>
                <Col className="text-end">
                    <DateSelector
                        autoFocus
                        handleDate={handleReportDate}
                        label="As Of Date:"
                        value={reportDate}
                    />
                </Col>
            </Row>

            <Row className="mb-3 ms-1 me-1">
                <Table
                    bordered={true}
                    id="ActivesTable"
                    size="sm"
                    striped={true}
                >

                    <thead>
                    <tr className="table-dark">
                        <th className="text-center" colSpan={99}>
                            ACTIVE Bans
                        </th>
                    </tr>
                    <tr className="table-secondary">
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">From Date</th>
                        <th scope="col">To Date</th>
                        <th scope="col">Staff</th>
                        <th scope="col">Comments</th>
                    </tr>
                    </thead>

                    {actives.map((entry, ei) => (
                        <tr className="table-default" key={`A-${ei}-tr`}>
                            <td key={`A-${ei}-firstName`}>
                                {entry.firstName}
                            </td>
                            <td key={`A-${ei}-lastName`}>
                                {entry.lastName}
                            </td>
                            <td key={`A-${ei}-fromDate`}>
                                {entry.fromDate}
                            </td>
                            <td key={`A-${ei}-toDate`}>
                                {entry.toDate}
                            </td>
                            <td key={`A-${ei}-staff`}>
                                {entry.staff}
                            </td>
                            <td key={`A-${ei}-comments`}>
                                {entry.comments}
                            </td>
                        </tr>
                    ))}

                </Table>
            </Row>

            <Row className="mb-3 ms-1 me-1">
                <Table
                    bordered={true}
                    id="InactivesTable"
                    size="sm"
                    striped={true}
                >

                    <thead>
                    <tr className="table-dark">
                        <th className="text-center" colSpan={99}>
                            INACTIVE Bans
                        </th>
                    </tr>
                    <tr className="table-secondary">
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">From Date</th>
                        <th scope="col">To Date</th>
                        <th scope="col">Staff</th>
                        <th scope="col">Comments</th>
                    </tr>
                    </thead>

                    {inactives.map((entry, ei) => (
                        <tr className="table-default" key={`I-${ei}-tr`}>
                            <td key={`I-${ei}-firstName`}>
                                {entry.firstName}
                            </td>
                            <td key={`I-${ei}-lastName`}>
                                {entry.lastName}
                            </td>
                            <td key={`I-${ei}-fromDate`}>
                                {entry.fromDate}
                            </td>
                            <td key={`I-${ei}-toDate`}>
                                {entry.toDate}
                            </td>
                            <td key={`I-${ei}-staff`}>
                                {entry.staff}
                            </td>
                            <td key={`I-${ei}-comments`}>
                                {entry.comments}
                            </td>
                        </tr>
                    ))}

                </Table>
            </Row>

        </Container>
    )

}

export default BansReport;
