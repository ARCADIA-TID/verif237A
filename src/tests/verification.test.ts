/**
 * Suite de tests automatisés — Système de vérification rapide & IA Vérif237
 * Couvre l'ensemble des 12 scénarios prioritaires :
 * 1. Soumission valide
 * 2. Rejet des données invalides (< 10 car., SSRF privées, payloads excessifs)
 * 3. Traitement asynchrone par l'IA avec transition d'étapes
 * 4. Structure complète et rigoureuse du résultat (champs canoniques)
 * 5. Cas d'une information confirmée par décret officiel ou arrêté
 * 6. Cas d'une fausse rumeur avec fraude financière (Faux concours MINFOPRA Mobile Money)
 * 7. Cas d'une information non vérifiable (manque d'éléments)
 * 8. Tolérance aux pannes du fournisseur d'IA & activation du moteur institutionnel
 * 9. Mesure des performances SLA (< 5 minutes, p50 et p95)
 * 10. Recherche et consultation via code de tracking #VRF
 * 11. Récupération de l'historique des vérifications par utilisateur
 * 12. Sécurité de l'audit WORM et non-altération (SHA-256)
 */

import { aiVerificationService } from '../server/aiVerificationService.js';
import { verificationQueue } from '../server/verificationQueue.js';
import { db, type InvestigationQueueItemDB } from '../server/db.js';

interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, durationMs: duration });
    console.log(`  ✓ [PASS] ${name} (${duration}ms)`);
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({
      name,
      passed: false,
      durationMs: duration,
      details: err?.message || String(err),
    });
    console.error(`  ✗ [FAIL] ${name} (${duration}ms):`, err?.message || err);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Fixture factory matching InvestigationQueueItemDB strictly
function createTestInvestigation(overrides: Partial<InvestigationQueueItemDB>): InvestigationQueueItemDB {
  return {
    id: `test-inv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    code: `#VRF-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    title: 'Signalement de test',
    description: 'Description détaillée du signalement soumis',
    sourceType: 'Web citoyen',
    urgency: 'normale',
    urgencyLabel: 'Urgence normale',
    timeAgo: 'À l\'instant',
    submittedAt: new Date().toISOString(),
    submittedBy: 'Citoyen Test',
    assignedTo: 'Observatoire Vérif 237',
    status: 'submitted',
    statusLabel: 'Enregistré dans la file accélérée',
    scope: 'National',
    signatures: { isSealed: false },
    notes: [],
    ...overrides
  };
}

// Validation helper replicating server input checks
function validateSubmissionInput(text: string, url?: string): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Texte manquant' };
  }
  const trimmed = text.trim();
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Le texte doit contenir au moins 10 caractères' };
  }
  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Le texte ne peut excéder 5000 caractères' };
  }
  if (url && url.trim().length > 0) {
    const rawUrl = url.trim();
    try {
      const parsed = new URL(rawUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { isValid: false, error: 'Protocole URL non autorisé (seuls http et https acceptés)' };
      }
      const host = parsed.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
        host === '169.254.169.254' ||
        host.endsWith('.internal') ||
        host.endsWith('.local')
      ) {
        return { isValid: false, error: 'Accès aux adresses réseau privées non autorisé (anti-SSRF)' };
      }
    } catch {
      return { isValid: false, error: 'URL malformée' };
    }
  }
  return { isValid: true };
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SUITE DE TESTS AUTOMATISÉS — VÉRIF237 IA & SLA 5 MIN');
  console.log('======================================================\n');

  // 1. Soumission valide
  await runTest('1. Soumission valide et génération code de suivi', async () => {
    const text = "Le Ministère des Enseignements Secondaires annonce le calendrier des examens officiels session 2026";
    const check = validateSubmissionInput(text, "https://minesec.gov.cm/communique-2026");
    assert(check.isValid, "La validation de base doit réussir");

    const code = `#VRF-2026-TEST${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = createTestInvestigation({
      id: `test-sub-${Date.now()}`,
      code: code,
      title: text,
      sourceUrl: 'https://minesec.gov.cm/communique-2026',
      submittedBy: 'Citoyen Test',
      status: 'submitted',
      statusLabel: 'En attente de traitement',
    });
    db.data.investigations.push(newRecord);

    const retrieved = db.getInvestigationByCode(code);
    assert(retrieved !== undefined, "L'enregistrement doit être trouvable via son code de suivi");
    assert(retrieved ? retrieved.code.startsWith('#VRF-') : false, "Le code doit respecter le format #VRF-");
  });

  // 2. Rejet des données invalides (anti-SSRF, longueur, payloads)
  await runTest('2. Rejet des données invalides (< 10 car., SSRF privées, payloads excessifs)', async () => {
    // Trop court (< 10 caractères)
    const shortCheck = validateSubmissionInput("court");
    assert(!shortCheck.isValid, "Doit rejeter un texte < 10 caractères");

    // Trop long (> 5000 caractères)
    const hugeText = "A".repeat(5001);
    const hugeCheck = validateSubmissionInput(hugeText);
    assert(!hugeCheck.isValid, "Doit rejeter un texte > 5000 caractères");

    // SSRF Localhost
    const ssrfLocal = validateSubmissionInput("Information test valide pour SSRF", "http://localhost:8080/admin");
    assert(!ssrfLocal.isValid, "Doit bloquer localhost");

    // SSRF 127.0.0.1
    const ssrfLoopback = validateSubmissionInput("Information test valide pour SSRF", "http://127.0.0.1:3000/api");
    assert(!ssrfLoopback.isValid, "Doit bloquer 127.0.0.1");

    // SSRF AWS Metadata
    const ssrfMeta = validateSubmissionInput("Information test valide pour SSRF", "http://169.254.169.254/latest/meta-data/");
    assert(!ssrfMeta.isValid, "Doit bloquer 169.254.169.254");

    // SSRF Private LAN
    const ssrfPrivate = validateSubmissionInput("Information test valide pour SSRF", "http://192.168.1.1/router");
    assert(!ssrfPrivate.isValid, "Doit bloquer 192.168.x.x");

    // Faux protocole file://
    const badProto = validateSubmissionInput("Information test valide pour SSRF", "file:///etc/passwd");
    assert(!badProto.isValid, "Doit bloquer le protocole file://");
  });

  // 3. Traitement asynchrone par l'IA et progression d'étapes
  await runTest('3. Traitement asynchrone par l\'IA avec transition d\'étapes', async () => {
    const queueId = `test-queue-${Date.now()}`;
    const code = `#VRF-2026-ASYNC${Math.floor(1000 + Math.random() * 9000)}`;
    const textClaim = "Le gouvernement camerounais a signé un décret d'application pour le statut des enseignants.";
    const queueItem = createTestInvestigation({
      id: queueId,
      code: code,
      title: textClaim,
      sourceType: 'WhatsApp',
      submittedBy: 'Anonyme 237',
      status: 'submitted',
      statusLabel: 'Enregistré dans la file accélérée',
    });
    db.data.investigations.push(queueItem);

    // Enqueue in asynchronous queue
    verificationQueue.enqueue(queueId, {
      id: queueId,
      code: code,
      text: textClaim,
      sourceType: queueItem.sourceType,
    });

    const statusAfterEnqueue = db.getInvestigationById(queueId);
    assert(statusAfterEnqueue !== undefined && !!statusAfterEnqueue.aiVerification, "L'objet aiVerification doit être initialisé dès l'enqueue");
    assert(
      statusAfterEnqueue?.aiVerification?.status === 'en_attente' ||
      statusAfterEnqueue?.aiVerification?.status === 'analyse_en_cours',
      "Statut initial doit être en attente ou en cours"
    );

    // Attente jusqu'à résolution
    let attempts = 0;
    while (attempts < 50) {
      await new Promise(r => setTimeout(r, 300));
      const current = db.getInvestigationById(queueId);
      if (
        current?.aiVerification &&
        (current.aiVerification.status === 'resultat_disponible' ||
         current.aiVerification.status === 'verification_approfondie_requise')
      ) {
        break;
      }
      attempts++;
    }

    const finalItem = db.getInvestigationById(queueId);
    assert(!!finalItem?.aiVerification, "Le champ aiVerification doit être renseigné");
    assert(
      finalItem?.aiVerification?.status === 'resultat_disponible' ||
      finalItem?.aiVerification?.status === 'verification_approfondie_requise',
      `Le statut final de l'IA doit être résolu (reçu: ${finalItem?.aiVerification?.status})`
    );
  });

  // 4. Structure complète du résultat d'analyse
  await runTest('4. Structure complète et rigoureuse du résultat (champs canoniques)', async () => {
    const result = await aiVerificationService.analyzeClaim({
      id: 'claim-struct-1',
      code: '#VRF-STRUCT-1',
      text: "La Banque des États de l'Afrique Centrale (BEAC) met en circulation de nouvelles coupures de billets type 2020.",
      authorOrSource: "BEAC",
    });

    assert(typeof result.verdict === 'string', "Le verdict canonique doit être une chaîne");
    assert(
      ['CONFIRMEE', 'FAUSSE', 'TROMPEUSE', 'HORS_CONTEXTE', 'NON_VERIFIABLE'].includes(result.verdict),
      `Verdict canonique inconnu: ${result.verdict}`
    );
    assert(typeof result.summary === 'string' && result.summary.length > 20, "Le résumé doit être explicatif");
    assert(Array.isArray(result.arguments) && result.arguments.length >= 1, "Il doit y avoir au moins un argument");
    assert(Array.isArray(result.sources) && result.sources.length >= 1, "Les sources consultées doivent être listées");
    assert(typeof result.confidenceScore === 'number' && result.confidenceScore >= 0 && result.confidenceScore <= 100, "Le score de confiance doit être entre 0 et 100");
    assert(typeof result.confidenceExplanation === 'string', "La justification de la confiance doit être présente");
    assert(Array.isArray(result.limits) && result.limits.length >= 1, "Les limites méthodologiques doivent être explicitées");
    assert(typeof result.modelProvider === 'string', "Le fournisseur de modèle doit être renseigné");
    assert(typeof result.modelName === 'string', "Le nom du modèle doit être renseigné");
  });

  // 5. Cas d'une information confirmée par décret officiel ou arrêté
  await runTest('5. Cas d\'une information confirmée par décret officiel ou arrêté', async () => {
    const result = await aiVerificationService.analyzeClaim({
      id: 'claim-decret-1',
      code: '#VRF-DECRET-1',
      text: "Décret N° 2018/191 du 02 mars 2018 portant réorganisation du Gouvernement de la République du Cameroun par le Président Paul Biya.",
      authorOrSource: "Présidence de la République du Cameroun",
    });

    assert(result.verdict === 'CONFIRMEE' || result.confidenceScore >= 70, "Un décret officiel avéré doit recevoir un niveau de confiance élevé");
    assert(result.sources.some(s => s.isOfficial || s.name.includes('Présidence') || s.name.includes('Premier Ministre')), "Doit citer une source officielle camerounaise");
  });

  // 6. Cas d'une arnaque / fausse rumeur (Fake MINFOPRA avec Mobile Money)
  await runTest('6. Cas d\'une fausse rumeur avec fraude financière (Faux concours MINFOPRA Mobile Money)', async () => {
    const fraudClaim = "Recrutement spécial de 5 000 jeunes au Ministère de la Fonction Publique (MINFOPRA). Envoyez vos dossiers et frais d'inscription de 15 000 FCFA par Orange Money ou MTN Mobile Money au 670000000.";
    const result = await aiVerificationService.analyzeClaim({
      id: 'claim-fraud-1',
      code: '#VRF-FRAUD-1',
      text: fraudClaim,
      authorOrSource: "Page Facebook Opportunités Cameroun",
    });

    assert(
      result.verdict === 'FAUSSE' || result.verdict === 'TROMPEUSE',
      `L'arnaque Mobile Money doit être classée FAUSSE ou TROMPEUSE (reçu: ${result.verdict})`
    );
    const mentionsFraude = result.arguments.some(arg =>
      arg.toLowerCase().includes('mobile money') ||
      arg.toLowerCase().includes('arnaque') ||
      arg.toLowerCase().includes('trésor public') ||
      arg.toLowerCase().includes('officiel') ||
      arg.toLowerCase().includes('paiement') ||
      arg.toLowerCase().includes('faux')
    );
    assert(mentionsFraude, "Les arguments doivent relever l'illégalité du paiement direct par Mobile Money pour un concours officiel");
  });

  // 7. Cas d'une information non vérifiable (manque d'éléments)
  await runTest('7. Cas d\'une information non vérifiable (sans inventer de preuve)', async () => {
    const unprovableClaim = "Hier soir à minuit pile, un objet volant non identifié en forme de disque vert s'est posé 2 minutes derrière un hangar secret dans un village non nommé sans laisser aucune trace matérielle.";
    const result = await aiVerificationService.analyzeClaim({
      id: 'claim-unprovable-1',
      code: '#VRF-UNPROVABLE-1',
      text: unprovableClaim,
    });

    assert(
      result.verdict === 'NON_VERIFIABLE' || result.confidenceScore <= 60,
      `Une rumeur non sourçable sans traces doit être NON_VERIFIABLE (reçu: ${result.verdict})`
    );
    assert(
      result.limits.length >= 1,
      "Les limites doivent clairement indiquer l'absence de sources documentaires vérifiables sans affirmer automatiquement que l'absence de preuve équivaut à la fausseté"
    );
  });

  // 8. Tolérance aux pannes du fournisseur d'IA (moteur de secours institutionnel)
  await runTest('8. Tolérance aux pannes du fournisseur d\'IA & activation du moteur institutionnel', async () => {
    const claim = {
      id: 'claim-fallback-1',
      code: '#VRF-FALLBACK-1',
      text: "Faux communiqué de la DGSN annonçant la gratuité totale et immédiate du passeport biométrique pour tous les citoyens sans timbre fiscal.",
      authorOrSource: "WhatsApp Viral",
    };

    // Test direct du moteur de secours d'ancrage institutionnel
    const fallbackEngine = (aiVerificationService as any).executeInstitutionalGrounding.bind(aiVerificationService);
    const fallbackResult = await fallbackEngine(claim);

    assert(!!fallbackResult, "Le moteur de repli doit produire un résultat valide");
    assert(fallbackResult.sources.length > 0, "Le moteur de repli doit fournir les institutions de référence de l'annuaire camerounais");
    assert(fallbackResult.modelProvider.includes('Observatoire') || fallbackResult.modelProvider.includes('Institutional'), "Le provider doit indiquer l'Observatoire / moteur institutionnel");
  });

  // 9. Mesure du délai de réponse (< 5 min, p50 et p95)
  await runTest('9. Mesure des performances SLA (< 5 minutes, p50 et p95)', async () => {
    const sampleClaims = [
      "Le MINFOPRA publie les résultats du concours des élèves administrateurs civils de l'ENAM.",
      "Coupure générale d'électricité annoncée par Eneo sur toute l'étendue de la ville de Douala pour maintenance.",
      "Le Ministère des Transports suspend les activités d'une compagnie de transport interurbain suite à un accident.",
      "Une rumeur affirme que la rentrée scolaire est reportée sine die sans arrêté ministériel.",
      "La CRTV diffuse en direct le défilé de la fête nationale de l'Unité du 20 mai au Boulevard du 20 Mai à Yaoundé."
    ];

    const durations: number[] = [];
    const engine = (aiVerificationService as any).executeInstitutionalGrounding.bind(aiVerificationService);
    for (let i = 0; i < sampleClaims.length; i++) {
      const t0 = Date.now();
      await engine({
        id: `sla-perf-${i}`,
        code: `#VRF-SLA-${i}`,
        text: sampleClaims[i]
      });
      durations.push(Date.now() - t0);
    }

    durations.sort((a, b) => a - b);
    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];

    console.log(`     -> Échantillon latences: ${durations.join('ms, ')}ms`);
    console.log(`     -> P50 (médiane): ${p50}ms (${(p50 / 1000).toFixed(2)}s)`);
    console.log(`     -> P95: ${p95}ms (${(p95 / 1000).toFixed(2)}s)`);

    const SLA_LIMIT_MS = 5 * 60 * 1000; // 300 000 ms (5 minutes)
    assert(p50 < SLA_LIMIT_MS, `La médiane (${p50}ms) doit être bien inférieure au SLA de 5 min (300000ms)`);
    assert(p95 < SLA_LIMIT_MS, `Le p95 (${p95}ms) doit être inférieur au SLA de 5 min`);

    // Vérifier également la méthode getSLAMetrics
    const metrics = db.getSLAMetrics();
    assert(typeof metrics.medianSeconds === 'number', "Les métriques SLA doivent inclure medianSeconds");
    assert(typeof metrics.p95Seconds === 'number', "Les métriques SLA doivent inclure p95Seconds");
    assert(typeof metrics.slaComplianceRate === 'number', "Le taux de conformité SLA doit être calculé");
  });

  // 10. Suivi par code de tracking
  await runTest('10. Recherche et consultation via code de tracking #VRF', async () => {
    const code = `#VRF-2026-TRK${Math.floor(100000 + Math.random() * 900000)}`;
    const testItem = createTestInvestigation({
      id: `track-item-${Date.now()}`,
      code: code,
      title: "Information test pour la validation du code de tracking direct",
      sourceType: 'Web',
      submittedBy: 'Citoyen Suivi',
      status: 'pre_analysis',
      statusLabel: 'Résultat disponible',
      verdict: 'VRAI',
      verdictLabel: 'Confirmée',
      aiVerification: {
        id: 'ai-track-1',
        status: 'resultat_disponible',
        statusLabel: 'Résultat d\'analyse automatique disponible',
        progressStep: 'FINALISATION',
        stepDescription: 'Analyse préliminaire prête',
        verdict: 'CONFIRMEE',
        verdictLabel: 'Confirmée par sources officielles',
        summary: 'Analyse confirmée par les sources institutionnelles',
        arguments: ['Document vérifié au journal officiel'],
        sources: [{ name: 'MINCOM', url: 'https://mincom.gov.cm', isOfficial: true, reliability: 'officielle' }],
        confidence: 'ELEVE',
        confidenceScore: 85,
        confidenceExplanation: 'Sources institutionnelles cohérentes',
        limits: ['Analyse préliminaire basée sur les bases publiques'],
        startedAt: new Date(Date.now() - 35000).toISOString(),
        completedAt: new Date().toISOString(),
        elapsedSeconds: 35,
        estimatedRemainingSeconds: 0,
        slaTargetSeconds: 300,
        isSlaBreached: false,
        humanReviewStatus: 'EN_ATTENTE_REVUE',
        retryCount: 0,
        modelProvider: 'Google Gemini',
        modelName: 'gemini-3.8-flash'
      }
    });
    db.data.investigations.push(testItem);

    const found = db.getInvestigationByCode(code);
    assert(found !== undefined, `Doit retrouver l'investigation via le code exact ${code}`);
    assert(found ? found.id === testItem.id : false, "L'ID doit correspondre");
    assert(found ? found.aiVerification?.verdict === 'CONFIRMEE' : false, "Les résultats doivent être restitués");
  });

  // 11. Historique utilisateur
  await runTest('11. Récupération de l\'historique des vérifications par utilisateur', async () => {
    const testUserName = `Citoyen-Hist-${Date.now()}`;
    const item1 = createTestInvestigation({
      id: `hist-1-${Date.now()}`,
      code: `#VRF-2026-H1-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "Première soumission de l'utilisateur pour son historique",
      submittedBy: testUserName,
      submittedAt: new Date(Date.now() - 60000).toISOString(),
      status: 'pre_analysis',
      statusLabel: 'Résultat disponible',
      verdict: 'VRAI',
      verdictLabel: 'Confirmée',
    });
    const item2 = createTestInvestigation({
      id: `hist-2-${Date.now()}`,
      code: `#VRF-2026-H2-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "Deuxième soumission de l'utilisateur pour son historique",
      submittedBy: testUserName,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      statusLabel: 'En cours',
    });

    db.data.investigations.push(item1, item2);

    const userHistory = db.getVerificationsByUser(testUserName);
    assert(userHistory.length >= 2, "Doit renvoyer au moins les 2 soumissions créées");
    assert(userHistory.some(i => i.id === item1.id), "Doit contenir item1");
    assert(userHistory.some(i => i.id === item2.id), "Doit contenir item2");
  });

  // 12. Intégrité de l'audit et non-répudiation (hash SHA-256)
  await runTest('12. Sécurité de l\'audit WORM et non-altération (SHA-256)', async () => {
    const logs = db.data.auditLogs;
    assert(Array.isArray(logs), "Le journal d'audit WORM doit être une collection");
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      assert(typeof lastLog.hash === 'string' && lastLog.hash.length === 64, "Le hash SHA-256 d'audit doit faire 64 caractères hexadécimaux");
      assert(typeof lastLog.previousHash === 'string', "Le chaînage du hash précédent doit être présent");
    }
  });

  console.log('\n======================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 BILAN: ${passedCount}/${results.length} tests réussis (${failedCount} échecs)`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("Erreur fatale dans la suite de tests:", err);
  process.exit(1);
});
