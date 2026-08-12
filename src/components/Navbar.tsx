import React from 'react';
import {
  BookOpen,
  Users,
  Award,
  BarChart3,
  Wifi,
  WifiOff,
  PlusCircle,
  Search,
  ListFilter,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { Student } from '../types/quran';

interface NavbarProps {
  activeTab: 'reader' | 'index' | 'students' | 'tests' | 'reports';
  setActiveTab: (tab: 'reader' | 'index' | 'students' | 'tests' | 'reports') => void;
  isOffline: boolean;
  pendingSyncCount: number;
  onOpenOfflineModal: () => void;
  onStartNewSession: () => void;
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOffline,
  pendingSyncCount,
  onOpenOfflineModal,
  onStartNewSession,
  students,
  selectedStudentId,
  onSelectStudent
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-lg">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Riwaya Title */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 flex items-center justify-center shadow-md shadow-amber-900/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400 font-bold text-xl">
                ق
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-arabic font-bold text-lg text-amber-400 tracking-tight">
                  القرآن الكريم
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-arabic font-medium">
                  رواية قالون
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                متابعة التلاوة والحفظ للمحفظين والمعلمين
              </p>
            </div>
          </div>

          {/* Center Actions: Selected Student Selector */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-400 ml-2 rtl:mr-0 rtl:ml-2">الطالب الحالي:</span>
              <select
                value={selectedStudentId || ''}
                onChange={(e) => onSelectStudent(e.target.value || null)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  -- اختر طالباً --
                </option>
                {students.map((st) => (
                  <option key={st.id} value={st.id} className="bg-slate-900 text-slate-100">
                    {st.name} ({st.level})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onStartNewSession}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>جلسة جديدة</span>
            </button>
          </div>

          {/* Right Bar: Offline Badge & Quick Stats */}
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
            {/* Install / Mobile Button */}
            <button
              onClick={onOpenOfflineModal}
              title="تثبيت على الهاتف / فتح على الجوال"
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">على الهاتف</span>
            </button>

            {/* Offline SQLite Badge */}
            <button
              onClick={onOpenOfflineModal}
              title="إدارة الوضع بدون إنترنت"
              className={`flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isOffline
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/50 hover:bg-amber-900/50'
                  : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
              }`}
            >
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {isOffline ? 'بدون إنترنت' : 'متصل (تزامن)'}
              </span>
              {pendingSyncCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingSyncCount}
                </span>
              )}
            </button>

            {/* Mobile New Session Button */}
            <button
              onClick={onStartNewSession}
              className="md:hidden p-2 bg-emerald-600 text-white rounded-lg"
              title="جلسة جديدة"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Dark Dashboard Toolbar) */}
        <nav className="flex space-x-1 sm:space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 pt-1 no-scrollbar border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('reader')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'reader'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المصحف والتلاوة</span>
          </button>

          <button
            onClick={() => setActiveTab('index')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'index'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>فهرس السور والأجزاء</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'students'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>متابعة الطلاب</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'tests'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>اختبارات الحفظ</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>التقارير الأسبوعية</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
