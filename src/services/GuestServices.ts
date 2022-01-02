// GuestServices -------------------------------------------------------------

// Services implementation for Guest models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractChildServices from "./AbstractChildServices";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";
import CheckinServices from "./CheckinServices";

// Public Objects ------------------------------------------------------------

class GuestServices extends AbstractChildServices<Guest> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(facilityId: number, query?: any): Promise<Guest[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.all"
            );
        }
        const options = this.appendMatchOptions({
            order: SortOrder.GUESTS
        }, query);
        return facility.$get("guests", options);
    }

    public async find(facilityId: number, guestId: number, query?: any): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.find"
            );
        }
        const options = this.appendIncludeOptions({
            where: { id: guestId }
        }, query);
        const results = await facility.$get("guests", options);
        if (results.length !== 1) {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "GuestServices.find"
            );
        }
        return results[0];
    }

    public async insert(facilityId: number, guest: any): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.find"
            );
        }
        guest.facilityId = facilityId; // No cheating
        try {
            return await Guest.create(guest, {
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "GuestServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "GuestServices.insert"
                );
            }
        }
    }

    public async remove(facilityId: number, guestId: number): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.remove"
            );
        }
        const results = await facility.$get("guests", {
            where: { id: guestId }
        });
        if (results.length !== 1) {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "GuestServices.remove"
            );
        }
        await Guest.destroy({
            where: { id: guestId }
        });
        return results[0];
    }

    public async update(facilityId: number, guestId: number, guest: any): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.update"
            );
        }
        try {
            guest.id = guestId; // No cheating
            guest.facilityId = facilityId; // No cheating
            const results = await Guest.update(guest, {
                fields: FIELDS_WITH_ID,
                returning: true,
                where: {
                    id: guestId,
                    facilityId: facilityId,
                }
            });
            if (results[0] < 1) {
                throw new NotFound(
                    `guestId: Missing Guest ${guestId}`,
                    "GuestServices.update"
                );
            }
            return results[1][0];
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "GuestServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "GuestServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    public async checkins(facilityId: number, guestId: number, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.checkins",
            );
        }
        const guest = await Guest.findByPk(guestId);
        if (!guest || (guest.facilityId !== facility.id)) {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "GuestServices.checkins",
            );
        }
        const options = CheckinServices.appendMatchOptions({
            order: SortOrder.CHECKINS,
        }, query);
        return guest.$get("checkins", options);
    }

    public async exact(facilityId: number, firstName: string, lastName: string, query?: any): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "GuestServices.exact"
            );
        }
        const options = this.appendIncludeOptions({
            where: {
                firstName: firstName,
                lastName: lastName,
            }
        }, query);
        const results = await facility.$get("guests", options);
        if (results.length !== 1) {
            throw new NotFound(
                `name: Missing Guest '${firstName} ${lastName}'`,
                "GuestServices.exact"
            );
        }
        return results[0];
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withCheckins                   Include child Checkins
     * * withFacility                   Include parent Facility
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
        if ("" === query.withFacility) {
            include.push(Facility);
        }
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active Guests
     * * name={wildcard}                Select guests with matching name (wildcard)
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
        if (query.name) {
            const names = query.name.trim().split(" ");
            const firstMatch = names[0];
            const lastMatch = (names.length > 1) ? names[1] : names[0];
            where = {
                ...where,
                [Op.or]: {
                    firstName: {[Op.iLike]: `%${firstMatch}%`},
                    lastName: {[Op.iLike]: `%${lastMatch}%`},
                }
            }
        }
        const count = Object.getOwnPropertyNames(where).length
            + Object.getOwnPropertySymbols(where).length;
        if (count > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new GuestServices();

// Private Options -----------------------------------------------------------

const FIELDS = [
    "active",
    "comments",
    "facilityId",
    "favorite",
    "firstName",
    "lastName",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];
