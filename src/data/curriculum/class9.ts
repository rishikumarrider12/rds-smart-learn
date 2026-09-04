import { ClassSyllabus } from '../../types';

export const CLASS_9_SYLLABUS: ClassSyllabus = {
  classLevel: 'Class 9',
  academicBoard: 'Telangana State Board (SCERT)',
  curriculumVersion: 'TS-SCERT-2024-25',
  academicYear: '2024-2025',
  sourceAuthority: 'State Council of Educational Research and Training (SCERT), Telangana',
  sourceReference: 'Government of Telangana School Education Department & SCERT Textbooks',
  subjects: [
    {
      id: 'c9-tel',
      name: 'Telugu (తెలుగు - ప్రథమ భాష)',
      code: 'TEL-09',
      description: 'సింగిడి-2: ప్రాచీన ప్రబంధ పద్యాలు, ఆధునిక కవితలు, వ్యాసాలు, ఛందస్సు (వృత్తాలు) మరియు సంస్కృత సంధులు.',
      icon: 'Languages',
      accentColor: 'from-pink-500 to-rose-600',
      gradient: 'bg-gradient-to-br from-pink-500/20 via-rose-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 13,
      chapters: [
        {
          id: 'c9-tel-ch1',
          chapterNumber: 1,
          title: 'ధర్మార్జునులు (Dharmarjunulu)',
          description: 'చేమకూర వేంకటకవి విజయవిలాసము కావ్యంలోని ధర్మరాజు, అర్జునుల ఉత్తమ గుణాల వర్ణన.',
          topics: [
            { id: 't-c9-tel-1-1', title: 'ప్రబంధ కవిత్వ శైలి & పద్య రమణీయత', description: 'ధర్మరాజు పాలనా దక్షత, అర్జునుని పరాక్రమ విశేషాలు.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-tel-1-2', title: 'వ్యాకరణం: యణాదేశ & వృద్ధి సంధులు', description: 'సంస్కృత సంధి సూత్రాలు, విభజన మరియు పద ప్రయోగాలు.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-tel-ch2',
          chapterNumber: 2,
          title: 'ప్రేరణ (Prerana - Dr. APJ Abdul Kalam)',
          description: 'ఒక విజేత ఆత్మకథ (Wings of Fire) అనువాదం - కలాం గారి బాల్యం, పట్టుదల మరియు పరిశోధన.',
          topics: [
            { id: 't-c9-tel-2-1', title: 'కలాం గారి విద్యాభ్యాసం & శాస్త్రవేత్త ప్రయాణం', description: 'లక్ష్య సాధన, గురువుల ప్రోత్సాహం మరియు డీఆర్డీవో అనుభవాలు.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-tel-ch3',
          chapterNumber: 3,
          title: 'స్వామి వివేకానంద',
          description: 'చికాగో సర్వమత సమ్మేళనం, భారతీయ సనాతన ధర్మ ఔన్నత్యం మరియు వివేకానందుని ఉపన్యాసాలు.',
          topics: [
            { id: 't-c9-tel-3-1', title: 'యువతకు వివేకానందుని సందేశం & సమాజ సేవ', description: 'ఆత్మవిశ్వాసం, సోదరభావం మరియు జాతీయ పునర్నిర్మాణం.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-tel-ch4',
          chapterNumber: 4,
          title: 'కోర్కె (Korke - కాళోజీ నారాయణరావు)',
          description: 'ప్రజాకవి కాళోజీ గారి తెలంగాణ ప్రజా చైతన్య కవిత మరియు సామాజిక న్యాయ కాంక్ష.',
          topics: [
            { id: 't-c9-tel-4-1', title: 'తెలంగాణ మాండలిక శైలి & ప్రజల హక్కులు', description: 'అన్యాయాలను ఎదిరించే ధైర్యం, కవిత్వంలో సూటిదనం.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-tel-ch5',
          chapterNumber: 5,
          title: 'శతక మధురిమ',
          description: 'సర్వజ్ఞ, వేణుగోపాల, భాస్కర శతకాల లోకోక్తులు, పద్యాలు మరియు ఛందస్సు (ఉత్పలమాల, చంపకమాల).',
          topics: [
            { id: 't-c9-tel-5-1', title: 'వృత్త పద్యాలు (ఉత్పలమాల, చంపకమాల, శార్దూలము, మత్తేభము)', description: 'గణ విభజన (భ-ర-న-భ-భ-ర-వ, న-జ-భ-జ-జ-జ-ర), యతిస్థానాలు.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        }
      ]
    },
    {
      id: 'c9-hin',
      name: 'Hindi (हिंदी - द्वितीय भाषा)',
      code: 'HIN-09',
      description: 'उन्मेष-2 / स्पर्श-1: राष्ट्रीय चेतना, कहानियाँ, पर्यावरण निबंध, समास एवं वाक्य भेद।',
      icon: 'Languages',
      accentColor: 'from-amber-500 to-red-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-red-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c9-hin-ch1',
          chapterNumber: 1,
          title: 'जिस देश में गंगा बहती है (शैलेंद्र)',
          description: 'गीतकार शैलेंद्र - भारत की पावन गंगा संस्कृति, सत्यनिष्ठा, अतिथि सत्कार और शांतिप्रियता।',
          topics: [
            { id: 't-c9-h1-1', title: 'गीत का भावार्थ एवं सांस्कृतिक गौरव', description: 'सत्य, अहिंसा और प्रेम की भारतीय धरोहर।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-h1-2', title: 'समास परिचय (तत्पुरुष, द्वंद्व, द्विगु)', description: 'सामासिक पद विग्रह एवं उदाहरण।', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-hin-ch2',
          chapterNumber: 2,
          title: 'गाने वाली चिड़िया (Gaane Waali Chidiya)',
          description: 'राजा और मेहनतकश किसानों के सुख-दुख को समझने वाली जादुई चिड़िया की कहानी।',
          topics: [
            { id: 't-c9-h2-1', title: 'कहानी सारांश एवं श्रम का सम्मान', description: 'मजदूरों की भलाई और राजा के हृदय परिवर्तन का संदेश।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-hin-ch3',
          chapterNumber: 3,
          title: 'बदले अपनी सोच (युगारत्ना श्रीवास्तव)',
          description: 'संयुक्त राष्ट्र संघ में भारतीय छात्रा युगारत्ना का पर्यावरण संकट पर ऐतिहासिक भाषण।',
          topics: [
            { id: 't-c9-h3-1', title: 'भाषण वाचन एवं जलवायु परिवर्तन', description: 'ग्लोबल वार्मिंग, प्रदूषण नियंत्रण और युवा नेतृत्व।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-hin-ch4',
          chapterNumber: 4,
          title: 'तारे ज़मीं पर (Taare Zameen Par)',
          description: 'डिस्लेक्सिया से जूझते ईशान अवस्थी और शिक्षक रामशंकर निकुंभ का संवेदनशील रिश्ता।',
          topics: [
            { id: 't-c9-h4-1', title: 'विशेष प्रतिभा एवं समावेशी शिक्षा', description: 'प्रत्येक बच्चे की विशिष्ट कला और मनोवैज्ञानिक प्रोत्साहन।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-hin-ch5',
          chapterNumber: 5,
          title: 'बेटी पढ़ाओ देश बढ़ाओ',
          description: 'महिला शिक्षा, समानता, सशक्तिकरण और समाज निर्माण में बेटियों का योगदान।',
          topics: [
            { id: 't-c9-h5-1', title: 'निबंध लेखन एवं महिला सशक्तिकरण', description: 'रूढ़िवादिता का अंत और आधुनिक भारत में नारी शक्ति।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c9-eng',
      name: 'English',
      code: 'ENG-09',
      description: 'Our World through English: Prose, poetry, non-fictional essays, reported speech, clauses, synthesis and discourse.',
      icon: 'BookOpen',
      accentColor: 'from-violet-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 14,
      chapters: [
        {
          id: 'c9-eng-ch1',
          chapterNumber: 1,
          title: 'Humour (The Snake and the Mirror)',
          description: 'Vaikom Muhammad Basheer: A homeopathic doctor’s encounter with a cobra fascinated by its own reflection.',
          topics: [
            { id: 't-c9-e1-1', title: 'Humorous Narrative Reading & Irony', description: 'Vanity, sudden fear and lighthearted escape.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-e1-2', title: 'Grammar: Linkers & Adverbial Clauses', description: 'Subordinating conjunctions (as soon as, no sooner than, when).', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-eng-ch2',
          chapterNumber: 2,
          title: 'Games and Sports (True Height)',
          description: 'Michael Stone: Blind pole vaulter’s Olympic triumph, grit, focus and parental support.',
          topics: [
            { id: 't-c9-e2-1', title: 'Biographical Prose & Athletic Determination', description: 'Overcoming sensory disability to set world records.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-e2-2', title: 'Grammar: Non-finite Clauses (Participles & Infinitives)', description: 'Present/past participles and gerunds usage.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-eng-ch3',
          chapterNumber: 3,
          title: 'School Life (Swami is Expelled from School)',
          description: 'R.K. Narayan: Headmaster’s wrath over strike, Swami’s courageous rebellion against corporal punishment.',
          topics: [
            { id: 't-c9-e3-1', title: 'Story Reading & Child Perspective', description: 'School discipline, childhood fears and empathy.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-eng-ch4',
          chapterNumber: 4,
          title: 'Environment (What is Man Without the Beasts?)',
          description: 'Chief Seattle’s famous speech: Sacredness of the earth, air, rivers and wildlife.',
          topics: [
            { id: 't-c9-e4-1', title: 'Eco-Philosophy & Speech Analysis', description: 'Native American indigenous wisdom and sustainable living.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-eng-ch5',
          chapterNumber: 5,
          title: 'Freedom (A Long Walk to Freedom - Nelson Mandela)',
          description: 'Nelson Mandela’s historic presidential inauguration, fight against Apartheid, and definition of courage.',
          topics: [
            { id: 't-c9-e5-1', title: 'Historical Speech & Anti-Apartheid Struggle', description: 'Triumph of human dignity over institutional racial oppression.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c9-maths',
      name: 'Mathematics',
      code: 'MATH-09',
      description: 'Real numbers, polynomials & factorisation, lines & angles, coordinate geometry, surface areas & volumes, statistics.',
      icon: 'Calculator',
      accentColor: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 16,
      chapters: [
        {
          id: 'c9-math-ch1',
          chapterNumber: 1,
          title: 'Real Numbers',
          description: 'Rational & irrational numbers, representing square roots on number line, laws of exponents, rationalising denominators.',
          topics: [
            { id: 't-c9-m1-1', title: 'Rational Numbers & Decimals', description: 'Terminating vs non-terminating recurring decimals.', estimatedMinutes: 15, difficulty: 'Basic' },
            { id: 't-c9-m1-2', title: 'Irrational Numbers on Number Line', description: 'Representing √2, √3, √5 using Pythagoras theorem.', estimatedMinutes: 20, difficulty: 'Intermediate' },
            { id: 't-c9-m1-3', title: 'Rationalising Denominators', description: 'Surds and conjugate radical simplifications.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-math-ch2',
          chapterNumber: 2,
          title: 'Polynomials and Factorisation',
          description: 'Polynomials in one variable, zeroes, remainder theorem, factor theorem and algebraic identities.',
          topics: [
            { id: 't-c9-m2-1', title: 'Zeroes & Degree of Polynomials', description: 'Monomials, binomials, trinomials and degree classification.', estimatedMinutes: 15, difficulty: 'Basic' },
            { id: 't-c9-m2-2', title: 'Remainder Theorem & Factor Theorem', description: 'Testing divisibility and factorizing cubics.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-m2-3', title: 'Algebraic Identities', description: '(x+y+z)², (x±y)³ and x³+y³+z³-3xyz identities.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c9-math-ch3',
          chapterNumber: 3,
          title: 'Lines and Angles',
          description: 'Pairs of angles, parallel lines and transversal, angle sum property of triangles.',
          topics: [
            { id: 't-c9-m3-1', title: 'Linear Pair & Vertically Opposite Angles', description: 'Axioms and proofs of intersecting straight lines.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-m3-2', title: 'Parallel Lines & Transversal', description: 'Corresponding, alternate interior, and co-interior angles.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-math-ch4',
          chapterNumber: 4,
          title: 'Co-ordinate Geometry & Linear Equations in Two Variables',
          description: 'Cartesian coordinate plane, plotting points (x,y), standard form ax + by + c = 0 and graph plotting.',
          topics: [
            { id: 't-c9-m4-1', title: 'Cartesian Plane, Quadrants & Coordinate Axes', description: 'Abscissa, ordinate and quadrant identification.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-m4-2', title: 'Graph of Linear Equation in Two Variables', description: 'Finding multiple solutions and drawing straight-line graphs.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-math-ch5',
          chapterNumber: 5,
          title: 'Surface Areas and Volumes',
          description: 'Surface areas and volumes of right circular cylinders, cones, spheres, hemispheres and practical applications.',
          topics: [
            { id: 't-c9-m5-1', title: 'Surface Area of Cones, Spheres & Hemispheres', description: 'Curved and total surface area derivation and computation.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-m5-2', title: 'Volume of Right Circular Cones & Spheres', description: 'Solid volume formulas and real-world capacity calculations.', estimatedMinutes: 30, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-math-ch6',
          chapterNumber: 6,
          title: 'Statistics and Probability',
          description: 'Collection of data, grouped frequency distribution, histograms, frequency polygons, empirical probability.',
          topics: [
            { id: 't-c9-m6-1', title: 'Histograms & Frequency Polygons', description: 'Graphical representation of continuous grouped data.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-m6-2', title: 'Empirical Probability P(E) = n(E)/n(S)', description: 'Coin tosses, dice rolls and experimental event frequency.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c9-phy-sci',
      name: 'Physical Science',
      code: 'PHY-09',
      description: 'Motion, laws of motion, gravitation, matter around us, atoms & molecules, chemical reactions, work & energy.',
      icon: 'Atom',
      accentColor: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-500/20 via-indigo-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 14,
      chapters: [
        {
          id: 'c9-phy-ch1',
          chapterNumber: 1,
          title: 'Motion',
          description: 'Distance, displacement, speed, velocity, acceleration, equations of motion (v = u + at, s = ut + ½at², v² - u² = 2as).',
          topics: [
            { id: 't-c9-p1-1', title: 'Speed, Velocity & Acceleration', description: 'Scalar and vector kinematic properties.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-p1-2', title: 'Equations of Motion Derivation & Graphs', description: 'Velocity-time graphs and uniform acceleration equations.', estimatedMinutes: 30, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-phy-ch2',
          chapterNumber: 2,
          title: 'Laws of Motion',
          description: 'Newton’s First Law (inertia), Second Law (F = ma, momentum p = mv), Third Law (action-reaction) and conservation of momentum.',
          topics: [
            { id: 't-c9-p2-1', title: 'Inertia & Newton’s First Law', description: 'Inertia of rest, motion, and direction with practical examples.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-p2-2', title: 'Newton’s Second & Third Laws (F = ma, Action-Reaction)', description: 'Derivation of force equation and rocket propulsion principles.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-p2-3', title: 'Law of Conservation of Linear Momentum', description: 'Recoil of gun, collisions and numerical proofs.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c9-phy-ch3',
          chapterNumber: 3,
          title: 'Gravitation',
          description: 'Universal Law of Gravitation (F = G m1 m2 / r²), acceleration due to gravity (g = 9.8 m/s²), mass vs weight, free fall.',
          topics: [
            { id: 't-c9-p3-1', title: 'Universal Law of Gravitation & Value of G', description: 'Gravitational constant and planetary motion.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-p3-2', title: 'Acceleration Due to Gravity (g) & Free Fall', description: 'Calculations of g on Earth surface vs Moon, weightlessness.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-phy-ch4',
          chapterNumber: 4,
          title: 'Atoms and Molecules',
          description: 'Laws of chemical combination, Dalton’s atomic theory, atomic mass, molecular mass, chemical formulae and mole concept.',
          topics: [
            { id: 't-c9-p4-1', title: 'Law of Conservation of Mass & Definite Proportions', description: 'Lavoisier and Proust experiments.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-p4-2', title: 'Writing Chemical Formulae (Criss-Cross Method)', description: 'Valency, polyatomic ions (SO4²⁻, NO3⁻, CO3²⁻).', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-p4-3', title: 'The Mole Concept & Avogadro Number (6.022 × 10²³)', description: 'Molar mass conversions and stoichiometry calculations.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c9-phy-ch5',
          chapterNumber: 5,
          title: 'Work and Energy',
          description: 'Work done (W = F × s), kinetic energy (KE = ½mv²), potential energy (PE = mgh), Law of Conservation of Energy, power (P = W/t).',
          topics: [
            { id: 't-c9-p5-1', title: 'Kinetic & Potential Energy Formulae', description: 'Mechanical energy conversions and free fall proof.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-p5-2', title: 'Commercial Unit of Electrical Energy (kWh) & Power', description: 'Watt, Kilowatt, and electricity meter bill calculations.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c9-bio-sci',
      name: 'Biological Science',
      code: 'BIO-09',
      description: 'Cell structure & organelles, plant tissues, animal tissues, movement of substances (osmosis), diversity in living organisms.',
      icon: 'Dna',
      accentColor: 'from-emerald-500 to-teal-600',
      gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 14,
      chapters: [
        {
          id: 'c9-bio-ch1',
          chapterNumber: 1,
          title: 'Cell Structure and Functions',
          description: 'Mitochondria, endoplasmic reticulum, Golgi apparatus, lysosomes (suicide bags), ribosomes, vacuoles and plastids.',
          topics: [
            { id: 't-c9-b1-1', title: 'Mitochondria & ATP Powerhouse of Cell', description: 'Cristae, matrix, aerobic respiration role and endosymbiotic origin.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-b1-2', title: 'Endoplasmic Reticulum, Golgi & Lysosomes', description: 'Protein synthesis, lipid packaging, autolysis mechanism.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-bio-ch2',
          chapterNumber: 2,
          title: 'Plant Tissues',
          description: 'Meristematic tissues (apical, lateral, intercalary) and permanent tissues (parenchyma, collenchyma, sclerenchyma, xylem, phloem).',
          topics: [
            { id: 't-c9-b2-1', title: 'Meristematic vs Simple Permanent Tissues', description: 'Cell division, storage, mechanical flexibility (collenchyma), rigidity (sclerenchyma).', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-b2-2', title: 'Complex Vascular Tissues (Xylem & Phloem)', description: 'Tracheids, vessels, sieve tubes, companion cells, water/food conduction.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-bio-ch3',
          chapterNumber: 3,
          title: 'Animal Tissues',
          description: 'Epithelial tissue, connective tissues (blood, bone, cartilage, ligament, tendon), muscular tissue (striated, unstriated, cardiac), nervous tissue.',
          topics: [
            { id: 't-c9-b3-1', title: 'Connective Tissues & Blood Components (RBC, WBC, Platelets)', description: 'Plasma, hemoglobin, bone matrix and immune response.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-b3-2', title: 'Neuron Structure & Nerve Impulse Transmission', description: 'Cyton, dendrites, axon, myelin sheath and synaptic transmission.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-bio-ch4',
          chapterNumber: 4,
          title: 'Movement of Substances Through Tissues (Osmosis)',
          description: 'Diffusion, osmosis (hypotonic, hypertonic, isotonic solutions), plasmolysis, selective permeability of cell membrane.',
          topics: [
            { id: 't-c9-b4-1', title: 'Potato Osmometer Experiment & Osmotic Pressure', description: 'Endosmosis, exosmosis and turgidity in plant roots.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-bio-ch5',
          chapterNumber: 5,
          title: 'Sense Organs (Eye, Ear, Nose, Tongue, Skin)',
          description: 'Eye anatomy (cornea, iris, retina, rods, cones), ear structure (cochlea, auditory nerve), taste buds and olfactory receptors.',
          topics: [
            { id: 't-c9-b5-1', title: 'Anatomy of Human Eye & Vision Defects', description: 'Accommodation of lens, myopia, hypermetropia, rhodopsin pigments.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c9-b5-2', title: 'Human Ear Structure & Hearing Mechanism', description: 'Pinna, tympanum, auditory ossicles, cochlea and balance.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c9-soc',
      name: 'Social Studies',
      code: 'SOC-09',
      description: 'Our Earth, realms of earth, atmosphere & weather, agriculture, industries, credit in financial system, democratic revolutions.',
      icon: 'Globe',
      accentColor: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 14,
      chapters: [
        {
          id: 'c9-soc-ch1',
          chapterNumber: 1,
          title: 'Our Earth & The Natural Realms',
          description: 'Internal structure of Earth (crust, mantle, core), continental drift (Pangaea, Gondwana), plate tectonics, lithosphere.',
          topics: [
            { id: 't-c9-so1-1', title: 'Crust, Mantle, Core & Seismic Waves', description: 'Lithospheric plates, earthquakes, volcanic eruptions.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c9-so1-2', title: 'Plate Tectonics & Fold Mountain Formation', description: 'Himalayan collision zone, transform, divergent and convergent boundaries.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-soc-ch2',
          chapterNumber: 2,
          title: 'Atmosphere (Winds, Pressure Belts & Rainfall)',
          description: 'Structure of atmosphere (Troposphere to Exosphere), planetary pressure belts, Coriolis effect, types of rainfall (convectional, orographic, cyclonic).',
          topics: [
            { id: 't-c9-so2-1', title: 'Atmospheric Layers & Planetary Wind Systems', description: 'Trade winds, westerlies, polar easterlies and monsoon circulation.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c9-soc-ch3',
          chapterNumber: 3,
          title: 'Agriculture and Industries in India',
          description: 'Types of farming, major crops (rice, wheat, cotton, sugarcane), agro-based vs mineral-based industries, industrial corridors.',
          topics: [
            { id: 't-c9-so3-1', title: 'Cropping Seasons (Kharif, Rabi, Zaid) & Green Revolution', description: 'HYV seeds, irrigation, fertilizers, MSP and food security.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-soc-ch4',
          chapterNumber: 4,
          title: 'Credit in the Financial System & Government Budget',
          description: 'Formal vs informal sources of credit, terms of credit, self-help groups (SHGs), direct vs indirect taxation, fiscal budget.',
          topics: [
            { id: 't-c9-so4-1', title: 'Formal vs Informal Credit & Debt Trap Risks', description: 'Moneylenders vs Commercial banks, collateral and microfinance.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c9-soc-ch5',
          chapterNumber: 5,
          title: 'Democratic and Nationalist Revolutions (17th to 19th Century)',
          description: 'Glorious Revolution (1688), American Declaration of Independence (1776), French Revolution (1789) - Liberty, Equality, Fraternity.',
          topics: [
            { id: 't-c9-so5-1', title: 'French Revolution, Bastille & Declaration of Rights', description: 'Estates General, Robespierre Reign of Terror, Rise of Napoleon.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    }
  ]
};
