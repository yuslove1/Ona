# Ona

![Ona Logo](public/danfo-icon.png) 

**Ona** is a mobile-first web application designed to simplify navigation for commuters, particularly students, and young professionals. It provides AI-generated public transport routes (danfos, kekes, BRT) and walking directions, with live map tracking similar to Google Maps. Users input their current location and destination (e.g., Ogba Bus Stop to Gbagada Phase 1) to receive step-by-step routes, including transfer points (e.g., Oshodi Underbridge), estimated costs (₦150–₦1,200), travel times (20–70 minutes), and Lagos-specific tips (e.g., “Say ‘Owa o’ to alight”). Built with Next.js, Tailwind CSS, Chakra UI, and Leaflet.js, Ona uses free APIs (Openrouteservice and OpenStreetMap) for a zero-budget MVP, with plans for scaling using paid APIs.

Inspired by the hustle of Lagos and the developer's NYSC experience in Lagos, Ona brings a user-centric and local lingo. Perfect for navigating hubs like Ogba, Oshodi, Gbagada, and Iyana Ipaja e.t.c. 🚍

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Project Structure](#project-structure)
- [Development Timeline](#development-timeline)
- [Challenges and Solutions](#challenges-and-solutions)
- [Testing](#testing)
- [Scaling Plan](#scaling-plan)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- **AI-Driven Routes**: Generate dynamic routes with transfer points using Openrouteservice.
- **Live Map Tracking**: Real-time user location and route path display with OpenStreetMap and Leaflet.js, supporting ride (danfo, keke) and walking modes.
- **Country-Specific Details**:
  - Estimated fares: ₦150–₦1,200 (e.g., ₦200–₦400 for Ogba to Oshodi).
  - Travel times: 20–70 minutes with traffic-aware ranges.
  - Tips: Safety (e.g., “Secure phone in Oshodi”) and lingo (e.g., “Say ‘mo n lọ si Gbagada’”).
- **User-Centric Design**:
  - Mobile-first, accessible UI with high-contrast text and large buttons.
  - Yellow-green palette inspired by Lagos danfo buses.
  - Offline caching for routes and maps to handle spotty networks.
- **Mode Toggle**: Switch between ride (danfo, keke) and walking modes.
- **Autocomplete**: Mock dropdowns for 20 Lagos stops (e.g., Ogba Bus Stop).

## Tech Stack
- **Framework**: Next.js (App Router for modern routing and server-side rendering).
- **Styling**: Tailwind CSS (utility-first for rapid, Lagos-themed design).
- **UI Library**: Chakra UI (accessible, customizable components).
- **Map Library**: Leaflet.js (lightweight, free maps with OpenStreetMap).
- **APIs**:
  - **Free**: Openrouteservice (2,000 requests/day), OpenStreetMap (live tracking).
  - **Paid (for scaling)**: Mapbox ($2/1,000 requests), Google Maps ($5/1,000), Geoapify (~$10/month), NextBillion.ai ($50–$100/month).
- **Tools**:
  - Figma: UI design.
  - Git/GitHub: Version control.
  - Vercel: Free deployment.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/ona.git
   cd ona
2. **Install Dependencies**:
   ```bash
    npm install

   Required packages: @chakra-ui/react, @emotion/react, @emotion/styled, framer-motion, leaflet, axios

3. **Run Locally**:
   ```bash
    npm run dev
Open http://localhost:3000 in your browser.

## Contributing
**Contributions are welcome! To contribute**: Fork the repository.
**Create a branch:** git checkout -b feature/your-feature.
**Commit changes:** git commit -m "Add your feature".
**Push to branch:** git push origin feature/your-feature.
Open a pull request.

Please follow the code style (Prettier, ESLint) and test routes with Lagos commuters.__

## Contact

**Developer:** Adesina Yusuf (yuslove)
**Email:** adesinayusuf0@example.com
**GitHub:** yuslove1
**X:** @adeCode0

## License

MIT License. See LICENSE for details.
