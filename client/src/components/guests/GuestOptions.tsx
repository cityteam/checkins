// GuestOptions -------------------------------------------------------------

// List Guests that match search criteria, offering callbacks for adding,
// editing, and removing Guests.

// NOTE - style classes: ml-1, mr-1, text-right

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import FacilityContext from "../facilities/FacilityContext";
import CheckBox from "../general/CheckBox";
// NOTE - import LoadingProgress from "../general/LoadingProgress";
import Pagination from "../general/Pagination";
import SearchBar from "../general/SearchBar";
import {HandleAction, HandleBoolean, HandleGuest, HandleValue} from "../../types";
import useFetchGuests from "../../hooks/useFetchGuests";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import * as Sorters from "../../util/Sorters";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkinDates?: boolean;             // Include checkin dates unconditionally? [false]
    handleAdd?: HandleAction;           // Handle request to add a Guest [not allowed]
    handleEdit?: HandleGuest;           // Handle request to select a Guest [not allowed]
    withActive?: boolean;               // Offer "Active Guests Only?" filter [true]
    withCheckinDates?: boolean;         // Offer "With Checkin Dates?" filter [true]
    withHeading?: boolean;              // Include "Manage Guests for ..." heading? [true]
}

// Component Details ---------------------------------------------------------

const GuestOptions = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [active, setActive] = useState<boolean>(false);
    const [checkinDates, setCheckinDates] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(15);
    const [searchText, setSearchText] = useState<string>("");
    const [withActive] =
        useState<boolean>(props.withActive !== undefined ? props.withActive : true);
    const [withCheckinDates] =
        useState<boolean>(props.withCheckinDates !== undefined ? props.withCheckinDates : true);
    const [withHeading] =
        useState<boolean>(props.withHeading !== undefined ? props.withHeading : true);

    const fetchGuests = useFetchGuests({
        active: active,
        // NOTE - alertPopup: false
        currentPage: currentPage,
        name: (searchText.length > 0) ? searchText : undefined,
        pageSize: pageSize,
        withCheckins: checkinDates || props.checkinDates,
    });

    useEffect(() => {

        logger.debug({
            context: "GuestOptions.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            active: active,
            currentPage: currentPage,
            searchText: searchText,
        });

    }, [facilityContext.facility,
        active, currentPage, searchText,
        fetchGuests.guests]);

    const checkins = (guest: Guest): string => {
        const results: string[] = [];
        if (guest.checkins) {
            const theCheckins = Sorters.CHECKINS(guest.checkins);
            theCheckins.forEach(checkin => {
                if (checkin.checkinDate) {
                    results.push(checkin.checkinDate);
                }
            })
        }
        return results.join(" ");
    }

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

    const handleCheckinDates: HandleBoolean = (theCheckinDates) => {
        setCheckinDates(theCheckinDates);
    }

    const handleEdit: HandleGuest = (theGuest) => {
        if (props.handleEdit) {
            props.handleEdit(theGuest);
        }
    }

    const handleNext: HandleAction = () => {
        setCurrentPage(currentPage + 1);
    }

    const handlePrevious: HandleAction = () => {
        setCurrentPage(currentPage - 1);
    }

    return (
        <Container fluid id="GuestOptions">

            {/* NOTE - not yet implemented
            <LoadingProgress
                error={fetchGuests.error}
                loading={fetchGuests.loading}
                title="Selected Guests"
            />
            */}

            {withHeading ? (
                <Row className="mb-3">
                    <Col className="text-center">
                        <strong>
                            <span>Manage Guests for Facility&nbsp;</span>
                            <span className="text-info">{facilityContext.facility.name}</span>
                        </strong>
                    </Col>
                </Row>
            ) : null }

            <Row className="mb-3 ms-1 me-1">
                <Col className="col-6">
                    <SearchBar
                        autoFocus
                        handleChange={handleChange}
                        label="Search For Guests:"
                        placeholder="Search by all or part of either name"
                    />
                </Col>
                {withActive ? (
                    <Col>
                        <CheckBox
                            handleChange={handleActive}
                            label="Active Guests Only?"
                            name="activeOnly"
                            value={active}
                        />
                    </Col>
                ) : null}
                {withCheckinDates ? (
                    <Col>
                        <CheckBox
                            handleChange={handleCheckinDates}
                            label="With Checkin Dates?"
                            name="checkinDates"
                            value={checkinDates}
                        />
                    </Col>
                ) : null}
                <Col className="text-end">
                    <Pagination
                        currentPage={currentPage}
                        lastPage={(fetchGuests.guests.length === 0) ||
                            (fetchGuests.guests.length < pageSize)}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        variant="secondary"
                    />
                </Col>
                {props.handleAdd ? (
                    <Col className="text-end">
                        {props.handleAdd ? (
                            <Button
                                disabled={!props.handleAdd}
                                onClick={props.handleAdd}
                                size="sm"
                                variant="primary"
                            >Add</Button>
                        ) : null}
                    </Col>
                ) : null}
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
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        {(checkinDates) ? (
                            <th scope="col">Checkin Dates</th>
                        ) : (
                            <>
                                <th scope="col">Active</th>
                                <th scope="col">Comments</th>
                                <th scope="col">Favorite</th>
                            </>
                        )}
                    </tr>
                    </thead>

                    <tbody>
                    {fetchGuests.guests.map((guest, ri) => (
                        <tr
                            className="table-default"
                            key={`GO-${ri}-TR`}
                            onClick={props.handleEdit ? (() => handleEdit(guest)) : undefined}
                        >
                            <td key={`GO-${ri}-firstName`}>
                                {guest.firstName}
                            </td>
                            <td key={`GO-${ri}-lastName`}>
                                {guest.lastName}
                            </td>
                            {(checkinDates) ? (
                                <td key={`GO-${ri}-checkins`}>
                                    {checkins(guest)}
                                </td>
                            ) : (
                                <>
                                    <td key={`GO-${ri}-active`}>
                                        {listValue(guest.active)}
                                    </td>
                                    <td key={`GO-${ri}-comments`}>
                                        {guest.comments}
                                    </td>
                                    <td key={`GO-${ri}-favorite`}>
                                        {guest.favorite}
                                    </td>
                                </>
                            )}


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

export default GuestOptions;
