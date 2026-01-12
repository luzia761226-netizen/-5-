
import React from 'react';
import { UserStats } from '../types';

export const StatsBoard: React.FC<{ stats: UserStats }> = ({ stats }) => {
  const accuracy = stats.totalAttempted > 0 
    ? Math.round((stats.correctCount / stats.totalAttempted) * 100) 
    : 0;
  
  const expToNext = 100;
  const progressPercent = (stats.exp % expToNext);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-[#FFEB3B] p-4 rounded-[2rem] border-4 border-[#795548] text-[#795548] shadow-[8px_8px_0px_#795548] relative overflow-hidden">
        <div className="absolute -right-2 -top-2 opacity-20 text-6xl rotate-12">⚡</div>
        <span className="text-xs font-black uppercase">LV. {stats.level} Trainer</span>
        <div className="text-2xl font-black mt-1">{stats.score} XP</div>
        <div className="mt-2 w-full bg-white/50 rounded-full h-3 border-2 border-[#795548]">
          <div className="bg-[#FF5252] h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border-4 border-[#FF5252] text-[#FF5252] shadow-[8px_8px_0px_#FF5252]">
        <div className="flex justify-between items-start">
          <span className="text-xs font-black uppercase">포획 성공률</span>
          <i className="fas fa-circle-dot"></i>
        </div>
        <div className="text-3xl font-black mt-1">{accuracy}%</div>
        <div className="text-xs font-bold mt-1">도감: {stats.correctCount} / {stats.totalAttempted}</div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border-4 border-[#2196F3] text-[#2196F3] shadow-[8px_8px_0px_#2196F3]">
        <div className="flex justify-between items-start">
          <span className="text-xs font-black uppercase">콤보 파워</span>
          <i className="fas fa-bolt"></i>
        </div>
        <div className="text-3xl font-black mt-1">{stats.streak} Hit!</div>
        <div className="text-xs font-bold mt-1">MAX: {stats.maxStreak}</div>
      </div>

      <div className="bg-[#FF5252] p-4 rounded-[2rem] border-4 border-white text-white shadow-[8px_8px_0px_#795548]">
        <div className="flex justify-between items-start">
          <span className="text-xs font-black uppercase">트레이너 등급</span>
          <i className="fas fa-medal"></i>
        </div>
        <div className="text-2xl font-black mt-1">
          {accuracy > 80 ? 'Master' : accuracy > 50 ? 'Elite' : 'Rookie'}
        </div>
        <div className="text-[10px] font-bold mt-1">Badge: {Math.floor(stats.score/50)} Earned</div>
      </div>
    </div>
  );
};
