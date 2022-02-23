// App -----------------------------------------------------------------------

// Overall implementation of the entire client application.

// External Modules ----------------------------------------------------------

import React from 'react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/cjs/NavDropdown";
import NavItem from "react-bootstrap/NavItem";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {LinkContainer} from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Internal Modules ----------------------------------------------------------

import CheckinsView from "./components/checkins/CheckinsView";
import FacilitySelector from "./components/facilities/FacilitySelector";
import FacilitiesView from "./components/facilities/FacilitiesView";
import GuestsView from "./components/guests/GuestsView";
import LoggedInUser from "./components/login/LoggedInUser";
import GuestHistoryReport from "./components/reports/GuestHistoryReport";
import MonthlySummaryReport from "./components/reports/MonthlySummaryReport";
import TemplatesView from "./components/templates/TemplatesView";
import UsersView from "./components/users/UsersView";
import DatabaseView from "./components/views/DatabaseView";
import HelpView from "./components/views/HelpView";
import HomeView from "./components/views/HomeView";
import OpenApiView from "./components/views/OpenApiView";
import {FacilityContextProvider} from "./components/facilities/FacilityContext";
import {LoginContextProvider} from "./components/login/LoginContext";

// Component Details ---------------------------------------------------------

function App() {
  return (
      <>
      <LoginContextProvider>
      <FacilityContextProvider>

      <Router>

        <Navbar
            bg="info"
            className="mb-3"
            expand="lg"
            sticky="top"
            variant="dark"
        >

          <Navbar.Brand>
            <img
                alt="CityTeam Logo"
                height={66}
                src="/CityTeamDarkBlue.png"
                width={160}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-brand"/>

          <Navbar.Collapse id="basic-navbar-brand">
            <Nav className="mr-auto">
              <LinkContainer to="/">
                <NavItem className="nav-link">Home</NavItem>
              </LinkContainer>
              <LinkContainer to="/checkins">
                <NavItem className="nav-link">Checkins</NavItem>
              </LinkContainer>
              <NavDropdown id="reports" title="Reports">
                <LinkContainer to="/report-guest">
                  <NavDropdown.Item>Guest History</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/report-month">
                  <NavDropdown.Item>Monthly Summary</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <NavDropdown id="admin" title="Admin">
                <LinkContainer to="/database">
                  <NavDropdown.Item>Database Backup</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/facilities">
                  <NavDropdown.Item>Facilities</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/guests">
                  <NavDropdown.Item>Guests</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/templates">
                  <NavDropdown.Item>Templates</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/users">
                  <NavDropdown.Item>Users</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
{/*
              <LinkContainer to="/openapi">
                <NavItem className="nav-link">OpenAPI Docs</NavItem>
              </LinkContainer>
*/}
              <NavDropdown id="help" title="Help">
                <LinkContainer to="/help/regular-user.html">
                  <NavDropdown.Item>Regular User</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/help/CHEATSHEET.html">
                  <NavDropdown.Item>Configuration Settings Page</NavDropdown.Item>
                </LinkContainer>
{/*
                <LinkContainer to="/help/regular-user.md">
                  <NavDropdown.Item>Regular User (MD)</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/help/admin-user.md">
                  <NavDropdown.Item>Administrative User</NavDropdown.Item>
                </LinkContainer>
*/}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>

          <LoggedInUser/>
          <span className="mr-4"/>
          <FacilitySelector/>

        </Navbar>

        <Switch>
          <Route exact path="/openapi">
            <OpenApiView/>
          </Route>
          <Route exact path="/checkins">
            <CheckinsView/>
          </Route>
          <Route exact path="/database">
            <DatabaseView/>
          </Route>
          <Route exact path="/facilities">
            <FacilitiesView/>
          </Route>
          <Route exact path="/guests">
            <GuestsView/>
          </Route>
          <Route exact path="/report-guest">
            <GuestHistoryReport/>
          </Route>
          <Route exact path="/report-month">
            <MonthlySummaryReport/>
          </Route>
          <Route exact path="/templates">
            <TemplatesView/>
          </Route>
          <Route exact path="/users">
            <UsersView/>
          </Route>
          <Route path="/help/:resource">
            <HelpView/>
          </Route>
          <Route path="/">
            <HomeView/>
          </Route>
        </Switch>

      </Router>

      </FacilityContextProvider>
      </LoginContextProvider>
      </>
  );
}

export default App;
