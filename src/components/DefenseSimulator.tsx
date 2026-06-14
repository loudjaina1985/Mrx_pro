import React, { useState, useEffect, useRef } from "react";
import { Thesis, JuryRole, JuryMember, DefenseSession } from "../types";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AwardIcon,
  Eye,
  EyeOff,
  Maximize2,
  Sliders,
  Ruler
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReportBrandingControls, ReportBrandingHeader, loadSavedBranding } from "./ReportBranding";

interface DefenseSimulatorProps {
  thesis: Thesis;
  language: "fr" | "ar" | "en";
  onSessionFinished: (session: DefenseSession) => void;
  onExit: () => void;
}

export default function DefenseSimulator({ thesis, language, onSessionFinished, onExit }: DefenseSimulatorProps) {
  const [session, setSession] = useState<DefenseSession>({
    id: "def-" + Date.now(),
    thesisId: thesis.id,
    thesisTitle: thesis.title,
    language: language,
    questionsCount: 4, // 4-question defense
    currentQuestionIndex: 0,
    currentMemberRole: "president",
    history: [],
    status: "not_started",
    createdAt: new Date().toISOString()
  });

  const [activeQuestion, setActiveQuestion] = useState<{
    question: string;
    introduction: string;
    topic: string;
    guidanceTip: string;
    medicalImage?: {
      url: string;
      modality: string;
      anatomy: string;
      findings: string;
      technicalParameters: string;
    };
  } | null>(null);

  const [studentAnswer, setStudentAnswer] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<any | null>(null);
  const [isDeliberated, setIsDeliberated] = useState<boolean>(false);
  const [deliberationData, setDeliberationData] = useState<any | null>(null);
  const [branding, setBranding] = useState(loadSavedBranding());
  const [recognition, setRecognition] = useState<any | null>(null);

  const [aiProvider, setAiProvider] = useState<"gemini" | "local">("gemini");

  // PACS Diagnostic Viewer Simulation State
  const [pacsPreset, setPacsPreset] = useState<"normal" | "bone" | "soft" | "invert" | "thermal">("normal");
  const [pacsContrast, setPacsContrast] = useState<number>(100);
  const [pacsBrightness, setPacsBrightness] = useState<number>(100);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const [measurement, setMeasurement] = useState<number | null>(null);

  // Track the audio speaker list
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Define the Jury Members
  const juryMembers: { [key in JuryRole]: JuryMember } = {
    president: {
      role: "president",
      name: language === "ar" ? "د. أمينة بن سعيد" : "Dr. Amina Bensaid",
      title: language === "fr" ? "Présidente du Jury" : language === "ar" ? "رئيسة لجنة التحكيم" : "Jury President",
      specialty: language === "fr" ? "Méthodologie & Éthique Clinique" : language === "ar" ? "المنهجية الطبية والأخلاقيات" : "Clinical Methodology & Ethics",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      description: "Strict academic reviewer focusing on scientific rigor, ethical safety, variables, and research logic.",
      color: "border-sky-500 text-sky-400"
    },
    examiner: {
      role: "examiner",
      name: language === "ar" ? "أ.د. جان مارك لوران" : "Prof. Jean-Marc Laurent",
      title: language === "fr" ? "Examinateur Principal" : language === "ar" ? "الممتحن الرئيسي الكلاسيكي" : "Main Examiner",
      specialty: language === "fr" ? "Règles Cliniques & Protocoles de Scanner" : language === "ar" ? "البروتوكولات السريرية والأشعة المقطعية" : "Clinical Radiology Protocols",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
      description: "Pragmatic, demanding medical veteran focusing on practical workflow speed, patient scanning protocols, and pathology detection.",
      color: "border-emerald-500 text-emerald-400"
    },
    specialist: {
      role: "specialist",
      name: language === "ar" ? "د. خالد المنصوري" : "Dr. Khaled Mansouri",
      title: language === "fr" ? "Spécialiste de Spécialité" : language === "ar" ? "أخصائي فيزياء التصوير الطبي" : "Physics Specialist",
      specialty: language === "fr" ? "Physique de l'Imagerie & Séquences IRM" : language === "ar" ? "فيزياء الرنين والمغناطيسية والوقاية" : "Imaging Physics & Sequence Engineering",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
      description: "Academically precise radiologist focusing on the physics of medical scanners, MRI safety rules, and local patient dose values.",
      color: "border-amber-500 text-amber-400"
    }
  };

  // Initialize Web Speech APIs safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;

      // Setup Web speech recognition if supported
      const SpeedRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeedRecognition) {
        const rec = new SpeedRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        
        // Match language code
        if (language === "ar") rec.lang = "ar-DZ";
        else if (language === "en") rec.lang = "en-US";
        else rec.lang = "fr-FR";

        rec.onstart = () => {
          setIsRecording(true);
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setStudentAnswer((prev) => (prev ? prev + " " + resultText : resultText));
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }

    return () => {
      stopVoiceSpeaking();
    };
  }, [language]);

  // Read question with text-to-speech
  const voiceSpeakText = (text: string) => {
    if (!synthesisRef.current) return;
    stopVoiceSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice
    if (language === "ar") {
      utterance.lang = "ar-SA";
    } else if (language === "en") {
      utterance.lang = "en-US";
    } else {
      utterance.lang = "fr-FR";
    }

    utterance.rate = 0.95; // professional, composed speed

    utterance.onstart = () => setIsSynthesizing(true);
    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);

    currentUtteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  };

  const stopVoiceSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSynthesizing(false);
    }
  };

  // Toggle speech recording
  const handleToggleRecord = () => {
    if (!recognition) {
      alert(language === "fr" ? "La reconnaissance vocale n'est pas supportée sur ce navigateur." : "ميزة تحويل الصوت إلى كتابة غير متوافقة في متصفحك الحالي.");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      stopVoiceSpeaking();
      recognition.start();
    }
  };

  // Triggering next question flow
  const fetchNextQuestion = async (updatedSession: DefenseSession) => {
    setIsLoadingQuestion(true);
    setLastEvaluation(null);

    // Determine whose turn it is
    let nextRole: JuryRole = "president";
    const currentIdx = updatedSession.currentQuestionIndex;
    
    if (currentIdx === 1) nextRole = "examiner";
    else if (currentIdx === 2) nextRole = "specialist";
    else if (currentIdx === 3) nextRole = "president";

    try {
      let result;
      if (aiProvider === "gemini") {
        const res = await fetch("/api/jury/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thesisContext: thesis,
            history: updatedSession.history,
            currentMemberRole: nextRole,
            language: language
          })
        });
        
        if (!res.ok) throw new Error("API server failed");
        result = await res.json();
      } else {
        // Local deterministic fallback
        result = getLocalMockQuestion(nextRole);
      }

      setActiveQuestion(result);
      setStudentAnswer("");
      setSession({
        ...updatedSession,
        currentMemberRole: nextRole,
        status: "active"
      });

      // Speak question
      setTimeout(() => {
        voiceSpeakText(result.introduction + ". " + result.question);
      }, 500);

    } catch (err) {
      console.warn("API question fetch failed, using realistic offline backup engines.");
      const offlineQ = getLocalMockQuestion(nextRole);
      setActiveQuestion(offlineQ);
      setStudentAnswer("");
      setSession({
        ...updatedSession,
        currentMemberRole: nextRole,
        status: "active"
      });
      setTimeout(() => {
        voiceSpeakText(offlineQ.introduction + ". " + offlineQ.question);
      }, 500);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const startDefense = () => {
    const updated = { ...session, status: "active" as const, currentQuestionIndex: 0 };
    setSession(updated);
    fetchNextQuestion(updated);
  };

  // Fallback system questions generator
  const getLocalMockQuestion = (role: JuryRole) => {
    if (language === "ar") {
      if (role === "president") {
        return {
          question: `كيف قمت باختيار وتحديد المتغيرات الأساسية في هذه الأطروحة، وهل تمت مراعاة مبادئ أخلاقيات البحث الطبي عند أخذ العينات؟`,
          introduction: `أهلاً بك زميلنا الطالب الفاضل في قاعة الدفاع الفني للمجلس العلمي للأشعة. سأبدأ بمناقشتك حول المنهج العلمي المعتمد في دراستك.`,
          topic: `متغيرات الدراسة وأخلاقيات البحث`,
          guidanceTip: `ركز على طرق حماية بيانات المرضى، وتطبيق مبدأ الموافقة المسبقة المنصوص عليه وطرق تقليص الانحياز الإحصائي.`,
          medicalImage: {
            url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
            modality: "CT",
            anatomy: "مقطع صدري ورئوي (Thorax Station)",
            findings: "تقييم العينات الطبية وإجراءات المسح الصدري مع تظليل العقد اللمفاوية الرئوية ومراعاة خصوصية تدوين المريض.",
            technicalParameters: "kVp: 120, mAs: 180, Reconstruction Matrix: 512x512"
          }
        };
      } else if (role === "examiner") {
        return {
          question: `في فحص الأشعة المقطعية، كيف تعاملت مع التشويه الفني للجرعة المنخفضة (Artifacts)، وما هي المعايير المتبعة لتحسين بروتوكولات حماية الأطفال المرضى؟`,
          introduction: `أبرزت أبحاثك استخداماً لبروتوكول تحوير تيار الأنبوب التلقائي. لكن كفني أشعة ممارس في قسم الاستعجالات، أود سؤالك بدقة.`,
          topic: `معالجة التشوهات والوقاية من الإشعاع`,
          guidanceTip: `اذكر مبدأ ALARA للوقاية من الإشعاع، واستخدام تقنيات إعادة الإعمار التكراري لإبقاء جودة الصورة عالية رغم خفض الجرعة.`,
          medicalImage: {
            url: "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&q=80&w=800",
            modality: "X-Ray",
            anatomy: "صدر بشري أمامي خلفي (Chest Radiography PA)",
            findings: "تشوهات فنية طفيفة ناتجة عن قطب خارجي مع سلامة النسيج الرئوي وتجويف القلب الطبيعي.",
            technicalParameters: "kVp: 110, mAs: 4, Grid: Focused, SID: 180cm"
          }
        };
      } else {
        return {
          question: `ما هو التعديل الفيزيائي المطبق في سلاسل الرنين المغناطيسي المتاحة لتوليد نسبة إشارة تشخيصية (SNR) مقبولة مع التقليص من ثابت SAR؟`,
          introduction: `بالنظر لتأثيرات فيزياء الرنين المتقدم وسلاسل النبض التي وصفتها في المنهجية الموجهة لذات القوة 3 تسلا.`,
          topic: `فيزياء الرنين المغناطيسي ومعدل SAR للمغناطيسات العالية`,
          guidanceTip: `اشرح العلاقة الطردية بين زمن التكرار TR ومستوى الإشارة، وطريقة تعديل زاوية الانحراف Flip Angle لخفض ترسب الطاقة الحيوية.`,
          medicalImage: {
            url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800",
            modality: "MRI",
            anatomy: "الدماغ البشري مقطع تاجي (Brain MRI Axial/Coronal)",
            findings: "سلامة المادة البيضاء والرمادية للدماغ مع تباين t2 عالي الدقة في السائل الدماغي الشوكي في البطينات المتسعة طفيفاً.",
            technicalParameters: "Sequence: T2-Weighted TSE, TR: 4000ms, TE: 90ms"
          }
        };
      }
    } else {
      // English / French defaults
      if (role === "president") {
        return {
          question: `Could you clarify how your patient sample size was calculated, and what explicit measures were implemented to protect patient data confidentiality?`,
          introduction: `Dear candidate, welcome to your professional thesis evaluation tribunal. As the president of this board, I would like to examine your structural methodology.`,
          topic: `Scientific Rigor & Ethical Standards`,
          guidanceTip: `Address statistical significance standards and describe the secure de-identification safeguards applied to radiology workflow folders.`,
          medicalImage: {
            url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
            modality: "CT",
            anatomy: "Chest CT & Interactive PACS Console",
            findings: "High-resolution lung reconstruction series showing clear mediastinal boundaries and confidential tracking tag encryption.",
            technicalParameters: "kVp: 120, mAs: 220, Slice thickness: 1.0mm, Kernel: B60f"
          }
        };
      } else if (role === "examiner") {
        return {
          question: `During the CT acquisition protocol you analyzed, how did you adjust contrast material delivery timing relative to patient weight to avoid scan artifacts?`,
          introduction: `Your results demonstrate superior diagnostic capabilities. However, let us discuss real clinical scenarios in a busy diagnostic department.`,
          topic: `Contrast Dynamics & Slice Protocols`,
          guidanceTip: `Coordinate contrast volume variables, injector pressure speeds, and specify slice thickness configurations and standard timing rules.`,
          medicalImage: {
            url: "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&q=80&w=800",
            modality: "X-Ray",
            anatomy: "Adult Chest Radiograph (PA View)",
            findings: "Symmetric lung expansion, normal cardiac shadow, visible external physiological lead wire overlay over the right shoulder.",
            technicalParameters: "kVp: 115, mAs: 5, SID: 180cm, Grid ratio: 12:1"
          }
        };
      } else {
        return {
          question: `In the 3T MRI magnetic protocol, how did you balance the Specific Absorption Rate (SAR) increase while preserving the lesion spatial resolution?`,
          introduction: `Let us address advanced imaging physics. The transition to high field magnets presents distinct physical trade-offs in clinical practice.`,
          topic: `MRI Sequence Physics & Thermal SAR Optimization`,
          guidanceTip: `Discuss lowering TR timings, shortening echo train lengths, and using Parallel Imaging accelerators (SENSE/GRAPPA) to keep energy low.`,
          medicalImage: {
            url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800",
            modality: "MRI",
            anatomy: "Cerebello-Pontine Angle Slices (Brain Axial)",
            findings: "Clear structural visualization of acoustic-facial bundles with minimal magnetic susceptibility artifacts, optimal signal-to-noise ratio.",
            technicalParameters: "Sequence: T2 FSE (Fast Spin Echo), TR: 3800ms, TE: 102ms, ETL: 16"
          }
        };
      }
    }
  };

  // Submit Answer & Evaluate via Generative Action
  const handleSubmitAnswer = async () => {
    if (!studentAnswer || studentAnswer.trim().length === 0) {
      alert(language === "fr" ? "Veuillez formuler ou enregistrer une réponse d'abord." : "يرجى كتابة أو تسجيل إجابة لفظية أولاً.");
      return;
    }

    stopVoiceSpeaking();
    setIsEvaluating(true);

    try {
      let evaluation;
      if (aiProvider === "gemini") {
        const res = await fetch("/api/jury/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thesisContext: thesis,
            question: activeQuestion?.question,
            answer: studentAnswer,
            currentMemberRole: session.currentMemberRole,
            language: language
          })
        });

        if (!res.ok) throw new Error("Evaluation failed");
        evaluation = await res.json();
      } else {
        // Local evaluation calculations
        evaluation = getLocalMockEvaluation();
      }

      setLastEvaluation(evaluation);

      // Append exchange to history
      const updatedHistory = [
        ...session.history,
        {
          role: session.currentMemberRole,
          question: activeQuestion?.question || "",
          answer: studentAnswer,
          topic: activeQuestion?.topic || "General Radiology",
          evaluationScore: evaluation.score,
          evaluationFeedback: evaluation.feedback,
          idealPoints: evaluation.idealPoints,
          ratings: {
            scientificAccuracy: evaluation.scientificAccuracy?.score || 4,
            technicalKnowledge: evaluation.technicalKnowledge?.score || 4,
            communicationSkills: evaluation.communicationSkills?.score || 4,
          }
        }
      ];

      setSession({
        ...session,
        history: updatedHistory
      });

    } catch (err) {
      console.warn("Using offline evaluation calculator.");
      const fallbackEval = getLocalMockEvaluation();
      setLastEvaluation(fallbackEval);

      const updatedHistory = [
        ...session.history,
        {
          role: session.currentMemberRole,
          question: activeQuestion?.question || "",
          answer: studentAnswer,
          topic: activeQuestion?.topic || "General Radiology",
          evaluationScore: fallbackEval.score,
          evaluationFeedback: fallbackEval.feedback,
          idealPoints: fallbackEval.idealPoints,
          ratings: {
            scientificAccuracy: fallbackEval.scientificAccuracy.score,
            technicalKnowledge: fallbackEval.technicalKnowledge.score,
            communicationSkills: fallbackEval.communicationSkills.score,
          }
        }
      ];

      setSession({
        ...session,
        history: updatedHistory
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const getLocalMockEvaluation = () => {
    return {
      score: 4,
      scientificAccuracy: {
        score: 4,
        critique: "Excellent technical application and clinical focus. Addressed basic physics correctly."
      },
      technicalKnowledge: {
        score: 4,
        critique: "Great understanding of machine parameters, hardware calibration and protocols."
      },
      communicationSkills: {
        score: 4,
        critique: "Professional delivery, structured terminology and solid academic confidence."
      },
      confidenceLevel: "High" as const,
      feedback: language === "ar" ? 
        "أحسنت في طرح الحلول الهندسية. نوصي بالإشارة الدائمة في إجابتك للتكامل المباشر لمستويات الحماية الإشعاعية ALARA وقوانين تظليل الرنين." :
        "Impressive response focusing on clinical parameters. Continue referencing key radiation safeguards and spatial guidelines to impress senior exam delegates.",
      idealPoints: [
        language === "ar" ? "تطبيق معايير قانون هولمر" : "ALARA Radiation safety constraints",
        language === "ar" ? "دمج تسارع GRAPPA" : "Parallel hardware sequence scaling"
      ]
    };
  };

  const handleNextQuestion = () => {
    const nextIdx = session.currentQuestionIndex + 1;
    if (nextIdx < session.questionsCount) {
      const nextSession = {
        ...session,
        currentQuestionIndex: nextIdx
      };
      setSession(nextSession);
      fetchNextQuestion(nextSession);
    } else {
      // Deliberate the panel
      triggerDeliberations();
    }
  };

  // Compile final results via deliberations
  const triggerDeliberations = async () => {
    setSession({
      ...session,
      status: "deliberating"
    });
    setIsDeliberated(true);

    try {
      let finalReport;
      if (aiProvider === "gemini") {
        const res = await fetch("/api/jury/deliberate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thesisContext: thesis,
            sessionHistory: session.history,
            language: language
          })
        });

        if (!res.ok) throw new Error("Deliberation board errored");
        finalReport = await res.json();
      } else {
        finalReport = getLocalDeliberation();
      }

      setDeliberationData(finalReport);
      
      const finishedSession = {
        ...session,
        status: "finished" as const,
        report: finalReport
      };
      setSession(finishedSession);
    } catch (err) {
      console.warn("Using local board deliberation engine.");
      const fallbackReport = getLocalDeliberation();
      setDeliberationData(fallbackReport);
      setSession({
        ...session,
        status: "finished",
        report: fallbackReport
      });
    }
  };

  const getLocalDeliberation = () => {
    const totalScoreHistory = session.history.reduce((acc, h) => acc + h.evaluationScore, 0);
    const averageScore = session.history.length > 0 ? (totalScoreHistory / session.history.length) : 4;
    const finalCalculated = Math.min(20, (averageScore / 5) * 20); // Scale up to 20

    return {
      finalScore: parseFloat(finalCalculated.toFixed(1)),
      mention: finalCalculated >= 18 ? "Très Honorable avec Félicitations du Jury" :
               finalCalculated >= 15 ? "Très Honorable" : "Honorable",
      comments: {
        president: language === "ar" ? "أثبت الطالب التزاماً علمياً ومنهجياً رفيع المستوى في طرح الفكرة." : "Demonstrated meticulous academic diligence and rigorous structural research parameters.",
        examiner: language === "ar" ? "سعداء بالفهم السريري لخطوات تحضير الجرعات وتجنب عيوب الصورة." : "Commendable grasp of emergency scanner workflows, artifact remediation and pediatric imaging safety.",
        specialist: language === "ar" ? "مستوى ممتاز في ضبط سلاسل الرنين وعلاقة التسلسل مع ثوابت التبريد." : "Robust comprehension of magnetic resonance energy absorption and scan acceleration metrics."
      },
      breakdown: {
        rigueurScientifique: Math.round(finalCalculated + 1),
        techniqueImagerie: Math.round(finalCalculated - 0.5),
        radioprotection: Math.round(finalCalculated),
        prestationOrale: Math.round(finalCalculated + 0.8),
        gestionDesQuestions: Math.round(finalCalculated - 1)
      },
      strengths: [
        language === "ar" ? "فهم متميز لمعاملات الحماية والوقاية للأطفال" : "Thorough grasp of ALARA safeguards and safety optimization.",
        language === "ar" ? "أداء خطابي متزن وواثق ومصطلحات لاتينية صحيحة" : "Structured articulation and advanced diagnostic vocabulary under pressure."
      ],
      weaknesses: [
        language === "ar" ? "حاجة طفيفة لتفصيل تكوينات عتاد الهوائيات" : "Slight omission of physical coil design constraints."
      ],
      improvements: [
        language === "ar" ? "مراجعة تقنيات التشكيل التلقائي في الفحوص الاستعجالية" : "Dive deeper into fast emergency multi-slice protocols."
      ]
    };
  };

  // Safe exit to dashboard & database persistence
  const handleFinalizeAndExit = () => {
    // Save report to localStorage for analytics history
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("radiology_defense_history") || "[]";
      const list = JSON.parse(existing);
      list.push(session);
      localStorage.setItem("radiology_defense_history", JSON.stringify(list));
    }
    onSessionFinished(session);
  };

  // Calculate current progress width
  const progressPercent = session.status === "finished" ? 100 : (session.currentQuestionIndex / session.questionsCount) * 100;

  return (
    <div className="w-full flex flex-col h-full text-slate-200">
      
      {/* 1. Header Area with active statuses */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-[#0F1117] border-b border-white/5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-sky-450 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight uppercase">
              {language === "fr" ? "TRIBUNAL MEDICAL VIRTUEL" : language === "ar" ? "المحاكاة الأكاديمية الشفوية" : "IMAGING TRIBUNAL ROOM"}
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">
              GRADUATION THESIS DEFENSE • ACTIVE CLINICAL EXAMINATION BOARD
            </p>
          </div>
        </div>

        {/* AI Provider Switch & Connection info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#12141C] border border-white/5 rounded-full p-1 text-[11px] font-semibold">
            <button 
              onClick={() => setAiProvider("gemini")}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${aiProvider === "gemini" ? "bg-sky-500/25 text-sky-400 border border-sky-400/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Gemini AI
            </button>
            <button 
              onClick={() => setAiProvider("local")}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${aiProvider === "local" ? "bg-amber-500/25 text-amber-400 border border-amber-400/20 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Offline Simulator
            </button>
          </div>

          <span className="hidden md:inline-block w-px h-6 bg-white/10" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">{language === "fr" ? "SESSION ACTIVE" : "الجلسة نشطة"}</span>
          </div>

          <button 
            onClick={onExit}
            className="cursor-pointer text-xs text-slate-400 hover:text-white bg-[#12141C] border border-white/5 px-3 py-1.5 rounded-lg transition-all"
          >
            {language === "fr" ? "Abandonner" : language === "ar" ? "انسحاب" : "Exit"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#0A0B0E]">
        
        {/* 2. Left Side Summary Column */}
        <aside className="w-full lg:w-72 border-r border-white/5 bg-[#0F1117] p-5 flex flex-col gap-6 shrink-0 text-left" style={{ direction: "ltr" }}>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              {language === "fr" ? "Projet Présenté" : "موضوع البحث والمنهجية"}
            </label>
            <div className="p-4 rounded-xl glass bg-sky-500/5 border-sky-500/10">
              <h3 className="text-xs font-bold leading-snug line-clamp-3 text-slate-200">
                {thesis.title}
              </h3>
              <p className="text-[10px] text-slate-450 text-slate-400 mt-2 leading-relaxed">
                <span className="font-semibold text-sky-400">Keywords:</span> {thesis.keywords.slice(0, 3).join(", ")}
              </p>
            </div>
          </div>

          {/* Defense Progression */}
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">
              {language === "fr" ? "Étapes de Convocation" : "الهيكل الزمني للمناقشة"}
            </label>
            <div className="space-y-2.5 text-[11px] font-sans">
              <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${session.currentQuestionIndex >= 0 ? "bg-white/5 border-sky-500/30 text-sky-300" : "bg-[#12141C] border-white/5 text-slate-500"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${session.currentQuestionIndex >= 0 ? "bg-sky-500/20 text-sky-400" : "bg-white/5"}`}>1</div>
                <div>
                  <p className="font-bold leading-none">{language === "ar" ? "تقرير المنهجية والأهداف" : "Introductory Methodology"}</p>
                  <p className="text-[9px] text-slate-500 uppercase mt-0.5">{juryMembers.president.name}</p>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${session.currentQuestionIndex >= 1 ? "bg-white/5 border-emerald-500/30 text-emerald-300" : "bg-[#12141C] border-white/5 text-slate-500"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${session.currentQuestionIndex >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5"}`}>2</div>
                <div>
                  <p className="font-bold leading-none">{language === "ar" ? "بروتوكولات الفحص السريري" : "CT Case Imaging Protocols"}</p>
                  <p className="text-[9px] text-slate-500 uppercase mt-0.5">{juryMembers.examiner.name}</p>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${session.currentQuestionIndex >= 2 ? "bg-white/5 border-amber-500/30 text-amber-300" : "bg-[#12141C] border-white/5 text-slate-500"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${session.currentQuestionIndex >= 2 ? "bg-amber-500/20 text-amber-400" : "bg-white/5"}`}>3</div>
                <div>
                  <p className="font-bold leading-none">{language === "ar" ? "فيزياء ومعاملات رنين ومغناطيسية" : "Advanced Resonance Physics"}</p>
                  <p className="text-[9px] text-slate-500 uppercase mt-0.5">{juryMembers.specialist.name}</p>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${session.currentQuestionIndex >= 3 ? "bg-white/5 border-indigo-500/30 text-indigo-300" : "bg-[#12141C] border-white/5 text-slate-500"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${session.currentQuestionIndex >= 3 ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5"}`}>4</div>
                <div>
                  <p className="font-bold leading-none">{language === "ar" ? "مناقشة الاستنتاج والآفاق" : "Clinical Safeguards & Ethics"}</p>
                  <p className="text-[9px] text-slate-500 uppercase mt-0.5">{juryMembers.president.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Session ID block */}
          <div className="pt-4 border-t border-white/5">
            <div className="p-3 rounded-xl bg-[#12141C] border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">PROGRESS BAR</span>
                <span className="text-[10px] font-mono text-sky-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Main Board and Conversational Core Column */}
        <section className="flex-1 p-5 md:p-6 flex flex-col gap-6 overflow-y-auto bg-[#0D0F14]">
          
          {session.status === "not_started" ? (
            /* Intro Screen inside simulator */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-3xl bg-[#0F1117]/60">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4 accent-glow">
                <Play className="w-8 h-8 text-sky-450 text-sky-400 fill-sky-400/10" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {language === "fr" ? "Lancer la soutenance orale" : language === "ar" ? "أداء قسم مناقشة الأطروحة الطبية" : "Initialize Oral Defense Assessment"}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
                {language === "fr" ? "La soutenance consiste en 4 questions posées sélectivement par chaque membre du jury selon sa spécialité. Vous pouvez répondre à la voix grâce au micro ou par écrit." :
                 language === "ar" ? "تتكون هذه المناقشة من 4 جولات من الأسئلة المتخصصة والحرجة الموجهة من قبل رئيس وأعضاء لجنة الفحص والاستعجال." :
                 "Step before the medical board. Engage with 4 technical questions structured around your selected thesis study. Record or type."}
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={startDefense}
                  className="cursor-pointer px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-md transition-all accent-glow"
                >
                  {language === "fr" ? "Entrer dans la salle d'examen" : language === "ar" ? "ادخل واعرض أطروحتك للجنة الأولية" : "Start Oral Defense"}
                </button>
              </div>
            </div>
          ) : session.status === "deliberating" ? (
            /* Deliberation Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-3xl bg-[#0F1117]/60">
              <div className="w-16 h-16 rounded-full bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center mb-4">
                <span className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
              <h3 className="text-lg font-bold text-indigo-400">
                {language === "fr" ? "Le jury délibère à huis clos..." : language === "ar" ? "تقوم اللجنة بالمداولة وإعداد البيان النهائي..." : "The Board is Deliberating..."}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                {language === "fr" ? "Calcul des scores de rigueur scientifique, de maîtrise de la physique de l'image, et compilation de la mention académique officielle..." :
                 language === "ar" ? "يقوم رئيس اللجنة بجمع الدرجات وإرسال الملاحظات الفردية لكل أخصائي..." :
                 "The senior examining members are calculating individual values for technical parameters, radiation safety, and clinical reasoning."}
              </p>
            </div>
          ) : session.status === "finished" && deliberationData ? (
            /* DELIBERATION REPORT COMPONENT */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-left"
            >
              <ReportBrandingControls 
                branding={branding} 
                onChange={setBranding} 
                language={language} 
              />
              
              <div className="p-6 rounded-3xl bg-radial bg-gradient-to-br from-slate-900 to-[#12141C] border-2 border-sky-500/20 relative overflow-hidden print:bg-white print:text-black">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none print:hidden">
                  <AwardIcon size={120} className="text-sky-400" />
                </div>

                <ReportBrandingHeader branding={branding} language={language} />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-sky-400 font-bold uppercase">{language === "fr" ? "VERDICT DE LA FACULTÉ MÉDICALE" : "محضر المداولات لشهادة تقني الأشعة"}</span>
                    <h2 className="text-2xl font-black text-slate-100 mt-1">
                      {language === "fr" ? "Procès-verbal de Soutenance" : language === "ar" ? "محضر تخرج معتمد أكاديمياً" : "Official Graduation Audit Statement"}
                    </h2>
                    <p className="text-xs text-slate-450 text-slate-400 mt-0.5 max-w-xl">
                      {thesis.title}
                    </p>
                  </div>
                  
                  {/* Floating Final Score Medal */}
                  <div className="text-center bg-sky-500/10 border border-sky-400/20 px-6 py-4 rounded-2xl accent-glow shrink-0">
                    <span className="text-[10px] font-bold text-sky-400 block tracking-wider uppercase">{language === "fr" ? "NOTE DU JURY" : "الدرجة النهائية"}</span>
                    <span className="text-3xl font-black text-sky-400">{deliberationData.finalScore}</span>
                    <span className="text-xs text-slate-400 font-bold block mt-0.5">/20</span>
                  </div>
                </div>

                {/* Mention Badge */}
                <div className="mt-4 flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-slate-400">{language === "fr" ? "Mention académique attribuée :" : language === "ar" ? "التقدير الأكاديمي المكتسب :" : "Official Academic Mention:"}</span>
                  <span className="text-xs text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                    {deliberationData.mention}
                  </span>
                </div>

                {/* Score breakdown metrics */}
                <div className="mt-6">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                    {language === "fr" ? "Détail de la Performance (sur 20)" : "جدول تفصيلي بالمهارات المقاسة"}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-[#0A0B0E] p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-lg font-bold text-sky-400">{deliberationData.breakdown.rigueurScientifique}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1">{language === "fr" ? "Rigueur" : "المنهجية"}</p>
                    </div>
                    <div className="bg-[#0A0B0E] p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-lg font-bold text-emerald-400">{deliberationData.breakdown.techniqueImagerie}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1">{language === "fr" ? "Imagerie" : "التصوير"}</p>
                    </div>
                    <div className="bg-[#0A0B0E] p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-lg font-bold text-amber-500">{deliberationData.breakdown.radioprotection}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1">{language === "fr" ? "Radioprotect" : "الوقاية"}</p>
                    </div>
                    <div className="bg-[#0A0B0E] p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-lg font-bold text-purple-400">{deliberationData.breakdown.prestationOrale}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1">{language === "fr" ? "Présentation" : "الإلقاء"}</p>
                    </div>
                    <div className="bg-[#0A0B0E] p-3 rounded-xl border border-white/5 text-center col-span-2 md:col-span-1">
                      <p className="text-lg font-bold text-rose-450 text-indigo-400">{deliberationData.breakdown.gestionDesQuestions}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1">{language === "fr" ? "Questions" : "الأسئلة"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Jury detailed Comments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(juryMembers).map((roleKey) => {
                  const member = juryMembers[roleKey as JuryRole];
                  const opinion = deliberationData.comments[roleKey as keyof typeof deliberationData.comments] || "Approved.";
                  return (
                    <div key={roleKey} className="glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-3.5">
                          <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                          <div>
                            <h4 className="font-bold text-xs text-slate-250 leading-none">{member.name}</h4>
                            <span className="text-[9px] font-mono text-slate-500 uppercase block mt-0.5">{member.title}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{opinion}"
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-sky-400 mt-4 block">{member.specialty}</span>
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#12141C] p-5 rounded-3xl border border-white/5">
                  <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {language === "fr" ? "Points Forts Reconnus" : language === "ar" ? "نقاط القوة المسجلة لدى الطالب" : "Key Strengths Identified"}
                  </h4>
                  <ul className="space-y-2">
                    {deliberationData.strengths.map((str: string, index: number) => (
                      <li key={index} className="text-xs text-slate-350 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span className="text-slate-300">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#12141C] p-5 rounded-3xl border border-white/5">
                  <h4 className="text-xs font-bold text-amber-500 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {language === "fr" ? "Champs d'Améliorations Recommandés" : language === "ar" ? "توجيهات علمية للتدريب المستقبلي" : "Required Clinical Refinement"}
                  </h4>
                  <ul className="space-y-2">
                    {deliberationData.improvements.map((imp: string, index: number) => (
                      <li key={index} className="text-xs text-slate-350 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold shrink-0">→</span>
                        <span className="text-slate-300">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex justify-between gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3 cursor-pointer bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  {language === "fr" ? "Imprimer le Procès-verbal" : language === "ar" ? "طباعة بيان المداولة والدرجات" : "Print PDF Statement"}
                </button>

                <button
                  onClick={handleFinalizeAndExit}
                  className="px-6 py-3 cursor-pointer bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all accent-glow"
                >
                  {language === "fr" ? "Enregistrer & Retourner" : language === "ar" ? "حفظ النتيجة والعودة للمكتبة" : "Complete Protocol & Save Result"}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ACTIVE DEFENSE INTERACTION PANEL */
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* 1. Jury interactive dynamic cards row */}
              <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 pb-4 border-b border-white/5" style={{ direction: "ltr" }}>
                {Object.keys(juryMembers).map((roleKey) => {
                  const role = roleKey as JuryRole;
                  const member = juryMembers[role];
                  const isActive = session.currentMemberRole === role;
                  return (
                    <div 
                      key={role}
                      onClick={() => !isLoadingQuestion && !isEvaluating && setSession({ ...session, currentMemberRole: role })}
                      className={`jury-card flex-1 min-w-[200px] p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between ${isActive ? "active-speaker border-sky-500 text-sky-450 shadow-xs accent-glow scale-102" : "border-white/5 bg-[#0F1117] opacity-60 hover:opacity-100"}`}
                    >
                      <div className="relative">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className={`w-14 h-14 rounded-full object-cover border-2 ${isActive ? "border-sky-400" : "border-white/10"}`}
                        />
                        {isActive && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-sky-500 rounded-full border-2 border-[#0D0F14] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <h4 className="font-bold text-xs text-slate-100">{member.name}</h4>
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-sky-400" : "text-slate-500"}`}>{member.title}</p>
                      </div>

                      <p className="text-[9px] text-slate-400 px-2 line-clamp-2 mt-1 whitespace-pre-wrap select-none leading-relaxed">
                        {member.specialty}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* 2A. PACS Medical Imaging Workspace (left column - visible if the current question has an image) */}
                {activeQuestion?.medicalImage && (
                  <div className="xl:col-span-5 bg-[#090A0D] border border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-4 overflow-hidden text-slate-300 font-sans select-none relative">
                    {/* PACS Monitor Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          DICOM PACS • VIEWPORT #01
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
                        <span>W/L PRESET:</span>
                        <span className="text-sky-400 font-bold uppercase">{pacsPreset}</span>
                      </div>
                    </div>

                    {/* Interactive Image Viewport */}
                    <div className="relative overflow-hidden rounded-lg bg-black border border-white/5 flex items-center justify-center group flex-1">
                      {/* Image under CSS filters */}
                      <img
                        src={activeQuestion.medicalImage.url}
                        alt="DICOM Scan Slice"
                        referrerPolicy="no-referrer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                          
                          if (!caliperStart || (caliperStart && caliperEnd)) {
                            setCaliperStart({ x, y });
                            setCaliperEnd(null);
                            setMeasurement(null);
                          } else {
                            setCaliperEnd({ x, y });
                            const dx = x - caliperStart.x;
                            const dy = y - caliperStart.y;
                            const pixelDist = Math.sqrt(dx * dx + dy * dy);
                            const mmVal = parseFloat((pixelDist * 0.38).toFixed(1)); // Realistic calibration ratio
                            setMeasurement(mmVal);
                          }
                        }}
                        style={{
                          filter: pacsPreset === "bone" 
                            ? `grayscale(100%) brightness(${pacsBrightness + 10}%) contrast(${pacsContrast * 1.8}%)` 
                            : pacsPreset === "soft" 
                            ? `grayscale(100%) brightness(${pacsBrightness - 10}%) contrast(${pacsContrast * 1.2}%)` 
                            : pacsPreset === "invert" 
                            ? `grayscale(100%) invert(100%) brightness(${pacsBrightness}%) contrast(${pacsContrast * 1.4}%)` 
                            : pacsPreset === "thermal" 
                            ? `hue-rotate(220deg) saturate(250%) brightness(${pacsBrightness}%) contrast(${pacsContrast * 1.25}%)` 
                            : `brightness(${pacsBrightness}%) contrast(${pacsContrast}%)`
                        }}
                        className="w-full h-full max-h-[280px] object-cover transition-all duration-300 pointer-events-auto cursor-crosshair"
                      />

                      {/* Caliper Measurement Drawing Overlay */}
                      <svg className="absolute inset-0 pointer-events-none w-full h-full">
                        {caliperStart && (
                          <circle cx={`${caliperStart.x}%`} cy={`${caliperStart.y}%`} r="5" fill="#EF4444" className="animate-ping" />
                        )}
                        {caliperStart && (
                          <circle cx={`${caliperStart.x}%`} cy={`${caliperStart.y}%`} r="3.5" fill="#EF4444" />
                        )}
                        {caliperStart && caliperEnd && (
                          <>
                            <line 
                              x1={`${caliperStart.x}%`} 
                              y1={`${caliperStart.y}%`} 
                              x2={`${caliperEnd.x}%`} 
                              y2={`${caliperEnd.y}%`} 
                              stroke="#EF4444" 
                              strokeWidth="2" 
                              strokeDasharray="4 2" 
                            />
                            <circle cx={`${caliperEnd.x}%`} cy={`${caliperEnd.y}%`} r="3.5" fill="#EF4444" />
                            <g transform={`translate(${(caliperStart.x + caliperEnd.x) / 2}%, ${(caliperStart.y + caliperEnd.y) / 2}%)`}>
                              <rect x="-30" y="-12" width="60" height="18" rx="4" fill="#090A0D" stroke="#EF4444" strokeWidth="1" />
                              <text x="0" y="1.5" fill="#EF4444" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
                                {measurement}mm
                              </text>
                            </g>
                          </>
                        )}
                      </svg>

                      {/* Anatomical Landmark / Pathological highlights Overlays (Toggleable) */}
                      {showAnnotations && !caliperStart && (
                        <>
                          {/* Brain slice finding */}
                          {activeQuestion.medicalImage.modality === "MRI" && (
                            <div className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                              <span className="absolute inline-flex h-4 w-4 rounded-full bg-sky-400 opacity-75 animate-ping" />
                              <div className="relative w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-slate-100 flex items-center justify-center cursor-pointer group/node">
                                <div className="absolute left-5 bottom-0 bg-slate-900/95 border border-sky-500/30 text-[9px] font-mono rounded px-2 py-1 text-slate-200 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity">
                                  <p className="font-bold text-sky-400">{language === "fr" ? "ANOMALIE DE SIGNAL T2" : "T2 SIGNAL HYPERINTENSITY"}</p>
                                  <p className="text-[8px] text-slate-400 mt-0.5">{activeQuestion.medicalImage.findings}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Chest radiograph finding */}
                          {activeQuestion.medicalImage.modality === "X-Ray" && (
                            <div className="absolute top-[32%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                              <span className="absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-75 animate-ping" />
                              <div className="relative w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-100 flex items-center justify-center cursor-pointer group/node">
                                <div className="absolute left-5 bottom-0 bg-slate-900/95 border border-amber-500/30 text-[9px] font-mono rounded px-2 py-1 text-slate-200 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity">
                                  <p className="font-bold text-amber-400">{language === "fr" ? "ARTEFACT MATÉRIEL DE CONTRÔLE" : "EXTERNAL LEAD OVERLAY"}</p>
                                  <p className="text-[8px] text-slate-400 mt-0.5">{activeQuestion.medicalImage.findings}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Spine or consultation slice finding */}
                          {activeQuestion.medicalImage.modality === "CT" && (
                            <div className="absolute top-[52%] left-[38%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                              <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                              <div className="relative w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-100 flex items-center justify-center cursor-pointer group/node">
                                <div className="absolute left-5 bottom-0 bg-slate-900/95 border border-emerald-500/30 text-[9px] font-mono rounded px-2 py-1 text-slate-200 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity">
                                  <p className="font-bold text-emerald-400">{language === "fr" ? "STRUCTURE SOUS-DENSE" : "SUB-DENSE RECONSTRUCTION"}</p>
                                  <p className="text-[8px] text-slate-400 mt-0.5">{activeQuestion.medicalImage.findings}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Navigation Calibration Instructions Tooltip */}
                      <div className="absolute bottom-2 left-2 right-2 flex bg-slate-950/80 border border-white/5 p-1.5 rounded text-[8px] select-none text-slate-400 justify-between items-center z-10">
                        <span>
                          {caliperStart && !caliperEnd 
                            ? (language === "fr" ? "Placez le point d'arrivée..." : "ضع نهاية سهم قياس الفجوة...") 
                            : (language === "fr" ? "Caliper: Clic sur l'image pour tracer une distance" : "لقياس الحجم: اضغط في مكانين على الصورة")}
                        </span>
                        {(caliperStart || pacsPreset !== "normal" || pacsBrightness !== 100) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCaliperStart(null);
                              setCaliperEnd(null);
                              setMeasurement(null);
                              setPacsPreset("normal");
                              setPacsBrightness(100);
                              setPacsContrast(100);
                            }}
                            className="bg-red-500/20 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5 hover:bg-red-500/30 transition-all font-mono active:scale-95 cursor-pointer"
                          >
                            RESETPACS
                          </button>
                        )}
                      </div>

                      {/* Hover Fullscreen Lightbox Button */}
                      <button 
                        onClick={() => setLightboxOpen(true)}
                        className="absolute top-2 right-2 bg-slate-900/80 border border-white/10 rounded p-1 text-slate-300 hover:text-white hover:bg-slate-950 transition-all z-10 cursor-pointer"
                        title="Focus View / Diagnostic Zoom"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Window Level (Fine tuning) Controls */}
                    <div className="space-y-2.5 bg-[#0D0F14] border border-white/5 p-3 rounded-xl text-left select-none text-[10px]">
                      <div className="flex items-center justify-between text-slate-400 font-sans">
                        <span className="font-bold flex items-center gap-1 uppercase tracking-wider text-[9px]">
                          <Sliders className="w-3 h-3 text-sky-400" />
                          PACS Window Level (W/L) Controls
                        </span>
                        
                        <button
                          onClick={() => setShowAnnotations(!showAnnotations)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all cursor-pointer ${showAnnotations ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500"}`}
                        >
                          {showAnnotations ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          {language === "fr" ? "Repères ON" : "العلامات"}
                        </button>
                      </div>

                      {/* Preset filters matrix */}
                      <div className="grid grid-cols-5 gap-1 text-[8.5px] font-bold font-sans text-center">
                        <button
                          onClick={() => { setPacsPreset("normal"); setPacsBrightness(100); setPacsContrast(100); }}
                          className={`py-1 rounded cursor-pointer transition-all truncate ${pacsPreset === "normal" ? "bg-sky-500/20 text-sky-400 border border-sky-400/20" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                        >
                          NORMAL
                        </button>
                        <button
                          onClick={() => { setPacsPreset("bone"); setPacsContrast(130); }}
                          className={`py-1 rounded cursor-pointer transition-all truncate ${pacsPreset === "bone" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/20 font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                          title="Fenetrage Osseux"
                        >
                          BONE-W
                        </button>
                        <button
                          onClick={() => { setPacsPreset("soft"); setPacsContrast(100); }}
                          className={`py-1 rounded cursor-pointer transition-all truncate ${pacsPreset === "soft" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-400/20 font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                        >
                          SOFTCT
                        </button>
                        <button
                          onClick={() => { setPacsPreset("invert"); }}
                          className={`py-1 rounded cursor-pointer transition-all truncate ${pacsPreset === "invert" ? "bg-pink-500/20 text-pink-400 border border-pink-400/20 font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                        >
                          FILMINV
                        </button>
                        <button
                          onClick={() => { setPacsPreset("thermal"); }}
                          className={`py-1 rounded cursor-pointer transition-all truncate ${pacsPreset === "thermal" ? "bg-amber-500/20 text-amber-400 border border-amber-400/20 font-bold" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                        >
                          WARM
                        </button>
                      </div>

                      {/* Brightness / Contrast detailed Sliders */}
                      <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                        <div className="flex justify-between items-center text-slate-400 text-[9px]">
                          <span>{language === "fr" ? "Luminance (WL) :" : "مستوى السطوع (WL) :"}</span>
                          <span className="font-mono text-sky-400">{pacsBrightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={pacsBrightness}
                          onChange={(e) => setPacsBrightness(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer transition-all"
                        />

                        <div className="flex justify-between items-center text-slate-400 text-[9px]">
                          <span>{language === "fr" ? "Contraste (WW) :" : "مستوى التباين (WW) :"}</span>
                          <span className="font-mono text-sky-400">{pacsContrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={pacsContrast}
                          onChange={(e) => setPacsContrast(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer transition-all"
                        />
                      </div>
                    </div>

                    {/* Metadata specs PACS footer */}
                    <div className="bg-[#121419] p-2.5 rounded-xl border border-white/5 font-mono text-[9px] text-slate-400 space-y-1 text-left select-text">
                      <div className="flex justify-between"><span className="text-slate-500">MODALITY:</span> <span className="text-sky-300 font-bold uppercase">{activeQuestion.medicalImage.modality}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">ANATOMY:</span> <span className="text-slate-200 uppercase">{activeQuestion.medicalImage.anatomy}</span></div>
                      <div className="flex justify-between gap-1"><span className="text-slate-500">TECHNICAL:</span> <span className="text-emerald-400 uppercase font-semibold text-right truncate">{activeQuestion.medicalImage.technicalParameters}</span></div>
                    </div>
                  </div>
                )}

                {/* 2B. Right Column - Active Question & Answer forms */}
                <div className={`${activeQuestion?.medicalImage ? "xl:col-span-7 col-span-12" : "xl:col-span-12 col-span-12"} flex flex-col gap-5 justify-between`}>
                  
                  {/* Dynamic interactive speech panel */}
                  <div className="flex-1 glass rounded-2xl p-6 md:p-8 flex flex-col justify-center items-center text-center gap-4 border border-white/5 relative min-h-[160px]">
                    {isLoadingQuestion ? (
                      <div className="flex flex-col items-center py-4">
                        <span className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-xs text-slate-500 font-bold mt-2 tracking-widest uppercase font-sans">
                          {language === "fr" ? "CONVERSATION AI EN COURS..." : language === "ar" ? "المستشار الذكي يطرح السؤال..." : "JURY CHAIR PROMPTING..."}
                        </p>
                      </div>
                    ) : activeQuestion ? (
                      <div className="space-y-4 w-full">
                        {/* Audio wave effects during Synthesizing */}
                        <div className="flex items-center justify-center gap-1.5 h-6">
                          <div className="waveform-bar" style={{ animationDelay: "0s", animationPlayState: isSynthesizing ? "running" : "paused" }} />
                          <div className="waveform-bar" style={{ animationDelay: "0.2s", animationPlayState: isSynthesizing ? "running" : "paused" }} />
                          <div className="waveform-bar" style={{ animationDelay: "0.4s", animationPlayState: isSynthesizing ? "running" : "paused" }} />
                          <div className="waveform-bar" style={{ animationDelay: "0.1s", animationPlayState: isSynthesizing ? "running" : "paused" }} />
                          <div className="waveform-bar" style={{ animationDelay: "0.5s", animationPlayState: isSynthesizing ? "running" : "paused" }} />
                          <div className="waveform-bar" style={{ animationDelay: "0.3s", animationPlayState: isSynthesizing ? "running" : "paused" }} />
                        </div>

                        <div className="flex justify-center flex-wrap gap-2 text-[10px] font-sans font-sans">
                          <span className="px-2 py-0.5 bg-[#12141C] text-slate-400 border border-white/5 rounded font-sans">
                            {language === "fr" ? "THÈME EXIGÉ :" : language === "ar" ? "محور الفيزياء :" : "RADIOLOGY TARGET :"} {activeQuestion.topic}
                          </span>
                          {activeQuestion?.medicalImage && (
                            <span className="px-2 py-0.5 bg-sky-500/15 text-sky-400 border border-sky-500/20 rounded font-mono font-bold animate-pulse">
                              📸 {language === "fr" ? "IMAGERIE ACTIVE" : "صورة فحص مرافقة"}
                            </span>
                          )}
                          <button 
                            onClick={() => voiceSpeakText(activeQuestion.introduction + ". " + activeQuestion.question)}
                            className="text-[10px] px-2 py-0.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/10 rounded cursor-pointer font-sans"
                            title="Répéter la question vocalement"
                          >
                            🔊 {language === "fr" ? "ÉCOUTER" : language === "ar" ? "استماع" : "LISTEN"}
                          </button>
                        </div>

                        <p className={`text-sm md:text-base font-medium text-slate-200 italic leading-relaxed max-w-xl mx-auto ${language === "ar" ? "text-rtl" : "text-ltr"}`}>
                          "{activeQuestion.question}"
                        </p>

                        {/* Subtle micro guidance advice toggle */}
                        <div className="bg-[#090A0E] text-[11px] hover:text-slate-300 transition-all text-slate-500 p-3 rounded-lg border border-white/5 inline-block max-w-md mx-auto leading-relaxed text-left md:text-center">
                          <span className="font-bold text-slate-400 font-sans">💡 {language === "fr" ? "Indice de l'examinateur :" : "الملخص الإرشادي للإجابة :"}</span> {activeQuestion.guidanceTip}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-sans">
                        {language === "fr" ? "Chargement des examinateurs..." : "جاري استدعاء الممتحنين للوقوف..."}
                      </p>
                    )}
                  </div>

                  {/* 3. Detailed feedback evaluation analysis cards block */}
                  <AnimatePresence mode="wait font-sans">
                    {isEvaluating && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-[#0F1117] border border-white/10 rounded-2xl flex items-center justify-center gap-3"
                      >
                        <span className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                        <span className="text-xs text-sky-400 font-semibold tracking-wider uppercase font-sans">
                          {language === "fr" ? "VOTRE RÉPONSE SCIENTIFIQUE EST EXAMINÉE..." : language === "ar" ? "جاري تقييم دقة القياسات الطبية والأسلوب..." : "EVALUATING CLINICAL RESPONSE INTEGRITY..."}
                        </span>
                      </motion.div>
                    )}

                    {lastEvaluation && !isEvaluating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#12141C] border border-white/5 p-5 rounded-2xl space-y-3.5 text-left"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
                            <h4 className="font-bold text-xs text-slate-200">
                              {language === "fr" ? "Rétroaction constructive du Jury" : language === "ar" ? "تقييم الإجابة والملاحظة العلمية للجنة" : "Jury Scientific Evaluation"}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold font-mono">
                              {language === "fr" ? "CONFIANCE :" : "مستوى الثقة :"} {lastEvaluation.confidenceLevel}
                            </span>
                            <div className="bg-emerald-500/10 border border-emerald-555/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">
                              {lastEvaluation.score} / 5
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400 font-sans">
                          <div className="bg-[#0A0B0E] p-2.5 rounded-lg border border-white/5">
                            <span className="font-extrabold text-sky-400 block mb-1">🔬 {language === "fr" ? "Précision Médicale" : "الدقة العلمية :"} {lastEvaluation.scientificAccuracy?.score || 4}/5</span>
                            <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400">{lastEvaluation.scientificAccuracy?.critique}</p>
                          </div>
                          <div className="bg-[#0A0B0E] p-2.5 rounded-lg border border-white/5">
                            <span className="font-extrabold text-emerald-400 block mb-1">⚙️ {language === "fr" ? "Paramètres Physiques" : "الفيزياء والمعايير :"} {lastEvaluation.technicalKnowledge?.score || 4}/5</span>
                            <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400">{lastEvaluation.technicalKnowledge?.critique}</p>
                          </div>
                          <div className="bg-[#0A0B0E] p-2.5 rounded-lg border border-white/5">
                            <span className="font-extrabold text-amber-500 block mb-1">🗣️ {language === "fr" ? "Aisance Orale" : "طريقة الإلقاء :"} {lastEvaluation.communicationSkills?.score || 4}/5</span>
                            <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-400">{lastEvaluation.communicationSkills?.critique}</p>
                          </div>
                        </div>

                        <p className={`text-xs text-slate-300 leading-relaxed bg-[#0A0B0E]/50 p-3 rounded-lg border border-white/5 ${language === "ar" ? "text-rtl" : "text-ltr"}`}>
                          {lastEvaluation.feedback}
                        </p>

                        {lastEvaluation.idealPoints && (
                          <div className="pt-1.5 flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">{language === "fr" ? "Mots-clés requis :" : "الكلمات المفتاحية المطلوبة :"}</span>
                            {lastEvaluation.idealPoints.map((p: string, i: number) => (
                              <span key={i} className="bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded text-[10px] italic">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 4. Active Recording and text entry answer forms */}
                  <div className="mt-2 text-sans">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={studentAnswer}
                          onChange={(e) => setStudentAnswer(e.target.value)}
                          placeholder={
                            isRecording ? (language === "fr" ? "Écoute active en cours... Parlez clairement." : "جاري الاستماع... يرجى التحدث في الميكروفون بوضوح.") :
                            lastEvaluation ? (language === "fr" ? "Évaluation terminée. Poursuivez ci-dessous." : "يرجى الضغط على التالي للمتابعة.") :
                            (language === "fr" ? "Saisissez ou parlez au micro pour formuler votre réponse clinique..." : "اكتب إجابتك هنا أو انقر على زر الميكروفون للإملاء الصوتي...")
                          }
                          disabled={isEvaluating || !!lastEvaluation}
                          className="w-full bg-[#12141C] text-slate-100 border border-white/10 rounded-full py-4 px-6 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none focus:border-sky-500/50 font-sans"
                        />

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {isRecording && (
                            <>
                              <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-mono">RECORDING</span>
                              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Speech Activation Button */}
                      {!lastEvaluation && (
                        <button 
                          onClick={handleToggleRecord}
                          disabled={isEvaluating}
                          title={language === "fr" ? "Répondre par voix (Micro)" : "تحدث بصوتك (تنشيط الميكروفون)"}
                          className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-150 shrink-0 ${isRecording ? "bg-red-600 animate-pulse" : "bg-sky-500 hover:bg-sky-600 text-white"}`}
                        >
                          {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                        </button>
                      )}

                      {/* Submission triggers */}
                      {!lastEvaluation ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={isEvaluating || !studentAnswer}
                          className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white text-xs font-bold font-sans tracking-wider uppercase px-5 py-3.5 rounded-xl transition-all h-12 shrink-0 font-sans"
                        >
                          {language === "fr" ? "Soumettre" : "موافق"}
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold font-sans tracking-widest uppercase px-6 py-3.5 rounded-xl transition-all h-12 shrink-0 accent-glow flex items-center gap-1.5"
                        >
                          <span>
                            {session.currentQuestionIndex + 1 < session.questionsCount ? 
                              (language === "fr" ? "Question Suivante" : "السؤال التالي") : 
                              (language === "fr" ? "Délibérer" : "بدء المداولة النهائية")
                            }
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </section>

        {/* 4. Right Side Assessment Indicators */}
        <aside className="w-full lg:w-80 border-l border-white/5 bg-[#0F1117] p-5 flex flex-col gap-6 text-left" style={{ direction: "ltr" }}>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">
              {language === "fr" ? "Indicateurs en Temps Réel" : "تقييم الرصد التراكمي"}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-2xl font-black text-sky-400">
                  {session.history.length > 0 ? 
                    (session.history.reduce((a,c) => a + c.evaluationScore, 0) / session.history.length).toFixed(1) : 
                    "0.0"
                  }
                  <span className="text-[10px] text-slate-500 font-bold">/5</span>
                </p>
                <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider mt-1">{language === "fr" ? "Précision" : "مستوى الإنجاز"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-2xl font-black text-emerald-400">
                  {session.history.length > 0 ? 
                    `${Math.round((session.history.filter(h => h.evaluationScore >= 4).length / session.history.length) * 100)}` : 
                    "0"
                  }
                  <span className="text-[10px] text-slate-500 font-bold">%</span>
                </p>
                <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider mt-1">{language === "fr" ? "Confiance" : "معدل الرضا"}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">
              {language === "fr" ? "Niveau des Compétences" : "هرم المهارات والمعايير"}
            </label>

            {/* Simulated progress meters */}
            <div className="space-y-4 font-sans">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-slate-400">{language === "fr" ? "Rigueur Méthodologique" : "المنهجية العلمية"}</span>
                  <span className="text-slate-200">
                    {session.history.length > 0 ? `${Math.round((session.history.reduce((a,c) => a + (c.ratings?.scientificAccuracy || 4), 0)/(session.history.length*5))*100)}%` : "0%"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-300" 
                    style={{ width: `${session.history.length > 0 ? (session.history.reduce((a,c) => a + (c.ratings?.scientificAccuracy || 4), 0)/(session.history.length*5))*100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-slate-400">{language === "fr" ? "Physique de l'Imagerie" : "معرفة فيزياء الأجهزة"}</span>
                  <span className="text-slate-200">
                    {session.history.length > 0 ? `${Math.round((session.history.reduce((a,c) => a + (c.ratings?.technicalKnowledge || 4), 0)/(session.history.length*5))*100)}%` : "0%"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                    style={{ width: `${session.history.length > 0 ? (session.history.reduce((a,c) => a + (c.ratings?.technicalKnowledge || 4), 0)/(session.history.length*5))*100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-slate-400">{language === "fr" ? "Communication Orale" : "مهارة التواصل والإلقاء"}</span>
                  <span className="text-slate-200">
                    {session.history.length > 0 ? `${Math.round((session.history.reduce((a,c) => a + (c.ratings?.communicationSkills || 4), 0)/(session.history.length*5))*100)}%` : "0%"}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                    style={{ width: `${session.history.length > 0 ? (session.history.reduce((a,c) => a + (c.ratings?.communicationSkills || 4), 0)/(session.history.length*5))*100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Context instructions hint card */}
            <div className="mt-8 p-4 rounded-xl bg-sky-500/5 border border-sky-400/10 mb-2">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-405 text-sky-450 text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[10px] font-bold text-sky-450 text-sky-400 uppercase tracking-widest">
                    {language === "fr" ? "CONSEILS PRATIQUES" : "تلميح ذكي للجنة"}
                  </h4>
                  <p className="text-[10px] text-slate-450 text-slate-400 leading-normal mt-1">
                    {language === "fr" ? "Nos examinateurs s'attendent à des termes de haute technicité (ex: kVP, TR, TE, Gradients multi-antennes, doses mGy/cm, ALARA)." :
                     language === "ar" ? "أشر دوماً لأهمية معامل ALARA وضبط الكاشفات والدراسة الراجعة المشتملة للتأثيرات ثنائية الصدد." :
                     "Use detailed physical metric units in your responses to capture high board review percentages."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 5. Footer with specs */}
      <footer className="h-11 border-t border-white/5 bg-[#0F1117] flex items-center justify-between px-6 text-[9px] text-slate-500 font-mono tracking-wider">
        <div className="flex gap-4 md:gap-8">
          <span>TRIBUNAL_ID: {session.id}</span>
          <span className="hidden md:inline">SYSTEM: MED-VIRT-TRANSCRIPTER_V2</span>
        </div>
        <div className="flex gap-4">
          <span>PERSISTENCE: OFFLINE_FIRST (LOCAL)</span>
          <span className="text-sky-400 font-bold uppercase select-none">RADIOLOGY ACADEMY OF IMAGING TECHNICIANS</span>
        </div>
      </footer>

    </div>
  );
}
