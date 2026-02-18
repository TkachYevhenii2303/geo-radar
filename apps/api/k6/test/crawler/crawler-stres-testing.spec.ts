import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
  // scenarios: {
  //   smoke: {},
  //   load: {},
  //   stress: {},
  //   thresholds: {},
  // },
};

const baseUrl = 'http://localhost:8080/api/crawler';

const urls = [
  'https://www.youtube.com/',
  'https://www.instagram.com/',
  'https://www.linkedin.com/',
  'https://www.github.com/',
  'https://www.stackoverflow.com/',
];

export default function () {
  const response = http.post(
    baseUrl,
    JSON.stringify({ url: 'https://k6.io/' }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  check(response, {
    'status is accepted': (r) => r.status === 202,
  });
  sleep(1);
}
