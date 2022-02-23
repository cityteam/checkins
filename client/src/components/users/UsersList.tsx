// UsersList -----------------------------------------------------------------

// List Users that match search criteria, offering callbacks for adding,
// editing, and removing Users.

// External Modules ----------------------------------------------------------

import React, {/* useContext, */useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import CheckBox from "../general/CheckBox";
import Pagination from "../general/Pagination";
import SearchBar from "../general/SearchBar";
import {HandleBoolean, HandleUser, HandleValue, OnAction} from "../../types";
import useFetchUsers from "../../hooks/useFetchUsers";
import User from "../../models/User";
import logger from "../../util/ClientLogger";
import {listValue} from "../../util/Transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    canInsert: boolean;                 // Can this user add Users?
    canRemove: boolean;                 // Can this user remove Users?
    canUpdate: boolean;                 // Can this user edit Users?
    handleAdd: OnAction;                // Handle request to add a User
    handleSelect: HandleUser;           // Handle request to select a User
}

// Component Details ---------------------------------------------------------

const UsersList = (props: Props) => {

    const [active, setActive] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(25);
    const [searchText, setSearchText] = useState<string>("");
    const [visibles, setVisibles] = useState<User[]>([]);

    const fetchUsers = useFetchUsers({
        active: active,
        currentPage: currentPage,
        pageSize: pageSize,
        username: (searchText.length > 0) ? searchText : undefined,
    });

    useEffect(() => {
        logger.info({
            context: "UserList.useEffect"
        });
        if (props.canInsert) {
            setVisibles(fetchUsers.users);
        } else {
            setVisibles([]);
        }

    }, [props.canInsert, fetchUsers.users]);

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
        <Container fluid id="UsersList">

            <Row className="mb-3 ml-1 mr-1">
                <Col className="col-6">
                    <SearchBar
                        autoFocus
                        handleChange={handleChange}
                        label="Search For Users:"
                        placeholder="Search by all or part of username"
                    />
                </Col>
                <Col>
                    <CheckBox
                        handleChange={handleActive}
                        id="activeOnly"
                        initialValue={active}
                        label="Active Users Only?"
                    />
                </Col>
                <Col className="text-right">
                    <Pagination
                        currentPage={currentPage}
                        lastPage={(fetchUsers.users.length === 0) ||
                            (fetchUsers.users.length < pageSize)}
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
                        <th scope="col">Username</th>
                        <th scope="col">Name</th>
                        <th scope="col">Active</th>
                        <th scope="col">Scope</th>
                    </tr>
                    </thead>

                    <tbody>
                    {visibles.map((user, rowIndex) => (
                        <tr
                            className="table-default"
                            key={1000 + (rowIndex * 100)}
                            onClick={() => props.handleSelect(user)}
                        >
                            <td key={1000 + (rowIndex * 100) + 1}>
                                {user.username}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 2}>
                                {user.name}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 3}>
                                {listValue(user.active)}
                            </td>
                            <td key={1000 + (rowIndex * 100) + 4}>
                                {user.scope}
                            </td>
                        </tr>
                    ))}
                    </tbody>

                </Table>
            </Row>


        </Container>
    )

}

export default UsersList;
