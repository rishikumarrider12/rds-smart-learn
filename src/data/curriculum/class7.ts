import { ClassSyllabus } from '../../types';

export const CLASS_7_SYLLABUS: ClassSyllabus = {
  classLevel: 'Class 7',
  academicBoard: 'Telangana State Board (SCERT)',
  curriculumVersion: 'TS-SCERT-2024-25',
  academicYear: '2024-2025',
  sourceAuthority: 'State Council of Educational Research and Training (SCERT), Telangana',
  sourceReference: 'Government of Telangana School Education Department & SCERT Textbooks',
  subjects: [
    {
      id: 'c7-tel',
      name: 'Telugu (తెలుగు - ప్రథమ భాష)',
      code: 'TEL-07',
      description: 'నవవసంతం-2: ప్రాచీన మరియు ఆధునిక పద్యాలు, కథానికలు, సంభాషణలు మరియు సంధి-సమాసాలు.',
      icon: 'Languages',
      accentColor: 'from-pink-500 to-rose-600',
      gradient: 'bg-gradient-to-br from-pink-500/20 via-rose-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c7-tel-ch1',
          chapterNumber: 1,
          title: 'చదువు (Chadavu)',
          description: 'కొఱవి గోపరాజు సింహాసన ద్వాత్రింశిక లోని విద్యా ప్రాధాన్యతను చాటే పద్యాలు.',
          topics: [
            { id: 't-c7-tel-1-1', title: 'పాఠ్యభాగ నేపధ్యం & పద్య భావాలు', description: 'విక్రమార్కుని కథ, చదువు రాని కుమారుని పట్ల తండ్రి ఆవేదన.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-tel-1-2', title: 'సంధులు: అత్వ, ఇత్వ, ఉత్వ సంధులు', description: 'తెలుగు సంధుల సూత్రాలు మరియు సంధి పదాల సాధన.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-tel-ch2',
          chapterNumber: 2,
          title: 'నాయనమ్మ (Nayanamma)',
          description: 'కుటుంబ అనుబంధాలు, వృద్ధుల పట్ల ఆదరణ మరియు సేవా భావం చాటే కథ.',
          topics: [
            { id: 't-c7-tel-2-1', title: 'కుటుంబ విలువలు & కథాంశం', description: 'నాయనమ్మ పట్ల మనవడు రవి చూపిన ప్రేమ మరియు ఆప్యాయత.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-tel-ch3',
          chapterNumber: 3,
          title: 'శతక సుధ (Sathaka Sudha)',
          description: 'నారాయణ, దాశరథీ, భాస్కర, కాళహస్తీశ్వర శతక పద్యాల నీతి సందేశాలు.',
          topics: [
            { id: 't-c7-tel-3-1', title: 'శతక పద్యాలు, ప్రతిపదార్థాలు & మకుటాలు', description: 'కవుల పరిచయం, శతక లక్షణాలు మరియు జీవన నీతులు.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-tel-ch4',
          chapterNumber: 4,
          title: 'అమ్మ జ్ఞాపకాలు',
          description: 'టి. కృష్ణమూర్తి యాదవ్ గారి కవిత - అమ్మ ప్రేమ, త్యాగం మరియు మమకారం.',
          topics: [
            { id: 't-c7-tel-4-1', title: 'వచన కవిత & అమ్మ గొప్పదనం', description: 'తెలంగాణ పల్లెల్లో అమ్మ పడిన శ్రమ మరియు అనురాగం.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-tel-ch5',
          chapterNumber: 5,
          title: 'పల్లె అందాలు',
          description: 'అచ్చి వేంకటాచార్యులు గారి పల్లెటూరి ప్రకృతి రమణీయత వర్ణన.',
          topics: [
            { id: 't-c7-tel-5-1', title: 'గ్రామీణ జీవనం & పద్య సౌందర్యం', description: 'పంట చేలు, చెరువులు, పక్షుల కిలకిలారావాల వర్ణన.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c7-hin',
      name: 'Hindi (हिंदी - द्वितीय भाषा)',
      code: 'HIN-07',
      description: 'बाल वसंत-2: कविताएँ, प्रेरक कहानियाँ, संवाद एवं माध्यमिक व्याकरण।',
      icon: 'Languages',
      accentColor: 'from-amber-500 to-red-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-red-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 11,
      chapters: [
        {
          id: 'c7-hin-ch1',
          chapterNumber: 1,
          title: 'हम पंछी उन्मुक्त गगन के (Hum Panchhi Unmukt Gagan Ke)',
          description: 'शिवमंगल सिंह ‘सुमन’ - स्वतंत्रता का मूल्य और पक्षियों की मुक्त उड़ान।',
          topics: [
            { id: 't-c7-h1-1', title: 'कविता का भावार्थ एवं स्वतंत्रता का संदेश', description: 'पिंजरे में बंद पक्षी की व्यथा और आज़ादी का महत्व।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-h1-2', title: 'पर्यायवाची एवं विलोम शब्द', description: 'स्वर्ण, गगन, पिंजरबद्ध शब्दों का व्याकरण अध्ययन।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-hin-ch2',
          chapterNumber: 2,
          title: 'दादी माँ (Dadi Maa)',
          description: 'शिवप्रसाद सिंह - दादी माँ का ममतालु स्वभाव, घरेलू उपचार एवं जीवन मूल्य।',
          topics: [
            { id: 't-c7-h2-1', title: 'कहानी का सारांश एवं पारिवारिक रिश्ते', description: 'दादी माँ का वात्सल्य और मार्गदर्शन।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-hin-ch3',
          chapterNumber: 3,
          title: 'हिमालय की बेटियाँ (Himalay Ki Betiyan)',
          description: 'नागार्जुन - नदियों का मानवीकरण और भारत की प्राकृतिक संपदा।',
          topics: [
            { id: 't-c7-h3-1', title: 'निबंध वाचन एवं नदियों का महत्व', description: 'गंगा, यमुना, सतलुज का उद्गम और विस्तार।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-hin-ch4',
          chapterNumber: 4,
          title: 'कठपुतली (Kathputli)',
          description: 'भवानी प्रसाद मिश्र - आत्मनिर्भरता और स्वावलंबन की प्रेरणा।',
          topics: [
            { id: 't-c7-h4-1', title: 'कविता एवं स्वावलंबन का भाव', description: 'धागों से बंधी कठपुतली की स्वतंत्र होने की इच्छा।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-hin-ch5',
          chapterNumber: 5,
          title: 'मिठाईवाला (Mithaiwala)',
          description: 'भगवती प्रसाद वाजपेयी - बाल मनोविज्ञान और मानवता का मार्मिक चित्रण।',
          topics: [
            { id: 't-c7-h5-1', title: 'कहानी अध्ययन एवं चरित्र चित्रण', description: 'खिलौनेवाला, मुरलीवाला और मिठाईवाला के रूप में बच्चों का स्नेह।', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c7-eng',
      name: 'English',
      code: 'ENG-07',
      description: 'Our World through English: Literature, dialogues, reading comprehension, grammar and creative writing.',
      icon: 'BookOpen',
      accentColor: 'from-violet-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c7-eng-ch1',
          chapterNumber: 1,
          title: 'The Town Mouse and the Country Mouse',
          description: 'Aesop fable: contrasting urban luxury and rural peace and contentment.',
          topics: [
            { id: 't-c7-e1-1', title: 'Story Reading: Urban vs Rural Life', description: 'Contentment, simplicity vs luxury and anxiety.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-e1-2', title: 'Grammar: Degrees of Comparison', description: 'Positive, comparative, superlative adjectives and rules.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-eng-ch2',
          chapterNumber: 2,
          title: 'C.V. Raman, the Celebrated Genius',
          description: 'Biography of Sir C.V. Raman, Raman Effect, Nobel Prize in Physics, and national pride.',
          topics: [
            { id: 't-c7-e2-1', title: 'Biographical Sketch: Life of C.V. Raman', description: 'Scientific curiosity, scattering of light, and indigenous research.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-e2-2', title: 'Grammar: Prepositions & Phrasal Verbs', description: 'Prepositions of place, time, direction and phrasal expressions.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-eng-ch3',
          chapterNumber: 3,
          title: 'Puru, the Brave',
          description: 'Historical play: King Puru (Porus) meeting Alexander the Great with regal dignity.',
          topics: [
            { id: 't-c7-e3-1', title: 'Drama Reading & Character Analysis', description: 'Heroism, self-respect and mutual admiration among rulers.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-eng-ch4',
          chapterNumber: 4,
          title: 'Tenali Paints a Horse',
          description: 'Witty court drama of Tenali Rama outsmarting the royal artist in Sri Krishnadevaraya’s court.',
          topics: [
            { id: 't-c7-e4-1', title: 'Humorous Play & Dialogue Writing', description: 'Wit, imagination and stage performance dialogue skills.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-eng-ch5',
          chapterNumber: 5,
          title: 'A Hero (Swami by R.K. Narayan)',
          description: 'Swami sleeping alone in his father’s office room and catching a notorious burglar.',
          topics: [
            { id: 't-c7-e5-1', title: 'Malgudi Days Extract: Swami’s Courage', description: 'Overcoming fear of darkness and unexpected heroism.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c7-maths',
      name: 'Mathematics',
      code: 'MATH-07',
      description: 'Integers, fractions & decimals, simple equations, lines & angles, triangles, ratio applications, algebraic expressions.',
      icon: 'Calculator',
      accentColor: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 16,
      chapters: [
        {
          id: 'c7-math-ch1',
          chapterNumber: 1,
          title: 'Integers',
          description: 'Properties of addition, subtraction, multiplication and division of integers, BODMAS rule.',
          topics: [
            { id: 't-c7-m1-1', title: 'Multiplication & Division Rules for Integers', description: 'Sign conventions, associative and distributive properties.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-m1-2', title: 'BODMAS & Word Problems with Integers', description: 'Temperature changes, elevation, credits/debits.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-math-ch2',
          chapterNumber: 2,
          title: 'Fractions, Decimals and Rational Numbers',
          description: 'Multiplication and division of fractions and decimals, introduction to rational numbers.',
          topics: [
            { id: 't-c7-m2-1', title: 'Multiplication & Reciprocal Division of Fractions', description: 'Product of fractions and reciprocal division operations.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-m2-2', title: 'Rational Numbers on Number Line', description: 'Positive, negative rational numbers and equivalent forms.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-math-ch3',
          chapterNumber: 3,
          title: 'Simple Equations',
          description: 'Setting up linear equations, solving equations by transposition method, word problems.',
          topics: [
            { id: 't-c7-m3-1', title: 'Linear Equations in One Variable & Transposition', description: 'Solving for unknown variables using transposition.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-math-ch4',
          chapterNumber: 4,
          title: 'Lines and Angles',
          description: 'Complementary, supplementary, adjacent, vertically opposite angles, parallel lines & transversals.',
          topics: [
            { id: 't-c7-m4-1', title: 'Complementary, Supplementary & Vertically Opposite Angles', description: 'Angle relationships and linear pair axiom.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-m4-2', title: 'Parallel Lines & Transversal Angles', description: 'Alternate interior, corresponding and allied angles.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-math-ch5',
          chapterNumber: 5,
          title: 'Triangle and Its Properties',
          description: 'Medians, altitudes, exterior angle theorem, angle sum property, triangle inequality theorem.',
          topics: [
            { id: 't-c7-m5-1', title: 'Exterior Angle Theorem & Angle Sum Property', description: 'Sum of interior opposite angles and 180 degree proofs.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c7-m5-2', title: 'Pythagoras Property in Right Triangles', description: 'Hypotenuse square equals sum of squares of legs.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-math-ch6',
          chapterNumber: 6,
          title: 'Ratio - Applications (Percentages & Profit/Loss)',
          description: 'Ratios, unit rate, percentages, profit and loss, simple interest formula (I = PTR/100).',
          topics: [
            { id: 't-c7-m6-1', title: 'Percentage, Profit & Loss Calculations', description: 'Cost price, selling price, profit% and loss%.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c7-m6-2', title: 'Simple Interest (I = PTR / 100)', description: 'Principal, rate, time and amount calculations.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c7-sci',
      name: 'General Science',
      code: 'SCI-07',
      description: 'Acids & bases, animal fibre, motion & time, heat & temperature, electricity, plant nutrition & respiration.',
      icon: 'Atom',
      accentColor: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-500/20 via-indigo-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 15,
      chapters: [
        {
          id: 'c7-sci-ch1',
          chapterNumber: 1,
          title: 'Acids, Bases and Salts',
          description: 'Natural indicators (litmus, turmeric), neutralization reactions, acidic/basic properties.',
          topics: [
            { id: 't-c7-s1-1', title: 'Natural Indicators & pH Colors', description: 'Litmus paper, turmeric, China rose and phenolphthalein tests.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-s1-2', title: 'Neutralisation in Daily Life', description: 'Antacid tablets, ant sting treatment, soil treatment and factory waste.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-sci-ch2',
          chapterNumber: 2,
          title: 'Animal Fibre (Silk and Wool)',
          description: 'Life history of silk moth, sericulture, shearing, scouring, sorting of wool.',
          topics: [
            { id: 't-c7-s2-1', title: 'Life Cycle of Silk Moth & Silk Processing', description: 'Larva, cocoon, boiling and reeling of silk threads.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-sci-ch3',
          chapterNumber: 3,
          title: 'Motion and Time',
          description: 'Slow and fast motion, speed formula (s = d/t), uniform and non-uniform motion, simple pendulum.',
          topics: [
            { id: 't-c7-s3-1', title: 'Speed Calculation & Units (m/s, km/h)', description: 'Odometer, speedometer and distance-time graphs.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-s3-2', title: 'Simple Pendulum & Periodic Motion', description: 'Time period, length and oscillations of pendulum.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-sci-ch4',
          chapterNumber: 4,
          title: 'Temperature and Its Measurement (Heat)',
          description: 'Clinical and laboratory thermometers, conduction, convection and radiation of heat.',
          topics: [
            { id: 't-c7-s4-1', title: 'Conduction, Convection & Radiation Modes', description: 'Sea breeze, land breeze, conductors vs insulators.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-sci-ch5',
          chapterNumber: 5,
          title: 'Electricity - Current and Its Effects',
          description: 'Circuit diagrams, heating effect of electric current (fuse, heater), magnetic effect & electromagnets.',
          topics: [
            { id: 't-c7-s5-1', title: 'Heating Effect of Current & Electric Fuse', description: 'Nichrome wire heating, safety fuses and MCBs.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-s5-2', title: 'Magnetic Effect of Current & Electric Bell', description: 'Oersted discovery, solenoid and electric bell mechanism.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-sci-ch6',
          chapterNumber: 6,
          title: 'Nutrition in Plants & Respiration in Organisms',
          description: 'Autotrophic nutrition, photosynthesis (chlorophyll, sunlight, CO2), stomata, aerobic vs anaerobic respiration.',
          topics: [
            { id: 't-c7-s6-1', title: 'Photosynthesis & Stomata Gas Exchange', description: 'Chloroplasts, equation of photosynthesis, starch test.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c7-s6-2', title: 'Aerobic vs Anaerobic Respiration', description: 'Cellular energy release, breathing mechanism in humans & animals.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c7-soc',
      name: 'Social Studies',
      code: 'SOC-07',
      description: 'Rain and rivers, Kakatiyas of Warangal, Vijayanagara Empire, Mughals, British arrival, State Legislative Assembly.',
      icon: 'Globe',
      accentColor: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c7-soc-ch1',
          chapterNumber: 1,
          title: 'The Rain and Rivers (Tanks & Groundwater)',
          description: 'Monsoon in Telangana, drainage basins of Godavari and Krishna, tank irrigation systems.',
          topics: [
            { id: 't-c7-so1-1', title: 'Southwest Monsoon & Telangana Rivers', description: 'Rainfall patterns, floods, droughts and river systems.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c7-so1-2', title: 'Tanks & Chain-Tank System (Cheruvulu)', description: 'Historical water harvesting, sluice gates and recharge wells.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-soc-ch2',
          chapterNumber: 2,
          title: 'Kakatiya Dynasty - A Kingdom in Telangana',
          description: 'Kakatiya rulers (Rudradeva, Ganapatideva, Rani Rudrama Devi, Prataparudra), Warangal fort and Ramappa.',
          topics: [
            { id: 't-c7-so2-1', title: 'Rani Rudrama Devi & Warangal Fort Architecture', description: 'Nayankara system, trade, artisan guilds and stone gateways (Kirti Toranas).', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-soc-ch3',
          chapterNumber: 3,
          title: 'Vijayanagara and Mughal Empires',
          description: 'Sri Krishnadevaraya, Hampi capital, battle of Talikota; Mughal administration under Akbar and Aurangzeb.',
          topics: [
            { id: 't-c7-so3-1', title: 'Vijayanagara Administration & Rayagopurams', description: 'Amara Nayakas, foreign travelers (Domingo Paes) and architecture.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c7-so3-2', title: 'Mughal Mansabdari System & Deccan Conquests', description: 'Land revenue (Zabt), religious tolerance and Deccan campaigns.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c7-soc-ch4',
          chapterNumber: 4,
          title: 'Establishment of British Empire in India',
          description: 'East India Company, Battle of Plassey (1757), Subsidiary Alliance, annexation of Hyderabad State dependencies.',
          topics: [
            { id: 't-c7-so4-1', title: 'East India Company Trade & Subsidiary Alliance', description: 'Nizam of Hyderabad alliance, British Residency in Koti.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c7-soc-ch5',
          chapterNumber: 5,
          title: 'The Making of Laws in the State Assembly',
          description: 'Legislative Assembly (MLA), constituencies, Speaker, Governor, Chief Minister and Cabinet.',
          topics: [
            { id: 't-c7-so5-1', title: 'State Legislature & How a Bill Becomes Law', description: 'Telangana Legislative Assembly debate, majority voting and Governor assent.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    }
  ]
};
