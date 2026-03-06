import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Trash2, X, Play, Check, Plus, RotateCcw, Loader2, Save 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// 分割したコンポーネントのインポート
import { TaskIcon, StarMark, UsagiCharacter } from './components/Icons';
import { VisualCircleTimer } from './components/VisualTimer';

// Firebase初期化 (Viteの環境変数を使用)
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
        // 初期データ
        const defaultTasks = [
          { id: 1, label: 'あさごはん', duration: 20, icon: 'onigiri', completed: false },
          { id: 2, label: 'きがえ', duration: 10, icon: 'clothes', completed: false },
        ];
        setTasks(defaultTasks);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Persistence Logic ---
  const saveData = async (updates) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'routine_data');
    await setDoc(docRef, {
      tasks: updates.tasks || tasks,
      departureTime: updates.departureTime || departureTime,
      stamps: updates.stamps || stamps
    }, { merge: true });
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

  // --- Task Handlers ---
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

  const undoTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: false } : t);
    setTasks(updated);
    await saveData({ tasks: updated });
  };

  // --- Settings Handlers ---
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

  const deleteTask = async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    if (activeTaskId === id) {
      setActiveTaskId(null);
      setTaskSecondsLeft(0);
    }
    await saveData({ tasks: updated });
  };

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

  const handleDayFinish = async () => {
    if (!allCompleted) return;
    const todayIndex = (currentTime.getDay() + 6) % 7;
    const newStamps = [...stamps];
    newStamps[todayIndex] = true;
    setStamps(newStamps);
    setShowGoalModal(true);
    await saveData({ stamps: newStamps });
  };

  const resetForNextDay = async () => {
    const resetTasks = tasks.map(t => ({ ...t, completed: false }));
    setTasks(resetTasks);
    setShowGoalModal(false);
    await saveData({ tasks: resetTasks });
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-pink-50">
      <Loader2 className="animate-spin text-pink-500" size={48} />
      <p className="mt-4 font-black text-pink-400">じゅんびちゅう...</p>
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
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300 shadow-sm">
              <span className="text-[10px] font-black text-pink-500 uppercase">いまのじかん</span>
              <div className="text-2xl font-mono font-black text-gray-800">{currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="bg-white p-3 rounded-2xl text-center border-2 border-pink-300 shadow-sm">
              <span className="text-[10px] font-black text-pink-500 uppercase">しゅっぱつ</span>
              <div className="text-2xl font-mono font-black text-gray-800">{departureTime}</div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-6">
            <div className={`w-full py-4 rounded-[2.5rem] border-4 text-center shadow-xl transition-all ${timeUntilDeparture > 5 ? 'bg-yellow-400 border-yellow-200' : 'bg-red-500 border-red-300 animate-pulse'}`}>
              <span className="text-xs font-black block text-black/40">しゅっぱつまで あと</span>
              <div className="text-5xl md:text-6xl font-mono font-black text-white">{timeUntilDeparture}<span className="text-xl ml-1">分</span></div>
            </div>
            <UsagiCharacter size={120} className="mt-4 animate-float" />
          </div>
        </header>

        {/* MAIN TASK LIST */}
        <main className="p-4 md:p-6 space-y-4 flex-1 bg-rose-50/20">
          {tasks.map((task) => {
            const isActive = activeTaskId === task.id;
            return (
              <div key={task.id} className={`flex items-center p-4 rounded-[2rem] border-4 transition-all shadow-sm ${task.completed ? 'bg-green-50 border-green-200 opacity-60' : isActive ? 'bg-rose-500 border-rose-300 scale-[1.02]' : 'bg-white border-white'}`}>
                <div className="mr-4 shrink-0">
                  {isActive ? (
                    <VisualCircleTimer secondsLeft={taskSecondsLeft} totalSeconds={task.duration * 60} size={65} />
                  ) : (
                    <div className={`p-3 rounded-2xl ${task.completed ? 'bg-green-100' : 'bg-pink-50'}`}>
                      <TaskIcon name={task.icon} active={isActive} size={30} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-black text-lg ${task.completed ? 'line-through text-gray-400' : isActive ? 'text-white' : 'text-gray-700'}`}>{task.label}</h3>
                  <p className={`text-sm font-bold ${isActive ? 'text-white/80' : 'text-pink-400'}`}>
                    {isActive ? `${Math.floor(taskSecondsLeft/60)}分${taskSecondsLeft%60}秒` : `${task.duration}ぷん`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {task.completed && (
                    <button onClick={() => undoTask(task.id)} className="p-2 text-gray-300 hover:text-pink-500"><RotateCcw size={18} /></button>
                  )}
                  {!task.completed && !isActive && (
                    <button onClick={() => startTask(task.id, task.duration)} disabled={activeTaskId !== null} className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-30">
                      <Play size={20} fill="currentColor" className="ml-1" />
                    </button>
                  )}
                  {isActive && (
                    <button onClick={() => finishTask(task.id)} className="bg-white text-rose-500 px-5 py-2 rounded-full font-black shadow-lg animate-bounce">できた！</button>
                  )}
                  {task.completed && <StarMark size={45} />}
                </div>
              </div>
            );
          })}
        </main>

        {/* FOOTER */}
        <footer className="p-6 bg-white border-t-4 border-pink-50">
          <button 
            onClick={handleDayFinish}
            disabled={!allCompleted}
            className={`w-full py-6 rounded-[2.5rem] text-2xl font-black shadow-xl transition-all ${allCompleted ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white active:scale-95' : 'bg-gray-100 text-gray-300'}`}
          >
            {allCompleted ? '✨ できたよ！' : 'きょうも がんばろう！'}
          </button>
          
          <div className="mt-8 grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center ${stamps[idx] ? 'bg-yellow-400 border-yellow-600 shadow-sm' : 'bg-pink-50 border-pink-100 border-dashed opacity-50'}`}>
                  {stamps[idx] && <StarMark size={20} />}
                </div>
                <span className={`text-[10px] mt-1 font-black ${idx === (currentTime.getDay()+6)%7 ? 'text-pink-500 underline' : 'text-pink-200'}`}>{day}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>

      {/* --- SETTINGS MODAL --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-rose-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 shadow-2xl border-4 border-pink-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-black text-gray-700 flex items-center"><Settings className="mr-2 text-pink-500" /> おとなの設定</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-pink-50 rounded-full"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              <section>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">出発する時間</label>
                <input 
                  type="time" 
                  value={departureTime} 
                  onChange={(e) => { setDepartureTime(e.target.value); saveData({ departureTime: e.target.value }); }} 
                  className="w-full p-4 bg-pink-50 border-2 border-pink-100 rounded-2xl text-3xl font-mono font-black text-rose-600 text-center outline-none shadow-inner" 
                />
              </section>

              <section>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">おしたくの内容</label>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 bg-pink-50/50 rounded-2xl border-2 border-pink-100 relative group transition-all hover:bg-pink-50">
                      <button onClick={() => deleteTask(task.id)} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-md"><Trash2 size={14} /></button>
                      <input 
                        className="w-full p-2 mb-2 rounded-xl border-2 border-pink-200 font-black text-gray-700 text-sm focus:border-pink-400 outline-none"
                        value={task.label}
                        onChange={(e) => updateTaskDetail(task.id, 'label', e.target.value)}
                        placeholder="なにをする？"
                      />
                      <div className="flex items-center gap-3">
                        <select 
                          className="flex-1 p-2 rounded-xl border-2 border-pink-200 font-bold text-gray-600 bg-white text-xs outline-none"
                          value={task.icon}
                          onChange={(e) => updateTaskDetail(task.id, 'icon', e.target.value)}
                        >
                          <option value="onigiri">おにぎり</option>
                          <option value="clothes">おようふく</option>
                          <option value="cup">コップ</option>
                          <option value="water">おみず</option>
                          <option value="sparkle">キラキラ</option>
                          <option value="heart">ハート</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={task.duration} 
                            onChange={(e) => updateTaskDetail(task.id, 'duration', e.target.value)}
                            className="w-16 p-2 bg-white border-2 border-pink-200 rounded-xl text-center font-black text-rose-600 text-sm" 
                          />
                          <span className="text-xs font-black text-gray-400">分</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addTask} 
                    className="w-full py-4 border-4 border-dashed border-pink-200 rounded-2xl text-pink-400 font-black flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors"
                  >
                    <Plus size={20} /> タスクを増やす
                  </button>
                </div>
              </section>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="mt-6 w-full py-5 bg-pink-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-pink-600 active:scale-95 transition-all shrink-0"
            >
              設定を保存してとじる
            </button>
          </div>
        </div>
      )}

      {/* --- GOAL MODAL --- */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-rose-500/90 z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in">
          <div className="bg-white rounded-[4rem] p-10 text-center shadow-2xl border-8 border-pink-200 max-w-sm">
            <StarMark size={120} className="mx-auto mb-4" />
            <h2 className="text-5xl font-black text-rose-600 mb-2">やったー！</h2>
            <p className="text-xl font-bold text-gray-500 mb-8">ぜんぶ できました！</p>
            <button 
              onClick={resetForNextDay} 
              className="w-full py-5 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-[2.5rem] text-3xl font-black shadow-xl border-b-8 border-rose-800 active:scale-95"
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
