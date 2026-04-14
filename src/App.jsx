import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Search, 
  Terminal,
  Activity,
  GitBranch,
  Database,
  Info,
  X,
  HelpCircle,
  Home,
  ChevronRight,
  Zap,
  BookOpen,
  Code,
  Network,
  RefreshCw,
  LayoutGrid,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import Editor from '@monaco-editor/react';

// --- Constants ---
const NODE_RADIUS = 28;
const LAYER_HEIGHT = 100;
const MIN_GAP = 70; 

// Educational Delays
const SEARCH_DELAY = 1800;
const OBSERVATION_DELAY = 2200;
const TRAVERSAL_DELAY = 1200;
const HIGHLIGHT_RESET_DELAY = 1000;

const COLORS = {
  default: '#334155',
  searching: '#fbbf24', 
  inserting: '#60a5fa', 
  deleting: '#f87171',  
  successor: '#34d399', 
  traversal: '#818cf8', 
  unbalanced: '#a855f7', 
  processed: '#6366f1',
};

const BST_CODE_SNIPPET = `#include <iostream>
using namespace std;

struct Node {
    int key; Node *left, *right;
};

Node* newNode(int item) {
    Node* temp = new Node();
    temp->key = item; temp->left = temp->right = NULL;
    return temp;
}

Node* insert(Node* node, int key) {
    if (node == NULL) return newNode(key);
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    return node;
}

Node* deleteNode(Node* root, int key) {
    if (root == NULL) return root;
    if (key < root->key) root->left = deleteNode(root->left, key);
    else if (key > root->key) root->right = deleteNode(root->right, key);
    else {
        if (root->left == NULL) {
            Node* temp = root->right; delete root; return temp;
        } else if (root->right == NULL) {
            Node* temp = root->left; delete root; return temp;
        }
        Node* temp = root->right;
        while (temp && temp->left != NULL) temp = temp->left;
        root->key = temp->key;
        root->right = deleteNode(root->right, temp->key);
    }
    return root;
}`;

const AVL_CODE_SNIPPET = `#include <iostream>
#include <algorithm>
using namespace std;

struct Node {
    int key; Node *left, *right; int height;
};

int height(Node *N) { return (N == NULL) ? 0 : N->height; }

Node* rightRotate(Node *y) {
    Node *x = y->left; Node *T2 = x->right;
    x->right = y; y->left = T2;
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;
    return x;
}

Node *leftRotate(Node *x) {
    Node *y = x->right; Node *T2 = y->left;
    y->left = x; x->right = T2;
    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;
    return y;
}

Node* insert(Node* node, int key) {
    if (node == NULL) return (new Node(key));
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    else return node;

    node->height = 1 + max(height(node->left), height(node->right));
    int b = height(node->left) - height(node->right);

    if (b > 1 && key < node->left->key) return rightRotate(node);
    if (b < -1 && key > node->right->key) return leftRotate(node);
    if (b > 1 && key > node->left->key) {
        node->left = leftRotate(node->left); return rightRotate(node);
    }
    if (b < -1 && key < node->right->key) {
        node->right = rightRotate(node->right); return leftRotate(node);
    }
    return node;
}`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Node {
  constructor(value) {
    this.value = value;
    this.id = Math.random().toString(36).substr(2, 9);
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

// --- High-Fidelity App Components ---

const WelcomeScreen = ({ onSelect }) => (
  <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#05060a]">
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[160px] rounded-full animate-pulse" />
    <div className="z-10 text-center space-y-16 fade-in max-w-6xl px-8">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl backdrop-blur-md">
          <BookOpen size={14} className="animate-bounce" /> Tree Visualization Lab
        </div>
        <h1 className="text-8xl font-black bg-gradient-to-b from-white via-white to-slate-700 bg-clip-text text-transparent tracking-tighter leading-[0.85]">
          Master The<br />Flow of Logic
        </h1>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] opacity-30 max-w-2xl mx-auto">High-Fidelity Step-by-Step Educational Architecture</p>
      </div>

      <div className="grid grid-cols-3 gap-8 pt-8 px-12">
        {[
          { id: 'bt', title: 'Binary Tree', icon: <Network size={28} />, color: 'bg-emerald-600', shadow: 'shadow-emerald-900/40', desc: 'Observe structural depth and level-order swaps.' },
          { id: 'bst', title: 'Binary Search Tree', icon: <GitBranch size={28} />, color: 'bg-indigo-600', shadow: 'shadow-indigo-900/40', desc: 'Master recursive comparison logic and pathfinding.' },
          { id: 'avl', title: 'AVL Tree', icon: <Zap size={28} />, color: 'bg-fuchsia-600', shadow: 'shadow-fuchsia-900/40', desc: 'Experience structural stability through rotations.' }
        ].map((opt) => (
          <button key={opt.id} onClick={() => onSelect(opt.id)} className="group glass w-full p-10 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 text-left flex flex-col gap-6 relative overflow-hidden shadow-2xl">
            <div className={`p-5 rounded-[2rem] ${opt.color} ${opt.shadow} text-white transition-all group-hover:scale-110 group-hover:rotate-6 w-fit shadow-2xl`}>{opt.icon}</div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight">{opt.title}</h3>
              <p className="text-slate-500 text-[12px] leading-relaxed font-bold opacity-60 group-hover:opacity-100 transition-opacity">{opt.desc}</p>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-4 text-[11px] font-black text-indigo-400 group-hover:gap-5 transition-all uppercase tracking-widest">
              Launch Session <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const CodeViewer = ({ onClose, code, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/85 backdrop-blur-2xl fade-in overflow-hidden">
    <div className="w-full max-w-6xl h-[85vh] glass rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col scale-in relative">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-500/10 rounded-[1.5rem] text-indigo-400 border border-indigo-500/20 shadow-inner"><Code size={28} /></div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{title} <span className="text-slate-600">Archway</span></h2>
            <p className="text-[11px] text-indigo-500/60 font-black uppercase tracking-[0.5em]">Recursive implementation logic</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-[1.25rem] text-slate-500 hover:text-white transition-all"><X size={32} /></button>
      </div>
      <div className="flex-1 bg-[#1e1e1e] p-2">
        <div className="h-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner">
          <Editor height="100%" defaultLanguage="cpp" theme="vs-dark" value={code} options={{ readOnly: true, fontSize: 17, minimap: { enabled: false }, automaticLayout: true, fontFamily: '"JetBrains Mono", monospace' }} />
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = ({ 
  view, onHome, root, highlights, inputValue, setInputValue,
  handleInsert, handleDelete, handleReset, handleTraversal, handleSearch, generateRandomTree,
  isProcessing, showLegend, setShowLegend, canvasRef, scrollRef, canvasSize,
  logs, traversalResult, positions, connections, onShowCode
}) => (
  <div className="flex flex-col h-full overflow-hidden bg-[#05060a]">
    {/* Refined Header */}
    <header className="h-20 glass border-b border-white/5 flex items-center px-10 justify-between z-20 shadow-2xl relative">
      <div className="flex items-center gap-10">
        <button onClick={onHome} className="text-slate-500 hover:text-white flex items-center gap-4 font-black uppercase tracking-[0.3em] text-[10px] transition-all group border border-white/5 px-5 py-3 rounded-[1.25rem] hover:bg-white/5 hover:border-white/10">
          <Home size={18} /> Exit Laboratory
        </button>
        <div className="h-10 w-[1px] bg-white/10" />
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-[1.25rem] shadow-2xl ${view === 'bt' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : view === 'bst' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'}`}>
            {view === 'bt' ? <Network size={22} /> : view === 'bst' ? <GitBranch size={22} /> : <Zap size={22} />}
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-black text-white uppercase tracking-tighter leading-none">{view === 'bt' ? 'Binary Tree' : view === 'bst' ? 'Binary Search Tree' : 'AVL Tree'} Laboratory</h1>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
               <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Operation Sector */}
        <div className="flex bg-slate-900/40 p-1.5 rounded-[1.3rem] border border-white/5 items-center shadow-inner">
          <div className="flex items-center bg-black/60 rounded-xl px-2 border border-white/5 mr-3">
             <Cpu size={14} className="text-slate-600 mr-2" />
             <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="00" className="bg-transparent px-2 py-2 text-base focus:outline-none w-14 text-center font-mono font-black text-white selection:bg-indigo-500" onKeyPress={(e) => e.key === 'Enter' && handleInsert()} />
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleInsert} disabled={isProcessing} className="px-6 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0">INSERT</button>
            <button onClick={handleSearch} disabled={isProcessing} className="px-6 py-2.5 text-slate-400 hover:text-white text-xs font-black transition-all rounded-xl hover:bg-white/5">SEARCH</button>
            <button onClick={handleDelete} disabled={isProcessing} className="px-6 py-2.5 text-red-500/60 hover:text-red-400 text-xs font-black transition-all rounded-xl hover:bg-red-500/10 border-l border-white/5 ml-1">DELETE</button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex gap-3">
          <button onClick={() => generateRandomTree()} disabled={isProcessing} className="p-4 bg-amber-500/10 text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/20 rounded-2xl border border-amber-500/10 transition-all shadow-xl" title="Random Architecture"><RefreshCw size={20} /></button>
          <button onClick={handleReset} className="p-4 bg-slate-800/40 text-slate-600 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl" title="Clear Canvas"><Trash2 size={20} /></button>
          {view !== 'bt' && (
            <button onClick={onShowCode} className="px-6 py-3 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all shadow-xl"><Code size={20} /> View Logic</button>
          )}
        </div>

        {/* Traversal selector */}
        <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/5 shadow-inner backdrop-blur-sm">
          {['Pre', 'In', 'Post'].map((type) => (
            <button key={type} onClick={() => handleTraversal(type + '-Order')} disabled={isProcessing} className="px-3.5 py-2 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-30 transition-all border border-transparent hover:border-indigo-500/30">{type}</button>
          ))}
        </div>
      </div>
    </header>

    <div className="flex-1 flex overflow-hidden">
      <section className="flex-1 relative overflow-hidden group/canvas" ref={canvasRef}>
        
        {/* COMPACT FLOATING ATLAS (LEGEND) - RE-IMPLEMENTED FOR MAXIMUM SPACE */}
        {showLegend && (
          <div className="absolute top-8 left-8 z-30 w-52 glass rounded-[2rem] p-6 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] fade-in">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3"><LayoutGrid size={14} className="text-indigo-400" /> Atlas</div>
              <button onClick={() => setShowLegend(false)} className="text-slate-600 hover:text-white transition-all"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { color: COLORS.searching, label: 'Finding Target' },
                { color: COLORS.inserting, label: 'Adding New Node' },
                { color: COLORS.deleting, label: 'Deleting Node' },
                { color: COLORS.unbalanced, label: 'Fixing Balance' },
                { color: COLORS.successor, label: 'Replacement Node' },
                { color: COLORS.traversal, label: 'Visiting Node' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group/lex cursor-help py-1">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)] group-hover/lex:scale-125 transition-transform" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}cc` }} />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover/lex:text-slate-300 transition-colors">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Tree Container with vertical padding shift */}
        <div className="absolute inset-0 flex items-center justify-center p-32">
          <svg viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} width={canvasSize.width} height={canvasSize.height} className="overflow-visible" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow-node-compact" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {connections.map((c) => (
              <line key={c.id} {...c} stroke="#1e293b" strokeWidth="3" className={`line-transition opacity-40 ${c.isNew ? 'line-draw text-indigo-500 stroke-indigo-500' : ''}`} />
            ))}
            {positions.map((p) => (
              <g key={p.id} className="node-transition">
                <circle cx={p.x} cy={p.y} r={NODE_RADIUS} fill={COLORS[p.highlight]} stroke="rgba(255,255,255,0.06)" strokeWidth="4" filter={p.highlight !== 'default' ? 'url(#glow-node-compact)' : ''} className={`transition-all duration-1000 ${p.highlight === 'unbalanced' ? 'pulse-purple' : p.highlight === 'deleting' ? 'pulse-red' : ''} ${p.isNew ? 'fade-in' : ''}`} />
                <text x={p.x} y={p.y} textAnchor="middle" dy=".35em" fill="white" fontSize="18" fontWeight="900" fontFamily="monospace" className="pointer-events-none select-none tracking-tighter">{p.value}</text>
                
                {view === 'avl' && (
                  <g transform={`translate(${p.x}, ${p.y - 48})`} className="select-none pointer-events-none">
                    <rect x="-42" y="-14" width="84" height="28" rx="14" fill="#020617" stroke="#6366f1" strokeWidth="1.5" className="shadow-2xl" />
                    <text x="0" y="5" textAnchor="middle" fill="#6366f1" fontSize="13" fontWeight="900" fontFamily="monospace">
                      {p.hl}-{p.hr}={p.bf}
                    </text>
                  </g>
                )}
                <g transform={`translate(${p.x - 20}, ${p.y + 45})`} className="opacity-30 select-none pointer-events-none font-black text-[9px] uppercase tracking-widest text-slate-500">
                  <text x="20" y="10" textAnchor="middle">Level:{p.height}</text>
                </g>
              </g>
            ))}
          </svg>
        </div>

        {/* Traversal panel moved slightly lower / adjusted layering */}
        {traversalResult.length > 0 && (
          <div className="absolute bottom-10 left-10 right-10 glass p-8 rounded-[3rem] border border-white/5 fade-in z-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="flex items-center gap-10">
              <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 flex items-center gap-4 shrink-0 shadow-2xl backdrop-blur-md">
                <Database size={16} className="animate-pulse" /> Sequence Output
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth custom-scrollbar pr-32">
                {traversalResult.map((v, i) => (
                  <div key={i} className="min-w-[60px] h-16 flex items-center justify-center bg-black/60 border border-white/5 rounded-2xl font-mono text-xl font-black text-white shadow-inner fade-in transition-all active:scale-90 select-none">{v}</div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-[#0c0d15] to-transparent pointer-events-none" />
          </div>
        )}
      </section>

      {/* COLUMN 2: OLD STYLE Logic Stream (DEDICATED FULL SIDEBAR) */}
      <aside className="w-[420px] glass border-l border-white/5 flex flex-col z-20 shadow-[0_0_100px_rgba(0,0,0,0.4)] relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500/20 via-transparent to-fuchsia-500/20 opacity-30" />
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.03] backdrop-blur-xl">
           <div className="flex items-center gap-5">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner"><Terminal size={22} className="text-indigo-400" /></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-0.5">Step Logic</h3>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Educational explanation</p>
              </div>
           </div>
           <Activity size={20} className="text-emerald-500/30 animate-pulse" />
        </div>

        {/* Compact line-by-line TERMINAL logs */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 font-mono text-[13px] custom-scrollbar selection:bg-indigo-500/40 scroll-smooth">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-950 text-center gap-10 opacity-30 select-none">
              <RefreshCw size={80} strokeWidth={0.5} className="animate-[spin_20s_linear_infinite] filter blur-[1px]" />
              <p className="max-w-[200px] text-[10px] font-black uppercase tracking-[0.5em] leading-[2.5]">Awaiting Operational Instruction Stream</p>
            </div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className={`pl-4 border-l-2 py-1 transition-all group ${
                l.type === 'success' ? 'border-emerald-500 text-emerald-300' : 
                l.type === 'warning' ? 'border-fuchsia-500 text-fuchsia-400' : 
                l.type === 'target' ? 'border-red-500 text-red-200' : 
                l.type === 'start' ? 'border-indigo-500 text-indigo-100' :
                l.type === 'step' ? 'border-amber-400 text-amber-50' :
                'border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-3 mb-1 opacity-20 text-[9px] font-black uppercase tracking-[0.2em] select-none">
                  <div className={`w-1.5 h-1.5 rounded-full ${l.type === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span>TRACER INGRESS [{new Date().toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}]</span>
                </div>
                <p className="leading-snug font-bold opacity-80 group-hover:opacity-100 transition-opacity tracking-tight">{l.text}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/30 flex items-center justify-between">
           <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
             <ShieldCheck size={14} className="text-emerald-500/40" />
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Educational Kernel v2.1.2</span>
           </div>
           <Cpu size={16} className="text-indigo-500/10" />
        </div>
      </aside>
    </div>
  </div>
);

// --- Application Logical Core ---

function App() {
  const [view, setView] = useState('welcome');
  const [root, setRoot] = useState(null);

  useEffect(() => {
    const titleMap = { 'bt': 'Binary Tree', 'bst': 'Binary Search Tree', 'avl': 'AVL Tree' };
    document.title = view === 'welcome' ? 'Tree Laboratory' : titleMap[view] || 'Tree Lab';
  }, [view]);
  const [highlights, setHighlights] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState([]);
  const [traversalResult, setTraversalResult] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1400, height: 900 });
  const [showLegend, setShowLegend] = useState(true);

  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const lastId = useRef(null);

  useEffect(() => {
    const updateSize = () => { if (canvasRef.current) setCanvasSize({ width: canvasRef.current.clientWidth, height: canvasRef.current.clientHeight }); };
    window.addEventListener('resize', updateSize); updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [view]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [logs]);

  const addLog = (text, type = 'info') => setLogs(p => [...p, { id: Date.now() + Math.random(), text, type }]);
  const updateHighlight = (id, color) => setHighlights(p => ({ ...p, [id]: color }));
  const resetHighlights = () => setHighlights({});
  const getHeight = (n) => n ? n.height : 0;
  
  const cloneTree = (n) => {
    if (!n) return null;
    const nn = new Node(n.value); nn.id = n.id; nn.height = n.height;
    nn.left = cloneTree(n.left); nn.right = cloneTree(n.right);
    return nn;
  };

  const slowVisit = async (id, color, reasoning, type = 'step') => {
    updateHighlight(id, color);
    addLog(reasoning, type);
    await delay(SEARCH_DELAY);
  };

  const rotateRight = async (y, tm) => {
    updateHighlight(y.id, 'unbalanced');
    addLog(`Note: ${y.value} is heavy on left. Fixing tree balance with a Right Rotation.`, 'warning');
    await delay(OBSERVATION_DELAY);
    let x = y.left; let T2 = x.right; x.right = y; y.left = T2;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    setRoot(cloneTree(tm.root)); await delay(1000); updateHighlight(y.id, 'default');
    return x;
  };
  const rotateLeft = async (x, tm) => {
    updateHighlight(x.id, 'unbalanced');
    addLog(`Note: ${x.value} is heavy on right. Fixing tree balance with a Left Rotation.`, 'warning');
    await delay(OBSERVATION_DELAY);
    let y = x.right; let T2 = y.left; y.left = x; x.right = T2;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    setRoot(cloneTree(tm.root)); await delay(1000); updateHighlight(x.id, 'default');
    return y;
  };

  const generateRandomTree = useCallback((mode = view) => {
    if (mode === 'welcome') return;
    const vals = Array.from({length: 6}, () => Math.floor(Math.random() * 90) + 10);
    let newRoot = null;
    if (mode === 'bt') {
      vals.forEach(v => {
        if (!newRoot) newRoot = new Node(v);
        else {
          const q = [newRoot];
          while (q.length) {
            const n = q.shift();
            if (!n.left) { n.left = new Node(v); break; } else q.push(n.left);
            if (!n.right) { n.right = new Node(v); break; } else q.push(n.right);
          }
        }
      });
    } else {
      vals.sort((a,b) => a-b);
      const build = (l, r) => {
        if (l > r) return null;
        const m = Math.floor((l+r)/2);
        const n = new Node(vals[m]);
        n.left = build(l, m-1); n.right = build(m+1, r);
        n.height = 1 + Math.max(getHeight(n.left), getHeight(n.right));
        return n;
      };
      newRoot = build(0, vals.length - 1);
    }
    setRoot(newRoot); setLogs([]); setTraversalResult([]); resetHighlights();
    addLog(`Neural map for ${mode.toUpperCase()} synthesis completed successfully.`, 'success');
  }, [view]);

  useEffect(() => { if (view !== 'welcome') generateRandomTree(view); }, [view, generateRandomTree]);

  const handleInsert = async () => {
    const val = parseInt(inputValue); if (isNaN(val)) return;
    setInputValue(''); setIsProcessing(true); resetHighlights();
    addLog(`Starting: Finding place for node ${val}.`, 'start');

    if (view === 'avl') {
      const tm = { root: cloneTree(root) };
      const bal = async (n) => {
        const hL = getHeight(n.left);
        const hR = getHeight(n.right);
        n.height = 1 + Math.max(hL, hR);
        let b = hL - hR;

        addLog(`Analysis: Node ${n.value} | Height(L):${hL}, Height(R):${hR} | Balance: ${hL} - ${hR} = ${b}`, 'step');

        if (b > 1) {
          if (getHeight(n.left.left) < getHeight(n.left.right)) {
            addLog(`Note: Left child ${n.left.value} is heavy on right. Fixing inner balance.`, 'warning');
            n.left = await rotateLeft(n.left, tm);
          }
          return await rotateRight(n, tm);
        }
        if (b < -1) {
          if (getHeight(n.right.right) < getHeight(n.right.left)) {
            addLog(`Note: Right child ${n.right.value} is heavy on left. Fixing inner balance.`, 'warning');
            n.right = await rotateRight(n.right, tm);
          }
          return await rotateLeft(n, tm);
        }
        return n;
      };
      const ins = async (n,v) => {
        if (!n) { const nn = new Node(v); lastId.current = nn.id; return nn; }
        await slowVisit(n.id, 'searching', `Check: Comparing ${v} with current index ${n.value}. Target is ${v < n.value ? 'Smaller' : 'Larger'}. Descending ${v < n.value ? 'Left' : 'Right'}.`);
        if (v < n.value) n.left = await ins(n.left, v);
        else if (v > n.value) n.right = await ins(n.right, v);
        else { addLog(`Note: Node ${v} already exists.`, 'warning'); return n; }
        return await bal(n);
      };
      if (!tm.root) { tm.root = new Node(val); lastId.current = tm.root.id; } 
      else tm.root = await ins(tm.root, val);
      setRoot(cloneTree(tm.root)); 
      updateHighlight(lastId.current, 'inserting'); addLog(`SUCCESS: Resource ${val} allocated to neural structure.`, 'success');
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    } else if (view === 'bst') {
      const t = cloneTree(root);
      const ins = async (n, v) => {
        if (!n) { const nn = new Node(v); lastId.current = nn.id; return nn; }
        await slowVisit(n.id, 'searching', `Step: Comparing ${v} with ${n.value}. Going ${v < n.value ? 'Left' : 'Right'}.`);
        if (v < n.value) n.left = await ins(n.left, v);
        else if (v > n.value) n.right = await ins(n.right, v);
        return n;
      };
      if (!t) { const nr = new Node(val); lastId.current = nr.id; setRoot(nr); } 
      else setRoot(await ins(t, val));
      updateHighlight(lastId.current, 'inserting'); addLog(`SUCCESS: BST logical path finalized for ${val}.`, 'success');
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    } else {
      if (!root) setRoot(new Node(val));
      else {
        const t = cloneTree(root); const q = [t];
        while (q.length) {
          const n = q.shift();
          await slowVisit(n.id, 'searching', `Checking: Compare ${n.value}...`);
          if (!n.left) { n.left = new Node(val); break; } else q.push(n.left);
          if (!n.right) { n.right = new Node(val); break; } else q.push(n.right);
        }
        setRoot(t); addLog(`SUCCESS: ${val} added to first available structural leaf.`, 'success');
        await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
      }
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    const val = parseInt(inputValue); if (isNaN(val)) return;
    setInputValue(''); setIsProcessing(true); resetHighlights();
    addLog(`Starting: Finding node ${val} to remove.`, 'start');

    if (view === 'bt') {
      const t = cloneTree(root);
      let target = null; const q = [t];
      while (q.length) {
        const n = q.shift(); 
        await slowVisit(n.id, 'searching', `POLLING: Comparing ${n.value} vs target ${val}...`);
        if (n.value === val) { target = n; break; }
        if (n.left) q.push(n.left); if (n.right) q.push(n.right);
      }
      if (target) {
        updateHighlight(target.id, 'deleting'); addLog(`Match Found: Node found. Looking for replacement...`, 'warning'); await delay(2000);
        const dq = [t]; let parent = null, side = null, deepest = t;
        while (dq.length) {
          deepest = dq.shift();
          if (deepest.left) { parent = deepest; side = 'left'; dq.push(deepest.left); }
          if (deepest.right) { parent = deepest; side = 'right'; dq.push(deepest.right); }
        }
        target.value = deepest.value; 
        if (parent) { if (side === 'left') parent.left = null; else parent.right = null; } else setRoot(null);
        if (root !== null) setRoot(cloneTree(t));
        addLog(`Success: Node ${val} removed.`, 'success');
      } else addLog(`ERROR: Key ${val} not mapped within the current neural space.`, 'warning');
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    } else {
      const tm = { root: cloneTree(root) };
      const del = async (n, v) => {
        if (!n) { addLog(`FAULT: Search resolved to a terminal null sector. Key missing for ${v}.`, 'warning'); return null; }
        await slowVisit(n.id, 'searching', `Path: ${v} vs ${n.value}. Moving ${v < n.value ? 'Left' : 'Right'}.`);
        if (v < n.value) n.left = await del(n.left, v);
        else if (v > n.value) n.right = await del(n.right, v);
        else {
          updateHighlight(n.id, 'deleting'); addLog(`TARGET REACHED: Node ${v} successfully isolated. Reviewing deletion cases...`, 'target'); await delay(2000);
          if (!n.left || !n.right) {
            addLog(`RESOLUTION: Single/Zero child state. Bridging subtree.`, 'success');
            return n.left || n.right;
          }
          addLog(`RESOLUTION: Dual-branch state. Accessing minimal inorder successor in right sector.`, 'warning');
          let s = n.right; 
          while (s.left) { await slowVisit(s.id, 'searching', `SCANNING SUCCESSOR: Searching left branch @ ${s.value}...`); s = s.left; }
          updateHighlight(s.id, 'successor'); addLog(`BRIDGE FOUND: Successor ${s.value} will take current identity.`, 'success'); await delay(2000);
          n.value = s.value; n.right = await del(n.right, s.value);
        }
        if (view === 'avl' && n) {
          n.height = 1 + Math.max(getHeight(n.left), getHeight(n.right));
          let b = getHeight(n.left) - getHeight(n.right);
          if (b > 1) {
            if (getHeight(n.left.left) < getHeight(n.left.right)) n.left = await rotateLeft(n.left, tm);
            return await rotateRight(n, tm);
          }
          if (b < -1) {
            if (getHeight(n.right.right) < getHeight(n.right.left)) n.right = await rotateRight(n.right, tm);
            return await rotateLeft(n, tm);
          }
        }
        return n;
      };
      tm.root = await del(tm.root, val); setRoot(cloneTree(tm.root));
      addLog(`REASONING: Logical cycle and structural parity finalized.`, 'success');
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    }
    setIsProcessing(false);
  };

  const handleSearch = async () => {
    const val = parseInt(inputValue); if (isNaN(val)) return;
    setInputValue(''); setIsProcessing(true); resetHighlights();
    addLog(`INITIATING SEARCH: Navigating through neural structure to find key index ${val}.`, 'start');
    const s = async (n, v) => {
      if (!n) { addLog(`FAILED: Reached terminal null leaf without match for ${val}.`, 'warning'); return; }
      await slowVisit(n.id, 'searching', `POLLING: Comparing target ${v} with current index ${n.value}. Status: ${v === n.value ? 'MATCH' : v < n.value ? 'SMALLER' : 'LARGER'}.`);
      if (n.value === v) { 
        updateHighlight(n.id, 'processed'); addLog(`Match: Success! Node ${v} found.`, 'success');
        await delay(2000); 
      }
      else { 
        if (v < n.value) { addLog(`CHOICE: Value is Smaller. Descending left branch.`, 'step'); await s(n.left, v); }
        else { addLog(`CHOICE: Value is Larger. Descending right branch.`, 'step'); await s(n.right, v); }
      }
    };
    await s(root, val); 
    await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    setIsProcessing(false);
  };

  const handleTraversal = async (t) => {
    setIsProcessing(true); setTraversalResult([]); const seq = [];
    const tr = async (n) => {
      if (!n) return;
      if (t === 'Pre-Order') { await v(n); await tr(n.left); await tr(n.right); }
      else if (t === 'In-Order') { await tr(n.left); await v(n); await tr(n.right); }
      else { await tr(n.left); await tr(n.right); await v(n); }
    };
    const v = async (n) => { 
      updateHighlight(n.id, 'traversal'); seq.push(n.value); setTraversalResult([...seq]); 
      addLog(`PROTOCOL: ${t} visit recorded for node index ${n.value}.`, 'traversal'); await delay(TRAVERSAL_DELAY); 
      updateHighlight(n.id, 'default');
    };
    await tr(root); addLog(`PROTOCOL: Full ${t} sequence streaming finalized.`, 'success'); setIsProcessing(false);
  };

  const { positions, connections } = useMemo(() => {
    const p = []; const c = [];
    const calc = (n, x, d, w) => {
      if (!n) return;
      const y = (d + 1) * LAYER_HEIGHT + 20;
      const hl = getHeight(n.left);
      const hr = getHeight(n.right);
      const bf = hl - hr;
      p.push({ id: n.id, value: n.value, height: n.height, hl, hr, bf, x, y, highlight: highlights[n.id] || 'default' });
      const nY = (d + 2) * LAYER_HEIGHT + 20;
      const currentGap = Math.max(w / 4, MIN_GAP / 2);
      if (n.left) { c.push({ id: `l-${n.left.id}`, x1: x, y1: y, x2: x - currentGap, y2: nY, isNew: highlights[n.left.id] === 'inserting' }); calc(n.left, x - currentGap, d + 1, currentGap * 2); }
      if (n.right) { c.push({ id: `r-${n.right.id}`, x1: x, y1: y, x2: x + currentGap, y2: nY, isNew: highlights[n.right.id] === 'inserting' }); calc(n.right, x + currentGap, d + 1, currentGap * 2); }
    };
    const centerX = canvasSize.width / 2;
    calc(root, centerX, 0, canvasSize.width * 0.75);
    return { positions: p, connections: c };
  }, [root, highlights, canvasSize.width]);

  return (
    <div className="flex flex-col h-screen bg-[#05060a] text-slate-200 selection:bg-indigo-500/30 font-sans">
      {view === 'welcome' ? <WelcomeScreen onSelect={setView} /> : 
        <Dashboard 
          view={view} onHome={() => setView('welcome')} root={root} highlights={highlights} 
          inputValue={inputValue} setInputValue={setInputValue} handleInsert={handleInsert} 
          handleDelete={handleDelete} handleSearch={handleSearch} handleReset={() => setRoot(null)} 
          handleTraversal={handleTraversal} generateRandomTree={generateRandomTree} 
          logs={logs} traversalResult={traversalResult} positions={positions} 
          connections={connections} onShowCode={() => setShowCode(true)} 
          isProcessing={isProcessing} showLegend={showLegend} setShowLegend={setShowLegend} 
          canvasRef={canvasRef} scrollRef={scrollRef} canvasSize={canvasSize} 
        />}
      {showCode && <CodeViewer onClose={() => setShowCode(false)} code={view === 'avl' ? AVL_CODE_SNIPPET : BST_CODE_SNIPPET} title={view.toUpperCase()} />}
    </div>
  );
}

export default App;
