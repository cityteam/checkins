// ApiRouter -----------------------------------------------------------------

// Consolidation of Routers for REST APIs for application models.

// External Modules ----------------------------------------------------------

import {Router} from "express";

// Internal Modules ----------------------------------------------------------

import BanRouter from "../routers/BanRouter";
import CheckinRouter from "../routers/CheckinRouter";
import ClientRouter from "../routers/ClientRouter";
import DatabaseRouter from "../routers/DatabaseRouter";
import FacilityRouter from "../routers/FacilityRouter";
import GuestRouter from "../routers/GuestRouter";
import TemplateRouter from "../routers/TemplateRouter";
import UserRouter from "../routers/UserRouter";

// Public Objects ------------------------------------------------------------

const ApiRouter = Router({
    strict: true,
});

ApiRouter.use("/bans", BanRouter);
ApiRouter.use("/checkins", CheckinRouter);
ApiRouter.use("/client", ClientRouter);
ApiRouter.use("/database", DatabaseRouter);
ApiRouter.use("/facilities", FacilityRouter);
ApiRouter.use("/guests", GuestRouter);
ApiRouter.use("/templates", TemplateRouter);
ApiRouter.use("/users", UserRouter);

export default ApiRouter;
