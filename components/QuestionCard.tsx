
import React from 'react';
import { Question } from '../types';
import { validateAnswer } from '../geminiService';

interface QuestionCardProps {
  question: Question;
  onAnswered: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswered }) => {
  const [userAnswer, setUserAnswer] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);
  const [showExplanation, setShowExplanation] = React.useState(false);
  const [isShaking, setIsShaking] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || question.status !== 'pending' || isValidating) return;

    setIsValidating(true);
    try {
      const isCorrect = await validateAnswer(question.question, question.answer_key || '', userAnswer);
      
      if (!isCorrect) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
      
      question.status = isCorrect ? 'correct' : 'incorrect';
      question.user_answer = userAnswer;
      onAnswered(isCorrect);
    } catch (error) {
      console.error("Validation failed", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className={`pokemon-card bg-white relative overflow-hidden transition-all duration-500 mb-8 ${
      isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
    } ${
      question.status === 'correct' ? 'border-[#4CAF50] scale-[1.02]' :
      question.status === 'incorrect' ? 'border-[#F44336]' :
      'border-[#FBC02D]'
    }`}>
      {/* Pikachu Ear Decor */}
      <div className="absolute top-0 left-10 w-8 h-12 bg-black rounded-b-full transform -translate-y-6"></div>
      <div className="absolute top-0 right-10 w-8 h-12 bg-black rounded-b-full transform -translate-y-6"></div>

      <div className="px-8 py-4 bg-[#FFF9C4] border-b-4 border-[#FBC02D] flex items-center justify-between">
        <div className="flex gap-2">
          <span className="bg-[#FF5252] text-white px-4 py-1 rounded-full text-sm font-black border-2 border-white shadow-sm">
            WILD QUESTION APPEARED!
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-[#795548] uppercase leading-none">Difficulty</p>
            <p className="text-sm font-black text-[#FF5252]">{question.difficulty}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#FF5252] border-2 border-white shadow-inner"></div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="bg-[#E1F5FE] p-6 rounded-2xl border-4 border-[#2196F3] mb-6 relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#2196F3] rotate-45"></div>
          <p className="text-2xl text-[#01579B] font-black leading-tight">
            {question.question}
          </p>
        </div>

        {question.status === 'pending' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="답을 입력해! 몬스터볼 던지기!"
                className="w-full p-5 bg-white border-4 border-[#795548] rounded-[1.5rem] focus:border-[#FFEB3B] outline-none transition-all font-black text-xl text-[#795548] placeholder-[#BCAAA4]"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={isValidating || !userAnswer.trim()}
                className="py-4 bg-[#FF5252] text-white rounded-[1.5rem] font-black text-xl border-b-8 border-[#D32F2F] hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3"
              >
                {isValidating ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <><i className="fas fa-hurricane"></i> 공격!</>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setUserAnswer('')}
                className="py-4 bg-[#FFEB3B] text-[#795548] rounded-[1.5rem] font-black text-xl border-b-8 border-[#FBC02D] hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all"
              >
                다시쓰기
              </button>
            </div>
          </form>
        ) : (
          <div className={`p-6 rounded-[2rem] border-4 flex items-center gap-6 animate-in zoom-in-95 duration-300 ${
            question.status === 'correct' ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]' : 'bg-[#FFEBEE] border-[#F44336] text-[#C62828]'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0 border-4 border-white shadow-lg ${
              question.status === 'correct' ? 'bg-[#4CAF50] animate-bounce' : 'bg-[#F44336]'
            }`}>
              {question.status === 'correct' ? '⚡' : '💥'}
            </div>
            <div className="flex-1">
              <p className="font-black text-3xl mb-1">
                {question.status === 'correct' ? '효과는 굉장했다!' : '눈앞이 깜깜해졌다...'}
              </p>
              <p className="text-lg font-bold opacity-80">작성한 답: {question.user_answer}</p>
            </div>
          </div>
        )}
        
        {question.status !== 'pending' && (
          <div className="mt-8 border-t-4 border-dotted border-[#BCAAA4] pt-6">
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full py-3 bg-[#795548] text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#5D4037]"
            >
              <i className="fas fa-book-open"></i>
              {showExplanation ? '도감 닫기' : '도감 설명 보기'}
            </button>
            
            {showExplanation && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 bg-[#FFEB3B] rounded-2xl border-2 border-[#795548]">
                  <span className="text-xs font-black text-[#795548] uppercase tracking-widest block mb-1">정답 데이터</span>
                  <p className="text-[#795548] font-black text-xl">{question.answer_key}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border-2 border-[#BCAAA4] shadow-inner">
                  <span className="text-xs font-black text-[#BCAAA4] uppercase block mb-1">학습 가이드</span>
                  <p className="text-[#5D4037] font-bold text-lg leading-snug">{question.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
