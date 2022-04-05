// BanServices ---------------------------------------------------------------

// Services implementation for Ban models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractChildServices from "./AbstractChildServices";
import Ban from "../models/Ban";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import {BadRequest, NotUnique, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";

// Public Object -------------------------------------------------------------

class BanServices extends AbstractChildServices<Ban> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(facilityId: number, query?: any): Promise<Ban[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "BanServices.all"
            );
        }
        const options = this.appendMatchOptions({
            order: SortOrder.BANS
        }, query);
        return facility.$get("bans", options);
    }

    public async find(facilityId: number, banId: number, query?: any): Promise<Ban> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "BanServices.find"
            );
        }
        const options = this.appendIncludeOptions({
            where: { id: banId }
        }, query);
        const results = await facility.$get("bans", options);
        if (results.length !== 1) {
            throw new NotFound(
                `banId: Missing Ban ${banId}`,
                "BanServices.find"
            );
        }
        return results[0];
    }

    public async insert(facilityId: number, ban: any): Promise<Ban> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "BanServices.insert"
            );
        }
        const guest = await Guest.findByPk(ban.guestId);
        if (!guest) {
            throw new NotFound(
                `guestId: Missing Guest ${ban.guestId}`,
                "BanServices.insert",
            );
        }
        if (guest.facilityId !== facilityId) {
            throw new BadRequest(
                `guestId: Guest ${ban.guestId} does not belong to Facility ${facilityId}`
            );
        }
        ban.facilityId = facilityId; // No cheating
        try {
            return await Ban.create(ban, {
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "BanServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "BanServices.insert",
                );
            }
        }
    }

    public async remove(facilityId: number, banId: number): Promise<Ban> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "BanServices.insert"
            );
        }
        const results = await facility.$get("bans", {
            where: { id: banId }
        });
        if (results.length !== 1) {
            throw new NotFound(
                `banId: Missing Ban ${banId}`,
                "BanServices.remove",
            );
        }
        await Ban.destroy({
            where: { id: banId }
        });
        return results[0];
    }

    public async update(facilityId: number, banId: number, ban: any): Promise<Ban> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "BanServices.update"
            );
        }
        const guest = await Guest.findByPk(ban.guestId);
        if (!guest) {
            throw new NotFound(
                `guestId: Missing Guest ${ban.guestId}`,
                "BanServices.update",
            );
        }
        if (guest.facilityId !== facilityId) {
            throw new BadRequest(
                `guestId: Guest ${ban.guestId} does not belong to Facility ${facilityId}`
            );
        }
        try {
            ban.id = banId; // No cheating
            ban.facilityId = facilityId; // No cheating
            const results = await Ban.update(ban, {
                fields: FIELDS_WITH_ID,
                returning: true,
                where: {
                    id: banId,
                    facilityId: facilityId,
                }
            });
            if (results[0] < 1) {
                throw new NotFound(
                    `banId: Missing Ban ${banId}`,
                    "BanServices.update",
                );
            }
            return results[1][0];
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "BanServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "BanServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withFacility                   Include parent Facility
     * * withGuest                      Include parent Guest
     */
    public appendIncludeOptions(options: FindOptions, query?: any): FindOptions {
        if (!query) {
            return options;
        }
        options = appendPaginationOptions(options, query);
        const include: any = options.include ? options.include : [];
        if ("" === query.withFacility) {
            include.push(Facility);
        }
        if ("" === query.withGuest) {
            include.push(Guest);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active Bans only
     * * fromDate={fromDate}            Select Bans greater than or equal to this date
     * * toDate={toDate}                Select Bans less than or equal to this date
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        let where: any = options.where ? options.where : {};
        if ("" === query.active) {
            where.active = true;
        }
        if (query.fromDate) {
            where.fromDate = { [Op.lte]: query.fromDate };
        }
        if (query.toDate) {
            where.toDate = { [Op.gte]: query.toDate };
        }
        const count = Object.getOwnPropertyNames(where).length
            + Object.getOwnPropertySymbols(where).length;
        if (count > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new BanServices();

// Private Options -----------------------------------------------------------

const FIELDS = [
    "active",
    "comments",
    "facilityId",
    "fromDate",
    "guestId",
    "staff",
    "toDate",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];
