import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  Star, 
  Trash2, 
  Save, 
  X, 
  Heart,
  Smile,
  Play,
  Pause
} from 'lucide-react';

// --- カスタムアイコンコンポーネント ---

const OnigiriIcon = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C65 15, 85 70, 85 80 C85 85, 75 90, 50 90 C25 90, 15 85, 15 80 C15 70, 35 15, 50 15 Z" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
    <path d="M35 75 L65 75 L65 90 C50 92, 50 92, 35 90 Z" fill="#1A1A1A" />
    <circle cx="50" cy="55" r="6" fill="#F43F5E" opacity="0.8" />
  </svg>
);

const CupIcon = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M70 45 C85 45, 85 75, 70 75" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M25 30 L75 30 L70 85 C70 90, 30 90, 30 85 Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="3" />
    <ellipse cx="50" cy="35" rx="22" ry="5" fill="#BFDBFE" />
    <circle cx="20" cy="25" r="3" fill="#FDE047" className="animate-pulse" />
  </svg>
);

const WaterIcon = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C50 15, 80 50, 80 70 C80 85, 65 95, 50 95 C35 95, 20 85, 20 70 C20 50, 50 15, 50 15 Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="3" />
    <path d="M40 60 C35 65, 35 75, 40 80" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    <circle cx="75" cy="40" r="5" fill="#0EA5E9" opacity="0.6" />
    <path d="M85 65 L88 72 L95 75 L88 78 L85 85 L82 78 L75 75 L82 72 Z" fill="#FDE047" className="animate-pulse" />
  </svg>
);

const ClothesIcon = ({ size = 60, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M30 20 L20 35 L30 45 L30 85 L70 85 L70 45 L80 35 L70 20 L60 25 C55 20, 45 20, 40 25 L30 20 Z" fill={active ? "#FFFFFF" : "#F472B6"} stroke={active ? "#F472B6" : "#DB2777"} strokeWidth="3" strokeLinejoin="round" />
    <path d="M45 45 Q50 40 55 45 Q55 50 50 55 Q45 50 45 45 Z" fill={active ? "#F472B6" : "white"} opacity="0.9" />
  </svg>
);

const CustomSparkleIcon = ({ size = 60, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z" fill={active ? "#FFFFFF" : "#FDE047"} stroke={active ? "#FDE047" : "#EAB308"} strokeWidth="4" strokeLinejoin="round" />
    <path d="M80 20 L84 30 L94 34 L84 38 L80 48 L76 38 L66 34 L76 30 Z" fill={active ? "#FDE047" : "#FEF08A"} className="animate-pulse" />
  </svg>
);

const StarMark = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg overflow-visible">
    <path d="M50 5 L63 38 L98 38 L70 59 L81 92 L50 72 L19 92 L30 59 L2 38 L37 38 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="85" cy="20" r="4" fill="#FFD700" className="animate-pulse" />
    <circle cx="15" cy="25" r="3" fill="#FFD700" className="animate-pulse" />
  </svg>
);

const UsagiCharacter = ({ size = 150 }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" fill="none">
    <ellipse cx="130" cy="120" rx="45" ry="110" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <ellipse cx="130" cy="120" rx="25" ry="70" fill="#F43F5E" />
    <ellipse cx="270" cy="120" rx="45" ry="110" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <ellipse cx="270" cy="120" rx="25" ry="70" fill="#F43F5E" />
    <circle cx="200" cy="270" r="120" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <circle cx="120" cy="290" r="25" fill="#FFE4E6" />
    <circle cx="280" cy="290" r="25" fill="#FFE4E6" />
    <circle cx="155" cy="260" r="15" fill="#0F172A" />
    <circle cx="245" cy="260" r="15" fill="#0F172A" />
    <circle cx="200" cy="295" r="10" fill="#F43F5E" />
    <path d="M175 325C190 335 210 335 225 325" stroke="#F43F5E" strokeWidth="10" strokeLinecap="round" fill="none"/>
  </svg>
);

const VisualCircleTimer = ({ secondsLeft, totalSeconds, size = 80 }) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const percentage = (secondsLeft / totalSeconds);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="white" stroke="#f0fdfa" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius / 2}
          fill="transparent"
          stroke="#7fffd4"
          strokeWidth={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 border-4 border-white/40 rounded-full shadow-inner pointer-events-none" />
      <div className="absolute inset-0 border-2 border-[#7fffd4]/30 rounded-full pointer-events-none" />
    </div>
  );
};

// --- メインコンポーネント ---

const TaskIcon = ({ name, size = 50, active = false }) => {
  const props = { size, className: active ? "text-white" : "text-pink-600" };
  switch (name) {
    case 'onigiri': return <OnigiriIcon size={size} />;
    case 'clothes': return <ClothesIcon size={size} active={active} />;
    case 'cup': return <CupIcon size={size} />;
    case 'water': return <WaterIcon size={size} />;
    case 'sparkle': return <CustomSparkleIcon size={size} active={active} />;
    case 'heart': return <Heart {...props} className={active ? "text-white" : "text-rose-500"} />;
    default: return <Smile {...props} />;
  }
};

const App = () => {
  const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [departureTime, setDepartureTime] = useState("08:00");
  const [tasks, setTasks] = useState([
    { id: 1, label: 'あさごはん', duration: 30, icon: 'onigiri', completed: false },
    { id: 2, label: 'きがえ', duration: 10, icon: 'clothes', completed: false },
    { id: 3, label: 'はみがき', duration: 10, icon: 'cup', completed: false },
    { id: 4, label: 'トイレ', duration: 3, icon: 'heart', completed: false },
    { id: 5, label: 'かおをふく', duration: 3, icon: 'water', completed: false },
    { id: 6, label: 'わすれものチェック', duration: 5, icon: 'sparkle', completed: false },
  ]);
  const [stamps, setStamps] = useState([false, false, false, false, false, false, false]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskSecondsLeft, setTaskSecondsLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval = null;
    if (activeTaskId !== null && taskSecondsLeft > 0) {
      interval = setInterval(() => setTaskSecondsLeft((prev) => prev - 1), 1000);
    } else if (taskSecondsLeft === 0 && activeTaskId !== null) {
      setActiveTaskId(null);
    }
    return () => clearInterval(interval);
  }, [activeTaskId, taskSecondsLeft]);

  const timeUntilDeparture = useMemo(() => {
    const [h, m] = departureTime.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - currentTime.getTime();
    return Math.max(0, Math.floor(diff / 60000));
  }, [currentTime, departureTime]);

  const allCompleted = tasks.every(t => t.completed);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.completed && activeTaskId === id) setActiveTaskId(null);
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const startTask = (task, e) => {
    e.stopPropagation();
    if (activeTaskId === task.id) {
      setActiveTaskId(null);
    } else {
      setActiveTaskId(task.id);
      setTaskSecondsLeft(task.duration * 60);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatTaskTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full bg-pink-50 font-sans text-gray-800 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-4 border-pink-200 flex flex-col">
        
        {/* HEADER: 大きな時計とうさぎさん */}
        <div className="bg-gradient-to-b from-pink-400 to-pink-500 p-6 text-white shrink-0 relative">
          <button onClick={() => setIsSettingsOpen(true)} className="absolute left-6 top-6 p-3 bg-white/20 hover:bg-white/30 rounded-full z-10"><Settings size={28} /></button>
          
          <h1 className="text-2xl font-black tracking-wider uppercase text-center mb-6 drop-shadow-sm">🎀 あさの したくボード 🎀</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-[2rem] border-4 border-pink-300 shadow-lg text-center transform hover:scale-105 transition-transform">
              <span className="text-sm font-black text-pink-500 block uppercase mb-1">いまの じかん</span>
              <div className="text-5xl font-mono font-black text-black leading-none">{formatTime(currentTime)}</div>
            </div>
            <div className="bg-white p-4 rounded-[2rem] border-4 border-pink-300 shadow-lg text-center transform hover:scale-105 transition-transform">
              <span className="text-sm font-black text-pink-500 block uppercase mb-1">しゅっぱつ</span>
              <div className="text-5xl font-mono font-black text-black leading-none">{departureTime}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className={`w-full max-w-md px-8 py-6 rounded-[3rem] border-4 shadow-xl transition-all duration-500 flex flex-col items-center ${timeUntilDeparture > 5 ? 'bg-yellow-400 border-yellow-200' : 'bg-red-500 border-red-300 animate-pulse'}`}>
              <span className={`text-base font-black block uppercase mb-1 ${timeUntilDeparture > 5 ? 'text-yellow-700' : 'text-white'}`}>しゅっぱつ まで あと</span>
              <div className={`text-8xl font-mono font-black leading-none ${timeUntilDeparture > 5 ? 'text-yellow-900' : 'text-white'}`}>
                {timeUntilDeparture}<span className="text-3xl ml-2 font-sans">分</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center w-full py-4">
              <div className="bg-white text-rose-600 px-6 py-4 rounded-[2rem] border-4 border-pink-300 shadow-lg relative mr-4 max-w-[220px]">
                <p className="text-xl font-black leading-tight text-center">
                  {timeUntilDeparture > 10 ? "じゅんび はじめよう！" : timeUntilDeparture > 0 ? "あとすこし！がんばれ！" : "しゅっぱつ の じかん だよ！"}
                </p>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[15px] border-l-pink-300"></div>
                <div className="absolute top-1/2 -right-[10px] -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-white"></div>
              </div>
              <UsagiCharacter size={160} />
            </div>
          </div>
        </div>

        {/* LIST AREA: 大きくて押しやすいタスク */}
        <div className="p-6 bg-rose-50/10">
          <div className="flex flex-col gap-4">
            {tasks.map((task) => {
              const isActive = activeTaskId === task.id;
              return (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)} 
                  className={`flex items-center p-5 rounded-[3rem] cursor-pointer transition-all border-4 relative min-h-[120px] shadow-sm ${
                    task.completed 
                    ? 'bg-green-50 border-green-200 opacity-60' 
                    : isActive 
                      ? 'bg-rose-500 border-rose-300 shadow-2xl scale-[1.03] z-10' 
                      : 'bg-white border-white hover:border-pink-200 hover:shadow-md'
                  }`}
                >
                  <div className="mr-6 shrink-0 relative">
                    {isActive ? (
                      <VisualCircleTimer secondsLeft={taskSecondsLeft} totalSeconds={task.duration * 60} size={100} />
                    ) : (
                      <div className={`p-5 rounded-[2rem] border-2 shadow-inner ${
                        task.completed ? 'bg-green-100 border-green-200' : 'bg-pink-50 border-pink-100'
                      }`}>
                        <TaskIcon name={task.icon} active={isActive} size={50} />
                      </div>
                    )}
                    {task.completed && <div className="absolute -top-10 -left-10 animate-in fade-in zoom-in duration-300 z-20"><StarMark size={130} /></div>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-2xl font-black leading-tight ${task.completed ? 'line-through text-gray-400' : isActive ? 'text-white' : 'text-gray-700'}`}>{task.label}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isActive ? (
                        <p className="text-3xl font-mono font-black text-white">{formatTaskTime(taskSecondsLeft)}</p>
                      ) : (
                        <p className={`text-lg font-bold ${task.completed ? 'text-gray-400' : 'text-pink-400'}`}>{task.duration}ぷん</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!task.completed && (
                      <button 
                        onClick={(e) => startTask(task, e)} 
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-90 ${
                          isActive ? 'bg-white text-rose-500' : 'bg-pink-400 text-white'
                        }`}
                      >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                      </button>
                    )}
                    <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-yellow-100 border-yellow-300 shadow-inner' : isActive ? 'border-white/30' : 'border-pink-100'
                    }`}>
                      {task.completed && <Star size={36} className="text-yellow-500 fill-yellow-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER: 完了ボタンとスタンプ */}
        <div className="p-8 bg-white border-t-4 border-pink-100 space-y-6 shrink-0">
          <button
            onClick={() => {
              if (allCompleted) {
                const today = (currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1);
                const newStamps = [...stamps];
                newStamps[today] = true;
                setStamps(newStamps);
                setShowGoalModal(true);
              }
            }}
            disabled={!allCompleted}
            className={`w-full py-8 rounded-[3rem] text-4xl font-black shadow-2xl transition-all transform active:scale-95 ${
              allCompleted 
              ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white hover:from-pink-500 hover:to-rose-600' 
              : 'bg-gray-200 text-gray-400 border-b-8 border-gray-300'
            }`}
          >
            {allCompleted ? '✨ できたよ！' : 'きょうも がんばろう！'}
          </button>

          <div className="bg-rose-50/50 rounded-[3rem] p-6 border-4 border-rose-100 shadow-inner">
            <p className="text-center font-black text-rose-700 mb-4 flex items-center justify-center text-lg">
              <Star className="inline mr-2 fill-rose-500 text-rose-500" size={24} />
              できたね！スタンプ
            </p>
            <div className="flex justify-between gap-3">
              {DAYS_OF_WEEK.map((day, index) => {
                const isToday = index === (currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1);
                const hasStamp = stamps[index];
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-full aspect-square rounded-[1.5rem] border-4 flex items-center justify-center transition-all shadow-md ${
                        hasStamp 
                          ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-600 text-white' 
                          : isToday 
                            ? 'bg-white border-pink-400 border-dashed animate-pulse' 
                            : 'bg-white border-rose-100 border-dashed opacity-50'
                      }`}
                    >
                      {hasStamp 
                        ? <Star size={40} fill="white" className="drop-shadow-sm" /> 
                        : isToday 
                          ? <Smile size={30} className="text-pink-300" /> 
                          : null
                      }
                    </div>
                    <span className={`text-base mt-2 font-black ${isToday ? 'text-pink-600 underline underline-offset-4 decoration-4' : 'text-rose-200'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 設定モーダル */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-rose-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl border-4 border-pink-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-700 flex items-center"><Settings className="mr-2 text-pink-500" /> おとなの設定</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={32} /></button>
            </div>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-black text-gray-500 mb-2 uppercase tracking-widest text-center">出発する時間</label>
                <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full p-6 bg-pink-50 border-4 border-pink-100 rounded-[2rem] text-4xl font-black text-rose-600 outline-none text-center shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-500 mb-2 uppercase tracking-widest text-center">タスクの時間 (分)</label>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-3 bg-pink-50/30 p-3 rounded-2xl border-2 border-pink-50">
                      <span className="text-sm font-black text-gray-600 w-32 truncate">{task.label}</span>
                      <input type="number" min="1" value={task.duration} onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setTasks(tasks.map(t => t.id === task.id ? { ...t, duration: val } : t));
                      }} className="w-20 p-2 bg-white border-2 border-pink-200 rounded-xl text-center font-bold text-rose-600" />
                      <span className="text-sm font-bold text-gray-400">分</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-4">
                <button onClick={() => {if(window.confirm("スタンプをけしますか？")) setStamps([false, false, false, false, false, false, false]);}} className="w-full py-5 bg-rose-50 text-rose-500 rounded-[2rem] font-black text-lg shadow-sm border-2 border-rose-100">スタンプを全部消す</button>
                <button onClick={() => setIsSettingsOpen(false)} className="w-full py-6 bg-pink-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-pink-600 transition-colors">設定を保存する</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* おめでとうモーダル */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-rose-500/90 flex items-center justify-center p-4 z-[60] animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[5rem] p-12 text-center shadow-2xl max-w-sm border-8 border-pink-200 relative overflow-hidden">
            <div className="relative inline-block mb-6 transform hover:rotate-12 transition-transform">
              <StarMark size={180} />
            </div>
            <h2 className="text-6xl font-black text-rose-600 mb-4">やったー！</h2>
            <p className="text-2xl font-bold text-gray-600 mb-8 leading-relaxed">じかんまでに<br />ぜんぶ できました！</p>
            <div className="bg-yellow-50 p-8 rounded-[4rem] mb-10 border-4 border-yellow-200 flex items-center justify-center shadow-inner">
              <Smile size={100} className="text-yellow-500 animate-bounce" />
            </div>
            <button 
              onClick={() => {
                setTasks(tasks.map(t => ({ ...t, completed: false })));
                setShowGoalModal(false);
              }} 
              className="w-full py-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-[3rem] text-4xl font-black shadow-2xl active:scale-95 transition-all border-b-8 border-rose-800"
            >
              また あした！
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
