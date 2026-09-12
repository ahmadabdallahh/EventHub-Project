# Backend Routes — `app.js`

Express API for the Events app. Base URL: `http://localhost:8080`

## Server setup (`app.js`)

| Step | Detail |
| ---- | ------ |
| Port | `8080` (`app.listen(8080)`) |
| Body parsing | `body-parser.json()` — accepts JSON request bodies |
| CORS | `Access-Control-Allow-Origin: *`, methods `GET,POST,PATCH,DELETE`, headers `Content-Type` |
| Route mount | `app.use('/events', eventRoutes)` — every endpoint below is prefixed with `/events` |
| Error middleware | Returns `{ message }` with `error.status` (default `500`) as JSON |

## Endpoints (`routes/events.js`)

### `GET /events` — list all events

- Response `200`: `{ "events": Event[] }`
- Errors: `404 { message: "Could not find any events." }` when the store has no `events` key

### `GET /events/:id` — get one event

- Response `200`: `{ "event": Event }`
- Errors: `404` when no events exist or no event matches `:id`

### `POST /events` — create an event

- Body: `{ title, description, date, image }`
- Validation failures → `422 { message: "Adding the event failed due to validation errors.", errors: { title?, description?, date?, image? } }`
- Success → `201 { message: "Event saved.", event }` (new `id` generated via `uuid`, prepended to the list)

### `PATCH /events/:id` — replace an event

- Body: same as `POST`
- Validation failures → `422 { message: "Updating the event failed due to validation errors.", errors }`
- Success → `200 { message: "Event updated.", event }`
- Errors: `404` when the `:id` does not exist

### `DELETE /events/:id` — delete an event

- Success → `200 { message: "Event deleted." }`
- Note: deleting a non-existent `:id` still returns `200` (filter is a no-op)

## Event shape

```json
{
  "id": "e1",
  "title": "A dummy event",
  "description": "Join this amazing event and connect with fellow developers.",
  "date": "2023-02-22",
  "image": "https://..."
}
```

## Validation rules (`util/validation.js`)

| Field | Rule |
| ----- | ---- |
| `title` | non-empty text |
| `description` | non-empty text |
| `date` | parseable date string |
| `image` | string starting with `http` |

## Data store (`data/event.js` + `events.json`)

- File-based JSON store; all CRUD helpers (`getAll`, `get`, `add`, `replace`, `remove`) read/write `events.json`
- `add` generates the `id` server-side with `uuid v4` and unshifts (newest first)
- `replace` keeps the original `:id` and overwrites the remaining fields

## Run it

```bash
npm install
node app.js
```
