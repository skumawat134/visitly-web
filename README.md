# portal-web
Re-write of existing angular 15 application in React 18 with a micro-frontend architecture using Turborepo for monorepo management. This project implements a scalable frontend solution for the Visitly platform, featuring a shell application that orchestrates multiple micro-frontends.

## High-Level Overview

Portal-web is structured as a monorepo using Turborepo, containing:

- **Shell Application**: The main container application that hosts micro-frontends and provides shared routing, state management, and UI components.
- **Authentication Micro-Frontend (MFE)**: A dedicated micro-frontend handling user authentication flows.
- **Shared Packages**: Reusable libraries for API client, state management, UI components, and configuration.

The architecture leverages:
- React 18 for component development
- TypeScript for type safety
- Tailwind CSS for styling
- Webpack for bundling
- Module Federation for micro-frontend integration
- Zustand for state management
- TanStack Query for data fetching

## Directory Structure

```
portal-web/
├── apps/                          # Application modules
│   ├── auth-mfe/                  # Authentication micro-frontend
│   │   ├── src/
│   │   │   ├── features/auth/     # Auth-specific features
│   │   │   ├── routes/            # Routing configuration
│   │   │   └── shared/components/ # Shared components
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── webpack.config.js
│   └── shell/                     # Main shell application
│       ├── src/
│       │   ├── components/        # UI components
│       │   ├── mfe/               # Micro-frontend integrations
│       │   ├── providers/         # React providers
│       │   ├── routes/            # Application routes
│       │   └── styles/            # Global styles
│       ├── public/                # Static assets
│       ├── package.json
│       ├── tsconfig.json
│       └── webpack configs
├── packages/                      # Shared packages
│   ├── api-client/                # API client library
│   ├── app-store/                 # State management (Zustand)
│   ├── eslint-config/             # ESLint configurations
│   ├── tailwind-config/           # Tailwind CSS configuration
│   ├── typescript-config/         # TypeScript configurations
│   └── ui/                        # Shared UI component library
├── package.json                   # Root package.json
├── turbo.json                     # Turborepo configuration
└── README.md
```

## Setup

### Prerequisites

- Node.js >= 18
- Yarn (version 1.22.22)

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd portal-web
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env` files from the respective apps if needed
   - Ensure `VITE_AUTH_MFE_REMOTE_URL` is configured for production builds

## Running the Application

### Development

Start all applications in development mode:
```sh
yarn dev
```

This will start the shell and auth-mfe applications concurrently using Turborepo.

### Building

Build all applications:
```sh
yarn build
```

Build outputs will be in `dist/` directories within each app.

### Serving Built Applications

Serve the shell application:
```sh
yarn serve:shell
```
This serves the built shell app on port 4201.

Serve the auth micro-frontend:
```sh
yarn serve:auth
```
This serves the auth MFE on port 3006.

## Additional Commands

- **Linting**: `yarn lint`
- **Type Checking**: `yarn check-types`
- **Formatting**: `yarn format`

## Technologies Used

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Webpack with Module Federation
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM
- **Monorepo Tool**: Turborepo
- **Code Quality**: ESLint, Prettier
