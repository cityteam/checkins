// User ----------------------------------------------------------------------

// A user who may be authenticated to, and use the features of, this application.

// Internal Modules ----------------------------------------------------------

import AccessToken from "./AccessToken";
import Model from "./Model";
import RefreshToken from "./RefreshToken";
import * as ToModel from "../util/ToModel";

// Public Objects ------------------------------------------------------------

export const USERS_BASE = "/users";

class User extends Model {

    constructor(data: any = {}) {

        super(data);
        this.active = (data.active !== undefined) ? data.active : true;
        this.name = data.name ? data.name : null;
        this.password = data.password ? data.password : null;
        this.scope = data.scope ? data.scope : null;
        this.username = data.username ? data.username : null;

        this.accessTokens = data.accessTokens ? ToModel.ACCESS_TOKENS(data.accessTokens) : [];
        this.refreshTokens = data.refreshTokens ? ToModel.REFRESH_TOKENS(data.refreshTokens) : [];

    }


    active?: boolean;
    name!: string;
    password?: string;
    scope!: string;
    username!: string;

    accessTokens: AccessToken[];
    refreshTokens: RefreshToken[];

}

export default User;
