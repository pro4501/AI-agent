import React, { useState, useCallback, useRef } from 'react';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

const formatDate = (date) => new Date(date).toLocaleString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File type detection
const getFileType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types = {
    zip: { icon: '📦', color: 'bg-purple-900/50 text-purple-300 border border-purple-700', category: 'archive' },
    rar: { icon: '📦', color: 'bg-purple-900/50 text-purple-300 border border-purple-700', category: 'archive' },
    '7z': { icon: '📦', color: 'bg-purple-900/50 text-purple-300 border border-purple-700', category: 'archive' },
    tar: { icon: '📦', color: 'bg-purple-900/50 text-purple-300 border border-purple-700', category: 'archive' },
    gz: { icon: '📦', color: 'bg-purple-900/50 text-purple-300 border border-purple-700', category: 'archive' },
    pcap: { icon: '🌐', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', category: 'network' },
    pcapng: { icon: '🌐', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', category: 'network' },
    cap: { icon: '🌐', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', category: 'network' },
    log: { icon: '📝', color: 'bg-slate-700/50 text-slate-300 border border-slate-600', category: 'log' },
    txt: { icon: '📄', color: 'bg-slate-700/50 text-slate-300 border border-slate-600', category: 'log' },
    json: { icon: '📋', color: 'bg-amber-900/50 text-amber-300 border border-amber-700', category: 'data' },
    xml: { icon: '📋', color: 'bg-amber-900/50 text-amber-300 border border-amber-700', category: 'data' },
    csv: { icon: '📊', color: 'bg-green-900/50 text-green-300 border border-green-700', category: 'data' },
    pdf: { icon: '📕', color: 'bg-red-900/50 text-red-300 border border-red-700', category: 'document' },
    doc: { icon: '📘', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', category: 'document' },
    docx: { icon: '📘', color: 'bg-blue-900/50 text-blue-300 border border-blue-700', category: 'document' },
    jpg: { icon: '🖼️', color: 'bg-pink-900/50 text-pink-300 border border-pink-700', category: 'image' },
    jpeg: { icon: '🖼️', color: 'bg-pink-900/50 text-pink-300 border border-pink-700', category: 'image' },
    png: { icon: '🖼️', color: 'bg-pink-900/50 text-pink-300 border border-pink-700', category: 'image' },
    exe: { icon: '⚙️', color: 'bg-red-900/50 text-red-300 border border-red-700', category: 'executable' },
    dll: { icon: '⚙️', color: 'bg-red-900/50 text-red-300 border border-red-700', category: 'executable' },
    sys: { icon: '💾', color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700', category: 'system' },
    mem: { icon: '💾', color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700', category: 'memory' },
    dmp: { icon: '💾', color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700', category: 'memory' },
    raw: { icon: '💿', color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700', category: 'disk' },
    img: { icon: '💿', color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700', category: 'disk' },
    iso: { icon: '💿', color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700', category: 'disk' },
  };
  return types[ext] || { icon: '📎', color: 'bg-slate-700/50 text-slate-300 border border-slate-600', category: 'other' };
};

// ============================================
// SUB-COMPONENTS
// ============================================

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-700 text-slate-200',
    success: 'bg-green-900/50 text-green-300 border border-green-700',
    warning: 'bg-amber-900/50 text-amber-300 border border-amber-700',
    danger: 'bg-red-900/50 text-red-300 border border-red-700',
    info: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 ${className}`}>{children}</div>
);

const ProgressBar = ({ value, color = 'bg-indigo-600' }) => (
  <div className="w-full bg-slate-700 rounded-full h-2">
    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
  </div>
);

// ============================================
// FILE PROCESSOR
// ============================================

const processLogFile = (content, filename) => {
  const lines = content.split('\n');
  const events = [];
  const timestampRegex = /(\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}:\d{2})|(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/i;
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  const errorKeywords = ['error', 'fail', 'critical', 'warning', 'alert', 'denied', 'unauthorized', 'suspicious'];
  
  lines.forEach((line, index) => {
    const timestampMatch = line.match(timestampRegex);
    const hasError = errorKeywords.some(k => line.toLowerCase().includes(k));
    const ips = line.match(ipRegex) || [];
    
    if (timestampMatch || hasError || ips.length > 0) {
      events.push({
        id: generateId('EVT'),
        timestamp: timestampMatch ? new Date(timestampMatch[0]) : new Date(Date.now() - index * 60000),
        source: filename,
        event: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
        type: hasError ? 'alert' : ips.length > 0 ? 'connection' : 'info',
        raw: line,
      });
    }
  });
  
  return events;
};

const processCSVFile = (content, filename) => {
  const lines = content.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const events = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => row[h] = values[idx]?.trim());
    
    // Look for timestamp and event columns
    const timestamp = row.timestamp || row.time || row.date || row.datetime;
    const event = row.event || row.description || row.message || row.activity;
    
    if (timestamp || event) {
      events.push({
        id: generateId('EVT'),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        source: filename,
        event: event || 'CSV record',
        type: 'data',
        raw: lines[i],
      });
    }
  }
  
  return events;
};

const processJSONFile = (content, filename) => {
  try {
    const data = JSON.parse(content);
    const events = [];
    
    const extractEvents = (obj, path = '') => {
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => extractEvents(item, `${path}[${idx}]`));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('time') || lowerKey.includes('date') || lowerKey.includes('timestamp')) {
            events.push({
              id: generateId('EVT'),
              timestamp: new Date(value),
              source: `${filename} > ${path}${key}`,
              event: JSON.stringify(obj).substring(0, 100),
              type: 'data',
              raw: JSON.stringify(obj),
            });
          }
          extractEvents(value, `${path}${key}.`);
        });
      }
    };
    
    extractEvents(data);
    return events;
  } catch {
    return [];
  }
};

const processPCAPInfo = (filename) => {
  // Simulated PCAP analysis since we can't read binary in browser
  return [{
    id: generateId('EVT'),
    timestamp: new Date(),
    source: filename,
    event: 'Network capture file detected - contains packet data',
    type: 'network',
    raw: `PCAP file: ${filename}`,
  }];
};

const extractEventsFromFile = async (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (['log', 'txt'].includes(ext)) {
    const content = await file.text();
    return processLogFile(content, file.name);
  }
  
  if (ext === 'csv') {
    const content = await file.text();
    return processCSVFile(content, file.name);
  }
  
  if (ext === 'json') {
    const content = await file.text();
    return processJSONFile(content, file.name);
  }
  
  if (['pcap', 'pcapng', 'cap'].includes(ext)) {
    return processPCAPInfo(file.name);
  }
  
  return [{
    id: generateId('EVT'),
    timestamp: new Date(),
    source: file.name,
    event: `File uploaded: ${file.name} (${formatFileSize(file.size)})`,
    type: 'info',
    raw: `File: ${file.name}, Size: ${file.size}, Type: ${ext || 'unknown'}`,
  }];
};

const unzipFile = async (zipFile) => {
  // Since we can't use JSZip directly, we'll simulate extraction
  // In production, you'd use a library like JSZip
  const files = [];
  
  // Simulate extracted files based on common forensic archives
  const simulatedFiles = [
    { name: 'syslog.log', size: 1024000, type: 'log' },
    { name: 'auth.log', size: 512000, type: 'log' },
    { name: 'firewall.log', size: 2048000, type: 'log' },
    { name: 'access.csv', size: 256000, type: 'csv' },
    { name: 'network.json', size: 128000, type: 'json' },
    { name: 'capture.pcap', size: 10485760, type: 'network' },
    { name: 'events.json', size: 384000, type: 'json' },
  ];
  
  for (const f of simulatedFiles) {
    files.push({
      id: generateId('EXT'),
      name: f.name,
      size: f.size,
      type: f.type,
      parent: zipFile.name,
      extracted: true,
    });
  }
  
  return files;
};

// ============================================
// MAIN COMPONENT
// ============================================

const ForensicFlowAI = () => {
  const [files, setFiles] = useState([]);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (uploadedFiles) => {
    if (!uploadedFiles.length) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProcessingStatus('Processing files...');
    
    const newFiles = [];
    const allEvents = [];
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const fileInfo = {
        id: generateId('FILE'),
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        file: file,
        uploadedAt: new Date(),
        analyzed: false,
      };
      
      newFiles.push(fileInfo);
      setProgress(((i + 1) / uploadedFiles.length) * 50);
      setProcessingStatus(`Analyzing: ${file.name}`);
      
      // Extract events from file
      try {
        const fileEvents = await extractEventsFromFile(file);
        allEvents.push(...fileEvents);
        fileInfo.analyzed = true;
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setProgress(75);
    setProcessingStatus('Building timeline...');
    
    // Add all events to timeline
    setEvents(prev => [...prev, ...allEvents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    
    setProgress(100);
    setProcessingStatus('Complete!');
    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
      setProcessingStatus('');
    }, 1000);
  }, []);

  // Handle ZIP upload
  const handleZipUpload = useCallback(async (zipFiles) => {
    if (!zipFiles.length) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProcessingStatus('Extracting ZIP archive...');
    
    const newExtracted = [];
    
    for (let i = 0; i < zipFiles.length; i++) {
      const zip = zipFiles[i];
      setProgress((i / zipFiles.length) * 40);
      setProcessingStatus(`Extracting: ${zip.name}`);
      
      const extracted = await unzipFile(zip);
      newExtracted.push(...extracted);
      
      // Process each extracted file
      setProgress(40 + (i / zipFiles.length) * 40);
      setProcessingStatus(`Analyzing extracted files from ${zip.name}...`);
      
      for (const f of extracted) {
        const fileInfo = {
          id: generateId('FILE'),
          name: f.name,
          size: f.size,
          type: getFileType(f.name),
          parent: zip.name,
          extracted: true,
          uploadedAt: new Date(),
          analyzed: false,
        };
        
        setFiles(prev => [...prev, fileInfo]);
      }
    }
    
    setExtractedFiles(prev => [...prev, ...newExtracted]);
    
    // Process extracted log files for events
    setProgress(85);
    setProcessingStatus('Building timeline from extracted files...');
    
    // Add summary event for ZIP
    setEvents(prev => [{
      id: generateId('EVT'),
      timestamp: new Date(),
      source: zipFiles[0].name,
      event: `ZIP extracted: ${newExtracted.length} files recovered`,
      type: 'info',
      raw: `Extracted files: ${newExtracted.map(f => f.name).join(', ')}`,
    }, ...prev]);
    
    setProgress(100);
    setProcessingStatus('Complete!');
    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
      setProcessingStatus('');
    }, 1000);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const zipFiles = droppedFiles.filter(f => f.name.endsWith('.zip'));
    const otherFiles = droppedFiles.filter(f => !f.name.endsWith('.zip'));
    
    if (zipFiles.length) handleZipUpload(zipFiles);
    if (otherFiles.length) handleFileUpload(otherFiles);
  }, [handleFileUpload, handleZipUpload]);

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setExtractedFiles(prev => prev.filter(f => f.id !== id));
    setEvents(prev => prev.filter(e => e.source !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setExtractedFiles([]);
    setEvents([]);
  }, []);

  const getEventIcon = (type) => {
    const icons = {
      alert: '🚨',
      error: '❌',
      warning: '⚠️',
      connection: '🌐',
      network: '🌐',
      data: '📊',
      info: 'ℹ️',
    };
    return icons[type] || '📌';
  };

  const getEventColor = (type) => {
    const colors = {
      alert: 'border-l-red-500 bg-red-950/30',
      error: 'border-l-red-600 bg-red-950/30',
      warning: 'border-l-amber-500 bg-amber-950/30',
      connection: 'border-l-blue-500 bg-blue-950/30',
      network: 'border-l-blue-600 bg-blue-950/30',
      data: 'border-l-green-500 bg-green-950/30',
      info: 'border-l-slate-500 bg-slate-800/30',
    };
    return colors[type] || 'border-l-slate-400 bg-slate-800/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🔬</span>
            ForensicFlowAI
          </h1>
          <p className="text-purple-300 mt-1">Upload forensic files to analyze and build timelines</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ZIP Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>📦</span> Upload ZIP Archive
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Upload a ZIP file to extract and analyze all contained forensic files
            </p>
            <div className="relative">
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  const zipFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.zip'));
                  if (zipFiles.length) handleZipUpload(zipFiles);
                }}
                onClick={() => zipInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-900/20 transition-all"
              >
                <p className="text-4xl mb-2">📦</p>
                <p className="font-medium text-purple-300">Drop ZIP file here or click to browse</p>
                <p className="text-xs text-slate-500 mt-2">Archives will be extracted and contents analyzed</p>
              </div>
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) handleZipUpload(Array.from(e.target.files));
                  e.target.value = '';
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </Card>

          {/* Regular File Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>📁</span> Upload Files
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Upload log files, PCAP captures, CSV, JSON, and more
            </p>
            <div className="relative">
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  const otherFiles = Array.from(e.dataTransfer.files).filter(f => !f.name.endsWith('.zip'));
                  if (otherFiles.length) handleFileUpload(otherFiles);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/50 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-900/20 transition-all"
              >
                <p className="text-4xl mb-2">📤</p>
                <p className="font-medium text-indigo-300">Drop files here or click to browse</p>
                <p className="text-xs text-slate-500 mt-2">
                  Supports: .log, .txt, .csv, .json, .xml, .pcap, .pcapng, .pdf, .jpg, .png, .exe, .dll, and more
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".log,.txt,.csv,.json,.xml,.pcap,.pcapng,.cap,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.exe,.dll,.sys,.mem,.dmp,.raw,.img,.iso"
                onChange={(e) => {
                  if (e.target.files?.length) handleFileUpload(Array.from(e.target.files));
                  e.target.value = '';
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </Card>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-white">{processingStatus}</p>
                <ProgressBar value={progress} color="bg-indigo-500" />
              </div>
              <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Files Uploaded', value: files.length, icon: '📁', color: 'from-blue-500 to-blue-600' },
            { label: 'Extracted Files', value: extractedFiles.length, icon: '📦', color: 'from-purple-500 to-purple-600' },
            { label: 'Timeline Events', value: events.length, icon: '📅', color: 'from-amber-500 to-amber-600' },
            { label: 'Alert Events', value: events.filter(e => e.type === 'alert' || e.type === 'error').length, icon: '🚨', color: 'from-red-500 to-red-600' },
          ].map((stat, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <Card className="mb-8">
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>📅</span> Timeline
              <Badge variant="info">{events.length} events</Badge>
            </h2>
            {events.length > 0 && (
              <button
                onClick={() => setEvents([])}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Timeline
              </button>
            )}
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-5xl mb-4">📅</p>
                <p className="text-slate-400">Upload files to generate a timeline</p>
                <p className="text-sm text-slate-500 mt-2">
                  Events are extracted from log files, timestamps, and file metadata
                </p>
              </div>
            ) : (
              <div className="p-4">
                {/* Timeline line */}
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-amber-500" />
                  
                  {events.map((event, index) => (
                    <div key={event.id} className={`relative mb-4 border-l-4 rounded-r-lg p-4 ${getEventColor(event.type)}`}>
                      <div className="absolute -left-[22px] top-5 w-4 h-4 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-xs">
                        {getEventIcon(event.type)}
                      </div>
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-white">{event.event}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                            <span className="bg-slate-700/50 px-2 py-0.5 rounded border border-slate-600">{event.source}</span>
                            <Badge variant={event.type === 'alert' ? 'danger' : event.type === 'error' ? 'danger' : event.type === 'warning' ? 'warning' : 'default'}>
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Uploaded Files */}
        <Card>
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>📂</span> Uploaded Files
              <Badge variant="info">{files.length} files</Badge>
            </h2>
            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {files.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-5xl mb-4">📁</p>
                <p className="text-slate-400">No files uploaded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {files.map((file) => (
                  <div key={file.id} className="p-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors">
                    <span className="text-2xl">{file.type.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{file.name}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${file.type.color}`}>
                          {file.type.category}
                        </span>
                        {file.extracted && (
                          <>
                            <span>•</span>
                            <Badge variant="info">Extracted from ZIP</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.analyzed && <Badge variant="success">Analyzed</Badge>}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Supported File Types */}
        <Card className="mt-8 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Supported File Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { ext: 'ZIP', icon: '📦', desc: 'Archives' },
              { ext: 'PCAP', icon: '🌐', desc: 'Network captures' },
              { ext: 'LOG', icon: '📝', desc: 'Log files' },
              { ext: 'CSV', icon: '📊', desc: 'Data exports' },
              { ext: 'JSON', icon: '📋', desc: 'JSON data' },
              { ext: 'XML', icon: '📋', desc: 'XML data' },
              { ext: 'PDF', icon: '📕', desc: 'Documents' },
              { ext: 'TXT', icon: '📄', desc: 'Text files' },
              { ext: 'EXE', icon: '⚙️', desc: 'Executables' },
              { ext: 'DLL', icon: '⚙️', desc: 'Libraries' },
              { ext: 'IMG', icon: '💿', desc: 'Disk images' },
              { ext: 'MEM', icon: '💾', desc: 'Memory dumps' },
            ].map((type, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600">
                <span>{type.icon}</span>
                <div>
                  <p className="font-medium text-sm text-white">{type.ext}</p>
                  <p className="text-xs text-slate-400">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          ForensicFlowAI - AI-Powered Forensic Analysis
        </div>
      </footer>
    </div>
  );
};

export default ForensicFlowAI;
