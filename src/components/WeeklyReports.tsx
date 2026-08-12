import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Award,
  User
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Student, RecitationSession, MemorizationTest } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';

interface WeeklyReportsProps {
  students: Student[];
  sessions: RecitationSession[];
  tests: MemorizationTest[];
}

export const WeeklyReports: React.FC<WeeklyReportsProps> = ({ students, sessions, tests }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedWeek, setSelectedWeek] = useState<string>('cette_semaine');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentSessions = sessions.filter((s) => s.studentId === selectedStudent?.id);
  const studentTests = tests.filter((t) => t.studentId === selectedStudent?.id);

  // Calculate statistics for report
  const totalVersesRecited = studentSessions.reduce(
    (acc, s) => acc + Math.max(1, s.endAyah - s.startAyah + 1),
    0
  );
  const totalErrors = studentSessions.flatMap((s) => s.errors);

  // Group errors by category
  const errorStats = [
    { category: 'Spécificités Qaloon', count: totalErrors.filter((e) => e.category === 'qaloon_specific').length },
    { category: 'Mémorisation / Oubli', count: totalErrors.filter((e) => e.category === 'memorization').length },
    { category: 'Tajweed', count: totalErrors.filter((e) => e.category === 'tajweed').length },
    { category: 'Prononciation', count: totalErrors.filter((e) => e.category === 'pronunciation').length }
  ];

  const handlePrintReport = () => {
    window.print();
  };

  const currentSurah = SURAHS_DATA.find((s) => s.id === selectedStudent?.targetSurahId) || SURAHS_DATA[3];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Filter Bar (Hidden when printing) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Rapports de Progression Hebdomadaires
            </h2>
            <p className="text-xs text-slate-400">
              Génération automatique de comptes-rendus imprimables pour les parents et enseignants
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.group})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold text-2xl flex items-center justify-center font-arabic">
              ق
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 print:text-slate-900">
                Rapport de Progression Récitation Coranique (Qaloon)
              </h1>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Halqa de Mémorisation Coranique • Riwaya Qaloon 'an Nafi'
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-slate-600">
            <p className="font-mono font-bold text-amber-400 print:text-slate-900">
              Période: Semaine du {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p className="text-[10px]">Émis par l'Enseignant</p>
          </div>
        </div>

        {/* Student Identification Info */}
        {selectedStudent && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">Élève:</span>
              <strong className="text-slate-100 print:text-slate-900 text-sm">{selectedStudent.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">Groupe:</span>
              <strong className="text-slate-200 print:text-slate-800">{selectedStudent.group}</strong>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">Niveau:</span>
              <strong className="text-amber-400 print:text-slate-800">{selectedStudent.level}</strong>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">Sourate Cible:</span>
              <strong className="text-emerald-400 print:text-slate-800 font-arabic">{currentSurah.nameArabic} ({currentSurah.nameEnglish})</strong>
            </div>
          </div>
        )}

        {/* Executive Key Figures */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 p-4 rounded-xl text-center">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Versets Récités</span>
            <span className="text-2xl font-extrabold text-amber-400 print:text-slate-900 mt-1 block">{totalVersesRecited}</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 p-4 rounded-xl text-center">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Séances Présentes</span>
            <span className="text-2xl font-extrabold text-emerald-400 print:text-slate-900 mt-1 block">{studentSessions.length}</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 p-4 rounded-xl text-center">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Erreurs Identifiées</span>
            <span className="text-2xl font-extrabold text-rose-400 print:text-slate-900 mt-1 block">{totalErrors.length}</span>
          </div>
        </div>

        {/* Error Breakdown Bar Chart */}
        <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <h3 className="font-bold text-slate-200 print:text-slate-900">
            Analyse des Erreurs par Catégorie
          </h3>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorStats}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teacher Observations & Recommendation */}
        <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <span className="font-bold text-amber-400 print:text-slate-900 block">
            Appréciation & Recommandations de l'Enseignant:
          </span>
          <p className="text-slate-300 print:text-slate-800 leading-relaxed italic">
            L'élève <strong className="text-slate-100 print:text-slate-900">{selectedStudent?.name}</strong> fait preuve d'une assiduité régulière. Une attention particulière doit être portée à la règle de la <strong>صلة ميم الجمع (Dammat Mim al-Jam')</strong> spécifique à la Riwaya Qaloon pour la semaine prochaine.
          </p>
        </div>

        {/* Signatures Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-slate-700">
          <div>
            <p className="font-bold">Signature de l'Enseignant:</p>
            <div className="h-12 border-b border-dashed border-slate-700 print:border-slate-400 mt-2"></div>
          </div>
          <div>
            <p className="font-bold">Visa des Parents:</p>
            <div className="h-12 border-b border-dashed border-slate-700 print:border-slate-400 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
