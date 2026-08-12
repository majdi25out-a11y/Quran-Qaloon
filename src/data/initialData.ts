import { Student, RecitationSession, MemorizationTest } from '../types/quran';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_1',
    name: 'Youssef Ben Ali',
    group: 'Groupe Qaloon A - Matin',
    age: 14,
    level: 'Avancé (Hifz 15 Juz)',
    phone: '+216 98 123 456',
    targetSurahId: 4, // An-Nisa
    targetAyahStart: 27,
    targetAyahEnd: 43,
    joinedDate: '2025-09-10',
    avatarColor: 'bg-emerald-600',
    lastSessionDate: '2026-08-11'
  },
  {
    id: 'std_2',
    name: 'Amina Trabelsi',
    group: 'Groupe Qaloon A - Matin',
    age: 12,
    level: 'Intermédiaire (Juz Amma & Tabarak)',
    phone: '+216 22 987 654',
    targetSurahId: 67, // Al-Mulk
    targetAyahStart: 1,
    targetAyahEnd: 15,
    joinedDate: '2025-10-01',
    avatarColor: 'bg-amber-600',
    lastSessionDate: '2026-08-10'
  },
  {
    id: 'std_3',
    name: 'Mohamed Kallel',
    group: 'Groupe Qaloon B - Soir',
    age: 16,
    level: 'Expert (30 Juz - Muraja\'a)',
    phone: '+216 55 443 322',
    targetSurahId: 2, // Al-Baqarah
    targetAyahStart: 1,
    targetAyahEnd: 30,
    joinedDate: '2025-01-15',
    avatarColor: 'bg-indigo-600',
    lastSessionDate: '2026-08-12'
  },
  {
    id: 'std_4',
    name: 'Khadija Mansouri',
    group: 'Groupe Qaloon A - Matin',
    age: 11,
    level: 'Débutant (Juz 30)',
    phone: '+216 94 332 110',
    targetSurahId: 112, // Al-Ikhlas
    targetAyahStart: 1,
    targetAyahEnd: 4,
    joinedDate: '2026-01-08',
    avatarColor: 'bg-rose-600',
    lastSessionDate: '2026-08-09'
  },
  {
    id: 'std_5',
    name: 'Bilal Saidani',
    group: 'Groupe Qaloon B - Soir',
    age: 15,
    level: 'Intermédiaire (Juz 28 & 29)',
    phone: '+216 21 667 889',
    targetSurahId: 36, // Ya-Sin
    targetAyahStart: 1,
    targetAyahEnd: 25,
    joinedDate: '2025-11-20',
    avatarColor: 'bg-cyan-600',
    lastSessionDate: '2026-08-08'
  }
];

export const INITIAL_SESSIONS: RecitationSession[] = [
  {
    id: 'sess_1',
    studentId: 'std_1',
    date: '2026-08-11T09:30:00Z',
    surahId: 4, // An-Nisa
    startAyah: 27,
    endAyah: 33,
    grade: 'good',
    durationMinutes: 20,
    notes: 'Bonne maîtrise globale. Légère hésitation sur les règles de Silah de la Mim al-Jam\' à l\'Aya 29.',
    errors: [
      {
        id: 'err_1',
        sessionId: 'sess_1',
        studentId: 'std_1',
        surahId: 4,
        ayahNumber: 29,
        category: 'qaloon_specific',
        description: 'Omission de la Sila sur "أَنفُسَكُمْ" (Qaloon exige "أنفُسَكُمُۥ")',
        timestamp: '2026-08-11T09:35:10Z',
        severity: 'minor'
      },
      {
        id: 'err_2',
        sessionId: 'sess_1',
        studentId: 'std_1',
        surahId: 4,
        ayahNumber: 31,
        category: 'hesitation',
        description: 'Hésitation sur le mot "مُّدْخَلًا كَرِيمًا"',
        timestamp: '2026-08-11T09:38:00Z',
        severity: 'minor'
      }
    ]
  },
  {
    id: 'sess_2',
    studentId: 'std_2',
    date: '2026-08-10T10:15:00Z',
    surahId: 67, // Al-Mulk
    startAyah: 1,
    endAyah: 15,
    grade: 'excellent',
    durationMinutes: 15,
    notes: 'Récitation très fluide et respect des règles de Qaloon exemplaire.',
    errors: []
  },
  {
    id: 'sess_3',
    studentId: 'std_3',
    date: '2026-08-12T08:00:00Z',
    surahId: 2, // Al-Baqarah
    startAyah: 1,
    endAyah: 20,
    grade: 'excellent',
    durationMinutes: 25,
    notes: 'Révision parfaite d\'Al-Baqarah avec mémorisation solide.',
    errors: []
  },
  {
    id: 'sess_4',
    studentId: 'std_1',
    date: '2026-08-04T09:00:00Z',
    surahId: 4,
    startAyah: 1,
    endAyah: 20,
    grade: 'needs_work',
    durationMinutes: 22,
    notes: 'Plusieurs omissions de versets complets.',
    errors: [
      {
        id: 'err_3',
        sessionId: 'sess_4',
        studentId: 'std_1',
        surahId: 4,
        ayahNumber: 12,
        category: 'memorization',
        description: 'Saut d\'un quart de verset dans l\'héritage',
        timestamp: '2026-08-04T09:12:00Z',
        severity: 'major'
      },
      {
        id: 'err_4',
        sessionId: 'sess_4',
        studentId: 'std_1',
        surahId: 4,
        ayahNumber: 15,
        category: 'tajweed',
        description: 'Non respect du Mad Ja\'iz Munfasil',
        timestamp: '2026-08-04T09:18:00Z',
        severity: 'minor'
      }
    ]
  }
];

export const INITIAL_TESTS: MemorizationTest[] = [
  {
    id: 'test_1',
    studentId: 'std_1',
    date: '2026-08-10T11:00:00Z',
    testType: 'continue_verse',
    score: 92,
    surahId: 4,
    startAyah: 27,
    endAyah: 35,
    status: 'passed',
    questionCount: 5,
    correctCount: 4,
    notes: 'Très bonne réactivité sur la suite des versets'
  },
  {
    id: 'test_2',
    studentId: 'std_2',
    date: '2026-08-08T10:00:00Z',
    testType: 'next_verse',
    score: 85,
    surahId: 67,
    startAyah: 1,
    endAyah: 10,
    status: 'passed',
    questionCount: 4,
    correctCount: 3,
    notes: 'Réussi avec de petites hésitations'
  },
  {
    id: 'test_3',
    studentId: 'std_4',
    date: '2026-08-05T14:00:00Z',
    testType: 'random_prompt',
    score: 60,
    surahId: 112,
    startAyah: 1,
    endAyah: 4,
    status: 'failed',
    questionCount: 3,
    correctCount: 1,
    notes: 'Besoin de répéter l\'Aya 3 et 4'
  }
];
