/**
 * Suite de tests unitaires et d'intégration — Architecture Découplée IA & Services Vérif237
 * Valide :
 * 1. AIProviderFactory et résilience
 * 2. InstitutionalGroundingEngine (Zéro hallucination, détection arnaques Mobile Money)
 * 3. WebSearchService (Anti-SSRF strict, délimiteurs hermétiques anti-injection, cache 24h)
 * 4. InternalKnowledgeService (Recherche avec traçabilité et conservation des métadonnées)
 * 5. EvidenceEvaluationService (Pondération, détection de contradictions)
 * 6. VerificationService (Format canonique de sortie strictement validé)
 * 7. Persistance de la file de tâches dans la base de données
 */

import { AIProviderFactory } from '../server/ai/AIProviderFactory';
import { institutionalGroundingEngine } from '../server/ai/InstitutionalGroundingEngine';
import { webSearchService } from '../server/services/WebSearchService';
import { internalKnowledgeService } from '../server/services/InternalKnowledgeService';
import { evidenceEvaluationService } from '../server/services/EvidenceEvaluationService';
import { verificationService } from '../server/services/VerificationService';
import { db, VerificationTaskDB } from '../server/db';

async function runTestSuite() {
  console.log('======================================================');
  console.log('🧪 SUITE TESTS ARCHITECTURE & SERVICES IA — VÉRIF237');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Tests AIProviderFactory
  await test('AIProviderFactory sélectionne un fournisseur et offre un repli souverain', async () => {
    const provider = AIProviderFactory.getPreferredProvider();
    if (!provider || !provider.providerName) {
      throw new Error('Aucun fournisseur valide renvoyé par la fabrique');
    }
  });

  // 2. Tests InstitutionalGroundingEngine
  await test('InstitutionalGroundingEngine identifie une escroquerie financière Mobile Money', async () => {
    const result = await institutionalGroundingEngine.analyzeEvidence({
      claim: 'Recrutement direct au MINFOPRA. Envoyez 25 000 FCFA de frais de dossier par Orange Money au 670000000',
      internalEvidence: [],
      externalEvidence: []
    });

    if (result.verdict !== 'FALSE') {
      throw new Error(`Le verdict attendu était FALSE, reçu: ${result.verdict}`);
    }
    if (result.confidence.score < 90) {
      throw new Error(`Score de confiance insuffisant: ${result.confidence.score}`);
    }
    if (!result.reasoning_summary.includes('illégal') && !result.reasoning_summary.includes('Trésor')) {
      throw new Error(`Justification manquante dans reasoning_summary: ${result.reasoning_summary}`);
    }
  });

  await test('InstitutionalGroundingEngine retourne UNVERIFIABLE sans inventer de fausses preuves', async () => {
    const result = await institutionalGroundingEngine.analyzeEvidence({
      claim: 'Un commerçant inconnu aurait découvert un trésor dans une cour arrière à Maroua',
      internalEvidence: [],
      externalEvidence: []
    });

    if (result.verdict !== 'UNVERIFIABLE') {
      throw new Error(`Le verdict attendu était UNVERIFIABLE, reçu: ${result.verdict}`);
    }
    if (!result.requiresHumanInvestigation) {
      throw new Error('Une vérification humaine approfondie aurait dû être requise');
    }
  });

  // 3. Tests WebSearchService & Anti-SSRF
  await test('WebSearchService bloque formellement les adresses privées et les attaques SSRF', async () => {
    const dangerousUrls = [
      'http://localhost:8080/admin',
      'http://127.0.0.1/etc/passwd',
      'http://169.254.169.254/latest/meta-data/',
      'http://192.168.1.1/router',
      'http://10.0.0.1/internal',
      'http://metadata.google.internal/computeMetadata/v1/',
      'ftp://example.com/file'
    ];

    for (const url of dangerousUrls) {
      const check = webSearchService.isUrlSafe(url);
      if (check.safe) {
        throw new Error(`L'URL dangereuse n'a pas été bloquée : ${url}`);
      }
    }

    const safeUrl = 'https://www.spm.gov.cm/fr/actualites';
    const safeCheck = webSearchService.isUrlSafe(safeUrl);
    if (!safeCheck.safe) {
      throw new Error(`L'URL officielle sécurisée a été bloquée à tort : ${safeUrl}`);
    }
  });

  await test('WebSearchService nettoie le code HTML et isole les contenus externes anti-injection', async () => {
    const rawHtml = '<div><script>alert("hack")</script><p>Texte officiel</p><style>body{color:red}</style></div>';
    const cleaned = webSearchService.sanitizeHtmlToText(rawHtml);
    if (cleaned.includes('<script>') || cleaned.includes('alert') || cleaned.includes('<style>')) {
      throw new Error(`Le nettoyage HTML n'a pas éliminé les scripts : ${cleaned}`);
    }
    if (!cleaned.includes('Texte officiel')) {
      throw new Error(`Le texte brut a été altéré : ${cleaned}`);
    }

    const framed = webSearchService.frameUntrustedContent('Texte soumis', 'Test');
    if (!framed.includes('<<<SOURCE_EXTERNE_NON_VALIDEE') || !framed.includes('FIN_SOURCE_EXTERNE>>>')) {
      throw new Error('Délimiteurs d\'isolation anti-injection manquants');
    }
  });

  // 4. Tests InternalKnowledgeService
  await test('InternalKnowledgeService interroge le répertoire officiel des ministères camerounais', async () => {
    const res = await internalKnowledgeService.searchInternalKnowledge('Concours d\'entrée à l\'ENAM organisé par le MINFOPRA');
    if (res.matchedInstitutions.length === 0) {
      throw new Error('Aucun ministère identifié pour MINFOPRA');
    }
    const hasMinfopra = res.matchedInstitutions.some(i => i.acronym.includes('MINFOPRA'));
    if (!hasMinfopra) {
      throw new Error('MINFOPRA non trouvé dans les institutions reconnues');
    }
  });

  // 5. Tests EvidenceEvaluationService
  await test('EvidenceEvaluationService détecte les contradictions et pondère les preuves', async () => {
    const outcome = evidenceEvaluationService.evaluate([
      {
        claim: 'Décret signé',
        supports: true,
        sourceTitle: 'Présidence de la République',
        reliability: 'officielle'
      },
      {
        claim: 'Allégation réfutée sur les réseaux',
        supports: false,
        sourceTitle: 'Page Facebook anonyme',
        reliability: 'non_confirmee'
      }
    ], 'Signature de décret officiel');

    if (outcome.contradictionsFound.length === 0) {
      throw new Error('La contradiction entre sources n\'a pas été détectée');
    }
  });

  // 6. Tests VerificationService (Sortie canonique)
  await test('VerificationService génère un objet canonique complet et conforme', async () => {
    const output = await verificationService.verifyClaim({
      id: 'test-canon-1',
      code: '#VRF-TEST-CANON',
      text: 'Arrêté ministériel portant ouverture des inscriptions académiques aux universités d\'État',
      authorOrSource: 'MINESUP'
    });

    const expectedKeys = [
      'claim', 'verdict', 'verdictLabel', 'summary', 'reasoning_summary',
      'evidence', 'sources', 'confidence', 'limitations', 'humanReviewStatus',
      'createdAt', 'completedAt', 'elapsedSeconds', 'slaTargetSeconds',
      'isSlaBreached', 'workflowStep', 'modelProvider', 'modelName'
    ];

    for (const key of expectedKeys) {
      if (!(key in output)) {
        throw new Error(`Champ canonique manquant dans la sortie : ${key}`);
      }
    }

    if (output.humanReviewStatus !== 'NON_VALIDE_HUMAIN') {
      throw new Error(`Statut humain incorrect (ne doit jamais afficher de faux sceau) : ${output.humanReviewStatus}`);
    }

    if (!['SUPPORTED', 'FALSE', 'MISLEADING', 'OUT_OF_CONTEXT', 'UNVERIFIABLE'].includes(output.verdict)) {
      throw new Error(`Verdict canonique invalide : ${output.verdict}`);
    }
  });

  // 7. Tests Persistance de la file de tâches (db.saveVerificationTask)
  await test('db.saveVerificationTask et persistance des tâches', async () => {
    const testTask: VerificationTaskDB = {
      id: 'task-test-p1',
      investigationId: 'inv-test-p1',
      code: '#VRF-P1',
      input: {
        id: 'inv-test-p1',
        code: '#VRF-P1',
        text: 'Allégation de test persistance'
      },
      workflowStep: 'ANALYZING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0
    };

    db.saveVerificationTask(testTask);
    const retrieved = db.getVerificationTask('inv-test-p1');
    if (!retrieved || retrieved.workflowStep !== 'ANALYZING') {
      throw new Error('La tâche n\'a pas été persistée correctement');
    }

    db.updateVerificationTaskStep('inv-test-p1', 'COMPLETED');
    const updated = db.getVerificationTask('inv-test-p1');
    if (!updated || updated.workflowStep !== 'COMPLETED') {
      throw new Error('La mise à jour de l\'étape de tâche a échoué');
    }
  });

  console.log('\n======================================================');
  console.log(`📊 BILAN SERVICES & IA : ${passed}/${total} tests réussis`);
  console.log('======================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite();
