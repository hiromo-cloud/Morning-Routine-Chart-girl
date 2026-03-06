import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Trash2, X, Play, Check, Plus, RotateCcw, Loader2 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// 自作パーツをインポート
import { TaskIcon, StarMark, UsagiCharacter } from './components/Icons';
import { VisualCircleTimer } from './components/VisualTimer';

// Firebase設定 (環境変数から読み込み)
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
const APP_ID = 'morning-routine-app-v1';

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

  // --- Auth & Data ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
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
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const saveData = async (updates) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'routine_data');
    await setDoc(docRef, { ...updates }, { merge: true });
  };

  // --- Timers ---
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-pink-50">
      <Loader2 className="animate-spin text-pink-500" size={48} />
      <p className="mt-4 font-black text-pink-400">じゅんびちゅう...</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-[3rem] border-4 border-pink-200 overflow-hidden flex flex-col">
        
        <header className="bg-gradient-to-b from-pink-400 to-pink-500 p-6 text-white relative">
          <button onClick={() => setIsSettingsOpen(true)} className="absolute left-6 top-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Settings size={24} />
          </button>
          <h1 className="text-center text-xl md:text-2xl font-black tracking-widest">🎀 あさの したくボード 🎀</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300">
              <span className="text-[10px] font-black text-pink-500 uppercase block">いまのじかん</span>
              <div className="text-2xl font-mono font-black text-gray-800">{currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300">
              <span className="text-[10px] font-black text-pink-500 uppercase block">しゅっぱつ</span>
              <div className="text-2xl font-mono font-black text-gray-800">{departureTime}</div>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div className={`w-full py-4 rounded-[2.5rem] border-4 text-center ${timeUntilDeparture > 5 ? 'bg-yellow-400 border-yellow-200' : 'bg-red-500 border-red-300 animate-pulse'}`}>
              <div className="text-5xl font-mono font-black text-white">{timeUntilDeparture}<span className="text-xl ml-1">分</span></div>
            </div>
            <UsagiCharacter size={100} className="mt-4" />
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-4 flex-1">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center p-4 rounded-[2rem] border-4 transition-all ${task.completed ? 'bg-green-50 border-green-200 opacity-60' : activeTaskId === task.id ? 'bg-rose-500 border-rose-300 scale-105' : 'bg-white border-pink-50'}`}>
              <div className="mr-4">
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
                <p className={`text-sm font-bold ${activeTaskId === task.id ? 'text-white/80' : 'text-pink-400'}`}>{task.duration}ぷん</p>
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
      </div>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl">おとなの設定</h2>
              <button onClick={() => setIsSettingsOpen(false)}><X size={28} /></button>
            </div>
            <div className="space-y-6">
              <input type="time" value={departureTime} onChange={(e) => {setDepartureTime(e.target.value); saveData({departureTime: e.target.value})}} className="w-full p-4 bg-pink-50 rounded-2xl text-2xl font-black text-center" />
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t.id} className="p-4 bg-pink-50 rounded-2xl relative">
                    <button onClick={() => deleteTask(t.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5"><Trash2 size={16}/></button>
                    <input value={t.label} onChange={(e) => updateTaskDetail(t.id, 'label', e.target.value)} className="w-full p-2 mb-2 rounded-xl border-2 font-bold" />
                    <div className="flex gap-2">
                      <select value={t.icon} onChange={(e) => updateTaskDetail(t.id, 'icon', e.target.value)} className="flex-1 p-2 rounded-xl border-2 font-bold bg-white">
                        <option value="onigiri">おにぎり</option>
                        <option value="clothes">おようふく</option>
                        <option value="cup">コップ</option>
                        <option value="water">おみず</option>
                        <option value="sparkle">キラキラ</option>
                        <option value="heart">ハート</option>
                      </select>
                      <input type="number" value={t.duration} onChange={(e) => updateTaskDetail(t.id, 'duration', e.target.value)} className="w-16 p-2 rounded-xl border-2 text-center font-bold" />
                    </div>
                  </div>
                ))}
                <button onClick={addTask} className="w-full py-4 border-4 border-dashed rounded-2xl text-pink-400 font-black hover:bg-pink-50 transition-colors"><Plus size={24} className="inline mr-2" />タスクを増やす</button>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-5 bg-pink-500 text-white rounded-2xl font-black text-xl shadow-lg">設定を保存してとじる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
