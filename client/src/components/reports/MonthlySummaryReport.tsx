// MonthlySummaryReport ------------------------------------------------------

// Top-level view for the Monthly Summary Report.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityContext from "../facilities/FacilityContext";
import FetchingProgress from "../general/FetchingProgress";
import MonthSelector from "../general/MonthSelector";
import SummariesTable from "../summaries/SummariesTable";
import {HandleMonth} from "../../types";
import useFetchSummaries from "../../hooks/useFetchSummaries";
import Summary from "../../models/Summary";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import {endDate, startDate, todayMonth} from "../../util/Months";

// Component Details ---------------------------------------------------------

const MonthlySummaryReport = () => {

    const facilityContext = useContext(FacilityContext);

    const [checkinDateFrom, setCheckinDateFrom] = useState<string>("2021-08-01");
    const [checkinDateTo, setCheckinDateTo] = useState<string>("2021-08-31");
    const [reportMonth, setReportMonth] = useState<string>(todayMonth());
    const [title, setTitle] = useState<string>(`Monthly Totals for ${reportMonth}`);
    const [totals, setTotals] = useState<Summary>(new Summary());

    const fetchSummaries = useFetchSummaries({
        checkinDateFrom: checkinDateFrom,
        checkinDateTo: checkinDateTo,
    });

    useEffect(() => {
        const newCheckinDateFrom = startDate(reportMonth);
        const newCheckinDateTo = endDate(reportMonth);
        logger.info({
            context: "MonthlySummaryReport.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            checkinDateFrom: newCheckinDateFrom,
            checkinDateTo: newCheckinDateTo,
            reportMonth: reportMonth,
        });
        setCheckinDateFrom(newCheckinDateFrom);
        setCheckinDateTo(newCheckinDateTo);
        setTitle(`Monthly Totals for ${reportMonth}`);
        const theTotals = new Summary();
        fetchSummaries.summaries.forEach(summary => {
            theTotals.includeSummary(summary);
        });
        setTotals(theTotals);

    }, [facilityContext.facility, fetchSummaries.summaries, reportMonth]);

    const handleReportMonth: HandleMonth = (theReportMonth) => {
        logger.trace({
            context: "MonthlySummaryReport.handleMonth",
            month: theReportMonth,
        });
        setReportMonth(theReportMonth);
        setCheckinDateFrom(startDate(theReportMonth));
        setCheckinDateTo(endDate(theReportMonth));
    }

    return (
        <Container fluid id="MonthlySummaryReport">

            <FetchingProgress
                error={fetchSummaries.error}
                loading={fetchSummaries.loading}
                message="Fetching selected Summaries"
            />

            <Row className="mb-3 ms-1 me-1">
                <Col className="text-start">
                    <span><strong>Monthly Summary Report for Facility&nbsp;</strong></span>
                    <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                </Col>
                <Col className="text-end">
                    <MonthSelector
                        autoFocus
                        handleMonth={handleReportMonth}
                        label="Report Month:"
                        value={reportMonth}
                    />
                </Col>
            </Row>

            <Row className="ms-1 me-1">
                <SummariesTable
                    summaries={fetchSummaries.summaries}
                    withCheckinDate
                />
            </Row>

            <Row className="ms-1 me-1">
                <SummariesTable
                    summaries={[totals]}
                    title={title}
                />
            </Row>

        </Container>
    )

}

export default MonthlySummaryReport;
