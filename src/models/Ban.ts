// Ban -----------------------------------------------------------------------

// A temporary or permanent ban on accepting the associated Guest into this
// Facility, for a specified date range.

// External Modules ----------------------------------------------------------

import {ForeignKey} from "sequelize-typescript";

const {BelongsTo, Column, DataType, Table} = require("sequelize-typescript");

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import Facility from "./Facility";
import Guest from "./Guest";
import {validateFacilityId, validateGuestId} from "../util/AsyncValidators";
import {BadRequest} from "../util/HttpErrors";

// Public Objects ------------------------------------------------------------

@Table({
    modelName: "ban",
    tableName: "bans",
    validate: {
        isDateRangeValid: function(this: Ban): void {
            if (this.fromDate && this.toDate && (this.toDate < this.fromDate)) {
                throw new BadRequest
                    ("fromDate/toDate: To Date must not be less than From Date");
            }
        },
        isFacilityIdValid: async function(this: Ban): Promise<void> {
            if (!(await validateFacilityId(this.facilityId))) {
                throw new BadRequest
                    (`facilityId: Missing Facility ${this.facilityId}`);
            }
        },
        isGuestIdValid: async function(this: Ban): Promise<void> {
            if (!(await validateGuestId(this.facilityId, this.guestId))) {
                throw new BadRequest
                    (`guestId: Missing Guest ${this.guestId}`);
            }
        },
    }
})
class Ban extends AbstractModel<Ban> {

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

    @Column({
        allowNull: true,
        field: "comments",
        type: DataType.TEXT,
    })
    comments?: string;

    @BelongsTo(() => Facility, {
        foreignKey: { allowNull: true },
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
            notNull: { msg: "facilityId: Is required" }
        },
    })
    facilityId!: number;

    @Column({
        allowNull: false,
        field: "from_date",
        type: DataType.DATEONLY,
        validate: {
            notNull: { msg: "fromDate: Is required" }
        },
    })
    fromDate!: Date;

    @BelongsTo(() => Guest,{
        foreignKey: { allowNull: true },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    guest?: Guest;

    @ForeignKey(() => Guest)
    @Column({
        allowNull: false,
        field: "guest_id",
        type: DataType.INTEGER,
    })
    guestId?: number;

    @Column({
        allowNull: true,
        field: "staff",
        type: DataType.TEXT,
    })
    staff?: string;

    @Column({
        allowNull: false,
        field: "to_date",
        type: DataType.DATEONLY,
        validate: {
            notNull: { msg: "toDate: Is required" }
        },
    })
    toDate!: Date;

}

export default Ban;
