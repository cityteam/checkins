// TemplatesView -------------------------------------------------------------

// Top-level view for managing Template objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import TemplateForm from "./TemplateForm";
import TemplatesList from "./TemplatesList";
import FacilityContext from "../facilities/FacilityContext";
import LoginContext from "../login/LoginContext";
import {HandleTemplate, OnAction, Scope} from "../../types";
import useMutateTemplate from "../../hooks/useMutateTemplate";
import Template from "../../models/Template";
import logger from "../../util/ClientLogger";

// Component Details ---------------------------------------------------------

const TemplatesView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canInsert, setCanInsert] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [canUpdate, setCanUpdate] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template | null>(null);

    const mutateTemplate = useMutateTemplate({});

    useEffect(() => {

        logger.debug({
            context: "TemplatesView.useEffect",
        });

        const isAdmin = loginContext.validateFacility(facilityContext.facility, Scope.ADMIN);
        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        setCanInsert(isAdmin || isSuperuser);
        setCanRemove(isSuperuser);
        setCanUpdate(isAdmin || isSuperuser);

    }, [facilityContext.facility, loginContext]);

    const handleAdd: OnAction = () => {
        setTemplate(new Template({
            active: true,
            allMats: null,
            facilityId: facilityContext.facility.id,
            handicapMats: null,
            name: null,
            socketMats: null,
            workMats: null,
        }));
    }

    const handleInsert: HandleTemplate = async (theTemplate) => {
        mutateTemplate.insert(theTemplate);
        setTemplate(null);
    }

    const handleRemove: HandleTemplate = async (theTemplate) => {
        mutateTemplate.remove(theTemplate);
        setTemplate(null);
    }

    const handleSelect: HandleTemplate = (theTemplate) => {
        setTemplate(theTemplate);
    }

    const handleUpdate: HandleTemplate = async (theTemplate) => {
        mutateTemplate.update(theTemplate);
        setTemplate(null);
    }

    return (
        <Container fluid id="TemplatesView">

            {/* List View */}
            {(!template) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            <span><strong>Select or Create Templates for Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <TemplatesList
                            canInsert={canInsert}
                            canRemove={canRemove}
                            canUpdate={canUpdate}
                            handleAdd={handleAdd}
                            handleSelect={handleSelect}
                        />
                    </Row>

                </>
            ) : null }

            {/* Detail View */}
            {(template) ? (
                <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Col className="text-left">
                            {(template.id > 0) ? (
                                <span><strong>Edit Existing</strong></span>
                            ) : (
                                <span><strong>Add New</strong></span>
                            )}
                            <span><strong>&nbsp;Template for Facility&nbsp;</strong></span>
                            <span className="text-info"><strong>{facilityContext.facility.name}</strong></span>
                        </Col>
                        <Col className="text-right">
                            <Button
                                onClick={() => setTemplate(null)}
                                size="sm"
                                type="button"
                                variant="secondary"
                            >Back</Button>
                        </Col>
                    </Row>

                    <Row className="mb-3 ml-1 mr-1">
                        <TemplateForm
                            autoFocus={true}
                            canRemove={canRemove}
                            canSave={canInsert || canUpdate}
                            handleInsert={handleInsert}
                            handleRemove={handleRemove}
                            handleUpdate={handleUpdate}
                            template={template}
                        />
                    </Row>

                </>
            ) : null }

        </Container>

    )

}

export default TemplatesView;
