import { Student, RecitationSession, MemorizationTest, AyahError, OfflineSyncStatus } from '../types/quran';
import { INITIAL_STUDENTS, INITIAL_SESSIONS, INITIAL_TESTS } from '../data/initialData';

const KEYS = {
  STUDENTS: 'qaloon_students_v1',
  SESSIONS: 'qaloon_sessions_v1',
  TESTS: 'qaloon_tests_v1',
  BOOKMARKS: 'qaloon_bookmarks_v1',
  OFFLINE_STATUS: 'qaloon_offline_status_v1',
  SYNC_QUEUE: 'qaloon_sync_queue_v1'
};

export interface Bookmark {
  id: string;
  surahId: number;
  ayahNumber: number;
  studentId?: string;
  note?: string;
  createdAt: string;
}

class StorageService {
  private isOfflineMode = false;

  constructor() {
    this.initDefaultData();
    // Listen to window online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineStatusChange(true));
      window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
      this.isOfflineMode = !navigator.onLine;
    }
  }

  private initDefaultData() {
    if (!localStorage.getItem(KEYS.STUDENTS)) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(KEYS.SESSIONS)) {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    }
    if (!localStorage.getItem(KEYS.TESTS)) {
      localStorage.setItem(KEYS.TESTS, JSON.stringify(INITIAL_TESTS));
    }
    if (!localStorage.getItem(KEYS.BOOKMARKS)) {
      const defaultBookmarks: Bookmark[] = [
        {
          id: 'bm_1',
          surahId: 4,
          ayahNumber: 27,
          note: 'Séance Youssef - Page 83 Qaloon Sila',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(defaultBookmarks));
    }
  }

  private handleOnlineStatusChange(online: boolean) {
    this.isOfflineMode = !online;
    if (online) {
      this.syncPendingData();
    }
  }

  // Offline Sync State
  public getOfflineStatus(): OfflineSyncStatus {
    const queue = this.getSyncQueue();
    return {
      isOfflineMode: this.isOfflineMode,
      pendingSyncCount: queue.length,
      lastSyncTime: localStorage.getItem('qaloon_last_sync') || new Date().toISOString(),
      storageEngine: 'SQLite (IndexedDB)'
    };
  }

  public setOfflineModeOverride(offline: boolean) {
    this.isOfflineMode = offline;
    if (!offline) {
      this.syncPendingData();
    }
  }

  private getSyncQueue(): any[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SYNC_QUEUE) || '[]');
    } catch {
      return [];
    }
  }

  private addToSyncQueue(item: { type: string; payload: any; timestamp: string }) {
    const queue = this.getSyncQueue();
    queue.push(item);
    localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  public syncPendingData(): number {
    const queue = this.getSyncQueue();
    const count = queue.length;
    if (count > 0) {
      // Simulate pushing to central server
      localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify([]));
      localStorage.setItem('qaloon_last_sync', new Date().toISOString());
    }
    return count;
  }

  // STUDENTS
  public getStudents(): Student[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public saveStudent(student: Student): Student {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.unshift(student);
    }
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    this.addToSyncQueue({ type: 'SAVE_STUDENT', payload: student, timestamp: new Date().toISOString() });
    return student;
  }

  public deleteStudent(id: string) {
    const students = this.getStudents().filter((s) => s.id !== id);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    this.addToSyncQueue({ type: 'DELETE_STUDENT', payload: { id }, timestamp: new Date().toISOString() });
  }

  // RECITATION SESSIONS
  public getSessions(): RecitationSession[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]');
    } catch {
      return INITIAL_SESSIONS;
    }
  }

  public getSessionsByStudent(studentId: string): RecitationSession[] {
    return this.getSessions().filter((s) => s.studentId === studentId);
  }

  public saveSession(session: RecitationSession): RecitationSession {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));

    // Update student's last session date
    const students = this.getStudents();
    const student = students.find((s) => s.id === session.studentId);
    if (student) {
      student.lastSessionDate = session.date;
      this.saveStudent(student);
    }

    this.addToSyncQueue({ type: 'SAVE_SESSION', payload: session, timestamp: new Date().toISOString() });
    return session;
  }

  // MEMORIZATION TESTS
  public getTests(): MemorizationTest[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.TESTS) || '[]');
    } catch {
      return INITIAL_TESTS;
    }
  }

  public getTestsByStudent(studentId: string): MemorizationTest[] {
    return this.getTests().filter((t) => t.studentId === studentId);
  }

  public saveTest(test: MemorizationTest): MemorizationTest {
    const tests = this.getTests();
    const index = tests.findIndex((t) => t.id === test.id);
    if (index >= 0) {
      tests[index] = test;
    } else {
      tests.unshift(test);
    }
    localStorage.setItem(KEYS.TESTS, JSON.stringify(tests));
    this.addToSyncQueue({ type: 'SAVE_TEST', payload: test, timestamp: new Date().toISOString() });
    return test;
  }

  // BOOKMARKS
  public getBookmarks(): Bookmark[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.BOOKMARKS) || '[]');
    } catch {
      return [];
    }
  }

  public toggleBookmark(surahId: number, ayahNumber: number, note?: string): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex((b) => b.surahId === surahId && b.ayahNumber === ayahNumber);
    let added = false;
    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.unshift({
        id: `bm_${Date.now()}`,
        surahId,
        ayahNumber,
        note,
        createdAt: new Date().toISOString()
      });
      added = true;
    }
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return added;
  }

  public isBookmarked(surahId: number, ayahNumber: number): boolean {
    return this.getBookmarks().some((b) => b.surahId === surahId && b.ayahNumber === ayahNumber);
  }

  // EXPORT / IMPORT BACKUP FOR OFFLINE SQLITE SIMULATION
  public exportBackupJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      students: this.getStudents(),
      sessions: this.getSessions(),
      tests: this.getTests(),
      bookmarks: this.getBookmarks()
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.students)) localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data.students));
      if (Array.isArray(data.sessions)) localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (Array.isArray(data.tests)) localStorage.setItem(KEYS.TESTS, JSON.stringify(data.tests));
      if (Array.isArray(data.bookmarks)) localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
      return true;
    } catch (e) {
      console.error('Import backup error:', e);
      return false;
    }
  }
}

export const storageService = new StorageService();
