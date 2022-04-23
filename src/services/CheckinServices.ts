// CheckinServices -----------------------------------------------------------

// Services implementation for Checkin models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";
import {Dates} from "@craigmcc/shared-utils";

// Internal Modules ----------------------------------------------------------

import AbstractChildServices from "./AbstractChildServices";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Summary from "../models/Summary";
import Template from "../models/Template";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import MatsList from "../util/MatsList";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";
import {validateCheckinGuestUnique} from "../util/AsyncValidators";

// Public Objects ------------------------------------------------------------

class CheckinServices extends AbstractChildServices<Checkin> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(facilityId: number, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.all"
            );
        }
        const options = this.appendMatchOptions({
            order: SortOrder.CHECKINS
        }, query);
        return facility.$get("checkins", options);
    }

    public async find(facilityId: number, checkinId: number, query?: any): Promise<Checkin> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.find"
            );
        }
        const options = this.appendIncludeOptions({
            where: { id: checkinId }
        }, query);
        const results = await facility.$get("checkins", options);
        if (results.length !== 1) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.find"
            );
        }
        return results[0];
    }

    public async insert(facilityId: number, checkin: any): Promise<Checkin> {

        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.find"
            );
        }
        checkin.facilityId = facilityId; // No cheating
        if (checkin.guestId) {
            if (!(await validateCheckinGuestUnique(facility.id, null, checkin.checkinDate, checkin.guestId))) {
                throw new BadRequest(
                    `guestId: Guest ${checkin.guestId} is already assigned on date ${checkin.checkinDate}`,
                    "CheckinServices.insert"
                );
            }
        }

        try {
            return await Checkin.create(checkin, {
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "CheckinServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "CheckinServices.insert"
                );
            }
        }
    }

    public async remove(facilityId: number, checkinId: number): Promise<Checkin> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.remove"
            );
        }
        const results = await facility.$get("checkins", {
            where: { id: checkinId }
        });
        if (results.length !== 1) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.remove"
            );
        }
        await Checkin.destroy({
            where: { id: checkinId }
        });
        return results[0];
    }

    public async update(facilityId: number, checkinId: number, checkin: any): Promise<Checkin> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.update"
            );
        }
        try {
            checkin.facilityId = facilityId; // No cheating
            const results = await Checkin.update(checkin, {
                fields: FIELDS_WITH_ID,
                returning: true,
                where: {
                    id: checkinId,
                    facilityId: facilityId,
                }
            });
            if (results[0] < 1) {
                throw new NotFound(
                    `checkinId: Missing Checkin ${checkinId}`,
                    "CheckinServices.update"
                );
            }
            return results[1][0];
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "CheckinServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "CheckinServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    /**
     * Assign a specified Guest to the specified Checkin, with details
     * described in the Assign body.
     */
    public async assign(facilityId: number, checkinId: number, assign: Assign): Promise<Checkin> {

        // Validate the incoming parameters
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.assign"
            );
        }
        const checkin = await Checkin.findOne({
            where: {
                id: checkinId,
                facilityId: facilityId,
            }
        });
        if (!checkin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.assign"
            );
        }
        if (checkin.guestId) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} is already assigned to Guest ${checkin.guestId}`
            );
        }
        const guest = await Guest.findOne({
            where: {
                id: assign.guestId,
                facilityId: facilityId,
            }
        });
        if (!guest) {
            throw new NotFound(
                `guestId: Missing Guest ${assign.guestId}`,
                "CheckinServices.assign"
            );
        }
        // @ts-ignore - already checked assign.guestId
        if (!(await validateCheckinGuestUnique(facility.id, checkinId, checkin.checkinDate, assign.guestId))) {
            throw new BadRequest(
                `guestId: Guest ${guest.id} is already assigned on date ${checkin.checkinDate}`,
                "CheckinServices.assign"
            );
        }

        // Update and persist the relevant information
        const update = {
            comments: assign.comments,
            guestId: assign.guestId,
            paymentAmount: assign.paymentAmount,
            paymentType: assign.paymentType,
            showerTime: assign.showerTime,
            wakeupTime: assign.wakeupTime,
        }
        return this.update(facilityId, checkinId, update);

    }

    /**
     * Deassign the Guest currently assigned to the specified Checkin, and erase
     * any corresponding details.
     */
    public async deassign(facilityId: number, checkinId: number): Promise<Checkin> {

        // Validate the incoming parameters
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.assign"
            );
        }
        const checkin = await Checkin.findOne({
            where: {
                id: checkinId,
                facilityId: facilityId,
            }
        });
        if (!checkin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.assign"
            );
        }
        if (!checkin.guestId) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} is not currently assigned`
            );
        }

        // Update and persist the relevant information
        const update = {
            comments: null,
            guestId: null,
            paymentAmount: null,
            paymentType: null,
            showerTime: null,
            wakeupTime: null,
        }
        return this.update(facilityId, checkinId, update);

    }

    /**
     * Generate empty Checkins for the specified checkinDate, using the
     * specified templateId as the basis.
     */
    public async generate(facilityId: number, checkinDate: string, templateId: number): Promise<Checkin[]> {

        // Look up the requested Facility and Template
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.generate"
            );
        }
        const template = await Template.findByPk(templateId);
        if (!template) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "CheckinServices.generate"
            );
        }
        if (template.facilityId !== facility.id) {
            throw new BadRequest(
                `templateId: Template ${templateId} does not belong to this Facility`,
                "CheckinServices.generate"
            );
        }

        // Verify that there are no Checkins for this checkinDate already
        const count = await Checkin.count({
            where: {
                checkinDate: checkinDate,
                facilityId: facilityId,
            }
        });
        if (count > 0) {
            throw new BadRequest(
                `checkinDate: There are already ${count} Checkins for this date`,
                "CheckinServices.generate"
            );
        }

        // Set up parameters we will need for features generation
        const allMats = new MatsList(template.allMats);
        const handicapMats = new MatsList(template.handicapMats ? template.handicapMats : "9999");
        const socketMats = new MatsList(template.socketMats ? template.socketMats : "9999");
        const workMats = new MatsList(template.workMats ? template.workMats : "9999");

        // Accumulate the requested (unassigned) Checkins to be created.
        const inputs: Partial<Checkin>[] = [];
        allMats.exploded().forEach(matNumber => {
            let features: string | null = "";
            if (handicapMats && handicapMats.isMemberOf(matNumber)) {
                features += "H";
            }
            if (socketMats && socketMats.isMemberOf(matNumber)) {
                features += "S";
            }
            if (workMats && workMats.isMemberOf(matNumber)) {
                features += "W";
            }
            if (features.length === 0) {
                features = null;
            }
            inputs.push({
                checkinDate: Dates.toObject(checkinDate),
                facilityId: facilityId,
                features: features ? features : undefined,
                matNumber: matNumber,
            });
        });

        // Persist and return the generated Checkins
        const outputs = await Checkin.bulkCreate(inputs, {
            fields: ["checkinDate", "facilityId", "features", "matNumber"]
        })
        return outputs;

    }

    /**
     * Reassign the Guest currently assigned to the specified Checkin to the
     * new Checkin specified in the corresponding details, deassigning that
     * Guest from the previously assigned Checkin.
     */
    public async reassign(facilityId: number, checkinId: number, assign: Assign): Promise<Checkin> {

        // Validate the incoming parameters
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "CheckinServices.reassign"
            );
        }
        const oldCheckin = await Checkin.findOne({
            where: {
                id: checkinId,
                facilityId: facilityId,
            }
        });
        if (!oldCheckin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.reassign"
            );
        }
        if (!oldCheckin.guestId) {
            throw new BadRequest(
                `guestId: Checkin ${checkinId} is not currently assigned`,
                "CheckinServices.reassign"
            );
        }
        const newCheckin = await Checkin.findOne({
            where: {
                id: assign.checkinId,
                facilityId: facilityId,
            }
        })
        if (!newCheckin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${assign.checkinId}`,
                "CheckinServices.reassign"
            );
        }
        if (newCheckin.checkinDate !== oldCheckin.checkinDate) {
            throw new BadRequest(
                `checkinDate: Cannot reassign from '${oldCheckin.checkinDate}' to '${newCheckin.checkinDate}`,
                "CheckinServices.reassign"
            );
        }
        if (newCheckin.guestId) {
            throw new BadRequest(
                `guestId: Checkin ${assign.checkinId} is already assigned to Guest ${newCheckin.guestId}`,
                "CheckinServices.reassign"
            );
        }

        // Set up updates and persist them
        const oldUpdate = {
            comments: null,
            guestId: null,
            paymentAmount: null,
            paymentType: null,
            showerTime: null,
            wakeupTime: null,
        }
        await this.update(facilityId, checkinId, oldUpdate);
        const newUpdate = {
            comments: assign.comments,
            guestId: oldCheckin.guestId, // Reassigning the same Guest
            paymentAmount: assign.paymentAmount,
            paymentType: assign.paymentType,
            showerTime: assign.showerTime,
            wakeupTime: assign.wakeupTime,
        }
        // @ts-ignore - we already verified assign.checkinId
        return this.update(facilityId, assign.checkinId, newUpdate);

    }

    public async summaries(
        facilityId: number,
        checkinDateFrom: string,
        checkinDateTo: string
        ) : Promise<Summary[]>
    {

        // Select the relevant Checkins for this Facility and date range
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsSummaries");
        }
        const options: FindOptions = {
            order: SortOrder.CHECKINS,
            where: {
                checkinDate: {
                    [Op.and]: {
                        [Op.gte]: checkinDateFrom,
                        [Op.lte]: checkinDateTo
                    }
                }
            }
        }
        const checkins = await facility.$get("checkins", options);

        // Accumulate and return the corresponding Summaries
        const summaries: Summary[] = [];
        let summary: Summary = new Summary(-1);
        checkins.map(checkin => {
            if (summary.facilityId < 0) {
                summary = new Summary(checkin.facilityId, checkin.checkinDate);
            }
            if (checkin.checkinDate !== summary.checkinDate) {
                summaries.push(summary);
                summary = new Summary(checkin.facilityId, checkin.checkinDate);
            }
            summary.includeCheckin(checkin);
        });
        if (summary.facilityId >= 0) {
            summaries.push(summary);
        }
        return summaries;

    }


    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withFacility                   Include parent Facility
     * * withGuest                      Include related Guest (if any)
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
     * Supported match query parameters (available and guest are mutually exclusive):
     * * available                      Select available (i.e. no Guest) Checkins
     * * date={checkinDate}             Select checkins for the specified date
     * * guestId={guestId}              Select checkins for the specified guest
     */
    public appendMatchOptions(options: FindOptions, query?: any): FindOptions {
        options = this.appendIncludeOptions(options, query);
        if (!query) {
            return options;
        }
        const where: any = options.where ? options.where : {};
        if ("" === query.available) {
            where.guestId = { [Op.eq]: null };
        }
        if (query.date) {
            where.checkinDate = query.date;
        }
        if (query.guestId) {
            where.guestId = parseInt(query.guestId, 10);
        }
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new CheckinServices();

// Private Options -----------------------------------------------------------

const FIELDS = [
    "checkinDate",
    "comments",
    "facilityId",
    "features",
    "guestId",
    "matNumber",
    "paymentAmount",
    "paymentType",
    "showerTime",
    "wakeupTime",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];
