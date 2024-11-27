
# WAPI_NodeJS_Express

This project is a web API Node.js using Express. the project uses PostgreSQL. Neon is used as cloud-host PostgreSQL provider.

## Getting Started

# Greeting API

## Overview

The **Greeting API** is a simple Node.js API that serves greetings based on the time of day, language, and tone. It uses Express and Sqlite3 for database interactions. The database is pre-seeded with greetings in three languages: English, French, and Spanish, for different times of day (Morning, Afternoon, Evening), in addition to 2 types of greeting tones (Formal and Casual).

## Features

- Fetch a greeting message based on time of day,language, and tone.
- Retrieve a list of available times of day.
- Retrieve a list of supported languages.

- The API is deployed on Vercel and is Live. The Base address:
 `https://api-node-js-postrgres-vercel.vercel.app/api/Greetings`  or  `https://api-node-js-postrgres-vercel-git-master-eabdeens-projects.vercel.app/api/Greetings`.


## API Endpoint

### POST **/GreetUser**
- **URL**: `https://api-node-js-postrgres-vercel-git-master-eabdeens-projects.vercel.app/api/Greetings/GreetUser`
- **Description**: Returns a greeting message based on the time of day, language and Tone.
- **Request Body**:

```json
{
  "TimeOfDay": "Morning",
  "Language": "English",
  "Tone": "Formal"
}
```

- **response Body**:

```json
{
  "greetingMessage": "Good Morning!"
}
```

### GET **/GetAllTimesOfDay**
- **URL**: `https://api-node-js-postrgres-vercel-git-master-eabdeens-projects.vercel.app/api/Greetings/GetAllTimesOfDay`
- **Description**: Returns all Times of day
- **response Body**:

```json
[
    "Morning",
    "Afternoon",
    "Evening"
]
```

### GET **/GetSupportedLanguages**

- **URL**: `https://api-node-js-postrgres-vercel-git-master-eabdeens-projects.vercel.app/api/Greetings/GetSupportedLanguages`
- **Description**: Returns all the suppoted languages
- **response Body**:

```json
[
    "English",
    "Italian",
    "Spanish"
]
```

## Authors

**This assignment is designed by**
**student name**: Eman Abdeen  
**Student id**: 8783804
**GitHub repository**: `https://github.com/emanabdeen/API_NodeJS_Postrgres_Vercel`
