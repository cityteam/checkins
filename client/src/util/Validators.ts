// Validators ----------------------------------------------------------------

// Standard (across applications) validation methods that can be used both by
// backend database interactions and frontend UI components.  In all cases,
// a "true" return indicates that the proposed value is valid, while "false"
// means it is not.  If a field is required, that must be validated separately.

// Public Objects ------------------------------------------------------------

export const validateDate = (date: string): boolean => {
    if (!date || (date.length === 0)) {
        return true;
    } else {
        // range check on each component?
        return datePattern.test(date);
    }
}

export const validateEmail = (email: string): boolean => {
    if (!email || (email.length === 0)) {
        return true;
    } else {
        return emailPattern.test(email);
    }
}

export const validateFacilityScope = (scope: string | undefined): boolean => {
    if (!scope || (scope.length === 0)) {
        return true;
    }
    return scope.match(scopePattern) !== null;
}

export const validateMonth = (month: string): boolean => {
    if (!month || (month.length === 0)) {
        return true;
    } else {
        // range check on each component?
        return monthPattern.test(month);
    }
}

export const validateNumber = (number: string | null | undefined): boolean => {
    if (number) {
        return !isNaN(Number(number));
    } else {
        return true;
    }
}

export const validatePhone = (phone: string): boolean => {
    if (!phone || (phone.length === 0)) {
        return true;
    } else {
        return phonePattern.test(phone);
    }
}

export const validateState = (state: string): boolean => {
    if (!state || (state.length === 0)) {
        return true;
    } else {
        return stateAbbreviations.includes(state);
    }
}

export const validateTime = (time: string): boolean => {
    if (!time || (time.length === 0)) {
        return true;
    } else {
        // range check on each component?
        return timePattern.test(time);
    }
}

export const validateZipCode = (zipCode: string): boolean => {
    if (!zipCode || (zipCode.length === 0)) {
        return true;
    } else {
        return zipCodePattern.test(zipCode);
    }
}

// Private Objects -----------------------------------------------------------

const datePattern: RegExp = /^\d{4}-\d{2}-\d{2}$/;

// From https://www.w3resource.com/javascript/form/email-validation.php
// Probably not universal but serves our current needs
const emailPattern: RegExp
    = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const monthPattern: RegExp = /^\d{4}-\d{2}$/;

const phonePattern: RegExp = /^\d{3}-\d{3}-\d{4}$/;

const scopePattern: RegExp = /^[a-zA-Z0-9]+$/;

const stateAbbreviations: string[] =
    [ "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
        "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
        "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
        "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
        "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
        "VT", "VA", "WA", "WV", "WI", "WY" ];

const timePattern = /^\d{2}:\d{2}$|^\d{2}:\d{2}:\d{2}$/;

const zipCodePattern: RegExp = /^\d{5}$|^\d{5}-\d{4}$/;
