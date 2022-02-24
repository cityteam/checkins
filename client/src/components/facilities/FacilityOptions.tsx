// FacilityOptions -----------------------------------------------------------

// List Facilities that match search criteria, offering callbacks for adding,
// editing, and removing Facilities.

// NOTE - style classes: ml-1, mr-1, text-right

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import CheckBoxComponent from "../general/CheckBoxComponent";
// NOTE - import LoadingProgress from "../general/LoadingProgress";
import PaginationComponent from "../general/PaginationComponent";
import SearchBar from "../general/SearchBar";
import FacilityContext from "./FacilityContext";
import LoginContext from "../login/LoginContext";
import {HandleAction, HandleBoolean, HandleFacility, HandleValue, Scope} from "../../types";
import Facility from "../../models/Facility";
import useFetchFacilities from "../../hooks/useFetchFacilities";
import logger from "../../util/ClientLogger";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleAdd?: HandleAction;           // Handle request to add a Facility [not allowed]
    handleEdit?: HandleFacility;        // Handle request to edit a Facility [not allowed]
}

// Component Details ---------------------------------------------------------

const FacilityOptions = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [active, setActive] = useState<boolean>(false);
    const [availables, setAvailables] = useState<Facility[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(100);
    const [searchText, setSearchText] = useState<string>("");

    const fetchFacilities = useFetchFacilities({
        active: active,
        // NOTE - alertPopup: false,
        currentPage: currentPage,
        name: (searchText.length > 0) ? searchText : undefined,
        pageSize: pageSize,
    });

    useEffect(() => {

        logger.debug({
            context: "FacilityOptions.useEffect",
            active: active,
            currentPage: currentPage,
            searchText: searchText,
        });

        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        if (isSuperuser) {
            setAvailables(fetchFacilities.facilities);
        } else {
            setAvailables(facilityContext.facilities);
        }

    }, [facilityContext, facilityContext.facilities,
        loginContext, loginContext.data.loggedIn,
        active, currentPage, searchText,
        fetchFacilities.facilities]);

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

    const handleEdit: HandleFacility = (theFacility) => {
        if (props.handleEdit) {
            props.handleEdit(theFacility);
        }
    }

    const handleNext: HandleAction = () => {
        setCurrentPage(currentPage + 1);
    }

    const handlePrevious: HandleAction = () => {
        setCurrentPage(currentPage - 1);
    }

    return (
        <Container fluid id="FacilityOptions">

            {/* NOTE - not yet implemented
            <LoadingProgress
                error={fetchFacilities.error}
                loading={fetchUFacilities.loading}
                title="Selected Facilities"
            />
            */}

            <Row className="mb-3 ml-1 mr-1">
                <Col className="col-6">
                    <SearchBar
                        autoFocus
                        handleChange={handleChange}
                        htmlSize={50}
                        label="Search For Facilities:"
                        placeholder="Search by all or part of name"
                    />
                </Col>
                <Col>
                    <CheckBoxComponent
                        handleChange={handleActive}
                        label="Active Facilities Only?"
                        name="activeOnly"
                        value={active}
                    />
                </Col>
                <Col className="text-right">
                    <PaginationComponent
                        currentPage={currentPage}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        lastPage={(fetchFacilities.facilities.length === 0) ||
                            (fetchFacilities.facilities.length < pageSize)}
                        variant="secondary"
                    />
                </Col>
                <Col className="text-right">
                    <Button
                        disabled={!props.handleAdd}
                        onClick={props.handleAdd}
                        size="sm"
                        variant="primary"
                    >Add</Button>
                </Col>
            </Row>

            <Row className="g-2 ml-1 mr-1">
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
                        <th scope="col">City</th>
                        <th scope="col">State</th>
                        <th scope="col">Scope</th>
                    </tr>
                    </thead>

                    <tbody>
                    {availables.map((facility, ri) => (
                        <tr
                            className="table-default"
                            key={`FO-${ri}-TR`}
                            onClick={props.handleEdit ? (() => handleEdit(facility)) : undefined}
                        >
                            <td key={`FO-${ri}-name`}>
                                {facility.name}
                            </td>
                            <td key={`FO-${ri}-active`}>
                                {listValue(facility.active)}
                            </td>
                            <td key={`FO-${ri}-city`}>
                                {facility.city}
                            </td>
                            <td key={`FO-${ri}-state`}>
                                {facility.state}
                            </td>
                            <td key={`FO-${ri}-scope`}>
                                {facility.scope}
                            </td>
                        </tr>
                    ))}
                    </tbody>

                </Table>
            </Row>

            <Row className="mb-3 ml-1 mr-1">
                <Col className="text-right">
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

export default FacilityOptions;
