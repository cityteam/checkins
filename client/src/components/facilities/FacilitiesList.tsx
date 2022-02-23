// FacilitiesList -----------------------------------------------------------------

// List Facilities that match search criteria, offering callbacks for adding,
// editing, and removing Facilities.

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import CheckBox from "../general/CheckBox";
import Pagination from "../general/Pagination";
import SearchBar from "../general/SearchBar";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import {HandleBoolean, HandleFacility, HandleValue, OnAction, Scope} from "../../types";
import Facility from "../../models/Facility";
import useFetchFacilities from "../../hooks/useFetchFacilities";
import logger from "../../util/ClientLogger";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    canInsert: boolean;                 // Can this user add Facilities?
    canRemove: boolean;                 // Can this user remove Facilities?
    canUpdate: boolean;                 // Can this user edit Facilities?
    handleAdd: OnAction;                // Handle request to add a Facility
    handleSelect: HandleFacility;       // Handle request to select a Facility
}

// Component Details ---------------------------------------------------------

const FacilitiesList = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [active, setActive] = useState<boolean>(false);
    const [availables, setAvailables] = useState<Facility[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(100);
    const [searchText, setSearchText] = useState<string>("");

    const fetchFacilities = useFetchFacilities({
        active: active,
        currentPage: currentPage,
        name: (searchText.length > 0) ? searchText : undefined,
        pageSize: pageSize,
    });

    useEffect(() => {

        logger.info({
            context: "FacilitiesList.useEffect"
        });

        const isSuperuser = loginContext.validateScope(Scope.SUPERUSER);
        if (isSuperuser) {
            setAvailables(fetchFacilities.facilities);
        } else {
            setAvailables(facilityContext.facilities);
        }

    }, [facilityContext.facilities, fetchFacilities.facilities, loginContext]);

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
        <Container fluid id="FacilitiesList">

            <Row className="mb-3 ml-1 mr-1">
                <Col className="col-6">
                    <SearchBar
                        autoFocus
                        handleChange={handleChange}
                        label="Search For Facilities:"
                        placeholder="Search by all or part of name"
                    />
                </Col>
                <Col>
                    <CheckBox
                        handleChange={handleActive}
                        id="activeOnly"
                        initialValue={active}
                        label="Active Facilities Only?"
                    />
                </Col>
                <Col className="text-right">
                    <Pagination
                        currentPage={currentPage}
                        lastPage={(fetchFacilities.facilities.length === 0) ||
                        (fetchFacilities.facilities.length < pageSize)}
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
                        <th scope="col">City</th>
                        <th scope="col">State</th>
                        <th scope="col">Scope</th>
                    </tr>
                    </thead>

                    <tbody>
                    {availables.map((facility, rowIndex) => (
                        <tr
                            className="table-default"
                            key={1000 + (rowIndex * 100)}
                            onClick={() => props.handleSelect(facility)}
                        >
                            <td key={1000 + (rowIndex * 100) + 1}>
                                {facility.name}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 2}>
                                {listValue(facility.active)}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 3}>
                                {facility.city}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 4}>
                                {facility.state}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 5}>
                                {facility.scope}
                            </td>
                        </tr>
                    ))}
                    </tbody>

                </Table>
            </Row>

        </Container>
    )

}

export default FacilitiesList;
