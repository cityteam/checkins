// CheckinsListSubview -------------------------------------------------------

// Render a list of Checkins for the specified Facility and checkinDate,
// followed by summary totals for the listed Checkins.  If there are no
// Checkins yet for the specified checkinDate, offer to generate them
// from one of the available Templates.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import CheckinsTable from "./CheckinsTable";
import FacilityContext from "../contexts/FacilityContext";
import SummariesTable from "../summaries/SummariesTable";
import TemplateSelector from "../templates/TemplateSelector";
import {HandleCheckin, HandleTemplate} from "../../types";
import useFetchCheckins from "../../hooks/useFetchCheckins";
import useFetchTemplates from "../../hooks/useFetchTemplates";
import useMutateCheckin from "../../hooks/useMutateCheckin";
import Checkin from "../../models/Checkin";
import Summary from "../../models/Summary";
import Template from "../../models/Template";
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
    const [template, setTemplate] = useState<Template>(new Template());

    const fetchCheckins = useFetchCheckins({
        currentPage: 1,
        date: props.checkinDate,
        pageSize: 100,
        withGuest: true,
    });

    const fetchTemplates = useFetchTemplates({
        active: true,
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

    const handleGenerate = async () => {
        logger.debug({
            context: "CheckinsListSubview.handleGenerate",
            checkinDate: props.checkinDate,
            template: Abridgers.TEMPLATE(template),
        });
        mutateCheckin.generate(props.checkinDate, template);
        fetchCheckins.refresh();
    }

    const handleTemplate: HandleTemplate = (theTemplate) => {
        logger.trace({
            context: "CheckinsListSubview.handleTemplate",
            template: Abridgers.TEMPLATE(theTemplate),
        });
        setTemplate(theTemplate);
    }

    return (
        <Container fluid id="CheckinsListSubview">

            {/* Generate from Template if needed */}
            {(facilityContext.facility.id > 0) && (fetchCheckins.checkins.length === 0) ? (
                <Row className="mb-3 text-center">
                    <TemplateSelector
                        handleTemplate={handleTemplate}
                        label="Select Template:"
                        templates={fetchTemplates.templates}
                    />
                    <span className="ml-2 mr-2">
                        <Button
                            disabled={template.id < 0}
                            onClick={handleGenerate}
                            size="sm"
                            variant="primary"
                        >Generate</Button>
                    </span>
                    <span>
                        (Select an active Template to generate mats for Checkins)
                    </span>
                </Row>
            ) : null}

            <Row className="mb-3">
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
