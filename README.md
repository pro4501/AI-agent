# 🔬 ForensicFlowAI

AI-Powered Forensic Analysis Platform built with React and Tailwind CSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-61dafb)

## ✨ Features

### 📊 Dashboard
- Real-time statistics on cases, status distribution, and priority levels
- Visual progress bars and activity feed
- Quick overview of recent forensic activities

### 📁 Case Management
- Create and manage forensic cases with full CRUD operations
- Priority levels: Critical, High, Medium, Low
- Status tracking: Open, In Progress, Under Review, Closed
- Search and filter capabilities

### 🔍 Evidence Management
- Drag & drop file upload interface
- Support for multiple file types (images, documents, logs, archives)
- File metadata tracking (size, type, hash, timestamp)
- Chain of custody documentation

### 🤖 AI Analysis Engine
- Automated pattern detection across evidence
- Anomaly identification using ML models
- Temporal correlation analysis
- Confidence scoring for findings

### 📄 Report Generation
- Case summary reports
- Evidence inventory reports
- AI analysis reports
- Export to text format

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

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework with hooks |
| Vite | Fast build tool & dev server |
| Tailwind CSS | Utility-first styling |
| localStorage | Data persistence |

## 📁 Project Structure

```
├── ForensicFlowAI.jsx    # Main component (full-featured)
├── App.jsx               # Application entry point
├── main.jsx              # React root renderer
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## 🎯 Usage Guide

### Creating a Case
1. Click **"+ New Case"** button in the header
2. Fill in the case title, description, and priority
3. Click **"Create Case"** to save

### Managing Evidence
1. Select a case from the **Cases** tab
2. Navigate to **Evidence** tab
3. Drag & drop files or use the upload interface
4. Files are automatically tracked with metadata

### Running AI Analysis
1. Ensure evidence is uploaded to a case
2. Click **"Run AI Analysis"** button
3. View findings in the **Analysis** tab
4. Each analysis includes confidence scores and summaries

### Generating Reports
1. Navigate to the **Reports** tab
2. Choose report type:
   - **Case Summary**: Overview of all cases
   - **Evidence Report**: Complete evidence inventory
   - **AI Analysis**: Analysis findings and results
3. Reports are downloaded as text files

## 🔧 Configuration

### Tailwind CSS
Customize styling in `tailwind.config.js`:

```javascript
export default {
  content: ["./index.html", "./App.jsx", "./ForensicFlowAI.jsx"],
  theme: {
    extend: {
      // Add custom colors, fonts, etc.
    },
  },
  plugins: [],
};
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🔒 Data Persistence

All data is stored in browser's localStorage:
- `forensic-cases`: Case records
- `forensic-analysis`: AI analysis results
- `forensic-activity`: Activity log

> ⚠️ Data is local to each browser. Use export reports for backup.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.