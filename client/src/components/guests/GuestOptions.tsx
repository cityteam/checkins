// GuestOptions -------------------------------------------------------------

// List Guests that match search criteria, offering callbacks for adding,
// editing, and removing Guests.

// NOTE - style classes: ml-1, mr-1, text-right

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import GuestStatus from "./GuestStatus";
import BanOptions from "../bans/BanOptions";
import FacilityContext from "../facilities/FacilityContext";
import CheckBox from "../general/CheckBox";
import FetchingProgress from "../general/FetchingProgress";
import Pagination from "../general/Pagination";
import SearchBar from "../general/SearchBar";
import {HandleAction, HandleBoolean, HandleGuest, HandleValue} from "../../types";
import useFetchGuests from "../../hooks/useFetchGuests";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import * as Sorters from "../../util/Sorters";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkinDates?: boolean;             // Include checkin dates unconditionally? [false]
    handleAdd?: HandleAction;           // Handle request to add a Guest [not allowed]
    handleEdit?: HandleGuest;           // Handle request to select a Guest [not allowed]
    prefix?: string;                    // Prefix for element IDs and keys [none]
    selectCheckinDates?: boolean;       // Preselect "With Checkin Dates" filter [false]
    updateSearch?: boolean;             // Update search text on edit? [false]
    withActive?: boolean;               // Offer "Active Guests Only?" filter [true]
    withCheckinDates?: boolean;         // Offer "With Checkin Dates?" filter [true]
    withHeading?: boolean;              // Include "Manage Guests for ..." heading? [true]
    withHeadingBan?: boolean;           // Include "Manage Bans for ..." heading? [false]
}

// Component Details ---------------------------------------------------------

const GuestOptions = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [active, setActive] = useState<boolean>(false);
    const [checkinDates, setCheckinDates] = useState<boolean>((props.selectCheckinDates !== undefined) ? props.selectCheckinDates : false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [guest, setGuest] = useState<Guest>(new Guest());
    const [pageSize] = useState<number>(15);
    const [prefix] = useState<string>(props.prefix ? props.prefix : "");
    const [searchText, setSearchText] = useState<string>("");
    const [showBans, setShowBans] = useState<boolean>(false);
    const [updateSearch] = useState<boolean>((props.updateSearch !== undefined) ? props.updateSearch : false);
    const [withActive] =
        useState<boolean>(props.withActive !== undefined ? props.withActive : true);
    const [withCheckinDates] =
        useState<boolean>(props.withCheckinDates !== undefined ? props.withCheckinDates : true);
    const [withHeading] =
        useState<boolean>(props.withHeading !== undefined ? props.withHeading : true);
    const [withHeadingBan] =
        useState<boolean>(props.withHeadingBan !== undefined ? props.withHeadingBan : false);

    const fetchGuests = useFetchGuests({
        active: active,
        alertPopup: false,
        currentPage: currentPage,
        name: (searchText.length > 0) ? searchText : undefined,
        pageSize: pageSize,
        withBans: true,
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

    const handleCloseBans: HandleAction = () => {
        setShowBans(false);
    }

    const handleEdit: HandleGuest = (theGuest) => {
        if (updateSearch) {
            setSearchText(`${theGuest.firstName} ${theGuest.lastName}`);
        }
        if (props.handleEdit) {
            props.handleEdit(theGuest);
        }
    }

    const handleNext: HandleAction = () => {
        setCurrentPage(currentPage + 1);
    }

    const handleOpenBans: HandleGuest = (theGuest) => {
        setGuest(theGuest);
        setShowBans(true);
    }

    const handlePrevious: HandleAction = () => {
        setCurrentPage(currentPage - 1);
    }

    return (
        <>
        <Container fluid id={`${prefix}GuestOptions`}>

            <FetchingProgress
                error={fetchGuests.error}
                loading={fetchGuests.loading}
                message="Fetching selected Guests"
            />

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

            {withHeadingBan ? (
                <Row className="mb-3">
                    <Col className="text-center">
                        <strong>
                            <span>Manage Bans for Facility&nbsp;</span>
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
                            name={`${prefix}activeOnly`}
                            value={active}
                        />
                    </Col>
                ) : null}
                {withCheckinDates ? (
                    <Col>
                        <CheckBox
                            handleChange={handleCheckinDates}
                            label="With Checkin Dates?"
                            name={`${prefix}checkinDates`}
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

            <Row className="mb-3 ms-1 me-1">
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
                                <th className="text-center" scope="col">Status</th>
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
                            key={`${prefix}GO-${ri}-TR`}
                        >
                            <td
                                key={`${prefix}GO-${ri}-firstName`}
                                onClick={props.handleEdit ? (() => handleEdit(guest)) : undefined}
                            >
                                {guest.firstName}
                            </td>
                            <td
                                key={`${prefix}GO-${ri}-lastName`}
                                onClick={props.handleEdit ? (() => handleEdit(guest)) : undefined}
                            >
                                {guest.lastName}
                            </td>
                            {(checkinDates) ? (
                                <td
                                    key={`${prefix}GO-${ri}-checkins`}
                                    onClick={props.handleEdit ? (() => handleEdit(guest)) : undefined}
                                >
                                    {checkins(guest)}
                                </td>
                            ) : (
                                <>
                                    <td
                                        className="text-center"
                                        key={`${prefix}GO-${ri}-active`}
                                        onClick={() => handleOpenBans(guest)}
                                    >
                                        <GuestStatus guest={guest}/>
                                    </td>
                                    <td
                                        key={`${prefix}GO-${ri}-comments`}
                                        onClick={props.handleEdit ? (() => handleEdit(guest)) : undefined}
                                    >
                                        {guest.comments}
                                    </td>
                                    <td
                                        key={`${prefix}GO-${ri}-favorite`}
                                        onClick={props.handleEdit ? (() => handleEdit(guest)) : undefined}
                                    >
                                        {guest.favorite}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>

                </Table>
            </Row>

            {props.handleAdd ? (
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
            ) : null }

        </Container>

            {/* Modal for showing Bans for a Guest */}
            <Modal
                animation={false}
                backdrop="static"
                centered
                onHide={handleCloseBans}
                show={showBans}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Bans for {guest._title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BanOptions
                        guest={guest}
                        withActive={false}
                        withHeading={false}
                    />
                </Modal.Body>
            </Modal>

        </>
    )

}

export default GuestOptions;
