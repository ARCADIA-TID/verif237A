import React, { useState, useEffect } from 'react';
import { NavPage } from '../types';
import { LOGO_URL } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

interface AboutViewProps {
  setCurrentPage: (page: NavPage) => void;
  onOpenSuggestModal?: () => void;
  initialSection?: 'a-propos' | 'charte-ethique' | 'guide-pratique';
}

export const AboutView: React.FC<AboutViewProps> = ({
  setCurrentPage,
  onOpenSuggestModal,
  initialSection = 'a-propos'
}) => {
  const { isAuthenticated, setRedirectAfterLogin } = useAuth();
  const { lang, t } = useI18n();

  const [activeTab, setActiveTab] = useState<'a-propos' | 'charte-ethique' | 'guide-pratique'>(initialSection);
  const [rectificationModalOpen, setRectificationModalOpen] = useState(false);
  const [rectificationSent, setRectificationSent] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Check window hash on mount for smooth navigation
  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash === 'charte' || hash === 'charte-ethique' || hash === 'deontologie') {
      setActiveTab('charte-ethique');
      const el = document.getElementById('charte-ethique');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === 'guide' || hash === 'guide-pratique' || hash === 'tutoriel') {
      setActiveTab('guide-pratique');
      const el = document.getElementById('guide-pratique');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === 'presentation' || hash === 'a-propos') {
      setActiveTab('a-propos');
      const el = document.getElementById('a-propos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToSection = (sectionId: 'a-propos' | 'charte-ethique' | 'guide-pratique') => {
    setActiveTab(sectionId);
    try {
      window.history.replaceState(null, '', `#${sectionId}`);
    } catch {
      // ignore in iframes
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90; // offset for sticky header and nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleStartVerification = () => {
    if (isAuthenticated) {
      setCurrentPage('verifier');
    } else {
      setRedirectAfterLogin('verifier');
      setCurrentPage('auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors pb-16">
      
      {/* 1. HERO HEADER */}
      <div className="relative bg-gradient-to-b from-[#004732]/10 via-slate-50 to-transparent dark:from-emerald-950/40 dark:via-slate-950 dark:to-slate-950 pt-10 pb-8 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <button onClick={() => setCurrentPage('accueil')} className="hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer">
              {t('nav.home')}
            </button>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">À propos</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200 dark:border-emerald-800">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Observatoire Citoyen & Républicain • Cameroun
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
                À propos de Vérif 237
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Présentation complète de notre observatoire civique, de notre charte d'éthique républicaine et du guide pratique d'utilisation de la plateforme.
              </p>
            </div>

            {/* Quick Republic Badge */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 shrink-0">
              <img
                src={LOGO_URL}
                alt="Logo Vérif 237"
                className="w-14 h-14 object-contain"
              />
              <div className="text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white">Vérif 237</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  Mandat d'intérêt public
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  « Paix - Travail - Patrie »
                </div>
              </div>
            </div>
          </div>

          {/* Sticky-like Internal Table of Contents Nav Tabs */}
          <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">toc</span>
              Table des matières & Accès direct :
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => scrollToSection('a-propos')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'a-propos'
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">info</span>
                <span>Section 1 : Présentation & Mission</span>
              </button>

              <button
                onClick={() => scrollToSection('charte-ethique')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'charte-ethique'
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">balance</span>
                <span>Section 2 : Charte éthique</span>
              </button>

              <button
                onClick={() => scrollToSection('guide-pratique')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'guide-pratique'
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>Section 3 : Guide pratique</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-16">

        {/* =========================================================================
            SECTION 1 : À PROPOS DE VÉRIF 237 (Ordre imposé : Section 1)
           ========================================================================= */}
        <section id="a-propos" className="scroll-mt-24 space-y-8 animate-fade-in">
          
          {/* Section Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Section 1 : À propos de Verif237
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Mission, contexte citoyen camerounais et engagement public.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
              CIVIC TECH 237
            </span>
          </div>

          {/* 1.1 Présentation Générale */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">flag</span>
              Présentation générale de la plateforme
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              L'observatoire civique au service de la vérité des faits au Cameroun
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Vérif 237</strong> est une plateforme civique indépendante d'intérêt général conçue par une communauté pluridisciplinaire d'universitaires en droit public, de journalistes d'investigation, d'ingénieurs en cybersécurité et de citoyens veilleurs camerounais.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ancrée dans la réalité institutionnelle et sociale des <strong>dix régions de la République du Cameroun</strong> (Centre, Littoral, Ouest, Nord, Extrême-Nord, Adamaoua, Nord-Ouest, Sud-Ouest, Sud, Est) ainsi qu'auprès de la diaspora, la plateforme agit comme un rempart contre les manipulations informationnelles et une passerelle transparente vers les actes officiels de l'État.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-emerald-600 text-base">public</span>
                  100% Gratuit & Libre
                </div>
                <div className="text-[11px] text-slate-500">
                  Aucun frais, aucun abonnement, aucune publicité marchande : un accès universel garanti à tout citoyen.
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-blue-600 text-base">translate</span>
                  Bilinguisme Constitutionnel
                </div>
                <div className="text-[11px] text-slate-500">
                  Conformité à l'Article 1er alinéa 3 de la Constitution : interface intégrale en français et anglais.
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-purple-600 text-base">lock</span>
                  Archivage Probant
                </div>
                <div className="text-[11px] text-slate-500">
                  Toutes les enquêtes sont scellées cryptographiquement par empreinte SHA-256 inaltérable.
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Problèmes de désinformation et de sous-information au Cameroun */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
                <span className="material-symbols-outlined text-sm">warning</span>
                Contexte national d'urgence
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Les fléaux de désinformation et de sous-information auxquels répond Vérif 237
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Au Cameroun, l'espace numérique est particulièrement vulnérable à des mécanismes d'intoxication aux conséquences humaines et économiques directes :
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 space-y-2">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">description</span>
                  1. Faux arrêtés ministériels & faux concours
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Prolifération de fausses notes de recrutement (MINFOPRA, MINESUP, Police, Douanes, Armée). Des faussaires imitent les en-têtes officiels et apposent de faux cachets pour tromper des milliers de jeunes diplômés en quête d'emploi.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">currency_exchange</span>
                  2. Escroqueries par paiement mobile (Orange / MTN MoMo)
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Détournement des procédures administratives régulières au profit de numéros privés prétendant encaisser des « frais de quittance » ou des « dépôts de dossiers prioritaires », spoliant l'épargne des familles vulnérables.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">medical_services</span>
                  3. Désinformation sanitaire & paniques virales
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Propagation sur WhatsApp de fausses rumeurs épidémiques, faux remèdes contre le choléra ou le paludisme, et manipulation des communiqués du MINSANTE, mettant en danger la santé des populations.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">visibility_off</span>
                  4. Sous-information & fracture documentaire
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Difficulté persistante pour les citoyens des localités éloignées des centres administratifs d'accéder rapidement aux avis originaux du Journal Officiel et aux barèmes légaux (tarifs réels de la CNI, du passeport, des timbres).
                </p>
              </div>

            </div>
          </div>

          {/* 1.3 Importance de la vérification et Engagement citoyen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                L'impératif des sources primaires fiables
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Face au bruit numérique, la seule protection solide réside dans la confrontation directe avec les sources primaires : éditions papier et numériques de <em>Cameroon Tribune</em>, arrêtés publiés au Journal Officiel, visas des lois et démentis signés des ministères en exercice. Vérif 237 rend ces documents consultables en quelques clics.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined">diversity_3</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Engagement en faveur des citoyens
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Notre engagement est celui d'une technologie civique inclusive : équiper chaque Camerounais des réflexes critiques et des preuves matérielles nécessaires pour ne plus jamais être victime d'une arnaque ou d'une manipulation de l'opinion, favorisant ainsi la cohésion sociale et la paix républicaine.
              </p>
            </div>

          </div>

        </section>


        {/* =========================================================================
            SECTION 2 : CHARTE ÉTHIQUE (Ordre imposé : Section 2)
           ========================================================================= */}
        <section id="charte-ethique" className="scroll-mt-24 space-y-8 animate-fade-in">
          
          {/* Section Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black">
                2
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Section 2 : Charte éthique & Déontologie
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Principes fondamentaux, neutralité, respect des sources, protection des données et droit de réponse.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 hidden sm:inline-block">
              CODE DÉONTOLOGIQUE
            </span>
          </div>

          {/* Présentation du mandat éthique */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-900 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
              <span className="material-symbols-outlined text-sm">gavel</span>
              Pacte de Neutralité Républicaine
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold mb-2">
              Une charte inaltérable au service de la souveraineté citoyenne
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-3xl">
              Vérif 237 opère sous mandat citoyen d'intérêt public. Notre seule allégeance va à l'exactitude des faits, au respect scrupuleux des lois de la République du Cameroun et à la protection des droits de chaque usager.
            </p>
          </div>

          {/* 6 Piliers de la Charte Éthique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pilier 1 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined">balance</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Neutralité, Impartialité & Équidistance Politique
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Aucun membre de notre rédaction, modérateur ou vérificateur ne peut détenir de mandat électif ou de responsabilité active dans un parti politique. Toute allégation ou rumeur fait l'objet de la même rigueur d'instruction, quel que soit le bord politique, communautaire ou confessionnel de son auteur.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined">library_books</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Respect des Faits, des Sources & du Contexte
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nous n'affirmons rien sur la foi d'une simple rumeur d'antenne ou d'une capture isolée. Chaque conclusion s'appuie sur la confrontation directe avec des arrêtés authentiques, les journaux officiels et au minimum <strong>deux sources primaires indépendantes</strong>. Le contexte linguistique et temporel est scrupuleusement rétabli pour éviter tout contresens.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <span className="material-symbols-outlined">shield_person</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Protection des Données Personnelles & Vie Privée
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Conformément à la loi camerounaise n° 2010/012 relative à la cybersécurité et à la cybercriminalité, Vérif 237 garantit l'anonymat absolu des citoyens signalant une infox. Les métadonnées personnelles (adresses IP, numéros WhatsApp des veilleurs) sont purgées dès indexation et les communications sont chiffrées de bout en bout.
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Double Validation Collégiale & Responsabilité
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Aucun dossier ne peut être publié sans la validation conjointe d'un analyste technique OSINT (forensique d'images, métadonnées EXIF, rétro-ingénierie des faux cachets) et d'un juriste réviseur d'État (vérification des textes de lois et arrêtés applicables). Chaque publication porte une empreinte cryptographique SHA-256 inaltérable.
              </p>
            </div>

            {/* Pilier 5 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined">published_with_changes</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5. Gestion des Erreurs & Droit de Réponse (Sous 48h)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Vérif 237 s'engage à la transparence intégrale de ses rectifications. Si une pièce contradictoire nouvelle est transmise par une institution ou un citoyen, notre collège déontologique instruit la demande en urgence sous 48 heures ouvrées. Aucune publication n'est effacée : les rectificatifs sont traçables dans l'historique public.
              </p>
            </div>

            {/* Pilier 6 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <span className="material-symbols-outlined">rule</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                6. Limites de la Vérification & Humilité Déontologique
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Vérif 237 ne fabrique jamais de verdict artificiel. Lorsqu'une information ne dispose pas encore de preuves suffisantes ou que les sources administratives restent muettes, la fiche est expressément catégorisée comme <em>« EN COURS D'INSTRUCTION »</em> ou <em>« NON CONFIRMÉ »</em> avec indication des vérifications en attente.
              </p>
            </div>

          </div>

          {/* Interactive Rectification Request Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                Droit de réponse légal & réexamen contradictoire
              </div>
              <h4 className="text-base sm:text-lg font-bold">
                Vous représentez une institution citée ou détenez un document officiel contradictoire ?
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Déposez une demande de réexamen avec vos références d'actes scannés pour un traitement déontologique sous 48 heures.
              </p>
            </div>
            <button
              onClick={() => setRectificationModalOpen(true)}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              <span>Déposer une demande de réexamen</span>
            </button>
          </div>

        </section>


        {/* =========================================================================
            SECTION 3 : GUIDE PRATIQUE (Ordre imposé : Section 3, dernière position)
           ========================================================================= */}
        <section id="guide-pratique" className="scroll-mt-24 space-y-8 animate-fade-in">
          
          {/* Section Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black">
                3
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Section 3 : Guide pratique d'utilisation
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Comment consulter, soumettre, comprendre les verdicts et interpréter les preuves sur Vérif 237.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 hidden sm:inline-block">
              MODE D'EMPLOI CITOYEN
            </span>
          </div>

          {/* Guide Step-by-Step Cards */}
          <div className="space-y-6">

            {/* Step 1: Comment consulter les informations publiées */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">search</span>
                Étape 1 : Recherche & Consultation
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comment consulter et rechercher les informations publiées
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Toutes les vérifications et tous les actes officiels sont accessibles publiquement et sans restriction :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">manage_search</span>
                    Moteur de recherche unifié
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Saisissez un mot-clé (ex: « CNI », « ENAM », « MINFOPRA »), un extrait de texte WhatsApp ou une référence d'acte dans la barre de recherche globale en haut de l'écran.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">newspaper</span>
                    Onglet Actualités
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Accédez aux enquêtes récentes, aux rumeurs virales déboulonnées et aux alertes d'arnaques en cours de propagation sur les réseaux sociaux camerounais.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">assured_workload</span>
                    Informations officielles
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Consultez les référentiels légaux, arrêtés de concours certifiés, tarifs officiels de délivrance des pièces et procédures administratives validées.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setCurrentPage('actualites')}
                  className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">explore</span>
                  Explorer les dossiers d'actualités
                </button>
                <button
                  onClick={() => setCurrentPage('actes')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">history_edu</span>
                  Consulter les actes officiels
                </button>
              </div>
            </div>

            {/* Step 2: Comment accéder aux détails d'une information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">article</span>
                Étape 2 : Consultation Détaillée
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comment accéder aux détails et éléments de preuve d'une information
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                En cliquant sur une carte d'information, vous accédez à sa fiche complète d'instruction forensique :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-sm">analytics</span>
                    Anatomie de la fiche d'investigation
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4 leading-relaxed">
                    <li><strong>Allégation originale :</strong> Citation textuelle ou capture d'écran du message viral tel que reçu.</li>
                    <li><strong>Verdict motivé :</strong> Explication claire des motifs pour lesquels l'affirmation est vraie, fausse ou trompeuse.</li>
                    <li><strong>Indices de falsification :</strong> Détection des coquilles, faux tampons, signatures scannées ou montages photo.</li>
                    <li><strong>Chronologie des faits :</strong> Évolution temporelle de la propagation de la rumeur et dates des démentis.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">share</span>
                    Partage certifié & Action anti-scam
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4 leading-relaxed">
                    <li><strong>Bouton Partager sur WhatsApp :</strong> Génère un message préformaté avec la synthèse du démenti pour contrer l'intox dans vos groupes.</li>
                    <li><strong>Copie d'empreinte SHA-256 :</strong> Permet de prouver à un tiers l'authenticité de la fiche vérifiée.</li>
                    <li><strong>Export PDF imprimable :</strong> Fiche officielle téléchargeable pour affichage ou archivage administratif.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3: Comment lancer une vérification lorsqu'on est connecté */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">fact_check</span>
                Étape 3 : Soumission & Vérification Citoyenne
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comment lancer une vérification lorsqu'on est connecté
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Tout citoyen inscrit peut soumettre une allégation suspecte pour analyse documentaire :
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Cliquez sur le bouton vert « Vérifier » :</strong> Présent dans la barre supérieure de navigation ou sur la page d'accueil. Si vous n'êtes pas connecté, l'application vous invite à vous connecter avec votre compte citoyen ou l'un des comptes démos mis à disposition.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Remplissez le formulaire de signalement :</strong> Saisissez le texte de l'information suspecte, précisez la plateforme de diffusion (WhatsApp, Facebook, TikTok...) et joignez si possible une capture d'écran ou un PDF.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Traitement assisté par IA hybride & Enquêteurs :</strong> La demande est enregistrée avec un code de suivi immédiat (ex: <code>#VRF-2025-XXXX</code>). Le moteur recherche les preuves dans la base interne officielle et sur le web camerounais à travers le workflow : 
                    <code className="block mt-1 p-1 bg-slate-200 dark:bg-slate-800 font-mono text-[11px] text-emerald-800 dark:text-emerald-300 rounded">
                      RECEIVED → QUEUED → ANALYZING → SEARCHING_SOURCES → EVALUATING_EVIDENCE → COMPLETED
                    </code>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartVerification}
                  className="px-5 py-2.5 bg-[#007953] hover:bg-[#006344] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Lancer une vérification maintenant</span>
                </button>
              </div>
            </div>

            {/* Step 4: Comprendre les résultats, statuts et conclusions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">badge</span>
                Étape 4 : Comprendre les Verdicts & Statuts
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comment comprendre les résultats, les statuts et les conclusions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Vérif 237 utilise une signalétique explicite pour qualifier chaque dossier vérifié sans ambiguïté :
              </p>

              {/* Status Badges Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs">cancel</span>
                    FAUX ET ESCROQUERIE
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    Le document est totalement forgé, usurpé ou contient de fausses informations visant à tromper ou extorquer de l'argent. <strong>Ne pas relayer, ne pas effectuer de paiement mobile.</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    CONFIRMÉ / AUTHENTIQUE
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    L'information émane bien de l'autorité ministérielle ou judiciaire compétente et a été confrontée au Journal Officiel ou au registre de l'institution émettrice.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    TROMPEUR / CONTEXTE DÉTOURNÉ
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    Le document ou la citation repose sur un élément véridique, mais déformé, périmé (ancien arrêté réutilisé des années plus tard) ou manipulé hors de son cadre d'application.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
                    <span className="material-symbols-outlined text-xs">hourglass_top</span>
                    EN COURS D'INSTRUCTION
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    Le dossier a été réceptionné par nos équipes et fait l'objet d'un recoupement contradictoire auprès des services compétents. Le résultat sera mis à jour dès validation.
                  </p>
                </div>

              </div>

              {/* Cryptographic Seal Specimen */}
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs font-mono space-y-2 mt-4">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">fingerprint</span>
                    Garantie d'intégrité cryptographique SHA-256
                  </span>
                  <span className="text-[10px] text-slate-400">Scellement immuable WORM</span>
                </div>
                <div className="text-[11px] text-slate-300 break-all bg-black/50 p-2.5 rounded-lg border border-slate-800">
                  HASH: 4a2b9e67c8f103d15a9901ef5b842ca718b958c234a94bc7d189f30e75a13c9e
                </div>
                <div className="text-[10px] text-slate-400">
                  Cette empreinte garantit qu'aucune conclusion ne peut être altérée a posteriori sans invalider la signature publique de l'observatoire.
                </div>
              </div>
            </div>

            {/* Step 5: Comment interpréter les sources citées et les preuves */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Étape 5 : Interprétation des Preuves
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comment interpréter les sources citées et les éléments de preuve
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Vérif 237 applique une hiérarchie stricte des sources pour étayer chaque conclusion :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    1. Sources primaires d'État
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Arrêtés du Journal Officiel, publications papier de <em>Cameroon Tribune</em>, communiqués signés des ministères sur leurs sites officiels en <code>.gov.cm</code>.
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">science</span>
                    2. Analyse forensique technique
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Analyse des métadonnées EXIF, inversion d'images (Google Lens / TinEye), détection des polices de caractères non conformes aux chartes des ministères.
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="font-bold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">phone_in_talk</span>
                    3. Recoupement direct
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Contact téléphonique direct avec les cellules de communication ministérielles, les préfectures et les délégations régionales concernées.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6: Comment signaler une erreur ou suggérer une information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">campaign</span>
                Étape 6 : Signalement & Droit de Correction
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comment signaler une erreur ou soumettre une pièce à vérifier
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Vérif 237 met à disposition plusieurs canaux directs et sécurisés :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">edit_document</span>
                    Suggérer un acte ou signaler un faux
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    Vous avez identifié un arrêté officiel manquant ou un faux communiqué en circulation ? Utilisez la fenêtre modale de suggestion accessible depuis le bas de chaque page ou le bouton ci-dessous :
                  </p>
                  <button
                    onClick={() => {
                      if (onOpenSuggestModal) onOpenSuggestModal();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">upload_file</span>
                    Ouvrir le formulaire de suggestion
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-sm">balance</span>
                    Demande de réexamen contradictoire
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    Si vous êtes l'auteur ou le représentant d'une entité citée et estimez qu'une erreur factuelle a été commise, déposez un recours avec documents scannés à l'appui pour réexamen sous 48h.
                  </p>
                  <button
                    onClick={() => setRectificationModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">gavel</span>
                    Formuler une demande de réexamen
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Quick FAQ / Autodéfense Reminder */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-sm flex items-center gap-2 text-emerald-300">
                <span className="material-symbols-outlined text-base">psychology</span>
                Une question spécifique sur l'application ?
              </div>
              <p className="text-xs text-slate-300">
                Consultez notre foire aux questions interactive couvrant 12 sujets détaillés sur les faux arrêtés, les quittances du trésor et les méthodes d'enquête.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('faq')}
              className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Consulter la FAQ</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

        </section>

      </div>

      {/* =========================================================================
          MODAL DE DEMANDE DE RÉEXAMEN DÉONTOLOGIQUE
         ========================================================================= */}
      {rectificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">balance</span>
                <h3 className="font-bold text-base">Demande de Réexamen Déontologique</h3>
              </div>
              <button
                onClick={() => setRectificationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {rectificationSent ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">check_circle</span>
                <div className="font-bold text-sm">Demande Transmise au Collège Déontologique</div>
                <div className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Votre recours contradictoire a été enregistré avec accusé de réception. Délai d'instruction garanti : 48 heures ouvrées.
                </div>
                <button
                  onClick={() => {
                    setRectificationSent(false);
                    setRectificationModalOpen(false);
                  }}
                  className="mt-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRectificationSent(true);
                }}
                className="space-y-4 pt-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Référence du dossier contesté (ex: #VRF-237-7729 ou titre de la publication)
                  </label>
                  <input
                    type="text"
                    placeholder="#VRF-237-XXXX"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organisme émetteur ou Qualité de la personne requérante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Direction de la Communication, MINFOPRA / Avocat conseil"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse email institutionnelle pour notification
                  </label>
                  <input
                    type="email"
                    placeholder="contact@ministere.gov.cm"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Motif détaillé de la contestation et pièces probantes contradictoires
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Indiquez le numéro de l'acte au Journal Officiel, la date de parution dans Cameroon Tribune ou la référence du communiqué officiel contredisant l'analyse..."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none resize-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRectificationModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    Transmettre la Requête
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
