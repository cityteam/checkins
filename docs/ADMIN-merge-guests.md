[Home](./index.md) | [Introduction](./ADMIN-introduction.md) | [Overview](./ADMIN-overview.md) | [Facilities](./ADMIN-facilities.md) | [Guests](./ADMIN-guests.md) | [Templates](./ADMIN-templates.md) | [Users](./ADMIN-users.md) | MERGE Guests
<hr/>

# Introduction

As has been stated, our goal in recording checkins is to keep a history of each individual
that has every been an overnight Guest at a CityTeam Facility.  The Checkin process makes
it as easy as possible to determine whether a name has been seen before, but it is not
foolproof -- perhaps the name was spelled slightly differently the previous time.

### Initial Screen

The `Admin -> MERGE Guests` option allows a user with administrative permissions to
determine that two different Guests realy are the same person, merge their overnight
checkins together, and eliminate the now-useless duplicate.

![Merge Initial Screen](./merge-first.png)

### Select FROM Guest

First, use the left side of the screen to select the Guest who you consider to be
the duplicate, which will be eliminated after the merge process.  When you find the
person you are looking for, click on the name to select that person.

![Merge Select FROM Guest](./merge-second.png)

While you are performing this selection, note the dates that this person has
previously checked in.  You will not be allowed to perform the merge if there
is an overlap between checkin dates for the FROM person and the TO person, because
it is not allowed to check the same person in more than once.

### Select TO Guest

Next, use the right side of the screen to select the Guest you consider to be the
actual person we want to keep track of.

![Merge Select TO Guest](./merge-third.png)

As before, double check the previously recorded checkin dates to make sure that
there are no duplications.

### Perform The Merge

Once you have selected both Guests, the `Merge` button becomes enabled.  Click
it, answer the confirmation, and the merge is completed.  After this, the FROM
person will no longer exist in the database, and any previous checkins for the
FROM person will have been reassigned to the TO person instead.

