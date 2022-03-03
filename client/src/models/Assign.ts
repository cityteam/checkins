// Assign -------------------------------------------------------------------

// Subset of a Checkin associated with assigning a specific Guest to a
// specific Checkin.  The "checkinId" field is only used on a reassign.

// Public Objects -----------------------------------------------------------

class Assign {

    constructor(data: any = {}) {

        this.checkinId = data.checkinId ? data.checkinId : null;
        this.comments = data.comments ? data.comments : null;
        this.guestId = data.guestId ? data.guestId : null;
        this.paymentAmount = data.paymentAmount ? String(data.paymentAmount) : null;
        this.paymentType = data.paymentType ? data.paymentType : null;
        this.showerTime = data.showerTime ? data.showerTime : null;
        this.wakeupTime = data.wakeupTime ? data.wakeupTime : null;

    }

    checkinId?: number;
    comments?: string;
    guestId?: number;
    paymentAmount: string | null;
    paymentType?: string;
    showerTime?: string;
    wakeupTime?: string;

}

export default Assign;
