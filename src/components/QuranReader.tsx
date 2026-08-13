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
        return 'ترك صلة ميم الجمع أو التسهيل الخاص برواية قالون';
      case 'memorization':
        return 'نسيان في الكلمات أو تقديم وتأخير في الآية';
      case 'tajweed':
        return 'خطأ في أحكام التجويد (مخرج / غنة / مد)';
      case 'pronunciation':
        return 'خطأ في تشكيل الحركات (فتحة / ضمة / كسرة)';
      case 'hesitation':
        return 'تردد وتوقف يستوجب الفتح على الطالب';
    }
  };

  // Check errors logged for current verse
  const getAyahErrorCount = (ayahNum: number) => {
    return activeSessionErrors.filter((e) => e.surahId === currentSurahId && e.ayahNumber === ayahNum).length;
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Header: Surah Title, Juz, Page Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl mb-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          {/* Previous Surah Button */}
          <button
            disabled={currentSurahId <= 1}
            onClick={() => onSurahChange(currentSurahId - 1)}
            className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">السورة السابقة</span>
          </button>

          {/* Surah Name & Juz Badge */}
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <span className="text-amber-400 font-arabic text-xl font-bold">
                سورة {surah.nameArabic}
              </span>
              <span className="text-slate-400 text-sm">({surah.nameEnglish})</span>
            </h2>
            <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse text-xs text-slate-400 mt-1">
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-amber-300 font-mono">
                الجزء {selectedAyah?.juzNumber || surah.juzStart}
              </span>
              <span>• الصفحة {selectedAyah?.pageNumber || surah.pageStart}</span>
              <span className="text-emerald-400 font-medium">• {surah.revelationType === 'Makki' ? 'مكية' : 'مدنية'} ({surah.versesCount} آية)</span>
            </div>
          </div>

          {/* Next Surah Button */}
          <button
            disabled={currentSurahId >= 114}
            onClick={() => onSurahChange(currentSurahId + 1)}
            className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <span className="hidden sm:inline">السورة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode & Qaloon Rules Quick Switcher */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex space-x-1 rtl:space-x-reverse bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('page')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'page'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عرض المصحف (صفحة)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عرض مفصل (قائمة)
            </button>
          </div>

          {/* Qaloon Notes Toggle */}
          <button
            onClick={() => setShowQaloonNotes(!showQaloonNotes)}
            className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl border transition-all ${
              showQaloonNotes
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>أحكام قالون</span>
          </button>
        </div>
      </div>

      {/* Active Student Session Bar */}
      {activeStudent && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 mb-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className={`w-8 h-8 rounded-full ${activeStudent.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow`}>
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">جلسة التسميع الحالية</span>
              <span className="text-sm font-bold text-emerald-300">{activeStudent.name} ({activeStudent.level})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-mono">
              {activeSessionErrors.length} خطأ مسجل
            </span>
          </div>
        </div>
      )}

      {/* Qaloon Variant Explanation Drawer */}
      {showQaloonNotes && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-xl text-xs space-y-3">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-4 h-4" />
              <span>أحكام التلاوة - رواية قالون عن نافع</span>
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

      {/* MAIN QURAN CANVAS CONTAINER */}
      <div className="relative bg-[#1a1f2c] border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-2xl min-h-[500px]">
        
        {/* Floating Verse Action Bar */}
        {selectedAyah && (
          <div className="sticky top-20 z-30 mb-6 bg-emerald-900/95 border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between max-w-md mx-auto backdrop-blur transition-all">
            <span className="text-xs text-emerald-200 font-mono pr-2">
              الآية {selectedAyah.ayahNumber}
            </span>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Bookmark */}
              <button
                onClick={handleToggleBookmark}
                title="حفظ علامة"
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
                title="تسجيل خطأ في التلاوة"
                className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white shadow transition-all flex items-center space-x-1 rtl:space-x-reverse"
              >
                <Tag className="w-4 h-4" />
                <span className="text-[11px] font-bold pl-1">تسجيل خطأ</span>
              </button>

              {/* Share / Copy */}
              <button
                onClick={() => navigator.clipboard.writeText(selectedAyah.textArabic)}
                title="نسخ النص"
                className="p-2 rounded-xl bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Qaloon Variant Info */}
              {selectedAyah.textQaloonNote && (
                <button
                  onClick={() => alert(`تنبيه قالون: ${selectedAyah.textQaloonNote}`)}
                  title="تنبيه قالون لهذه الآية"
                  className="p-2 rounded-xl bg-amber-500/30 text-amber-300 hover:bg-amber-500/40 border border-amber-500/30 transition-all"
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}

              {/* Audio Playback */}
              <button
                onClick={() => toggleAudio(selectedAyah.ayahNumber, selectedAyah.audioUrl)}
                title="استماع للتلاوة"
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

        {/* View Mode 1: PAGE MODE */}
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
                      title={`تنبيـه قالون: ${ayah.textQaloonNote}`}
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
                    <span className="font-bold text-amber-400 font-arabic">
                      الآية {ayah.ayahNumber}
                    </span>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center space-x-2 rtl:space-x-reverse text-xs text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errCount} خطأ مسجل لهذا الطالب</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Page Footer Number */}
        <div className="text-center border-t border-slate-800/80 pt-4 mt-8 text-xs text-slate-400 font-arabic">
          الصفحة {selectedAyah?.pageNumber || surah.pageStart}
        </div>
      </div>

      {/* ERROR LOG MODAL */}
      {showErrorModal && selectedAyah && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  تسجيل خطأ في التلاوة
                </h3>
                <p className="text-xs text-slate-400">
                  سورة {surah.nameArabic} • الآية {selectedAyah.ayahNumber}
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
                  نوع الخطأ:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setErrorCategory('qaloon_specific')}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      errorCategory === 'qaloon_specific'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">رواية قالون</span>
                    <span className="text-[10px] text-slate-400">صلة ميم / تسهيل / إدغام</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorCategory('memorization')}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      errorCategory === 'memorization'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">خطأ حفظ / نسيان</span>
                    <span className="text-[10px] text-slate-400">نسيان آية أو كلمة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorCategory('tajweed')}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      errorCategory === 'tajweed'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">حكم تجويد</span>
                    <span className="text-[10px] text-slate-400">مخرج / غنة / مد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setErrorCategory('pronunciation')}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      errorCategory === 'pronunciation'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-semibold">نطق / تشكيل</span>
                    <span className="text-[10px] text-slate-400">فتحة / ضمة / كسرة</span>
                  </button>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  درجة الخطأ:
                </label>
                <div className="flex space-x-3 rtl:space-x-reverse">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="minor"
                      checked={errorSeverity === 'minor'}
                      onChange={() => setErrorSeverity('minor')}
                      className="accent-amber-500"
                    />
                    <span>خفيف (تنبيه عادي)</span>
                  </label>
                  <label className="flex items-center space-x-2 rtl:space-x-reverse text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value="major"
                      checked={errorSeverity === 'major'}
                      onChange={() => setErrorSeverity('major')}
                      className="accent-rose-500"
                    />
                    <span>جلي (خطأ كبير)</span>
                  </label>
                </div>
              </div>

              {/* Detail Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ملاحظات المحفظ:
                </label>
                <textarea
                  rows={2}
                  value={errorDescription}
                  onChange={(e) => setErrorDescription(e.target.value)}
                  placeholder="مثال: ترك صلة ميم الجمع في (عَلَيْكُمُ)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveError}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg"
                >
                  حفظ الخطأ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
