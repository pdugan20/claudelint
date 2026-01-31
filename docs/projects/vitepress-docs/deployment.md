# Deployment Guide

Comprehensive guide for deploying claudelint VitePress documentation.

## Deployment Options Comparison

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **GitHub Pages** | Free, simple, good performance | Limited to static sites | Open source projects |
| **Vercel** | Fastest edge network, PR previews | Commercial platform | Production sites |
| **Netlify** | Great DX, forms, redirects | Slower than Vercel | Feature-rich sites |
| **Cloudflare Pages** | Global CDN, unlimited bandwidth | Newer platform | High-traffic sites |

**Recommendation**: Start with **GitHub Pages** (free, simple), upgrade to **Vercel** if needed.

---

## Option 1: GitHub Pages (Recommended)

### Setup

**Step 1: Create deployment workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # For lastUpdated feature

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Configure repository**

1. Go to repo Settings → Pages
2. Source: GitHub Actions
3. Save

**Step 3: Configure VitePress base URL**

Update `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  base: '/claudelint/', // For project pages (user.github.io/claudelint/)
  // OR
  base: '/', // For custom domain or user pages
})
```

**Step 4: Push to GitHub**

```bash
git add .
git commit -m "Add VitePress deployment workflow"
git push origin main
```

Site will be live at:

- Project pages: `https://pdugan20.github.io/claudelint/`
- Custom domain: `https://docs.claudelint.dev` (see below)

### Custom Domain Setup

**Step 1: Add CNAME file**

Create `docs/public/CNAME`:

```text
docs.claudelint.dev
```

**Step 2: Configure DNS**

Add these DNS records at your domain provider:

For subdomain (docs.claudelint.dev):

```text
Type: CNAME
Name: docs
Value: pdugan20.github.io
TTL: 3600
```

For apex domain (claudelint.dev):

```text
Type: A
Name: @
Value: 185.199.108.153
---
Type: A
Name: @
Value: 185.199.109.153
---
Type: A
Name: @
Value: 185.199.110.153
---
Type: A
Name: @
Value: 185.199.111.153
```

**Step 3: Enable HTTPS**

1. Go to repo Settings → Pages
2. Check "Enforce HTTPS"
3. Wait for certificate provisioning (~15 min)

**Step 4: Update config**

```typescript
export default defineConfig({
  base: '/',
  sitemap: {
    hostname: 'https://docs.claudelint.dev'
  }
})
```

---

## Option 2: Vercel

### Setup

**Step 1: Import project**

1. Go to <https://vercel.com>
2. Click "Import Project"
3. Connect GitHub repository
4. Vercel auto-detects VitePress

**Step 2: Configure build settings**

Vercel should auto-detect these (verify):

```text
Framework Preset: VitePress
Build Command: npm run docs:build
Output Directory: docs/.vitepress/dist
Install Command: npm install
```

**Step 3: Add environment variables (if needed)**

None required for basic setup.

**Step 4: Deploy**

Click "Deploy" - site will be live in ~1 minute.

### Custom Domain

1. Go to Project Settings → Domains
2. Add domain: `docs.claudelint.dev`
3. Follow DNS configuration instructions
4. Vercel provides automatic HTTPS

### Vercel Configuration File

Create `vercel.json` for advanced config:

```json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs/.vitepress/dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/docs/:path*",
      "destination": "/:path*",
      "permanent": true
    }
  ]
}
```

### Preview Deployments

Vercel automatically creates preview deployments for PRs:

- Every PR gets a unique URL
- Comment with preview link added to PR
- Perfect for reviewing docs changes

---

## Option 3: Netlify

### Setup

**Step 1: Create netlify.toml**

```toml
[build]
  command = "npm run docs:build"
  publish = "docs/.vitepress/dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/docs/*"
  to = "/:splat"
  status = 301
  force = true

# SPA fallback (if needed)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Step 2: Connect repository**

1. Go to <https://app.netlify.com>
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Select repository
5. Netlify auto-detects settings from netlify.toml

**Step 3: Deploy**

Click "Deploy site" - live in ~2 minutes.

### Custom Domain

1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS (Netlify provides nameservers)
4. Automatic HTTPS via Let's Encrypt

### Netlify Features

**Forms** (for feedback):

```html
<form name="feedback" method="POST" data-netlify="true">
  <input type="text" name="message" />
  <button type="submit">Send Feedback</button>
</form>
```

**Redirects** (for versioning):

```toml
[[redirects]]
  from = "/latest/*"
  to = "/v0.1/:splat"
  status = 200
```

---

## Option 4: Cloudflare Pages

### Setup

**Step 1: Connect repository**

1. Go to Cloudflare Dashboard → Pages
2. Create project
3. Connect GitHub repository

**Step 2: Configure build**

```text
Framework preset: VitePress
Build command: npm run docs:build
Build output directory: docs/.vitepress/dist
```

**Step 3: Deploy**

Automatic deployment starts immediately.

### Custom Domain

1. Go to Pages project → Custom domains
2. Add domain
3. Configure DNS (if domain is on Cloudflare, it's automatic)

### Cloudflare Features

**Unlimited bandwidth** - No limits on traffic

**Global CDN** - 275+ edge locations

**Web Analytics** - Privacy-friendly, free analytics

---

## Performance Optimization

### 1. Caching Strategy

**Static Assets** (CSS, JS, images):

```text
Cache-Control: public, max-age=31536000, immutable
```

**HTML Files**:

```text
Cache-Control: public, max-age=0, must-revalidate
```

**Implementation**:

GitHub Pages:

```yaml
# In .github/workflows/deploy.yml
- name: Configure caching
  run: |
    find docs/.vitepress/dist -type f -name "*.js" -o -name "*.css" | \
    xargs -I {} echo "Adding cache headers to {}"
```

Vercel/Netlify: Use config files shown above.

### 2. Compression

All platforms automatically compress with Brotli/Gzip.

**Verify compression**:

```bash
curl -H "Accept-Encoding: br,gzip" -I https://docs.claudelint.dev
# Look for: Content-Encoding: br
```

### 3. Image Optimization

**Before deployment**:

```bash
# Install tools
npm install -D sharp @squoosh/cli

# Optimize images
npx @squoosh/cli --webp auto docs/public/images/*.png
npx @squoosh/cli --mozjpeg auto docs/public/images/*.jpg
```

**Use modern formats**:

```html
<picture>
  <source srcset="/image.webp" type="image/webp">
  <source srcset="/image.avif" type="image/avif">
  <img src="/image.png" alt="Description">
</picture>
```

### 4. Code Splitting

VitePress automatically code-splits by route. No action needed.

### 5. Preloading

VitePress automatically preloads links on hover.

---

## Monitoring & Analytics

### Google Analytics

Add to `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  head: [
    ['script', {
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'
    }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `]
  ]
})
```

### Plausible Analytics (Privacy-Friendly)

```typescript
export default defineConfig({
  head: [
    ['script', {
      defer: true,
      'data-domain': 'docs.claudelint.dev',
      src: 'https://plausible.io/js/script.js'
    }]
  ]
})
```

### Uptime Monitoring

**Free Options**:

- UptimeRobot: <https://uptimerobot.com>
- StatusCake: <https://www.statuscake.com>
- Pingdom: <https://www.pingdom.com>

**Setup**:

1. Create account
2. Add monitor: `https://docs.claudelint.dev`
3. Set check interval: 5 minutes
4. Configure alerts (email, Slack)

### Error Tracking

**Sentry**:

```typescript
// docs/.vitepress/theme/index.ts
import * as Sentry from "@sentry/vue"
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    Sentry.init({
      app,
      dsn: "https://xxx@sentry.io/xxx",
      environment: "production"
    })
  }
}
```

---

## CI/CD Best Practices

### Build Caching

**GitHub Actions**:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm # Caches node_modules

- name: Cache VitePress
  uses: actions/cache@v4
  with:
    path: docs/.vitepress/cache
    key: ${{ runner.os }}-vitepress-${{ hashFiles('**/package-lock.json') }}
```

**Vercel/Netlify**: Automatic caching.

### Build Time Optimization

**Parallel builds** (if you add versioning):

```yaml
jobs:
  build-v1:
    # Build v1.x docs
  build-v2:
    # Build v2.x docs
  combine:
    needs: [build-v1, build-v2]
    # Combine outputs
```

### Deploy Previews

**GitHub Actions** (manual previews):

```yaml
on:
  pull_request:
    branches: [main]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run docs:build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: docs/.vitepress/dist
          production-deploy: false
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Security

### Content Security Policy

Add to platform config:

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://plausible.io;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
```

### HTTPS Only

All platforms provide automatic HTTPS. Enforce it:

**Netlify**:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

**Vercel**:

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Strict-Transport-Security",
      "value": "max-age=31536000; includeSubDomains; preload"
    }]
  }]
}
```

---

## Troubleshooting

### Build Failures

**Problem**: Build fails with "command not found"

**Solution**: Verify package.json scripts:

```json
{
  "scripts": {
    "docs:build": "vitepress build docs"
  }
}
```

**Problem**: Out of memory during build

**Solution**: Increase Node memory:

```json
{
  "scripts": {
    "docs:build": "NODE_OPTIONS=--max-old-space-size=4096 vitepress build docs"
  }
}
```

### 404 Errors

**Problem**: All routes return 404

**Solution**: Check base URL in config.ts matches deployment:

- GitHub Pages (project): `base: '/claudelint/'`
- Custom domain: `base: '/'`

### Broken Links

**Problem**: Internal links don't work

**Solution**: Use absolute paths from site root:

```markdown
✗ [Link](../validators.md)
✓ [Link](/validators/)
```

### Slow Builds

**Problem**: Builds take >5 minutes

**Solution**:

1. Enable caching (see above)
2. Reduce markdown processing: disable features you don't use
3. Optimize images before committing

---

## Rollback Strategy

### GitHub Pages

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or force push to previous commit
git reset --hard HEAD~1
git push --force origin main
```

### Vercel/Netlify

Both platforms keep deployment history:

1. Go to Deployments
2. Find last good deployment
3. Click "Publish" to rollback

---

## Cost Estimation

### Free Tier Limits

| Platform | Free Tier | Limits |
|----------|-----------|--------|
| GitHub Pages | Free forever | 1GB storage, 100GB bandwidth/month |
| Vercel | Free (Hobby) | 100GB bandwidth, unlimited sites |
| Netlify | Free (Starter) | 100GB bandwidth, 300 build minutes/month |
| Cloudflare Pages | Free | Unlimited bandwidth, 500 builds/month |

**Recommendation**: All are sufficient for documentation. Use free tier.

---

## Checklist

### Pre-Deployment

- [ ] All links tested locally
- [ ] Build succeeds: `npm run docs:build`
- [ ] Preview works: `npm run docs:preview`
- [ ] Images optimized
- [ ] Meta tags configured
- [ ] Sitemap enabled
- [ ] Analytics added (optional)

### Deployment

- [ ] Platform chosen (GitHub Pages recommended)
- [ ] Workflow configured
- [ ] Repository settings updated
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Redirects configured (if needed)

### Post-Deployment

- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Search works
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Lighthouse score 95+
- [ ] Uptime monitoring enabled
- [ ] Analytics tracking
