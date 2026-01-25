---
description: How to deploy the TypeNad app to Farcaster as a Frame / Mini App
---

# Deploy TypeNad directly to Farcaster

This workflow guides you through deploying your TypeNad application as a Farcaster Frame (Mini App).

## Prerequisites

1.  **Vercel Account**: You need a Vercel account to host the Next.js app.
2.  **Farcaster Account**: A Farcaster account to cast the frame.
3.  **Warpcast**: Installed on your phone or accessible via web.

## Step 1: Prepare the Codebase

Refine your `layout.tsx` to ensure Frame metadata is perfect.
(This has mainly been done, but ensure your `NEXT_PUBLIC_APP_URL` environment variable is set).

## Step 2: Deploy to Vercel

1.  **Push to GitHub**: Ensure your latest code is pushed to your GitHub repository.
    ```bash
    git add .
    git commit -m "Ready for Farcaster deployment"
    git push origin main
    ```
2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click "Add New..." -> "Project".
    *   Import your `TypeNad` repository.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js
    *   **Environment Variables**:
        *   `NEXT_PUBLIC_APP_URL`: The URL Vercel assigns you (e.g., `https://typenad.vercel.app`). You might need to deploy once to get the URL, then add this variable and redeploy.
        *   `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy App ID.
        *   `NEXT_PUBLIC_PRIVY_CLIENT_ID`: Your Privy Client ID.
        *   Any other env vars from your `.env.local`.

## Step 3: Verify Metadata

Once deployed, visit your URL (e.g., `https://typenad.vercel.app`) and inspect the source confirming the `<meta name="fc:frame" ...>` tags are present.

You can also use the **Warpcast Frame Validator**:
1.  Go to [Warpcast Frame Validator](https://warpcast.com/~/developers/frames).
2.  Enter your Vercel URL.
3.  Check if the preview renders correctly.

## Step 4: Cast to Farcaster

1.  Open Warpcast.
2.  Start a new cast.
3.  Paste your Vercel URL (e.g., `https://typenad.vercel.app`).
4.  Warpcast should automatically detect the Frame metadata and show the "Play TypeMonad" button.
5.  Post the cast!

## Optional: Register as a Verified Mini App

For full "Mini App" features (like adding to the 'Apps' tab), you need to register:
1.  Go to the Farcaster Developer Portal.
2.  Create a new Frame/App definition using your URL.
