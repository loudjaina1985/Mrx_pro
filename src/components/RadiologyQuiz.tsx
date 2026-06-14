import React, { useState } from "react";
import { RADIOLOGY_QUIZ_QUESTIONS } from "../templates";
import { QuizQuestion, QuizSession } from "../types";
import { 
  Award, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Bookmark, 
  Compass, 
  Dna,
  ShieldAlert,
  Terminal,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RadiologyQuizProps {
  language: "fr" | "ar" | "en";
}

export default function RadiologyQuiz({ language }: RadiologyQuizProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });

  // Categories list
  const categories = ["All", "Radiography", "CT Scanner", "MRI", "Ultrasound", "Radiation Protection"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];

  // Filter questions
  const filteredQuestions = RADIOLOGY_QUIZ_QUESTIONS.filter(q => {
    const matchCat = selectedCategory === "All" || q.category === selectedCategory || (selectedCategory === "Radiation Protection" && q.category === "Radiation Protection");
    const matchLevel = selectedLevel === "All" || q.level === selectedLevel;
    return matchCat && matchLevel;
  });

  const currentQuestion: QuizQuestion | undefined = filteredQuestions[currentIdx];

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswered || !currentQuestion) return;
    setIsAnswered(true);
    
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentIdx + 1 < filteredQuestions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed, reset list or reset index
      setCurrentIdx(0);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizScore({ correct: 0, total: 0 });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      
      {/* 1. Filter Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-[#0F1117] p-4 rounded-xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block ml-1">
            {language === "fr" ? "Discipline d'Imagerie :" : "مجال الفحص والموضوع :"}
          </span>
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); setSelectedAnswer(null); setIsAnswered(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedCategory === cat ? "bg-sky-500/20 text-sky-400 border border-sky-400/30" : "bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block ml-1">
            {language === "fr" ? "Complexité :" : "مستوى الصعوبة :"}
          </span>
          <div className="flex gap-1">
            {levels.map(lvl => (
              <button
                key={lvl}
                onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); setSelectedAnswer(null); setIsAnswered(false); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedLevel === lvl ? "bg-amber-500/20 text-amber-400 border border-amber-400/30" : "bg-white/5 text-slate-400 hover:text-slate-300 border border-transparent"}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Core Quiz Module */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {filteredQuestions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-8 text-center border border-white/5"
              >
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">
                  {language === "fr" ? "Aucune question disponible pour ces paramètres" : "لا توجد أسئلة تطابق هذه التصفية حالياً"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === "fr" ? "Veuillez modifier les filtres ci-dessus pour accéder à d'autres cas." : "يرجى تعديل معيار التصفية للحصول على أسئلة أخرى."}
                </p>
                <button 
                  onClick={() => { setSelectedCategory("All"); setSelectedLevel("All"); }}
                  className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {language === "fr" ? "Réinitialiser" : "إعادة تعيين المرشحات"}
                </button>
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl p-6 md:p-8 border border-white/5 flex flex-col justify-between"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#12141C] text-sky-400 border border-sky-400/20 rounded">
                      {currentQuestion.category}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded">
                      {currentQuestion.level}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                     {currentIdx + 1} / {filteredQuestions.length}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-base md:text-lg font-bold text-slate-100 leading-snug mb-6 text-left">
                  {currentQuestion.questionText}
                </h3>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === currentQuestion.correctIndex;
                    
                    let cardStyle = "border-white/5 bg-[#12141C] hover:border-white/15 text-slate-300";
                    if (isSelected) {
                      cardStyle = "border-sky-500 bg-sky-500/5 text-sky-300";
                    }
                    if (isAnswered) {
                      if (isCorrectOption) {
                        cardStyle = "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-semibold";
                      } else if (isSelected) {
                        cardStyle = "border-rose-500 bg-rose-500/5 text-rose-450 text-rose-400";
                      } else {
                        cardStyle = "border-white/5 bg-transparent opacity-40 text-slate-400";
                      }
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`p-4 rounded-xl border text-xs md:text-sm text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${cardStyle}`}
                      >
                        <span>{option}</span>
                        {isAnswered && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isAnswered && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback Panel */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 bg-[#12141C] p-4 rounded-xl border border-white/5 text-left"
                    >
                      <h4 className="text-xs font-bold text-sky-455 text-sky-400 mb-1 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4" />
                        {language === "fr" ? "Justification & Analyse d'Imagerie" : "التعليل الفيزيائي والسريري :"}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Confirm / Continue Button */}
                <div className="mt-8 flex justify-between gap-4">
                  <button
                    onClick={handleResetQuiz}
                    className="px-4 py-2 bg-white/5 text-slate-400 border border-white/10 rounded-lg text-xs font-bold hover:text-white transition-all cursor-pointer"
                  >
                    {language === "fr" ? "Recommencer" : "إعادة المحاولة مجدداً"}
                  </button>

                  {!isAnswered ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer accent-glow"
                    >
                      {language === "fr" ? "Vérifier la réponse" : "تأكيد الإجابة والتحليل"}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-neutral-100 text-neutral-900 border border-transparent rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-1 bg-sky-450 hover:bg-sky-600 text-white bg-sky-500"
                    >
                      <span>
                        {currentIdx + 1 < filteredQuestions.length ? (language === "fr" ? "Question Suivante" : "السؤال التالي") : (language === "fr" ? "Terminer le cycle" : "إنهاء السلسلة والمراجعة")}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 2. Side Panel Performance Meter */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass p-5 rounded-2xl border border-white/5 text-left">
            <h4 className="text-xs font-bold text-slate-405 text-slate-100 uppercase tracking-widest mb-3">
              {language === "fr" ? "Séances de Certification" : "لوحة نتائج التقييم"}
            </h4>

            <div className="text-center py-4 bg-[#12141C] border border-white/5 rounded-xl mb-4">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">{language === "fr" ? "RÉPONSES VALIDES" : "درجة الإجابة الصحيحة"}</span>
              <span className="text-3xl font-black text-emerald-400">{quizScore.correct}</span>
              <span className="text-xs text-slate-500 font-bold"> / {quizScore.total}</span>
            </div>

            <div className="space-y-3 font-sans mt-2 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>{language === "fr" ? "Précision d'évaluation :" : "معدل النجاح الكلي :"}</span>
                <span className="font-bold text-slate-200">
                  {quizScore.total > 0 ? `${Math.round((quizScore.correct / quizScore.total) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all" 
                  style={{ width: `${quizScore.total > 0 ? (quizScore.correct / quizScore.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/5 text-left">
            <h4 className="text-xs font-bold text-sky-405 text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              {language === "fr" ? "Fiches de Révision" : "بطاقات مراجعة سريعة"}
            </h4>

            <div className="space-y-3 text-[11px] text-slate-350">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg leading-relaxed">
                <span className="font-bold text-slate-300 block mb-1">💡 CR/DR (Radio Standard)</span>
                Agrandissement = d (Foyer - Film) / d (Foyer - Objet). Augmenter le foyer-film limite le flou géométrique.
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg leading-relaxed">
                <span className="font-bold text-slate-300 block mb-1">☢️ Dose Limite de Public</span>
                1 mSv par an est le maximum réglementaire pour la sécurité du public exposé aux rayonnements diffusés.
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
