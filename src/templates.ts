import { Thesis, QuizQuestion } from "./types";

export const THESIS_TEMPLATES: Thesis[] = [
  {
    id: "temp-mammo-ai",
    title: "L'apport de l'Intelligence Artificielle dans l'aide au diagnostic précoce des cancers du sein en mammographie numérique de dépistage",
    abstract: "Ce travail évalue les performances d'un algorithme de deep learning intégré au flux de travail de la mammographie de dépistage par rapport au double lecteur humain pour la détection précoce du cancer du sein.",
    objectives: [
      "Mesurer la sensibilité et la spécificité de l'algorithme d'IA par rapport aux radiologues seniors.",
      "Évaluer le gain de temps moyen par dossier médical examiné.",
      "Déterminer le taux de réduction des faux positifs et de faux négatifs en double lecture assistée."
    ],
    methodology: "Étude rétrospective sur 1 200 patientes âgées de 45 à 70 ans ayant bénéficié d'une mammographie numérique bilatérale (face et oblique externe). L'algorithme d'IA commercial d'aide au diagnostic a été appliqué sur tous les clichés d'architecture standard. Les concordances cliniques ont été vérifiées par biopsie histologique.",
    results: "L'IA a détecté 94.2% des cancers histologiquement prouvés, contre 88.5% pour le premier lecteur radiologue seul. La combinaison Radiologue + IA a réduit les faux positifs de 15.6% et a diminué le temps moyen d'interprétation de 20% par dossier complexe.",
    conclusions: "L'évaluation démontre que l'IA constitue une seconde lecture fiable et autonome, augmentant la confiance diagnostique et optimisant l'organisation du service d'imagerie sénologique.",
    references: [
      "Lassalle L., et al. (2024). AI Screening in Mammography standardizations. Journal de Radiologie Diagnostique, 45(2), 112-120.",
      "Durand M. & Dupont J. (2023). Deep Learning algorithms for breast cancer evaluation. European Medical Imaging Review, 78(1), 34-42.",
      "Société Française de Radiologie (SFR). Recommandations pour le dépistage organisé du cancer du sein (2025)."
    ],
    keywords: ["Mammographie", "Intelligence Artificielle", "Cancer du Sein", "Aide au Diagnostic", "Dépistage Organisé"],
    language: "fr",
    createdAt: new Date().toISOString()
  },
  {
    id: "temp-pediatric-ct",
    title: "تحسين الجرعة الإشعاعية في فحوصات الأشعة المقطعية للأطفال باستخدام بروتوكولات ضبط الجرعة التلقائية (Dose-reduction in Pediatric CT Scanner)",
    abstract: "دراسة شاملة تهدف إلى تقييم كفاءة تقنيات النمذجة التلقائية للتيار الكهربائي وأنظمة معالجة البيانات التكرارية في خفض الجرعة الإشعاعية الممتصة من قبل الأطفال الخاضعين لفحص الأشعة المقطعية للدماغ والبطن دون المساس بالجودة التشخيصية للصورة.",
    objectives: [
      "تحديد معدل الخفض الفعلي في الجرعة الممتصة (DLP & CTDIvol) عند استخدام بروتوكولات مخصصة للأطفال.",
      "تقييم جودة الصورة التشخيصية عبر قياس نسبة الإشارة إلى الضوضاء (SNR).",
      "وضع دليل إرشادي عملي لفنيي الأشعة لضبط معاملات الفحص بناءً على وزن وعمر الطفل."
    ],
    methodology: "شملت الدراسة 350 فحصًا مقطعيًا لدماغ وصدر وبطن الأطفال (تتراوح أعمارهم بين 0 و15 سنة) باستخدام جهاز تصوير مقطعي متعدد الكواشف (MDCT). تم تطبيق نظام تحوير تيار الأنبوب التلقائي (ATCM) إلى جانب تقنية إعادة البناء التكراري (ASIR) بنسب متفاوتة والمقارنة بالقيم المرجعية الوطنية.",
    results: "سجلت النتائج انخفاضًا ملحوظًا في الجرعة الإشعاعية بنسبة تراوحت بين 30% إلى 45% (DLP متدني بشكل واضح) مع الحفاظ على مستويات تباين تشخيصي كاملة وهيكل تشريحي خالي من التشويه الفني للجرعة المنخفضة.",
    conclusions: "تطبيق مبدأ ALARA من خلال بروتوكولات مخصصة للأطفال ليس فقط خيارًا تقنيًا بل ضرورة ملحة؛ النمذجة وإعادة البناء التكراري يحققان الموازنة المطلوبة بين تقليل المخاطر الإشعاعية وتحقيق الكفاءة التشخيصية العالية.",
    references: [
      "الجمعية الدولية للوقاية من الإشعاع (IRPA) - إرشادات التصوير عند الأطفال (2024).",
      "Smith J., et al. (2023). Adaptive Statistical Iterative Reconstruction in pediatric oncology. Pediatric Radiology Today, 12(4), 89-101.",
      "World Health Organization (WHO). Radiation Protection in Children's Imaging (2025)."
    ],
    keywords: ["الأشعة المقطعية للأطفال", "الوقاية من الإشعاع", "تحوير التيار التلقائي", "جودة الصورة وصوتها", "مبدأ ALARA"],
    language: "ar",
    createdAt: new Date().toISOString()
  },
  {
    id: "temp-mri-ms",
    title: "Optimizing 3T MRI Protocols for Active Demyelinating Plaque Detection in Multiple Sclerosis Patients",
    abstract: "This medical investigation evaluates the optimal parameters for Fluid-Attenuated Inversion Recovery (FLAIR) and Phase-Sensitive Inversion Recovery (PSIR) sequences at 3 Tesla magnetic strength, to visualize active demyelination plaques with higher resolution.",
    objectives: [
      "Compare the lesion-to-brain contrast ratio between standard 1.5T and advanced 3T magnetic fields.",
      "Evaluate the specificity of PSIR versus FLAIR for cortical and juxtacortical lesion identification.",
      "Formulate standardized imaging technicians’ workflow rules for scanning patients under active MS flares."
    ],
    methodology: "A prospective analysis conducted on 85 clinical patients diagnosed with Relapsing-Remitting Multiple Sclerosis (RRMS). Scanning was performed on a 3T clinical MRI unit. Standard axial FLAIR, 3D DIR, and 2D PSIR sequences were acquired. Contrast enhancement was evaluated 10 minutes post administration of Gadolinium contrast.",
    results: "The 3D PSIR sequence at 3T detected 34% more subtle cortical/juxtacortical plaques compared to standard 3D FLAIR alone. The temporal resolution protocol was optimized by shortening TR/TE targets while maintaining excellent signal-to-noise ratios (SNR), cutting down the final exam time by 4.5 minutes.",
    conclusions: "High-field 3T MRI utilizing a combined FLAIR-PSIR protocol provides superior visualization of critical demyelinating changes. Modern radiology technicians must strictly apply these sequence standards to secure early patient therapeutic evaluation.",
    references: [
      "Miller DH., et al. (2024). MRI monitoring of active Multiple Sclerosis. Lancet Neurology Practice, 23(3), 180-192.",
      "Kaufmann A. & Schmidt R. (2023). Juxtacortical lesion characterization at 3 Tesla. Magnetic Resonance in Medicine quarterly, 56(1), 12-25.",
      "Consortium of MS Centers (CMSC). Modified MRI Guidelines for MS Diagnosis (2025)."
    ],
    keywords: ["Multiple Sclerosis", "3T MRI Magnet", "FLAIR Sequence", "Cortical Plaques", "Signal-to-Noise Ratio"],
    language: "en",
    createdAt: new Date().toISOString()
  }
];

export const RADIOLOGY_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Radiography (Radiographie Standard)
  {
    id: "rq-1",
    category: "Radiography",
    level: "Beginner",
    questionText: "Quelle est l'incidence de référence pour rechercher un épanchement pleural liquide de faible abondance ?",
    options: [
      "Le cliché de thorax face en décubitus dorsal (face au lit)",
      "Le cliché en décubitus latéral avec rayon horizontal (décubitus latéral gauche ou droit)",
      "Le cliché de thorax en incidence oblique antérieure gauche",
      "Le cliché de thorax face en expiration forcée"
    ],
    correctIndex: 1,
    explanation: "Le cliché en décubitus latéral avec rayon horizontal (d'après Moulay/Muller) permet de visualiser le liquide qui migre sous l'effet de la pesanteur le long de la paroi externe sous forme d'une ligne dense bordante."
  },
  {
    id: "rq-2",
    category: "Radiography",
    level: "Intermediate",
    questionText: "Quel est l'effet de l'augmentation de la distance foyer-film (DFF) sur la netteté géométrique de l'image radiologique ?",
    options: [
      "Elle diminue la netteté en élargissant le flou géométrique",
      "Elle augmente la netteté en réduisant la pénombre géométrique",
      "Elle n'a aucune influence sur la résolution spatiale",
      "Elle augmente le grandissement de l'image de façon aberrante"
    ],
    correctIndex: 1,
    explanation: "Augmenter la distance foyer-film (DFF) réduit l'angle de divergence des rayons X frappant le récepteur, ce qui diminue la pénombre géométrique de l'objet et augmente la netteté (résolution)."
  },
  {
    id: "rq-3",
    category: "Radiation Protection",
    level: "Beginner",
    questionText: "Quelle est la limite de dose efficace réglementaire annuelle pour le public en matière d'exposition aux rayonnements ionisants ?",
    options: [
      "1 mSv / an",
      "20 mSv / an",
      "50 mSv / an",
      "5 mSv / an"
    ],
    correctIndex: 0,
    explanation: "Selon les directives nationales et de l'AIEA/CIPR, la limite de dose efficace annuelle pour les membres du public est fixée à 1 mSv. Pour les travailleurs exposés (catégorie A), elle est de 20 mSv/an."
  },
  {
    id: "rq-4",
    category: "CT Scanner",
    level: "Intermediate",
    questionText: "Dans un examen tomodensitométrique (CT Scanner), qu'indique un 'pitch' (pas d'hélice) supérieur à 1 ?",
    options: [
      "Qu'il y a un recouvrement des coupes, entraînant une dose plus élevée pour le patient",
      "Que la table progresse d'une distance supérieure à la collimation totale du faisceau par rotation",
      "Que l'épaisseur de coupe reconstruite est plus petite que la taille des détecteurs",
      "Que la rotation du tube est ralentie pour augmenter le signal"
    ],
    correctIndex: 1,
    explanation: "Un pitch > 1 signifie que la table se déplace d'une distance supérieure à la largeur du faisceau de rayons X par rotation. Cela accélère l'acquisition clinique et réduit la dose délivrée aux dépens d'une légère baisse de la résolution temporelle/axiale."
  },
  {
    id: "rq-5",
    category: "MRI",
    level: "Advanced",
    questionText: "Quelle constante caractérise le temps mis par le spin des protons hydrogènes pour récupérer 63% de leur magnétisation longitudinale originelle ?",
    options: [
      "La relaxation transversale T2",
      "L'Inversion Recovery (IR)",
      "La constante de relaxation longitudinale T1",
      "Le temps d'écho (TE)"
    ],
    correctIndex: 2,
    explanation: "La courbe de relaxation longitudinale correspond au phénomène thermique d'interaction spin-réseau, dont la constante de temps T1 définit la repousse de la magnétisation de 63% par rapport à l'état d'équilibre thermique."
  },
  {
    id: "rq-6",
    category: "Radiation Protection",
    level: "Expert",
    questionText: "En dosimétrie CT, quel paramètre exprime l'énergie totale délivrée au patient tout au long de la longueur du balayage anatomique ?",
    options: [
      "CTDIvol (Computed Tomography Dose Index volumique)",
      "Le Produit Dose-Longueur (DLP/PDL) exprimé en mGy.cm",
      "La Dose Entrée de Surface (DES)",
      "Le Kerma de l'air de référence"
    ],
    correctIndex: 1,
    explanation: "Le DLP (Dose-Length Product) exprime la dose cumulée sur la trajectoire totale du scan : DLP = CTDIvol x Longueur de coupe balayée (exprimé en mGy.cm)."
  },
  {
    id: "rq-7",
    category: "MRI",
    level: "Expert",
    questionText: "Comment l'utilisation d'une antenne en réseau phasé (Phased-Array) modifie-t-elle les paramètres d'imagerie en IRM ?",
    options: [
      "Elle diminue la résolution spatiale globale en augmentant le temps d'acquisition",
      "Elle améliore de façon substantielle le rapport signal/sur-bruit (RSB) et permet l'imagerie parallèle (facteur d'accélération R)",
      "Elle nécessite impérativement une diminution de l'intensité du champ magnétique",
      "Elle désactive automatiquement la protection SAR et engendre de hautes températures"
    ],
    correctIndex: 1,
    explanation: "Les antennes multi-éléments ou réseaux phasés disposent de canaux récepteurs individuels. Cela permet de collecter un signal d'une sensibilité locale remarquable (haut rapport RSB) et supporte les encodages parallèles (comme SENSE ou GRAPPA) pour réduire le temps de scan."
  },
  {
    id: "rq-8",
    category: "Ultrasound",
    level: "Intermediate",
    questionText: "Quel artefact acoustique est typiquement observé en arrière d'une structure fortement atténuante comme un calcul biliaire calcifié ?",
    options: [
      "Le renforcement acoustique postérieur (enhancement)",
      "L'artefact de miroir pulmonaire",
      "Le cône d'ombre postérieur net (shadowing)",
      "La réverbération métallique en queue de comète"
    ],
    correctIndex: 2,
    explanation: "Les structures hautement absorbantes ou réfléchissantes comme les calcifications ne laissent pas filtrer le faisceau d'ultrasons. En conséquence, la zone située directement en arrière apparaît anéchogène, formant un cône d'ombre postérieur."
  }
];
