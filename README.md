# Riot test

This repo is aiming to solve this [code challenge](https://github.com/tryriot/backend-challenge)

## Requirements

- nodejs
- docker

## Install

```
make install
# or
npm i
```

## Run

```
make start
# or
docker-compose up -d
npm start
```

The server should be available @ localhost:3000

## Tests

```
make test
# or
docker-compose up -d
npm test
```

## Comments

I have some issues with the subject :

```
    Employees are matched by email address (if they have the same email address, primary or not).
```
  What does that mean ? What should keep as a primary address ?
  In a real world case, it's possible that people works for different cies and then we should not update the primary address
  Here I choice my interpretation, but in a daily work case, I would have ask about it :/


```
    An employee can be created manually using the /api/employees API.
    If the manually created employee is not referenced in the /import call, it should not be deleted..
    If the manually created employee is referenced during an import and then no longer referenced, they can be deleted..
```
  - They can be deleted ?
  - should I do it ?
  - Does it mean I need to implement a DELETE /api/import ?


I think the subject imply I need to create a import versioning. It's not hard to do, it would require a versioning table with an url, a date and a list of employee id.

Given that I already gave this test a little more than 6h, I will not implement this feature. If this is a problem, let's discuss about it !

## Technical choices

### Data validation

I'm using a schema validation dependency in order to validate my data :
 - `typescript-json-schema` for the schema generation
 - `ajv` for the data validation

you can launch it with :
```
make schema:generate
```
I don't think it's something battle ready but it's enough for this kind of challenge

### DB

I'm using PostgresSQL as a DB. We could use something lighter but I didn't see reason enough to do so.

I considered NoSQL at some point because of the email/emails key missmatch, and given the history step it's maybe what was expected. Given the subject context, I think this data will be used in conjonction with other data, where a relational DB will be more efficient.


### Testing

I've used :
 - `Jest` as a testing software.
 - `supertest` as an API testing tool
 - `axios-mock-adapter` to mock the provider response

### To go further

  - Create a simple docker with alpine-node for the backend
  - Create a github CI to run the test on PR and main push
  - Have a precommit hook to run prettier, eslint and tests

### To the reviewer

Beside for the 1st commit (which is massive, sorry about that), I've tried to commit regularly with relativly decriptive comments. Feel free to look at them if you to know my dev procress.

Thanks for reading this, have a good review :)