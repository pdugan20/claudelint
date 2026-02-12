# Caching

claudelint caches validation results to speed up repeated validations.

## How It Works

Caching is enabled by default and uses modification time (mtime) of files to determine if validation results are still valid.

**Cache Strategy:**

1. **On first run:** Validates all files, stores results in `.claudelint-cache/`
2. **On subsequent runs:** Checks if files have changed (mtime comparison)
3. **If unchanged:** Returns cached results (~2.4x faster)
4. **If changed:** Re-validates and updates cache

## Cache Directory Structure

````text
.claudelint-cache/
├── index.json          # Cache index with metadata
└── files/
    ├── abc123.json     # Cached validation result for validator
    └── def456.json     # ...
```text
## Usage

### Enable/Disable Caching

Caching is **enabled by default**:

```bash
# Use cache (default)
claudelint check-all

# Explicitly enable cache
claudelint check-all --cache

# Disable cache
claudelint check-all --no-cache
```text
### Custom Cache Location

```bash
# Use custom cache directory
claudelint check-all --cache-location /tmp/my-cache

# Clear custom cache
claudelint cache-clear --cache-location /tmp/my-cache
```text
### Clear Cache

```bash
# Clear all cached results
claudelint cache-clear
```text
## When Cache Is Invalidated

The cache is automatically invalidated when:

1. **claudelint version changes** - Different version may have different rules
2. **Files are modified** - Detected via modification time (mtime)
3. **Cache is manually cleared** - Using `cache-clear` command

## Performance

Typical performance improvements with caching:

| Scenario | Time | Speedup |
|----------|------|---------|
| First run (cold cache) | 204ms | baseline |
| Second run (warm cache) | 84ms | ~2.4x |
| Large project (100+ files) | ~1.2s → ~300ms | ~4x |

## Configuration

Cache behavior cannot currently be configured via `.claudelintrc.json`, only via CLI flags.

Future configuration options:

```json
{
  "cache": {
    "enabled": true,
    "location": ".claudelint-cache",
    "strategy": "mtime"
  }
}
```text
## Git Integration

The cache directory is automatically ignored by Git:

```text
# .gitignore
.claudelint-cache/
```text
**Never commit the cache directory** - it's specific to your local machine and file states.

## CI/CD Recommendations

### GitHub Actions

```yaml
- name: Cache claudelint
  uses: actions/cache@v5
  with:
    path: .claudelint-cache
    key: ${{ runner.os }}-claudelint-${{ hashFiles('**/*.md', '.claude/**/*') }}

- name: Run claudelint
  run: npx claude-code-lint check-all
```text
### GitLab CI

```yaml
cache:
  paths:
    - .claudelint-cache/

lint:
  script:
    - npx claude-code-lint check-all
```text
## Troubleshooting

### Cache Not Working

**Problem:** Second run is not faster

**Solutions:**

1. Check cache is enabled:

   ```bash
   claudelint check-all --cache  # Explicit flag
   ```text
2. Verify cache directory exists:

   ```bash
   ls -la .claudelint-cache/
   ```text
3. Check cache has entries:

   ```bash
   cat .claudelint-cache/index.json | jq
   ```text
### Stale Results

**Problem:** Cache returns outdated results

**Solution:** Clear cache and re-run:

```bash
claudelint cache-clear
claudelint check-all
```text
### Cache Too Large

**Problem:** `.claudelint-cache/` directory is large

**Solution:** Clear cache periodically:

```bash
# Clear cache
claudelint cache-clear

# Or delete manually
rm -rf .claudelint-cache/
```text
## Cache Internals

### Cache Key Generation

```typescript
// Cache key = hash(version + validator + file_mtimes)
const hash = createHash('sha256');
hash.update(version);          // claudelint version
hash.update(validatorName);    // 'CLAUDE.md', 'Skills', etc.
for (file of files) {
  hash.update(file.mtime);     // File modification time
}
```text
### Why mtime Instead of Content Hash?

- **Faster:** No need to read file contents
- **Good enough:** mtime changes when content changes
- **Lower overhead:** < 5% performance impact

Content-based hashing may be added in future versions as an option.

## Future Enhancements

Planned improvements:

1. **Content-based strategy** - Hash file contents for more accuracy
2. **Config-aware caching** - Invalidate when `.claudelintrc.json` changes
3. **Partial invalidation** - Only re-validate changed files
4. **Cache statistics** - `claudelint cache-stats` command
5. **Cache warming** - Pre-populate cache in CI
````
