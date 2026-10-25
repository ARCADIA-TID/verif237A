import React, { useState, useEffect } from 'react';
import { NavPage, SubmissionReport } from './types';
import { I18nProvider, useI18n } from './context/I18nContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SuggestDocumentModal } from './components/SuggestDocumentModal';
import { PdfExportModal } from './components/PdfExportModal';
import { ConnectivityBanner } from './components/common/ConnectivityBanner';

// Views
import { HomeView } from './views/HomeView';
import { FactCheckingExplorerView } from './views/FactCheckingExplorerView';
import { VerificationDetailView } from './views/VerificationDetailView';
import { OfficialActsView } from './views/OfficialActsView';
import { ReportSubmissionView } from './views/ReportSubmissionView';
import { VerifierModeratorView } from './views/VerifierModeratorView';
import { AdminConsoleView } from './views/AdminConsoleView';
import { CivicAuthView } from './views/CivicAuthView';
import { GovernanceView } from './views/GovernanceView';
import { DesignSystemView } from './views/DesignSystemView';
import { AccessDeniedView } from './views/AccessDeniedView';
import { FAQView } from './views/FAQView';
import { AboutView } from './views/AboutView';
import { AssistantChatView } from './views/AssistantChatView';

function AppContent() {
  const { isAuthenticated, role, setRedirectAfterLogin } = useAuth();
  const { t } = useI18n();

  const [currentPage, setCurrentPage] = useState<NavPage>('accueil');
  const [selectedInfoId, setSelectedInfoId] = useState<string>('dossier-7729');
  const [previousPage, setPreviousPage] = useState<NavPage>('accueil');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('verif237_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('National (Toutes régions)');

  // Modal states
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestModalMode, setSuggestModalMode] = useState<'suggerer' | 'signaler_faux'>('suggerer');
  const [targetDocumentTitle, setTargetDocumentTitle] = useState<string | undefined>(undefined);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalType, setPdfModalType] = useState<'dossier' | 'index_actes'>('dossier');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Sync dark class on html root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('verif237_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('verif237_theme', 'light');
    }
  }, [isDark]);

  // Read URL route on initial load and handle browser back/forward buttons
  useEffect(() => {
    const parseUrlRoute = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const hash = window.location.hash.replace(/^#\/?/, '');
      const routeStr = path || hash;

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('track')) {
        setCurrentPage('verifier');
        return;
      }

      if (routeStr.startsWith('information/')) {
        const id = routeStr.replace('information/', '');
        if (id) {
          setSelectedInfoId(id);
          setCurrentPage('information');
          return;
        }
      }

      if (routeStr === 'actualites' || routeStr === 'dossiers-actus' || routeStr === 'news') {
        setCurrentPage('actualites');
      } else if (routeStr === 'actes') {
        setCurrentPage('actes');
      } else if (routeStr === 'verifier' || routeStr === 'signaler') {
        setCurrentPage('verifier');
      } else if (routeStr === 'auth' || routeStr === 'login') {
        setCurrentPage('auth');
      } else if (routeStr === 'console-admin') {
        setCurrentPage('console-admin');
      } else if (routeStr === 'console-verif') {
        setCurrentPage('console-verif');
      } else if (
        routeStr === 'a-propos' ||
        routeStr === 'about' ||
        routeStr === 'gouvernance' ||
        routeStr === 'charte' ||
        routeStr === 'charte-ethique' ||
        routeStr === 'guides' ||
        routeStr === 'guide' ||
        routeStr === 'guide-pratique'
      ) {
        setCurrentPage('a-propos');
      } else if (routeStr === 'design-system') {
        setCurrentPage('design-system');
      } else if (routeStr === 'faq' || routeStr === 'aide' || routeStr === 'questions') {
        setCurrentPage('faq');
      } else if (routeStr === 'assistant-ia' || routeStr === 'ia') {
        setCurrentPage('assistant-ia');
      } else {
        setCurrentPage('accueil');
      }
    };

    parseUrlRoute();

    const handlePopState = () => {
      parseUrlRoute();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected route navigation handler
  const handlePageChange = (page: NavPage) => {
    // 1. Protection for verification submission (/verifier)
    if (page === 'verifier' && !isAuthenticated) {
      triggerToast(t('verify.auth_required_title'));
      setRedirectAfterLogin('verifier');
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Protection for Admin Console
    if (page === 'console-admin') {
      if (!isAuthenticated) {
        triggerToast('Connexion requise pour accéder à l’administration');
        setRedirectAfterLogin('console-admin');
        setCurrentPage('auth');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (role !== 'admin') {
        setCurrentPage('acces-refuse');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 3. Protection for Verifier Console
    if (page === 'console-verif') {
      if (!isAuthenticated) {
        triggerToast('Connexion requise pour accéder à l’espace modérateur');
        setRedirectAfterLogin('console-verif');
        setCurrentPage('auth');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (role !== 'admin' && role !== 'verificateur') {
        setCurrentPage('acces-refuse');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setPreviousPage(currentPage);
    setCurrentPage(page);

    // Update browser URL
    try {
      const targetUrl = page === 'accueil' ? '/' : `/${page}`;
      window.history.pushState({ page }, '', targetUrl);
    } catch {
      // Ignore in strict iframes
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic route handler for individual information details: /information/:id
  const handleSelectInformation = (id: string) => {
    setPreviousPage(currentPage);
    setSelectedInfoId(id);
    setCurrentPage('information');

    try {
      window.history.pushState({ infoId: id }, '', `/information/${id}`);
    } catch {
      // Ignore
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSuggestModal = (mode: 'suggerer' | 'signaler_faux' = 'suggerer', docTitle?: string) => {
    setSuggestModalMode(mode);
    setTargetDocumentTitle(docTitle);
    setSuggestModalOpen(true);
  };

  const handleOpenPdfModal = (type: 'dossier' | 'index_actes') => {
    setPdfModalType(type);
    setPdfModalOpen(true);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    if (
      query.toLowerCase().includes('cni') ||
      query.toLowerCase().includes('tarif') ||
      query.toLowerCase().includes('examen') ||
      query.toLowerCase().includes('bourse')
    ) {
      handlePageChange('actes');
    } else {
      handlePageChange('actualites');
    }
  };

  const handleReportSubmitSuccess = (report: SubmissionReport) => {
    triggerToast(`Signalement ${report.code} reçu et transmis à la cellule forensique.`);
  };

  return (
    <div className={`min-h-screen flex flex-col font-body transition-colors ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700 border border-slate-700 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive Header */}
      <Header
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isDark={isDark}
        setIsDark={setIsDark}
        onRequireAuthToVerify={() => triggerToast(t('verify.auth_required_title'))}
      />

      {/* Connectivity & Offline Sync Status Banner */}
      <ConnectivityBanner />

      {/* Page Routing */}
      <main className="flex-1 w-full transition-all">
        
        {/* 1. Accueil (Public) */}
        {currentPage === 'accueil' && (
          <HomeView
            setCurrentPage={handlePageChange}
            onSelectInformation={handleSelectInformation}
            onOpenSuggestModal={() => handleOpenSuggestModal('suggerer')}
            onRequireAuthToVerify={() => triggerToast(t('verify.auth_required_title'))}
          />
        )}

        {/* 2. Actualités (renamed from Dossiers & Actualités, Public) */}
        {currentPage === 'actualites' && (
          <FactCheckingExplorerView
            setCurrentPage={handlePageChange}
            onSelectInformation={handleSelectInformation}
            onOpenSuggestModal={() => handleOpenSuggestModal('suggerer')}
          />
        )}

        {/* 3. Consultation détaillée d'une information: /information/:id (Public, Requirement 3) */}
        {currentPage === 'information' && (
          <VerificationDetailView
            informationId={selectedInfoId}
            setCurrentPage={handlePageChange}
            onSelectInformation={handleSelectInformation}
            onOpenPdfModal={handleOpenPdfModal}
            onOpenSuggestModal={handleOpenSuggestModal}
            previousPage={previousPage}
          />
        )}

        {/* 4. Actes & Informations Officielles (Public) */}
        {currentPage === 'actes' && (
          <OfficialActsView
            setCurrentPage={handlePageChange}
            onOpenSuggestModal={handleOpenSuggestModal}
            onOpenPdfModal={handleOpenPdfModal}
          />
        )}

        {/* 5. Processus de Vérification Citoyenne (Protected: Requires Authenticated Account, Requirement 1) */}
        {currentPage === 'verifier' && (
          <ReportSubmissionView
            setCurrentPage={handlePageChange}
            onSubmitSuccess={handleReportSubmitSuccess}
            onSelectInformation={handleSelectInformation}
          />
        )}

        {/* 6. Console Vérificateurs & Modérateurs (Protected: Staff only) */}
        {currentPage === 'console-verif' && (
          role === 'admin' || role === 'verificateur' ? (
            <VerifierModeratorView
              setCurrentPage={handlePageChange}
              onOpenSuggestModal={() => handleOpenSuggestModal('suggerer')}
            />
          ) : (
            <AccessDeniedView
              setCurrentPage={handlePageChange}
              requiredRole="Vérificateur Accrédité"
              targetPageName="Console Modération & Enquêtes"
            />
          )
        )}

        {/* 7. Console Administrateur (Protected: Admin only, Requirement 5) */}
        {currentPage === 'console-admin' && (
          role === 'admin' ? (
            <AdminConsoleView
              setCurrentPage={handlePageChange}
              onOpenSuggestModal={() => handleOpenSuggestModal('suggerer')}
            />
          ) : (
            <AccessDeniedView
              setCurrentPage={handlePageChange}
              requiredRole="Super-Administrateur Républicain"
              targetPageName="Console Administrateur (Gestion des Rôles & Audit)"
            />
          )
        )}

        {/* 8. Accès Refusé (403) */}
        {currentPage === 'acces-refuse' && (
          <AccessDeniedView
            setCurrentPage={handlePageChange}
          />
        )}

        {/* 9. Connexion & Inscription Civique */}
        {currentPage === 'auth' && (
          <CivicAuthView
            setCurrentPage={handlePageChange}
            onLoginSuccess={(name, role) => triggerToast(`Bienvenue, ${name} (${role}) ! Session active.`)}
          />
        )}

        {/* 10. Page unique « À propos » (Section 1: Présentation, Section 2: Charte éthique, Section 3: Guide pratique) */}
        {(currentPage === 'a-propos' || currentPage === 'about' || currentPage === 'gouvernance' || currentPage === 'guides') && (
          <AboutView
            setCurrentPage={handlePageChange}
            onOpenSuggestModal={() => handleOpenSuggestModal('suggerer')}
          />
        )}

        {/* 11. Design System Officiel (spécifications techniques) */}
        {currentPage === 'design-system' && (
          <DesignSystemView
            setCurrentPage={handlePageChange}
          />
        )}

        {/* 12. FAQ (Questions Fréquentes) */}
        {currentPage === 'faq' && (
          <FAQView
            setCurrentPage={handlePageChange}
            onOpenSuggestModal={() => handleOpenSuggestModal('suggerer')}
          />
        )}

        {/* 13. Assistant Conversationnel IA Vérif237 */}
        {(currentPage === 'assistant-ia' || currentPage === 'ia') && (
          <AssistantChatView
            setCurrentPage={handlePageChange}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer
        setCurrentPage={handlePageChange}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      {/* Suggest Document / Report Fake Decree Modal */}
      <SuggestDocumentModal
        isOpen={suggestModalOpen}
        onClose={() => setSuggestModalOpen(false)}
        mode={suggestModalMode}
        targetDocumentTitle={targetDocumentTitle}
      />

      {/* Printable PDF Export Modal */}
      <PdfExportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        documentType={pdfModalType}
      />

    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  );
}
