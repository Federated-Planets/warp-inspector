# Warp Inspector 🔭

The **Warp Inspector** is a command-line utility for validating the configuration of a [Federated Planet](https://github.com/Federated-Planets/federated-planets). It ensures your planet is correctly discoverable and follows the official federation protocols.

## Features

- **Discovery Check:** Verifies the presence of the `<link rel="space-manifest">` tag on your homepage.
- **Manifest Validation:** Fetches and validates your `manifest.json` against the official schema using Zod.
- **Coordinate Calculation:** Deterministically calculates your planet's 3D coordinates based on its domain.
- **Space Port Detection:** Checks for an active Federated Travel Network (FTN) endpoint.

## Installation

```bash
cd warp-inspector
npm install
npm link # Optional: makes 'warp-inspector' command available globally
```

## Usage

Pass a URL or domain to inspect a planet:

```bash
warp-inspector federatedplanets.com
warp-inspector http://localhost:3000
```

## Protocol Compliance

This tool validates compliance with:
- **Core Spec:** [Federated Planets README](https://github.com/Federated-Planets/federated-planets)
- **Travel Protocol:** [Space Travel Protocol](https://github.com/Federated-Planets/federated-planets/blob/main/TRAVEL.md)

✨🤖✨ AI-assisted with Gemini
