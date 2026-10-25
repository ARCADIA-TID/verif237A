import fs from 'fs';
import path from 'path';

export interface TextAuditLogParams {
  actorId?: string;
  userRole?: string;
  eventType: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'WARNING';
  resourceId?: string;
  anomalyCategory?: string;
  correlationId?: string;
  detailSummary: string;
}

const AUDIT_FILE_PATH = path.resolve(process.cwd(), '.data', 'verif237_audit.txt');
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB rotation

// Pseudonymize user ID for privacy preservation
function pseudonymizeActor(id?: string): string {
  if (!id) return 'ACTOR_ANONYMOUS';
  if (id === 'system') return 'SYSTEM_DAEMON';
  // Return masked hash or truncated identifier
  return `USR-${id.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;
}

// Ensure sensitive words are scrubbed
function sanitizeDetail(detail: string): string {
  return detail
    .replace(/(password|pwd|secret|token|bearer|key|jwt)=([^&\s]+)/gi, '$1=***REDACTED***')
    .replace(/(vf237_[a-zA-Z0-9_]{10,})/gi, '***REDACTED_KEY***')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => {
      const parts = match.split('@');
      return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    });
}

export function writeTextAuditLog(params: TextAuditLogParams): void {
  try {
    const dir = path.dirname(AUDIT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Check file rotation
    if (fs.existsSync(AUDIT_FILE_PATH)) {
      const stats = fs.statSync(AUDIT_FILE_PATH);
      if (stats.size > MAX_FILE_SIZE_BYTES) {
        const rotatedPath = path.resolve(dir, `verif237_audit_${Date.now()}.bak.txt`);
        fs.renameSync(AUDIT_FILE_PATH, rotatedPath);
      }
    }

    const timestamp = new Date().toISOString();
    const pseudoActor = pseudonymizeActor(params.actorId);
    const role = (params.userRole || 'VISITOR').toUpperCase();
    const eventType = params.eventType.toUpperCase();
    const result = params.result.toUpperCase();
    const resource = params.resourceId || 'GLOBAL';
    const anomaly = params.anomalyCategory || 'NONE';
    const correlation = params.correlationId || `corr-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanDetail = sanitizeDetail(params.detailSummary || '');

    // Formatted structured log line
    const logLine = `[${timestamp}] | ACTOR: ${pseudoActor} | ROLE: ${role} | EVENT: ${eventType} | RESULT: ${result} | RESOURCE: ${resource} | ANOMALY: ${anomaly} | CORR: ${correlation} | MSG: ${cleanDetail}\n`;

    fs.appendFileSync(AUDIT_FILE_PATH, logLine, 'utf-8');
  } catch (err) {
    console.error('Failed to append to text audit log:', err);
  }
}

export function readTextAuditLog(maxLines = 100): string[] {
  try {
    if (!fs.existsSync(AUDIT_FILE_PATH)) {
      return ['[LOG_INIT] Registre de traçabilité verif237_audit.txt initialisé. Aucun événement antérieur.'];
    }
    const content = fs.readFileSync(AUDIT_FILE_PATH, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    return lines.slice(-maxLines).reverse();
  } catch (err) {
    return [`Erreur lors de la lecture du journal texte : ${err}`];
  }
}
