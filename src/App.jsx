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
const B_TREE_T = 2; // Minimum degree for B-Tree

// Educational Delays
const SEARCH_DELAY = 1200;
const OBSERVATION_DELAY = 1500;
const TRAVERSAL_DELAY = 800;
const HIGHLIGHT_RESET_DELAY = 800;

const COLORS = {
  default: '#334155',
  searching: '#fbbf24',
  inserting: '#60a5fa',
  deleting: '#f87171',
  successor: '#34d399',
  traversal: '#818cf8',
  unbalanced: '#a855f7',
  processed: '#6366f1',
  rbRed: '#ef4444',
  rbBlack: '#0f172a',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Node {
  constructor(value) {
    this.value = value;
    this.id = Math.random().toString(36).substr(2, 9);
    this.left = null;
    this.right = null;
    this.height = 1;
    this.color = 'RED'; // Red-Black Tree property
    this.keys = value !== null ? [value] : []; // For B-Tree nodes
    this.children = []; // For B-Tree nodes
    this.isLeaf = true; // For B-Tree nodes
    this.next = null; // For B+ Tree leaf nodes
  }
}

const RulesModal = ({ onClose, order, view }) => {
  const maxKeys = order - 1;
  const minKeys = Math.ceil(order / 2) - 1;
  const maxChildren = order;
  const minChildren = Math.ceil(order / 2);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-12 bg-black/85 backdrop-blur-2xl fade-in overflow-hidden">
      <div className="w-full max-w-2xl glass rounded-[3.5rem] border border-white/10 shadow-2xl p-12 relative overflow-hidden scale-in">
        <div className="absolute top-0 right-0 p-8">
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-[1.25rem] text-slate-500 hover:text-white transition-all"><X size={32} /></button>
        </div>
        <div className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] text-cyan-400 border border-cyan-500/20 shadow-inner"><Database size={28} /></div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{view === 'b-plus-tree' ? 'B+ Tree' : 'B-Tree'} Rules <span className="text-slate-600">Order {order}</span></h2>
              <p className="text-[12px] text-cyan-500/60 font-black uppercase tracking-[0.5em]">Structural constraints atlas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">Node Keys</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-300"><span>Maximum Keys</span> <span className="text-cyan-400 font-black">{maxKeys}</span></div>
                <div className="flex justify-between text-sm font-bold text-slate-300"><span>Minimum Keys</span> <span className="text-cyan-400 font-black">{minKeys}</span></div>
              </div>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">Connectivity</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-300"><span>Max Children</span> <span className="text-indigo-400 font-black">{maxChildren}</span></div>
                <div className="flex justify-between text-sm font-bold text-slate-300"><span>Min Children</span> <span className="text-indigo-400 font-black">{minChildren}</span></div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 text-sm leading-relaxed text-slate-400 font-bold space-y-4">
            <p className="flex items-start gap-4"><span className="text-indigo-500 mt-1">•</span> All leaf nodes must be at the same depth.</p>
            <p className="flex items-start gap-4"><span className="text-indigo-500 mt-1">•</span> The root must have at least two children if it is not a leaf node.</p>
            <p className="flex items-start gap-4"><span className="text-indigo-500 mt-1">•</span> Every internal node (except root) has at least ⌈{order}/2⌉ children.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSelectionModal = ({ onSelect, onClose, view }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-12 bg-black/85 backdrop-blur-2xl fade-in overflow-hidden">
    <div className="w-full max-w-4xl glass rounded-[3.5rem] border border-white/10 shadow-2xl p-16 relative overflow-hidden scale-in text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Initialize <span className={view === 'b-plus-tree' ? 'text-emerald-500' : 'text-cyan-500'}>{view === 'b-plus-tree' ? 'B+ Tree' : 'B-Tree'}</span> Architecture</h2>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] opacity-60">Select the branching factor (Order) for the laboratory session</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[3, 4, 5, 6].map(order => (
          <button key={order} onClick={() => onSelect(order)} className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all space-y-4 hover:scale-105">
            <div className="text-5xl font-black text-slate-700 group-hover:text-cyan-400 transition-colors">{order}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-500/60">Order</div>
          </button>
        ))}
      </div>

      <button onClick={onClose} className="text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 px-8 py-4 rounded-2xl hover:bg-white/5">Cancel Session</button>
    </div>
  </div>
);

const WelcomeScreen = ({ onSelect }) => (
  <div className="flex-1 flex flex-col items-center justify-start relative overflow-y-auto bg-[#05060a] custom-scrollbar">
    <div className="lab-bg" />
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[160px] rounded-full animate-pulse" />
    <div className="z-10 text-center space-y-8 fade-in max-w-7xl px-8 pt-24 pb-20">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl backdrop-blur-md">
          <BookOpen size={14} className="animate-bounce" /> Tree Visualization Lab
        </div>
        <h1 className="text-7xl font-black bg-gradient-to-b from-white via-white to-slate-700 bg-clip-text text-transparent tracking-tighter leading-[0.9]">
          Master The<br />Flow of Logic
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-30 max-w-2xl mx-auto">High-Fidelity Step-by-Step Educational Architecture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 max-w-6xl mx-auto">
        {[
          { id: 'bt', title: 'Binary Tree', icon: <Network size={28} />, color: 'bg-emerald-600', shadow: 'shadow-emerald-900/40', desc: 'Observe structural depth and level-order swaps.' },
          { id: 'bst', title: 'Binary Search Tree', icon: <GitBranch size={28} />, color: 'bg-indigo-600', shadow: 'shadow-indigo-900/40', desc: 'Master recursive comparison logic and pathfinding.' },
          { id: 'avl', title: 'AVL Tree', icon: <RefreshCw size={28} />, color: 'bg-fuchsia-600', shadow: 'shadow-fuchsia-900/40', desc: 'Experience structural stability through rotations.' },
          { id: 'splay', title: 'Splay Tree', icon: <Zap size={28} />, color: 'bg-amber-600', shadow: 'shadow-amber-900/40', desc: 'Self-adjusting search tree for frequent access.' },
          { id: 'rb', title: 'Red-Black Tree', icon: <ShieldCheck size={28} />, color: 'bg-rose-600', shadow: 'shadow-rose-900/40', desc: 'Highly balanced tree with efficient recoloring.' },
          { id: 'b-tree', title: 'B-Tree', icon: <Database size={28} />, color: 'bg-cyan-600', shadow: 'shadow-cyan-900/40', desc: 'Multi-key search tree for large-scale data systems.' },
          { id: 'b-plus-tree', title: 'B+ Tree', icon: <LayoutGrid size={28} />, color: 'bg-emerald-600', shadow: 'shadow-emerald-900/40', desc: 'Advanced B-Tree with leaf links for efficient range scanning.' }
        ].map((opt) => (
          <button key={opt.id} onClick={() => onSelect(opt.id)} className="group glass w-full p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 text-left flex flex-col gap-6 relative overflow-hidden shadow-2xl min-h-[320px]">
            <div className={`p-5 rounded-[2rem] ${opt.color} ${opt.shadow} text-white transition-all group-hover:scale-110 group-hover:rotate-6 w-fit shadow-2xl`}>{opt.icon}</div>
            <div className="space-y-3">
              <h3 className="text-xl font-black tracking-tight">{opt.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed font-bold opacity-60 group-hover:opacity-100 transition-opacity">{opt.desc}</p>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-4 text-[10px] font-black text-indigo-400 group-hover:gap-5 transition-all uppercase tracking-widest">
              Launch Session <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = ({
  view, onHome, root, highlights, inputValue, setInputValue,
  handleInsert, handleDelete, handleReset, handleTraversal, handleSearch, generateRandomTree,
  isProcessing, showLegend, setShowLegend, canvasRef, scrollRef, canvasSize,
  logs, traversalResult, traversalType, positions, connections, setShowRules
}) => (
  <div className="flex flex-col h-full overflow-hidden bg-[#05060a]">
    <header className="h-20 glass border-b border-white/5 flex items-center px-10 justify-between z-20 shadow-2xl relative">
      <div className="flex items-center gap-10">
        <button onClick={onHome} className="text-slate-500 hover:text-white flex items-center gap-4 font-black uppercase tracking-[0.3em] text-[10px] transition-all group border border-white/5 px-5 py-3 rounded-[1.25rem] hover:bg-white/5 hover:border-white/10">
          <Home size={18} /> Exit Laboratory
        </button>
        <div className="h-10 w-[1px] bg-white/10" />
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-[1.25rem] shadow-2xl ${view === 'bt' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              view === 'bst' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                view === 'avl' ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' :
                  view === 'splay' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    view === 'b-tree' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      view === 'b-plus-tree' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
            {view === 'bt' ? <Network size={22} /> : view === 'bst' ? <GitBranch size={22} /> : view === 'avl' ? <RefreshCw size={22} /> : view === 'splay' ? <Zap size={22} /> : view === 'b-tree' ? <Database size={22} /> : view === 'b-plus-tree' ? <LayoutGrid size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-black text-white uppercase tracking-tighter leading-none">
              {view === 'bt' ? 'Binary Tree' : view === 'bst' ? 'Binary Search Tree' : view === 'avl' ? 'AVL Tree' : view === 'splay' ? 'Splay Tree' : view === 'rb' ? 'Red-Black Tree' : view === 'b-plus-tree' ? 'B+ Tree' : 'B-Tree'} Laboratory
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex bg-slate-900/40 p-1.5 rounded-[1.3rem] border border-white/5 items-center shadow-inner">
          <div className="flex items-center bg-black/60 rounded-xl px-2 border border-white/5 mr-3">
            <Cpu size={14} className="text-slate-600 mr-2" />
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="00"
              className="bg-transparent px-2 py-2 text-base focus:outline-none w-14 text-center font-mono font-black text-white selection:bg-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            />
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleInsert} disabled={isProcessing} className="px-6 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">INSERT</button>
            <button onClick={handleSearch} disabled={isProcessing} className="px-6 py-2.5 text-slate-400 hover:text-white text-xs font-black transition-all rounded-xl hover:bg-white/5 disabled:opacity-50">SEARCH</button>
            <button onClick={handleDelete} disabled={isProcessing} className="px-6 py-2.5 text-red-500/60 hover:text-red-400 text-xs font-black transition-all rounded-xl hover:bg-red-500/10 border-l border-white/5 ml-1 disabled:opacity-50">DELETE</button>
          </div>
        </div>

        <div className="flex gap-3">
          {(view === 'b-tree' || view === 'b-plus-tree') && (
            <button onClick={() => setShowRules(true)} className="px-6 py-4 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl border border-indigo-500/10 transition-all shadow-xl flex items-center gap-3" title="Tree Rules">
              <HelpCircle size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">View Rules</span>
            </button>
          )}
          {(view !== 'b-tree' && view !== 'b-plus-tree') && (
            <button onClick={() => generateRandomTree()} disabled={isProcessing} className="p-4 bg-amber-500/10 text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/20 rounded-2xl border border-amber-500/10 transition-all shadow-xl disabled:opacity-50" title="Random Architecture"><RefreshCw size={20} /></button>
          )}
          <button onClick={handleReset} disabled={isProcessing} className="p-4 bg-slate-800/40 text-slate-600 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl disabled:opacity-50" title="Clear Canvas"><Trash2 size={20} /></button>
        </div>

        <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/5 shadow-inner backdrop-blur-sm">
          {(view !== 'b-tree' && view !== 'b-plus-tree') && ['Pre', 'In', 'Post'].map((type) => (
            <button key={type} onClick={() => handleTraversal(type + '-Order')} disabled={isProcessing} className="px-3.5 py-2 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-30 transition-all border border-transparent hover:border-indigo-500/30">{type}</button>
          ))}
        </div>
      </div>
    </header>

    <div className="flex-1 flex overflow-hidden">
      <section className="flex-1 relative overflow-hidden group/canvas" ref={canvasRef}>
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

        <div className="absolute inset-0 flex items-center justify-center p-32">
          <svg viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} width={canvasSize.width} height={canvasSize.height} className="overflow-visible" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow-node-compact" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
            </defs>
            {connections.map(({ isNew, isLeafLink, ...c }) => (
              <line
                key={c.id} {...c}
                stroke={isLeafLink ? "#10b981" : "#1e293b"}
                strokeWidth={isLeafLink ? "2" : "3"}
                strokeDasharray={isLeafLink ? "5,5" : ""}
                markerEnd={isLeafLink ? "url(#arrowhead)" : ""}
                className={`line-transition ${isLeafLink ? 'opacity-80' : 'opacity-40'} ${isNew ? 'line-draw text-indigo-500 stroke-indigo-500' : ''} ${c.isSearching ? 'path-searching' : ''}`}
              />
            ))}
            {positions.map(({ isNew, ...p }) => (
              <g key={p.id} className="node-transition">
                {p.type !== 'b-node' && (
                  <circle
                    cx={p.x} cy={p.y} r={NODE_RADIUS}
                    fill={p.highlight && p.highlight !== 'default' ? COLORS[p.highlight] : (view === 'rb' ? COLORS.rbBlack : COLORS.default)}
                    stroke={view === 'rb' ? (p.color === 'RED' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)') : "rgba(255,255,255,0.06)"}
                    strokeWidth="4"
                    filter={p.highlight && p.highlight !== 'default' ? 'url(#glow-node-compact)' : ''}
                    className={`transition-all duration-1000 ${p.highlight === 'unbalanced' ? 'pulse-purple' : p.highlight === 'deleting' ? 'pulse-red' : ''} ${isNew ? 'fade-in' : ''}`}
                  />
                )}
                {p.type === 'b-node' ? (
                  <g className="b-capsule-animate">
                    <rect
                      x={p.x - p.width / 2} y={p.y - 20} width={p.width} height={40} rx="12"
                      fill={p.highlight && p.highlight !== 'default' ? COLORS[p.highlight] : "#1e293b"}
                      stroke={p.highlight && p.highlight !== 'default' ? "white" : "#334155"}
                      strokeWidth="2"
                      className="b-capsule-animate"
                      filter={p.highlight && p.highlight !== 'default' ? 'url(#glow-node-compact)' : ''}
                    />
                    {p.keys.map((k, i) => (
                      <g key={i} className="key-pop" style={{ animationDelay: `${i * 100}ms` }}>
                        <text x={p.x - p.width / 2 + 25 + i * 40} y={p.y} textAnchor="middle" dy=".35em" fill="white" fontSize="14" fontWeight="900" fontFamily="monospace" className="pointer-events-none select-none">{k}</text>
                      </g>
                    ))}
                  </g>
                ) : (
                  <text x={p.x} y={p.y} textAnchor="middle" dy=".35em" fill="white" fontSize="18" fontWeight="900" fontFamily="monospace" className="pointer-events-none select-none tracking-tighter">{p.value}</text>
                )}

                {view === 'avl' && (
                  <g transform={`translate(${p.x}, ${p.y - 48})`} className="select-none pointer-events-none">
                    <rect x="-42" y="-14" width="84" height="28" rx="14" fill="#020617" stroke="#6366f1" strokeWidth="1.5" className="shadow-2xl" />
                    <text x="0" y="5" textAnchor="middle" fill="#6366f1" fontSize="13" fontWeight="900" fontFamily="monospace">
                      {p.hl}-{p.hr}={p.bf}
                    </text>
                  </g>
                )}
                {view === 'rb' && (
                  <g transform={`translate(${p.x}, ${p.y - 48})`} className="select-none pointer-events-none">
                    <rect x="-38" y="-12" width="76" height="24" rx="12" fill={p.color === 'RED' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(15, 23, 42, 0.8)'} stroke={p.color === 'RED' ? '#ef4444' : '#475569'} strokeWidth="1.5" className="shadow-2xl" />
                    <text x="0" y="4" textAnchor="middle" fill={p.color === 'RED' ? '#ef4444' : '#94a3b8'} fontSize="9" fontWeight="900" fontFamily="monospace" className="uppercase tracking-[0.2em]">
                      {p.color}
                    </text>
                  </g>
                )}
                <g transform={`translate(${p.x - 20}, ${p.y + 45})`} className="opacity-30 select-none pointer-events-none font-black text-[9px] uppercase tracking-widest text-slate-500">
                  <text x="20" y="10" textAnchor="middle">Level:{p.depth}</text>
                </g>
              </g>
            ))}
          </svg>
        </div>

        {traversalResult.length > 0 && (
          <div className="absolute bottom-10 left-10 right-10 glass p-8 rounded-[3rem] border border-white/5 fade-in z-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="flex items-center gap-10">
              <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 flex items-center gap-4 shrink-0 shadow-2xl backdrop-blur-md">
                <Database size={16} className="animate-pulse" /> {traversalType || 'Sequence'} Output
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth custom-scrollbar pr-32">
                {traversalResult.map((v, i) => (
                  <div key={i} className="min-w-[60px] h-16 flex items-center justify-center bg-black/60 border border-white/5 rounded-2xl font-mono text-xl font-black text-white shadow-inner fade-in transition-all active:scale-90 select-none">{v}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

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

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 font-mono text-[13px] custom-scrollbar selection:bg-indigo-500/40 scroll-smooth">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-950 text-center gap-10 opacity-30 select-none">
              <RefreshCw size={80} strokeWidth={0.5} className="animate-[spin_20s_linear_infinite] filter blur-[1px]" />
              <p className="max-w-[200px] text-[10px] font-black uppercase tracking-[0.5em] leading-[2.5]">Awaiting Operational Instruction Stream</p>
            </div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className={`pl-4 border-l-2 py-1 transition-all group ${l.type === 'success' ? 'border-emerald-500 text-emerald-300' :
                  l.type === 'warning' ? 'border-fuchsia-500 text-fuchsia-400' :
                    l.type === 'target' ? 'border-red-500 text-red-200' :
                      l.type === 'start' ? 'border-indigo-500 text-indigo-100' :
                        l.type === 'step' ? 'border-amber-400 text-amber-50' :
                          'border-slate-800 text-slate-500'
                }`}>
                <div className="flex items-center gap-3 mb-1 opacity-20 text-[9px] font-black uppercase tracking-[0.2em] select-none">
                  <div className={`w-1.5 h-1.5 rounded-full ${l.type === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span>TRACER INGRESS [{new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}]</span>
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
  const [bTreeOrder, setBTreeOrder] = useState(3);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [root, setRoot] = useState(null);
  const [highlights, setHighlights] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState([]);
  const [traversalResult, setTraversalResult] = useState([]);
  const [traversalType, setTraversalType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (view === 'b-tree' || view === 'b-plus-tree') {
      const nn = new Node(null);
      nn.id = n.id;
      nn.keys = [...n.keys];
      nn.isLeaf = n.isLeaf;
      nn.next = n.next; // Pointer to next leaf node
      nn.children = n.children.map(c => cloneTree(c));
      return nn;
    }
    const nn = new Node(n.value); nn.id = n.id; nn.height = n.height; nn.color = n.color;
    nn.left = cloneTree(n.left); nn.right = cloneTree(n.right);
    return nn;
  };

  const slowVisit = async (id, color, reasoning, type = 'step') => {
    updateHighlight(id, color); addLog(reasoning, type);
    await delay(SEARCH_DELAY);
  };

  const rotateRight = async (y, tm, setLocalRoot = null) => {
    if (!y) return null;
    updateHighlight(y.id, 'unbalanced');
    addLog(`Note: ${y.value} is heavy on left. Fixing tree balance with a Right Rotation.`, 'warning');
    await delay(OBSERVATION_DELAY);
    let x = y.left; if (!x) return y;
    let T2 = x.right; x.right = y; y.left = T2;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    if (setLocalRoot) setLocalRoot(x); else if (tm.root === y) tm.root = x;
    setRoot(cloneTree(tm.root)); await delay(800); updateHighlight(y.id, 'default');
    return x;
  };

  const rotateLeft = async (x, tm, setLocalRoot = null) => {
    if (!x) return null;
    updateHighlight(x.id, 'unbalanced');
    addLog(`Note: ${x.value} is heavy on right. Fixing tree balance with a Left Rotation.`, 'warning');
    await delay(OBSERVATION_DELAY);
    let y = x.right; if (!y) return x;
    let T2 = y.left; y.left = x; x.right = T2;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    if (setLocalRoot) setLocalRoot(y); else if (tm.root === x) tm.root = y;
    setRoot(cloneTree(tm.root)); await delay(800); updateHighlight(x.id, 'default');
    return y;
  };

  const generateRandomTree = useCallback((mode = view) => {
    if (mode === 'welcome') return;
    const vals = Array.from({ length: 6 }, () => Math.floor(Math.random() * 90) + 10);
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
    } else if (mode === 'rb') {
      const getParent = (currRoot, node) => {
        const map = new Map();
        const traverse = (curr, p) => {
          if (!curr) return;
          map.set(curr, p); traverse(curr.left, curr); traverse(curr.right, curr);
        };
        traverse(currRoot, null);
        return map.get(node);
      };
      const rotateRightSync = (y, tree) => {
        let x = y.left; if (!x) return y;
        let T2 = x.right; x.right = y; y.left = T2;
        if (tree.root === y) tree.root = x;
        return x;
      };
      const rotateLeftSync = (x, tree) => {
        let y = x.right; if (!y) return x;
        let T2 = y.left; y.left = x; x.right = T2;
        if (tree.root === x) tree.root = y;
        return y;
      };
      const tree = { root: null };
      vals.forEach(v => {
        let curr = tree.root, pNode = null;
        while (curr) { pNode = curr; if (v < curr.value) curr = curr.left; else if (v > curr.value) curr = curr.right; else return; }
        const newNode = new Node(v); newNode.color = 'RED';
        if (!pNode) tree.root = newNode;
        else {
          if (v < pNode.value) pNode.left = newNode; else pNode.right = newNode;
          let z = newNode;
          while (getParent(tree.root, z) && getParent(tree.root, z).color === 'RED') {
            let p = getParent(tree.root, z), g = getParent(tree.root, p);
            if (!g) break;
            if (p === g.left) {
              let u = g.right;
              if (u && u.color === 'RED') { p.color = 'BLACK'; u.color = 'BLACK'; g.color = 'RED'; z = g; }
              else {
                if (z === p.right) { z = p; g.left = rotateLeftSync(p, tree); p = g.left; }
                p.color = 'BLACK'; g.color = 'RED';
                const gp = getParent(tree.root, g);
                if (!gp) tree.root = rotateRightSync(g, tree);
                else { if (g === gp.left) gp.left = rotateRightSync(g, tree); else gp.right = rotateRightSync(g, tree); }
              }
            } else {
              let u = g.left;
              if (u && u.color === 'RED') { p.color = 'BLACK'; u.color = 'BLACK'; g.color = 'RED'; z = g; }
              else {
                if (z === p.left) { z = p; g.right = rotateRightSync(p, tree); p = g.right; }
                p.color = 'BLACK'; g.color = 'RED';
                const gp = getParent(tree.root, g);
                if (!gp) tree.root = rotateLeftSync(g, tree);
                else { if (g === gp.left) gp.left = rotateLeftSync(g, tree); else gp.right = rotateLeftSync(g, tree); }
              }
            }
          }
          tree.root.color = 'BLACK';
        }
      });
      newRoot = tree.root;
    } else {
      vals.sort((a, b) => a - b);
      const build = (l, r, d = 0) => {
        if (l > r) return null;
        const m = Math.floor((l + r) / 2);
        const n = new Node(vals[m]);
        n.left = build(l, m - 1, d + 1); n.right = build(m + 1, r, d + 1);
        n.height = 1 + Math.max(getHeight(n.left), getHeight(n.right));
        return n;
      };
      newRoot = build(0, vals.length - 1);
    }
    setRoot(newRoot); setLogs([]); setTraversalResult([]); resetHighlights();
    addLog(`Neural map for ${mode.toUpperCase()} synthesis completed successfully.`, 'success');
  }, [view]);

  useEffect(() => { if (view !== 'welcome') generateRandomTree(view); }, [view, generateRandomTree]);

  // --- Splay Logic ---
  const splay = async (n, v, sharedTm, setLocal) => {
    if (!n || n.value === v) return n;
    if (v < n.value) {
      if (!n.left) return n;
      if (v < n.left.value) {
        n.left.left = await splay(n.left.left, v, sharedTm, (nn) => n.left.left = nn);
        n = await rotateRight(n, sharedTm, setLocal);
      } else if (v > n.left.value) {
        n.left.right = await splay(n.left.right, v, sharedTm, (nn) => n.left.right = nn);
        if (n.left.right) n.left = await rotateLeft(n.left, sharedTm, (nn) => n.left = nn);
      }
      if (!n.left) return n;
      return await rotateRight(n, sharedTm, setLocal);
    } else {
      if (!n.right) return n;
      if (v < n.right.value) {
        n.right.left = await splay(n.right.left, v, sharedTm, (nn) => n.right.left = nn);
        if (n.right.left) n.right = await rotateRight(n.right, sharedTm, (nn) => n.right = nn);
      } else if (v > n.right.value) {
        n.right.right = await splay(n.right.right, v, sharedTm, (nn) => n.right.right = nn);
        n = await rotateLeft(n, sharedTm, setLocal);
      }
      if (!n.right) return n;
      return await rotateLeft(n, sharedTm, setLocal);
    }
  };

  const handleInsert = async () => {
    const val = parseInt(inputValue); if (isNaN(val)) return;
    setInputValue(''); setIsProcessing(true); resetHighlights();
    console.log(`Starting insertion of ${val} in ${view} mode.`);
    try {
      addLog(`Starting: Finding place for node ${val}.`, 'start');
      if (view === 'avl') {
        const tm = { root: cloneTree(root) };
        const bal = async (n) => {
          const hL = getHeight(n.left); const hR = getHeight(n.right);
          n.height = 1 + Math.max(hL, hR); let b = hL - hR;
          if (b > 1) {
            if (getHeight(n.left.left) < getHeight(n.left.right)) n.left = await rotateLeft(n.left, tm);
            return await rotateRight(n, tm);
          }
          if (b < -1) {
            if (getHeight(n.right.right) < getHeight(n.right.left)) n.right = await rotateRight(n.right, tm);
            return await rotateLeft(n, tm);
          }
          return n;
        };
        const ins = async (n, v) => {
          if (!n) { const nn = new Node(v); lastId.current = nn.id; return nn; }
          await slowVisit(n.id, 'searching', `Locating...`);
          if (v < n.value) n.left = await ins(n.left, v);
          else if (v > n.value) n.right = await ins(n.right, v);
          else return n;
          return await bal(n);
        };
        if (!tm.root) { tm.root = new Node(val); lastId.current = tm.root.id; }
        else tm.root = await ins(tm.root, val);
        setRoot(cloneTree(tm.root));
      } else if (view === 'bst') {
        const t = cloneTree(root);
        const ins = async (n, v) => {
          if (!n) { const nn = new Node(v); lastId.current = nn.id; return nn; }
          await slowVisit(n.id, 'searching', `Step: ${v} < ${n.value} ?`);
          if (v < n.value) n.left = await ins(n.left, v);
          else if (v > n.value) n.right = await ins(n.right, v);
          return n;
        };
        if (!t) { const nr = new Node(val); lastId.current = nr.id; setRoot(nr); }
        else setRoot(await ins(t, val));
      } else if (view === 'splay') {
        const tm = { root: cloneTree(root) };
        const bstIns = async (n, v) => {
          if (!n) { const nn = new Node(v); lastId.current = nn.id; return nn; }
          await slowVisit(n.id, 'searching', `Locating insertion point for ${v}.`);
          if (v < n.value) n.left = await bstIns(n.left, v);
          else if (v > n.value) n.right = await bstIns(n.right, v);
          return n;
        };
        if (!tm.root) { tm.root = new Node(val); lastId.current = tm.root.id; }
        else {
          tm.root = await bstIns(tm.root, val);
          setRoot(cloneTree(tm.root)); await delay(800);
          addLog(`Splaying: Moving new node ${val} to root.`, 'warning');
          tm.root = await splay(tm.root, val, tm, (nn) => tm.root = nn);
        }
        setRoot(cloneTree(tm.root));
      } else if (view === 'rb') {
        const tm = { root: cloneTree(root) };
        const rotateRightRB = async (y, sharedTm, setLocal) => {
          let x = y.left; if (!x) return y;
          let T2 = x.right; x.right = y; y.left = T2;
          if (setLocal) setLocal(x); else if (sharedTm.root === y) sharedTm.root = x;
          setRoot(cloneTree(sharedTm.root)); await delay(800);
          return x;
        };
        const rotateLeftRB = async (x, sharedTm, setLocal) => {
          let y = x.right; if (!y) return x;
          let T2 = y.left; y.left = x; x.right = T2;
          if (setLocal) setLocal(y); else if (sharedTm.root === x) sharedTm.root = y;
          setRoot(cloneTree(sharedTm.root)); await delay(800);
          return y;
        };
        const fixInsert = async (sharedTm, z) => {
          const getParent = (node) => {
            const map = new Map();
            const traverse = (curr, p) => {
              if (!curr) return;
              map.set(curr, p);
              traverse(curr.left, curr); traverse(curr.right, curr);
            };
            traverse(sharedTm.root, null);
            return map.get(node);
          };
          while (getParent(z) && getParent(z).color === 'RED') {
            let p = getParent(z); let g = getParent(p);
            if (!g) break;
            if (p === g.left) {
              let u = g.right;
              if (u && u.color === 'RED') {
                addLog("Uncle is RED: Recoloring.", "warning");
                p.color = 'BLACK'; u.color = 'BLACK'; g.color = 'RED'; z = g;
                setRoot(cloneTree(sharedTm.root)); await delay(800);
              } else {
                if (z === p.right) {
                  addLog("Uncle is BLACK (Triangle): Left rotation.", "warning");
                  z = p; g.left = await rotateLeftRB(p, sharedTm, (nn) => g.left = nn); p = g.left;
                }
                addLog("Uncle is BLACK (Line): Right rotation + Recoloring.", "warning");
                p.color = 'BLACK'; g.color = 'RED';
                const gp = getParent(g);
                if (!gp) sharedTm.root = await rotateRightRB(g, sharedTm, (nn) => sharedTm.root = nn);
                else {
                  if (g === gp.left) gp.left = await rotateRightRB(g, sharedTm, (nn) => gp.left = nn);
                  else gp.right = await rotateRightRB(g, sharedTm, (nn) => gp.right = nn);
                }
                setRoot(cloneTree(sharedTm.root)); await delay(800);
              }
            } else {
              let u = g.left;
              if (u && u.color === 'RED') {
                addLog("Uncle is RED: Recoloring.", "warning");
                p.color = 'BLACK'; u.color = 'BLACK'; g.color = 'RED'; z = g;
                setRoot(cloneTree(sharedTm.root)); await delay(800);
              } else {
                if (z === p.left) {
                  addLog("Uncle is BLACK (Triangle): Right rotation.", "warning");
                  z = p; g.right = await rotateRightRB(p, sharedTm, (nn) => g.right = nn); p = g.right;
                }
                addLog("Uncle is BLACK (Line): Left rotation + Recoloring.", "warning");
                p.color = 'BLACK'; g.color = 'RED';
                const gp = getParent(g);
                if (!gp) sharedTm.root = await rotateLeftRB(g, sharedTm, (nn) => sharedTm.root = nn);
                else {
                  if (g === gp.left) gp.left = await rotateLeftRB(g, sharedTm, (nn) => gp.left = nn);
                  else gp.right = await rotateLeftRB(g, sharedTm, (nn) => gp.right = nn);
                }
                setRoot(cloneTree(sharedTm.root)); await delay(800);
              }
            }
          }
          if (sharedTm.root) sharedTm.root.color = 'BLACK';
          setRoot(cloneTree(sharedTm.root));
        };
        const ins = async (n, v) => {
          let curr = n; let pNode = null;
          while (curr) {
            pNode = curr; await slowVisit(curr.id, 'searching', `Locating...`);
            if (v < curr.value) curr = curr.left; else if (v > curr.value) curr = curr.right; else return n;
          }
          const newNode = new Node(v); newNode.color = 'RED'; lastId.current = newNode.id;
          if (!pNode) return newNode;
          if (v < pNode.value) pNode.left = newNode; else pNode.right = newNode;
          setRoot(cloneTree(tm.root)); await delay(800);
          addLog("Checking RB violations...", "warning"); await fixInsert(tm, newNode);
          return tm.root;
        };
        tm.root = await ins(tm.root, val);
        if (tm.root) tm.root.color = 'BLACK';
        setRoot(cloneTree(tm.root));
      } else if (view === 'b-tree') {
        const T_MAX_KEYS = bTreeOrder - 1;
        const tm = { root: cloneTree(root) || new Node(val) };

        const contains = (n, k) => {
          if (!n) return false;
          if (n.keys.includes(k)) return true;
          for (let child of n.children) if (contains(child, k)) return true;
          return false;
        };

        if (root && contains(root, val)) {
          addLog(`Key ${val} already exists in architecture. Skipping duplicate insertion.`, 'warning');
          setIsProcessing(false);
          return;
        }

        if (!root) {
          tm.root.keys = [val];
          tm.root.isLeaf = true;
          addLog(`Inserted ${val} into new root capsule.`, 'success');
        } else {
          // Bottom-Up Insertion Strategy
          const path = [];
          let curr = tm.root;
          while (!curr.isLeaf) {
            path.push(curr);
            let i = 0;
            while (i < curr.keys.length && val > curr.keys[i]) i++;
            await slowVisit(curr.id, 'searching', `Descending to child index ${i}...`);
            curr = curr.children[i];
          }

          let i = 0;
          while (i < curr.keys.length && val > curr.keys[i]) i++;
          curr.keys.splice(i, 0, val);
          addLog(`Inserted ${val} into leaf capsule.`, 'info');
          setRoot(cloneTree(tm.root));
          await delay(1000);

          let nodeToSplit = curr;
          while (nodeToSplit && nodeToSplit.keys.length > T_MAX_KEYS) {
            const midIdx = Math.floor(nodeToSplit.keys.length / 2);
            const promotedKey = nodeToSplit.keys[midIdx];
            const rightKeys = nodeToSplit.keys.slice(midIdx + 1);
            const leftKeys = nodeToSplit.keys.slice(0, midIdx);

            const newNode = new Node(null);
            newNode.isLeaf = nodeToSplit.isLeaf;
            newNode.keys = rightKeys;
            if (!nodeToSplit.isLeaf) {
              newNode.children = nodeToSplit.children.splice(midIdx + 1);
            }
            nodeToSplit.keys = leftKeys;

            const parent = path.pop();
            if (!parent) {
              const newRoot = new Node(null);
              newRoot.isLeaf = false;
              newRoot.keys = [promotedKey];
              newRoot.children = [nodeToSplit, newNode];
              tm.root = newRoot;
              addLog(`Root overflow! Split promoted ${promotedKey} to new height.`, 'warning');
              nodeToSplit = null;
            } else {
              let pIdx = 0;
              while (pIdx < parent.keys.length && promotedKey > parent.keys[pIdx]) pIdx++;
              parent.keys.splice(pIdx, 0, promotedKey);
              parent.children.splice(pIdx + 1, 0, newNode);
              addLog(`Node overflow! Pushing ${promotedKey} up.`, 'warning');
              nodeToSplit = parent;
            }
            setRoot(cloneTree(tm.root));
            await delay(1000);
          }
        }
        setRoot(cloneTree(tm.root));
      } else if (view === 'b-plus-tree') {
        const T_MAX_KEYS = bTreeOrder - 1;
        const tm = { root: cloneTree(root) || new Node(null) };
        if (!root) tm.root.isLeaf = true;

        const contains = (n, k) => {
          if (!n) return false;
          if (n.isLeaf) return n.keys.includes(k);
          let i = 0; while (i < n.keys.length && k > n.keys[i]) i++;
          if (i < n.keys.length && k === n.keys[i]) i++;
          return contains(n.children[i], k);
        };

        if (root && contains(root, val)) {
          addLog(`Key ${val} already exists in B+ architecture.`, 'warning');
          setIsProcessing(false); return;
        }

        if (!root) {
          tm.root.keys = [val];
          addLog(`Inserted ${val} into new B+ root.`, 'success');
        } else {
          const path = []; let curr = tm.root;
          while (!curr.isLeaf) {
            path.push(curr);
            let i = 0; while (i < curr.keys.length && val > curr.keys[i]) i++;
            if (i < curr.keys.length && val === curr.keys[i]) i++; // B+ convention: key k is smallest in right child
            await slowVisit(curr.id, 'searching', `Descending to child index ${i}...`);
            curr = curr.children[i];
          }

          let i = 0; while (i < curr.keys.length && val > curr.keys[i]) i++;
          curr.keys.splice(i, 0, val);
          addLog(`Inserted ${val} into leaf.`, 'info');
          setRoot(cloneTree(tm.root)); await delay(1000);

          let nodeToSplit = curr;
          while (nodeToSplit && nodeToSplit.keys.length > T_MAX_KEYS) {
            const isLeaf = nodeToSplit.isLeaf;
            const midIdx = isLeaf ? Math.ceil(nodeToSplit.keys.length / 2) : Math.floor(nodeToSplit.keys.length / 2);

            const newNode = new Node(null);
            newNode.isLeaf = isLeaf;

            let promotedKey;
            if (isLeaf) {
              newNode.keys = nodeToSplit.keys.slice(midIdx);
              nodeToSplit.keys = nodeToSplit.keys.slice(0, midIdx);
              promotedKey = newNode.keys[0];
              newNode.next = nodeToSplit.next;
              nodeToSplit.next = newNode;
            } else {
              promotedKey = nodeToSplit.keys[midIdx];
              newNode.keys = nodeToSplit.keys.slice(midIdx + 1);
              nodeToSplit.keys = nodeToSplit.keys.slice(0, midIdx);
              newNode.children = nodeToSplit.children.splice(midIdx + 1);
            }

            const parent = path.pop();
            if (!parent) {
              const newRoot = new Node(null);
              newRoot.isLeaf = false;
              newRoot.keys = [promotedKey];
              newRoot.children = [nodeToSplit, newNode];
              tm.root = newRoot;
              addLog(`Root split! New height reached.`, 'warning');
              nodeToSplit = null;
            } else {
              let pIdx = 0; while (pIdx < parent.keys.length && promotedKey >= parent.keys[pIdx]) pIdx++;
              parent.keys.splice(pIdx, 0, promotedKey);
              parent.children.splice(pIdx + 1, 0, newNode);
              addLog(`Splitting node, promoting ${promotedKey}.`, 'warning');
              nodeToSplit = parent;
            }
            setRoot(cloneTree(tm.root)); await delay(1000);
          }
        }
        setRoot(cloneTree(tm.root));
      } else {
        if (!root) setRoot(new Node(val));
        else {
          const t = cloneTree(root); const q = [t];
          while (q.length) {
            const n = q.shift(); await slowVisit(n.id, 'searching', `Checking level-order...`);
            if (!n.left) { n.left = new Node(val); break; } else q.push(n.left);
            if (!n.right) { n.right = new Node(val); break; } else q.push(n.right);
          }
          setRoot(t);
        }
      }
      addLog(`SUCCESS: Operation finalized for node ${val}.`, 'success');
      if (lastId.current) updateHighlight(lastId.current, 'inserting');
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    } catch (err) {
      console.error("Insertion error:", err);
      addLog(`CRITICAL ERROR during insertion: ${err.message}`, 'target');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    const val = parseInt(inputValue); if (isNaN(val)) return;
    setInputValue(''); setIsProcessing(true); resetHighlights();
    console.log(`Starting deletion of ${val} in ${view} mode.`);
    try {
      addLog(`Starting: Finding node ${val} to remove.`, 'start');
      if (view === 'splay') {
        const tm = { root: cloneTree(root) };
        if (!tm.root) return;
        addLog(`Initiating Splay Delete: Moving ${val} to root.`, 'start');
        tm.root = await splay(tm.root, val, tm, (nn) => tm.root = nn);
        setRoot(cloneTree(tm.root));
        if (tm.root.value === val) {
          updateHighlight(tm.root.id, 'deleting'); addLog(`Target reached root. Splitting...`, 'target'); await delay(1500);
          if (!tm.root.left) tm.root = tm.root.right;
          else {
            let leftSub = tm.root.left; let rightSub = tm.root.right;
            let maxNode = leftSub; while (maxNode.right) maxNode = maxNode.right;
            addLog(`Merging: Splaying max of left subtree (${maxNode.value}).`, 'warning');
            leftSub = await splay(leftSub, maxNode.value, tm, (nn) => tm.root.left = nn);
            leftSub.right = rightSub; tm.root = leftSub;
          }
          setRoot(cloneTree(tm.root));
          addLog(`SUCCESS: Removed ${val}.`, 'success');
        } else addLog(`ERROR: ${val} not found.`, 'warning');
      } else if (view === 'rb') {
        const tm = { root: cloneTree(root) };
        if (!tm.root) return;

        const getParent = (sharedTm, node) => {
          const map = new Map();
          const traverse = (curr, p) => {
            if (!curr) return;
            map.set(curr, p); traverse(curr.left, curr); traverse(curr.right, curr);
          };
          traverse(sharedTm.root, null);
          return map.get(node);
        };

        const rotateRightRB = async (y, sharedTm, setLocal) => {
          let x = y.left; if (!x) return y;
          let T2 = x.right; x.right = y; y.left = T2;
          if (setLocal) setLocal(x); else if (sharedTm.root === y) sharedTm.root = x;
          setRoot(cloneTree(sharedTm.root)); await delay(800);
          return x;
        };

        const rotateLeftRB = async (x, sharedTm, setLocal) => {
          let y = x.right; if (!y) return x;
          let T2 = y.left; y.left = x; x.right = T2;
          if (setLocal) setLocal(y); else if (sharedTm.root === x) sharedTm.root = y;
          setRoot(cloneTree(sharedTm.root)); await delay(800);
          return y;
        };

        const fixDelete = async (sharedTm, x, xParent) => {
          while (x !== sharedTm.root && (!x || x.color === 'BLACK')) {
            if (x === xParent.left) {
              let s = xParent.right;
              if (s && s.color === 'RED') {
                s.color = 'BLACK'; xParent.color = 'RED';
                const gp = getParent(sharedTm, xParent);
                if (!gp) sharedTm.root = await rotateLeftRB(xParent, sharedTm, (nn) => sharedTm.root = nn);
                else {
                  if (xParent === gp.left) gp.left = await rotateLeftRB(xParent, sharedTm, (nn) => gp.left = nn);
                  else gp.right = await rotateLeftRB(xParent, sharedTm, (nn) => gp.right = nn);
                }
                s = xParent.right;
              }
              if (!s || ((!s.left || s.left.color === 'BLACK') && (!s.right || s.right.color === 'BLACK'))) {
                if (s) s.color = 'RED';
                x = xParent; xParent = getParent(sharedTm, x);
              } else {
                if (!s.right || s.right.color === 'BLACK') {
                  if (s.left) s.left.color = 'BLACK';
                  s.color = 'RED';
                  xParent.right = await rotateRightRB(s, sharedTm, (nn) => xParent.right = nn);
                  s = xParent.right;
                }
                s.color = xParent.color; xParent.color = 'BLACK';
                if (s.right) s.right.color = 'BLACK';
                const gp = getParent(sharedTm, xParent);
                if (!gp) sharedTm.root = await rotateLeftRB(xParent, sharedTm, (nn) => sharedTm.root = nn);
                else {
                  if (xParent === gp.left) gp.left = await rotateLeftRB(xParent, sharedTm, (nn) => gp.left = nn);
                  else gp.right = await rotateLeftRB(xParent, sharedTm, (nn) => gp.right = nn);
                }
                x = sharedTm.root;
              }
            } else {
              let s = xParent.left;
              if (s && s.color === 'RED') {
                s.color = 'BLACK'; xParent.color = 'RED';
                const gp = getParent(sharedTm, xParent);
                if (!gp) sharedTm.root = await rotateRightRB(xParent, sharedTm, (nn) => sharedTm.root = nn);
                else {
                  if (xParent === gp.left) gp.left = await rotateRightRB(xParent, sharedTm, (nn) => gp.left = nn);
                  else gp.right = await rotateRightRB(xParent, sharedTm, (nn) => gp.right = nn);
                }
                s = xParent.left;
              }
              if (!s || ((!s.right || s.right.color === 'BLACK') && (!s.left || s.left.color === 'BLACK'))) {
                if (s) s.color = 'RED';
                x = xParent; xParent = getParent(sharedTm, x);
              } else {
                if (!s.left || s.left.color === 'BLACK') {
                  if (s.right) s.right.color = 'BLACK';
                  s.color = 'RED';
                  xParent.left = await rotateLeftRB(s, sharedTm, (nn) => xParent.left = nn);
                  s = xParent.left;
                }
                s.color = xParent.color; xParent.color = 'BLACK';
                if (s.left) s.left.color = 'BLACK';
                const gp = getParent(sharedTm, xParent);
                if (!gp) sharedTm.root = await rotateRightRB(xParent, sharedTm, (nn) => sharedTm.root = nn);
                else {
                  if (xParent === gp.left) gp.left = await rotateRightRB(xParent, sharedTm, (nn) => gp.left = nn);
                  else gp.right = await rotateRightRB(xParent, sharedTm, (nn) => gp.right = nn);
                }
                x = sharedTm.root;
              }
            }
          }
          if (x) x.color = 'BLACK';
          if (sharedTm.root) sharedTm.root.color = 'BLACK';
          setRoot(cloneTree(sharedTm.root));
        };

        const del = async (sharedTm, v) => {
          let curr = sharedTm.root;
          while (curr && curr.value !== v) {
            await slowVisit(curr.id, 'searching', `Searching...`);
            curr = v < curr.value ? curr.left : curr.right;
          }
          if (!curr) return;
          updateHighlight(curr.id, 'deleting'); await delay(1000);

          let y = curr; let yOriginalColor = y.color;
          let x, xParent;
          if (!curr.left) {
            x = curr.right;
            xParent = getParent(sharedTm, curr);
            const p = xParent;
            if (!p) sharedTm.root = x;
            else if (curr === p.left) p.left = x; else p.right = x;
          } else if (!curr.right) {
            x = curr.left;
            xParent = getParent(sharedTm, curr);
            const p = xParent;
            if (!p) sharedTm.root = x;
            else if (curr === p.left) p.left = x; else p.right = x;
          } else {
            y = curr.right; while (y.left) y = y.left;
            yOriginalColor = y.color;
            x = y.right;
            if (getParent(sharedTm, y) === curr) xParent = y;
            else {
              const yp = getParent(sharedTm, y);
              xParent = yp;
              yp.left = x;
              y.right = curr.right;
            }
            const cp = getParent(sharedTm, curr);
            if (!cp) sharedTm.root = y;
            else if (curr === cp.left) cp.left = y; else cp.right = y;
            y.left = curr.left; y.color = curr.color;
          }
          setRoot(cloneTree(sharedTm.root)); await delay(800);
          if (yOriginalColor === 'BLACK') {
            addLog("Deleted node was BLACK: Fixing RB violations.", "warning");
            await fixDelete(sharedTm, x, xParent);
          }
        };
        await del(tm, val);
      } else if (view === 'b-tree') {
        const tm = { root: cloneTree(root) };
        if (!root) return;

        const T_MIN = Math.ceil(bTreeOrder / 2);

        const getPred = (n, idx) => {
          let curr = n.children[idx];
          while (!curr.isLeaf) curr = curr.children[curr.keys.length];
          return curr.keys[curr.keys.length - 1];
        };

        const getSucc = (n, idx) => {
          let curr = n.children[idx + 1];
          while (!curr.isLeaf) curr = curr.children[0];
          return curr.keys[0];
        };

        const fill = async (n, idx) => {
          if (idx !== 0 && n.children[idx - 1].keys.length >= T_MIN) {
            // Borrow from prev
            let child = n.children[idx], sibling = n.children[idx - 1];
            child.keys.unshift(n.keys[idx - 1]);
            if (!child.isLeaf) child.children.unshift(sibling.children.pop());
            n.keys[idx - 1] = sibling.keys.pop();
            addLog("Borrowing from left sibling.", "warning");
          } else if (idx !== n.keys.length && n.children[idx + 1].keys.length >= T_MIN) {
            // Borrow from next
            let child = n.children[idx], sibling = n.children[idx + 1];
            child.keys.push(n.keys[idx]);
            if (!child.isLeaf) child.children.push(sibling.children.shift());
            n.keys[idx] = sibling.keys.shift();
            addLog("Borrowing from right sibling.", "warning");
          } else {
            // Merge
            if (idx !== n.keys.length) {
              let child = n.children[idx], sibling = n.children[idx + 1];
              child.keys.push(n.keys.splice(idx, 1)[0]);
              child.keys.push(...sibling.keys);
              if (!child.isLeaf) child.children.push(...sibling.children);
              n.children.splice(idx + 1, 1);
            } else {
              let child = n.children[idx - 1], sibling = n.children[idx];
              child.keys.push(n.keys.splice(idx - 1, 1)[0]);
              child.keys.push(...sibling.keys);
              if (!child.isLeaf) child.children.push(...sibling.children);
              n.children.splice(idx, 1);
            }
            addLog("Merging nodes to maintain minimum degree.", "warning");
          }
          setRoot(cloneTree(tm.root)); await delay(1000);
        };

        const delInternal = async (n, k) => {
          let idx = 0; while (idx < n.keys.length && n.keys[idx] < k) idx++;
          if (idx < n.keys.length && n.keys[idx] === k) {
            updateHighlight(n.id, 'deleting'); await delay(800);
            if (n.isLeaf) {
              n.keys.splice(idx, 1);
              addLog(`Removed ${k} from leaf.`, 'success');
            } else {
              if (n.children[idx].keys.length >= T_MIN) {
                const pred = getPred(n, idx);
                n.keys[idx] = pred;
                await delInternal(n.children[idx], pred);
              } else if (n.children[idx + 1].keys.length >= T_MIN) {
                const succ = getSucc(n, idx);
                n.keys[idx] = succ;
                await delInternal(n.children[idx + 1], succ);
              } else {
                await fill(n, idx);
                await delInternal(n.children[idx], k);
              }
            }
          } else {
            if (n.isLeaf) return;
            let lastChild = idx === n.keys.length;
            if (n.children[idx].keys.length < T_MIN) await fill(n, idx);
            if (lastChild && idx > n.keys.length) await delInternal(n.children[idx - 1], k);
            else await delInternal(n.children[idx], k);
          }
          setRoot(cloneTree(tm.root));
        };

        await delInternal(tm.root, val);
        if (tm.root.keys.length === 0) tm.root = tm.root.children[0] || null;
        setRoot(cloneTree(tm.root));
      } else if (view === 'b-plus-tree') {
        const tm = { root: cloneTree(root) };
        if (!root) return;
        const T_MIN = Math.ceil(bTreeOrder / 2);

        const findLeaf = async (n, k, path) => {
          if (n.isLeaf) return n;
          path.push(n);
          let i = 0; while (i < n.keys.length && k > n.keys[i]) i++;
          if (i < n.keys.length && k === n.keys[i]) i++;
          await slowVisit(n.id, 'searching', `Searching leaf for ${k}...`);
          return await findLeaf(n.children[i], k, path);
        };

        const updateInternalKeys = (sharedTm, oldK, newK) => {
          const traverse = (n) => {
            if (!n) return;
            for (let i = 0; i < n.keys.length; i++) {
              if (n.keys[i] === oldK) { n.keys[i] = newK; return; }
            }
            if (!n.isLeaf) n.children.forEach(traverse);
          };
          traverse(sharedTm.root);
        };

        const path = [];
        const leaf = await findLeaf(tm.root, val, path);
        const idx = leaf.keys.indexOf(val);
        if (idx === -1) {
          addLog(`Key ${val} not found in B+ Tree.`, 'warning');
          setIsProcessing(false); return;
        }

        updateHighlight(leaf.id, 'deleting'); await delay(1000);
        leaf.keys.splice(idx, 1);
        if (idx === 0 && leaf.keys.length > 0 && path.length > 0) {
          updateInternalKeys(tm, val, leaf.keys[0]);
        }
        addLog(`Removed ${val} from leaf.`, 'success');
        setRoot(cloneTree(tm.root)); await delay(1000);

        let node = leaf;
        while (node !== tm.root && node.keys.length < T_MIN - 1) {
          const parent = path.pop();
          const childIdx = parent.children.indexOf(node);
          const leftSib = childIdx > 0 ? parent.children[childIdx - 1] : null;
          const rightSib = childIdx < parent.children.length - 1 ? parent.children[childIdx + 1] : null;

          if (leftSib && leftSib.keys.length >= T_MIN) {
            addLog("Borrowing from left sibling.", "warning");
            if (node.isLeaf) {
              const borrowedKey = leftSib.keys.pop();
              node.keys.unshift(borrowedKey);
              parent.keys[childIdx - 1] = node.keys[0];
            } else {
              node.keys.unshift(parent.keys[childIdx - 1]);
              parent.keys[childIdx - 1] = leftSib.keys.pop();
              node.children.unshift(leftSib.children.pop());
            }
            node = tm.root; // Done
          } else if (rightSib && rightSib.keys.length >= T_MIN) {
            addLog("Borrowing from right sibling.", "warning");
            if (node.isLeaf) {
              const borrowedKey = rightSib.keys.shift();
              node.keys.push(borrowedKey);
              parent.keys[childIdx] = rightSib.keys[0];
            } else {
              node.keys.push(parent.keys[childIdx]);
              parent.keys[childIdx] = rightSib.keys.shift();
              node.children.push(rightSib.children.shift());
            }
            node = tm.root; // Done
          } else {
            // Merge
            addLog("Merging nodes...", "warning");
            if (leftSib) {
              if (node.isLeaf) {
                leftSib.keys.push(...node.keys);
                leftSib.next = node.next;
                parent.keys.splice(childIdx - 1, 1);
                parent.children.splice(childIdx, 1);
              } else {
                leftSib.keys.push(parent.keys[childIdx - 1], ...node.keys);
                leftSib.children.push(...node.children);
                parent.keys.splice(childIdx - 1, 1);
                parent.children.splice(childIdx, 1);
              }
              node = parent;
            } else {
              if (node.isLeaf) {
                node.keys.push(...rightSib.keys);
                node.next = rightSib.next;
                parent.keys.splice(childIdx, 1);
                parent.children.splice(childIdx + 1, 1);
              } else {
                node.keys.push(parent.keys[childIdx], ...rightSib.keys);
                node.children.push(...rightSib.children);
                parent.keys.splice(childIdx, 1);
                parent.children.splice(childIdx + 1, 1);
              }
              node = parent;
            }
          }
          if (tm.root.keys.length === 0 && !tm.root.isLeaf) tm.root = tm.root.children[0];
          setRoot(cloneTree(tm.root)); await delay(1000);
        }
        setRoot(cloneTree(tm.root));
      } else {
        const tm = { root: cloneTree(root) };
        const del = async (n, v) => {
          if (!n) return null;
          await slowVisit(n.id, 'searching', `Descending...`);
          if (v < n.value) n.left = await del(n.left, v);
          else if (v > n.value) n.right = await del(n.right, v);
          else {
            updateHighlight(n.id, 'deleting'); await delay(1500);
            if (!n.left || !n.right) return n.left || n.right;
            let s = n.right; while (s.left) s = s.left;
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
      }
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    } catch (err) {
      console.error("Deletion error:", err);
      addLog(`CRITICAL ERROR during deletion: ${err.message}`, 'target');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = async () => {
    const val = parseInt(inputValue); if (isNaN(val)) return;
    setInputValue(''); setIsProcessing(true); resetHighlights();
    try {
      const s = async (n, v) => {
        if (!n) return null;
        if (view === 'b-tree' || view === 'b-plus-tree') {
          let i = 0; while (i < n.keys.length && v > n.keys[i]) i++;
          if (view === 'b-plus-tree') {
            // B+ search always descends to leaf
            await slowVisit(n.id, 'searching', `Checking node with keys [${n.keys.join(', ')}]...`);
            if (n.isLeaf) {
              if (n.keys.includes(v)) { updateHighlight(n.id, 'processed'); return n; }
              return null;
            }
            let childIdx = 0; while (childIdx < n.keys.length && v > n.keys[childIdx]) childIdx++;
            if (childIdx < n.keys.length && v === n.keys[childIdx]) childIdx++;
            return await s(n.children[childIdx], v);
          } else {
            // B-Tree search can stop at internal node
            await slowVisit(n.id, 'searching', `Checking node with keys [${n.keys.join(', ')}]...`);
            if (i < n.keys.length && n.keys[i] === v) { updateHighlight(n.id, 'processed'); return n; }
            if (n.isLeaf) return null;
            return await s(n.children[i], v);
          }
        }
        await slowVisit(n.id, 'searching', `Checking ${n.value}...`);
        if (n.value === v) { updateHighlight(n.id, 'processed'); return n; }
        return v < n.value ? await s(n.left, v) : await s(n.right, v);
      };
      const target = await s(root, val);
      if (target && view === 'splay') {
        const tm = { root: cloneTree(root) };
        tm.root = await splay(tm.root, val, tm, (nn) => tm.root = nn);
        setRoot(cloneTree(tm.root));
      }
      await delay(HIGHLIGHT_RESET_DELAY); resetHighlights();
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTraversal = async (t) => {
    setIsProcessing(true); setTraversalResult([]); setTraversalType(t); const seq = [];
    try {
      const tr = async (n) => {
        if (!n) return;
        if (t === 'Pre-Order') { await v(n); await tr(n.left); await tr(n.right); }
        else if (t === 'In-Order') { await tr(n.left); await v(n); await tr(n.right); }
        else { await tr(n.left); await tr(n.right); await v(n); }
      };
      const v = async (n) => {
        updateHighlight(n.id, 'traversal'); seq.push(n.value); setTraversalResult([...seq]);
        addLog(`Visit: ${n.value}`, 'traversal'); await delay(600);
        updateHighlight(n.id, 'default');
      };
      await tr(root);
    } finally {
      setIsProcessing(false);
    }
  };

  const { positions, connections } = useMemo(() => {
    const p = []; const c = [];
    const leaves = [];
    const calc = (n, x, d, w) => {
      if (!n) return;
      const y = (d + 1) * LAYER_HEIGHT + 20;

      if (view === 'b-tree' || view === 'b-plus-tree') {
        const nodeWidth = n.keys.length * 40 + 20;
        p.push({ id: n.id, keys: [...n.keys], depth: d, x, y, isLeaf: n.isLeaf, highlight: highlights[n.id] || 'default', type: 'b-node', width: nodeWidth });
        if (n.isLeaf) leaves.push({ id: n.id, x, y, width: nodeWidth });

        const nY = (d + 2) * LAYER_HEIGHT + 20;
        const numChildren = n.children.length;
        if (numChildren > 0) {
          const totalWidth = w;
          const startX = x - totalWidth / 2 + totalWidth / (numChildren * 2);
          const gap = totalWidth / numChildren;
          n.children.forEach((child, i) => {
            const childX = startX + i * gap;
            c.push({
              id: `c-${child.id}`,
              x1: x, y1: y + 15,
              x2: childX, y2: nY - 15,
              isNew: highlights[child.id] === 'inserting',
              isSearching: highlights[child.id] === 'searching' || highlights[n.id] === 'searching'
            });
            calc(child, childX, d + 1, gap);
          });
        }
      } else {
        const hl = getHeight(n.left); const hr = getHeight(n.right);
        p.push({ id: n.id, value: n.value, depth: d, hl, hr, bf: hl - hr, x, y, color: n.color, highlight: highlights[n.id] || 'default' });
        const nY = (d + 2) * LAYER_HEIGHT + 20;
        const currentGap = Math.max(w / 4, MIN_GAP / 2);
        if (n.left) { c.push({ id: `l-${n.left.id}`, x1: x, y1: y, x2: x - currentGap, y2: nY, isNew: highlights[n.left.id] === 'inserting' }); calc(n.left, x - currentGap, d + 1, currentGap * 2); }
        if (n.right) { c.push({ id: `r-${n.right.id}`, x1: x, y1: y, x2: x + currentGap, y2: nY, isNew: highlights[n.right.id] === 'inserting' }); calc(n.right, x + currentGap, d + 1, currentGap * 2); }
      }
    };
    calc(root, canvasSize.width / 2, 0, canvasSize.width * 0.75);

    // Add horizontal links for B+ Tree leaves
    if (view === 'b-plus-tree' && leaves.length > 1) {
      leaves.sort((a, b) => a.x - b.x);
      for (let i = 0; i < leaves.length - 1; i++) {
        c.push({
          id: `leaf-link-${i}`,
          x1: leaves[i].x + leaves[i].width / 2,
          y1: leaves[i].y,
          x2: leaves[i + 1].x - leaves[i + 1].width / 2,
          y2: leaves[i + 1].y,
          isLeafLink: true
        });
      }
    }

    return { positions: p, connections: c };
  }, [root, highlights, canvasSize.width, view]);

  const handleReset = () => {
    setRoot(null);
    setLogs([]);
    setTraversalResult([]);
    setTraversalType('');
    resetHighlights();
    addLog("Laboratory reset. Memory core cleared.", "success");
  };

  const onSelectView = (v) => {
    if (v === 'b-tree' || v === 'b-plus-tree') {
      setShowOrderModal(true);
      setView(v); // Temporarily set view to get correct modal title if needed
    } else {
      setView(v);
      resetHighlights();
      setRoot(null);
      setLogs([]);
      setTraversalResult([]);
    }
  };

  const onSelectBTreeOrder = (order) => {
    setBTreeOrder(order);
    setShowOrderModal(false);
    resetHighlights();
    setRoot(null);
    setLogs([]);
    setTraversalResult([]);
    addLog(`Laboratory initialized with Order-${order} architecture. No pre-loaded nodes.`, 'success');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans selection:bg-indigo-500/30">
      {view === 'welcome' ? <WelcomeScreen onSelect={onSelectView} /> : (
        <Dashboard
          view={view} onHome={() => setView('welcome')} root={root} highlights={highlights}
          inputValue={inputValue} setInputValue={setInputValue} handleInsert={handleInsert}
          handleDelete={handleDelete} handleReset={handleReset} handleTraversal={handleTraversal}
          handleSearch={handleSearch} generateRandomTree={generateRandomTree} isProcessing={isProcessing}
          showLegend={showLegend} setShowLegend={setShowLegend} canvasRef={canvasRef} scrollRef={scrollRef}
          canvasSize={canvasSize} logs={logs} traversalResult={traversalResult} traversalType={traversalType}
          positions={positions} connections={connections} setShowRules={setShowRules}
        />
      )}
      {showOrderModal && <OrderSelectionModal onSelect={onSelectBTreeOrder} onClose={() => setShowOrderModal(false)} view={view} />}
      {showRules && <RulesModal order={bTreeOrder} onClose={() => setShowRules(false)} view={view} />}
    </div>
  );
}

export default App;
