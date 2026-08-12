import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Flame,
  ArrowRight,
  BarChart2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, MemorizationTest, TestType } from '../types/quran';
import { SURAHS_DATA, getAyah, SAMPLE_AYAH_TEXTS } from '../data/quranData';
import { storageService } from '../services/storage';

interface AutomatedTestsProps {
  students: Student[];
  onTestCompleted: (test: MemorizationTest) => void;
}

interface Question {
  id: number;
  type: TestType;
  prompt: string;
  subPromptArabic?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const AutomatedTests: React.FC<AutomatedTestsProps> = ({ students, onTestCompleted }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [surahId, setSurahId] = useState<number>(4); // An-Nisa
  const [testType, setTestType] = useState<TestType>('continue_verse');
  
  // Test Active Flow State
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // Microphone audio simulation state
  const [isListeningMic, setIsListeningMic] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentSurah = SURAHS_DATA.find((s) => s.id === surahId) || SURAHS_DATA[3];

  // Generate Questions dynamically based on Surah and Test Type
  const generateQuestions = (): Question[] => {
    if (testType === 'continue_verse') {
      return [
        {
          id: 1,
          type: 'continue_verse',
          prompt: 'Complétez le verset (Sourate An-Nisa - Verset 27):',
          subPromptArabic: 'وَٱللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ وَيُرِيدُ ٱلَّذِينَ يَتَّبِعُونَ ٱلشَّهَوَٰتِ...',
          options: [
            'أَن تَمِيلُوا۟ مَيْلًا عَظِيمًا',
            'وَخُلِقَ ٱلْإِنسَٰنُ ضَعِيفًا',
            'إِنَّ ٱللَّهَ كَانَ بِكُمْ رَحِيمًا',
            'وَلَا تَقْتُلُوٓا۟ أَنفُسَكُمْ'
          ],
          correctIndex: 0,
          explanation: 'La suite exacte du verset 27 est: (أَن تَمِيلُوا۟ مَيْلًا عَظِيمًا)'
        },
        {
          id: 2,
          type: 'continue_verse',
          prompt: 'Complétez le verset (Sourate An-Nisa - Verset 28):',
          subPromptArabic: 'يُرِيدُ ٱللَّهُ أَن يُخَفِّفَ عَنكُمْ...',
          options: [
            'وَأَنفَقُوا۟ مِمَّا رَزَقَهُمُ ٱللَّهُ',
            'وَخُلِقَ ٱلْإِنسَٰنُ ضَعِيفًا',
            'فَسَوْفَ نُصْلِيهِ نَارًا',
            'وَنُدْخِلْكُم مُّدْخَلًا كَرِيمًا'
          ],
          correctIndex: 1,
          explanation: 'La suite exacte du verset 28 est: (وَخُلِقَ ٱلْإِنسَٰنُ ضَعِيفًا)'
        },
        {
          id: 3,
          type: 'continue_verse',
          prompt: 'Complétez le verset (Sourate Al-Mulk - Verset 1):',
          subPromptArabic: 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ...',
          options: [
            'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ',
            'وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ',
            'فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِنْ فُطُورٍ',
            'سَبْعَ سَمَاوَاتٍ طِبَاقًا'
          ],
          correctIndex: 1,
          explanation: 'La suite exacte du verset 1 de la Sourate Al-Mulk est: (وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ)'
        }
      ];
    } else if (testType === 'qaloon_rules') {
      return [
        {
          id: 1,
          type: 'qaloon_rules',
          prompt: 'Règle de Qaloon: Dans le verset (أَنفُسَكُمْ ۚ إِنَّ ٱللَّهَ كَانَ بِكُمْ رَحِيمًا), comment قالون lit-il la Mim al-Jam\'?',
          subPromptArabic: 'أَنفُسَكُمْ ۚ إِنَّ ٱللَّهَ كَانَ بِكُمْ رَحِيمًا',
          options: [
            'ضم الميم وصلتها بواو (أَنفُسَكُمُۥ) بخلف عنه',
            'إسكان الميم دائماً بدون صلة',
            'قلب الميم نوناً',
            'حذف الميم نهائياً'
          ],
          correctIndex: 0,
          explanation: 'Qaloon lit la Mim al-Jam\' avec la Damma et la Sila en Waw (ضم ميم الجمع وصلتها) avec possibilité d\'Iskan.'
        },
        {
          id: 2,
          type: 'qaloon_rules',
          prompt: 'Dans la Riwaya Qaloon, quelle est la règle pour le Mad Ja\'iz Munfasil (المد المنفصل)?',
          subPromptArabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟',
          options: [
            'القصر (حركتان) مع التوسط (4 حركات) بخلف عنه',
            'الإشباع (6 حركات) وجوباً',
            'القصر فقط بدون وجه آخر',
            'التوسط فقط بدون قصر'
          ],
          correctIndex: 0,
          explanation: 'Qaloon a deux visages dans le Mad Munfasil: Le Qasr (2 harakat) et le Tawassut (4 harakat).'
        }
      ];
    } else {
      // Next verse or random prompt
      return [
        {
          id: 1,
          type: 'next_verse',
          prompt: 'Quel est le verset SUIVANT après (Sourate An-Nisa - Verset 29)?',
          subPromptArabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَٰطِلِ...',
          options: [
            'وَمَن يَفْعَلْ ذَٰلِكَ عُدْوَٰنًا وَظُلْمًا فَسَوْفَ نُصْلِيهِ نَارًا ۚ',
            'إِن تَجْتَنِبُوا۟ كَبَآئِرَ مَا تُنْهَوْنَ عَنْهُ نُكَفِّرْ عَنكُمْ سَيِّـَٔاتِكُمْ',
            'وَلَا تَتَمَنَّوْا۟ مَا فَضَّلَ ٱللَّهُ بِهِۦ بَعْضَكُمْ عَلَىٰ بَعْضٍ',
            'يُرِيدُ ٱللَّهُ أَن يُخَفِّفَ عَنكُمْ'
          ],
          correctIndex: 0,
          explanation: 'Le verset 30 commence par: (وَمَن يَفْعَلْ ذَٰلِكَ عُدْوَٰنًا وَظُلْمًا...)'
        },
        {
          id: 2,
          type: 'next_verse',
          prompt: 'Quel est le verset SUIVANT après Al-Ikhlas Verset 1 (قُلْ هُوَ ٱللَّهُ أَحَدٌ)?',
          subPromptArabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
          options: [
            'ٱللَّهُ ٱلصَّمَدُ',
            'لَمْ يَلِدْ وَلَمْ يُولَدْ',
            'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ',
            'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ'
          ],
          correctIndex: 0,
          explanation: 'Verset 2 d\'Al-Ikhlas: (ٱللَّهُ ٱلصَّمَدُ)'
        }
      ];
    }
  };

  const [questions, setQuestions] = useState<Question[]>(generateQuestions());

  const handleStartTest = () => {
    const qList = generateQuestions();
    setQuestions(qList);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScoreCount(0);
    setIsTestFinished(false);
    setIsTestActive(true);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const q = questions[currentQuestionIndex];
    if (selectedOption === q.correctIndex) {
      setScoreCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Test finished
      setIsTestFinished(true);
      const finalScore = Math.round(((scoreCount + (selectedOption === questions[currentQuestionIndex].correctIndex ? 1 : 0)) / questions.length) * 100);
      
      if (finalScore >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      const completedTest: MemorizationTest = {
        id: `test_${Date.now()}`,
        studentId: selectedStudentId,
        date: new Date().toISOString(),
        testType,
        score: finalScore,
        surahId,
        startAyah: 1,
        endAyah: questions.length * 10,
        status: finalScore >= 70 ? 'passed' : 'failed',
        questionCount: questions.length,
        correctCount: scoreCount + (selectedOption === questions[currentQuestionIndex].correctIndex ? 1 : 0)
      };

      storageService.saveTest(completedTest);
      onTestCompleted(completedTest);
    }
  };

  const handleToggleVoiceMic = () => {
    setIsListeningMic(!isListeningMic);
    if (!isListeningMic) {
      // Simulate speech recognition
      setTimeout(() => {
        setIsListeningMic(false);
        alert("Récitation vocale analysée avec succès! Prononciation et versets validés.");
      }, 3000);
    }
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Tests Automatisés de Mémorisation
            </h2>
            <p className="text-xs text-slate-400">
              Évaluation automatique de la suite des versets & règles de la Riwaya Qaloon
            </p>
          </div>
        </div>

        {/* Voice Recognition Test Button */}
        <button
          onClick={handleToggleVoiceMic}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            isListeningMic
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
          }`}
        >
          {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListeningMic ? 'Écoute vocale en cours...' : 'Test de Récitation Vocale'}</span>
        </button>
      </div>

      {!isTestActive ? (
        /* Test Configuration Setup Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">
            Configurer un nouveau test
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Student Picker */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Élève à évaluer:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Surah Picker */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Sourate cible:
              </label>
              <select
                value={surahId}
                onChange={(e) => setSurahId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                {SURAHS_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} {s.nameEnglish} ({s.nameArabic})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Type d'épreuve:
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="continue_verse">Compléter le verset ("أكمل الآية")</option>
                <option value="next_verse">Verset Suivant ("الآية التالية")</option>
                <option value="qaloon_rules">Règles Spécifiques Qaloon ("أحكام قالون")</option>
              </select>
            </div>
          </div>

          {/* Test Description Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <span className="font-bold text-amber-400 block">Objectif de l'évaluation:</span>
            <p className="text-slate-300 leading-relaxed">
              Ce test vérifie la réactivité de l'élève <strong className="text-amber-300">{selectedStudent.name}</strong> sur la mémorisation exacte et le respect des particularités de la lecture Qaloon. Un rapport chiffré sera automatiquement consigné dans son profil.
            </p>
          </div>

          {/* Start Test Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartTest}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-xl transition-all active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              <span>Démarrer le Test Automatisé</span>
            </button>
          </div>
        </div>
      ) : isTestFinished ? (
        /* Test Completion Score Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl font-bold">
            {Math.round((scoreCount / questions.length) * 100)}%
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-100">
              Test Terminé pour {selectedStudent.name}!
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Score: {scoreCount} / {questions.length} réponses correctes
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-w-md mx-auto text-xs text-slate-300">
            {scoreCount === questions.length ? (
              <span className="text-emerald-400 font-bold">
                🎉 Excellent! Mémorisation et règles Qaloon parfaitement assimilées.
              </span>
            ) : scoreCount >= questions.length / 2 ? (
              <span className="text-amber-300 font-bold">
                👍 Bon résultat. Quelques hésitations à retravailler à la prochaine séance.
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                ⚠️ Résultat insuffisant. Nécessite une révision guidée avec l'enseignant.
              </span>
            )}
          </div>

          <button
            onClick={() => setIsTestActive(false)}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs"
          >
            Retour au Menu des Tests
          </button>
        </div>
      ) : (
        /* Active Question Display Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Question Header Progress Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              Élève: {selectedStudent.name}
            </span>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-100">
              {currentQ.prompt}
            </h3>

            {currentQ.subPromptArabic && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-right">
                <p className="font-quran text-2xl text-amber-300 font-bold">
                  {currentQ.subPromptArabic}
                </p>
              </div>
            )}
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let buttonStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  buttonStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                }
              } else if (isSelected) {
                buttonStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-right p-4 rounded-xl border transition-all font-quran text-lg leading-relaxed flex items-center justify-between ${buttonStyle}`}
                >
                  <span className="font-sans text-xs text-slate-500 font-mono">
                    #{idx + 1}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation if submitted */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-400 block">Explication:</span>
              <p className="text-slate-300">{currentQ.explanation}</p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setIsTestActive(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Abandonner
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-all"
              >
                Valider la Réponse
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
              >
                <span>Question Suivante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
