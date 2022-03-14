// GuestRouter ---------------------------------------------------------------

// Express endpoints for Guest models.

// External Modules ----------------------------------------------------------

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireAdmin,
    requireRegular,
    requireSuperuser,
} from "../oauth/OAuthMiddleware";
import GuestServices from "../services/GuestServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

const GuestRouter = Router({
    strict: true,
});

// Model-Specific Routes (no guestId) ----------------------------------------

GuestRouter.get("/:facilityId/exact/:firstName/:lastName",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.exact(
            parseInt(req.params.facilityId, 10),
            req.params.firstName,
            req.params.lastName,
            req.query
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

GuestRouter.get("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.all(
            parseInt(req.params.facilityId, 10),
            req.query
        ));
    });

GuestRouter.post("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await GuestServices.insert(
            parseInt(req.params.facilityId, 10),
            req.body
        ));
    });

GuestRouter.delete("/:facilityId/:guestId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.remove(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.guestId, 10)
        ));
    });

GuestRouter.get("/:facilityId/:guestId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.find(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.guestId, 10),
            req.query
        ));
    });

GuestRouter.put("/:facilityId/:guestId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.update(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.guestId, 10),
            req.body
        ));
    });

// Model-Specific Routes (with guestId) --------------------------------------

GuestRouter.get("/:facilityId/:guestId/checkins",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.checkins(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.guestId, 10),
            req.query
        ));
    });

GuestRouter.get("/:facilityId/:toGuestId/merge/:fromGuestId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await GuestServices.merge(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.toGuestId, 10),
            parseInt(req.params.fromGuestId, 10)
        ));
    });

export default GuestRouter;
