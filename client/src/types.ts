// types ---------------------------------------------------------------------

// Typescript type definitions for client application components.

// External Modules ----------------------------------------------------------

import React from "react";

// Internal Modules ----------------------------------------------------------

import Assign from "./models/Assign";
import Checkin from"./models/Checkin";
import Facility from "./models/Facility";
import Guest from "./models/Guest";
import Summary from "./models/Summary";
import Template from "./models/Template";
import User from "./models/User";

// Enumerations --------------------------------------------------------------

export enum Level {
    TRACE = "trace",
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal",
}

export enum PaymentType {
    $$ = "$$-Cash",
    AG = "AG-Agency",
    CT = "CT-CityTeam",
    FM = "FM-Free Mat",
    MM = "MM-Medical Mat",
    SW = "SW-Severe Weather",
    UK = "UK-Unknown",
    WB = "WB-Work Bed",
}

export enum Scope {
    ADMIN = "admin",
    ANY = "any",
    REGULAR = "regular",
    SUPERUSER = "superuser",
}

// HTML Event Handlers -------------------------------------------------------

export type OnAction = () => void; // Nothing to pass, just trigger action
export type OnBlur = (event: React.FocusEvent<HTMLElement>) => void;
export type OnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type OnChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => void;
export type OnChangeTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
export type OnClick = (event: React.MouseEvent<HTMLElement>) => void;
export type OnFocus = (event: React.FocusEvent<HTMLElement>) => void;
export type OnKeyDown = (event: React.KeyboardEvent<HTMLElement>) => void;

// Miscellaneous Handlers ----------------------------------------------------

export type HandleAction = () => void; // Synonym for OnAction
export type HandleBoolean = (newBoolean: boolean) => void;
export type HandleIndex = (newIndex: number) => void;
export type HandleValue = (newValue: string) => void;

// Model Object Handlers -----------------------------------------------------

export type HandleAssign = (assign: Assign) => void;
export type HandleCheckin = (checkin: Checkin) => void;
export type HandleDate = (date: string) => void;
export type HandleFacility = (facility: Facility) => void;
export type HandleGuest = (guest: Guest) => void;
export type HandleSummary = (summary: Summary) => void;
export type HandleTemplate = (template: Template) => void;
export type HandleUser = (user: User) => void;

