# Tech Stack

## Frontend Stack
- **Framework**: Next.js 15.x with App Router
- **React**: Version 19
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **UI Components**: TailAdmin template
- **Charts**: ApexCharts (react-apexcharts)
- **Calendar**: FullCalendar
- **Maps**: react-jvectormap
- **Forms**: react-dropzone, flatpickr
- **Drag & Drop**: react-dnd

## Backend & Infrastructure
- **IaC**: AWS CDK 2.x
- **Hosting**: AWS AppRunner
- **Authentication**: AWS Cognito (planned)
- **Serverless**: AWS Lambda
- **Logging**: Pino (server-side), CloudWatch (planned)
- **Error Tracking**: Sentry (planned)
- **Database ORM**: Prisma (installed)
- **Caching**: AWS Redis (planned)

## Development Tools
- **Linter/Formatter**: Biome (installed)
- **Testing**: Jest (unit tests), Playwright (E2E, planned)
- **Package Manager**: npm

## Common Commands

### Frontend (run from `/frontend` directory)
```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build & Production
npm run build        # Create production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Infrastructure (run from `/infra` directory)
```bash
# CDK Commands
npm run build        # Compile TypeScript
npm run watch        # Watch mode for development
npm test             # Run Jest tests
npm run cdk          # Run CDK CLI commands

# Common CDK operations
cdk synth            # Synthesize CloudFormation template
cdk deploy           # Deploy stack to AWS
cdk diff             # Compare deployed stack with current state
cdk destroy          # Remove stack from AWS
```

## Installation Notes
- Use `--legacy-peer-deps` flag if encountering peer dependency errors during npm install
- Node.js 18.x or later required (20.x+ recommended)
- Windows users should clone repository near drive root to avoid path length issues
