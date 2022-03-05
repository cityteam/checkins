// Navigation ----------------------------------------------------------------

// Top-level navigation menu, with support for react-router-dom@6.

// External Modules ----------------------------------------------------------

import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {NavLink, Outlet} from "react-router-dom";

// Internal Modules ----------------------------------------------------------

import FacilitySelector from "../facilities/FacilitySelector";
import LoggedInUser from "../login/LoggedInUser";

// Component Details ---------------------------------------------------------

function Navigation() {
    return (
        <>
            <Navbar
                bg="info"
                className="mb-3"
                collapseOnSelect
                sticky="top"
                variant="light"
            >

                <Navbar.Brand>
                    <img
                        alt="CityTeam Logo"
                        className="ms-2"
                        height={66}
                        src="/CityTeamDarkBlue.png"
                        width={160}
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>

                <Navbar.Collapse>
                    <Nav className="me-auto">
                        <NavLink className="nav-link" to="/">Home</NavLink>
                        <NavLink className="nav-link" to="/checkins">Checkins</NavLink>
                        <NavDropdown title="Reports">
                            <NavDropdown.Item>
                                <NavLink className="nav-link" to="/report-guests">Guest History</NavLink>
                                <NavLink className="nav-link" to="/report-month">Monthly Summary</NavLink>
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Admin">
                            <NavDropdown.Item>
                                <NavLink className="nav-link" to="/facilities">Facilities</NavLink>
                                <NavLink className="nav-link" to="/guests">Guests</NavLink>
                                <NavLink className="nav-link" to="/templates">Templates</NavLink>
                                <NavLink className="nav-link" to="/users">Users</NavLink>
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <LoggedInUser/>
                    <span className="me-4"/>
                    <FacilitySelector/>
                    <span className="me-2"/>
                </Navbar.Collapse>

            </Navbar>
            <Outlet/>
        </>
    )
}

export default Navigation;
