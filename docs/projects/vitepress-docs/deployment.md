# Deployment Guide

Comprehensive guide for deploying claudelint VitePress documentation.

## Deployment Options Comparison

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **Vercel** | Fastest edge network, PR previews, auto-deploy | Commercial platform (free for OSS) | Production sites (RECOMMENDED) |
| **GitHub Pages** | Free, simple, good performance | No PR previews, slower than Vercel | Simple static sites |
| **Netlify** | Great DX, forms, redirects | Slower than Vercel | Feature-rich sites |
| **Cloudflare Pages** | Global CDN, unlimited bandwidth | Newer platform | High-traffic sites |

**Recommendation**: **Vercel** for automatic PR previews and fastest global performance.

---

## Option 1: Vercel (Recommended)

### Why Vercel

**Key Advantages:**

- [x] **Fastest global CDN** - 275+ edge locations worldwide
- [x] **Automatic PR previews** - Every PR gets a unique preview URL
- [x] **Zero configuration** - Auto-detects VitePress settings
- [x] **Free for open source** - No cost for public repos
- [x] **Built-in analytics** - Track page views without third-party scripts
- [x] **Excellent DX** - Deploy in seconds with git push

### Setup

#### Step 1: Connect Repository

1. Go to <https://vercel.com>
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `pdugan20/claudelint` repository
5. Vercel auto-detects VitePress framework

#### Step 2: Configure Build Settings

Vercel should auto-detect these settings (verify):

```text
Framework Preset: VitePress
Root Directory: ./
Build Command: npm run docs:build
Output Directory: website/.vitepress/dist
Install Command: npm install
Node Version: 20.x
```

#### Step 3: Add package.json Scripts

Ensure these scripts exist:

```json
{
  "scripts": {
    "docs:generate": "tsx scripts/generate-rule-docs.ts",
    "docs:dev": "npm run docs:generate && vitepress dev website",
    "docs:build": "npm run docs:generate && vitepress build website",
    "docs:preview": "vitepress preview website"
  }
}
```

#### Step 4: Deploy

1. Click "Deploy"
2. Wait ~1-2 minutes
3. Site live at: `https://claudelint.vercel.app`

### Custom Domain Setup

#### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter: `claudelint.com` (root domain, not a subdomain)

#### Step 2: Configure DNS

At your domain provider (Cloudflare, Namecheap, etc.), add:

```text
Type: A
Name: @
Value: 76.76.21.21 (Vercel)
TTL: Auto / 3600
```

Also add a www redirect:

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto / 3600
```

#### Step 3: Verify

- Vercel automatically provisions SSL certificate
- HTTPS enabled by default
- DNS propagation: 5-30 minutes
- Site live at: `https://claudelint.com`
- Landing page at root, docs at `/guide/`, `/rules/`, etc.

### PR Preview Deployments

**How It Works:**

1. Developer creates PR with docs changes
2. Vercel automatically:
   - Detects the PR
   - Builds the preview
   - Comments on PR with preview URL
3. Reviewers can see exact changes before merging
4. Preview URL format: `claudelint-git-{branch}-{user}.vercel.app`

**Example PR Comment:**

```text
[x] Preview deployment ready!

 Inspect: https://vercel.com/...
 Preview: https://claudelint-git-update-docs-pdugan20.vercel.app
```

**No Configuration Needed** - Works automatically for all PRs.

### Environment Variables (Optional)

If you need analytics or other services:

1. Go to Project Settings → Environment Variables
2. Add variables (e.g., `VITE_GA_ID` for Google Analytics)
3. Redeploy to apply

### Vercel Configuration File (Optional)

Create `vercel.json` for advanced settings:

```json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "website/.vitepress/dist",
  "installCommand": "npm install",
  "framework": "vitepress",

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
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
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

### Build Performance

**Expected Times:**

- **First build**: 30-60 seconds (includes npm install)
- **Incremental builds**: 10-20 seconds (with cache)
- **Rule doc generation**: <1 second (117 rules)
- **VitePress build**: 5-10 seconds (170 pages)

**Vercel Free Tier Limits:**

- Build time: 6000 minutes/month (we'll use ~100 minutes)
- Bandwidth: 100GB/month (docs typically <1GB)
- Deployments: Unlimited

### Monitoring & Analytics

**Built-in Vercel Analytics:**

1. Go to Project → Analytics
2. Enable Vercel Analytics (free)
3. See real-time visitor data, page views
4. Privacy-friendly (no cookies)

**Custom Analytics (Optional):**

Add Google Analytics or Plausible in `website/.vitepress/config.ts`:

```typescript
export default defineConfig({
  head: [
    ['script', {
      defer: true,
      'data-domain': 'claudelint.com',
      src: 'https://plausible.io/js/script.js'
    }]
  ]
})
```

---

## Option 2: GitHub Pages (Alternative)

If you prefer GitHub Pages:

**Pros:**

- Free forever
- Simple setup
- Good for open source projects

**Cons:**

- No automatic PR previews
- Slower than Vercel's edge network
- Manual CNAME configuration

**Setup:**

1. Create `.github/workflows/deploy.yml` (see full example in previous version)
2. Configure repo Settings → Pages → Source: GitHub Actions
3. Push to deploy
4. Site live at `pdugan20.github.io/claudelint/`

For custom domain, add `website/public/CNAME` with `claudelint.com` and configure DNS.

See [archived deployment guide](https://github.com/pdugan20/claudelint/blob/main/docs/projects/vitepress-docs/deployment.md#github-pages-full-guide) for complete GitHub Pages setup.

---

## Option 3: Netlify

### Setup

#### Step 1: Import project

1. Go to <https://vercel.com>
2. Click "Import Project"
3. Connect GitHub repository
4. Vercel auto-detects VitePress

#### Step 2: Configure build settings

Vercel should auto-detect these (verify):

```text
Framework Preset: VitePress
Build Command: npm run docs:build
Output Directory: docs/.vitepress/dist
Install Command: npm install
```

#### Step 3: Add environment variables (if needed)

None required for basic setup.

#### Step 4: Deploy

Click "Deploy" - site will be live in ~1 minute.

### Custom Domain

1. Go to Project Settings → Domains
2. Add domain: `claudelint.com`
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

## Option 3: Netlify (Alternative)

### Setup

#### Step 1: Create netlify.toml

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

#### Step 2: Connect repository

1. Go to <https://app.netlify.com>
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Select repository
5. Netlify auto-detects settings from netlify.toml

#### Step 3: Deploy

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

#### Step 1: Connect repository

1. Go to Cloudflare Dashboard → Pages
2. Create project
3. Connect GitHub repository

#### Step 2: Configure build

```text
Framework preset: VitePress
Build command: npm run docs:build
Build output directory: docs/.vitepress/dist
```

#### Step 3: Deploy

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
curl -H "Accept-Encoding: br,gzip" -I https://claudelint.com
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
      'data-domain': 'claudelint.com',
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
2. Add monitor: `https://claudelint.com`
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
