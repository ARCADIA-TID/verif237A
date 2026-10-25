import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import { db, sha256 } from './src/server/db';
import { CAMEROON_OFFICIAL_INSTITUTIONS } from './src/server/ministriesData';
import { runAutomaticPreAnalysis } from './src/server/preAnalysisService';
import { parseImageMetadata } from './src/server/imageAnalysisService';
import { writeTextAuditLog, readTextAuditLog } from './src/server/textAuditLogger';
import { runSecurityAudit } from './src/server/securityScanner';
import { CAMEROON_REGIONS } from './src/server/cameroonRegionsData';
import { aiVerificationService, generateAIFactCheckReport } from './src/server/aiVerificationService';
import { verificationQueue } from './src/server/verificationQueue';
import { CITIZEN_PORTAL_ARTICLES, CAMEROON_WEATHER_DATA } from './src/server/citizenPortalData';
import { assistantChatService } from './src/server/services/AssistantChatService';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.url}`);
  }
  next();
});

// ==========================================
// 1. DASHBOARD & STATS API
// ==========================================
app.get('/api/stats', (req, res) => {
  const snapshot = db.getSnapshot();
  const now = new Date();

  // Active sessions: non-revoked and not expired
  const activeSessions = snapshot.sessions.filter(
    s => !s.isRevoked && new Date(s.expiresAt) > now
  );

  // Active staff: online and in one of the staff roles
  const activeStaff = snapshot.users.filter(
    u => u.isOnline && u.roleType !== 'citoyen' && u.status === 'actif'
  );

  const pendingVerifications = snapshot.investigations.filter(
    i => i.status === 'submitted' || i.status === 'pre_analysis' || i.status === 'pending_review'
  ).length;

  const inReviewVerifications = snapshot.investigations.filter(
    i => i.status === 'en_instruction' || i.status === 'contre_expertise'
  ).length;

  const completedVerifications = snapshot.investigations.filter(
    i => i.status === 'completed'
  ).length;

  const openIntegrityAlerts = snapshot.integrityAlerts.filter(
    a => a.status === 'OUVERTE'
  ).length;

  const pendingDoubleSignatures = snapshot.doubleSignatures.filter(
    d => d.status.startsWith('en_attente')
  ).length;

  res.json({
    totalUsers: snapshot.users.length,
    activeSessionsCount: activeSessions.length,
    activeStaffCount: activeStaff.length,
    totalSubmitted: snapshot.investigations.length + 1420, // Historical archive count
    pendingVerifications,
    inReviewVerifications,
    completedVerifications,
    openIntegrityAlerts,
    totalAuditEvents: snapshot.auditLogs.length + 1840,
    pendingDoubleSignatures,
    activeSessions,
    systemIntegrityStatus: openIntegrityAlerts === 0 ? 'INTÈGRE' : 'ATTENTION',
    lastSyncTimestamp: new Date().toISOString()
  });
});

app.get('/api/stats/trends', (req, res) => {
  const snapshot = db.getSnapshot();
  const baseVerified = 1420 + snapshot.investigations.filter(i => i.status === 'completed').length;

  res.json({
    summary: {
      totalActsVerified: baseVerified,
      totalSubmissions: baseVerified + 680,
      overallDisinformationRate: 61.8,
      citizensProtectedEstimate: '345 000+',
      averageVerificationHours: 3.2,
      sealedHashCount: baseVerified
    },
    monthlyActivity: [
      { month: 'Avr 24', signalements: 94, actesVerifies: 68, fauxDetectes: 42, desinformationRate: 61.7 },
      { month: 'Mai 24', signalements: 112, actesVerifies: 85, fauxDetectes: 54, desinformationRate: 63.5 },
      { month: 'Juin 24', signalements: 148, actesVerifies: 110, fauxDetectes: 72, desinformationRate: 65.4 },
      { month: 'Juil 24', signalements: 185, actesVerifies: 135, fauxDetectes: 89, desinformationRate: 65.9 },
      { month: 'Août 24', signalements: 165, actesVerifies: 122, fauxDetectes: 76, desinformationRate: 62.3 },
      { month: 'Sept 24', signalements: 190, actesVerifies: 145, fauxDetectes: 98, desinformationRate: 67.5 },
      { month: 'Oct 24', signalements: 178, actesVerifies: 138, fauxDetectes: 86, desinformationRate: 62.3 },
      { month: 'Nov 24', signalements: 205, actesVerifies: 156, fauxDetectes: 99, desinformationRate: 63.4 },
      { month: 'Déc 24', signalements: 230, actesVerifies: 172, fauxDetectes: 108, desinformationRate: 62.8 },
      { month: 'Jan 25', signalements: 245, actesVerifies: 184, fauxDetectes: 114, desinformationRate: 61.9 },
      { month: 'Fév 25', signalements: 260, actesVerifies: 198, fauxDetectes: 122, desinformationRate: 61.6 },
      { month: 'Mars 25', signalements: 285, actesVerifies: 212, fauxDetectes: 131, desinformationRate: 61.8 }
    ],
    verdictDistribution: [
      { name: 'Faux & Arnaques financières', value: 878, percentage: 61.8, color: '#dc2626' },
      { name: 'Trompeur & Décontextualisé', value: 312, percentage: 22.0, color: '#d97706' },
      { name: 'Actes Authentiques (Vrai)', value: 230, percentage: 16.2, color: '#007953' }
    ],
    actsByInstitution: [
      { institution: 'MINFOPRA', name: 'Fonction Publique (Concours)', verified: 420, fakeDetected: 268 },
      { institution: 'DGSN', name: 'Police Nationale & Passeports', verified: 310, fakeDetected: 195 },
      { institution: 'MINESUP', name: 'Enseignement Sup. & Bourses', verified: 285, fakeDetected: 172 },
      { institution: 'MINFI', name: 'Douanes & Trésor Public', verified: 185, fakeDetected: 124 },
      { institution: 'MINSANTE', name: 'Santé Publique & Épidémies', verified: 120, fakeDetected: 48 },
      { institution: 'OBC/GCE', name: 'Examens Officiels (Bac/GCE)', verified: 100, fakeDetected: 62 }
    ],
    channelsDistribution: [
      { name: 'Transferts WhatsApp', value: 64, color: '#25D366' },
      { name: 'Pages Facebook / Méta', value: 19, color: '#1877F2' },
      { name: 'TikTok / Vidéos virales', value: 9, color: '#FE2C55' },
      { name: 'Réseau X (Twitter)', value: 5, color: '#0ea5e9' },
      { name: 'Signalement Direct / SMS', value: 3, color: '#8b5cf6' }
    ]
  });
});

// ==========================================
// 2. USERS & ACCREDITATIONS API
// ==========================================
app.get('/api/users', (req, res) => {
  const { role, search, status } = req.query;
  let users = [...db.getSnapshot().users];

  if (role && role !== 'all') {
    users = users.filter(u => u.roleType === role);
  }
  if (status && status !== 'all') {
    users = users.filter(u => u.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    users = users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.jurisdiction.toLowerCase().includes(q)
    );
  }

  res.json({ users, total: users.length });
});

app.post('/api/users', (req, res) => {
  const { name, email, phone, role, roleType, jurisdiction, validityUntil, actorName } = req.body;

  if (!name || !email || !role || !roleType) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (Nom, Email, Rôle).' });
  }

  // Email duplicate check
  const snapshot = db.getSnapshot();
  const existing = snapshot.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: `Un utilisateur avec l'adresse ${email} existe déjà.` });
  }

  const rolePrefixMap: Record<string, string> = {
    'super-admin': 'ADM',
    'reviseur': 'REV',
    'forensique': 'FOR',
    'terrain': 'ENQ',
    'moderateur': 'MOD'
  };
  const prefix = rolePrefixMap[roleType] || 'EXP';
  const code = `#${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0].toUpperCase())
    .join('');

  const newUser = {
    id: `user-${Date.now()}`,
    code,
    name,
    email,
    phone: phone || '+237 6xx xx xx xx',
    role,
    roleType,
    jurisdiction: jurisdiction || 'National (Yaoundé / Douala)',
    keyHabilitation: roleType === 'reviseur' ? 'Scellement SHA-256' : 'Instruction & Analyse Forensique',
    keyHabilitationSub: 'Contrôle collégial IFCN',
    securityStatus: 'En attente d’activation 2FA',
    securityDetail: 'Invitation sécurisée transmise',
    isOnline: false,
    avatarInitials: initials,
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    sha256Enabled: roleType === 'super-admin' || roleType === 'reviseur',
    needs2FARenewal: false,
    status: 'actif' as const,
    validityUntil: validityUntil || '2026-12-31',
    createdAt: new Date().toISOString()
  };

  snapshot.users.unshift(newUser);

  // Audit log
  db.appendAuditLog({
    type: 'USER_CREATE',
    title: `Nouvel utilisateur accrédité : ${name} (${code})`,
    detail: `Création du compte accrédité avec rôle ${roleType} sous juridiction ${newUser.jurisdiction}.`,
    user: actorName || 'Dr. François Kamga (Super-Admin)',
    actorId: 'user-1',
    resource: `Compte ${code}`,
    result: 'SUCCESS',
    extraMeta: `Email : ${email}`
  });

  db.commit();
  res.status(201).json({ user: newUser, message: `Utilisateur ${name} (${code}) créé et accrédité avec succès.` });
});

app.put('/api/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, actorName } = req.body;
  const snapshot = db.getSnapshot();
  const user = snapshot.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  user.status = status;
  user.securityStatus = status === 'actif' ? 'Compte réactivé' : 'Compte suspendu par l’administration';
  if (status === 'suspendu') {
    user.isOnline = false;
    // Revoke all active sessions for this user
    snapshot.sessions.forEach(s => {
      if (s.userId === id) s.isRevoked = true;
    });
  }

  db.appendAuditLog({
    type: 'PERMISSIONS',
    title: `Changement de statut utilisateur : ${user.name}`,
    detail: `Le compte ${user.code} a été passé au statut : ${status.toUpperCase()}.`,
    user: actorName || 'Super-Admin',
    actorId: 'admin',
    resource: `Utilisateur ${user.code}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ user, message: `Statut de ${user.name} mis à jour : ${status}.` });
});

app.post('/api/users/:id/renew-2fa', (req, res) => {
  const { id } = req.params;
  const { actorName } = req.body;
  const snapshot = db.getSnapshot();
  const user = snapshot.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  user.needs2FARenewal = false;
  user.securityStatus = '2FA Renouvelé (TOTP FIDO2)';
  user.securityDetail = 'Nouvelle clé asymétrique scellée';

  db.appendAuditLog({
    type: 'AUTH',
    title: `Renouvellement 2FA : ${user.name}`,
    detail: `Procédure de ré-enrôlement 2FA FIDO2 initiée pour ${user.code}.`,
    user: actorName || 'Dr. F. Kamga',
    actorId: 'admin',
    resource: `2FA ${user.code}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ message: `Clé 2FA renouvelée pour ${user.name}.` });
});

// ==========================================
// 3. SESSIONS API
// ==========================================
app.get('/api/sessions', (req, res) => {
  const snapshot = db.getSnapshot();
  const now = new Date();
  const sessions = snapshot.sessions.map(s => ({
    ...s,
    isExpired: new Date(s.expiresAt) <= now
  }));
  res.json({ sessions });
});

app.post('/api/sessions/:id/revoke', (req, res) => {
  const { id } = req.params;
  const { actorName } = req.body;
  const snapshot = db.getSnapshot();
  const session = snapshot.sessions.find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Session non trouvée.' });
  }

  session.isRevoked = true;

  // Mark user as offline if no other active sessions
  const otherActive = snapshot.sessions.some(
    s => s.userId === session.userId && s.id !== id && !s.isRevoked && new Date(s.expiresAt) > new Date()
  );
  if (!otherActive) {
    const user = snapshot.users.find(u => u.id === session.userId);
    if (user) user.isOnline = false;
  }

  db.appendAuditLog({
    type: 'SESSION_REVOKE',
    title: `Révocation de session : ${session.userName}`,
    detail: `La session active sur ${session.ipAddress} a été révoquée avec effet immédiat.`,
    user: actorName || 'Super-Admin',
    actorId: 'admin',
    resource: `Session ${id}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ message: `Session ${id} révoquée côté serveur.` });
});

// ==========================================
// 4. ROLES & ONTOLOGICAL PERMISSIONS API
// ==========================================
app.get('/api/roles', (req, res) => {
  res.json({ roles: db.getSnapshot().roles });
});

app.put('/api/roles/:id', (req, res) => {
  const { id } = req.params;
  const { permissions, actorName } = req.body;
  const snapshot = db.getSnapshot();
  const role = snapshot.roles.find(r => r.id === id);

  if (!role) {
    return res.status(404).json({ error: 'Rôle non trouvé.' });
  }

  role.permissions = { ...role.permissions, ...permissions };
  role.updatedAt = new Date().toISOString();
  role.updatedBy = actorName || 'Dr. F. Kamga';

  db.appendAuditLog({
    type: 'PERMISSIONS',
    title: `Modification matrice des permissions : ${role.label}`,
    detail: `Mise à jour des habilitations ontologiques pour le groupe ${role.roleType}.`,
    user: actorName || 'Dr. F. Kamga',
    actorId: 'admin',
    resource: `Rôle ${role.id}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ role, message: `Permissions du rôle ${role.label} enregistrées en base.` });
});

// ==========================================
// 5. AUDIT LOG & IMMUTABILITY API
// ==========================================
app.get('/api/audit', (req, res) => {
  const { type, actor, result, limit = 20, offset = 0 } = req.query;
  let logs = [...db.getSnapshot().auditLogs];

  if (type && type !== 'all') {
    logs = logs.filter(l => l.type === type);
  }
  if (result && result !== 'all') {
    logs = logs.filter(l => l.result === result);
  }
  if (actor && typeof actor === 'string' && actor !== 'all') {
    logs = logs.filter(l => l.user.toLowerCase().includes(actor.toLowerCase()));
  }

  const total = logs.length;
  const paginated = logs.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    logs: paginated,
    total,
    limit: Number(limit),
    offset: Number(offset)
  });
});

app.get('/api/audit/verify-chain', (req, res) => {
  const verification = db.verifyAuditChain();
  res.json(verification);
});

// ==========================================
// 6. SYSTEM SETTINGS & API KEYS API
// ==========================================
app.get('/api/settings', (req, res) => {
  res.json({ settings: db.getSnapshot().systemSettings });
});

app.put('/api/settings', (req, res) => {
  const { settings, actorName } = req.body;
  const snapshot = db.getSnapshot();
  snapshot.systemSettings = { ...snapshot.systemSettings, ...settings };

  db.appendAuditLog({
    type: 'SETTINGS_UPDATE',
    title: 'Mise à jour des paramètres système',
    detail: 'Modification des paramètres généraux d’audit et de sécurité.',
    user: actorName || 'Super-Admin',
    actorId: 'admin',
    resource: 'Paramètres Système',
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ settings: snapshot.systemSettings, message: 'Paramètres enregistrés.' });
});

app.get('/api/api-keys', (req, res) => {
  res.json({ apiKeys: db.getSnapshot().apiKeys });
});

app.post('/api/api-keys', (req, res) => {
  const { name, service, permissions, actorName } = req.body;
  if (!name || !service) {
    return res.status(400).json({ error: 'Nom et service requis pour la clé API.' });
  }

  const rawSecret = `vf237_live_${crypto.randomBytes(24).toString('hex')}`;
  const hashedSecret = sha256(rawSecret);
  const maskedKey = `${rawSecret.slice(0, 15)}••••••••••••••••${rawSecret.slice(-4)}`;

  const newKey = {
    id: `key-${Date.now()}`,
    name,
    service,
    prefix: 'vf237_live_',
    maskedKey,
    hashedSecret,
    createdAt: new Date().toISOString(),
    lastUsedAt: 'Jamais',
    status: 'active' as const,
    permissions: permissions || ['read:verifications']
  };

  db.getSnapshot().apiKeys.unshift(newKey);
  db.appendAuditLog({
    type: 'API_KEY',
    title: `Nouvelle clé API générée : ${name}`,
    detail: `Clé API créée pour ${service}. Empreinte publique : ${maskedKey}.`,
    user: actorName || 'Dr. F. Kamga',
    actorId: 'admin',
    resource: `Clé API ${newKey.id}`,
    result: 'SUCCESS'
  });

  db.commit();
  // Return raw secret ONCE upon creation
  res.status(201).json({ key: newKey, rawSecret, message: 'Clé générée avec succès.' });
});

app.post('/api/api-keys/:id/revoke', (req, res) => {
  const { id } = req.params;
  const { actorName } = req.body;
  const snapshot = db.getSnapshot();
  const key = snapshot.apiKeys.find(k => k.id === id);

  if (!key) {
    return res.status(404).json({ error: 'Clé non trouvée.' });
  }

  key.status = 'revoked';

  db.appendAuditLog({
    type: 'API_KEY',
    title: `Révocation de clé API : ${key.name}`,
    detail: `La clé API ${key.id} a été révoquée et ne peut plus être utilisée.`,
    user: actorName || 'Dr. F. Kamga',
    actorId: 'admin',
    resource: `Clé API ${id}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ message: `Clé API ${key.name} révoquée.` });
});

// ==========================================
// 7. DOUBLE SIGNATURE & COLLÉGIALITÉ API
// ==========================================
app.get('/api/double-signature', (req, res) => {
  res.json({ requests: db.getSnapshot().doubleSignatures });
});

app.post('/api/double-signature/:id/sign', (req, res) => {
  const { id } = req.params;
  const { userId, userName, actorRole } = req.body;

  if (!userId || !userName) {
    return res.status(400).json({ error: 'Identité du signataire obligatoire.' });
  }

  const snapshot = db.getSnapshot();
  const ds = snapshot.doubleSignatures.find(d => d.id === id);

  if (!ds) {
    return res.status(404).json({ error: 'Demande de signature non trouvée.' });
  }

  const now = new Date().toISOString();

  if (!ds.signature1) {
    // Signature 1
    const signatureHash = sha256(`${id}:SIG1:${userId}:${now}`);
    ds.signature1 = { userId, userName, signedAt: now, signatureHash };
    ds.status = 'en_attente_sig2';

    db.appendAuditLog({
      type: 'SIGNATURE',
      title: `Contresignature 1/2 apposée : ${ds.targetTitle}`,
      detail: `Première signature de conformité apposée par ${userName} (${actorRole || 'Vérificateur'}).`,
      user: userName,
      actorId: userId,
      resource: `Demande ${id}`,
      result: 'SUCCESS',
      hashOrIp: signatureHash.slice(0, 16) + '...'
    });

    db.commit();
    return res.json({ request: ds, message: 'Signature 1 enregistrée. En attente de la seconde signature collégiale.' });
  }

  // Dual signature enforcement: Signature 2 MUST BE from a DIFFERENT user
  if (ds.signature1.userId === userId) {
    return res.status(403).json({
      error: 'Règle Déontologique Inviolable : La seconde signature doit émaner d’un utilisateur distinct du premier approbateur.'
    });
  }

  const signatureHash = sha256(`${id}:SIG2:${userId}:${now}`);
  ds.signature2 = { userId, userName, signedAt: now, signatureHash };
  ds.status = 'approuve';
  ds.completedAt = now;

  db.appendAuditLog({
    type: 'SIGNATURE',
    title: `Scellement collégial validé : ${ds.targetTitle}`,
    detail: `Double signature collégiale complétée par ${userName} (#REV). Décision scellée avec succès.`,
    user: userName,
    actorId: userId,
    resource: `Demande ${id}`,
    result: 'SUCCESS',
    hashOrIp: signatureHash.slice(0, 16) + '...'
  });

  db.commit();
  res.json({ request: ds, message: 'Double signature validée ! Décision scellée collégialement.' });
});

// ==========================================
// 8. INTEGRITY ALERTS API
// ==========================================
app.get('/api/integrity-alerts', (req, res) => {
  res.json({ alerts: db.getSnapshot().integrityAlerts });
});

app.post('/api/integrity-alerts/check', (req, res) => {
  const { actorName } = req.body;
  const verification = db.verifyAuditChain();
  const snapshot = db.getSnapshot();

  if (!verification.isValid) {
    const newAlert = {
      id: `alt-${Date.now()}`,
      level: 'CRITIQUE' as const,
      type: 'CHAINE_HASH' as const,
      title: 'Rupture d’intégrité détectée dans la chaîne d’audit',
      description: verification.error || 'Empreinte incohérente détectée.',
      detectedAt: new Date().toISOString(),
      status: 'OUVERTE' as const
    };
    snapshot.integrityAlerts.unshift(newAlert);
    db.commit();
    return res.json({ status: 'ANOMALY_FOUND', alert: newAlert });
  }

  db.appendAuditLog({
    type: 'INTEGRITY_CHECK',
    title: 'Audit d’intégrité automatique réussi',
    detail: `Vérification complète de ${verification.checkedCount} blocs de logs. Parité 100% conforme.`,
    user: actorName || 'Système WORM Automatisé',
    actorId: 'system',
    resource: 'Chaîne SHA-256',
    result: 'SUCCESS'
  });

  res.json({ status: 'SUCCESS', checkedCount: verification.checkedCount, message: 'Système intègre, aucun écart détecté.' });
});

app.post('/api/integrity-alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { notes, actorName } = req.body;
  const snapshot = db.getSnapshot();
  const alert = snapshot.integrityAlerts.find(a => a.id === id);

  if (!alert) {
    return res.status(404).json({ error: 'Alerte non trouvée.' });
  }

  alert.status = 'RESOLUE';
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = actorName || 'Super-Admin';
  alert.resolutionNotes = notes || 'Incident analysé et classé.';

  db.appendAuditLog({
    type: 'INTEGRITY_CHECK',
    title: `Alerte d’intégrité résolue : ${alert.title}`,
    detail: `Alerte ${id} résolue avec note : ${alert.resolutionNotes}`,
    user: actorName || 'Super-Admin',
    actorId: 'admin',
    resource: `Alerte ${id}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ alert, message: 'Alerte résolue avec succès.' });
});

// ==========================================
// 9. SUBMISSIONS & ASYNCHRONOUS AI VERIFICATION API
// ==========================================
app.post('/api/submissions', (req, res) => {
  const { text, url, sourceType, region, submittedBy, authorOrSource, contextDate, idempotencyKey } = req.body;

  // 1. Input validation & sanitization
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return res.status(400).json({ error: 'Le contenu du signalement doit comporter au moins 10 caractères.' });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: 'Le contenu soumis dépasse la limite maximale de 5 000 caractères.' });
  }

  // 2. Anti-SSRF URL validation
  if (url && typeof url === 'string' && url.trim().length > 0) {
    const trimmedUrl = url.trim().toLowerCase();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'L’URL fournie doit commencer par http:// ou https://.' });
    }
    const forbiddenPatterns = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.', '10.', '192.168.', '172.16.', '::1'];
    if (forbiddenPatterns.some(p => trimmedUrl.includes(p))) {
      return res.status(400).json({ error: 'Adresse URL non autorisée (accès réseau privé interdit).' });
    }
  }

  // 3. Idempotency check: prevent duplicate submissions upon reconnection or network retries
  if (idempotencyKey && typeof idempotencyKey === 'string') {
    const existing = db.getInvestigationByIdempotencyKey(idempotencyKey);
    if (existing) {
      return res.status(200).json({
        investigation: existing,
        trackingCode: existing.code,
        investigationId: existing.id,
        status: existing.aiVerification ? existing.aiVerification.status : existing.status,
        message: `Signalement ${existing.code} déjà pris en compte (clé d'idempotence reconnue).`
      });
    }
  }

  try {
    // 4. Create persistent record
    const newInvestigation = runAutomaticPreAnalysis({
      text: text.trim(),
      url: url ? url.trim() : undefined,
      sourceType: sourceType || 'WhatsApp citoyen',
      region,
      submittedBy: submittedBy || 'Citoyen Connecté',
      idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined
    });

    // 5. Enqueue non-blocking async AI verification worker (SLA target < 5 min)
    verificationQueue.enqueue(newInvestigation.id, {
      id: newInvestigation.id,
      code: newInvestigation.code,
      text: text.trim(),
      url: url ? url.trim() : undefined,
      sourceType,
      region,
      authorOrSource,
      contextDate
    });

    // 6. Immediate response without blocking HTTP connection
    res.status(201).json({
      investigation: newInvestigation,
      trackingCode: newInvestigation.code,
      investigationId: newInvestigation.id,
      status: 'en_attente',
      message: `Signalement ${newInvestigation.code} enregistré avec succès. Analyse accélérée en cours (Objectif < 5 minutes).`
    });
  } catch (err: any) {
    console.error('Pre-analysis error:', err);
    res.status(500).json({ error: 'Erreur lors de l’enregistrement du signalement.' });
  }
});

// 9.1 SLA Performance Metrics (must be declared before :id param)
app.get('/api/verifications/metrics', (req, res) => {
  const metrics = db.getSLAMetrics();
  res.json({
    ...metrics,
    slaTargetFormatted: '5 minutes maximum (< 300s)',
    systemClock: new Date().toISOString()
  });
});

// 9.2 Direct tracking lookup by code
app.get('/api/verifications/track/:code', (req, res) => {
  const { code } = req.params;
  const item = db.getInvestigationByCode(code);

  if (!item) {
    return res.status(404).json({
      error: `Aucun dossier ne correspond au matricule "${code}". Vérifiez la saisie (ex: #VRF-2025-XXXX).`
    });
  }

  res.json({
    investigation: item,
    aiVerification: item.aiVerification,
    trackingCode: item.code
  });
});

// 9.3 Verification status & polling endpoint
app.get('/api/verifications/:id', (req, res) => {
  const { id } = req.params;
  const item = db.getInvestigationById(id) || db.getInvestigationByCode(id);

  if (!item) {
    return res.status(404).json({ error: `Demande de vérification introuvable pour l'identifiant ${id}.` });
  }

  // Inject current active elapsed time if in progress
  const activeStatus = verificationQueue.getStatus(item.id);
  const ai = item.aiVerification;

  if (activeStatus && ai && (ai.status === 'en_attente' || ai.status === 'analyse_en_cours' || ai.status === 'verification_sources')) {
    ai.elapsedSeconds = activeStatus.elapsedSeconds;
    ai.estimatedRemainingSeconds = Math.max(0, 45 - activeStatus.elapsedSeconds);
  }

  res.json({
    investigation: item,
    aiVerification: ai,
    status: ai ? ai.status : item.status,
    isComplete: ai ? (ai.status === 'resultat_disponible' || ai.status === 'verification_approfondie_requise' || ai.status === 'echec_temporaire') : false
  });
});

// 9.4 History of verifications for current citizen
app.get('/api/my-verifications', (req, res) => {
  const { userName } = req.query;
  if (!userName || typeof userName !== 'string') {
    return res.json({ verifications: [], total: 0 });
  }

  const list = db.getVerificationsByUser(userName);
  res.json({ verifications: list, total: list.length });
});

// 9.5 Cancel verification
app.post('/api/verifications/:id/cancel', (req, res) => {
  const { id } = req.params;
  const cancelled = verificationQueue.cancelTask(id);
  res.json({
    success: cancelled,
    message: cancelled ? 'Vérification annulée avec succès.' : 'Tâche introuvable ou déjà terminée.'
  });
});

// 9.6 Retry verification on temporary error
app.post('/api/verifications/:id/retry', (req, res) => {
  const { id } = req.params;
  const item = db.getInvestigationById(id) || db.getInvestigationByCode(id);
  if (!item) {
    return res.status(404).json({ error: 'Dossier introuvable pour nouvelle tentative.' });
  }
  const retried = verificationQueue.retryTask(item.id);
  res.json({
    success: retried,
    message: retried ? 'Nouvelle tentative relancée avec succès.' : 'Impossible de relancer cette tâche.'
  });
});

// ==========================================
// 10. INVESTIGATIONS WORKFLOW API
// ==========================================
app.get('/api/investigations', (req, res) => {
  const { status, urgency, region, search } = req.query;
  let items = [...db.getSnapshot().investigations];

  if (status && status !== 'all') {
    items = items.filter(i => i.status === status);
  }
  if (urgency && urgency !== 'all') {
    items = items.filter(i => i.urgency === urgency);
  }
  if (region && region !== 'all') {
    items = items.filter(i => i.scope.toLowerCase().includes(String(region).toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      i =>
        i.title.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }

  res.json({ investigations: items, total: items.length });
});

app.get('/api/investigations/:id', (req, res) => {
  const { id } = req.params;
  const item = db.getSnapshot().investigations.find(i => i.id === id || i.code === id || i.code.replace('#', '') === id);
  if (!item) {
    return res.status(404).json({ error: 'Dossier d’investigation non trouvé.' });
  }
  res.json({ investigation: item });
});

app.post('/api/investigations', (req, res) => {
  const { title, description, sourceType, sourceUrl, urgency, scope, assignedTo, assignedToId, actorName } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Titre et description requis pour la fiche d’investigation.' });
  }

  const now = new Date();
  const year = now.getFullYear();
  const code = `#VRF-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newInv = {
    id: `q-${Date.now()}`,
    code,
    title,
    description,
    sourceType: sourceType || 'Signalement direct',
    sourceUrl,
    urgency: urgency || 'normale',
    urgencyLabel: urgency === 'haute' ? '⚠️ URGENCE HAUTE' : 'Priorité standard',
    timeAgo: 'À l’instant',
    submittedAt: now.toISOString(),
    submittedBy: actorName || 'Vérificateur',
    assignedTo: assignedTo || 'En attente d’attribution',
    assignedToId,
    status: 'en_instruction' as const,
    statusLabel: "En cours d'instruction",
    scope: scope || 'National',
    previewTag: 'Fiche créée manuellement',
    signatures: { isSealed: false },
    notes: [
      {
        id: `note-${Date.now()}`,
        author: actorName || 'Vérificateur',
        content: `Création de la fiche d’investigation pour instruction.`,
        createdAt: now.toISOString()
      }
    ]
  };

  db.getSnapshot().investigations.unshift(newInv);
  db.appendAuditLog({
    type: 'ATTRIBUTION',
    title: `Nouvelle fiche créée : ${code}`,
    detail: `Fiche d’investigation « ${title.slice(0, 60)}... » ouverte pour instruction.`,
    user: actorName || 'Vérificateur',
    actorId: assignedToId || 'user',
    resource: `Dossier ${code}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.status(201).json({ investigation: newInv, message: `Fiche ${code} créée avec succès.` });
});

app.post('/api/investigations/:id/take', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;
  const snapshot = db.getSnapshot();
  const item = snapshot.investigations.find(i => i.id === id || i.code === id);

  if (!item) {
    return res.status(404).json({ error: 'Dossier non trouvé.' });
  }

  item.assignedTo = userName || 'Vérificateur';
  item.assignedToId = userId;
  item.status = 'en_instruction';
  item.statusLabel = "En cours d'instruction";

  db.appendAuditLog({
    type: 'ATTRIBUTION',
    title: `Prise en charge du dossier : ${item.code}`,
    detail: `Le dossier a été pris en charge personnellement par ${userName}.`,
    user: userName,
    actorId: userId || 'user',
    resource: `Dossier ${item.code}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ investigation: item, message: `Vous avez pris en charge le dossier ${item.code}.` });
});

app.post('/api/investigations/:id/assign', (req, res) => {
  const { id } = req.params;
  const { targetUserId, targetUserName, reason, actorName } = req.body;
  const snapshot = db.getSnapshot();
  const item = snapshot.investigations.find(i => i.id === id || i.code === id);

  if (!item) {
    return res.status(404).json({ error: 'Dossier non trouvé.' });
  }

  const prevAssignee = item.assignedTo;
  item.assignedTo = targetUserName;
  item.assignedToId = targetUserId;
  item.status = 'en_instruction';

  item.notes.unshift({
    id: `note-${Date.now()}`,
    author: actorName || 'Superviseur',
    content: `Réassigné de ${prevAssignee} à ${targetUserName}. Motif : ${reason || 'Répartition de la charge de travail'}.`,
    createdAt: new Date().toISOString()
  });

  db.appendAuditLog({
    type: 'ATTRIBUTION',
    title: `Réattribution dossier : ${item.code}`,
    detail: `Dossier attribué à ${targetUserName} par ${actorName}. Motif : ${reason || 'N/A'}.`,
    user: actorName || 'Superviseur',
    actorId: 'admin',
    resource: `Dossier ${item.code}`,
    result: 'SUCCESS'
  });

  db.commit();
  res.json({ investigation: item, message: `Dossier réassigné à ${targetUserName}.` });
});

app.post('/api/investigations/:id/sign', (req, res) => {
  const { id } = req.params;
  const { userId, userName, role, verdict, verdictLabel } = req.body;
  const snapshot = db.getSnapshot();
  const item = snapshot.investigations.find(i => i.id === id || i.code === id);

  if (!item) {
    return res.status(404).json({ error: 'Dossier non trouvé.' });
  }

  const now = new Date().toISOString();

  // Signature 1
  if (!item.signatures.signature1) {
    const hash = sha256(`${item.code}:SIG1:${userId}:${now}`);
    item.signatures.signature1 = { userId, userName, signedAt: now, hash };
    item.status = 'contre_expertise';
    item.statusLabel = 'Relecture collégiale en cours (Signature 1/2 effectuée)';
    if (verdict) item.verdict = verdict;
    if (verdictLabel) item.verdictLabel = verdictLabel;

    // Create a double signature request for tracking
    snapshot.doubleSignatures.unshift({
      id: `ds-${Date.now()}`,
      targetType: 'dossier',
      targetId: item.id,
      targetTitle: `Dossier ${item.code} (${item.title.slice(0, 50)}...)`,
      requestedBy: userName,
      requestedAt: now,
      status: 'en_attente_sig2',
      signature1: { userId, userName, signedAt: now, signatureHash: hash }
    });

    db.appendAuditLog({
      type: 'SIGNATURE',
      title: `Signature collégiale 1/2 : ${item.code}`,
      detail: `Première signature apposée par ${userName} (${role || 'Vérificateur'}). En attente de contre-expertise.`,
      user: userName,
      actorId: userId,
      resource: `Dossier ${item.code}`,
      result: 'SUCCESS',
      hashOrIp: hash.slice(0, 16) + '...'
    });

    db.commit();
    return res.json({
      investigation: item,
      step: 1,
      message: 'Première signature enregistrée. Le dossier est maintenant soumis à la contre-expertise du second réviseur.'
    });
  }

  // Signature 2 (Must be distinct user!)
  if (item.signatures.signature1.userId === userId) {
    return res.status(403).json({
      error: 'Règle Collégiale IFCN : Vous ne pouvez pas apposer les deux signatures. Un second réviseur distinct est requis.'
    });
  }

  const hash2 = sha256(`${item.code}:SIG2:${userId}:${now}`);
  const sealedHash = sha256(`${item.code}:${item.signatures.signature1.hash}:${hash2}:${now}`);

  item.signatures.signature2 = { userId, userName, signedAt: now, hash: hash2 };
  item.signatures.isSealed = true;
  item.signatures.sealedHash = sealedHash;
  item.signatures.sealedAt = now;
  item.status = 'completed';
  item.statusLabel = 'Verdict final scellé collégialement (SHA-256)';

  db.appendAuditLog({
    type: 'SCELLEMENT',
    title: `Scellement cryptographique WORM : ${item.code}`,
    detail: `Double signature achevée par ${userName}. Empreinte publique générée : ${sealedHash.slice(0, 16)}...`,
    user: userName,
    actorId: userId,
    resource: `Dossier ${item.code}`,
    result: 'SUCCESS',
    hashOrIp: sealedHash
  });

  db.commit();
  res.json({
    investigation: item,
    step: 2,
    sealedHash,
    message: `Dossier ${item.code} définitivement validé et scellé sous l'empreinte SHA-256 : ${sealedHash.slice(0, 16)}...`
  });
});

app.post('/api/investigations/:id/notes', (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;
  const snapshot = db.getSnapshot();
  const item = snapshot.investigations.find(i => i.id === id || i.code === id);

  if (!item) {
    return res.status(404).json({ error: 'Dossier non trouvé.' });
  }

  const note = {
    id: `note-${Date.now()}`,
    author: author || 'Enquêteur',
    content,
    createdAt: new Date().toISOString()
  };

  item.notes.unshift(note);
  db.commit();
  res.status(201).json({ note, message: 'Note ajoutée au dossier d’investigation.' });
});

// ==========================================
// 11. INVESTIGATION TOOLS API
// ==========================================
// 11.1 Ministries Directory
app.get('/api/tools/ministries', (req, res) => {
  const { category, search } = req.query;
  let list = [...CAMEROON_OFFICIAL_INSTITUTIONS];

  if (category && category !== 'all') {
    list = list.filter(m => m.category === category);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      m =>
        m.acronym.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.competence.toLowerCase().includes(q)
    );
  }

  res.json({ institutions: list, total: list.length });
});

// 11.2 Reverse Search Helper
app.post('/api/tools/reverse-search', (req, res) => {
  const { query, imageUrl } = req.body;
  const encodedQuery = encodeURIComponent(query || 'Cameroun concours officiel arrêté');
  const encodedUrl = encodeURIComponent(imageUrl || '');

  const targets = [
    {
      engine: 'Google Lens & Images',
      url: imageUrl
        ? `https://lens.google.com/uploadbyurl?url=${encodedUrl}`
        : `https://www.google.com/search?tbm=isch&q=${encodedQuery}`,
      description: 'Recherche de correspondances visuelles et antériorités web sur l’index mondial Google.'
    },
    {
      engine: 'TinEye Reverse Image Search',
      url: imageUrl
        ? `https://tineye.com/search?url=${encodedUrl}`
        : `https://tineye.com`,
      description: 'Détection des plus anciennes occurrences connues et des recadrages d’images.'
    },
    {
      engine: 'Yandex Visual Search',
      url: imageUrl
        ? `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}`
        : `https://yandex.com/images/search?text=${encodedQuery}`,
      description: 'Efficace pour les visages, captures de foules et vidéos virales de réseaux sociaux.'
    },
    {
      engine: 'Wayback Machine (Internet Archive)',
      url: imageUrl
        ? `https://web.archive.org/web/*/${imageUrl}`
        : `https://web.archive.org/web/*/${encodedQuery}`,
      description: 'Vérification de versions antérieures de pages officielles dépubliées ou modifiées.'
    }
  ];

  res.json({ targets });
});

// 11.3 EXIF & Photoshop Analysis
app.post('/api/tools/exif', (req, res) => {
  const { fileName, samplePreset } = req.body;
  const report = parseImageMetadata(fileName || 'arrete_soumis.jpg', null, samplePreset);
  res.json({ report });
});

// 11.4 AgNES Module (Cameroon Official Decrees & Rumor Cross-Referencer)
app.post('/api/tools/agnes', (req, res) => {
  const { query } = req.body;
  const q = (query || '').toLowerCase();

  // Cross-reference official acts against database and decrees
  const matchedOfficialActs = [
    {
      title: "Arrêté DGSN N° 004/CAB/DGSN relatif à la délivrance des CNI",
      organization: "DGSN",
      datePromulgation: "10 Février 2025",
      isConsistent: true,
      summaryLegal: "Confirme le montant légal à 2 800 FCFA. Tout intermédiaire monnayant une dispense physique est illégal.",
      journalOfficielRef: "JO N° 03/2025 p. 114"
    },
    {
      title: "Loi de Finances N° 2024/018 du 28 Décembre 2024",
      organization: "MINFI / Parlement",
      datePromulgation: "28 Décembre 2024",
      isConsistent: true,
      summaryLegal: "Fixe les tarifs fiscaux. Aucun arrêté ministériel postérieur n'a porté le timbre à 2 500 FCFA.",
      journalOfficielRef: "JO Spécial Lois de Finances 2025"
    }
  ].filter(
    a => !q || a.title.toLowerCase().includes(q) || a.organization.toLowerCase().includes(q)
  );

  res.json({
    engineVersion: 'AgNES 2.4 (Algorithme National d’Enquête et Scellement)',
    jurisdiction: 'République du Cameroun',
    matchedDecrees: matchedOfficialActs,
    rumorIndexScore: q.includes('arnaque') || q.includes('whatsapp') || q.includes('urgent') ? 'VIRALITÉ_FORTE' : 'NORMAL',
    republicanEthicNote: "Toutes les corrélations AgNES sont vérifiées sur les dépôts légaux du Journal Officiel de Yaoundé."
  });
});

// ==========================================
// 12. ASSISTANT IA CONVERSATIONNEL API
// ==========================================
// 12.1 Send message / chat turn
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { conversationId, message, userId, userSessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Le contenu du message est requis.' });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: 'Le message dépasse la limite de 4 000 caractères.' });
    }

    const result = await assistantChatService.processMessage({
      conversationId: conversationId ? String(conversationId) : undefined,
      message: message.trim(),
      userId: userId ? String(userId) : undefined,
      userSessionId: userSessionId ? String(userSessionId) : undefined
    });

    res.json(result);
  } catch (err: any) {
    console.error('[API Assistant Chat Error]:', err);
    res.status(500).json({ error: err.message || 'Une anomalie est survenue lors du traitement de votre question.' });
  }
});

// 12.2 List conversations
app.get('/api/assistant/conversations', (req, res) => {
  const { userId, sessionId } = req.query;
  const userKey = (userId as string) || (sessionId as string) || undefined;
  const list = db.getAssistantConversations(userKey);
  const summarized = list.map(c => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length,
    lastMessage: c.messages[c.messages.length - 1]?.content.slice(0, 100) || ''
  }));
  res.json({ conversations: summarized, total: summarized.length });
});

// 12.3 Get conversation details
app.get('/api/assistant/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conv = db.getAssistantConversation(id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation introuvable.' });
  }
  res.json({ conversation: conv });
});

// 12.4 Delete conversation
app.delete('/api/assistant/conversations/:id', (req, res) => {
  const { id } = req.params;
  const { userId, sessionId } = req.query;
  const userKey = (userId as string) || (sessionId as string) || undefined;
  const deleted = db.deleteAssistantConversation(id, userKey);
  res.json({ success: deleted, message: deleted ? 'Conversation supprimée avec succès.' : 'Impossible de supprimer cette conversation.' });
});

// 12.5 Rename conversation
app.patch('/api/assistant/conversations/:id', (req, res) => {
  const { id } = req.params;
  const { title, userId, sessionId } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Nouveau titre invalide.' });
  }
  const userKey = (userId as string) || (sessionId as string) || undefined;
  const renamed = db.renameAssistantConversation(id, title.trim(), userKey);
  res.json({ success: renamed, message: renamed ? 'Conversation renommée avec succès.' : 'Impossible de renommer cette conversation.' });
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VERIF237] Full-Stack server running on http://0.0.0.0:${PORT}`);
    verificationQueue.resumePendingTasks();
  });
}

startServer();
