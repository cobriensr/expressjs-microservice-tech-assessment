# Flight Path Tracker Microservice

This microservice provides an API to calculate a person's flight path based on a list of flight records.

## API Endpoint

- **URL**: `/calculate`
- **Method**: POST
- **Port**: 8080

### Request Format

The request body should be a JSON array of flight pairs. Each flight pair is represented by an array containing two airport codes: the source and the destination.

Example:

```json
[
  ["SFO", "EWR"],
  ["GSO", "IND"],
  ["ATL", "GSO"],
  ["IND", "ATL"]
]
```

### Response Format

The response will be a JSON object containing the calculated flight path.

Example:

```json
{
  "Flight Path": ["SFO", "ATL"]
}
```

## Running the Service

To start the microservice, run:

```bash
npm start
```

The service will start on port 8080.

## Running Tests

To run the test suite, use:

```bash
npm test
```

This will run a series of tests including random flight paths and edge cases to ensure the robustness of the service.
