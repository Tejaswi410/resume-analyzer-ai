This is a [Next.js](https://nextjs.org) project designed to analyze resumes using specialized AI models.

## Prerequisites

- Node.js (version 18 or above recommended)
- A [Groq API Key](https://console.groq.com/keys)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure Environment Variables:**
   Copy the `template.env` or create a new `.env.local` file in the root of the project:
   ```bash
   cp .env.template .env.local
   ```
   Open `.env.local` and substitute your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the outcome.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

When importing your project to Vercel, ensure you configure the following Environmental Variable in your project settings before deployment:
- `GROQ_API_KEY`: Your active API key from Groq.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
