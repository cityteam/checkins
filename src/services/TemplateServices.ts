// TemplateServices ----------------------------------------------------------

// Services implementation for Template models.

// External Modules ----------------------------------------------------------

import {FindOptions, Op, ValidationError} from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractChildServices from "./AbstractChildServices";
import Facility from "../models/Facility";
import Template from "../models/Template";
import {BadRequest, NotFound, ServerError} from "../util/HttpErrors";
import {appendPaginationOptions} from "../util/QueryParameters";
import * as SortOrder from "../util/SortOrders";

// Public Objects ------------------------------------------------------------

class TemplateServices extends AbstractChildServices<Template> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(facilityId: number, query?: any): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "TemplateServices.all"
            );
        }
        const options = this.appendMatchOptions({
            order: SortOrder.TEMPLATES
        }, query);
        return facility.$get("templates", options);
    }

    public async find(facilityId: number, templateId: number, query?: any): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "TemplateServices.find"
            );
        }
        const options = this.appendIncludeOptions({
            where: { id: templateId }
        }, query);
        const results = await facility.$get("templates", options);
        if (results.length !== 1) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "TemplateServices.find"
            );
        }
        return results[0];
    }

    public async insert(facilityId: number, template: any): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "TemplateServices.find"
            );
        }
        template.facilityId = facilityId; // No cheating
        try {
            return await Template.create(template, {
                fields: FIELDS,
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "TemplateServices.insert"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "TemplateServices.insert"
                );
            }
        }
    }

    public async remove(facilityId: number, templateId: number): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "TemplateServices.remove"
            );
        }
        const results = await facility.$get("templates", {
            where: { id: templateId }
        });
        if (results.length !== 1) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "TemplateServices.remove"
            );
        }
        await Template.destroy({
            where: { id: templateId }
        });
        return results[0];
    }

    public async update(facilityId: number, templateId: number, template: any): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "TemplateServices.update"
            );
        }
        try {
            const results = await Template.update(template, {
                fields: FIELDS_WITH_ID,
                returning: true,
                where: {
                    id: templateId,
                    facilityId: facilityId,
                }
            });
            if (results[0] < 1) {
                throw new NotFound(
                    `templateId: Missing Template ${templateId}`,
                    "TemplateServices.update"
                );
            }
            return results[1][0];
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            } else if (error instanceof ValidationError) {
                throw new BadRequest(
                    error,
                    "TemplateServices.update"
                );
            } else {
                throw new ServerError(
                    error as Error,
                    "TemplateServices.update"
                );
            }
        }
    }

    // Model-Specific Methods ------------------------------------------------

    public async exact(facilityId: number, name: string, query?: any): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "TemplateServices.exact"
            );
        }
        const options = this.appendIncludeOptions({
            where: { name: name }
        }, query);
        const results = await facility.$get("templates", options);
        if (results.length !== 1) {
            throw new NotFound(
                `name: Missing Template '${name}'`,
                "TemplateServices.exact"
            );
        }
        return results[0];
    }

    // Public Helpers --------------------------------------------------------

    /**
     * Supported include query parameters:
     * * withFacility                   Include parent Facility
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
        if (include.length > 0) {
            options.include = include;
        }
        return options;
    }

    /**
     * Supported match query parameters:
     * * active                         Select active Templates
     * * name={wildcard}                Select templates with matching name (wildcard)
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
        if (Object.keys(where).length > 0) {
            options.where = where;
        }
        return options;
    }

}

export default new TemplateServices();

// Private Options -----------------------------------------------------------

const FIELDS = [
    "active",
    "allMats",
    "comments",
    "facilityId",
    "handicapMats",
    "name",
    "socketMats",
    "workMats",
];

const FIELDS_WITH_ID = [
    ...FIELDS,
    "id",
];
