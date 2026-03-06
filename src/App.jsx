import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Trash2, X, Play, Check, Plus, RotateCcw, Loader2 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- 1. Firebase 設定 (実際の値をここに直接貼り付けるのが一番確実です) ---
const firebaseConfig = {
  apiKey: "ここに実際のAPIキーを貼り付け",
  authDomain: "ここにドメインを貼り付け",
  projectId: "ここにプロジェクトIDを貼り付け",
  storageBucket: "ここにバケット名を貼り付け",
  messagingSenderId: "ここにIDを貼り付け",
  appId: "ここにAppIDを貼り付け"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'morning-routine-app-v1';

// --- 2. アイコン・ビジュアルパーツ (オールインワン) ---

const OnigiriIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C65 15, 85 70, 85 80 C85 85, 75 90, 50 90 C25 90, 15 85, 15 80 C15 70, 35 15, 50 15 Z" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
    <path d="M35 75 L65 75 L65 90 C50 92, 50 92, 35 90 Z" fill="#1A1A1A" />
    <circle cx="50" cy="55" r="6" fill="#F43F5E" opacity="0.8" />
  </svg>
);

const CupIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M70 45 C85 45, 85 75, 70 75" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M25 30 L75 30 L70 85 C70 90, 30 90, 30 85 Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="3" />
    <ellipse cx="50" cy="35" rx="22" ry="5" fill="#BFDBFE" />
  </svg>
);

const WaterIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15 C50 15, 80 50, 80 70 C80 85, 65 95, 50 95 C35 95, 20 85, 20 70 C20 50, 50 15, 50 15 Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="3" />
    <path d="M40 60 C35 65, 35 75, 40 80" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const ClothesIcon = ({ size = 40, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M30 20 L20 35 L30 45 L30 85 L70 85 L70 45 L80 35 L70 20 L60 25 C55 20, 45 20, 40 25 L30 20 Z" fill={active ? "#FFFFFF" : "#F472B6"} stroke={active ? "#F472B6" : "#DB2777"} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const CustomSparkleIcon = ({ size = 40, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z" fill={active ? "#FFFFFF" : "#FDE047"} stroke={active ? "#FDE047" : "#EAB308"} strokeWidth="4" />
  </svg>
);

const StarMark = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg overflow-visible">
    <path d="M50 5 L63 38 L98 38 L70 59 L81 92 L50 72 L19 92 L30 59 L2 38 L37 38 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);

const UsagiCharacter = ({ size = 150, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" fill="none" className={className}>
    <ellipse cx="130" cy="120" rx="45" ry="110" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <ellipse cx="270" cy="120" rx="45" ry="110" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <circle cx="200" cy="270" r="120" fill="white" stroke="#CBD5E1" strokeWidth="8"/>
    <circle cx="155" cy="260" r="15" fill="#0F172A" />
    <circle cx="245" cy="260" r="15" fill="#0F172A" />
    <circle cx="200" cy="295" r="10" fill="#F43F5E" />
    <path d="M175 325C190 335 210 335 225 325" stroke="#F43F5E" strokeWidth="10" strokeLinecap="round" fill="none"/>
  </svg>
);

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

const VisualCircleTimer = ({ secondsLeft, totalSeconds, size = 80 }) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const percentage = totalSeconds > 0 ? (secondsLeft / totalSeconds) : 0;
  const strokeDashoffset = circumference * (1 - percentage);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="white" stroke="#f0fdfa" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius / 2} fill="transparent" stroke="#7fffd4" strokeWidth={radius} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" />
      </svg>
    </div>
  );
};

// --- 3. メインロジック ---

const App = () => {
  const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [departureTime, setDepartureTime] = useState("08:00");
  const [tasks, setTasks] = useState([]);
  const [stamps, setStamps] = useState([false, false, false, false, false, false, false]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskSecondsLeft, setTaskSecondsLeft] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'routine_data');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tasks) setTasks(data.tasks);
        if (data.departureTime) setDepartureTime(data.departureTime);
        if (data.stamps) setStamps(data.stamps);
      } else {
        setTasks([
          { id: 1, label: 'あさごはん', duration: 20, icon: 'onigiri', completed: false },
          { id: 2, label: 'きがえ', duration: 10, icon: 'clothes', completed: false }
        ]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false); // エラーが起きても画面は出す
    });
    return () => unsubscribe();
  }, [user]);

  const saveData = async (updates) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'routine_data');
    await setDoc(docRef, { ...updates }, { merge: true });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval = null;
    if (activeTaskId !== null && taskSecondsLeft > 0) {
      interval = setInterval(() => setTaskSecondsLeft(prev => prev - 1), 1000);
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

  const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  // --- Handlers ---
  const startTask = (id, duration) => { setActiveTaskId(id); setTaskSecondsLeft(duration * 60); };
  const finishTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: true } : t);
    setTasks(updated); setActiveTaskId(null); await saveData({ tasks: updated });
  };
  const addTask = async () => {
    const updated = [...tasks, { id: Date.now(), label: '新しいおしたく', duration: 5, icon: 'sparkle', completed: false }];
    setTasks(updated); await saveData({ tasks: updated });
  };
  const deleteTask = async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated); await saveData({ tasks: updated });
  };
  const updateTaskDetail = async (id, field, value) => {
    const updated = tasks.map(t => t.id === id ? { ...t, [field]: field === 'duration' ? (parseInt(value) || 0) : value } : t);
    setTasks(updated); await saveData({ tasks: updated });
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-pink-50 text-pink-500 font-black">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p>じゅんびちゅう...</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-[3rem] border-4 border-pink-200 overflow-hidden flex flex-col">
        {/* HEADER */}
        <header className="bg-gradient-to-b from-pink-400 to-pink-500 p-6 text-white relative">
          <button onClick={() => setIsSettingsOpen(true)} className="absolute left-6 top-6 p-2 bg-white/20 rounded-full hover:bg-white/30">
            <Settings size={24} />
          </button>
          <h1 className="text-center text-xl font-black">🎀 あさの したくボード 🎀</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300 text-gray-800">
              <span className="text-[10px] font-black text-pink-500 block">いまのじかん</span>
              <div className="text-2xl font-mono font-black">{currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300 text-gray-800">
              <span className="text-[10px] font-black text-pink-500 block">しゅっぱつ</span>
              <div className="text-2xl font-mono font-black">{departureTime}</div>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div className={`w-full py-4 rounded-[2.5rem] border-4 text-center ${timeUntilDeparture > 5 ? 'bg-yellow-400 border-yellow-200' : 'bg-red-500 border-red-300 animate-pulse'}`}>
              <div className="text-5xl font-mono font-black">{timeUntilDeparture}<span className="text-xl ml-1">分</span></div>
            </div>
            <UsagiCharacter size={100} className="mt-4" />
          </div>
        </header>

        {/* LIST */}
        <main className="p-4 space-y-4 flex-1 bg-rose-50/10">
          {tasks.map(task => (
            <div key={task.id} className={`flex items-center p-4 rounded-[2rem] border-4 shadow-sm ${task.completed ? 'bg-green-50 border-green-200 opacity-60' : activeTaskId === task.id ? 'bg-rose-500 border-rose-300 scale-105' : 'bg-white border-pink-50'}`}>
              <div className="mr-4">
                {activeTaskId === task.id ? <VisualCircleTimer secondsLeft={taskSecondsLeft} totalSeconds={task.duration * 60} size={60} /> : <TaskIcon name={task.icon} size={35} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-black ${task.completed ? 'line-through' : activeTaskId === task.id ? 'text-white text-xl' : 'text-gray-700'}`}>{task.label}</h3>
              </div>
              <div>
                {!task.completed && activeTaskId !== task.id && (
                  <button onClick={() => startTask(task.id, task.duration)} disabled={activeTaskId !== null} className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center">
                    <Play size={20} fill="white" />
                  </button>
                )}
                {activeTaskId === task.id && <button onClick={() => finishTask(task.id)} className="bg-white text-rose-500 px-4 py-2 rounded-full font-black animate-bounce">できた！</button>}
                {task.completed && <StarMark size={40} />}
              </div>
            </div>
          ))}
        </main>

        {/* FOOTER */}
        <footer className="p-6 bg-white border-t-4 border-pink-50">
          <button onClick={handleDayFinish} disabled={!allCompleted} className={`w-full py-6 rounded-[2rem] text-2xl font-black ${allCompleted ? 'bg-pink-500 text-white shadow-xl' : 'bg-gray-100 text-gray-300'}`}>
            {allCompleted ? '✨ できたよ！' : 'がんばろう！'}
          </button>
        </footer>
      </div>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl">おとなの設定</h2>
              <button onClick={() => setIsSettingsOpen(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <input type="time" value={departureTime} onChange={(e) => {setDepartureTime(e.target.value); saveData({departureTime: e.target.value})}} className="w-full p-4 bg-pink-50 rounded-2xl text-2xl font-black text-center" />
              {tasks.map(t => (
                <div key={t.id} className="p-4 bg-pink-50 rounded-2xl relative">
                  <button onClick={() => deleteTask(t.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><Trash2 size={14}/></button>
                  <input value={t.label} onChange={(e) => updateTaskDetail(t.id, 'label', e.target.value)} className="w-full p-2 mb-2 rounded-lg border-2 font-bold" />
                  <div className="flex gap-2">
                    <select value={t.icon} onChange={(e) => updateTaskDetail(t.id, 'icon', e.target.value)} className="flex-1 p-2 rounded-lg border-2 font-bold">
                      <option value="onigiri">おにぎり</option>
                      <option value="clothes">おようふく</option>
                      <option value="cup">コップ</option>
                      <option value="water">おみず</option>
                      <option value="sparkle">キラキラ</option>
                    </select>
                    <input type="number" value={t.duration} onChange={(e) => updateTaskDetail(t.id, 'duration', e.target.value)} className="w-16 p-2 rounded-lg border-2 text-center font-bold" />
                  </div>
                </div>
              ))}
              <button onClick={addTask} className="w-full py-4 border-4 border-dashed rounded-2xl text-pink-400 font-black"><Plus size={24} className="inline mr-2" />追加</button>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-5 bg-pink-500 text-white rounded-2xl font-black">とじる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
