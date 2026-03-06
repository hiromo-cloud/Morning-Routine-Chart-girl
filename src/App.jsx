import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Trash2, X, Play, Check, Plus, RotateCcw, Loader2 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// 自作コンポーネントのインポート
import { TaskIcon, StarMark, UsagiCharacter } from './components/Icons';
import { VisualCircleTimer } from './components/VisualTimer';

// Firebase初期化 (Vite環境変数を使用)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_STORAGE_KEY = 'morning-routine-app-v1';

const App = () => {
  // タスクの追加
const addTask = async () => {
  const newTask = {
    id: Date.now(),
    label: '新しいおしたく',
    duration: 5,
    icon: 'sparkle',
    completed: false
  };
  const updated = [...tasks, newTask];
  setTasks(updated);
  await saveData({ tasks: updated });
};

// タスクの削除
const deleteTask = async (id) => {
  const updated = tasks.filter(t => t.id !== id);
  setTasks(updated);
  // 実行中のタスクを消した場合はタイマーをリセット
  if (activeTaskId === id) {
    setActiveTaskId(null);
    setTaskSecondsLeft(0);
  }
  await saveData({ tasks: updated });
};

// タスク内容の更新（名前、アイコン、時間）
const updateTaskDetail = async (id, field, value) => {
  const updated = tasks.map(t => {
    if (t.id === id) {
      let val = value;
      if (field === 'duration') {
        val = value === "" ? 0 : parseInt(value, 10);
        val = isNaN(val) ? 0 : Math.min(60, Math.max(0, val));
      }
      return { ...t, [field]: val };
    }
    return t;
  });
  setTasks(updated);
  await saveData({ tasks: updated });
};
  const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];
  
  // --- States ---
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

  // --- Auth & Data Flow ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_STORAGE_KEY, 'users', user.uid, 'settings', 'routine_data');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tasks) setTasks(data.tasks);
        if (data.departureTime) setDepartureTime(data.departureTime);
        if (data.stamps) setStamps(data.stamps);
      } else {
        // 初期データがない場合のデフォルトセット
        setTasks([
          { id: 1, label: 'あさごはん', duration: 20, icon: 'onigiri', completed: false },
          { id: 2, label: 'きがえ', duration: 10, icon: 'clothes', completed: false },
        ]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Logic ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval = null;
    if (activeTaskId !== null && taskSecondsLeft > 0) {
      interval = setInterval(() => setTaskSecondsLeft(prev => prev - 1), 1000);
    } else if (taskSecondsLeft === 0 && activeTaskId !== null) {
      // タイマー終了時の処理（必要に応じて追加）
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
  const saveData = async (newData) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_STORAGE_KEY, 'users', user.uid, 'settings', 'routine_data');
    await setDoc(docRef, { ...newData }, { merge: true });
  };

  const startTask = (id, duration) => {
    setActiveTaskId(id);
    setTaskSecondsLeft(duration * 60);
  };

  const finishTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: true } : t);
    setTasks(updated);
    setActiveTaskId(null);
    await saveData({ tasks: updated });
  };

  const handleDayFinish = async () => {
    if (!allCompleted) return;
    const todayIndex = (currentTime.getDay() + 6) % 7;
    const newStamps = [...stamps];
    newStamps[todayIndex] = true;
    setStamps(newStamps);
    setShowGoalModal(true);
    await saveData({ stamps: newStamps });
  };

  // --- Render Helpers ---
  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-pink-50">
      <Loader2 className="animate-spin text-pink-500" size={48} />
      <p className="mt-4 font-bold text-pink-400">じゅんびちゅう...</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-[3rem] border-4 border-pink-200 overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <header className="bg-gradient-to-b from-pink-400 to-pink-500 p-6 text-white relative">
          <button onClick={() => setIsSettingsOpen(true)} className="absolute left-6 top-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Settings size={24} />
          </button>
          <h1 className="text-center text-xl md:text-2xl font-black tracking-widest">🎀 あさの したくボード 🎀</h1>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300">
              <span className="text-[10px] font-black text-pink-500 uppercase">いまのじかん</span>
              <div className="text-2xl font-mono font-black text-gray-800">{currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300">
              <span className="text-[10px] font-black text-pink-500 uppercase">しゅっぱつ</span>
              <div className="text-2xl font-mono font-black text-gray-800">{departureTime}</div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-6">
            <div className={`w-full py-4 rounded-[2.5rem] border-4 text-center transition-all ${timeUntilDeparture > 5 ? 'bg-yellow-400 border-yellow-200' : 'bg-red-500 border-red-300 animate-pulse'}`}>
              <span className="text-xs font-black block text-black/60">しゅっぱつまで あと</span>
              <div className="text-5xl font-mono font-black text-white">{timeUntilDeparture}<span className="text-xl ml-1">分</span></div>
            </div>
            <UsagiCharacter size={120} className="mt-4 animate-float" />
          </div>
        </header>

        {/* TASK LIST */}
        <main className="p-4 md:p-6 space-y-4 flex-1">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center p-4 rounded-[2rem] border-4 transition-all ${task.completed ? 'bg-green-50 border-green-200 opacity-60' : activeTaskId === task.id ? 'bg-rose-500 border-rose-300 scale-[1.02]' : 'bg-white border-pink-50'}`}>
              <div className="mr-4 shrink-0">
                {activeTaskId === task.id ? (
                  <VisualCircleTimer secondsLeft={taskSecondsLeft} totalSeconds={task.duration * 60} size={60} />
                ) : (
                  <div className="p-3 bg-pink-50 rounded-2xl">
                    <TaskIcon name={task.icon} active={activeTaskId === task.id} size={30} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-lg ${task.completed ? 'line-through text-gray-400' : activeTaskId === task.id ? 'text-white' : 'text-gray-700'}`}>{task.label}</h3>
                <p className={`text-sm font-bold ${activeTaskId === task.id ? 'text-white/80' : 'text-pink-400'}`}>{activeTaskId === task.id ? `${Math.floor(taskSecondsLeft/60)}分${taskSecondsLeft%60}秒` : `${task.duration}ぷん`}</p>
              </div>
              <div className="ml-2">
                {!task.completed && activeTaskId !== task.id && (
                  <button onClick={() => startTask(task.id, task.duration)} disabled={activeTaskId !== null} className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-30">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </button>
                )}
                {activeTaskId === task.id && (
                  <button onClick={() => finishTask(task.id)} className="bg-white text-rose-500 px-4 py-2 rounded-full font-black shadow-lg animate-bounce">できた！</button>
                )}
                {task.completed && <StarMark size={40} />}
              </div>
            </div>
          ))}
        </main>

        {/* FOOTER */}
        <footer className="p-6 bg-white border-t-4 border-pink-50">
          <button 
            onClick={handleDayFinish}
            disabled={!allCompleted}
            className={`w-full py-6 rounded-[2rem] text-2xl font-black shadow-xl transition-all ${allCompleted ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white active:scale-95' : 'bg-gray-100 text-gray-300'}`}
          >
            {allCompleted ? '✨ できたよ！' : 'きょうも がんばろう！'}
          </button>
          
          <div className="mt-6 flex justify-between gap-2">
            {DAYS_OF_WEEK.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center ${stamps[idx] ? 'bg-yellow-400 border-yellow-600' : 'bg-pink-50 border-pink-100 border-dashed'}`}>
                  {stamps[idx] && <StarMark size={24} />}
                </div>
                <span className="text-[10px] mt-1 font-bold text-pink-300">{day}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>

      {/* --- SETTINGS MODAL --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-rose-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-pink-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-700 flex items-center"><Settings className="mr-2 text-pink-500" /> おとなの設定</h2>
              <button onClick={() => setIsSettingsOpen(false)}><X size={24} /></button>
            </div>
            {/* 設定項目の詳細（必要に応じて実装） */}
            <p className="text-sm text-gray-500 mb-8">ここから出発時間やタスクの内容を変更できます。自動保存されます。</p>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black">とじる</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
