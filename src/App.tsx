import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuranReader } from './components/QuranReader';
import { SurahList } from './components/SurahList';
import { SessionRecorder } from './components/SessionRecorder';
import { StudentManager } from './components/StudentManager';
import { AutomatedTests } from './components/AutomatedTests';
import { WeeklyReports } from './components/WeeklyReports';
import { OfflineManagerModal } from './components/OfflineManagerModal';

import { Student, RecitationSession, MemorizationTest, AyahError } from './types/quran';
import { storageService } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reader' | 'index' | 'students' | 'tests' | 'reports'>('reader');

  // Application Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<RecitationSession[]>([]);
  const [tests, setTests] = useState<MemorizationTest[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Quran Reader State
  const [currentSurahId, setCurrentSurahId] = useState<number>(4); // Default An-Nisa (matching screenshot)
  const [targetAyahStart, setTargetAyahStart] = useState<number | undefined>(27);

  // Live Session Error Tracking
  const [activeSessionErrors, setActiveSessionErrors] = useState<AyahError[]>([]);

  // Modals
  const [isSessionRecorderOpen, setIsSessionRecorderOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(storageService.getOfflineStatus());

  // Reload data from Storage Service
  const reloadData = () => {
    const loadedStudents = storageService.getStudents();
    setStudents(loadedStudents);
    setSessions(storageService.getSessions());
    setTests(storageService.getTests());
    setOfflineStatus(storageService.getOfflineStatus());

    if (!selectedStudentId && loadedStudents.length > 0) {
      setSelectedStudentId(loadedStudents[0].id);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || null;

  // Handlers
  const handleSelectSurahFromIndex = (surahId: number, ayahStart?: number) => {
    setCurrentSurahId(surahId);
    if (ayahStart) {
      setTargetAyahStart(ayahStart);
    }
    setActiveTab('reader');
  };

  const handleAddSessionError = (error: Omit<AyahError, 'id' | 'timestamp'>) => {
    const fullError: AyahError = {
      ...error,
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    setActiveSessionErrors((prev) => [fullError, ...prev]);
  };

  const handleSessionCreated = (newSession: RecitationSession) => {
    reloadData();
  };

  const handleTestCompleted = (newTest: MemorizationTest) => {
    reloadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={offlineStatus.isOfflineMode}
        pendingSyncCount={offlineStatus.pendingSyncCount}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onStartNewSession={() => setIsSessionRecorderOpen(true)}
        students={students}
        selectedStudentId={selectedStudentId}
        onSelectStudent={setSelectedStudentId}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'reader' && (
          <QuranReader
            currentSurahId={currentSurahId}
            onSurahChange={setCurrentSurahId}
            activeStudent={activeStudent}
            activeSessionErrors={activeSessionErrors}
            onAddSessionError={handleAddSessionError}
            targetAyahStart={targetAyahStart}
          />
        )}

        {activeTab === 'index' && (
          <SurahList onSelectSurah={handleSelectSurahFromIndex} />
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            sessions={sessions}
            tests={tests}
            onSelectStudentForSession={(stId) => {
              setSelectedStudentId(stId);
              setIsSessionRecorderOpen(true);
            }}
            onRefreshData={reloadData}
          />
        )}

        {activeTab === 'tests' && (
          <AutomatedTests
            students={students}
            onTestCompleted={handleTestCompleted}
          />
        )}

        {activeTab === 'reports' && (
          <WeeklyReports
            students={students}
            sessions={sessions}
            tests={tests}
          />
        )}
      </main>

      {/* Live Session Recording Drawer/Modal */}
      <SessionRecorder
        isOpen={isSessionRecorderOpen}
        onClose={() => setIsSessionRecorderOpen(false)}
        students={students}
        initialStudentId={selectedStudentId}
        activeSessionErrors={activeSessionErrors}
        onClearSessionErrors={() => setActiveSessionErrors([])}
        onSessionCreated={handleSessionCreated}
      />

      {/* Offline SQLite / LocalStorage Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onSyncCompleted={reloadData}
      />
    </div>
  );
}
