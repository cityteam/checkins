// Template ------------------------------------------------------------------

// Template for generating mats for Checkins at a particular Facility,
// on a particular Checkin date.

// Internal Modules ----------------------------------------------------------

import Facility from "./Facility";
import * as ToModel from "../util/ToModel";

// Public Objects ------------------------------------------------------------

export const TEMPLATES_BASE = "/templates";

export class TemplateData {

    constructor(data: any = {}) {
        this.id = data.id ? data.id : -1;
        this.active = (data.active !== undefined) ? data.active : true;
        this.allMats = data.allMats ? data.allMats : null;
        this.comments = data.comments ? data.comments : null;
        this.facilityId = data.facilityId ? data.facilityId : null;
        this.handicapMats = data.handicapMats ? data.handicapMats : null;
        this.name = data.name ? data.name : null;
        this.socketMats = data.socketMats ? data.socketMats : null;
        this.workMats = data.workMats ? data.workMats : null;
    }

    id: number;
    active: boolean;
    allMats: string;
    comments: string;
    facilityId: number;
    handicapMats: string;
    name: string;
    socketMats: string;
    workMats: string;

}

class Template extends TemplateData {

    constructor(data: any = {}) {

        super(data);

        this.facility = data.facility ? ToModel.FACILITY(data.facility) : undefined;

        this._model = "Template";
        this._title = this.name;

    }


    facility?: Facility;

    _model: string;
    _title: string;

}

export default Template;
