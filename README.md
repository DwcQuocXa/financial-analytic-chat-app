# AlphaSense Home Test - Ngo Gia Duc

Email: duc.ngogia2002@gmail.com

### Link Demo: http://ecsclu-chata-sqcmtc8ivsc7-626708928.eu-west-1.elb.amazonaws.com/

## Tasks Status

### React Frontend
- [x] Render a full page application with three panels.
- [x] Navigation panel shows a list of channels.
- [x] Message list panel shows a list of message bodies for one channel.
- [x] Editor panel shows a text area input.
- [x] Editor panel is hidden if there is no channel selected.
- [x] Editor has a submit button.
- [x] Submit button is disabled if there is no text in message body.
- [x] Clicking a channel in navigation panel selects that channel.
- [x] Entering text in editor and clicking submit adds message to the currently selected channel.
- [x] Submitting editor clears input.
- [x] Switching channels clears input.
- [x] Channel list is loaded once on loading the application.
- [x] Initially no channel is selected.
- [x] Messages are loaded from remote on channel selection and updated to screen.
- [x] Messages are also stored to local state after loading from remote.
- [x] Editing is not required, only creation.
- [x] Upon submitting a message to a channel, that message is available for other users.
- [x] Submitting user sees message in message list after submitting.
- [x] Render created message in the list immediately before refreshing from backend.

### ExpressJs Backend
- [x] Channel and message storage can be an in-memory database.
- [x] On server start, storage is populated with a fixed set of empty channels.
- [x] GET endpoint for querying channels.
- [x] GET endpoint for querying channel’s messages.
- [x] POST endpoint for submitting new messages to a channel.


## Instructions

### Backend
- ENVIRONMENT VARIABLES:
  - `PORT=4000` (default)
- Setup:
  - Create the `.env` file and place `PORT=4000` into it.
  - Change directory to the backend directory: `cd packages/backend`.
  - Install dependencies: `yarn install`.
  - Run in development mode: `yarn serve`.
  - Build: `yarn build`.
  - Start in production mode: `node dist/index.js` or `yarn start`.

### Frontend
- ENVIRONMENT VARIABLES:
  - `SERVICE_ENDPOINT=http://localhost:4000` (default)
- Setup:
  - Create the `.env.local` file and place `SERVICE_ENDPOINT=http://localhost:4000` into it.
  - Change directory to the frontend directory: `cd packages/frontend`.
  - Install dependencies: `yarn install`.
  - Run in development mode: `yarn start`.
  - Build: `yarn build`.

## Run with Docker

### Prerequisites
- Docker 19+
- docker-compose

### Run in Local with docker-compose
- Run: `docker-compose up -d`
- Access the Application: Open http://localhost:8080

---

## Detailed Features

