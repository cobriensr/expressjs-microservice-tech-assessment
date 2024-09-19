// Import the Express framework
import express from 'express';

// Create an Express application
const app = express();

// Use middleware to parse JSON bodies
app.use(express.json());

// Set the port for the server, use environment variable if available, otherwise default to 8080
const port = process.env.PORT || 8080;

// Define a POST route for '/calculate'
app.post('/calculate', (req, res) => {
  // Log the received request body
  console.log('Received request:', JSON.stringify(req.body));

  // Extract flight orders from the request body
  const flightOrders = req.body;

  // Validate input: ensure it's an array of arrays
  if (!Array.isArray(flightOrders) || !flightOrders.every(Array.isArray)) {
    console.error('Invalid input received');
    return res.status(400).send({ error: 'Invalid input. Expected an array of arrays.' });
  }

  // Initialize sets to store unique start and end airports
  const starts = new Set();
  const ends = new Set();

  // Create a map to store connections between airports
  const airportConnections = new Map();

  // Populate sets and map with flight data
  flightOrders.forEach(([start, end]) => {
    starts.add(start);
    ends.add(end);
    airportConnections.set(start, end);
  });

  // Find the starting airport
  let startingAirport = [...starts].find(start => !ends.has(start));

  // Find the ending airport
  let endingAirport = [...ends].find(end => !starts.has(end));

  // Handle circular paths
  if (!startingAirport || !endingAirport) {
    // If no clear start/end, choose an arbitrary start point
    startingAirport = starts.values().next().value;
    
    // Follow the path to find an end point
    let currentAirport = startingAirport;
    const visited = new Set();

    // Loop until an airport is revisited - completing the circle
    while (!visited.has(currentAirport)) {
      visited.add(currentAirport);
      const nextAirport = airportConnections.get(currentAirport);

      // Break if there's no next airport (unexpected data)
      if (!nextAirport) break;

      // If next airport is the start, we've completed the circle
      if (nextAirport === startingAirport) {
        // Choose the last airport before closing the loop as the end
        endingAirport = currentAirport;
        break;
      }

      // Move to the next airport
      currentAirport = nextAirport;
    }
    
    // If an ending airport has not been set, use the last one in the path
    if (!endingAirport) {
      endingAirport = currentAirport;
    }
  }

  // Ensure start and end points are different
  if (startingAirport === endingAirport) {
    // If they're the same, choose the next airport in the sequence as the end
    endingAirport = airportConnections.get(startingAirport);
  }

  // Prepare the result object
  const result = { "Flight Path": [startingAirport, endingAirport] };

  // Log the response being sent
  console.log('Sending response:', JSON.stringify(result));

  // Send the response with the calculated flight path
  res.send(result);
});

// Start the server
app.listen(port, () => {
  console.log(`Flight Path Tracker microservice listening on port ${port}`);
});

// Export the app for testing purposes
export default app;