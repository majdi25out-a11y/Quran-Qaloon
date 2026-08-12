import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Clock,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Student, RecitationSession, AyahError, SessionGrade } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';
import { storageService } from '../services/storage';

interface SessionRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId: string | null;
  activeSessionErrors: AyahError[];
  onClearSessionErrors: () => void;
  onSessionCreated: (session: RecitationSession) => void;
}

export const SessionRecorder: React.FC<SessionRecorderProps> = ({
  isOpen,
  onClose,
  students,
  initialStudentId,
  activeSessionErrors,
  onClearSessionErrors,
  onSessionCreated
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || students[0]?.id || '');
  const [surahId, setSurahId] = useState<number>(4); // Default An-Nisa
  const [startAyah, setStartAyah] = useState<number>(27);
  const [endAyah, setEndAyah] = useState<number>(43);
  const [grade, setGrade] = useState<SessionGrade>('good');
  const [notes, setNotes] = useState('');
  
  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && isOpen) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isOpen]);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  if (!isOpen) return null;

  const currentSurah = SURAHS_DATA.find((s) => s.id === surahId) || SURAHS_DATA[0];

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleRecording = () => {
    if (isRecordingAudio) {
      setIsRecordingAudio(false);
      setRecordedAudioUrl('simulated_audio_recitation.mp3');
    } else {
      setIsRecordingAudio(true);
    }
  };

  const handleSaveSession = () => {
    if (!selectedStudentId) {
      alert('الرجاء اختيار طالب لتسجيل الجلسة.');
      return;
    }

    const sessionMinutes = Math.max(1, Math.round(secondsElapsed / 60));

    const newSession: RecitationSession = {
      id: `sess_${Date.now()}`,
      studentId: selectedStudentId,
      date: new Date().toISOString(),
      surahId,
      startAyah,
      endAyah,
      grade,
      errors: activeSessionErrors,
      notes: notes || `جلسة تسميع - سورة ${currentSurah.nameArabic} (من الآية ${startAyah} إلى ${endAyah})`,
      durationMinutes: sessionMinutes
    };

    storageService.saveSession(newSession);
    onSessionCreated(newSession);
    onClearSessionErrors();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Mic className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-arabic">
              جلسة التسميع والتقييم - رواية قالون
            </h2>
            <p className="text-xs text-slate-400">
              تسجيل أخطاء التلاوة مباشرة لكل آية مع مؤقت الزمن
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs">
          {/* Top Grid: Student & Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Picker */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                الطالب:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {st.group}
                  </option>
                ))}
              </select>
            </div>

            {/* Timer & Micro Recorder */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  مدة الجلسة
                </span>
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-base font-mono font-bold text-amber-400 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{formatTimer(secondsElapsed)}</span>
                </div>
              </div>

              {/* Audio Mic Button */}
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all ${
                  isRecordingAudio
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isRecordingAudio ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecordingAudio ? 'إيقاف التسجيل' : 'تسجيل صوتي'}</span>
              </button>
            </div>
          </div>

          {/* Surah & Ayah Range Selection */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>المقطع المتلو (برواية قالون)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">السورة:</label>
                <select
                  value={surahId}
                  onChange={(e) => {
                    const sid = Number(e.target.value);
                    setSurahId(sid);
                    setStartAyah(1);
                    setEndAyah(Math.min(20, SURAHS_DATA.find((s) => s.id === sid)?.versesCount || 20));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 font-medium"
                >
                  {SURAHS_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} سورة {s.nameArabic} ({s.nameEnglish})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">من الآية:</label>
                <input
                  type="number"
                  min={1}
                  max={currentSurah.versesCount}
                  value={startAyah}
                  onChange={(e) => setStartAyah(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">إلى الآية:</label>
                <input
                  type="number"
                  min={startAyah}
                  max={currentSurah.versesCount}
                  value={endAyah}
                  onChange={(e) => setEndAyah(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Logged Errors Summary Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300">
                الأخطاء المسجلة في هذه الجلسة ({activeSessionErrors.length})
              </span>
              {activeSessionErrors.length > 0 && (
                <button
                  onClick={onClearSessionErrors}
                  className="text-slate-500 hover:text-rose-400 text-[10px] flex items-center space-x-1 rtl:space-x-reverse"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>

            {activeSessionErrors.length === 0 ? (
              <p className="text-slate-500 text-[11px] italic">
                لا توجد أخطاء مسجلة. (يمكنك تحديد الآيات من المصحف لتسجيل الأخطاء).
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeSessionErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="bg-rose-500/20 text-rose-300 font-mono px-1.5 py-0.5 rounded text-[10px]">
                        آية {err.ayahNumber}
                      </span>
                      <span className="text-slate-200 font-medium">{err.description}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{err.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grade Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              تقييم المعلم:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setGrade('excellent')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  grade === 'excellent'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ⭐ ممتاز
              </button>
              <button
                type="button"
                onClick={() => setGrade('good')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  grade === 'good'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                👍 جيد
              </button>
              <button
                type="button"
                onClick={() => setGrade('needs_work')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  grade === 'needs_work'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ⚠️ يحتاج مراجعة
              </button>
              <button
                type="button"
                onClick={() => setGrade('failed')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  grade === 'failed'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ❌ لم يجتز
              </button>
            </div>
          </div>

          {/* Teacher Comments */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ملاحظات وتوصيات المعلم:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: مراجعة صلة ميم الجمع وتكرار الآيات من 28 إلى 30 للجلسة القادمة..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveSession}
              className="flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الجلسة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
