// Guest ---------------------------------------------------------------------

// A Guest who has ever checked in at a CityTeam Facility.

// Internal Modules ----------------------------------------------------------

import Checkin from "./Checkin";
import Facility from "./Facility";
import * as ToModel from "../util/ToModel";

// Public Objects ------------------------------------------------------------

export const GUESTS_BASE = "/guests";

export class GuestData {

    constructor(data: any = {}) {
        this.id = data.id ? data.id : -1;
        this.active = (data.active !== undefined) ? data.active : true;
        this.comments = data.comments ? data.comments : null;
        this.facilityId = data.facilityId ? data.facilityId : null;
        this.favorite = data.favorite ? data.favorite : null;
        this.firstName = data.firstName ? data.firstName : null;
        this.lastName = data.lastName ? data.lastName : null;
    }

    id: number;
    active: boolean;
    comments: string;
    facilityId: number;
    favorite: string;
    firstName: string;
    lastName: string;

}

class Guest extends GuestData {

    constructor(data: any = {}) {

        super(data);

        this.checkins = data.checkins ? ToModel.CHECKINS(data.checkins) : undefined;
        this.facility = data.facility ? ToModel.FACILITY(data.facility) : undefined;

        this._model = "Guest";
        this._title = `${this.lastName}, ${this.firstName}`;

    }

    checkins?: Checkin[];
    facility?: Facility;

    _model: string;
    _title: string;

}

export default Guest;
