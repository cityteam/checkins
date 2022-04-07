// BanOptions ----------------------------------------------------------------

// List Bans that match criteria, offering callbacks for adding, editing,
// and removing Bans.

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
import FetchingProgress from "../general/FetchingProgress";
import {HandleAction, HandleBan, HandleBoolean} from "../../types";
import useFetchBans from "../../hooks/useFetchBans";
import Ban from "../../models/Ban";
import Guest from "../../models/Guest";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";
import {todayDate} from "../../util/Dates";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    guest: Guest;                       // Guest for which to manage Bans
    handleAdd?: HandleAction;           // Handle request to add a Ban [not allowed]
    handleBack: HandleAction;           // Handle request to return to previous view
    handleEdit?: HandleBan;             // Handle request to edit a Ban [not allowed]
}

// Component Details ---------------------------------------------------------

const BanOptions = (props: Props) => {

    const today = todayDate();

    const facilityContext = useContext(FacilityContext);

    const [active, setActive] = useState<boolean>(false);
    const [currentPage] = useState<number>(1);
    const [pageSize] = useState<number>(100);

    const fetchBans = useFetchBans({
        active: active,
        alertPopup: false,
        currentPage: currentPage,
        guestId: props.guest.id,
        pageSize: pageSize,
    });

    useEffect(() => {

        logger.debug({
            context: "BanOptions.useEffect",
            facility: Abridgers.FACILITY(facilityContext.facility),
            guest: Abridgers.GUEST(props.guest),
            active: active,
            currentPage: currentPage,
        })

    }, [facilityContext.facility,
        props.guest,
        active, currentPage,
        fetchBans.bans]);

    const expired = (theBan: Ban): boolean => {
        return theBan.toDate < today;
    }

    const handleActive: HandleBoolean = (theActive) => {
        setActive(theActive);
    }

    const handleAdd: HandleAction = () => {
        if (props.handleAdd) {
            props.handleAdd();
        }
    }

    const handleEdit: HandleBan = (theBan) => {
        if (props.handleEdit) {
            props.handleEdit(theBan);
        }
    }

    return (
        <Container fluid id="BanOptions">

            <FetchingProgress
                error={fetchBans.error}
                loading={fetchBans.loading}
                message="Fetching selected Bans"
            />

            <Row className="mb-3 ms-1 me-1">
                <Col>
                    <strong>
                        <span>Manage Bans for Guest&nbsp;</span>
                        <span className="text-info">{props.guest._title}</span>
                    </strong>
                </Col>
                <Col className="text-center">
                    <CheckBox
                        handleChange={handleActive}
                        label="Active Bans Only?"
                        name="activeOnly"
                        value={active}
                    />
                </Col>
                <Col className="text-end">
                    <Button
                        className="me-2"
                        disabled={!props.handleAdd}
                        onClick={props.handleAdd}
                        size="sm"
                        variant="primary"
                    >Add</Button>
                    <Button
                        onClick={() => props.handleBack()}
                        size="sm"
                        type="button"
                        variant="success"
                    >Back</Button>
                </Col>
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
                        <th scope="col">From Date</th>
                        <th scope="col">To Date</th>
                        <th scope="col">Active</th>
                        <th scope="col">Expired</th>
                        <th scope="col">Staffer</th>
                        <th scope="col">Comments</th>
                    </tr>
                    </thead>

                    <tbody>
                    {fetchBans.bans.map((ban, ri) => (
                        <tr
                            className="table-default"
                            key={`BO-${ri}-TR`}
                            onClick={props.handleEdit ? (() => handleEdit(ban)) : undefined}
                        >
                            <td key={`TO-${ri}-fromDate`}>
                                {ban.fromDate}
                            </td>
                            <td key={`TO-${ri}-toDate`}>
                                {ban.toDate}
                            </td>
                            <td key={`TO-${ri}-active`}>
                                {listValue(ban.active)}
                            </td>
                            <td key={`TO=${ri}-expired`}>
                                {listValue(expired(ban))}
                            </td>
                            <td key={`TO-${ri}-staff`}>
                                {ban.staff}
                            </td>
                            <td key={`TO-${ri}-comments`}>
                                {ban.comments}
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

export default BanOptions;
