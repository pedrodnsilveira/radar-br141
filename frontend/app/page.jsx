"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";

const COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#BA7517', '#D4537E', '#7F77DD', '#639922', '#E24B4A'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function pad2(n) { return String(n).padStart(2, '0'); }

// ── Pill de filtro ativo ───────────────────────────────────────────────────
function Tag({ label, onRemove }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1efe8', borderRadius: '4px', padding: '2px 8px', marginRight: '6px', fontSize: '11px', color: '#444' }}>
            {label}
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, fontSize: '11px', lineHeight: 1 }}>✕</button>
        </span>
    );
}

// ── Barra de filtros ───────────────────────────────────────────────────────
function FilterBar({ todos, filters, setFilters }) {
    const tribos = useMemo(() => {
        const s = new Set();
        todos.forEach(x => { if (x.tribo_nova) s.add(x.tribo_nova); if (x.tribo_anterior) s.add(x.tribo_anterior); });
        return Array.from(s).sort();
    }, [todos]);

    const jogadores = useMemo(() => {
        const s = new Set();
        todos.forEach(x => { s.add(x.proprietario_novo); if (x.proprietario_anterior) s.add(x.proprietario_anterior); });
        return Array.from(s).sort();
    }, [todos]);

    const hasFilters = filters.tribo || filters.jogador || filters.dataInicio || filters.dataFim || filters.apenasBarbaras;

    const sel = { height: '32px', fontSize: '12px', border: '1px solid #e8e8e0', borderRadius: '6px', padding: '0 8px', background: '#fff', color: '#1a1a18', cursor: 'pointer', outline: 'none', width: '100%' };
    const inp = { ...sel };
    const lbl = { fontSize: '10px', color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', display: 'block' };

    const clear = () => setFilters({ tribo: '', jogador: '', dataInicio: '', dataFim: '', apenasBarbaras: false });

    return (
        <div style={{ background: '#fff', border: '1px solid #e8e8e0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    Filtros
                </span>
                {hasFilters && (
                    <button onClick={clear} style={{ fontSize: '11px', color: '#D85A30', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'monospace' }}>
                        ✕ Limpar tudo
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'end' }}>
                <div>
                    <label style={lbl}>Tribo</label>
                    <select style={sel} value={filters.tribo} onChange={e => setFilters(f => ({ ...f, tribo: e.target.value }))}>
                        <option value="">Todas</option>
                        {tribos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label style={lbl}>Jogador</label>
                    <select style={sel} value={filters.jogador} onChange={e => setFilters(f => ({ ...f, jogador: e.target.value }))}>
                        <option value="">Todos</option>
                        {jogadores.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                </div>
                <div>
                    <label style={lbl}>Data início</label>
                    <input type="date" style={inp} value={filters.dataInicio} onChange={e => setFilters(f => ({ ...f, dataInicio: e.target.value }))} />
                </div>
                <div>
                    <label style={lbl}>Data fim</label>
                    <input type="date" style={inp} value={filters.dataFim} onChange={e => setFilters(f => ({ ...f, dataFim: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
                    <input type="checkbox" id="chk-barbara" checked={filters.apenasBarbaras}
                        onChange={e => setFilters(f => ({ ...f, apenasBarbaras: e.target.checked }))}
                        style={{ cursor: 'pointer', width: '14px', height: '14px' }} />
                    <label htmlFor="chk-barbara" style={{ fontSize: '12px', color: '#444', cursor: 'pointer' }}>Só bárbaras</label>
                </div>
            </div>

            {hasFilters && (
                <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', borderTop: '1px solid #f0f0ea', paddingTop: '10px' }}>
                    Ativos:{' '}
                    {filters.tribo && <Tag label={`Tribo: ${filters.tribo}`} onRemove={() => setFilters(f => ({ ...f, tribo: '' }))} />}
                    {filters.jogador && <Tag label={`Jogador: ${filters.jogador}`} onRemove={() => setFilters(f => ({ ...f, jogador: '' }))} />}
                    {filters.dataInicio && <Tag label={`De: ${filters.dataInicio}`} onRemove={() => setFilters(f => ({ ...f, dataInicio: '' }))} />}
                    {filters.dataFim && <Tag label={`Até: ${filters.dataFim}`} onRemove={() => setFilters(f => ({ ...f, dataFim: '' }))} />}
                    {filters.apenasBarbaras && <Tag label="Só bárbaras" onRemove={() => setFilters(f => ({ ...f, apenasBarbaras: false }))} />}
                </div>
            )}
        </div>
    );
}

// ── Ranking card ───────────────────────────────────────────────────────────
function RankingCard({ title, items, color, emptyMsg = "Sem dados" }) {
    const max = items[0]?.[1] || 1;
    return (
        <div style={{ background: '#fff', border: '1px solid #e8e8e0', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>{title}</div>
            {items.length === 0 && <div style={{ fontSize: '12px', color: '#bbb', padding: '8px 0' }}>{emptyMsg}</div>}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.slice(0, 8).map(([name, count], i) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: i < Math.min(items.length, 8) - 1 ? '1px solid #f0f0ea' : 'none' }}>
                        <span style={{ fontSize: '10px', color: '#bbb', width: '22px' }}>#{i + 1}</span>
                        <span style={{ fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        <div style={{ width: '60px', height: '4px', background: '#f0f0ea', borderRadius: '3px', margin: '0 10px', flexShrink: 0 }}>
                            <div style={{ width: `${Math.round(count / max * 100)}%`, height: '4px', borderRadius: '3px', background: color }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '24px', textAlign: 'right', color }}>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Canvas de gráfico que se reinicia quando config muda ───────────────────
function ChartCanvas({ id, height, buildConfig }) {
    const ref = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (!ref.current || !window.Chart) return;
        instanceRef.current?.destroy();
        instanceRef.current = new window.Chart(ref.current, buildConfig());
        return () => instanceRef.current?.destroy();
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
            <canvas ref={ref} id={id} role="img" />
        </div>
    );
}

// ── Página principal ───────────────────────────────────────────────────────
export default function Home() {
    const [todos, setTodos] = useState([]);
    const [chartjsReady, setChartjsReady] = useState(false);
    const [filters, setFilters] = useState({ tribo: '', jogador: '', dataInicio: '', dataFim: '', apenasBarbaras: false });

    // Carrega dados
    useEffect(() => {
        fetch("/conquistas.json")
            .then(r => r.json())
            .then(raw => setTodos(raw.map(x => ({ ...x, _dt: new Date(x.data_hora_conquista) })).sort((a, b) => b._dt - a._dt)));
    }, []);

    // Carrega Chart.js
    useEffect(() => {
        if (window.Chart) { setChartjsReady(true); return; }
        if (document.getElementById('chartjs-cdn')) return;
        const s = document.createElement('script');
        s.id = 'chartjs-cdn';
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload = () => setChartjsReady(true);
        document.head.appendChild(s);
    }, []);

    // Filtragem
    const dados = useMemo(() => todos.filter(x => {
        if (filters.tribo && x.tribo_nova !== filters.tribo && x.tribo_anterior !== filters.tribo) return false;
        if (filters.jogador && x.proprietario_novo !== filters.jogador && x.proprietario_anterior !== filters.jogador) return false;
        if (filters.dataInicio && x.data_hora_conquista.slice(0, 10) < filters.dataInicio) return false;
        if (filters.dataFim && x.data_hora_conquista.slice(0, 10) > filters.dataFim) return false;
        if (
            filters.apenasBarbaras &&
            x.proprietario_anterior !== "Aldeia de Bárbaros"
        ) return false;
        return true;
    }), [todos, filters]);

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }));

    // Métricas
    const hoje = new Date();
    const todayStr = hoje.toISOString().slice(0, 10);
    const ontemStr = new Date(hoje.getTime() - 86400000).toISOString().slice(0, 10);
    const conquistasHoje = dados.filter(x => x.data_hora_conquista.startsWith(todayStr)).length;
    const conquistasOntem = todos.filter(x => x.data_hora_conquista.startsWith(ontemStr)).length;
    const delta = conquistasHoje - conquistasOntem;
    const playersSet = new Set(dados.map(x => x.proprietario_novo));
    const tribesSet = new Set(dados.map(x => x.tribo_nova).filter(Boolean));
    const byDay = {};
    dados.forEach(x => { const d = x.data_hora_conquista.slice(0, 10); byDay[d] = (byDay[d] || 0) + 1; });
    const peakDay = Math.max(0, ...Object.values(byDay));

    // Contagens
    const playerCounts = {};
    dados.forEach(x => { playerCounts[x.proprietario_novo] = (playerCounts[x.proprietario_novo] || 0) + 1; });
    const topPlayers = Object.entries(playerCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const maxP = topPlayers[0]?.[1] || 1;

    const tribeCounts = {};
    dados.forEach(x => { if (x.tribo_nova) tribeCounts[x.tribo_nova] = (tribeCounts[x.tribo_nova] || 0) + 1; });
    const top5tribes = Object.entries(tribeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const totalTribes = top5tribes.reduce((a, b) => a + b[1], 0) || 1;

    const barbaraCounts = {};
    dados.filter(x => (x.proprietario_anterior == "Aldeia de Bárbaros")).forEach(x => { barbaraCounts[x.proprietario_novo] = (barbaraCounts[x.proprietario_novo] || 0) + 1; });

    const perderamCounts = {};
    dados.forEach(x => { if (x.proprietario_anterior) perderamCounts[x.proprietario_anterior] = (perderamCounts[x.proprietario_anterior] || 0) + 1; });

    const triboPerderamCounts = {};
    dados.forEach(x => { if (x.tribo_anterior) triboPerderamCounts[x.tribo_anterior] = (triboPerderamCounts[x.tribo_anterior] || 0) + 1; });

    // Mapa de calor
    const hmMatrix = useMemo(() => {
        const m = Array.from({ length: 24 }, () => new Array(7).fill(0));
        dados.forEach(x => { const h = parseInt(x.data_hora_conquista.slice(11, 13)); const dow = x._dt.getDay(); if (!isNaN(h)) m[h][dow]++; });
        return m;
    }, [dados]);
    const maxHM = Math.max(1, ...hmMatrix.flat());
    const hmCols = ['#E6F1FB', '#85B7EB', '#378ADD', '#185FA5', '#042C53'];
    const hmColor = v => { if (!v) return '#f1efe8'; const t = v / maxHM; return t < 0.25 ? hmCols[1] : t < 0.5 ? hmCols[2] : t < 0.75 ? hmCols[3] : hmCols[4]; };
    const hmRows = [0, 3, 6, 9, 12, 15, 18, 21];

    const hasFilters = filters.tribo || filters.jogador || filters.dataInicio || filters.dataFim || filters.apenasBarbaras;

    const s = {
        page: { padding: '32px 40px', fontFamily: 'monospace', background: '#fafaf9', minHeight: '100vh' },
        header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #e5e5e0', marginBottom: '24px' },
        headerLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
        htitle: { fontSize: '20px', fontWeight: 600, color: '#1a1a18', letterSpacing: '0.05em' },
        hsub: { fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' },
        badge: { fontSize: '10px', padding: '3px 10px', borderRadius: '4px', background: '#eaf3de', color: '#3b6d11', letterSpacing: '0.08em', fontWeight: 600 },
        sec: c => ({ fontSize: '11px', color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, margin: '28px 0 12px', borderLeft: `3px solid ${c}`, paddingLeft: '10px' }),
        metrics: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' },
        metric: { background: '#fff', border: '1px solid #e8e8e0', borderRadius: '10px', padding: '14px 16px' },
        mLabel: { fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' },
        mValue: { fontSize: '28px', fontWeight: 600, color: '#1a1a18', lineHeight: 1 },
        mSub: { fontSize: '11px', color: '#888', marginTop: '4px' },
        row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
        row15: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', marginBottom: '20px' },
        card: { background: '#fff', border: '1px solid #e8e8e0', borderRadius: '12px', padding: '16px 20px' },
        cardTitle: { fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 },
        tableCard: { background: '#fff', border: '1px solid #e8e8e0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' },
        tbl: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
        th: { fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #e8e8e0', fontWeight: 600 },
        td: { padding: '8px 10px', color: '#1a1a18', borderBottom: '1px solid #f0f0ea' },
        pill: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: '#e6f1fb', color: '#185fa5', cursor: 'pointer' },
        pillGray: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: '#f1efe8', color: '#5f5e5a' },
        pillActive: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: '#185fa5', color: '#fff', cursor: 'pointer' },
    };

    return (
        <main style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerLeft}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" stroke="#378ADD" strokeWidth="1" />
                        <circle cx="16" cy="16" r="9" stroke="#378ADD" strokeWidth="0.7" strokeDasharray="2 2" />
                        <circle cx="16" cy="16" r="4" stroke="#378ADD" strokeWidth="0.7" />
                        <line x1="16" y1="2" x2="16" y2="30" stroke="#378ADD" strokeWidth="0.5" strokeDasharray="2 4" />
                        <line x1="2" y1="16" x2="30" y2="16" stroke="#378ADD" strokeWidth="0.5" strokeDasharray="2 4" />
                        <path d="M16 16 L26 8" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="16" cy="16" r="2" fill="#378ADD" />
                    </svg>
                    <div>
                        <div style={s.htitle}>Radar BR141</div>
                        <div style={s.hsub}>Central de Inteligência Territorial</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {hasFilters && (
                        <span style={{ fontSize: '11px', background: '#e6f1fb', color: '#185fa5', padding: '3px 10px', borderRadius: '4px' }}>
                            {dados.length} de {todos.length} registros
                        </span>
                    )}
                    <div style={s.badge}>● ATIVO</div>
                </div>
            </div>

            {/* Filtros */}
            <FilterBar todos={todos} filters={filters} setFilters={setFilters} />

            {/* Métricas */}
            <div style={s.metrics}>
                <div style={s.metric}>
                    <div style={s.mLabel}>Conquistas Hoje</div>
                    <div style={s.mValue}>{conquistasHoje}</div>
                    <div style={{ ...s.mSub, color: delta >= 0 ? '#3b6d11' : '#a32d2d' }}>{delta >= 0 ? '+' : ''}{delta} vs ontem</div>
                </div>
                <div style={s.metric}>
                    <div style={s.mLabel}>{hasFilters ? 'Filtrados' : 'Período'}</div>
                    <div style={s.mValue}>{dados.length}</div>
                    <div style={s.mSub}>{hasFilters ? 'registros' : `${Math.round(dados.length / 7)} média/dia`}</div>
                </div>
                <div style={s.metric}>
                    <div style={s.mLabel}>Jogadores</div>
                    <div style={s.mValue}>{playersSet.size}</div>
                    <div style={s.mSub}>únicos</div>
                </div>
                <div style={s.metric}>
                    <div style={s.mLabel}>Tribos</div>
                    <div style={s.mValue}>{tribesSet.size}</div>
                    <div style={s.mSub}>ativas</div>
                </div>
                <div style={s.metric}>
                    <div style={s.mLabel}>Pico Diário</div>
                    <div style={s.mValue}>{peakDay}</div>
                    <div style={s.mSub}>conquistas</div>
                </div>
            </div>

            {/* Sem resultados */}
            {dados.length === 0 && todos.length > 0 ? (
                <div style={{ ...s.card, textAlign: 'center', padding: '40px', color: '#bbb', fontSize: '13px', marginBottom: '20px' }}>
                    Nenhum resultado para os filtros aplicados.{' '}
                    <button onClick={() => setFilters({ tribo: '', jogador: '', dataInicio: '', dataFim: '', apenasBarbaras: false })}
                        style={{ color: '#378ADD', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: '13px' }}>
                        Limpar filtros
                    </button>
                </div>
            ) : chartjsReady && (
                <>
                    {/* Barras + Rosca */}
                    <div style={s.row2}>
                        <div style={s.card}>
                            <div style={s.cardTitle}>Conquistas por Dia (7 dias)</div>
                            <ChartCanvas id="barChart" height={180} buildConfig={() => {
                                const dayCounts = [], dayLabels = [];
                                for (let i = 6; i >= 0; i--) {
                                    const d = new Date(hoje); d.setDate(d.getDate() - i);
                                    const ds = d.toISOString().slice(0, 10);
                                    dayCounts.push(dados.filter(x => x.data_hora_conquista.startsWith(ds)).length);
                                    dayLabels.push(DAY_NAMES[d.getDay()]);
                                }
                                return { type: 'bar', data: { labels: dayLabels, datasets: [{ data: dayCounts, backgroundColor: '#378ADD', borderRadius: 4, borderSkipped: false }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#888' } }, y: { grid: { color: 'rgba(128,128,128,0.15)' }, ticks: { font: { size: 11 }, color: '#888', precision: 0 }, beginAtZero: true } } } };
                            }} />
                        </div>
                        <div style={s.card}>
                            <div style={s.cardTitle}>Top Tribos — clique para filtrar</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                {top5tribes.map((t, i) => (
                                    <span key={t[0]} onClick={() => setFilter('tribo', t[0])}
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', background: filters.tribo === t[0] ? '#e6f1fb' : 'transparent' }}>
                                        <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: COLORS[i], display: 'inline-block' }} />
                                        {t[0]} {Math.round(t[1] / totalTribes * 100)}%
                                    </span>
                                ))}
                            </div>
                            <ChartCanvas id="pieChart" height={150} buildConfig={() => ({
                                type: 'doughnut',
                                data: { labels: top5tribes.map(t => t[0]), datasets: [{ data: top5tribes.map(t => t[1]), backgroundColor: COLORS.slice(0, 5), borderWidth: 0 }] },
                                options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }
                            })} />
                        </div>
                    </div>

                    {/* Linha por hora + Top players */}
                    <div style={s.row15}>
                        <div style={s.card}>
                            <div style={s.cardTitle}>Atividade por Hora do Dia</div>
                            <ChartCanvas id="hourChart" height={160} buildConfig={() => {
                                const hb = new Array(24).fill(0);
                                dados.forEach(x => { const h = parseInt(x.data_hora_conquista.slice(11, 13)); if (!isNaN(h)) hb[h]++; });
                                return { type: 'line', data: { labels: Array.from({ length: 24 }, (_, i) => pad2(i) + 'h'), datasets: [{ data: hb, borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.08)', borderWidth: 1.5, pointRadius: 2, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#888', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } }, y: { grid: { color: 'rgba(128,128,128,0.15)' }, ticks: { font: { size: 10 }, color: '#888', precision: 0 }, beginAtZero: true } } } };
                            }} />
                        </div>
                        <div style={s.card}>
                            <div style={s.cardTitle}>Top Conquistadores — clique para filtrar</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {topPlayers.map(([name, count], i) => (
                                    <div key={name} onClick={() => setFilter('jogador', name)}
                                        style={{ display: 'flex', alignItems: 'center', padding: '7px 6px', borderBottom: i < topPlayers.length - 1 ? '1px solid #f0f0ea' : 'none', cursor: 'pointer', borderRadius: '4px', background: filters.jogador === name ? '#f0f7ff' : 'transparent' }}>
                                        <span style={{ fontSize: '10px', color: '#888', width: '22px' }}>#{i + 1}</span>
                                        <span style={{ fontSize: '12px', flex: 1, color: filters.jogador === name ? '#378ADD' : '#1a1a18' }}>{name}</span>
                                        <div style={{ width: '60px', height: '4px', background: '#f0f0ea', borderRadius: '3px', margin: '0 8px' }}>
                                            <div style={{ width: `${Math.round(count / maxP * 100)}%`, height: '4px', borderRadius: '3px', background: COLORS[i % COLORS.length] }} />
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '20px', textAlign: 'right' }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feed recente + Mapa de calor */}
                    <div style={s.row2}>
                        <div style={s.card}>
                            <div style={s.cardTitle}>Atividade Recente</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '800px', overflowY: 'auto' }}>
                                {dados.slice(0, 25).map((x, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '7px 0', borderBottom: '1px solid #f0f0ea' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0, marginTop: '5px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                                                <strong onClick={() => setFilter('jogador', x.proprietario_novo)}
                                                    style={{ cursor: 'pointer', color: filters.jogador === x.proprietario_novo ? '#378ADD' : '#1a1a18' }}>
                                                    {x.proprietario_novo}
                                                </strong>
                                                {x.tribo_nova && (
                                                    <span onClick={() => setFilter('tribo', x.tribo_nova)}
                                                        style={{ cursor: 'pointer', color: filters.tribo === x.tribo_nova ? '#378ADD' : '#888', fontSize: '11px' }}>
                                                        {` [${x.tribo_nova}]`}
                                                    </span>
                                                )}
                                                {` conquistou ${x.coordenadas}`}
                                                {x.proprietario_anterior
                                                    ? <span style={{ color: '#888' }}> de {x.proprietario_anterior}</span>
                                                    : <span style={{ color: '#bbb', fontSize: '11px' }}> (bárbara)</span>}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#bbb', marginTop: '2px' }}>{x.data_hora_conquista.slice(5, 16).replace('-', '/')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={s.card}>
                            <div style={s.cardTitle}>Mapa de Calor — Hora × Dia</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '24px repeat(7, 1fr)', gap: '2px', marginTop: '4px' }}>
                                <div />
                                {DAY_NAMES.map(d => <div key={d} style={{ fontSize: '9px', color: '#888', textAlign: 'center' }}>{d}</div>)}
                                {hmRows.map(h => (
                                    <React.Fragment key={h}>
                                        <div style={{ fontSize: '9px', color: '#888', display: 'flex', alignItems: 'center' }}>
                                            {pad2(h)}h
                                        </div>

                                        {Array.from({ length: 7 }, (_, d) => (
                                            <div
                                                key={`${h}-${d}`}
                                                title={`${hmMatrix[h][d]} conquistas`}
                                                style={{
                                                    aspectRatio: '1',
                                                    borderRadius: '3px',
                                                    background: hmColor(hmMatrix[h][d])
                                                }}
                                            />
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '9px', color: '#888' }}>
                                Menos {hmCols.slice(1).map((c, i) => <span key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: c, display: 'inline-block' }} />)} Mais
                            </div>
                        </div>
                    </div>

                    {/* Conquistas */}
                    <div style={s.sec('#1D9E75')}>Conquistas</div>
                    <div style={s.row2}>
                        <RankingCard title="Tribos que mais conquistaram aldeias" items={Object.entries(tribeCounts).sort((a, b) => b[1] - a[1])} color="#1D9E75" emptyMsg="Sem dados" />
                        <RankingCard title="Jogadores que conquistaram aldeias bárbaras" items={Object.entries(barbaraCounts).sort((a, b) => b[1] - a[1])} color="#378ADD" emptyMsg="Nenhuma conquista bárbara" />
                    </div>

                    {/* Perdas */}
                    <div style={s.sec('#D85A30')}>Perdas</div>
                    <div style={s.row2}>
                        <RankingCard title="Jogadores que mais perderam aldeias" items={Object.entries(perderamCounts).sort((a, b) => b[1] - a[1])} color="#D85A30" emptyMsg="Sem perdas registradas" />
                        <RankingCard title="Tribos que mais perderam aldeias" items={Object.entries(triboPerderamCounts).sort((a, b) => b[1] - a[1])} color="#BA7517" emptyMsg="Sem perdas de tribo" />
                    </div>
                </>
            )}

            {/* Tabela */}
            <div style={s.tableCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={s.cardTitle}>Registro de Conquistas</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                        {hasFilters ? `${dados.length} de ${todos.length}` : dados.length} registros
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={s.tbl}>
                        <thead>
                            <tr>
                                <th style={s.th}>Data / Hora</th>
                                <th style={s.th}>Coordenadas</th>
                                <th style={s.th}>Novo Dono</th>
                                <th style={s.th}>Tribo Nova</th>
                                <th style={s.th}>Anterior</th>
                                <th style={s.th}>Tribo Ant.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.slice(0, 100).map((x, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafaf9' }}>
                                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '11px' }}>{x.data_hora_conquista}</td>
                                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '11px', color: '#888' }}>{x.coordenadas}</td>
                                    <td onClick={() => setFilter('jogador', x.proprietario_novo)}
                                        style={{ ...s.td, fontWeight: 600, cursor: 'pointer', color: filters.jogador === x.proprietario_novo ? '#378ADD' : '#1a1a18' }}>
                                        {x.proprietario_novo}
                                    </td>
                                    <td style={s.td} onClick={() => x.tribo_nova && setFilter('tribo', x.tribo_nova)}>
                                        {x.tribo_nova
                                            ? <span style={filters.tribo === x.tribo_nova ? s.pillActive : s.pill}>{x.tribo_nova}</span>
                                            : <span style={{ color: '#bbb' }}>—</span>}
                                    </td>
                                    <td style={{ ...s.td, color: '#888' }}>
                                        {x.proprietario_anterior || <span style={{ color: '#ddd', fontSize: '11px' }}>bárbara</span>}
                                    </td>
                                    <td style={s.td}>
                                        {x.tribo_anterior ? <span style={s.pillGray}>{x.tribo_anterior}</span> : <span style={{ color: '#bbb' }}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}