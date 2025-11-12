# Vercel Deployment Guide

This guide explains how to deploy the Rate My Idea application to Vercel's.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier)
- A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas) with a free cluster
- Your repository pushed to GitHub

## Setup Steps

### 1. Prepare MongoDB Atlas (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in with your account
3. Create a new project
4. Create a new cluster (M0 - free tier)
5. Create a database user with a strong password
6. Whitelist your IP (or allow all IPs: `0.0.0.0/0` - :P)
7. Copy the connection string in the format: `mongodb+srv://username:password@cluster.mongodb.net/rate-my-idea`

### 2. Deploy to Vercel

#### Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/spa`
   - **Install Command**: `npm ci`
5. Click "Deploy"

### 3. Add Environment Variables

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **all environments** (Production, Preview, Development):

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/rate-my-idea?retryWrites=true&w=majority` |

4. Redeploy after adding environment variables

### 4. Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Deployment Architecture

Your application will be deployed as follows:

```
┌─────────────────────────┐
│   Vercel Edge Network   │
│  (Global CDN - Free)    │
└────────────┬────────────┘
             │
        ┌────▼─────┐
        │  Node.js │
        │Serverless│
        │ Function │
        └────┬─────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼───┐
│ React  │      │ Express │
│  SPA   │      │  API    │
└────────┘      └────┬────┘
                     │
            ┌────────▼────────┐
            │  MongoDB Atlas  │
            │   (Free M0)     │
            └─────────────────┘
```


## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js on Vercel](https://vercel.com/docs/functions/serverless-functions/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
