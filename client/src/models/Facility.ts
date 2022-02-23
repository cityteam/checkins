// Facility ------------------------------------------------------------------

// A CityTeam Facility that accommodates Guests managed with this application.

// Internal Modules ----------------------------------------------------------

import Guest from "./Guest";
import Template from "./Template";
import * as ToModel from "../util/ToModel";

// Public Objects ------------------------------------------------------------

export const FACILITIES_BASE = "/facilities";

export class FacilityData {

    constructor(data: any = {}) {
        this.id = data.id ? data.id : -1;
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
    }

    id: number;
    active: boolean;
    address1: string;
    address2: string;
    city: string;
    email: string;
    name: string;
    phone: string;
    scope: string;
    state: string;
    zipCode: string;

}

class Facility extends FacilityData {

    constructor (data: any = {}) {

        super(data);

        this.guests = data.guests ? ToModel.GUESTS(data.guests) : undefined;
        this.templates = data.templates ? ToModel.TEMPLATES(data.templates) : undefined;

        this._model = "Facility";
        this._title = this.name;
    }

    guests?: Guest[];
    templates?: Template[];

    _model: string;
    _title: string;

}

export default Facility;
