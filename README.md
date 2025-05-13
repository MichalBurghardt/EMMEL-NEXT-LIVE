# Emmel Next.js Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure Guidelines

This document outlines the structure and guidelines for the Emmel project to maintain consistency and best practices.

### Directory Structure

- **src/app**: Next.js App Router directory containing pages and API routes
  - **api**: Server-side API endpoints using Next.js Route Handlers
  - *Other directories*: Client-side pages using the App Router format

- **src/components**: Reusable React components
  - **Layout**: Page layout components
  - **UI**: UI components like buttons, forms, etc.

- **src/context**: React Context providers
  - **AuthContext.tsx**: Authentication context
  - **WindowContext.tsx**: Window management context

- **src/hooks**: Custom React hooks

- **src/models**: Database models
  - All models should be defined here as TypeScript interfaces and Mongoose schemas
  - **index.ts**: Barrel file that exports all models

- **src/utils**: Utility functions and services
  - **api**: API-related utilities
    - **models**: Re-exports from main models directory
    - **services**: Services for API endpoints
  - **services**: Frontend services

### Coding Guidelines

1. **TypeScript Usage**:
   - Always use TypeScript (.ts, .tsx) for new files
   - Include proper type definitions for all functions and variables

2. **Database Connections**:
   - Use the centralized database connection from `src/utils/db.ts`
   - Import it as: `import { connectToDatabase } from '@/utils/db';`

3. **Model Imports**:
   - Import models from the centralized models directory:
   - `import { User, Booking } from '@/models';`
   - Don't create duplicate model definitions

4. **API Routes**:
   - Follow the pattern in existing route files
   - Use type-safe request and response handling

5. **Error Handling**:
   - Use the ErrorResponse utility for consistent API errors
   - Use try/catch blocks with proper type narrowing

### Environment Variables

- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secret for JWT token generation
- **NEXT_PUBLIC_API_URL**: Public API URL for frontend requests

### Scripts

- **dev**: `npm run dev` - Run development server
- **build**: `npm run build` - Build for production
- **start**: `npm start` - Start production server
- **seed**: `npm run seed` - Seed the database with sample data

### Maintenance

For any questions or issues with the codebase structure, refer to this document or update it as the architecture evolves.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
