# k6

These scripts target different failure modes and bottlenecks:

- `smoke.js`: basic uptime and critical-path assertions
- `gateway-ramp.js`: sustained load against the API gateway
- `checkout-spike.js`: sudden traffic bursts against checkout and order endpoints
- `ui-browse.js`: browser-like navigation for the public and dashboard surfaces

All scripts read their target hosts from environment variables with sensible local defaults.
