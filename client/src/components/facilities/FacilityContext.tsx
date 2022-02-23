// FacilityContext -----------------------------------------------------------

// React Context containing the currently available Facilities, plus the
// currently selected one.

// External Modules ----------------------------------------------------------

import React, {createContext, useContext, useEffect, useState} from "react";

// Internal Modules ----------------------------------------------------------

import LoginContext from "../login/LoginContext";
import {HandleAction, HandleFacility} from "../../types";
import useFetchFacilities from "../../hooks/useFetchFacilities";
import Facility from "../../models/Facility";
import * as Abridgers from "../../util/Abridgers";
import logger from "../../util/ClientLogger";

// Context Properties --------------------------------------------------------

export interface State {
    facilities: Facility[];             // Facilities currently available to this user
    facility: Facility;                 // Currently selected facility (dummy if id<0)
    handleRefresh: HandleAction;        // Trigger a refresh of available Facilities
    handleSelect: HandleFacility;       // Select the currently referenced Facility
}

export const FacilityContext = createContext<State>({
    facilities: [],
    facility: new Facility({name: "Never Selected"}),
    handleRefresh: () => {
        // Will be replaced in the real returned context information
    },
    handleSelect: () => {
        // Will be replaced in the real returned context information
    },
});

// Context Provider ----------------------------------------------------------

export const FacilityContextProvider = (props: any) => {

    const UNSELECTED_FACILITY = new Facility({name: "(Please Select)"});

    const loginContext = useContext(LoginContext);

    const [active, setActive] = useState<boolean>(true);
    const [availables, setAvailables] = useState<Facility[]>([]);
    const [facility, setFacility] = useState<Facility>(UNSELECTED_FACILITY);

    const fetchFacilities = useFetchFacilities({
        active: active,
        currentPage: 1,
        pageSize: 1000,
    })

    useEffect(() => {

        // Offer only those Facilities available to the logged-in User
        const theAvailables: Facility[] = [];
        if (loginContext.data.loggedIn) {
            fetchFacilities.facilities.forEach(theAvailable => {
                if (loginContext.validateFacility(theAvailable)) {
                    theAvailables.push(theAvailable);
                }
            });
        }
        logger.debug({
            context: "FacilityContext.useEffect",
            loggedIn: loginContext.data.loggedIn,
            facilities: Abridgers.FACILITIES(fetchFacilities.facilities),
            availables: Abridgers.FACILITIES(theAvailables),
        });
        setAvailables(theAvailables);

        // Select or reselect the appropriate Facility
        if (theAvailables.length === 1) {
            logger.debug({
                context: "FacilityContext.useEffect",
                msg: "Autoselect the only available facility",
                facility: Abridgers.FACILITY(theAvailables[0]),
            });
            setFacility(theAvailables[0]);
        } else if (facility.id > 0) {
            let found: Facility = new Facility({id: -1, name: "NOT SELECTED"});
            theAvailables.forEach(option => {
                if (facility.id === option.id) {
                    found = option;
                }
            });
            logger.debug({
                context: "FacilityContext.useEffect",
                msg: "Reset to currently selected Facility",
                facility: Abridgers.FACILITY(found),
            });
            setFacility(found);
        }

    }, [active, facility.id, fetchFacilities.facilities,
            loginContext, loginContext.data.loggedIn]);

    const handleRefresh: HandleAction = () => {
        logger.debug({
            context: "FacilityContext.handleRefresh",
        });
        setActive(false); // Trigger useFetchFacilities to fetch again
        setActive(true);
    }

    const handleSelect: HandleFacility = (theFacility) => {
        logger.debug({
            context: "FacilityContext.handleSelect",
            facility: Abridgers.FACILITY(theFacility),
        })
        if (theFacility.id < 0) {
            setFacility(UNSELECTED_FACILITY);
            return;
        }
        let found = false;
        availables.forEach(aFacility => {
            if (theFacility.id === aFacility.id) {
                setFacility(aFacility);
                found = true;
            }
        });
        if (found) {
            return;
        }
        logger.error({
            context: "FacilityContext.handleSelect",
            msg: "Attempt to select unavailable facility denied",
            facility: theFacility,
        });
        setFacility(UNSELECTED_FACILITY);
    }

    const facilityContext: State = {
        facilities: availables,
        facility: facility,
        handleRefresh: handleRefresh,
        handleSelect: handleSelect,
    }

    return (
        <FacilityContext.Provider value={facilityContext}>
            {props.children}
        </FacilityContext.Provider>
    )

}

export default FacilityContext;
