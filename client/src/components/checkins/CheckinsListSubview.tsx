// CheckinsListSubview -------------------------------------------------------

// Render a list of Checkins for the specified Facility and checkinDate,
// followed by summary totals for the listed Checkins.  If there are no
// Checkins yet for the specified checkinDate, offer to generate them
// from one of the available Templates.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import CheckinsTable from "./CheckinsTable";
import FacilityContext from "../facilities/FacilityContext";
import FetchingProgress from "../general/FetchingProgress";
import SummariesTable from "../summaries/SummariesTable";
import TemplateSelector from "../templates/TemplateSelector";
import {HandleCheckin, HandleTemplate} from "../../types";
import useFetchCheckins from "../../hooks/useFetchCheckins";
import useFetchTemplates from "../../hooks/useFetchTemplates";
import useMutateCheckin from "../../hooks/useMutateCheckin";
import Checkin from "../../models/Checkin";
import Summary from "../../models/Summary";
import * as Abridgers from"../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Incoming Properties ------------------------------------------------------

export interface Props {
    checkinDate: string;                // Checkin date we are processing
    handleCheckin: HandleCheckin;       // Handle selected Checkin
}

// Component Details ---------------------------------------------------------

const CheckinsListSubview = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [checkin] = useState<Checkin>(new Checkin());
    const [summary, setSummary] = useState<Summary>(new Summary());

    const fetchCheckins = useFetchCheckins({
        alertPopup: false,
        currentPage: 1,
        date: props.checkinDate,
        pageSize: 100,
        withGuest: true,
    });

    const fetchTemplates = useFetchTemplates({
        active: true,
        alertPopup: true,
        currentPage: 1,
        pageSize: 100,
    })

    const mutateCheckin = useMutateCheckin({
        checkin: checkin,
    });

    useEffect(() => {

        logger.debug({
            context: "CheckinsListSubview.useEffect",
        });

        // Calculate and store the summary totals to be displayed
        const theSummary = new Summary(facilityContext.facility.id, props.checkinDate);
        fetchCheckins.checkins.forEach(aCheckin => {
            theSummary.includeCheckin(aCheckin);
        });
        setSummary(theSummary);

    }, [facilityContext.facility.id, props.checkinDate, fetchCheckins.checkins]);

    const handleGenerate: HandleTemplate = async (theTemplate) => {
        logger.info({
            context: "CheckinsListSubview.handleGenerate",
            checkinDate: props.checkinDate,
            template: Abridgers.TEMPLATE(theTemplate),
        });
        mutateCheckin.generate(props.checkinDate, theTemplate);
        fetchCheckins.refresh();
    }

    return (
        <Container fluid id="CheckinsListSubview">

            {/* Generate from Template if needed */}
            {(facilityContext.facility.id > 0) && (fetchCheckins.checkins.length === 0) ? (
                <Row className="mb-3 text-center">
                    <TemplateSelector
                        actionHelp="Select an active Template to generate mats for Checkins"
                        actionLabel="Generate"
                        handleAction={handleGenerate}
                        label="Select Template:"
                        templates={fetchTemplates.templates}
                    />
                </Row>
            ) : null}

            <Row className="mb-3">
                <FetchingProgress
                    error={fetchCheckins.error}
                    loading={fetchCheckins.loading}
                    message="Fetching selected Checkins"/>
                <CheckinsTable
                    checkins={fetchCheckins.checkins}
                    handleCheckin={props.handleCheckin}
                />
            </Row>

            <Row>
                <SummariesTable
                    summaries={[summary]}
                    withCheckinDate
                />
            </Row>

        </Container>
    )

}

export default CheckinsListSubview;
