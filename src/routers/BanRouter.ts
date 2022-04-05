// BanRouter -----------------------------------------------------------------

// Express endpoings for Ban models.

// External Modules ----------------------------------------------------------

import {Request, Response, Router} from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireAdmin,
    requireRegular,
} from "../oauth/OAuthMiddleware";
import BanServices from "../services/BanServices";
import {CREATED} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

const BanRouter = Router({
    strict: true,
});

// Standard CRUD Routes ------------------------------------------------------

BanRouter.get("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await BanServices.all(
            parseInt(req.params.facilityId, 10),
            req.query
        ));
    });

BanRouter.post("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.status(CREATED).send(await BanServices.insert(
            parseInt(req.params.facilityId, 10),
            req.body
        ));
    });

BanRouter.delete("/:facilityId/:banId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await BanServices.remove(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.banId, 10)
        ));
    });

BanRouter.get("/:facilityId/:banId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await BanServices.find(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.guestId, 10),
            req.query
        ));
    });

BanRouter.put("/:facilityId/:banId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await BanServices.update(
            parseInt(req.params.facilityId, 10),
            parseInt(req.params.guestId, 10),
            req.body
        ));
    });

export default BanRouter;
