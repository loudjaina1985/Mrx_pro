import React, { useState, useEffect } from "react";
import { Sparkles, GraduationCap, Building, Award, CheckCircle } from "lucide-react";

export interface ReportBrandingData {
  studentName: string;
  universityName: string;
  departmentName: string;
  logoSvg: string;
  useBranding: boolean;
}

const PRESET_LOGOS = {
  blue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M50,12 L80,22 V50 C80,68 50,82 50,82 C50,82 20,68 20,50 V22 Z" fill="none" stroke="#0ea5e9" stroke-width="3"/>
    <path d="M50,12 L80,22 V50 C80,68 50,82 50,82 C50,82 20,68 20,50 V22 Z" fill="#0ea5e9" fill-opacity="0.1"/>
    <path d="M40,43 H60 M50,33 V53" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="50" cy="43" rx="22" ry="12" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3,3"/>
    <ellipse cx="50" cy="43" rx="12" ry="22" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3,3"/>
  </svg>`,
  emerald: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#10B981" stroke-width="3"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke="#10B981" stroke-width="1" stroke-dasharray="3,3"/>
    <path d="M50,20 L58,40 L78,40 L62,52 L68,72 L50,60 L32,72 L38,52 L22,40 L42,40 Z" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-width="1.5"/>
    <path d="M35,50 H65 M50,35 V65" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="8" fill="#0A0B0E" stroke="#10B981" stroke-width="2"/>
  </svg>`,
  gold: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M50,15 L78,25 V55 C78,72 50,85 50,85 C50,85 22,72 22,55 V25 Z" fill="none" stroke="#F59E0B" stroke-width="3"/>
    <path d="M32,32 Q50,25 68,32 V52 C68,66 50,76 50,76 C50,76 32,66 32,52 Z" fill="#F59E0B" fill-opacity="0.1" stroke="#F59E0B" stroke-width="1"/>
    <path d="M50,25 Q58,45 50,65 Q42,45 50,25 Z" fill="none" stroke="#F59E0B" stroke-width="1.5"/>
    <circle cx="50" cy="30" r="5" fill="#F59E0B"/>
    <path d="M40,38 Q50,42 60,38" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
    <path d="M38,48 Q50,52 62,48" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
  </svg>`
};

export const loadSavedBranding = (): ReportBrandingData => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("radiology_defense_branding");
    if (saved) {
      try {
        return { ...JSON.parse(saved), useBranding: true };
      } catch (e) {
        // ignore
      }
    }
  }
  return {
    studentName: "",
    universityName: "Faculté de Médecine et Technologie Médicale",
    departmentName: "Département de Radiologie et Imagerie Médicale",
    logoSvg: PRESET_LOGOS.blue,
    useBranding: false
  };
};

interface ReportBrandingControlsProps {
  branding: ReportBrandingData;
  onChange: (data: ReportBrandingData) => void;
  language: "fr" | "ar" | "en";
}

export function ReportBrandingControls({ branding, onChange, language }: ReportBrandingControlsProps) {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genSuccess, setGenSuccess] = useState<boolean>(false);

  // Localizations
  const t = {
    fr: {
      title: "Personnalisation & Branding Universitaire",
      subtitle: "Configurez l'en-tête officiel du procès-verbal avant l'exportation PDF",
      nameLabel: "Nom de l'étudiant / Candidat",
      namePlaceholder: "ex: Dr. Amine Benmostefa",
      uniLabel: "Université / Faculté",
      uniPlaceholder: "ex: Faculté de Médecine d'Alger",
      deptLabel: "Département / Spécialité",
      deptPlaceholder: "ex: Département de Radiologie et d'Imagerie",
      logoLabel: "Logo Universitaire (Généré par IA)",
      logoPromptPlaceholder: "ex: Modern circular medical emblem with DNA and star",
      logoBtn: "Générer Logo par IA",
      generating: "Création créative en cours...",
      presetTitle: "Ou choisir un modèle de logo prédéfini :",
      useBrandingToggle: "Activer la personnalisation officielle de l'en-tête"
    },
    ar: {
      title: "خيارات الهوية والختم الأكاديمي",
      subtitle: "قم بإعداد ترويسة محضر المداولة والشهادة الرسمي قبل طباعة الـ PDF",
      nameLabel: "اسم الطالب الباحث",
      namePlaceholder: "مثال: د. سمير عبد الرحمن",
      uniLabel: "الجامعة / الكلية",
      uniPlaceholder: "مثال: كلية العلوم الطبية والصيدلانية",
      deptLabel: "القسم / التخصص الإكلينيكي",
      deptPlaceholder: "مثال: معهد تقنيات الأشعة والتصوير الطبي",
      logoLabel: "شعار الجامعة (مولّد بالذكاء الاصطناعي)",
      logoPromptPlaceholder: "مثال: شعار درع طبي دائري مع رسم تخطيطي لقلب وشريط ذهبي",
      logoBtn: "توليد الشعار بالذكاء الاصطناعي",
      generating: "جاري التصميم الهندسي المبتكر بالذكاء الاصطناعي...",
      presetTitle: "أو حدد ترويسة سريعة جاهزة :",
      useBrandingToggle: "تضمين خيارات الترويسة الرسمية في المحضر المطبوع"
    },
    en: {
      title: "Custom Academic Branding Suite",
      subtitle: "Personalize the official transcript header before printing your PDF report",
      nameLabel: "Student Name / Candidate",
      namePlaceholder: "e.g., Dr. Sarah Jenkins",
      uniLabel: "University / Faculty Name",
      uniPlaceholder: "e.g., Faculty of Medical Technologies and Sciences",
      deptLabel: "Department / Speciality",
      deptPlaceholder: "e.g., Department of Radiology & Clinical Imaging",
      logoLabel: "University Seal (AI-Generated)",
      logoPromptPlaceholder: "e.g., Classic shield with microscope, book and golden rays",
      logoBtn: "Generate Logo with AI",
      generating: "Generating Vector Logo...",
      presetTitle: "Or select a predefined logo template:",
      useBrandingToggle: "Include official customized header in the final printed file"
    }
  }[language || "fr"];

  const handleFieldChange = (key: keyof ReportBrandingData, value: any) => {
    const next = { ...branding, [key]: value };
    onChange(next);
    localStorage.setItem("radiology_defense_branding", JSON.stringify(next));
  };

  const handleGenerateLogo = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenSuccess(false);

    try {
      const resp = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: aiPrompt || `Medical and Radiology university seal with circular border styling`,
          stylePreference: "classic"
        })
      });

      if (!resp.ok) throw new Error("API build failure");
      const data = await resp.json();
      
      if (data && data.svg) {
        handleFieldChange("logoSvg", data.svg);
        setGenSuccess(true);
        setTimeout(() => setGenSuccess(false), 3000);
      }
    } catch (err) {
      console.error("AI Logo generation failed, fallback presets loaded:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPreset = (key: "blue" | "emerald" | "gold") => {
    handleFieldChange("logoSvg", PRESET_LOGOS[key]);
  };

  return (
    <div className="glass p-5 rounded-3xl border border-white/5 space-y-4 print:hidden text-left mb-6">
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-150 flex items-center gap-2">
            <GraduationCap className="w-4.5 h-4.5 text-sky-400" />
            {t.title}
          </h4>
          <p className="text-[10px] text-slate-500">{t.subtitle}</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={branding.useBranding}
            onChange={(e) => handleFieldChange("useBranding", e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-[#0F1117] text-sky-500 focus:ring-sky-500 cursor-pointer"
          />
          <span className="text-[11px] font-bold text-sky-400">{t.useBrandingToggle}</span>
        </label>
      </div>

      {branding.useBranding && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5 animate-fade-in">
          
          {/* Left Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {t.nameLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={branding.studentName}
                  onChange={(e) => handleFieldChange("studentName", e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-[#12141C] border border-white/5 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {t.uniLabel}
              </label>
              <input
                type="text"
                value={branding.universityName}
                onChange={(e) => handleFieldChange("universityName", e.target.value)}
                placeholder={t.uniPlaceholder}
                className="w-full bg-[#12141C] border border-white/5 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                {t.deptLabel}
              </label>
              <input
                type="text"
                value={branding.departmentName}
                onChange={(e) => handleFieldChange("departmentName", e.target.value)}
                placeholder={t.deptPlaceholder}
                className="w-full bg-[#12141C] border border-white/5 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Right Logo Creator / Generator */}
          <div className="space-y-3 bg-white/[0.01] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 flex items-center justify-between">
                <span>{t.logoLabel}</span>
                {genSuccess && (
                  <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle className="w-3 h-3" /> Successfully Generated!
                  </span>
                )}
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={t.logoPromptPlaceholder}
                  className="flex-1 bg-[#12141C] border border-white/5 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-sky-500"
                />
                
                <button
                  onClick={handleGenerateLogo}
                  disabled={isGenerating}
                  className="px-3.5 py-2 cursor-pointer bg-sky-500 hover:bg-sky-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-md accent-glow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? t.generating : t.logoBtn}</span>
                </button>
              </div>
            </div>

            {/* Custom SVG Preview with Presets */}
            <div className="flex items-center gap-4 mt-1 border-t border-white/5 pt-3">
              <div className="w-12 h-12 rounded-xl bg-[#090A0F] border border-white/10 p-2 shrink-0 flex items-center justify-center text-sky-400" dangerouslySetInnerHTML={{ __html: branding.logoSvg }} />
              
              <div className="space-y-1.5 flex-1">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{t.presetTitle}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectPreset("blue")}
                    className="px-2.5 py-1 text-[10px] font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/20 rounded-lg transition-all"
                  >
                    Clinical Blue
                  </button>
                  <button
                    onClick={() => selectPreset("emerald")}
                    className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-400/20 rounded-lg transition-all"
                  >
                    Academic Green
                  </button>
                  <button
                    onClick={() => selectPreset("gold")}
                    className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-400/20 rounded-lg transition-all"
                  >
                    Imperial Gold
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

interface ReportBrandingHeaderProps {
  branding: ReportBrandingData;
  language: "fr" | "ar" | "en";
}

export function ReportBrandingHeader({ branding, language }: ReportBrandingHeaderProps) {
  if (!branding.useBranding) return null;

  // Render a clean, high-contrast, bilingual-compatible top university seal row
  const isRtl = language === "ar";
  
  return (
    <div 
      className={`border-b-2 border-slate-200 pb-5 mb-6 flex items-center gap-5 z-10 w-full ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"} print:text-black print:border-black`}
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      <div 
        className="w-16 h-16 p-2 rounded-2xl bg-[#0F1117] border border-white/5 print:bg-white print:border-neutral-200 shadow-md shrink-0 flex items-center justify-center text-sky-400"
        dangerouslySetInnerHTML={{ __html: branding.logoSvg }}
      />
      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-extrabold text-[#F8FAFC] print:text-neutral-900 tracking-tight leading-snug">
          {branding.universityName || "Faculté de Médecine et Technologie Médicale"}
        </h3>
        <p className="text-[11px] font-bold text-slate-400 print:text-neutral-500 tracking-wide uppercase">
          {branding.departmentName || "Département de Radiologie et d'Imagerie"}
        </p>
        {branding.studentName && (
          <div className="pt-1 select-none">
            <span className="text-[9px] uppercase font-black text-sky-400 border border-sky-400/20 bg-sky-500/5 px-2 py-0.5 rounded-md print:bg-transparent print:border-neutral-400 print:text-neutral-800">
              {language === "fr" ? "CANDIDAT : " : language === "ar" ? "الطالب الباحث: " : "CANDIDATE: "}
              <strong className="font-extrabold">{branding.studentName}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
