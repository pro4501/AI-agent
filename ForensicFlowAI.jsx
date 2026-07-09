import React, { useState, useCallback, useMemo, useEffect } from 'react';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) { console.error(error); }
  };
  return [storedValue, setValue];
};

// ============================================
// SUB-COMPONENTS
// ============================================

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 transform transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'bg-indigo-600' }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

const FileIcon = ({ type }) => {
  const icons = {
    image: '🖼️', video: '🎬', audio: '🎵', document: '📄', archive: '📦', other: '📎'
  };
  return <span className="text-2xl">{icons[type] || icons.other}</span>;
};

// ============================================
// TAB COMPONENTS
// ============================================

const DashboardTab = ({ cases, analysisResults, recentActivity }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Cases', value: cases.length, icon: '📁', color: 'from-blue-500 to-blue-600', trend: '+12%' },
        { label: 'In Progress', value: cases.filter(c => c.status === 'In Progress').length, icon: '⏳', color: 'from-amber-500 to-amber-600', trend: '+5%' },
        { label: 'Completed', value: cases.filter(c => c.status === 'Closed').length, icon: '✅', color: 'from-emerald-500 to-emerald-600', trend: '+23%' },
        { label: 'AI Analyses', value: analysisResults.length, icon: '🤖', color: 'from-purple-500 to-purple-600', trend: '+18%' },
      ].map((stat, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">{stat.trend} this week</p>
            </div>
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Case Status Distribution */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Case Status Distribution</h3>
        <div className="space-y-3">
          {['Open', 'In Progress', 'Under Review', 'Closed'].map(status => {
            const count = cases.filter(c => c.status === status).length;
            const pct = cases.length ? (count / cases.length) * 100 : 0;
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <ProgressBar value={pct} color={
                  status === 'Open' ? 'bg-blue-500' :
                  status === 'In Progress' ? 'bg-amber-500' :
                  status === 'Under Review' ? 'bg-purple-500' : 'bg-emerald-500'
                } />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Priority Overview */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Priority Overview</h3>
        <div className="space-y-3">
          {['Critical', 'High', 'Medium', 'Low'].map(priority => {
            const count = cases.filter(c => c.priority === priority).length;
            const pct = cases.length ? (count / cases.length) * 100 : 0;
            return (
              <div key={priority}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{priority}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <ProgressBar value={pct} color={
                  priority === 'Critical' ? 'bg-red-600' :
                  priority === 'High' ? 'bg-orange-500' :
                  priority === 'Medium' ? 'bg-amber-500' : 'bg-gray-400'
                } />
              </div>
            );
          })}
        </div>
      </Card>
    </div>

    {/* Recent Activity */}
    <Card className="p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {recentActivity.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {recentActivity.slice(0, 8).map(activity => (
            <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  </div>
);

const CasesTab = ({ cases, setCases, searchQuery, setSearchQuery, onViewCase }) => (
  <div className="space-y-6">
    {/* Search & Filters */}
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search cases by title, ID, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          className="px-4 py-3 border rounded-xl"
          onChange={e => setSearchQuery(prev => prev)}
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    </Card>

    {/* Cases Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-gray-500">No cases found. Create your first case!</p>
        </div>
      ) : (
        cases.map(c => (
          <Card key={c.id} className="p-5 hover:border-indigo-300" onClick={() => onViewCase(c)}>
            <div className="flex justify-between items-start mb-3">
              <Badge variant={c.status === 'Closed' ? 'success' : c.status === 'In Progress' ? 'warning' : 'info'}>
                {c.status}
              </Badge>
              <Badge variant={c.priority === 'Critical' ? 'danger' : c.priority === 'High' ? 'warning' : 'default'}>
                {c.priority}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{c.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono">{c.id}</span>
              <span>{formatDate(c.createdAt)}</span>
            </div>
            <div className="mt-3 pt-3 border-t flex gap-4 text-sm">
              <span>📎 {c.evidence.length} evidence</span>
              <span>💬 {c.notes.length} notes</span>
            </div>
          </Card>
        ))
      )}
    </div>
  </div>
);

const EvidenceTab = ({ selectedCase, setSelectedCase, onProcessEvidence }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (selectedCase && files.length) {
      const newEvidence = files.map(f => ({
        id: generateId('EVD'),
        name: f.name,
        size: f.size,
        type: f.type.split('/')[0],
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        hash: Math.random().toString(36).substr(2),
      }));
      setSelectedCase(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...newEvidence],
      }));
    }
  }, [selectedCase, setSelectedCase]);

  const removeEvidence = (id) => {
    setSelectedCase(prev => ({
      ...prev,
      evidence: prev.evidence.filter(e => e.id !== id),
    }));
  };

  if (!selectedCase) {
    return (
      <Card className="p-12 text-center">
        <p className="text-4xl mb-4">👈</p>
        <p className="text-gray-500">Select a case from the Cases tab to manage evidence</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <Card className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{selectedCase.title}</h2>
            <p className="text-sm text-gray-500">ID: {selectedCase.id}</p>
          </div>
          <button
            onClick={() => onProcessEvidence(selectedCase.evidence)}
            disabled={selectedCase.evidence.length === 0}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>🤖</span> Run AI Analysis
          </button>
        </div>
      </Card>

      {/* Upload Zone */}
      <Card
        className="p-8 border-2 border-dashed"
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className={`text-center py-8 ${dragActive ? 'bg-indigo-50 rounded-xl' : ''}`}>
          <p className="text-5xl mb-4">📤</p>
          <p className="text-lg font-medium text-gray-700">Drag & drop files here</p>
          <p className="text-sm text-gray-400 mt-2">or click to browse</p>
          <p className="text-xs text-gray-400 mt-4">Supports: Images, Documents, Logs, Archives • Max 100MB per file</p>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              const newEvidence = files.map(f => ({
                id: generateId('EVD'),
                name: f.name,
                size: f.size,
                type: f.type.split('/')[0],
                uploadedAt: new Date().toISOString(),
                status: 'uploaded',
                hash: Math.random().toString(36).substr(2),
              }));
              setSelectedCase(prev => ({ ...prev, evidence: [...prev.evidence, ...newEvidence] }));
            }}
          />
        </div>
      </Card>

      {/* Evidence List */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Uploaded Evidence ({selectedCase.evidence.length})</h3>
        </div>
        {selectedCase.evidence.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No evidence uploaded yet</p>
        ) : (
          <div className="divide-y">
            {selectedCase.evidence.map(ev => (
              <div key={ev.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <FileIcon type={ev.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ev.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(ev.size)} • {ev.hash.substring(0, 8)}</p>
                </div>
                <Badge variant="success">{ev.status}</Badge>
                <button
                  onClick={() => removeEvidence(ev.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const AnalysisTab = ({ analysisResults, isProcessing, onRunAnalysis }) => (
  <div className="space-y-6">
    {/* AI Engine Info */}
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg">
          🤖
        </div>
        <div>
          <h2 className="text-xl font-semibold">AI Analysis Engine</h2>
          <p className="text-gray-500">Powered by advanced machine learning models for forensic analysis</p>
        </div>
      </div>
    </Card>

    {/* Processing State */}
    {isProcessing && (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium">Processing Evidence...</p>
          <p className="text-gray-500 text-sm mt-2">AI is analyzing patterns and anomalies</p>
        </div>
      </Card>
    )}

    {/* Analysis Results */}
    {!isProcessing && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analysisResults.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium text-gray-700">No Analysis Results Yet</p>
              <p className="text-gray-500 mt-2">Upload evidence and run AI analysis to see results</p>
            </Card>
          </div>
        ) : (
          analysisResults.map(result => (
            <Card key={result.id} className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Analysis Result</h3>
                  <p className="text-sm text-gray-500">{formatDate(result.timestamp)}</p>
                </div>
                <Badge variant="success">Complete</Badge>
              </div>
              <div className="space-y-3">
                {result.findings.map((finding, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{finding.type === 'pattern' ? '📊' : finding.type === 'anomaly' ? '⚠️' : '🔎'}</span>
                      <span className="font-medium capitalize">{finding.type}</span>
                      <Badge variant={finding.confidence > 0.9 ? 'success' : 'warning'}>
                        {(finding.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{finding.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">AI Summary</p>
                <p className="text-sm text-indigo-700 mt-1">{result.aiSummary}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    )}
  </div>
);

const ReportsTab = ({ cases, analysisResults }) => {
  const generateReport = (type) => {
    let content = '';
    const title = `ForensicFlowAI Report - ${type}`;
    
    if (type === 'summary') {
      content = `CASE SUMMARY REPORT
Generated: ${formatDate(new Date())}

Total Cases: ${cases.length}
Open Cases: ${cases.filter(c => c.status === 'Open').length}
In Progress: ${cases.filter(c => c.status === 'In Progress').length}
Closed Cases: ${cases.filter(c => c.status === 'Closed').length}

CASES LIST:
${cases.map(c => `- ${c.id}: ${c.title} (${c.status}, ${c.priority})`).join('\n')}
`;
    } else if (type === 'evidence') {
      content = `EVIDENCE REPORT
Generated: ${formatDate(new Date())}

TOTAL EVIDENCE: ${cases.reduce((acc, c) => acc + c.evidence.length, 0)} items

${cases.map(c => `
CASE: ${c.title} (${c.id})
Evidence Items: ${c.evidence.length}
${c.evidence.map(e => `  - ${e.name} (${formatFileSize(e.size)}, ${e.hash.substring(0, 8)})`).join('\n')}
`).join('\n')}
`;
    } else if (type === 'ai') {
      content = `AI ANALYSIS REPORT
Generated: ${formatDate(new Date())}

Total Analyses: ${analysisResults.length}

${analysisResults.map((r, i) => `
Analysis #${i + 1} - ${formatDate(r.timestamp)}
Findings: ${r.findings.length}
${r.findings.map(f => `  - [${(f.confidence * 100).toFixed(0)}%] ${f.type}: ${f.description}`).join('\n')}
Summary: ${r.aiSummary}
`).join('\n')}
`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'summary', title: 'Case Summary', icon: '📋', desc: 'Overview of all cases with status and priority' },
          { type: 'evidence', title: 'Evidence Report', icon: '🔍', desc: 'Complete evidence inventory with file details' },
          { type: 'ai', title: 'AI Analysis', icon: '🤖', desc: 'AI findings and analysis results' },
        ].map(report => (
          <Card key={report.type} className="p-6 hover:border-indigo-300 cursor-pointer" onClick={() => generateReport(report.type)}>
            <span className="text-4xl">{report.icon}</span>
            <h3 className="font-semibold mt-3">{report.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
            <p className="text-indigo-600 text-sm font-medium mt-4">Click to download →</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ForensicFlowAI = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useLocalStorage('forensic-cases', []);
  const [selectedCase, setSelectedCase] = useState(null);
  const [analysisResults, setAnalysisResults] = useLocalStorage('forensic-analysis', []);
  const [recentActivity, setRecentActivity] = useLocalStorage('forensic-activity', []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', description: '', priority: 'Medium' });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'cases', label: 'Cases', icon: '📁' },
    { id: 'evidence', label: 'Evidence', icon: '🔍' },
    { id: 'analysis', label: 'Analysis', icon: '🤖' },
    { id: 'reports', label: 'Reports', icon: '📄' },
  ];

  const addActivity = useCallback((message, icon) => {
    setRecentActivity(prev => [{ id: generateId('ACT'), message, icon, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
  }, []);

  const handleCreateCase = useCallback(() => {
    if (!newCase.title.trim()) return;
    const caseData = {
      id: generateId('CASE'),
      title: newCase.title,
      description: newCase.description,
      priority: newCase.priority,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: [],
      notes: [],
    };
    setCases(prev => [caseData, ...prev]);
    addActivity(`New case created: ${caseData.title}`, '✨');
    setShowNewCaseModal(false);
    setNewCase({ title: '', description: '', priority: 'Medium' });
    setSelectedCase(caseData);
    setActiveTab('cases');
  }, [newCase, setCases, addActivity]);

  const handleProcessEvidence = useCallback(async (evidence) => {
    if (!evidence.length) return;
    setIsProcessing(true);
    setActiveTab('analysis');
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const result = {
      id: generateId('ANALYSIS'),
      evidenceCount: evidence.length,
      timestamp: new Date().toISOString(),
      findings: [
        { type: 'pattern', confidence: 0.92 + Math.random() * 0.07, description: 'Recurring data pattern detected across multiple files' },
        { type: 'anomaly', confidence: 0.85 + Math.random() * 0.1, description: 'Unusual activity signature identified' },
        { type: 'correlation', confidence: 0.88 + Math.random() * 0.08, description: 'Temporal correlation found between events' },
        { type: 'threat', confidence: 0.75 + Math.random() * 0.15, description: 'Potential security indicator detected' },
      ],
      aiSummary: `Analysis complete. Processed ${evidence.length} evidence file(s). Identified ${Math.floor(Math.random() * 5) + 3} significant patterns requiring review. Overall threat assessment: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}.`,
    };
    
    setAnalysisResults(prev => [result, ...prev]);
    addActivity(`AI analysis completed: ${result.findings.length} findings`, '🤖');
    setIsProcessing(false);
  }, [setAnalysisResults, addActivity]);

  const handleViewCase = useCallback((caseItem) => {
    setSelectedCase(caseItem);
    setActiveTab('evidence');
  }, []);

  const filteredCases = useMemo(() => 
    cases.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [cases, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">🔬</span>
                ForensicFlowAI
              </h1>
              <p className="mt-1 text-indigo-200">AI-Powered Forensic Analysis Platform</p>
            </div>
            <button
              onClick={() => setShowNewCaseModal(true)}
              className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              + New Case
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab cases={cases} analysisResults={analysisResults} recentActivity={recentActivity} />
        )}
        {activeTab === 'cases' && (
          <CasesTab
            cases={filteredCases}
            setCases={setCases}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onViewCase={handleViewCase}
          />
        )}
        {activeTab === 'evidence' && (
          <EvidenceTab
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
            onProcessEvidence={handleProcessEvidence}
          />
        )}
        {activeTab === 'analysis' && (
          <AnalysisTab
            analysisResults={analysisResults}
            isProcessing={isProcessing}
            onRunAnalysis={handleProcessEvidence}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab cases={cases} analysisResults={analysisResults} />
        )}
      </main>

      {/* New Case Modal */}
      <Modal isOpen={showNewCaseModal} onClose={() => setShowNewCaseModal(false)} title="Create New Case">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Title *</label>
            <input
              type="text"
              value={newCase.title}
              onChange={e => setNewCase(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter case title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newCase.description}
              onChange={e => setNewCase(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Case description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newCase.priority}
              onChange={e => setNewCase(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowNewCaseModal(false)}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCase}
              disabled={!newCase.title.trim()}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Create Case
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForensicFlowAI;
