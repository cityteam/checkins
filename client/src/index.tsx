import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";

import CheckinsView from "./components/checkins/CheckinsView";
import {FacilityContextProvider} from "./components/facilities/FacilityContext";
import FacilitySegment from "./components/facilities/FacilitySegment";
import Navigation from "./components/general/Navigation";
import GuestSegment from "./components/guests/GuestSegment";
import {LoginContextProvider} from "./components/login/LoginContext";
import GuestHistoryReport from "./components/reports/GuestHistoryReport";
import MonthlySummaryReport from "./components/reports/MonthlySummaryReport";
import TemplateSegment from "./components/templates/TemplateSegment";
import UserSegment from "./components/users/UserSegment";
import DatabaseView from "./components/views/DatabaseView";
import HomeView from "./components/views/HomeView";

ReactDOM.render(
    <LoginContextProvider>
        <FacilityContextProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigation/>}>
                        <Route path="checkins" element={<CheckinsView/>}/>
                        <Route path="database" element={<DatabaseView/>}/>
                        <Route path="facilities" element={<FacilitySegment/>}/>
                        <Route path="guests" element={<GuestSegment/>}/>
                        <Route path="report-guests" element={<GuestHistoryReport/>}/>
                        <Route path="report-month" element={<MonthlySummaryReport/>}/>
                        <Route path="templates" element={<TemplateSegment/>}/>
                        <Route path="users" element={<UserSegment/>}/>
                        <Route path="" element={<HomeView/>}/>
                    </Route>
                </Routes>
            </Router>
        </FacilityContextProvider>
    </LoginContextProvider>
  ,
  document.getElementById('root')
);
