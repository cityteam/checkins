[Home](./index.md) | [Introduction](./ADMIN-introduction.md) | [Overview](./ADMIN-overview.md) | [Facilities](./ADMIN-facilities.md) | Guests | [Templates](./ADMIN-templates.md) | [Users](./ADMIN-users.md) | [MERGE Guests](./ADMIN-merge-guests.md)
<hr/>

# Introduction

A *Guest* is an individual person who has ever stayed overnight in this
CityTeam Facility.  Our goal when checking Guests in is that, if this is
the same person coming back for a different night, we record them under
the same name.  In that way, it is possible to investigate whether
a particular person was here on particular nights, if questions were to
come up.

### List View

When you select the `Admin` -> `Guests` view, you will see the usual list
format displayed.  However, because there can potentially be thousands of
Guests that have ever stayed in this Facility, none of them are preselected.
Instead, you must type all or part of either the first name or the last
name into the search field.  Any Guest whose first name or last name matches
what you have typed will be selected and displayed.

![Guests List](./guests-first.png)

Besides searching on characters from either name, you can also match on
parts of **both** names, by putting a space in the middle.  For example,
you can type `ar ub` to find anyone whose first name contains *ar* and whose
last name contains *ub*.

### Details View

Users with either *admin* or *regular* permissions may add new Guests, or
edit existing Guests.  Normally, this will happen automatically as part of
the nightly checkin process, but you can alternatively go here if you want
to verify or update something.

![Guest Details](./guests-second.png)

Only a **superuser** is allowed to remove existing Guests.

### Field Definitions

| Field Name | Required | Description |
|------------| :------: | ----------- |
| First Name | Yes | First name of this person. |
| Last Name  | Yes | Last name of this person.  First and Last Names must be unique. |
| Comments   | No | General comments about this person.  This will show in the List View. |
| Favorite   | No | If this person has a favorite mat or sleeping location, you can note it here. |
| Active     | Yes | Flag indicating whether this Guest is active or not. |



