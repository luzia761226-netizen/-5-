
import React from 'react';
import { SUBJECTS, GRADES } from '../constants';

interface GeneratorFormProps {
  onGenerate: (subject: string, grade: number, count: number) => void;
  isGenerating: boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isGenerating }) => {
  const [subject, setSubject] = React.useState(SUBJECTS[0]);
  const [grade, setGrade] = React.useState(GRADES[2]); // Default 3rd grade
  const [count, setCount] = React.useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(subject, grade, count);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">교과목 선택</label>
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">학년 설정</label>
          <select 
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {GRADES.map(g => <option key={g} value={g}>{g}학년</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">생성 문항 수</label>
          <input 
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <p className="text-xs text-slate-400 mt-1">* PoC 버전에서는 최대 100개 권장</p>
        </div>
      </div>
      <button 
        disabled={isGenerating}
        type="submit"
        className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
          isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
        }`}
      >
        {isGenerating ? (
          <><i className="fas fa-circle-notch animate-spin"></i> 교육과정 분석 및 생성 중...</>
        ) : (
          <><i className="fas fa-bolt"></i> 학습 문항 대량 생성 시작</>
        )}
      </button>
    </form>
  );
};
