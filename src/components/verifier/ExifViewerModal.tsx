import React, { useState } from 'react';
import { api } from '../../services/api';

interface ExifViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvidence?: (summary: string) => void;
}

export const ExifViewerModal: React.FC<ExifViewerModalProps> = ({
  isOpen,
  onClose,
  onSaveEvidence
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'dgsn_fake' | 'whatsapp_clean' | 'custom'>('dgsn_fake');
  const [fileName, setFileName] = useState('Faux_Arrete_DGSN_Police_2025.jpg');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async (preset = selectedPreset) => {
    setLoading(true);
    try {
      const res = await api.runExifAnalysis({
        fileName,
        samplePreset: preset
      });
      setReport(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedPreset('custom');
      // Run analysis
      setLoading(true);
      api.runExifAnalysis({ fileName: file.name, samplePreset: 'custom' })
        .then(res => setReport(res.report))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#007953] dark:text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">data_object</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Visualiseur EXIF & Analyseur de Manipulation d'Image (ELA)
              </h3>
              <p className="text-[11px] text-slate-500">
                Extraction des métadonnées, profil logiciel et détection des incohérences de compression
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          
          {/* Preset or Upload Selectors */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Choisir un échantillon d'enquête ou importer une pièce à conviction :
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPreset('dgsn_fake');
                  setFileName('Faux_Arrete_DGSN_Police_2025.jpg');
                  handleAnalyze('dgsn_fake');
                }}
                className={`p-3 rounded-xl border text-left font-semibold cursor-pointer transition-all ${
                  selectedPreset === 'dgsn_fake'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <span className="material-symbols-outlined text-sm text-red-500">warning</span>
                  <span>Pièce DGSN suspecte</span>
                </div>
                <div className="text-[10px] text-slate-500">Retouche Photoshop & Sceau superposé</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPreset('whatsapp_clean');
                  setFileName('Capture_WhatsApp_Purgée.png');
                  handleAnalyze('whatsapp_clean');
                }}
                className={`p-3 rounded-xl border text-left font-semibold cursor-pointer transition-all ${
                  selectedPreset === 'whatsapp_clean'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <span className="material-symbols-outlined text-sm text-blue-500">chat</span>
                  <span>Capture WhatsApp</span>
                </div>
                <div className="text-[10px] text-slate-500">Métadonnées EXIF purgées</div>
              </button>

              <label className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 flex flex-col justify-center items-center cursor-pointer text-center">
                <span className="material-symbols-outlined text-slate-500 text-lg">upload_file</span>
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">Importer une image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Report Display */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-2 border-[#007953] border-t-transparent rounded-full animate-spin" />
              <span>Dépouillement des tables EXIF et calcul de parité ELA...</span>
            </div>
          ) : report ? (
            <div className="space-y-4">
              
              {/* Verdict header banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                report.photoshopIndicators.isDetected
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                    <span className="material-symbols-outlined text-lg">
                      {report.photoshopIndicators.isDetected ? 'dangerous' : 'verified'}
                    </span>
                    <span>
                      {report.photoshopIndicators.isDetected
                        ? "INDICES DE RETOUCHE LOGICIELLE DÉTECTÉS"
                        : report.hasExif
                        ? "MÉTADONNÉES NATIVES CONFORMES"
                        : "FICHIER SANS MÉTADONNÉES EXIF"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed max-w-xl">
                    {report.photoshopIndicators.explanation}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Score d'anomalie ELA</div>
                  <div className="text-2xl font-black">{report.elaScore.estimatedArtifactsRate}%</div>
                  <div className="text-[10px] font-semibold">{report.elaScore.riskLabel}</div>
                </div>
              </div>

              {/* EXIF Metadata Table */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Champs EXIF extraits ({report.fileName})</span>
                  <span className="font-mono text-[11px] text-slate-500">{report.fileSizeKb} KB • {report.mimeType}</span>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold block">Appareil / Fabricant :</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {report.cameraMake ? `${report.cameraMake} (${report.cameraModel})` : 'Non renseigné (Absent)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block">Logiciel / Éditeur :</span>
                    <span className={`font-mono font-bold ${report.photoshopIndicators.isDetected ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                      {report.software || 'Aucun logiciel tiers détecté'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block">Date & Heure d'origine :</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {report.dateTimeOriginal || 'Purgée / Non disponible'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block">Paramètres optiques :</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {report.isoSpeed ? `ISO ${report.isoSpeed} • ${report.exposureTime} • ${report.fNumber}` : 'Données capteur non trouvées'}
                    </span>
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-semibold block">Coordonnées GPS géoréférencées :</span>
                    {report.gps?.formatted ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          📍 {report.gps.formatted}
                        </span>
                        <a
                          href={report.gps.mapQueryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Voir sur carte</span>
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">
                        Aucune coordonnée GPS présente dans le fichier (Absence standard conforme aux règles de protection de la vie privée).
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Limitations Notice */}
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#007953]">rule</span>
                  <span>Limites scientifiques de l'analyse forensique :</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  {report.photoshopIndicators.limits.map((lim: string, idx: number) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              Cliquez sur l'un des échantillons ci-dessus pour lancer l'analyse forensique.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          {report && onSaveEvidence && (
            <button
              onClick={() => {
                onSaveEvidence(`Rapport EXIF (${report.fileName}) : ${report.photoshopIndicators.isDetected ? 'Retouche Photoshop détectée' : 'Métadonnées homogènes'}. Score ELA : ${report.elaScore.estimatedArtifactsRate}%.`);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">bookmark</span>
              <span>Consigner au dossier d'enquête</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold cursor-pointer text-xs ml-auto"
          >
            Fermer l'analyseur
          </button>
        </div>

      </div>
    </div>
  );
};
