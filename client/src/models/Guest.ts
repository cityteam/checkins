// Guest ---------------------------------------------------------------------

// A Guest who has ever checked in at a CityTeam Facility.

// Internal Modules ----------------------------------------------------------

import Checkin from "./Checkin";
import Facility from "./Facility";
import Model from "./Model";
import {toCheckins, toFacility} from "../util/ToModelTypes";

// Public Objects ------------------------------------------------------------

export const GUESTS_BASE = "/guests";

class Guest extends Model {

    constructor(data: any = {}) {

        super(data);

        this.active = (data.active !== undefined) ? data.active : true;
        this.comments = data.comments ? data.comments : null;
        this.facilityId = data.facilityId ? data.facilityId : null;
        this.favorite = data.favorite ? data.favorite : null;
        this.firstName = data.firstName ? data.firstName : null;
        this.lastName = data.lastName ? data.lastName : null;

        this.checkins = data.checkins ? toCheckins(data.checkins) : null;
        this.facility = data.facility ? toFacility(data.facility) : null;

    }

    active!: boolean;
    comments?: string;
    facilityId!: number;
    favorite?: string;
    firstName!: string;
    lastName!: string;

    checkins: Checkin[] | null;
    facility: Facility | null;

}

export default Guest;
