const http = require('http');
const https = require('https');
const url = require('url');

// 1. THE FRONTEND: This HTML displays your search bar
const HTML_UI = `
<!DOCTYPE html>
<html>
<head>
    <title>My One-File Proxy</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #121212; color: white; }
        .box { background: #1e1e1e; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: center; width: 400px; }
        input { width: 100%; padding: 12px; margin: 15px 0; border: none; border-radius: 4px; background: #333; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 12px; border: none; border-radius: 4px; background: #007bff; color: white; cursor: pointer; font-weight: bold; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="box">
        <h2>Web Proxy</h2>
        <form action="/go" method="GET">
            <input type="text" name="url" placeholder="https://example.com" required>
            <button type="submit">Browse Now</button>
        </form>
    </div>
</body>
</html>
`;

// 2. THE BACKEND: This logic fetches the website you search for
const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);

    // Show the search bar on the home page
    if (parsed.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(HTML_UI);
    }

    // Proxy logic when you click "Browse"
    if (parsed.pathname === '/go') {
        const target = parsed.query.url;
        if (!target) return res.end("No URL provided");

        try {
            const remote = new URL(target);
            const protocol = remote.protocol === 'https:' ? https : http;

            const proxyReq = protocol.request(target, (remoteRes) => {
                res.writeHead(remoteRes.statusCode, remoteRes.headers);
                remoteRes.pipe(res, { end: true });
            });

            proxyReq.on('error', (e) => res.end("Error: " + e.message));
            req.pipe(proxyReq, { end: true });
        } catch (err) {
            res.end("Invalid URL. Include http:// or https://");
        }
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Live at http://localhost:${PORT}`));
