// Ban -----------------------------------------------------------------------

// Record of a decision to ban a particular Guest from checking in over a
// specified range of dates.  Bans with active=true will be enforced, while
// Bans with active=false but still in date range will trigger a warning.

// Internal Modules ----------------------------------------------------------

import Facility from "./Facility";
import Guest from "./Guest";
import * as ToModel from "../util/ToModel";

// Public Objects ------------------------------------------------------------

export const BANS_BASE = "/bans";

export class BanData {

    constructor(data: any = {}) {
        this.id = data.id ? data.id : -1;
        this.active = (data.active !== undefined) ? data.active : true;
        this.comments = data.comments ? data.comments : null;
        this.facilityId = data.facilityId ? data.facilityId : null;
        this.fromDate = data.fromDate ? data.fromDate : null;
        this.guestId = data.guestId ? data.guestId : null;
        this.staff = data.staff ? data.staff : null;
        this.toDate = data.toDate ? data.toDate : null;
    }

    id: number;
    active: boolean;
    comments: string;
    facilityId: number;
    fromDate: string;
    guestId: number;
    staff: string;
    toDate: string;

}

class Ban extends BanData {

    constructor(data: any = {}) {
        super(data);
        this.facility = data.facility ? ToModel.FACILITY(data.facility) : undefined;
        this.guest = data.guest ? ToModel.GUEST(data.facility) : undefined;
        this._model = "Ban";
        this._title = `Guest ${this.guestId} from ${this.fromDate} to ${this.toDate}`;
    }

    facility?: Facility;
    guest?: Guest;

    _model: string;
    _title: string;

}

export default Ban;
