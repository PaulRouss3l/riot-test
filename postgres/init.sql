-- create database sequra;

CREATE TABLE "employees" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "secondary_emails" text[],
  "googleUserId" text,
  "slackUserId" text
);