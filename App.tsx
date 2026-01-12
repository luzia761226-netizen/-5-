
import React from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionCard } from './components/QuestionCard';
import { StatsBoard } from './components/StatsBoard';
import { Question, UserStats } from './types';
import { PREGENERATED_QUESTS, generateDivergentFromSeed } from './constants';
import { generatePedagogicalQuestions } from './geminiService';

const App: React.FC = () => {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });
  const [userLocation, setUserLocation] = React.useState<{latitude: number, longitude: number} | undefined>();
  const [stats, setStats] = React.useState<UserStats>({
    score: 0,
    correctCount: 0,
    totalAttempted: 0,
    streak: 0,
    maxStreak: 0,
    level: 1,
    exp: 0
  });

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => console.warn("Location blocked")
    );
    
    const saved = localStorage.getItem('edu_quest_pool_v2');
    if (saved) {
      try {
        setQuestions(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handleGenerate = async (subject: string, grade: number, count: number) => {
    setIsGenerating(true);
    setProgress({ current: 0, total: count });

    // 1. 내장된 5000개급 전문가 DB에서 필터링 (초고속 로딩)
    const localMatches = PREGENERATED_QUESTS.filter(q => q.subject === subject && q.grade === grade);
    let generatedPool: Question[] = [];

    // 2. 확산적 출제 로직: 로컬 DB 기반 변형 생성
    for (let i = 0; i < count; i++) {
      let nextQuest: Question;

      // 만약 로컬 DB에 해당 과목/학년 데이터가 있다면 우선 사용 (속도 극대화)
      if (localMatches.length > 0) {
        const seed = localMatches[Math.floor(Math.random() * localMatches.length)];
        nextQuest = generateDivergentFromSeed(seed);
      } else {
        // 로컬에 없을 때만 제미나이 리얼타임 생성 (최신 정보/지도 기반)
        try {
          nextQuest = await generatePedagogicalQuestions(
            subject, grade, "핵심 성취기준", "창의", "중", "탐구형", userLocation
          );
        } catch (e) {
          // Fallback
          nextQuest = generateDivergentFromSeed(PREGENERATED_QUESTS[0]);
        }
      }

      generatedPool.push(nextQuest);
      setQuestions(prev => {
        const updated = [nextQuest, ...prev].slice(0, 5000);
        localStorage.setItem('edu_quest_pool_v2', JSON.stringify(updated));
        return updated;
      });
      setProgress({ current: i + 1, total: count });
      
      // 사용자 경험을 위해 50ms 쉬어줌 (애니메이션 효과)
      await new Promise(r => setTimeout(r, 50));
    }
    
    setIsGenerating(false);
  };

  const handleQuestionAnswered = (isCorrect: boolean) => {
    setStats(prev => {
      const newCorrect = isCorrect ? prev.correctCount + 1 : prev.correctCount;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const xpGained = isCorrect ? (50 + (newStreak * 10)) : 10;
      const newExp = prev.exp + xpGained;
      const newLevel = Math.floor(newExp / 500) + 1;

      return {
        ...prev,
        score: prev.score + xpGained,
        correctCount: newCorrect,
        totalAttempted: prev.totalAttempted + 1,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        exp: newExp,
        level: newLevel
      };
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-[#FFEB3B] border-b-8 border-[#FBC02D] sticky top-0 z-50 py-4 shadow-md">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FF5252] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white relative">
               <div className="w-full h-1 bg-white absolute top-1/2 -translate-y-1/2"></div>
               <div className="w-4 h-4 bg-white border-2 border-[#795548] rounded-full z-10"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#795548] leading-none italic tracking-tighter">QUEST EDU!</h1>
              <p className="text-sm font-bold text-[#FF5252] uppercase">5000+ Master Database</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="hidden md:flex bg-white px-6 py-2 rounded-full border-4 border-[#795548] items-center gap-2">
               <span className="text-[#795548] font-black">Trainer:</span>
               <span className="text-[#FF5252] font-black">Level {stats.level}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <StatsBoard stats={stats} />

        <div className="mb-12 bg-white p-8 rounded-[3rem] border-8 border-[#FFEB3B] shadow-[12px_12px_0px_#FBC02D] relative overflow-hidden">
           <div className="absolute top-4 right-4 text-[#FFEB3B] opacity-50 text-6xl rotate-12 floating">⚡</div>
           <div className="flex items-center gap-3 mb-6">
              <i className="fas fa-database text-3xl text-[#FF5252]"></i>
              <h2 className="text-2xl font-black text-[#795548] uppercase italic">전문가 문항 저장소 접근</h2>
           </div>
           <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        {isGenerating && (
          <div className="mb-12 p-8 bg-white border-8 border-[#2196F3] rounded-[3rem] shadow-[12px_12px_0px_#1976D2] text-center">
            <div className="text-6xl mb-4 animate-bounce">⚡</div>
            <h3 className="text-2xl font-black text-[#2196F3] mb-4">
              저장소에서 문항 소환 중... ({progress.current}/{progress.total})
            </h3>
            <div className="w-full bg-[#E1F5FE] rounded-full h-8 border-4 border-[#2196F3] overflow-hidden relative">
              <div 
                className="bg-[#2196F3] h-full transition-all duration-300" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.length > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-1 flex-1 bg-[#795548] rounded-full"></div>
                <h3 className="text-3xl font-black text-[#795548] italic uppercase">Battle Log ({questions.length})</h3>
                <div className="h-1 flex-1 bg-[#795548] rounded-full"></div>
              </div>
              {questions.map((q) => (
                <QuestionCard 
                  key={q.id} 
                  question={q} 
                  onAnswered={handleQuestionAnswered}
                />
              ))}
            </>
          ) : !isGenerating && (
            <div className="text-center py-20 bg-white border-8 border-dashed border-[#BCAAA4] rounded-[3rem]">
              <i className="fas fa-search-location text-5xl text-[#BCAAA4] floating mb-4 block"></i>
              <h3 className="text-3xl font-black text-[#795548] mb-2">저장된 문항이 없습니다!</h3>
              <p className="text-[#BCAAA4] font-bold text-xl">상단에서 탐색을 시작하세요!</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 text-center pb-20">
        <p className="text-[#795548] font-black text-lg tracking-widest italic uppercase opacity-50">
          5000+ Internal Database • No Latency Mode • Divergent Quest v2.5
        </p>
      </footer>
    </div>
  );
};

export default App;
