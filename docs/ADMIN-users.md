[Home](./index.md) | [Introduction](./ADMIN-introduction.md) | [Overview](./ADMIN-overview.md) | [Facilities](./ADMIN-facilities.md) | [Guests](./ADMIN-guests.md) | [Templates](./ADMIN-templates.md) | Users | [MERGE Guests](./ADMIN-merge-guests.md)
<hr/>

# Introduction

A *User* is an individual person (or group of people, depending on your administrator's
choice) that are authorized to log in to the CityTeam Checkins application.  What each
person is allowed to do will be defined by the *Scope* field, as described below.

For security reasons, only a user with **superuser** permissions is allowed to view
or manage users.

### List View

When you select the `Admin` -> `Users` view, you will see a list of previously defined
Users for the entire application.

![Users List](./users-first.png)

You will note that each user has at least one *Scope* value, which is made up of:
* The scope value from the Facility (by default, we used the three-letter airport
  code of the nearest major airport).
* A colon (**:**).
* The word *admin* or *regular*, depending on whether this user has administrative
  permissions for the specified Facility, or just regular permissions.  If the user
  has been assigned administrative permissions, they inherit all the things that
  regular users can do as well.

### Details View

![User Details](./users-second.png)

Note that the Password field is blank, even though a password was previously assigned.
**Only fill this field in on an existing User if you wish to change their current
password!**.  For security reasons, there is no ability to recover what the existing
password is, so you must change it if the user forgets.

### Field Definitions

| Field Name     | Required | Description                                                                                             |
| -------------- | :------: |---------------------------------------------------------------------------------------------------------|
| Name           | Yes      | Name or description of this user.                                                                       |
| Scope          | Yes      | Permission value(s) as described above.                                                                 |
| Username       | Yes      | Login username of this user. Must be globally unique.                                                   |
| Password       | See Note | Login password of this user.  Required on new users, only entered to change password on existing users. |

