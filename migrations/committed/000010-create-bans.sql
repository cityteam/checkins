-- Create bans table

-- Undo if rerunning
DROP TABLE IF EXISTS bans;

-- Create table
CREATE TABLE bans (
    id              SERIAL PRIMARY KEY,
    active          BOOLEAN NOT NULL DEFAULT true,
    comments        TEXT,
    facility_id     INTEGER NOT NULL,
    from_date       DATE NOT NULL,
    guest_id        INTEGER NOT NULL,
    staff           TEXT,
    to_date         DATE NOT NULL
);

-- Create foreign key constraints
ALTER TABLE bans ADD CONSTRAINT bans_facility_id_fkey
    FOREIGN KEY (facility_id) REFERENCES facilities (id)
        ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE bans ADD CONSTRAINT bans_guest_id_fkey
    FOREIGN KEY (guest_id) REFERENCES guests (id)
        ON UPDATE CASCADE ON DELETE CASCADE;
