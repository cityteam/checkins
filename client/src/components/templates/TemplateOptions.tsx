// TemplateOptions -----------------------------------------------------------

// List Templates that match search criteria, offering callbacks for adding,
// editing, and removing Templates.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import {CheckBox, Pagination, SearchBar} from "@craigmcc/shared-react";

// Internal Modules ----------------------------------------------------------

import FacilityContext from "../facilities/FacilityContext";
import FetchingProgress from "../general/FetchingProgress";
import {HandleAction, HandleBoolean, HandleTemplate, HandleValue} from "../../types";
import useFetchTemplates from "../../hooks/useFetchTemplates";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleAdd?: HandleAction;           // Handle request to add a Template [not allowed]
    handleEdit?: HandleTemplate;        // Handle request to edit a Template [not allowed]
}

// Component Details ---------------------------------------------------------

const TemplateOptions = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [active, setActive] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(100);
    const [searchText, setSearchText] = useState<string>("");

    const fetchTemplates = useFetchTemplates({
        active: active,
        alertPopup: false,
        currentPage: currentPage,
        name: (searchText.length > 0) ? searchText : undefined,
        pageSize: pageSize,
    });

    useEffect(() => {

        logger.debug({
            context: "TemplateOptions.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            active: active,
            currentPage: currentPage,
            searchText: searchText,
        });

    }, [facilityContext.facility,
        active, currentPage, searchText,
        fetchTemplates.templates]);

    const handleActive: HandleBoolean = (theActive) => {
        setActive(theActive);
    }

    const handleAdd: HandleAction = () => {
        if (props.handleAdd) {
            props.handleAdd();
        }
    }

    const handleChange: HandleValue = (theSearchText) => {
        setSearchText(theSearchText);
    }

    const handleEdit: HandleTemplate = (theTemplate) => {
        if (props.handleEdit) {
            props.handleEdit(theTemplate);
        }
    }

    const handleNext: HandleAction = () => {
        setCurrentPage(currentPage + 1);
    }

    const handlePrevious: HandleAction = () => {
        setCurrentPage(currentPage - 1);
    }

    return (
        <Container fluid id="TemplateOptions">

            <FetchingProgress
                error={fetchTemplates.error}
                loading={fetchTemplates.loading}
                message="Fetching selected Templates"
            />

            <Row className="mb-3">
                <Col className="text-center">
                    <strong>
                        <span>Manage Templates for Facility&nbsp;</span>
                        <span className="text-info">{facilityContext.facility.name}</span>
                    </strong>
                </Col>
            </Row>

            <Row className="mb-3 ms-1 me-1">
                <Col className="col-6">
                    <SearchBar
                        autoFocus
                        handleChange={handleChange}
                        label="Search For Templates:"
                        placeholder="Search by all or part of name"
                    />
                </Col>
                <Col>
                    <CheckBox
                        handleChange={handleActive}
                        label="Active Templates Only?"
                        name="activeOnly"
                        value={active}
                    />
                </Col>
                <Col className="text-end">
                    <Pagination
                        currentPage={currentPage}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        lastPage={(fetchTemplates.templates.length === 0) ||
                            (fetchTemplates.templates.length < pageSize)}
                        variant="secondary"
                    />
                </Col>
                <Col className="text-end">
                    <Button
                        disabled={!props.handleAdd}
                        onClick={props.handleAdd}
                        size="sm"
                        variant="primary"
                    >Add</Button>
                </Col>
            </Row>

            <Row className="ms-1 me-1">
                <Table
                    bordered={true}
                    hover={true}
                    size="sm"
                    striped={true}
                >

                    <thead>
                    <tr className="table-secondary">
                        <th scope="col">Name</th>
                        <th scope="col">Active</th>
                        <th scope="col">Comments</th>
                        <th scope="col">All Mats</th>
                        <th scope="col">Handicap Mats</th>
                        <th scope="col">Socket Mats</th>
                        <th scope="col">Work Mats</th>
                    </tr>
                    </thead>

                    <tbody>
                    {fetchTemplates.templates.map((template, ri) => (
                        <tr
                            className="table-default"
                            key={`TO-${ri}-TR`}
                            onClick={props.handleEdit ? (() => handleEdit(template)) : undefined}
                        >
                            <td key={`TO-${ri}-name`}>
                                {template.name}
                            </td>
                            <td key={`TO-${ri}-active`}>
                                {listValue(template.active)}
                            </td>
                            <td key={`TO-${ri}-comments`}>
                                {template.comments}
                            </td>
                            <td key={`TO-${ri}-allMats`}>
                                {template.allMats}
                            </td>
                            <td key={`TO-${ri}-handicapMats`}>
                                {template.handicapMats}
                            </td>
                            <td key={`TO-${ri}-socketMats`}>
                                {template.socketMats}
                            </td>
                            <td key={`TO-${ri}-workMats`}>
                                {template.workMats}
                            </td>
                        </tr>
                    ))}
                    </tbody>

                </Table>
            </Row>

            <Row className="mb-3 ms-1 me-1">
                <Col className="text-end">
                    <Button
                        disabled={!props.handleAdd}
                        onClick={handleAdd}
                        size="sm"
                        variant="primary"
                    >Add</Button>
                </Col>
            </Row>

        </Container>
    )

}

export default TemplateOptions;
