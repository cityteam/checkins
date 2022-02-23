// TemplatesList -------------------------------------------------------------

// List Templates that match search criteria, offering callbacks for adding,
// editing, and removing Templates.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import CheckBox from "../general/CheckBox";
import Pagination from "../general/Pagination";
import SearchBar from "../general/SearchBar";
import {HandleBoolean, HandleTemplate, HandleValue, OnAction} from "../../types";
import useFetchTemplates from "../../hooks/useFetchTemplates";
import logger from "../../util/ClientLogger";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    canInsert: boolean;                 // Can this user add Templates?
    canRemove: boolean;                 // Can this user remove Templates?
    canUpdate: boolean;                 // Can this user update Templates?
    handleAdd: OnAction;                // Handle request to add a Template
    handleSelect: HandleTemplate;       // Handle request to select a Template
}

// Component Details ---------------------------------------------------------

const TemplatesList = (props: Props) => {

    const [active, setActive] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(100);
    const [searchText, setSearchText] = useState<string>("");

    const fetchTemplates = useFetchTemplates({
        active: active,
        currentPage: currentPage,
        name: (searchText.length > 0) ? searchText : undefined,
        pageSize: pageSize,
    });

    useEffect(() => {

        logger.debug({
            context: "TemplatesList.useEffect"
        });

    }, [fetchTemplates.templates]);

    const handleActive: HandleBoolean = (theActive) => {
        setActive(theActive);
    }

    const handleChange: HandleValue = (theSearchText) => {
        setSearchText(theSearchText);
    }

    const onNext: OnAction = () => {
        setCurrentPage(currentPage + 1);
    }

    const onPrevious: OnAction = () => {
        setCurrentPage(currentPage - 1);
    }

    return (
        <Container fluid id="TemplatesList">

            <Row className="mb-3 ml-1 mr-1">
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
                        id="activeOnly"
                        initialValue={active}
                        label="Active Templates Only?"
                    />
                </Col>
                <Col className="text-right">
                    <Pagination
                        currentPage={currentPage}
                        lastPage={(fetchTemplates.templates.length === 0) ||
                            (fetchTemplates.templates.length < pageSize)}
                        onNext={onNext}
                        onPrevious={onPrevious}
                        variant="secondary"
                    />
                </Col>
                <Col className="text-right">
                    <Button
                        disabled={!props.canInsert}
                        onClick={props.handleAdd}
                        size="sm"
                        variant="primary"
                    >Add</Button>
                </Col>
            </Row>

            <Row className="ml-1 mr-1">
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
                    {fetchTemplates.templates.map((template, rowIndex) => (
                        <tr
                            className="table-default"
                            key={1000 + (rowIndex * 100)}
                            onClick={() => props.handleSelect(template)}
                        >
                            <td key={1000 + (rowIndex * 100) + 1}>
                                {template.name}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 2}>
                                {listValue(template.active)}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 3}>
                                {template.comments}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 4}>
                                {template.allMats}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 5}>
                                {template.handicapMats}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 6}>
                                {template.socketMats}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 7}>
                                {template.workMats}
                            </td>
                        </tr>
                    ))}
                    </tbody>

                </Table>
            </Row>

        </Container>
    )

}

export default TemplatesList;
