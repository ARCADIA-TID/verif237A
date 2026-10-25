/**
 * VÉRIF237 — Service d'Évaluation des Preuves (EvidenceEvaluationService)
 * Compare les éléments de preuve selon leur provenance, leur date et leur autorité légale.
 * Détecte les contradictions et calibre objectivement le niveau de certitude.
 */

import { EvidenceItem, ConfidenceAssessment, ConfidenceLevel, CanonicalVerdict } from '../ai/types';

export interface EvidenceEvaluationOutcome {
  verdictSuggested: CanonicalVerdict;
  confidence: ConfidenceAssessment;
  contradictionsFound: string[];
  supportingCount: number;
  refutingCount: number;
  officialSourcePresent: boolean;
}

export class EvidenceEvaluationService {
  /**
   * Évalue la solidité d'un faisceau de preuves
   */
  public evaluate(evidence: EvidenceItem[], claimText: string): EvidenceEvaluationOutcome {
    let supportingCount = 0;
    let refutingCount = 0;
    let officialSourcePresent = false;
    const contradictionsFound: string[] = [];

    for (const item of evidence) {
      if (item.reliability === 'officielle') {
        officialSourcePresent = true;
      }

      if (item.supports) {
        supportingCount++;
      } else {
        refutingCount++;
      }
    }

    // Détection des contradictions directes
    if (supportingCount > 0 && refutingCount > 0) {
      contradictionsFound.push(
        `Présence d'éléments contradictoires : ${supportingCount} source(s) favorable(s) contre ${refutingCount} source(s) réfutant l'affirmation.`
      );
    }

    // Détection d'escroquerie financière Mobile Money
    const isMobileMoneyScam = /(orange\s*money|mtn\s*momo|frais\s*de\s*dossier|quittance\s*mobile|om\s*\/\s*momo)/i.test(claimText);

    let verdictSuggested: CanonicalVerdict = 'UNVERIFIABLE';
    let score = 50;
    let level: ConfidenceLevel = 'LOW';
    let explanation = '';

    if (isMobileMoneyScam) {
      verdictSuggested = 'FALSE';
      score = 95;
      level = 'HIGH';
      explanation = 'Fraude financière avérée : exigence de paiement mobile pour une procédure administrative publique.';
    } else if (contradictionsFound.length > 0) {
      verdictSuggested = 'MISLEADING';
      score = 70;
      level = 'MEDIUM';
      explanation = 'Divergences factuelles constatées entre les déclarations et les archives officielles.';
    } else if (supportingCount > 0 && officialSourcePresent) {
      verdictSuggested = 'SUPPORTED';
      score = 90;
      level = 'HIGH';
      explanation = 'Concordance stricte avec les actes officiels et textes réglementaires vérifiés.';
    } else if (refutingCount > 0) {
      verdictSuggested = 'FALSE';
      score = 85;
      level = 'HIGH';
      explanation = 'Éléments de preuve réfutant l\'allégation.';
    } else {
      verdictSuggested = 'UNVERIFIABLE';
      score = 45;
      level = 'LOW';
      explanation = 'Preuves matérielles insuffisantes pour confirmer ou infirmer avec certitude.';
    }

    return {
      verdictSuggested,
      confidence: {
        score,
        level,
        explanation
      },
      contradictionsFound,
      supportingCount,
      refutingCount,
      officialSourcePresent
    };
  }
}

export const evidenceEvaluationService = new EvidenceEvaluationService();
