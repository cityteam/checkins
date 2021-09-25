// Facility ------------------------------------------------------------------

// A CityTeam Facility that accommodates Guests managed with this application.

// Internal Modules ----------------------------------------------------------

// import Checkin from "./Checkin";
// import Guest from "./Guest";
import Model from "./Model";
import Template from "./Template";
import {/*toCheckins, toGuests, */toTemplates} from "../util/ToModelTypes";

// Public Objects ------------------------------------------------------------

export const FACILITIES_BASE = "/facilities";

class Facility extends Model {

    constructor (data: any = {}) {

        super(data);
        this.active = (data.active !== undefined) ? data.active : true;
        this.address1 = data.address1 ? data.address1 : null;
        this.address2 = data.address2 ? data.address2 : null;
        this.city = data.city ? data.city : null;
        this.email = data.email ? data.email : null;
        this.name = data.name ? data.name : null;
        this.phone = data.phone ? data.phone : null;
        this.scope = data.scope ? data.scope : null;
        this.state = data.state ? data.state : null;
        this.zipCode = data.zipCode ? data.zipCode : null;

        this.templates = data.templates ? toTemplates(data.templates) : undefined;

    }

    active!: boolean;
    address1?: string;
    address2?: string;
    city?: string;
    email?: string;
    name!: string;
    phone?: string;
    scope!: string;
    state?: string;
    zipCode?: string;

    // checkins?: Checkin[];
    // guests?: Guest[];
    templates?: Template[];

}

export default Facility;
