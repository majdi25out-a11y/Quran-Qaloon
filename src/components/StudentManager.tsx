import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  Award,
  BookOpen,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Play,
  TrendingUp,
  X
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Student, RecitationSession, MemorizationTest } from '../types/quran';
import { SURAHS_DATA } from '../data/quranData';
import { storageService } from '../services/storage';

interface StudentManagerProps {
  students: Student[];
  sessions: RecitationSession[];
  tests: MemorizationTest[];
  onSelectStudentForSession: (studentId: string) => void;
  onRefreshData: () => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  sessions,
  tests,
  onSelectStudentForSession,
  onRefreshData
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Groupe Qaloon A - Matin');
  const [newAge, setNewAge] = useState(14);
  const [newLevel, setNewLevel] = useState('Intermédiaire (Juz Amma & Tabarak)');
  const [newPhone, setNewPhone] = useState('');
  const [newTargetSurah, setNewTargetSurah] = useState(4);

  const filteredStudents = students.filter(
    (st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStudent = students.find((st) => st.id === selectedStudentId) || students[0];
  const studentSessions = sessions.filter((s) => s.studentId === activeStudent?.id);
  const studentTests = tests.filter((t) => t.studentId === activeStudent?.id);

  // Compute Error taxonomy breakdown for active student
  const allErrors = studentSessions.flatMap((s) => s.errors);
  const errorCategoryCounts = {
    qaloon_specific: allErrors.filter((e) => e.category === 'qaloon_specific').length,
    memorization: allErrors.filter((e) => e.category === 'memorization').length,
    tajweed: allErrors.filter((e) => e.category === 'tajweed').length,
    pronunciation: allErrors.filter((e) => e.category === 'pronunciation').length,
    hesitation: allErrors.filter((e) => e.category === 'hesitation').length
  };

  const pieData = [
    { name: 'أحكام خاصة بقالون', value: errorCategoryCounts.qaloon_specific || 1, color: '#f59e0b' },
    { name: 'نسيان ومواضع الحفظ', value: errorCategoryCounts.memorization || 0, color: '#f43f5e' },
    { name: 'أحكام التجويد', value: errorCategoryCounts.tajweed || 0, color: '#6366f1' },
    { name: 'مخارج الحروف واللفظ', value: errorCategoryCounts.pronunciation || 0, color: '#14b8a6' },
    { name: 'التلكم والتردد', value: errorCategoryCounts.hesitation || 0, color: '#8b5cf6' }
  ].filter((d) => d.value > 0);

  // Compute test progress data for chart
  const testChartData = studentTests.map((t, idx) => ({
    name: `اختبار ${idx + 1}`,
    score: t.score
  }));

  const handleAddStudent = () => {
    if (!newName.trim()) return;
    const colors = ['bg-emerald-600', 'bg-amber-600', 'bg-indigo-600', 'bg-rose-600', 'bg-cyan-600'];
    const newSt: Student = {
      id: `std_${Date.now()}`,
      name: newName,
      group: newGroup,
      age: newAge,
      level: newLevel,
      phone: newPhone || '+216 98 000 000',
      targetSurahId: newTargetSurah,
      targetAyahStart: 1,
      targetAyahEnd: 20,
      joinedDate: new Date().toISOString().split('T')[0],
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    };

    storageService.saveStudent(newSt);
    onRefreshData();
    setShowAddModal(false);
    setNewName('');
    setSelectedStudentId(newSt.id);
  };

  const targetSurahObj = SURAHS_DATA.find((s) => s.id === activeStudent?.targetSurahId) || SURAHS_DATA[3];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Add Student CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-arabic">
              إدارة ومتابعة تطور الطلاب
            </h2>
            <p className="text-xs text-slate-400">
              إحصائيات التقدم، تحليل الأخطاء حسب الآيات، وسجل الجلسات
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>تسجيل طالب جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Roster List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث باسم الطالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1">
            {filteredStudents.map((st) => {
              const isSelected = st.id === activeStudent?.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-9 h-9 rounded-xl ${st.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow`}>
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{st.name}</h4>
                      <p className="text-[10px] text-slate-400">{st.group}</p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
                    {st.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Individual Evolution Dashboard */}
        {activeStudent && (
          <div className="lg:col-span-2 space-y-6">
            {/* Student Profile Card Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className={`w-14 h-14 rounded-2xl ${activeStudent.avatarColor} text-white font-extrabold flex items-center justify-center text-xl shadow-lg`}>
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{activeStudent.name}</h3>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-slate-400 mt-1">
                      <span>{activeStudent.group}</span>
                      <span>• {activeStudent.age} سنة</span>
                      <span className="text-amber-300">• {activeStudent.level}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectStudentForSession(activeStudent.id)}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950 rtl:rotate-180" />
                  <span>بدء التسميع</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">الجلسات المنجزة</span>
                  <span className="text-base font-bold text-slate-100 mt-0.5 block">{studentSessions.length}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">اختبارات الحفظ</span>
                  <span className="text-base font-bold text-emerald-400 mt-0.5 block">{studentTests.length}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">الأخطاء المسجلة</span>
                  <span className="text-base font-bold text-rose-400 mt-0.5 block">{allErrors.length}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">الهدف الحالي</span>
                  <span className="text-xs font-bold text-amber-300 mt-0.5 block font-arabic">سورة {targetSurahObj.nameArabic}</span>
                </div>
              </div>
            </div>

            {/* Error Taxonomy Chart & Test Evolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart: Error Distribution */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
                <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>توزيع الأخطاء حسب التصنيف</span>
                </h4>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-2 text-[10px] pt-1">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center space-x-1 rtl:space-x-reverse">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                      <span className="text-slate-300">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line Chart: Test Score Progression */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
                <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>تطور نتائج الاختبارات (%)</span>
                </h4>

                {testChartData.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-500">
                    لا توجد اختبارات مجراة حتى الآن
                  </div>
                ) : (
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={testChartData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#34d399' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sessions History */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200">
                سجل الجلسات الأخيرة
              </h4>

              {studentSessions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">لا توجد جلسات مسجلة.</p>
              ) : (
                <div className="space-y-2">
                  {studentSessions.map((sess) => {
                    const sessSurah = SURAHS_DATA.find((s) => s.id === sess.surahId);
                    return (
                      <div
                        key={sess.id}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="font-bold text-slate-200">
                              سورة {sessSurah?.nameArabic} (الآيات {sess.startAyah}-{sess.endAyah})
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(sess.date).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{sess.notes}</p>
                        </div>

                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-400 font-mono text-[10px]">
                            {sess.errors.length} أخطاء
                          </span>
                          <span className="capitalize font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                            {sess.grade === 'excellent' ? 'ممتاز' : sess.grade === 'good' ? 'جيد' : sess.grade === 'needs_work' ? 'يحتاج مراجعة' : 'لم يجتز'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute left-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 mb-4 font-arabic">تسجيل طالب جديد</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: بلال المنصوري"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">المجموعة / الحلقة:</label>
                <input
                  type="text"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">العمر:</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الهاتف:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+216 ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">المستوى:</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                >
                  <option value="مبتدئ (جزء عم)">مبتدئ (جزء عم)</option>
                  <option value="متوسط (جزء عم وتبارك)">متوسط (جزء عم وتبارك)</option>
                  <option value="متقدم (حفظ 15 جزءاً)">متقدم (حفظ 15 جزءاً)</option>
                  <option value="خاتم (30 جزءاً - مراجعة)">خاتم (30 جزءاً - مراجعة)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  حفظ بيانات الطالب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
