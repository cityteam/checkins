// FacilityRouter ------------------------------------------------------------

// Express endpoints for Facility models.

// External Modules ----------------------------------------------------------

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
//    dumpRequestDetails,
    requireAdmin,
    requireAny,
    requireRegular,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import FacilityServices from "../services/FacilityServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

const FacilityRouter = Router({
    strict: true,
});

// Model-Specific Routes (no facilityId) -------------------------------------

FacilityRouter.get("/exact/:name",
    requireAny, // No facilityId is present
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.exact(
            req.params.name,
            req.query,
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

FacilityRouter.get("/",
    requireAny,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.all(
            req.query
        ));
    });

FacilityRouter.post("/",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await FacilityServices.insert(
            req.body
        ));
    });

FacilityRouter.delete("/:facilityId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.remove(
            parseInt(req.params.facilityId, 10)
        ));
    });

FacilityRouter.get("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.find(
            parseInt(req.params.facilityId, 10),
            req.query
        ));
    });

FacilityRouter.put("/:facilityId",
//    dumpRequestDetails,
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.update(
            parseInt(req.params.facilityId, 10),
            req.body
        ));
    });

// Model-Specific Routes (with facilityId) -----------------------------------

FacilityRouter.get("/:facilityId/guests",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guests(
            parseInt(req.params.facilityId, 10),
            req.query
        ));
    });

FacilityRouter.get("/:facilityId/templates",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templates(
            parseInt(req.params.facilityId, 10),
            req.query
        ));
    });

export default FacilityRouter;
