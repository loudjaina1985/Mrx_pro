import React, { useState } from "react";
import ThesisManager from "./components/ThesisManager";
import DefenseSimulator from "./components/DefenseSimulator";
import RadiologyQuiz from "./components/RadiologyQuiz";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { Thesis, DefenseSession } from "./types";
import { ReportBrandingControls, ReportBrandingHeader, loadSavedBranding } from "./components/ReportBranding";
import { 
  Award, 
  BookOpen, 
  ShieldAlert, 
  Activity, 
  Bookmark, 
  TrendingUp, 
  HelpCircle,
  FileText,
  Clock,
  LogOut,
  Layers,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"thesis" | "quiz" | "analytics">("thesis");
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"fr" | "ar" | "en">("fr");
  const [activeSession, setActiveSession] = useState<DefenseSession | null>(null);
  
  // Archival session inspect trigger
  const [inspectedSession, setInspectedSession] = useState<DefenseSession | null>(null);
  const [refreshDashboardCounter, setRefreshDashboardCounter] = useState<number>(0);
  const [branding, setBranding] = useState(loadSavedBranding());

  const handleThesisSelected = (thesis: Thesis, lang: "fr" | "ar" | "en") => {
    setSelectedThesis(thesis);
    setSelectedLanguage(lang);
    setActiveSession(null);
    setInspectedSession(null);
  };

  const handleSessionFinished = (completedSession: DefenseSession) => {
    // Save state, trigger analytics update
    setRefreshDashboardCounter(prev => prev + 1);
    
    // Automatically transition tab to Analytics to inspect results
    setActiveTab("analytics");
    setInspectedSession(completedSession);
    
    // Reset thesis workspace
    setSelectedThesis(null);
  };

  const handleSelectArchivedSession = (session: DefenseSession) => {
    setInspectedSession(session);
    setActiveTab("analytics");
  };

  const handleResetWorkspace = () => {
    setSelectedThesis(null);
    setActiveSession(null);
    setInspectedSession(null);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0A0B0E] text-[#E2E8F0] select-none font-sans overflow-x-hidden antialiased">
      
      {/* 1. FUTURISTIC ACADEMIC HEADER */}
      <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[#0F1117] print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-md accent-glow shrink-0">
            <Activity className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-xs md:text-sm font-black tracking-wider uppercase text-slate-100">
              {selectedLanguage === "ar" ? "منصة لجان الأشعة الافتراضية" : "RadDefend AI Simulator"}
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-0.5 font-mono">
              Academic Exam Suite v2.5 • Technicien Supérieur IM
            </p>
          </div>
        </div>

        {/* Global tab options */}
        <div className="hidden md:flex items-center bg-[#12141C] border border-white/5 p-1 rounded-full text-xs font-semibold gap-1.5" style={{ direction: "ltr" }}>
          <button
            onClick={() => { setActiveTab("thesis"); setInspectedSession(null); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full duration-150 transition-all cursor-pointer ${activeTab === "thesis" ? "bg-white/5 text-sky-400 font-bold border border-white/10" : "text-slate-400 hover:text-slate-200"}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{selectedLanguage === "ar" ? "قاعة المحاكاة" : "Jury Boardroom"}</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("quiz"); setInspectedSession(null); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full duration-150 transition-all cursor-pointer ${activeTab === "quiz" ? "bg-white/5 text-sky-400 font-bold border border-white/10" : "text-slate-400 hover:text-slate-200"}`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{selectedLanguage === "ar" ? "بنك المعارف" : "Radiology bank"}</span>
          </button>

          <button
            onClick={() => { setActiveTab("analytics"); setInspectedSession(null); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full duration-150 transition-all cursor-pointer ${activeTab === "analytics" ? "bg-white/5 text-sky-400 font-bold border border-white/10" : "text-slate-400 hover:text-slate-200"}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{selectedLanguage === "ar" ? "محاضر التحليلات" : "Board analytics"}</span>
          </button>
        </div>

        {/* Candidate / User details card */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-lg text-right select-none font-mono">
            <div>
              <p className="text-[10px] text-slate-500 leading-none">CANDIDATE PROFILE</p>
              <p className="text-xs font-bold text-slate-350 text-slate-300 mt-1">Superior Intern</p>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE TAB BAR */}
      <div className="flex md:hidden border-b border-white/5 bg-[#0F1117] p-2 justify-around text-xs font-semibold select-none shrink-0 print:hidden" style={{ direction: "ltr" }}>
        <button
          onClick={() => { setActiveTab("thesis"); setInspectedSession(null); }}
          className={`flex-1 py-2 rounded-lg text-center cursor-pointer flex flex-col items-center gap-1 ${activeTab === "thesis" ? "bg-white/5 text-sky-400" : "text-slate-400"}`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">{selectedLanguage === "ar" ? "المحاكاة" : "Defense"}</span>
        </button>
        <button
          onClick={() => { setActiveTab("quiz"); setInspectedSession(null); }}
          className={`flex-1 py-2 rounded-lg text-center cursor-pointer flex flex-col items-center gap-1 ${activeTab === "quiz" ? "bg-white/5 text-sky-400" : "text-slate-400"}`}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-[10px]">{selectedLanguage === "ar" ? "البنك" : "Quiz"}</span>
        </button>
        <button
          onClick={() => { setActiveTab("analytics"); setInspectedSession(null); }}
          className={`flex-1 py-2 rounded-lg text-center cursor-pointer flex flex-col items-center gap-1 ${activeTab === "analytics" ? "bg-white/5 text-sky-400" : "text-slate-400"}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px]">{selectedLanguage === "ar" ? "الأرشيف" : "History"}</span>
        </button>
      </div>

      {/* 2. BODY CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:p-8">
        
        {/* Dynamic workspaces switcher */}
        <AnimatePresence mode="wait">
          {activeTab === "thesis" && (
            <motion.div
              key="thesis-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {!selectedThesis ? (
                /* 1. Initial Thesis selector view */
                <ThesisManager onThesisSelected={handleThesisSelected} />
              ) : (
                /* 2. Live exam defense sandbox */
                <div className="bg-[#0F1117]/65 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                  <DefenseSimulator
                    thesis={selectedThesis}
                    language={selectedLanguage}
                    onSessionFinished={handleSessionFinished}
                    onExit={handleResetWorkspace}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "quiz" && (
            <motion.div
              key="quiz-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 border border-amber-400/20 rounded-2xl mb-4 text-amber-500 shadow-xs">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
                <h1 className="text-2xl font-black text-slate-100">
                  {selectedLanguage === "fr" ? "Évaluation Pratique de Radioprotection & Physique" : 
                   selectedLanguage === "ar" ? "بنك الأسئلة المهنية ومبادئ الأمان الإشعاعي" : 
                   "Imaging Competency & Technical Quiz Hub"}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto leading-relaxed">
                  {selectedLanguage === "fr" ? "Testez votre sens pratique face à de vraies interrogations de concours. Sélectionnez votre niveau pour voir l'explication physique complète." :
                   selectedLanguage === "ar" ? "قيّم سرعتك ودقتك في إجابة أسئلة الجرعات، وتصاميم أجهزة الرنين المغناطيسي، ومصطلحات الأشعة الشائعة." :
                   "Drill with high-yield examination parameters to cement clinical imaging competence thresholds."}
                </p>
              </div>

              <RadiologyQuiz language={selectedLanguage} />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {inspectedSession ? (
                /* ARCHIVED REPORT VIEWER MODE */
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center bg-[#0F1117] p-4 rounded-xl border border-white/5 print:hidden">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      🔍 {selectedLanguage === "fr" ? "EXAMEN SPECTÉ DE L'HISTORIQUE" : "معاينة أرشيف المداولة العابر"}
                    </span>
                    <button
                      onClick={() => setInspectedSession(null)}
                      className="cursor-pointer text-xs font-bold text-sky-400 bg-sky-500/5 px-3 py-1.5 rounded border border-sky-500/15 animate-pulse"
                    >
                      {selectedLanguage === "fr" ? "← Retour au Tableau d'Analyse" : "← الرجوع للوحة التحكم"}
                    </button>
                  </div>
                  
                  <ReportBrandingControls 
                    branding={branding} 
                    onChange={setBranding} 
                    language={selectedLanguage} 
                  />
                  
                  {/* Reuse deliberate view structure safely using static simulated block layout inside report */}
                  <div className="bg-[#0F1117] border border-white/5 rounded-3xl p-6 md:p-8 print:bg-white print:text-black">
                    <ReportBrandingHeader branding={branding} language={selectedLanguage} />
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-sky-450 text-sky-400 font-bold uppercase">{selectedLanguage === "fr" ? "RAPPORT OFFICIEL DE TRANSCRIPTION" : "محضر المداولات الأكاديمية"}</span>
                        <h2 className="text-xl font-bold text-slate-100 mt-1">
                          {inspectedSession.thesisTitle}
                        </h2>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 uppercase">
                          {selectedLanguage === "fr" ? "Date de session :" : "تاريخ الدفاع :"} {new Date(inspectedSession.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-center bg-sky-500/10 border border-sky-400/20 px-6 py-4 rounded-2xl accent-glow shrink-0">
                        <span className="text-[10px] font-bold text-sky-400 block tracking-wider uppercase">{selectedLanguage === "fr" ? "GRADE" : "الدرجة المستحقة"}</span>
                        <span className="text-2xl font-black text-sky-400">{inspectedSession.report?.finalScore || 15}</span>
                        <span className="text-xs text-slate-400 block font-bold mt-0.5">/20</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-white/5 px-4 py-2 rounded-lg text-xs">
                      <span className="font-bold text-slate-400">{selectedLanguage === "fr" ? "Verdict du tribunal médical :" : "القرار النهائي للجنة المداولة :"}</span>
                      <span className="font-bold text-emerald-400 uppercase">
                        {inspectedSession.report?.mention || "Très Honorable"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs space-y-2">
                        <span className="font-bold block text-sky-400">👤 {selectedLanguage === "fr" ? "Commentaire Présidente" : "رأي رئيسة اللجنة"}</span>
                        <p className="text-slate-400 leading-relaxed italic">"{inspectedSession.report?.comments.president}"</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs space-y-2">
                        <span className="font-bold block text-emerald-400">👤 {selectedLanguage === "fr" ? "Commentaire Examinateur" : "رأي ممتحن التخصص"}</span>
                        <p className="text-slate-400 leading-relaxed italic">"{inspectedSession.report?.comments.examiner}"</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs space-y-2">
                        <span className="font-bold block text-amber-500">👤 {selectedLanguage === "fr" ? "Commentaire Spécialiste" : "رأي أخصائي الفيزياء"}</span>
                        <p className="text-slate-400 leading-relaxed italic">"{inspectedSession.report?.comments.specialist}"</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
                      <div className="p-4 bg-[#0A0B0E] rounded-xl border border-white/5">
                        <span className="font-bold block text-emerald-400 mb-2">✓ {selectedLanguage === "fr" ? "Acquis Clés" : "النقاط الإيجابية المسجلة"}</span>
                        <ul className="space-y-1 text-slate-400 list-disc list-inside">
                          {inspectedSession.report?.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="p-4 bg-[#0A0B0E] rounded-xl border border-white/5">
                        <span className="font-bold block text-amber-500 mb-2">→ {selectedLanguage === "fr" ? "Axes d'Étude Conseillés" : "المراجعة والتطوير الموصى به"}</span>
                        <ul className="space-y-1 text-slate-400 list-disc list-inside">
                          {inspectedSession.report?.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex justify-end print:hidden">
                      <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold cursor-pointer transition-all"
                      >
                        {selectedLanguage === "fr" ? "Imprimer PDF" : "طباعة المحضر"}
                      </button>
                    </div>

                  </div>
                </div>
              ) : (
                <AnalyticsDashboard
                  language={selectedLanguage}
                  onSelectSession={handleSelectArchivedSession}
                  shouldRefresh={refreshDashboardCounter > 0}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. FOOTER AREA */}
      <footer className="h-12 border-t border-white/5 bg-[#0F1117] flex items-center justify-between px-6 md:px-8 text-[9px] text-[#64748B] font-mono tracking-wider font-semibold print:hidden">
        <div className="flex gap-4 md:gap-8">
          <span>PORTAL: ONLINE</span>
          <span className="hidden sm:inline">DATABASE: LOCALSTORAGE_OFFLINE_SYNC</span>
        </div>
        <div className="flex gap-4 text-sky-400 shrink-0 select-none uppercase font-bold text-[9px]">
          {selectedLanguage === "fr" ? "Soutenance Technicien Supérieur IM" : "شهادة فني سام أشعة وتصوير طبي"}
        </div>
      </footer>

    </div>
  );
}
