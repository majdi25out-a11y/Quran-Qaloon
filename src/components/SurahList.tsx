import React, { useState } from 'react';
import { Search, BookMarked, Layers, Book, ChevronRight, Bookmark } from 'lucide-react';
import { SURAHS_DATA, JUZ_LIST } from '../data/quranData';
import { Surah, JuzInfo } from '../types/quran';
import { storageService } from '../services/storage';

interface SurahListProps {
  onSelectSurah: (surahId: number, ayahStart?: number) => void;
}

export const SurahList: React.FC<SurahListProps> = ({ onSelectSurah }) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const bookmarks = storageService.getBookmarks();

  // Filter Surahs
  const filteredSurahs = SURAHS_DATA.filter(
    (s) =>
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameArabic.includes(searchQuery) ||
      s.id.toString() === searchQuery.trim() ||
      s.nameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group surahs by Juz for Juz tab
  const getSurahsForJuz = (juz: JuzInfo) => {
    return SURAHS_DATA.filter((s) => s.juzStart === juz.juzNumber);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Search Bar & Tab Controls (Dark App Style matching screenshot) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une sourate (ex: 4, An-Nisa, النساء)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Tabs: SURAHS | JUZ' | BOOKMARKS (Matching Quran Qaloon dark screenshot #3) */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'surahs'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SURAHS ({filteredSurahs.length})
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'juz'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            JUZ' (30)
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MARQUE-PAGES ({bookmarks.length})
          </button>
        </div>
      </div>

      {/* Tab 1: SURAHS LIST */}
      {activeTab === 'surahs' && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl divide-y divide-slate-800/60">
          {filteredSurahs.map((surah) => (
            <div
              key={surah.id}
              onClick={() => onSelectSurah(surah.id)}
              className="group flex items-center justify-between p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* Surah Number Badge */}
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:border-amber-500/40 group-hover:text-amber-400 transition-colors">
                  {surah.id}
                </div>

                {/* Surah Titles & Metadata */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {surah.nameEnglish}
                    </h3>
                    <span className="text-xs text-slate-400 font-arabic">
                      ({surah.nameTranslation})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {surah.revelationType}
                    </span>
                    <span>• {surah.versesCount} versets</span>
                    <span>• Juz {surah.juzStart}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Arabic Title & Page Number */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="text-right">
                  <span className="font-quran text-2xl text-amber-400 font-bold block">
                    {surah.nameArabic}
                  </span>
                  <span className="text-xs text-slate-500 block font-mono">
                    Page {surah.pageStart}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}

          {filteredSurahs.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Aucune sourate ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: JUZ' LIST */}
      {activeTab === 'juz' && (
        <div className="space-y-4">
          {JUZ_LIST.map((juz) => {
            const surahsInJuz = getSurahsForJuz(juz);
            const mainSurah = SURAHS_DATA.find((s) => s.id === juz.surahStartId);
            return (
              <div
                key={juz.juzNumber}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {juz.juzNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">
                        Juz' {juz.juzNumber}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Commence à la page {juz.pageStart} ({mainSurah?.nameEnglish})
                      </p>
                    </div>
                  </div>

                  <span className="font-quran text-xl text-amber-400 font-bold">
                    {juz.nameArabic}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {surahsInJuz.map((surah) => (
                    <button
                      key={surah.id}
                      onClick={() => onSelectSurah(surah.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/30 hover:bg-slate-800/40 text-left transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-amber-400 w-6">
                          #{surah.id}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block">
                            {surah.nameEnglish}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {surah.versesCount} versets
                          </span>
                        </div>
                      </div>
                      <span className="font-quran text-base text-amber-300">
                        {surah.nameArabic}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          {bookmarks.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Aucun marque-page enregistré.</p>
              <p className="text-xs text-slate-500 mt-1">
                Cliquez sur l'icône marque-page dans le lecteur de verset pour ajouter un repère.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {bookmarks.map((bm) => {
                const surah = SURAHS_DATA.find((s) => s.id === bm.surahId);
                return (
                  <div
                    key={bm.id}
                    onClick={() => onSelectSurah(bm.surahId, bm.ayahNumber)}
                    className="p-3.5 hover:bg-slate-800/50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">
                          {surah?.nameEnglish} - Verset {bm.ayahNumber}
                        </h4>
                        {bm.note && (
                          <p className="text-xs text-slate-400 mt-0.5">{bm.note}</p>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ajouté le {new Date(bm.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <span className="font-quran text-lg text-amber-400 font-bold">
                      {surah?.nameArabic}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
