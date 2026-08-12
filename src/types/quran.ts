export type ErrorCategory = 'memorization' | 'tajweed' | 'qaloon_specific' | 'pronunciation' | 'hesitation';

export interface AyahError {
  id: string;
  sessionId: string;
  studentId: string;
  surahId: number;
  ayahNumber: number;
  category: ErrorCategory;
  description: string;
  timestamp: string;
  severity: 'minor' | 'major';
}

export type SessionGrade = 'excellent' | 'good' | 'needs_work' | 'failed';

export interface RecitationSession {
  id: string;
  studentId: string;
  date: string;
  surahId: number;
  startAyah: number;
  endAyah: number;
  grade: SessionGrade;
  errors: AyahError[];
  notes: string;
  durationMinutes: number;
}

export interface Student {
  id: string;
  name: string;
  group: string;
  age: number;
  level: string; // e.g. "Moyen", "Avancé", "Débutant"
  phone?: string;
  targetSurahId: number;
  targetAyahStart: number;
  targetAyahEnd: number;
  joinedDate: string;
  avatarColor: string;
  lastSessionDate?: string;
}

export interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  versesCount: number;
  revelationType: 'Makki' | 'Madani';
  pageStart: number;
  juzStart: number;
}

export interface JuzInfo {
  juzNumber: number;
  nameArabic: string;
  surahStartId: number;
  ayahStart: number;
  pageStart: number;
}

export interface Ayah {
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
  juzNumber: number;
  textArabic: string;
  textQaloonNote?: string; // Notes on Qaloon Riwaya specifics (Sila, Tashil, etc.)
  audioUrl?: string;
}

export type TestType = 'continue_verse' | 'next_verse' | 'random_prompt' | 'qaloon_rules';

export interface MemorizationTest {
  id: string;
  studentId: string;
  date: string;
  testType: TestType;
  score: number; // 0 - 100
  surahId: number;
  startAyah: number;
  endAyah: number;
  status: 'passed' | 'failed' | 'in_progress';
  questionCount: number;
  correctCount: number;
  notes?: string;
}

export interface OfflineSyncStatus {
  isOfflineMode: boolean;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  storageEngine: 'SQLite (IndexedDB)' | 'LocalStorage Cache';
}
