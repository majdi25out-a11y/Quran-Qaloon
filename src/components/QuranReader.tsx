import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Tag,
  Share2,
  Globe,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Volume2,
  Plus,
  Info,
  Layers,
  X
} from 'lucide-react';
import { SURAHS_DATA, getSurahVerses, QALOON_RULES_INFO } from '../data/quranData';
import { Ayah, Student, ErrorCategory, AyahError } from '../types/quran';
import { storageService } from '../services/storage';

interface QuranReaderProps {
  currentSurahId: number;
  onSurahChange: (surahId: number) => void;
  activeStudent: Student | null;
  activeSessionErrors: AyahError[];
  onAddSessionError: (error: Omit<AyahError, 'id' | 'timestamp'>) => void;
  targetAyahStart?: number;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  currentSurahId,
  onSurahChange,
  activeStudent,
  activeSessionErrors,
  onAddSessionError,
  targetAyahStart
}) => {
  const surah = SURAHS_DATA.find((s) => s.id === currentSurahId) || SURAHS_DATA[3]; // Default An-Nisa
  const verses = getSurahVerses(currentSurahId);

  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(targetAyahStart || 27);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Modals & Panels
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showQaloonNotes, setShowQaloonNotes] = useState(false);
  const [viewMode, setViewMode] = useState<'page' | 'list'>('page');

  // Error Log Form State
  const [errorCategory, setErrorCategory] = useState<ErrorCategory>('qaloon_specific');
  const [errorSeverity, setErrorSeverity] = useState<'minor' | 'major'>('minor');
  const [errorDescription, setErrorDescription] = useState('');

  useEffect(() => {
    if (targetAyahStart) {
      setSelectedAyahNumber(targetAyahStart);
    }
  }, [targetAyahStart, currentSurahId]);

  // Audio Playback Handler
  const toggleAudio = (ayahNumber: number, audioUrl?: string) => {
    if (playingAyah === ayahNumber) {
      audioObj?.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        // Fallback speech synthesis if online MP3 fails or offline
        if ('speechSynthesis' in window) {
          const selectedAyah = verses.find((v) => v.ayahNumber === ayahNumber);
          if (selectedAyah) {
            const utterance = new SpeechSynthesisUtterance(selectedAyah.textArabic);
            utterance.lang = 'ar-SA';
            window.speechSynthesis.speak(utterance);
          }
        }
      });
      audio.onended = () => setPlayingAyah(null);
      setAudioObj(audio);
      setPlayingAyah(ayahNumber);
    }
  };

  const selectedAyah = verses.find((v) => v.ayahNumber === selectedAyahNumber);
  const isBookmarked = selectedAyahNumber ? storageService.isBookmarked(currentSurahId, selectedAyahNumber) : false;

  const handleToggleBookmark = () => {
    if (selectedAyahNumber) {
      storageService.toggleBookmark(currentSurahId, selectedAyahNumber, `Sourate ${surah.nameEnglish}`);
      setSelectedAyahNumber(selectedAyahNumber); // Force re-render
    }
  };

  const handleSaveError = () => {
    if (!selectedAyahNumber) return;
    onAddSessionError({
      sessionId: 'live_session',
      studentId: activeStudent?.id || 'std_1',
      surahId: currentSurahId,
      ayahNumber: selectedAyahNumber,
      category: errorCategory,
      description: errorDescription || getDefaultCategoryDescription(errorCategory),
      severity: errorSeverity
    });
    setShowErrorModal(false);
    setErrorDescription('');
  };

  const getDefaultCategoryDescription = (cat: ErrorCategory) => {
    switch (cat) {
      case 'qaloon_specific':
        return 'Omission de la Sila sur la Mim al-Jam\' (صلة ميم الجمع)';
      case 'memorization':
        return 'Oubli du verset ou inversion de mots';
      case 'tajweed':
        return 'Erreur de règle de Tajweed (Makhraj / Ghunna)';
      case 'pronunciation':
        return 'Faute de prononciation de haraka (Fatha/Damma/Kasra)';
      case 'hesitation':
        return 'Hésitation prolongée nécessitant une relance';
    }
  };

  // Check errors logged for current verse
  const getAyahErrorCount = (ayahNum: number) => {
    return activeSessionErrors.filter((e) => e.surahId === currentSurahId && e.ayahNumber === ayahNum).length;
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Header: Surah Title, Juz, Page Controls (Matching Quran Android header) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl mb-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          {/* Previous Surah Button */}
          <button
            disabled={currentSurahId <= 1}
            onClick={() => onSurahChange(currentSurahId - 1)}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédente</span>
          </button>

          {/* Surah Name & Juz Badge */}
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center justify-center space-x-2">
              <span>{surah.nameEnglish}</span>
              <span className="text-amber-400 font-arabic text-xl font-normal">
                ({surah.nameArabic})
              </span>
            </h2>
            <div className="flex items-center justify-center space-x-3 text-xs text-slate-400 mt-1">
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-amber-300 font-mono">
                Juz' {selectedAyah?.juzNumber || surah.juzStart}
              </span>
              <span>• Page {selectedAyah?.pageNumber || surah.pageStart}</span>
              <span className="text-emerald-400 font-medium">• {surah.revelationType} ({surah.versesCount} versets)</span>
            </div>
          </div>

          {/* Next Surah Button */}
          <button
            disabled={currentSurahId >= 114}
            onClick={() => onSurahChange(currentSurahId + 1)}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <span className="hidden sm:inline">Suivante</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode & Qaloon Rules Quick Switcher */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('page')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'page'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vue Mus'haf (Page)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Liste Détaillée
            </button>
          </div>

          {/* Qaloon Notes Toggle */}
          <button
            onClick={() => setShowQaloonNotes(!showQaloonNotes)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showQaloonNotes
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spécificités Qaloon</span>
          </button>
        </div>
      </div>

      {/* Active Student Session Bar */}
      {activeStudent && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 mb-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full ${activeStudent.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow`}>
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Séance de Récitation en cours</span>
              <span className="text-sm font-bold text-emerald-300">{activeStudent.name} ({activeStudent.level})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-mono">
              {activeSessionErrors.length} erreur(s) enregistrée(s)
            </span>
          </div>
        </div>
      )}

      {/* Qaloon Variant Explanation Drawer */}
      {showQaloonNotes && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-xl text-xs space-y-3">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Règles de Récitation - Riwaya Qaloon 'an Nafi' (قالون عن نافع)</span>
            </div>
            <button onClick={() => setShowQaloonNotes(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            {QALOON_RULES_INFO.map((r) => (
              <div key={r.key} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-arabic font-bold text-amber-400 text-sm block mb-1">
                  {r.name}
                </span>
                <p className="text-slate-300 leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN QURAN CANVAS CONTAINER (Authentic Cream/Dark Mus'haf Canvas matching Screenshot #1) */}
      <div className="relative bg-[#1a1f2c] border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-2xl min-h-[500px]">
        
        {/* Floating Verse Action Bar matching Screenshot #1 (Bookmark, Tag, Share, Globe, Play) */}
        {selectedAyah && (
          <div className="sticky top-20 z-30 mb-6 bg-emerald-900/95 border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between max-w-md mx-auto backdrop-blur transition-all">
            <span className="text-xs text-emerald-200 font-mono pl-2">
              Verset {selectedAyah.ayahNumber}
            </span>

            <div className="flex items-center space-x-2">
              {/* Bookmark */}
              <button
                onClick={handleToggleBookmark}
                title="Marquer le verset"
                className={`p-2 rounded-xl transition-all ${
                  isBookmarked
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Tag Error */}
              <button
                onClick={() => setShowErrorModal(true)}
                title="Consigner une erreur de récitation"
                className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white shadow transition-all flex items-center space-x-1"
              >
                <Tag className="w-4 h-4" />
                <span className="text-[11px] font-bold pr-1">Erreur</span>
              </button>

              {/* Share / Copy */}
              <button
                onClick={() => navigator.clipboard.writeText(selectedAyah.textArabic)}
                title="Copier le verset"
                className="p-2 rounded-xl bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Qaloon Variant Info */}
              {selectedAyah.textQaloonNote && (
                <button
                  onClick={() => alert(`Note Qaloon: ${selectedAyah.textQaloonNote}`)}
                  title="Spécificité Qaloon pour ce verset"
                  className="p-2 rounded-xl bg-amber-500/30 text-amber-300 hover:bg-amber-500/40 border border-amber-500/30 transition-all"
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}

              {/* Audio Playback */}
              <button
                onClick={() => toggleAudio(selectedAyah.ayahNumber, selectedAyah.audioUrl)}
                title="Écouter la récitation audio"
                className="p-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold shadow transition-all"
              >
                {playingAyah === selectedAyah.ayahNumber ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 fill-slate-950" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bismillah Header (Except Surah At-Tawbah) */}
        {currentSurahId !== 9 && (
          <div className="text-center my-6">
            <span className="font-quran text-2xl sm:text-3xl text-amber-400/90 font-bold tracking-wide">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>
        )}

        {/* View Mode 1: PAGE MODE (Uthmani Quranic Script Paragraph Flow matching screenshot #1 and #2) */}
        {viewMode === 'page' && (
          <div className="text-right font-quran text-2xl sm:text-3xl sm:leading-[3rem] leading-[2.6rem] tracking-normal text-slate-100 py-4 dir-rtl space-x-reverse select-text">
            {verses.map((ayah) => {
              const isSelected = selectedAyahNumber === ayah.ayahNumber;
              const errCount = getAyahErrorCount(ayah.ayahNumber);

              return (
                <span
                  key={ayah.ayahNumber}
                  onClick={() => setSelectedAyahNumber(ayah.ayahNumber)}
                  className={`inline cursor-pointer rounded px-1.5 py-1 transition-all ${
                    isSelected
                      ? 'bg-teal-900/60 text-teal-100 border-b-2 border-teal-400'
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <span className="inline">{ayah.textArabic}</span>

                  {/* Qaloon Sila / Variant Marker */}
                  {ayah.textQaloonNote && (
                    <span
                      title={`Spécificité Qaloon: ${ayah.textQaloonNote}`}
                      className="inline-block text-[10px] text-amber-400 font-sans mx-1 px-1 bg-amber-500/10 rounded border border-amber-500/30"
                    >
                      قالون
                    </span>
                  )}

                  {/* Verse End Marker with Ornament ﴿27﴾ */}
                  <span className="inline-block mx-1 font-quran text-amber-400 font-bold text-2xl tracking-normal">
                    ﴿{ayah.ayahNumber}﴾
                  </span>

                  {/* Error Badge on verse */}
                  {errCount > 0 && (
                    <span className="inline-flex items-center justify-center bg-rose-600 text-white text-[10px] font-sans font-bold w-4 h-4 rounded-full mx-0.5">
                      {errCount}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* View Mode 2: LIST MODE */}
        {viewMode === 'list' && (
          <div className="space-y-4 py-2">
            {verses.map((ayah) => {
              const isSelected = selectedAyahNumber === ayah.ayahNumber;
              const errCount = getAyahErrorCount(ayah.ayahNumber);

              return (
                <div
                  key={ayah.ayahNumber}
                  onClick={() => setSelectedAyahNumber(ayah.ayahNumber)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 text-xs text-slate-400">
                    <span className="font-mono text-amber-400 font-bold">
                      Verset {ayah.ayahNumber}
                    </span>
                    <div className="flex items-center space-x-2">
                      {ayah.textQaloonNote && (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-arabic">
                          {ayah.textQaloonNote}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAudio(ayah.ayahNumber, ayah.audioUrl);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-quran text-2xl sm:text-3xl text-right text-slate-100 leading-relaxed">
                    {ayah.textArabic} ﴿{ayah.ayahNumber}﴾
                  </p>

                  {errCount > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center space-x-2 text-xs text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errCount} erreur(s) enregistrée(s) pour cet élève</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Page Footer Number */}
        <div className="text-center border-t border-slate-800/80 pt-4 mt-8 text-xs text-slate-400 font-mono">
          Page {selectedAyah?.pageNumber || surah.pageStart}
        </div>
      </div>

      {/* ERROR LOG MODAL (Sauvegarde des erreurs par verset) */}
      {showErrorModal && selectedAyah && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Consigner une Erreur
                </h3>
                <p className="text-xs text-slate-400">
                  Sourate {surah.nameEnglish} • Verset {selectedAyah.ayahNumber}
                </p>
              </div>
            </div>

            {/* Selected Verse Arabic Preview */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4 text-right">
              <p className="font-quran text-lg text-amber-300">
                {selectedAyah.textArabic}
              </p>
            </div>

            {/* Error Category Picker */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Type d'Erreur:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setErrorCategory('qaloon_specific')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      errorCategory === 'qaloon_specific'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">Spécificité Qaloon</span>
                    <span className="text-[10px] text-slate-400">Sila Mim / Tashil / Iskan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorCategory('memorization')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      errorCategory === 'memorization'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">Oubli / Mémorisation</span>
                    <span className="text-[10px] text-slate-400">Verset saauté ou oublié</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorCategory('tajweed')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      errorCategory === 'tajweed'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">Règle de Tajweed</span>
                    <span className="text-[10px] text-slate-400">Makhraj / Ghunna / Mad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorCategory('pronunciation')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      errorCategory === 'pronunciation'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">Prononciation / Haraka</span>
                    <span className="text-[10px] text-slate-400">Fatha / Damma / Kasra</span>
                  </button>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Gravité:
                </label>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="minor"
                      checked={errorSeverity === 'minor'}
                      onChange={() => setErrorSeverity('minor')}
                      className="accent-amber-500"
                    />
                    <span>Mineure (Corrigée immédiatement)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="major"
                      checked={errorSeverity === 'major'}
                      onChange={() => setErrorSeverity('major')}
                      className="accent-rose-500"
                    />
                    <span>Majeure (Avertissement)</span>
                  </label>
                </div>
              </div>

              {/* Detail Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Remarque / Précision pour l'enseignant:
                </label>
                <textarea
                  rows={2}
                  value={errorDescription}
                  onChange={(e) => setErrorDescription(e.target.value)}
                  placeholder="Ex: A omis la Sila de la Mim al-Jam' sur (عَلَيْكُمُ)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveError}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg"
                >
                  Sauvegarder l'Erreur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
