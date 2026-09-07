export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #172b46; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 34rem; width: 100%; overflow: hidden; background: #fff; border: 1px solid #d9e0e8; border-radius: 12px; box-shadow: 0 20px 45px rgba(26,46,74,.12); }
      .heading { display: flex; align-items: center; gap: 14px; padding: 22px 24px; background: #1a2e4a; color: #fff; }
      .icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 8px; background: #c9a84c; color: #1a2e4a; font-size: 20px; font-weight: 700; }
      h1 { font: 700 24px/1.2 Georgia, serif; margin: 2px 0 0; }
      .eyebrow { color: #c9a84c; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
      .content { padding: 24px; }
      p { color: #536273; margin: 0 0 22px; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; }
      a, button { padding: .65rem 1rem; border-radius: 6px; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-weight: 600; }
      .primary { background: #c9a84c; color: #1a2e4a; }
      .secondary { background: #fff; color: #1a2e4a; border-color: #d1d9e2; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="heading"><div class="icon">!</div><div><div class="eyebrow">Page unavailable</div><h1>This page didn't load</h1></div></div>
      <div class="content">
        <p>Something interrupted this page while it was loading. Your information is safe. Try again, or return to the main site.</p>
        <div class="actions">
          <button class="primary" onclick="location.reload()">Try again</button>
          <a class="secondary" href="/">Go home</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
