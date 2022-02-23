// Checkin -------------------------------------------------------------------

// Record of an actual (guestI !== null) or potential (guestId === null)
// Checkin for a particular mat, on a particular Checkin date, at a
// particular Facility, by a particular Guest.

// Internal Modules ---------------------------------------------------------

import Facility from "./Facility";
import Guest from "./Guest";
import Model from "./Model";
import * as ToModel from "../util/ToModel";

// Public Objects -----------------------------------------------------------

export const CHECKINS_BASE = "/checkins";

class Checkin extends Model {

    constructor(data: any = {}) {

        super(data);

        this.checkinDate = data.checkinDate ? data.checkinDate : null;
        this.comments = data.comments ? data.comments : null;
        this.facilityId = data.facilityId ? data.facilityId : null;
        this.features = data.features ? data.features : null;
        this.guestId = data.guestId ? data.guestId : null;
        this.matNumber = data.matNumber ? data.matNumber : null;
        this.paymentAmount = data.paymentAmount ? data.paymentAmount : null;
        this.paymentType = data.paymentType ? data.paymentType : null;
        this.showerTime = data.showerTime ? data.showerTime : null;
        this.wakeupTime = data.wakeupTime ? data.wakeupTime : null;

        this.matNumberAndFeatures = this.calculateMatNumberAndFeatures();

        this.facility = data.facility ? ToModel.FACILITY(data.facility) : null;
        this.guest = data.guest ? ToModel.GUEST(data.guest) : null;

    }

    checkinDate!: string;
    comments?: string;
    facilityId!: number;
    features?: string;
    guestId?: number;
    matNumber!: number;
    matNumberAndFeatures?: string;
    paymentAmount?: number;
    paymentType?: string;
    showerTime?: string;
    wakeupTime?: string;

    facility: Facility | null;
    guest: Guest | null;

    private calculateMatNumberAndFeatures() {
        let result = "" + (this.matNumber ? this.matNumber : "*");
        if (this.features) {
            result += this.features;
        }
        return result;
    }

}

export default Checkin;
