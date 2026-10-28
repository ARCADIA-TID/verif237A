-- ====================================================================
-- VÉRIF237 — SCHÉMA RELATIONNEL POSTGRESQL / CLOUD SQL / SUPABASE
-- Plateforme citoyenne camerounaise de vérification & lutte contre la désinformation
-- ====================================================================

-- Extensions recommandées
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. UTILISATEURS ACCRÉDITÉS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64),
    role VARCHAR(128) NOT NULL,
    role_type VARCHAR(64) NOT NULL CHECK (role_type IN ('super-admin', 'reviseur', 'forensique', 'terrain', 'moderateur', 'citoyen')),
    jurisdiction VARCHAR(255) NOT NULL DEFAULT 'National (Yaoundé / Douala)',
    key_habilitation VARCHAR(255) NOT NULL,
    key_habilitation_sub VARCHAR(255),
    security_status VARCHAR(128) DEFAULT 'En attente d’activation 2FA',
    security_detail VARCHAR(255),
    is_online BOOLEAN NOT NULL DEFAULT false,
    avatar_initials VARCHAR(8) NOT NULL,
    avatar_url TEXT,
    sha256_enabled BOOLEAN NOT NULL DEFAULT false,
    needs_2fa_renewal BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(32) NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'suspendu', 'en_attente_2fa')),
    validity_until DATE DEFAULT '2026-12-31',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role_type ON users(role_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. SESSIONS UTILISATEURS
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_revoked, expires_at);

-- 3. RÔLES & MATRICE DE PERMISSIONS ONTOLOGIQUES
CREATE TABLE IF NOT EXISTS role_permissions (
    id VARCHAR(64) PRIMARY KEY,
    role_type VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255)
);

-- 4. JOURNAL D'AUDIT IMMUABLE WORM (CHAÎNE SHA-256)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    log_index BIGSERIAL,
    time VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type VARCHAR(64) NOT NULL CHECK (type IN (
        'AUTH', 'ATTRIBUTION', 'SIGNATURE', 'PERMISSIONS', 'SCELLEMENT',
        'USER_CREATE', 'SESSION_REVOKE', 'SETTINGS_UPDATE', 'INTEGRITY_CHECK', 'API_KEY'
    )),
    title VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    result VARCHAR(32) NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE', 'BLOCKED')),
    extra_meta TEXT,
    correlation_id VARCHAR(64),
    hash_or_ip TEXT,
    previous_hash CHAR(64) NOT NULL,
    hash CHAR(64) NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON audit_logs(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_name);

-- 5. DOSSIERS D'INVESTIGATION ET SIGNALEMENTS CITOYENS
CREATE TABLE IF NOT EXISTS investigations (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_type VARCHAR(128) NOT NULL DEFAULT 'WhatsApp citoyen',
    source_url TEXT,
    urgency VARCHAR(32) NOT NULL DEFAULT 'normale' CHECK (urgency IN ('haute', 'normale', 'faible')),
    urgency_label VARCHAR(128),
    time_ago VARCHAR(64),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_by VARCHAR(255) DEFAULT 'Citoyen Connecté',
    assigned_to VARCHAR(255),
    assigned_to_id VARCHAR(64),
    status VARCHAR(64) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'pre_analysis', 'pending_review', 'en_instruction', 'contre_expertise', 'completed'
    )),
    status_label VARCHAR(255),
    scope VARCHAR(255) DEFAULT 'National',
    preview_image_url TEXT,
    preview_tag VARCHAR(128),
    verdict VARCHAR(64) CHECK (verdict IN ('VRAI', 'FAUX', 'TROMPEUR', 'NON_VERIFIABLE')),
    verdict_label VARCHAR(255),
    pre_analysis JSONB,
    ai_verification JSONB,
    signatures JSONB DEFAULT '{"isSealed": false}'::jsonb,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_urgency ON investigations(urgency);
CREATE INDEX IF NOT EXISTS idx_investigations_submitted_at ON investigations(submitted_at DESC);

-- 6. NOTES COLLÉGIALES DES DOSSIERS
CREATE TABLE IF NOT EXISTS investigation_notes (
    id VARCHAR(64) PRIMARY KEY,
    investigation_id VARCHAR(64) NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigation_notes_inv_id ON investigation_notes(investigation_id);

-- 7. DEMANDES DE DOUBLE SIGNATURE COLLÉGIALE
CREATE TABLE IF NOT EXISTS double_signatures (
    id VARCHAR(64) PRIMARY KEY,
    target_type VARCHAR(64) NOT NULL CHECK (target_type IN ('dossier', 'system_parameter', 'role_elevation', 'purge_cache')),
    target_id VARCHAR(64) NOT NULL,
    target_title VARCHAR(255) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(64) NOT NULL DEFAULT 'en_attente_sig1' CHECK (status IN ('en_attente_sig1', 'en_attente_sig2', 'approuve', 'rejete')),
    signature1 JSONB,
    signature2 JSONB,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_double_signatures_status ON double_signatures(status);

-- 8. ALERTES D'INTÉGRITÉ SYSTÈME
CREATE TABLE IF NOT EXISTS integrity_alerts (
    id VARCHAR(64) PRIMARY KEY,
    level VARCHAR(32) NOT NULL CHECK (level IN ('CRITIQUE', 'AVERTISSEMENT', 'INFO')),
    type VARCHAR(64) NOT NULL CHECK (type IN ('CHAINE_HASH', 'INCOHERENCE_DONNEES', 'ACCES_INTERDIT', 'ALERTE_SESSION')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'OUVERTE' CHECK (status IN ('OUVERTE', 'RESOLUE')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_integrity_alerts_status ON integrity_alerts(status);

-- 9. PARAMÈTRES SYSTÈME & SÉCURITÉ
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    session_timeout_minutes INT NOT NULL DEFAULT 45,
    require_double_signature BOOLEAN NOT NULL DEFAULT true,
    auto_analysis_strictness VARCHAR(32) NOT NULL DEFAULT 'high',
    max_login_attempts INT NOT NULL DEFAULT 3,
    rsa_key_status VARCHAR(64) NOT NULL DEFAULT 'Active (Rotation sous 24j)',
    last_backup_at VARCHAR(64) NOT NULL DEFAULT 'Automatique (WORM Cloud Sync)',
    active_hsm_node VARCHAR(128) NOT NULL DEFAULT 'Node-YDE-01 (Yaoundé CENADI Primary)',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CLÉS D'API & PASSERELLES EXTERNES
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    prefix VARCHAR(32) NOT NULL,
    masked_key VARCHAR(64) NOT NULL,
    hashed_secret CHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at VARCHAR(64) DEFAULT 'Jamais',
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    permissions JSONB NOT NULL DEFAULT '["read:verifications"]'::jsonb
);

-- 11. ASSISTANT IA CONVERSATIONNEL
CREATE TABLE IF NOT EXISTS assistant_conversations (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id VARCHAR(64),
    user_session_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_conv_user ON assistant_conversations(user_id, user_session_id);

CREATE TABLE IF NOT EXISTS assistant_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sources JSONB DEFAULT '[]'::jsonb,
    grounding_search_queries JSONB DEFAULT '[]'::jsonb,
    is_error BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_assistant_msg_conv ON assistant_messages(conversation_id, timestamp);
