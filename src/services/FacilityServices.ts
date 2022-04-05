// FacilityServices ----------------------------------------------------------

// Services implementation for Facility models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractParentServices from "./AbstractParentServices";
import BanServices from "./BanServices";
import CheckinServices from "./CheckinServices";
import GuestServices from "./GuestServices";
import TemplateServices from "./TemplateServices";
import Ban from "../models/Ban";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";

// Public Objects ------------------------------------------------------------

class FacilityServices extends AbstractParentServices<Facility> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<Facility[]> {
        const options: FindOptions = this.appendMatchOptions({
            order: SortOrder.FACILITIES,
        }, query);
        return Facility.findAll(options);
    }

    public async find(facilityId: number, query?: any): Promise<Facility> {
        const options: FindOptions = this.appendIncludeOptions({
            where: { id: facilityId }
        }, query);
        const results = await Facility.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.find"
            );
        }
    }

    public async insert(facility: any): Promise<Facility> {
        try {
            return await Facility.create(facility,{
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "FacilityServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "FacilityServices.insert"
                );
            }
        }
    }

    public async remove(facilityId: number): Promise<Facility> {
        const removed = await Facility.findByPk(facilityId);
        if (!removed) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.remove"
            );
        }
        await Facility.destroy({
            where: { id: facilityId }
        })
        return removed;
    }

    public async update(facilityId: number, facility: any): Promise<Facility> {
        try {
            facility.id = facilityId; // No cheating
            const results = await Facility.update(facility, {
                fields: FIELDS_WITH_ID,
                returning: true,
                where: { id: facilityId }
            });
            if (results[0] < 1) {
                throw new NotFound(
                    `facilityId: Missing Facility ${facilityId}`,
                    "FacilityServices.update"
                );
            }
            return results[1][0];
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "FacilityServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "FacilityServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    public async bans(facilityId: number, query?: any): Promise<Ban[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.bans"
            );
        }
        const options = CheckinServices.appendMatchOptions({
            order: SortOrder.BANS,
        }, query);
        return facility.$get("bans", options);
    }

    public async checkins(facilityId: number, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkins"
            );
        }
        const options = CheckinServices.appendMatchOptions({
            order: SortOrder.CHECKINS,
        }, query);
        return facility.$get("checkins", options);
    }

    public async exact(name: string, query?: any): Promise<Facility> {
        const options = this.appendIncludeOptions({
            where: {
                name: name,
            }
        }, query);
        const results = await Facility.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `name: Missing Facility '${name}'`,
                "FacilityServices.exact"
            );
        }
        return results[0];
    }

    public async guests(facilityId: number, query?: any): Promise<Guest[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templates"
            );
        }
        const options = GuestServices.appendMatchOptions({
            order: SortOrder.GUESTS,
        }, query);
        return facility.$get("guests", options);
    }

    public async templates(facilityId: number, query?: any): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templates"
            );
        }
        const options = TemplateServices.appendMatchOptions({
            order: SortOrder.TEMPLATES,
        }, query);
        return facility.$get("templates", options);
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withCheckins                   Include child Checkins
     * * withGuests                     Include child Guests
     * * withTemplates                  Include child Templates
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
        if ("" === query.withCheckins) {
            include.push(Checkin);
        }
        if ("" === query.withGuests) {
            include.push(Guest);
        }
        if ("" === query.withTemplates) {
            include.push(Template);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active Facilities
     * * name={wildcard}                Select Facilities with matching name (wildcard)
     * * scope={scope}                  Select Facilities with matching scope (exact)
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        const where: any = options.where ? options.where : {};
        if ("" === query.active) {
            where.active = true;
        }
        if (query.name) {
            where.name = { [Op.iLike]: `%${query.name}%` };
        }
        if (query.scope) {
            where.scope = query.scope;
        }
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new FacilityServices();

// Private Objects -----------------------------------------------------------

const FIELDS = [
    "active",
    "address1",
    "address2",
    "city",
    "email",
    "name",
    "phone",
    "scope",
    "state",
    "zipCode",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];
