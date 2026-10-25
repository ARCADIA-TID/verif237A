/**
 * VÉRIF237 — Service de Recherche dans la Base Interne (InternalKnowledgeService)
 * Interroge les enquêtes archivées, les vérifications antérieures et le répertoire
 * des 37 ministères camerounais en conservant rigoureusement la traçabilité des métadonnées.
 */

import { db } from '../db';
import { CAMEROON_OFFICIAL_INSTITUTIONS } from '../ministriesData';
import { EvidenceItem } from '../ai/types';

export interface InternalSearchResult {
  query: string;
  matchedInvestigations: Array<{
    id: string;
    code: string;
    title: string;
    verdict?: string;
    submittedAt: string;
    isSealed: boolean;
  }>;
  matchedInstitutions: Array<{
    acronym: string;
    fullName: string;
    officialWebsite: string;
  }>;
  evidenceItems: EvidenceItem[];
}

export class InternalKnowledgeService {
  /**
   * Recherche de similarité et de concordance dans la base interne de Vérif237
   */
  public async searchInternalKnowledge(claimText: string): Promise<InternalSearchResult> {
    const textLower = claimText.toLowerCase();
    const words = textLower
      .split(/\s+/)
      .map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ''))
      .filter(w => w.length >= 4);

    const snapshot = db.getSnapshot();
    const evidenceItems: EvidenceItem[] = [];

    // 1. Recherche parmi les dossiers d'investigation existants
    const matchedInvestigations: InternalSearchResult['matchedInvestigations'] = [];

    for (const inv of snapshot.investigations) {
      const invTitleLower = (inv.title || '').toLowerCase();
      const invDescLower = (inv.description || '').toLowerCase();

      let matchScore = 0;
      for (const w of words) {
        if (invTitleLower && invTitleLower.includes(w)) matchScore += 2;
        if (invDescLower && invDescLower.includes(w)) matchScore += 1;
      }

      if (matchScore >= 3) {
        matchedInvestigations.push({
          id: inv.id,
          code: inv.code,
          title: inv.title || 'Dossier sans titre',
          verdict: inv.verdict,
          submittedAt: inv.submittedAt || new Date().toISOString(),
          isSealed: Boolean(inv.signatures?.isSealed)
        });

        // Convertir en élément de preuve interne
        if (inv.verdict) {
          evidenceItems.push({
            claim: `Antécédent répertorié : ${inv.title || inv.code}`,
            supports: inv.verdict === 'VRAI',
            sourceTitle: `Dossier d'archive VÉRIF237 (${inv.code})`,
            sourceUrl: `https://verif237.cm/dossier/${inv.code}`,
            excerpt: (inv.description || inv.title || '').slice(0, 200),
            date: (inv.submittedAt || new Date().toISOString()).split('T')[0],
            reliability: inv.signatures?.isSealed ? 'officielle' : 'reference_documentaire'
          });
        }
      }
    }

    // 2. Recherche parmi les institutions officielles camerounaises
    const matchedInstitutions: InternalSearchResult['matchedInstitutions'] = [];

    for (const inst of CAMEROON_OFFICIAL_INSTITUTIONS) {
      const acronymMatch = inst.acronym.length >= 3 && new RegExp(`\\b${inst.acronym}\\b`, 'i').test(claimText);
      const nameMatch = inst.fullName.toLowerCase().split(' ').some(part => part.length >= 5 && textLower.includes(part));

      if (acronymMatch || nameMatch) {
        matchedInstitutions.push({
          acronym: inst.acronym,
          fullName: inst.fullName,
          officialWebsite: inst.officialWebsite
        });

        evidenceItems.push({
          claim: `Tutelle institutionnelle identifiée : ${inst.fullName} (${inst.acronym})`,
          supports: true,
          sourceTitle: `Répertoire Officiel de l'État du Cameroun — ${inst.acronym}`,
          sourceUrl: inst.officialWebsite,
          excerpt: inst.competence || `Organisme public compétent : ${inst.fullName}`,
          reliability: 'officielle'
        });
      }
    }

    return {
      query: claimText,
      matchedInvestigations: matchedInvestigations.slice(0, 5),
      matchedInstitutions: matchedInstitutions.slice(0, 3),
      evidenceItems
    };
  }
}

export const internalKnowledgeService = new InternalKnowledgeService();
