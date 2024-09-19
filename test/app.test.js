import request from 'supertest';
import { expect } from 'chai';
import app from '../app.js';

// Utility function to generate random 3-letter airport codes
const randomAirportCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
};

// Utility function to generate random flight pairs
const generateRandomFlightPairs = (numPairs, complexity = 'simple') => {
  const flightPairs = [];
  const airports = new Set();

  for (let i = 0; i < numPairs; i++) {
    let start, end;

    // For complex paths, sometimes reuse existing airports
    if (complexity === 'complex' && Math.random() < 0.3 && airports.size > 1) {
      start = Array.from(airports)[Math.floor(Math.random() * airports.size)];
      do {
        end = Array.from(airports)[Math.floor(Math.random() * airports.size)];
      } while (start === end);
    } else {
      // Generate new airports
      start = randomAirportCode();
      do {
        end = randomAirportCode();
      } while (start === end || airports.has(end));
    }

    flightPairs.push([start, end]);
    airports.add(start);
    airports.add(end);
  }

  return flightPairs;
};

// Main tests for the POST /calculate endpoint
describe('POST /calculate', () => {
  // Enhanced random testing
  describe('Random Flight Path Tests', () => {
    // Define test cases with varying complexity and size
    const testCases = [
      { name: 'Simple Path', numPairs: 2, complexity: 'simple' },
      { name: 'Medium Path', numPairs: 5, complexity: 'simple' },
      { name: 'Large Path', numPairs: 10, complexity: 'simple' },
      { name: 'Complex Path', numPairs: 15, complexity: 'complex' },
      { name: 'Very Large Complex Path', numPairs: 30, complexity: 'complex' },
    ];

    // Run a test for each defined test case
    testCases.forEach(({ name, numPairs, complexity }) => {
      it(`should handle ${name} (${numPairs} pairs)`, async () => {
        // Generate random flight data
        const flightData = generateRandomFlightPairs(numPairs, complexity);
        
        // Send POST request to the /calculate endpoint
        const res = await request(app)
          .post('/calculate')
          .send(flightData)
          .set('Accept', 'application/json');

        // Assert that the response is successful
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('Flight Path');
        
        // Extract all start and end airports from the flight data
        const starts = new Set(flightData.map(([start]) => start));
        const ends = new Set(flightData.map(([, end]) => end));
        const [resultStart, resultEnd] = res.body['Flight Path'];

        // Assert that the result is valid
        expect(starts).to.include(resultStart, 'Start airport should be in the set of starting airports');
        expect(ends).to.include(resultEnd, 'End airport should be in the set of ending airports');
        expect(ends).to.not.include(resultStart, 'Start airport should not be in the set of ending airports');
        expect(starts).to.not.include(resultEnd, 'End airport should not be in the set of starting airports');
      });
    });
  });

  // Test suite for edge cases
  describe('Edge Cases', () => {
    // Test case for a single flight pair
    it('should handle a single flight pair', async () => {
      const flightData = [['AAA', 'BBB']];
      const res = await request(app)
        .post('/calculate')
        .send(flightData)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(200);
      expect(res.body['Flight Path']).to.deep.equal(['AAA', 'BBB']);
    });

    // Test case for circular flight paths
    it('should handle circular flight paths', async () => {
      const flightData = [['AAA', 'BBB'], ['BBB', 'CCC'], ['CCC', 'AAA']];
      const res = await request(app)
        .post('/calculate')
        .send(flightData)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(200);
      expect(res.body['Flight Path']).to.have.lengthOf(2);
      expect(res.body['Flight Path'][0]).to.not.equal(res.body['Flight Path'][1]);
    });

    // Test case for duplicate flight pairs
    it('should handle duplicate flight pairs', async () => {
      const flightData = [['AAA', 'BBB'], ['BBB', 'CCC'], ['AAA', 'BBB']];
      const res = await request(app)
        .post('/calculate')
        .send(flightData)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(200);
      expect(res.body['Flight Path']).to.deep.equal(['AAA', 'CCC']);
    });
  });
});