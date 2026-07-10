# 🔬 ForensicFlowAI

AI-Powered Forensic Analysis Platform for digital investigations. Upload forensic files, extract archives, analyze data, and generate comprehensive timelines.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## ✨ Features

### 📦 ZIP Archive Support
- Upload and extract ZIP archives containing forensic data
- Automatically processes all extracted files
- Generates timeline events from extracted log files and data

### 🌐 Multi-Format File Analysis
- **Network Captures**: PCAP, PCAPNG, CAP files
- **Log Files**: LOG, TXT with timestamp and event extraction
- **Data Files**: CSV, JSON, XML with structured parsing
- **Documents**: PDF, DOC, DOCX
- **Memory Dumps**: MEM, DMP files
- **Disk Images**: RAW, IMG, ISO
- **Executables**: EXE, DLL, SYS

### 📅 Automatic Timeline Generation
- Extracts events from log file timestamps
- Identifies IP addresses and connection events
- Detects errors, warnings, and alerts
- Correlates events across multiple files
- Color-coded event visualization

### 🎨 Modern Dark Theme UI
- Sleek dark gradient interface
- Intuitive drag-and-drop file upload
- Real-time processing progress
- Responsive design for all devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/pro4501/AI-agent.git
cd AI-agent

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## 📖 Usage Guide

### 1. Upload ZIP Archive

Click the ZIP upload section or drag and drop a ZIP file containing forensic data:

```text
📦 Upload ZIP Archive
├── firewall_logs.zip
├── memory_dump.zip
├── network_capture.zip
```

The app will:
- Extract all contained files
- Analyze each file type
- Generate timeline events from log files
- Display extracted files in the file list

### 2. Upload Individual Files

Upload specific forensic files directly:

```text
📁 Upload Files
├── syslog.log          # System logs
├── auth.log            # Authentication logs
├── capture.pcap        # Network capture
├── access.csv          # Access logs
└── events.json         # Event data
```

### 3. View Timeline

The timeline automatically generates events from:

| Event Type | Detection | Icon |
|------------|-----------|------|
| Alert | Error keywords in logs | 🚨 |
| Error | Fail, critical, denied keywords | ❌ |
| Warning | Warning, suspicious keywords | ⚠️ |
| Connection | IP addresses detected | 🌐 |
| Network | PCAP file analysis | 🌐 |
| Data | CSV/JSON records | 📊 |
| Info | General events | ℹ️ |

### 4. Analyze Results

- View extracted events in chronological order
- Filter by event type
- See source file for each event
- Export timeline for reporting

---

## 🗂️ Supported File Types

### Archives
| Extension | Description |
|-----------|-------------|
| ZIP | ZIP compressed archives |
| RAR | RAR compressed archives |
| 7Z | 7-Zip compressed archives |
| TAR | TAR archive files |
| GZ | GZIP compressed files |

### Network Captures
| Extension | Description |
|-----------|-------------|
| PCAP | Packet capture files |
| PCAPNG | Next-generation capture |
| CAP | Generic capture format |

### Log Files
| Extension | Description |
|-----------|-------------|
| LOG | System/application logs |
| TXT | Plain text files |

### Data Files
| Extension | Description |
|-----------|-------------|
| CSV | Comma-separated values |
| JSON | JavaScript Object Notation |
| XML | Extensible Markup Language |

### Documents
| Extension | Description |
|-----------|-------------|
| PDF | Portable Document Format |
| DOC | Microsoft Word (legacy) |
| DOCX | Microsoft Word (modern) |

### Images
| Extension | Description |
|-----------|-------------|
| JPG | JPEG images |
| JPEG | JPEG images |
| PNG | PNG images |
| GIF | GIF images |

### System Files
| Extension | Description |
|-----------|-------------|
| EXE | Windows executables |
| DLL | Dynamic Link Libraries |
| SYS | System drivers |

### Memory & Disk
| Extension | Description |
|-----------|-------------|
| MEM | Memory dumps |
| DMP | Crash dump files |
| RAW | Raw disk images |
| IMG | Disk image files |
| ISO | ISO disc images |

---

## 🏗️ Project Structure

```text
forensic-flow-ai/
├── ForensicFlowAI.jsx    # Main application component
├── App.jsx               # Application entry point
├── main.jsx              # React root renderer
├── index.html            # HTML template
├── index.css             # Tailwind CSS imports
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

> **Note:** View the source files in the repository:
> - [`ForensicFlowAI.jsx`](./ForensicFlowAI.jsx) - Main component
> - [`App.jsx`](./App.jsx) - Application entry point
> - [`main.jsx`](./main.jsx) - React renderer

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **JavaScript** | Application logic |

---

## 📊 How Timeline Generation Works

### Log File Processing
1. Parse each line of the log file
2. Extract timestamps using multiple regex patterns
3. Search for error/warning keywords
4. Identify IP addresses and network events
5. Create timeline events with source tracking

### CSV/JSON Processing
1. Parse structured data format
2. Identify timestamp/date columns
3. Extract event descriptions
4. Generate chronological timeline entries

### PCAP Analysis
1. Detect PCAP file format
2. Generate network event summary
3. Flag capture file for deeper analysis

---

## 🎯 Use Cases

### Digital Forensics Investigation
- Upload memory dumps and disk images
- Extract timeline from system logs
- Correlate events across multiple sources

### Incident Response
- Rapidly analyze captured network traffic
- Generate timeline from firewall logs
- Identify attack patterns and indicators

### Security Audit
- Process access logs from multiple systems
- Generate comprehensive timeline
- Export findings for reporting

### Malware Analysis
- Upload malware samples and logs
- Track file activity timeline
- Correlate with system events

---

## 🔒 Data Privacy

- All file processing happens locally in the browser
- No data is uploaded to external servers
- Files are processed in memory only
- Refresh the page to clear all data

---

## 🚨 Event Detection Keywords

The timeline generator identifies these keywords:

### Alert Keywords
```text
error, fail, critical, alert, denied, unauthorized, suspicious, breach, intrusion, malware, virus, attack
```

### Warning Keywords
```text
warning, warn, caution, suspect, unusual, abnormal, irregular, odd, strange, unexpected
```

---

## 📱 Responsive Design

The application works on:
- 🖥️ Desktop (1024px+)
- 📱 Tablet (768px - 1023px)
- 📱 Mobile (below 768px)

---

## 🤝 Contributing

We welcome contributions! If you'd like to help improve ForensicFlowAI, please feel free to submit issues or pull requests on our GitHub repository.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**pro4501**

GitHub: [github.com/pro4501](https://github.com/pro4501)

---

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Inspired by modern forensic analysis tools
- Designed for digital investigators

---

<div align="center">

**ForensicFlowAI** - Empowering digital forensics with AI

</div>