import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 250, // Number of virtual users
  duration: '30s', // Duration of the test
};

export default function () {
  const res = http.get('http://localhost:3000/api/v2/healthz');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
