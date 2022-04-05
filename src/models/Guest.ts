// Guest ---------------------------------------------------------------------

// An overnight Guest who has ever checked in at a CityTeam Facility.

// External Modules ----------------------------------------------------------

const {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Table
} = require("sequelize-typescript");

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import Ban from "./Ban";
import Checkin from "./Checkin";
import Facility from "./Facility";
import {
    validateFacilityId,
    validateGuestNameUnique,
} from "../util/AsyncValidators";
import {BadRequest} from "../util/HttpErrors";

// Public Objects -----------------------------------------------------------

@Table({
    modelName: "guest",
    tableName: "guests",
    validate: {
        isFacilityIdValid: async function(this: Guest): Promise<void> {
            if (!(await validateFacilityId(this.facilityId))) {
                throw new BadRequest
                    (`facilityId: Missing Facility ${this.facilityId}`);
            }
        },
        isNameUnique: async function(this: Guest): Promise<void> {
            if (!(await validateGuestNameUnique(this))) {
                throw new BadRequest
                    (`name: Name '${this.firstName} ${this.lastName}' is already in use within this Facility`);
            }
        },
    }
})
class Guest extends AbstractModel<Guest> {

    @Column({
        allowNull: false,
        defaultValue: true,
        field: "active",
        type: DataType.BOOLEAN,
        validate: {
            notNull: { msg: "active: Is required" },
        }
    })
    active!: boolean;

    @HasMany(() => Ban)
    bans!: Ban[];

    @HasMany(() => Checkin)
    checkins!: Checkin[];

    @Column({
        allowNull: true,
        field: "comments",
        type: DataType.TEXT,
    })
    comments?: string;

    @BelongsTo(() => Facility, {
        foreignKey: { allowNull: false },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    facility!: Facility;

    @ForeignKey(() => Facility)
    @Column({
        allowNull: false,
        field: "facility_id",
        type: DataType.INTEGER,
        validate: {
            notNull: { msg: "facilityId: Is required"},
        },
    })
    facilityId!: number;

    @Column({
        allowNull: true,
        field: "favorite",
        type: DataType.TEXT,

    })
    favorite?: string;

    // Columns ordered to get unique index ordering correct

    @Column({
        allowNull: false,
        field: "last_name",
        type: DataType.TEXT,
        validate: {
            notNull: { msg: "lastName: Is required"},
        },
    })
    lastName!: string;

    @Column({
        allowNull: false,
        field: "first_name",
        type: DataType.TEXT,
        validate: {
            notNull: { msg: "firstName: Is required"},
        },
    })
    firstName!: string;

}

export default Guest;
