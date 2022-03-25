[Home](./index.md)

# Configuration Cheat Sheet

This document provides a convenient place to record all of the configuration
settings you use, such as usernames and passwords, URLs for the database and
log files, and so on.  We suggest that you print out this sheet, record the
values as they are created, and **keep the printed copy in a secure place**
so that you can refer to it later.

`DEVELOPER NOTE`:  These values contain sensitive information, and should
**never** be recorded in a source control system like Git.

## Database Environment Variables

| Placeholder  | Description                                                         | Your Configured Value |
|--------------|---------------------------------------------------------------------|-----------------------|
| {DBHOST}     | Network name of the Postgres host ("localhost" for a local install) |                       | 
| {DBNAME}     | Postgres database name you have selected (normally same as the app) |                       |
| {DBPASSWORD} | Application database password you have selected                     |                       |
| {DBPORT}     | Network port number Postgres is running on (normally 5432)          |                       |
| {DBUSERNAME} | Application database username you have selected                     |                       |
| {PGPASSWORD} | Postgres system *database superuser* password (MUST be configured)  |                       |
| {PGUSERNAME} | Postgres system username (normally "postgres")                      |                       |

## Application Environment Values

| Placeholder  | Description                                                            | Your Configured Value |
|--------------|------------------------------------------------------------------------|-----------------------|
| {APPHOST}    | Network name of the application host ("localhost" for a local install) |                       |
| {APPPORT}    | Network port of the application host (typically 8080 for development)  |                       |
| {SUPASSWORD} | Application password for the superuser user (MUST be configured)       |                       |
| {SUUSERNAME} | Application username for the superuser user (MUST be configured)       |                       |

