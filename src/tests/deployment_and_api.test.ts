import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { app } from '../server/app';

// Helper to launch an ephemeral test server
function createTestServer(): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });
}

describe('Vérif237 Deployment & Full-Stack Security Verification', () => {
  it('1. GET /api/stats/trends returns 200 JSON (Fix for Vercel 404 error)', async () => {
    const { server, url } = await createTestServer();
    try {
      const res = await fetch(`${url}/api/stats/trends`);
      assert.strictEqual(res.status, 200, 'Statut attendu 200');
      const contentType = res.headers.get('content-type') || '';
      assert.ok(contentType.includes('application/json'), 'Le content-type doit être application/json');

      const data = await res.json();
      assert.ok(data.summary, 'Le résumé statistique doit exister');
      assert.ok(data.summary.totalActsVerified > 0, 'totalActsVerified doit être positif');
      assert.ok(Array.isArray(data.monthlyActivity), 'monthlyActivity doit être une liste');
      assert.ok(data.verdictDistribution.length > 0, 'verdictDistribution doit comporter des entrées');
    } finally {
      server.close();
    }
  });

  it('2. GET /api/stats returns 200 with system integrity status', async () => {
    const { server, url } = await createTestServer();
    try {
      const res = await fetch(`${url}/api/stats`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(typeof data.totalUsers === 'number', 'totalUsers doit être un nombre');
      assert.ok(data.systemIntegrityStatus === 'INTÈGRE' || data.systemIntegrityStatus === 'ATTENTION');
    } finally {
      server.close();
    }
  });

  it('3. Unmatched API route returns JSON 404 and NOT HTML', async () => {
    const { server, url } = await createTestServer();
    try {
      const res = await fetch(`${url}/api/stats/nonexistent-route-xyz`);
      assert.strictEqual(res.status, 404, 'Doit retourner 404');
      const contentType = res.headers.get('content-type') || '';
      assert.ok(contentType.includes('application/json'), 'Ne doit JAMAIS renvoyer du HTML');

      const data = await res.json();
      assert.strictEqual(data.code, 'NOT_FOUND');
      assert.ok(data.error.includes('n\'existe pas'));
    } finally {
      server.close();
    }
  });

  it('4. CORS and Security Headers are properly emitted', async () => {
    const { server, url } = await createTestServer();
    try {
      // Preflight OPTIONS check
      const optRes = await fetch(`${url}/api/stats/trends`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://verif237.vercel.app',
          'Access-Control-Request-Method': 'GET'
        }
      });
      assert.strictEqual(optRes.status, 204, 'Preflight doit répondre 204');
      assert.ok(optRes.headers.get('access-control-allow-origin'), 'Access-Control-Allow-Origin requis');
      assert.ok(optRes.headers.get('access-control-allow-methods')?.includes('GET'));

      // GET request with security headers
      const getRes = await fetch(`${url}/api/stats`);
      assert.strictEqual(getRes.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(getRes.headers.get('x-frame-options'), 'SAMEORIGIN');
    } finally {
      server.close();
    }
  });

  it('5. Anti-SSRF Protection blocks internal/private IPs on submissions', async () => {
    const { server, url } = await createTestServer();
    try {
      const maliciousUrls = [
        'http://127.0.0.1:8080/internal',
        'http://localhost:3000/api/users',
        'http://169.254.169.254/latest/meta-data',
        'http://192.168.1.1/router',
        'http://10.0.0.1/admin',
        'ftp://evil.com/file'
      ];

      for (const badUrl of maliciousUrls) {
        const res = await fetch(`${url}/api/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Signalement suspect avec tentative SSRF vers cible protégée',
            url: badUrl,
            sourceType: 'WhatsApp'
          })
        });
        assert.strictEqual(res.status, 400, `L'URL ${badUrl} doit être rejetée avec HTTP 400`);
        const data = await res.json();
        assert.ok(data.error, 'Un message d’erreur doit être fourni');
      }
    } finally {
      server.close();
    }
  });

  it('6. Citizen submission and status polling work with tracking code', async () => {
    const { server, url } = await createTestServer();
    try {
      const subRes = await fetch(`${url}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Faux communiqué prétendant recruter 5000 agents au Ministère des Finances du Cameroun sans concours.',
          sourceType: 'WhatsApp citoyen',
          region: 'Centre (Yaoundé)'
        })
      });

      assert.strictEqual(subRes.status, 201, 'La soumission doit retourner 201 Created');
      const subData = await subRes.json();
      assert.ok(subData.trackingCode, 'Un trackingCode doit être attribué');
      assert.ok(subData.investigationId, 'Un investigationId doit être présent');

      // Polling check
      const pollRes = await fetch(`${url}/api/verifications/${subData.investigationId}`);
      assert.strictEqual(pollRes.status, 200, 'Le polling de statut doit réussir');
      const pollData = await pollRes.json();
      assert.ok(pollData.investigation, 'Le dossier doit exister');
      assert.ok(pollData.aiVerification, 'L’objet aiVerification doit être renseigné');
    } finally {
      server.close();
    }
  });

  it('7. Rate Limiter headers are correctly populated', async () => {
    const { server, url } = await createTestServer();
    try {
      const res = await fetch(`${url}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Vérification en cours pour test de rate limiting headers sur route protégée.',
          sourceType: 'Facebook'
        })
      });
      assert.ok(res.headers.get('ratelimit-limit'), 'Header RateLimit-Limit doit exister');
      assert.ok(res.headers.get('ratelimit-remaining'), 'Header RateLimit-Remaining doit exister');
    } finally {
      server.close();
    }
  });

  it('8. Role validation restricts unauthorized operations', async () => {
    const { server, url } = await createTestServer();
    try {
      const res = await fetch(`${url}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Actor-Role': 'citoyen'
        },
        body: JSON.stringify({
          name: 'Tentative Non Autorisée',
          email: 'pirate@faux.cm',
          role: 'Admin Fictif',
          roleType: 'super-admin'
        })
      });

      assert.strictEqual(res.status, 403, 'Un rôle citoyen ne doit pas pouvoir créer d’utilisateur staff');
      const data = await res.json();
      assert.strictEqual(data.code, 'FORBIDDEN_PRIVILEGE');
    } finally {
      server.close();
    }
  });
});
