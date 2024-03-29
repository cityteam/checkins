// ApplicationValidators -----------------------------------------------------

// Custom (to this application) validation methods that can be used by both
// backend database interactions and frontend UI components.  In all cases,
// a "true" return indicates that the proposed value is valid, while "false"
// means it is not.  If a field is required, that must be validated separately.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import MatsList from "./MatsList";

// Public Objects ------------------------------------------------------------

export const validateFacilityScope = (scope: string | undefined): boolean => {
    if (!scope || (scope.length === 0)) {
        return true;
    }
    return scope.match(scopePattern) !== null;
}

export const validateFeatures = (features: string): boolean => {
    if (features) {
        for (let i: number = 0; i < features.length; i++) {
            if (!validFeatures.includes(features.charAt(i))) {
                return false;
            }
        }
        return true;
    } else {
        return true;
    }
}

export const validateMatNumber = (matNumber: number): boolean => {
    if (matNumber) {
        return (matNumber > 0);
    } else {
        return false;
    }
}

export const validateMatsList = (matsList: string): boolean => {
    if (matsList) {
        try {
            new MatsList(matsList);
            return true;
        } catch (error) {
            return false;
        }
    } else {
        return true;
    }
}

export const validateMatsSubset = (parent: string, child: string): boolean => {
    if (parent && child) {
        try {
            const parentList = new MatsList(parent);
            const childList = new MatsList(child);
            return childList.isSubsetOf(parentList);
        } catch (error) {
            return false;
        }
    } else {
        return true;
    }
}

export const validatePaymentAmount = (paymentAmount: number): boolean => {
    if (paymentAmount) {
        return (paymentAmount >= 0.00);
    } else {
        return true;
    }
}

export const validatePaymentType = (paymentType: string): boolean => {
    if (paymentType) {
        return validPaymentTypes.includes(paymentType);
    } else {
        return true;
    }
}

// Private Objects -----------------------------------------------------------

const scopePattern: RegExp = /^[a-zA-Z0-9]+$/;

const validFeatures: string = "HSW";

const validPaymentTypes: string[] =
    [ "$$", "AG", "CT", "FM", "MM", "SW", "UK", "WB" ];
