import React, { useState, useEffect } from "react";
import { DefenseSession } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid 
} from "recharts";
import { 
  Award, 
  Calendar, 
  TrendingUp, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  BarChart4,
  Trash2
} from "lucide-react";

interface AnalyticsDashboardProps {
  language: "fr" | "ar" | "en";
  onSelectSession?: (session: DefenseSession) => void;
  shouldRefresh?: boolean;
}

export default function AnalyticsDashboard({ language, onSelectSession, shouldRefresh }: AnalyticsDashboardProps) {
  const [sessions, setSessions] = useState<DefenseSession[]>([]);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    loadSessions();
  }, [shouldRefresh]);

  const loadSessions = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("radiology_defense_history") || "[]";
      try {
        setSessions(JSON.parse(stored).reverse());
      } catch (err) {
        setSessions([]);
      }
    }
  };

  const handleClearHistory = () => {
    if (confirm(language === "fr" ? "Voulez-vous vraiment supprimer tout l'historique des examens ?" : "هل أنت متأكد من حذف تاريخ الاختبارات بالكامل؟")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("radiology_defense_history");
        setSessions([]);
      }
    }
  };

  // Calculations
  const totalCompleted = sessions.length;
  const passedSessions = sessions.filter(s => s.report && s.report.finalScore >= 10);
  const passRate = totalCompleted > 0 ? Math.round((passedSessions.length / totalCompleted) * 100) : 0;
  
  const averageScore = totalCompleted > 0 
    ? parseFloat((sessions.reduce((acc, s) => acc + (s.report?.finalScore || 0), 0) / totalCompleted).toFixed(1)) 
    : 0;

  // Extract weak/strong skills
  let rSci = 0, tIm = 0, radP = 0, pOr = 0, gQu = 0;
  sessions.forEach(s => {
    if (s.report && s.report.breakdown) {
      rSci += s.report.breakdown.rigueurScientifique;
      tIm += s.report.breakdown.techniqueImagerie;
      radP += s.report.breakdown.radioprotection;
      pOr += s.report.breakdown.prestationOrale;
      gQu += s.report.breakdown.gestionDesQuestions;
    }
  });

  const skillsAverages = totalCompleted > 0 ? {
    rigueurScientifique: parseFloat((rSci / totalCompleted).toFixed(1)),
    techniqueImagerie: parseFloat((tIm / totalCompleted).toFixed(1)),
    radioprotection: parseFloat((radP / totalCompleted).toFixed(1)),
    prestationOrale: parseFloat((pOr / totalCompleted).toFixed(1)),
    gestionDesQuestions: parseFloat((gQu / totalCompleted).toFixed(1)),
  } : { rigueurScientifique: 0, techniqueImagerie: 0, radioprotection: 0, prestationOrale: 0, gestionDesQuestions: 0 };

  // Prepare Chart Data
  const scoreTrendsData = sessions.slice().reverse().map((s, index) => ({
    name: `Exam-${index + 1}`,
    score: s.report?.finalScore || 0,
    average: 12.0
  }));

  const skillsChartData = [
    { name: language === "fr" ? "Rigueur" : "المنهجية", value: skillsAverages.rigueurScientifique },
    { name: language === "fr" ? "Physique" : "الفيزياء والتقنية", value: skillsAverages.techniqueImagerie },
    { name: language === "fr" ? "Securite" : "الحماية الإشعاعية", value: skillsAverages.radioprotection },
    { name: language === "fr" ? "Eloquence" : "التواصل الشفوي", value: skillsAverages.prestationOrale },
    { name: language === "fr" ? "Stress / Qs" : "مرونة الأجوبة", value: skillsAverages.gestionDesQuestions },
  ];

  // Identify weak areas
  const weakTopics: string[] = [];
  if (totalCompleted > 0) {
    if (skillsAverages.radioprotection < 13) weakTopics.push(language === "fr" ? "Principes de Radioprotection (ALARA)" : "مبادئ السيطرة والوقاية الإشعاعية ALARA");
    if (skillsAverages.techniqueImagerie < 13) weakTopics.push(language === "fr" ? "Physique Théorique de l'IRM & Artefacts" : "فيزياء الرنين ومركبات التشويه الفني");
    if (skillsAverages.rigueurScientifique < 13) weakTopics.push(language === "fr" ? "Rigueur du Plan & Organisation variables" : "خطوات المنهج الطبي واحتساب العينة");
    if (skillsAverages.gestionDesQuestions < 13) weakTopics.push(language === "fr" ? "Gestion du Stress devant le Jury" : "المرونة النفسية والتعامل مع الأسئلة الصعبة");
  }

  const filteredSessions = sessions.filter(s => 
    s.thesisTitle.toLowerCase().includes(filterText.toLowerCase()) ||
    (s.report?.mention || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-4" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      
      {/* Overview stats cards grid */}
      <h3 className="text-base font-bold text-slate-100 uppercase tracking-widest text-left mb-4 flex items-center gap-2">
        <BarChart4 className="w-5 h-5 text-sky-400" />
        {language === "fr" ? "Statistiques Générales d'Examens" : "لوحة المراقبة وتحليل التطور الأكاديمي"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass p-5 rounded-2xl border border-white/5 text-left">
          <Clock className="w-5 h-5 text-sky-455 text-sky-400 mb-2" />
          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{language === "fr" ? "Simulations Réalisées" : "إجمالي المحاكاة"}</span>
          <p className="text-3xl font-black text-slate-100 mt-1">{totalCompleted}</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 text-left">
          <Award className="w-5 h-5 text-emerald-500 mb-2" />
          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{language === "fr" ? "Moyenne Générale" : "معدل الدرجات الكلي"}</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            {averageScore} <span className="text-xs text-slate-400 font-bold">/20</span>
          </p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 text-left">
          <TrendingUp className="w-5 h-5 text-amber-500 mb-2" />
          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{language === "fr" ? "Taux de Réussite" : "معدل النجاح والقبول"}</span>
          <p className="text-3xl font-black text-amber-400 mt-1">{passRate}%</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 text-left h-full flex flex-col justify-center">
          {weakTopics.length > 0 ? (
            <div className="flex items-start gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{language === "fr" ? "À retravailler" : "ثغرات تحتاج معالجة"}</span>
                <p className="text-xs font-semibold leading-relaxed line-clamp-2 mt-1">{weakTopics[0]}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{language === "fr" ? "État d'Avancement" : "حالة الاستعداد"}</span>
                <p className="text-xs font-semibold mt-1">
                  {totalCompleted > 0 ? (language === "fr" ? "Niveau Solide !" : "جاهز بنسبة كاملة !") : (language === "fr" ? "Aucune donnée" : "لا توجد حصص")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {totalCompleted > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          
          {/* Progress Chart Area */}
          <div className="lg:col-span-8 glass p-5 rounded-2xl border border-white/5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest text-left mb-4">
              {language === "fr" ? "Évolution des Notes Académiques" : "منحنى تطور الأداء والدرجات"}
            </h4>
            <div className="h-64 cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrendsData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} strokeWidth={0.5} />
                  <YAxis domain={[0, 20]} stroke="#64748B" fontSize={11} strokeWidth={0.5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F1117", borderColor: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                    labelStyle={{ color: "#E2E8F0", fontWeight: "bold", fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Skills chart */}
          <div className="lg:col-span-4 glass p-5 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest text-left">
              {language === "fr" ? "Moyenne par Spécialité" : "متوسط الكفاءة لكل مستوى مقاس"}
            </h4>
            <div className="h-64 cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsChartData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} strokeWidth={0.5} />
                  <YAxis domain={[0, 20]} stroke="#64748B" fontSize={10} strokeWidth={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F1117", borderColor: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="glass p-10 rounded-2xl border border-white/5 text-center mb-6">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            {language === "fr" ? "Aucune simulation enregistrée pour le moment." : "لا يوجد اختبار تخرج مؤرشف حتى الآن"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {language === "fr" ? "Lancez votre première soutenance virtuelle pour commencer à voir vos forces et faiblesses." : "ابدأ أول جلسة نقاش وعرض لتقريرك ليقوم النظام بتحليل هرم مهاراتك بشكل تراكمي."}
          </p>
        </div>
      )}

      {/* Historical List table section */}
      <div className="glass rounded-2xl border border-white/5 p-5">
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3">
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest text-left">
            {language === "fr" ? "Historique des Sessions Archives" : "جدول جلسات المحاكاة والأرشيف المخزن"}
          </h4>

          <div className="flex items-center gap-3 w-full md:w-max">
            {/* Direct search filter */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={language === "fr" ? "Filtrer par titre ou mention..." : "بحث باسم الأطروحة..."}
                className="w-full bg-[#12141C] border border-white/5 text-slate-200 text-xs py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>

            {sessions.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="cursor-pointer text-xs text-rose-420 hover:text-rose-455 text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-2 rounded-lg transition-all shrink-0 flex items-center gap-1.5"
                title="Supprimer l'historique"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Vider" : "مسح"}</span>
              </button>
            )}
          </div>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 uppercase font-mono tracking-wider font-bold">
                  <th className="py-3 px-4">{language === "fr" ? "Thèse étudiée" : "عنوان الأطروحة"}</th>
                  <th className="py-3 px-4 text-center">{language === "fr" ? "Date" : "التاريخ"}</th>
                  <th className="py-3 px-4 text-center">{language === "fr" ? "Langue" : "اللغة"}</th>
                  <th className="py-3 px-4 text-center">{language === "fr" ? "Note finale" : "الدرجة"}</th>
                  <th className="py-3 px-4">{language === "fr" ? "Verdict du Jury" : "التقدير الأكاديمي"}</th>
                  <th className="py-3 px-4 text-right">{language === "fr" ? "Détails" : "عرض المحضر"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-[280px] truncate leading-normal" title={s.thesisTitle}>
                      {s.thesisTitle}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "ar-DZ")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        {s.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-sky-400">{s.report?.finalScore || 0}</span> / 20
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      {s.report?.mention || "Acceptée"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {onSelectSession && (
                        <button
                          onClick={() => onSelectSession(s)}
                          className="cursor-pointer text-[11px] font-bold text-sky-450 hover:text-sky-305 text-sky-400 hover:underline"
                        >
                          {language === "fr" ? "Voir PV" : "عرض البيان"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">
            {language === "fr" ? "Aucune session archivée correspondant à la recherche." : "لا تتوفر حصص امتحان مطابقة للبحث."}
          </p>
        )}
      </div>

    </div>
  );
}
