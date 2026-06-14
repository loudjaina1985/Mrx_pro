import React, { useState } from "react";
import { Thesis } from "../types";
import { THESIS_TEMPLATES } from "../templates";
import { 
  FileText, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  Upload, 
  Sparkles, 
  AlertTriangle,
  Download,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReportBrandingControls, ReportBrandingHeader, loadSavedBranding } from "./ReportBranding";

interface ThesisManagerProps {
  onThesisSelected: (thesis: Thesis, language: "fr" | "ar" | "en") => void;
}

export default function ThesisManager({ onThesisSelected }: ThesisManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("temp-mammo-ai");
  const [customText, setCustomText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"template" | "paste">("template");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<Thesis | null>(null);
  const [language, setLanguage] = useState<"fr" | "ar" | "en">("fr");
  const [error, setError] = useState<string | null>(null);
  const [branding, setBranding] = useState(loadSavedBranding());

  // File upload and processing status
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);

  const extractPdfText = (pdfFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error("Failed to read file buffer"));
            return;
          }

          // Dynamically load PDFJS from Cloudflare CDN to avoid breaking the bundle
          const pdfjs = await new Promise<any>((res, rej) => {
            if ((window as any).pdfjsLib) {
              res((window as any).pdfjsLib);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
            script.onload = () => {
              const p = (window as any).pdfjsLib;
              p.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
              res(p);
            };
            script.onerror = () => rej(new Error("Failed to load PDF parsing engine from CDN"));
            document.head.appendChild(script);
          });

          const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
          let fullText = "";
          // Safety cap to extract first 60 pages to avoid token limits
          const maxPages = Math.min(pdf.numPages, 60);

          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += `\n--- PAGE ${i} ---\n` + pageText;
          }

          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsArrayBuffer(pdfFile);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      if (droppedFile.type === "application/pdf" || droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setIsParsingPdf(true);
        setError(null);
        extractPdfText(droppedFile)
          .then((text) => {
            setCustomText(text);
            setActiveTab("paste");
          })
          .catch((err) => {
            console.error(err);
            setError(language === "fr" ? "Erreur d'extraction sur ce fichier PDF." : "Error extracting text from PDF file.");
          })
          .finally(() => {
            setIsParsingPdf(false);
          });
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === "string") {
            setCustomText(event.target.result);
            setActiveTab("paste");
          }
        };
        if (droppedFile.type === "text/plain" || droppedFile.type === "application/json" || droppedFile.name.endsWith(".txt") || droppedFile.name.endsWith(".md")) {
          reader.readAsText(droppedFile);
        } else {
          setCustomText(`Nom du Document: ${droppedFile.name}\nType: PDF/Word extract simulation\nTaille: ${(droppedFile.size / 1024).toFixed(1)} KB\n\n[Texte de thèse chargé] Le modèle analysera les protocoles d'acquisition d'images médicales décrits dans ce travail.`);
          setActiveTab("paste");
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setIsParsingPdf(true);
        setError(null);
        extractPdfText(selectedFile)
          .then((text) => {
            setCustomText(text);
            setActiveTab("paste");
          })
          .catch((err) => {
            console.error(err);
            setError(language === "fr" ? "Erreur d'extraction sur ce fichier PDF." : "Error extracting text from PDF file.");
          })
          .finally(() => {
            setIsParsingPdf(false);
          });
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === "string") {
            setCustomText(event.target.result);
            setActiveTab("paste");
          }
        };
        if (selectedFile.type === "text/plain" || selectedFile.type === "application/json" || selectedFile.name.endsWith(".txt") || selectedFile.name.endsWith(".md")) {
          reader.readAsText(selectedFile);
        } else {
          setCustomText(`Nom du Document: ${selectedFile.name}\nTaille: ${(selectedFile.size / 1024).toFixed(1)} KB\n\n[Texte de thèse chargé] Simulation d'analyse pour examen supérieur.`);
          setActiveTab("paste");
        }
      }
    }
  };

  const handleAnalyzeCustom = async () => {
    if (customText.trim().length < 50) {
      setError(language === "fr" ? "Veuillez saisir un texte de thèse plus long ou charger un fichier valide (minimum 50 caractères d'intro de radiologie)." : 
               language === "ar" ? "يرجى إدخال نص أطروحة أطول أو تحميل ملف صالح (50 حرفاً كحد أدنى)." :
               "Please enter a longer thesis text or load a valid file (minimum 50 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/thesis/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: customText, language })
      });

      if (!res.ok) {
        throw new Error("Failed to contact the analysis server.");
      }

      const parsedThesis: Thesis = await res.json();
      parsedThesis.id = "custom-" + Date.now();
      parsedThesis.language = language;
      parsedThesis.createdAt = new Date().toISOString();

      setAnalysisResult(parsedThesis);
    } catch (err: any) {
      console.error(err);
      setError(language === "fr" ? "Erreur lors de l'analyse par l'IA. Veuillez sélectionner l'une des 3 thèses calibrées de démonstration ci-dessous." :
                language === "ar" ? "خطأ في تحليل النص. يرجى اختيار إحدى أطروحات لجنة التحكيم المتاحة." :
                "AI Analysis failed. Please use one of the loaded templates below to begin quickly.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintMemo = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export the PDF.");
      return;
    }

    const direction = language === "ar" ? "rtl" : "ltr";
    const alignment = language === "ar" ? "right" : "left";

    const logoHtml = branding.useBranding && branding.logoSvg ? `
      <div style="width: 70px; height: 70px; background: #0F1117; padding: 6px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
        ${branding.logoSvg}
      </div>
    ` : "";

    const brandingHeaderHtml = branding.useBranding ? `
      <div style="border-b: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; display: flex; align-items: center; gap: 15px; direction: ${direction}; text-align: ${alignment}; font-family: system-ui, -apple-system, sans-serif;">
        ${logoHtml}
        <div>
          <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">${branding.universityName || "Faculté de Médecine et Technologie Médicale"}</h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">${branding.departmentName || "Département de Radiologie et d'Imagerie"}</p>
          ${branding.studentName ? `
            <div style="margin-top: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 3px 8px; border-radius: 6px;">
                ${language === "fr" ? "CANDIDAT : " : language === "ar" ? "الطالب الباحث: " : "CANDIDATE: "}
                <strong>${branding.studentName}</strong>
              </span>
            </div>
          ` : ""}
        </div>
      </div>
    ` : `<div style="text-align: center; margin-bottom: 25px; font-family: system-ui, sans-serif; border-b: 2px solid #e2e8f0; padding-bottom: 15px;">
          <h1 style="margin: 0; font-size: 18px; color: #0284c7;">${language === "fr" ? "Rapport d'Analyse Clinique IA" : language === "ar" ? "تقرير الفحص والتحليل الأكاديمي" : "AI Clinical Analysis Sheet"}</h1>
        </div>`;

    const objectivesHtml = (analysisResult?.objectives || []).map((o: string) => `<li>${o}</li>`).join("");
    const referencesHtml = (analysisResult?.references || []).map((r: string) => `<div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-style: italic; font-size: 11px; margin-bottom: 6px; color: #475569;">${r}</div>`).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${analysisResult?.title || "Thesis Analysis Memo"}</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 40px; 
              line-height: 1.6;
              direction: ${direction};
              text-align: ${alignment};
            }
            .section {
              margin-bottom: 25px;
              background: #fafafa;
              border: 1px solid #e2e8f0;
              padding: 16px;
              border-radius: 12px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              color: #0284c7;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-top: 0;
              margin-bottom: 10px;
              letter-spacing: 0.5px;
            }
            .main-title {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 20px;
              line-height: 1.4;
            }
            ul {
              margin: 0;
              padding-left: 20px;
              padding-right: ${language === "ar" ? "20px" : "0"};
            }
            li {
              font-size: 12px;
              color: #334155;
              margin-bottom: 4px;
            }
            p {
              font-size: 12px;
              color: #334155;
              margin: 0;
            }
            @media print {
              body { margin: 20px; }
              .section { background: #fff; box-shadow: none; border-color: #cbd5e1; }
            }
          </style>
        </head>
        <body>
          \${brandingHeaderHtml}
          
          <div class="main-title">\${analysisResult?.title}</div>

          \${analysisResult?.abstract ? \`
            <div class="section">
              <h4 class="section-title">📄 \${language === "fr" ? "Résumé" : "الملخص الإكلينيكي"}</h4>
              <p>\${analysisResult.abstract}</p>
            </div>
          \` : ""}

          \${analysisResult?.problemStatement ? \`
            <div class="section">
              <h4 class="section-title">❓ \${language === "fr" ? "Problématique" : "طرح الإشكالية"}</h4>
              <p>\${analysisResult.problemStatement}</p>
            </div>
          \` : ""}

          \${objectivesHtml ? \`
            <div class="section">
              <h4 class="section-title">🎯 \${language === "fr" ? "Objectifs de Recherche" : "أهداف البحث"}</h4>
              <ul>\${objectivesHtml}</ul>
            </div>
          \` : ""}

          \${analysisResult?.methodology ? \`
            <div class="section">
              <h4 class="section-title">🔬 \${language === "fr" ? "Méthodologie d'Analyse" : "منهجية الفحص"}</h4>
              <p>\${analysisResult.methodology}</p>
            </div>
          \` : ""}

          \${analysisResult?.literatureReview ? \`
            <div class="section">
              <h4 class="section-title">📖 \${language === "fr" ? "Revue Littéraire" : "المراجعة الأدبية للبحوث"}</h4>
              <p>\${analysisResult.literatureReview}</p>
            </div>
          \` : ""}

          \${analysisResult?.results ? \`
            <div class="section">
              <h4 class="section-title">📈 \${language === "fr" ? "Résultats" : "النتائج العلمية المستخلصة"}</h4>
              <p>\${analysisResult.results}</p>
            </div>
          \` : ""}

          \${analysisResult?.discussion ? \`
            <div class="section">
              <h4 class="section-title">💬 \${language === "fr" ? "Discussion Critique" : "المناقشة والتحليلات"}</h4>
              <p>\${analysisResult.discussion}</p>
            </div>
          \` : ""}

          \${referencesHtml ? \`
            <div class="section">
              <h4 class="section-title">📚 \${language === "fr" ? "Bibliographie Associée" : "المصادر والمراجع الأكاديمية"}</h4>
              \${referencesHtml}
            </div>
          \` : ""}

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleProceedWithTemplate = () => {
    const template = THESIS_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      onThesisSelected(template, template.language);
    }
  };

  const handleProceedWithCustom = () => {
    if (analysisResult) {
      onThesisSelected(analysisResult, language);
    }
  };

  return (
    <div id="thesis-selection-step" className="w-full max-w-5xl mx-auto py-6" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      {/* Elegant Dark Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3.5 bg-sky-500/10 border border-sky-400/20 text-sky-450 rounded-2xl mb-4 shadow-xs accent-glow">
          <BookOpen className="w-8 h-8 text-sky-400" />
        </div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-100 sm:text-4xl">
          {language === "fr" ? "Soutenance Virtuelle de Thèse" :
           language === "ar" ? "محاكي مناقشة الأطروحة الجامعية" :
           "Graduation Thesis Defense Suite"}
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
          {language === "fr" ? "Prêt pour le titre de Technicien Supérieur en Imagerie Médicale. Présentez vos travaux et répondez aux questions techniques du jury." :
           language === "ar" ? "منصة امتحانات أكاديمية لتقييم مهارات فنيي الأشعة الساميين. تدرب على الإلقاء والمواجهة مع لجنة التحكيم الأكاديمية." :
           "Step before the academic board of medical imaging. Review parameters, answer professional questions and gauge your readiness."}
        </p>

        {/* Global Language Selector */}
        <div className="flex justify-center items-center gap-1.5 mt-6 bg-[#0F1117] p-1 rounded-full w-max mx-auto border border-white/5" style={{ direction: "ltr" }}>
          <button
            onClick={() => setLanguage("fr")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full duration-150 transition-all cursor-pointer ${language === "fr" ? "bg-sky-500 text-white shadow-xs accent-glow" : "text-slate-400 hover:text-slate-200"}`}
          >
            Français
          </button>
          <button
            onClick={() => setLanguage("ar")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full duration-150 transition-all cursor-pointer ${language === "ar" ? "bg-sky-500 text-white shadow-xs accent-glow" : "text-slate-400 hover:text-slate-200"}`}
          >
            العربية
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full duration-150 transition-all cursor-pointer ${language === "en" ? "bg-sky-500 text-white shadow-xs accent-glow" : "text-slate-400 hover:text-slate-200"}`}
          >
            English
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="w-full">
          {/* Section Selector Tab list */}
          <div className="flex mb-6 bg-[#0F1117] p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => { setActiveTab("template"); setAnalysisResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-sans text-sm font-semibold rounded-lg duration-150 transition-all cursor-pointer ${activeTab === "template" ? "bg-white/5 border border-white/10 text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              <FileText className="w-4 h-4" />
              {language === "fr" ? "Recherche & Thèses Pré-installées" :
               language === "ar" ? "مواضيع الأشعة النموذجية المقترحة" :
               "Pre-installed Research Standard"}
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-sans text-sm font-semibold rounded-lg duration-150 transition-all cursor-pointer ${activeTab === "paste" ? "bg-white/5 border border-white/10 text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Upload className="w-4 h-4" />
              {language === "fr" ? "Uploader / Saisir un Sujet Personnalisé" :
               language === "ar" ? "تحميل أطروحة تخرج مخصصة" :
               "Upload / Parse Custom Document"}
            </button>
          </div>

          <div className="glass rounded-2xl p-6 md:p-8 shadow-md">
            {activeTab === "template" ? (
              <div>
                <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  {language === "fr" ? "Sujets d'examens validés par l'académie" :
                   language === "ar" ? "أبحاث التخرج المعتمدة للتقييم الفوري" :
                   "Examination Topics Standardized for Clinical Technicians"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {THESIS_TEMPLATES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`relative p-5 rounded-xl border transition-all cursor-pointer text-left h-full flex flex-col justify-between ${selectedTemplate === t.id ? "border-sky-505 bg-sky-950/20 shadow-xs active-speaker" : "border-white/5 bg-[#12141C] hover:border-white/15"}`}
                    >
                      <div>
                        {/* Lang badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#161a24] text-sky-400 border border-sky-500/10 mb-3" style={{ direction: "ltr" }}>
                          {t.language.toUpperCase()}
                        </span>
                        <h4 className="font-sans font-bold text-sm text-slate-100 mb-2 leading-snug line-clamp-3">
                          {t.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                          {t.abstract || t.methodology}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                          {language === "fr" ? "3 Examinateurs actifs" :
                           language === "ar" ? "لجنة تحكيم مخصصة" :
                           "3 Jury Roles Ready"}
                        </span>
                        {selectedTemplate === t.id && (
                          <CheckCircle className="w-5 h-5 text-sky-400 fill-sky-450/10" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Template Preview Area */}
                {selectedTemplate && (
                  <div className="bg-[#12141C] border border-white/5 rounded-xl p-5 mb-6 text-left" style={{ direction: THESIS_TEMPLATES.find(x => x.id === selectedTemplate)?.language === "ar" ? "rtl" : "ltr" }}>
                    {(() => {
                      const t = THESIS_TEMPLATES.find(x => x.id === selectedTemplate);
                      if (!t) return null;
                      return (
                        <div>
                          <h4 className="font-sans font-bold text-base text-slate-200 mb-3 ml-1">
                            {t.title}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-slate-300">
                            <div className="bg-[#090a0f] p-4 rounded-lg border border-white/5">
                              <span className="font-bold text-sky-400 block mb-1">🎯 {t.language === "fr" ? "Objectifs de l'étude" : t.language === "ar" ? "أهداف الدراسة" : "Study Objectives"}</span>
                              <ul className="list-disc pl-5 list-inside space-y-1 text-xs text-slate-400">
                                {t.objectives.map((o, i) => <li key={i}>{o}</li>)}
                              </ul>
                            </div>
                            <div className="bg-[#090a0f] p-4 rounded-lg border border-white/5">
                              <span className="font-bold text-emerald-400 block mb-1">🔬 {t.language === "fr" ? "Cadre de la Méthodologie" : t.language === "ar" ? "منهجية الفحص والبروتوكول" : "Methodology & Setup"}</span>
                              <p className="text-xs text-slate-400 leading-relaxed">{t.methodology}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleProceedWithTemplate}
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-sans font-bold text-sm shadow-md transition-all accent-glow select-none"
                  >
                    <span>
                      {language === "fr" ? "Présenter devant le jury imagerie" :
                       language === "ar" ? "بدء الإلقاء والمناقشة الشفوية" :
                       "Step Forward to the Board Room"}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-400" />
                  {language === "fr" ? "Importation de thèse ou plan de clinique" :
                   language === "ar" ? "طرق إدخال نص أطروحة الأشعة الخاصة بك" :
                   "Radiology Document Input Layer"}
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  {language === "fr" ? "Glissez vos chapitres, vos protocoles d'acquisition (scanner, IRM, radioprotection), ou l'introduction de vos travaux cliniques. Notre IA structurera le plan et posera des questions réalistes." :
                   language === "ar" ? "قم بنسخ أو سحب وإسقاط فصول أطروحتك العملية هنا. سيقوم نموذج الذكاء الاصطناعي باستخراج أجهزة وجرعات ومعايير الفحص ومناقشتك فيها." :
                   "Drag and drop text parameters to custom-simulate or paste specific hospital cases you wish to practice defending."}
                </p>

                {error && (
                  <div className="mb-6 bg-rose-955/20 text-rose-300 p-4 rounded-xl border border-rose-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6">
                  {/* File drop zone & stats */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-xl transition-all h-[230px] cursor-pointer relative ${isDragOver ? "border-sky-400 bg-sky-500/5" : file ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 hover:border-white/20 bg-[#0E1016]"}`}
                  >
                    <input
                      type="file"
                      id="thesis-file-picker"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-500 mb-3" />
                    {file ? (
                      <div className="text-center">
                        <span className="font-semibold text-slate-200 block text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <span className="inline-block mt-3 px-2 py-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded">
                          {language === "fr" ? "CHARGÉ AVEC SUCCÈS" : "تم الاستيراد"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="font-semibold text-slate-300 block text-sm">
                          {language === "fr" ? "Glissez votre rapport ou thèse (.txt)" : "اسحب ملف التقرير أو الأطروحة"}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1">
                          {language === "fr" ? "Soutient les fichiers textes bruts" : "يقبل الصيغ النصية البسيطة"}
                        </span>
                        <span className="mt-4 inline-block px-3 py-1.5 bg-[#161922] text-xs border border-white/5 text-slate-300 font-semibold rounded-lg shadow-xs hover:border-white/15">
                          {language === "fr" ? "Parcourir" : "تصفح الملفات"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Manual paste field */}
                  <div className="flex flex-col">
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder={
                        language === "fr" ? "Collez vos objectifs de recherche, les paramètres d'IRM appliqués (ex: TR, TE, FOV, SAR), vos protocoles CT doses élevés, ou vos cas pathologiques cliniques..." :
                        language === "ar" ? "ألصق أهداف بحثك، أو المعايير المستخدمة للفحوصات الإشعاعية، أو توصيات الحماية من الأشعة..." :
                        "Paste study objectives, MRI Sequence timings, CT slice parameters, safety precautions, or abstract summary..."
                      }
                      className="w-full flex-1 p-4 rounded-xl border border-white/10 bg-[#0E1016] text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm font-sans resize-none h-[230px]"
                    />
                  </div>
                </div>

                {/* Analysis Loading / Results display */}
                <AnimatePresence mode="wait">
                  {isParsingPdf && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-[#12141C] border border-white/5 rounded-xl p-8 mb-6 text-center"
                    >
                      <div className="inline-block relative w-12 h-12 mb-4">
                        <span className="absolute inset-0 w-full h-full rounded-full border-4 border-white/10 border-t-amber-400 animate-spin"></span>
                      </div>
                      <h4 className="font-sans font-bold text-slate-200 text-sm">
                        {language === "fr" ? "Extraction en temps réel des pages du PDF..." :
                         language === "ar" ? "جاري استخراج وتحويل صفحات ملف الـ PDF..." :
                         "Extracting and transcribing PDF pages..."}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {language === "fr" ? "Lecture locale sécurisée de la structure du fichier." :
                         language === "ar" ? "قراءة محلية سريعة لبنية الملف النصية." :
                         "Local client-side document processing stream."}
                      </p>
                    </motion.div>
                  )}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-[#12141C] border border-white/5 rounded-xl p-8 mb-6 text-center"
                    >
                      <div className="inline-block relative w-12 h-12 mb-4">
                        <span className="absolute inset-0 w-full h-full rounded-full border-4 border-white/10 border-t-sky-450 animate-spin"></span>
                      </div>
                      <h4 className="font-sans font-bold text-slate-200 text-sm">
                        {language === "fr" ? "Analyse générative médicale en cours..." :
                         language === "ar" ? "جاري قياس وتفكيك الفصول بالذكاء الاصطناعي الأكاديمي..." :
                         "Mapping sequence types, patient profiles, and academic safety rules..."}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {language === "fr" ? "Identification de la problématique, des objectifs, de la revue littéraire et des résultats..." :
                         language === "ar" ? "طرح الهيكل، تحديد الرؤية الطبية والمباحث العلمية..." :
                         "Analyzing problem statement, clinical goals, methodology, and outcome maps..."}
                      </p>
                    </motion.div>
                  )}

                  {analysisResult && (
                    <div className="space-y-6">
                      <ReportBrandingControls 
                        branding={branding} 
                        onChange={setBranding} 
                        language={language} 
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#12141C] border border-white/5 rounded-xl p-6 mb-6 text-left"
                      >
                        <ReportBrandingHeader branding={branding} language={language} />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 mt-4">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <CheckCircle className="w-5 h-5 fill-emerald-500/10 shrink-0" />
                            <span>
                              {language === "fr" ? "Base de connaissance structurée prête !" :
                               language === "ar" ? "تم فحص وتنظيم أطروحتك وبناء قاعدة المعرفة الأكاديمية بنجاح !" :
                               "Research Knowledge Base Structured Successfully!"}
                            </span>
                          </div>
                          
                          <button
                            onClick={handlePrintMemo}
                            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-sans font-bold text-xs rounded-lg shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>
                              {language === "fr" ? "Télécharger le Mémo en PDF" :
                               language === "ar" ? "تحميل التقرير كـ PDF" :
                               "Download Memo PDF"}
                            </span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest">{language === "fr" ? "Titre Officiel de la Thèse" : "عنوان البحث المقاس"}</span>
                            <h4 className="font-sans font-extrabold text-slate-100 text-md md:text-lg mt-1">
                              {analysisResult.title}
                            </h4>
                          </div>

                          {/* Extended abstract segment */}
                          {analysisResult.abstract && (
                            <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5">
                              <span className="font-bold text-amber-450 block mb-1 text-xs uppercase tracking-wider">📄 Abstract / Résumé</span>
                              <p className="text-xs text-slate-400 leading-relaxed">{analysisResult.abstract}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 text-slate-300">
                            {analysisResult.problemStatement && (
                              <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5">
                                <span className="font-semibold text-rose-400 block mb-1.5 text-xs uppercase tracking-wider">❓ Problématique / Problem Statement</span>
                                <p className="text-xs text-slate-400 leading-relaxed">{analysisResult.problemStatement}</p>
                              </div>
                            )}

                            <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5">
                              <span className="font-bold text-sky-400 block mb-1.5">🎯 {language === "fr" ? "Objectifs déterminés" : "الأهداف المستخلصة"}</span>
                              <ul className="list-disc pl-5 list-inside space-y-1 text-xs text-slate-400">
                                {analysisResult.objectives.map((o, i) => <li key={i}>{o}</li>)}
                              </ul>
                            </div>

                            <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5">
                              <span className="font-bold text-emerald-400 block mb-1.5">🔬 {language === "fr" ? "Méthodologie d'Analyse" : "منهجية الفحص والمعايير"}</span>
                              <p className="text-xs text-slate-400 leading-relaxed">{analysisResult.methodology}</p>
                            </div>

                            {analysisResult.literatureReview && (
                              <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5">
                                <span className="font-semibold text-indigo-400 block mb-1.5 text-xs uppercase tracking-wider">📖 Revue Littéraire / Literature Review</span>
                                <p className="text-xs text-slate-400 leading-relaxed">{analysisResult.literatureReview}</p>
                              </div>
                            )}

                            <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5 col-span-1 md:col-span-2">
                              <span className="font-semibold text-emerald-450 block mb-1.5 text-xs uppercase tracking-wider">📈 Résultats / Findings</span>
                              <p className="text-xs text-slate-355 leading-relaxed">{analysisResult.results}</p>
                            </div>

                            {analysisResult.discussion && (
                              <div className="bg-[#090A0E] p-4 rounded-lg border border-white/5 col-span-1 md:col-span-2">
                                <span className="font-semibold text-violet-400 block mb-1.5 text-xs uppercase tracking-wider">💬 Analyse Critique & Discussion</span>
                                <p className="text-xs text-slate-355 leading-relaxed">{analysisResult.discussion}</p>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-white/5">
                            <span className="font-bold text-slate-300 block text-xs mb-2">📚 {language === "fr" ? "Simulation de Littérature Médicale Associée" : "المراجع المقترحة لمحاكاة الامتحان"}</span>
                            <div className="space-y-1">
                              {analysisResult.references.map((r, i) => (
                                <span key={i} className="bg-[#090A0E] px-3 py-1.5 rounded border border-white/5 italic text-slate-400 font-medium block text-xs">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-3 pt-2">
                  {!analysisResult ? (
                    <button
                      onClick={handleAnalyzeCustom}
                      disabled={isLoading}
                      className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-sm shadow-md transition-all select-none disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {language === "fr" ? "Lancer l'analyse intelligente" :
                         language === "ar" ? "بدء فحص وتفكيك الأطروحة" :
                         "Extract Research Structure"}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedWithCustom}
                      className="cursor-pointer inline-flex items-center gap-1 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                    >
                      <span>
                        {language === "fr" ? "Poursuivre vers la simulation" :
                         language === "ar" ? "التوجه نحو لجنة التحكيم لمناقشتها" :
                         "Step forward with Custom Project"}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
