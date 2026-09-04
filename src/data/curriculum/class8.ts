import { ClassSyllabus } from '../../types';

export const CLASS_8_SYLLABUS: ClassSyllabus = {
  classLevel: 'Class 8',
  academicBoard: 'Telangana State Board (SCERT)',
  curriculumVersion: 'TS-SCERT-2024-25',
  academicYear: '2024-2025',
  sourceAuthority: 'State Council of Educational Research and Training (SCERT), Telangana',
  sourceReference: 'Government of Telangana School Education Department & SCERT Textbooks',
  subjects: [
    {
      id: 'c8-tel',
      name: 'Telugu (తెలుగు - ప్రథమ భాష)',
      code: 'TEL-08',
      description: 'సింగిడి-1 / నవవసంతం-3: ప్రాచీన కావ్యాలు, ఆధునిక కవితలు, వ్యాకరణం, ఛందస్సు మరియు అలంకారాలు.',
      icon: 'Languages',
      accentColor: 'from-pink-500 to-rose-600',
      gradient: 'bg-gradient-to-br from-pink-500/20 via-rose-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c8-tel-ch1',
          chapterNumber: 1,
          title: 'త్యాగనిరతి (Tyaganirati)',
          description: 'నన్నయ భట్టారకుని ఆంధ్ర మహాభారతంలోని శిబి చక్రవర్తి దయాగుణం మరియు పక్షి సంరక్షణ.',
          topics: [
            { id: 't-c8-tel-1-1', title: 'పాఠ్యభాగ నేపధ్యం & పద్య భావాలు', description: 'డేగ-పావురం సంవాదం, శరణాగత రక్షణ ధర్మం.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-tel-1-2', title: 'సవర్ణదీర్ఘ సంధి & గుణ సంధి', description: 'సంస్కృత సంధుల సూత్రాలు మరియు ఉదాహరణలు.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-tel-ch2',
          chapterNumber: 2,
          title: 'సముద్ర లంఘనం (Samudra Langhanam)',
          description: 'అయ్యలరాజు రామభద్రుని రామాభ్యుదయములోని హనుమంతుని సముద్ర లంఘన వీర రస వర్ణన.',
          topics: [
            { id: 't-c8-tel-2-1', title: 'హనుమంతుని సాహసం & వర్ణనా వైభవం', description: 'మహేంద్రగిరి నుండి లంకకు ఎగిరిన పద్యాల సౌందర్యం.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-tel-ch3',
          chapterNumber: 3,
          title: 'బండారి బసవన్న (Bandari Basavanna)',
          description: 'పాల్కురికి సోమనాథుని బసవపురాణంలోని బసవేశ్వరుని భక్తి తత్పరత మరియు నిజాయితీ.',
          topics: [
            { id: 't-c8-tel-3-1', title: 'ద్విపద కావ్యం & భక్తి మహిమ', description: 'బిజ్జలుని ఆస్థానంలో బసవన్న నిర్దోషిత్వ నిరూపణ.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-tel-ch4',
          chapterNumber: 4,
          title: 'మంజీర (Manjeera)',
          description: 'డా. వేముగంటి నరసింహాచార్యుల మంజీరా నదీ ప్రవాహ సౌందర్యం మరియు తెలంగాణ జీవనాడి వర్ణన.',
          topics: [
            { id: 't-c8-tel-4-1', title: 'గేయ రూపం & మంజీర వైభవం', description: 'మెదక్, నిజామాబాద్ జిల్లాలకు నీరందించే జీవనది.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-tel-ch5',
          chapterNumber: 5,
          title: 'శతక సుధ (Sathaka Sudha)',
          description: 'సర్వేశ్వర, కాళహస్తీశ్వర, కుమార శతక పద్యాలు మరియు నైతిక ప్రవర్తన సూత్రాలు.',
          topics: [
            { id: 't-c8-tel-5-1', title: 'శతక పద్యాలు & ఛందస్సు (తేటగీతి, ఆటవెలది)', description: 'గణ విభజన మరియు యతి ప్రాసల సాధన.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        }
      ]
    },
    {
      id: 'c8-hin',
      name: 'Hindi (हिंदी - द्वितीय भाषा)',
      code: 'HIN-08',
      description: 'बाल वसंत-3: छायावादी कविताएँ, व्यंग्य, प्रेरक जीवनियाँ, पत्र एवं व्याकरण।',
      icon: 'Languages',
      accentColor: 'from-amber-500 to-red-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-red-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 11,
      chapters: [
        {
          id: 'c8-hin-ch1',
          chapterNumber: 1,
          title: 'ध्वनि (Dhvani - सूर्यकांत त्रिपाठी ‘निराला’)',
          description: 'युवा पीढ़ी में आशा, उत्साह और नवजीवन का संचार करने वाली प्रेरणादायक कविता।',
          topics: [
            { id: 't-c8-h1-1', title: 'कविता का भावार्थ एवं उत्साह संदेश', description: 'कलियों और वसंत के माध्यम से युवाओं को जागृत करना।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-h1-2', title: 'उपसर्ग, प्रत्यय एवं संधि परिचय', description: 'शब्द रचना और व्याकरणिक अभ्यास।', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-hin-ch2',
          chapterNumber: 2,
          title: 'लाख की चूड़ियाँ (Laakh Ki Choodiyan)',
          description: 'कामतानाथ - मशीनी युग से पारंपरिक कारीगरों (बदलू काका) के रोजगार पर प्रभाव।',
          topics: [
            { id: 't-c8-h2-1', title: 'कहानी सारांश एवं हस्तकला का संरक्षण', description: 'औद्योगीकरण का ग्रामीण जीवन पर असर।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-hin-ch3',
          chapterNumber: 3,
          title: 'बस की यात्रा (Bus Ki Yatra)',
          description: 'हरिशंकर परसाई - जीर्ण-शीर्ण बस की हास्य-व्यंग्य यात्रा और परिवहन व्यवस्था पर कटाक्ष।',
          topics: [
            { id: 't-c8-h3-1', title: 'व्यंग्य विधा एवं हास्य प्रसंग', description: 'परसाई जी की लेखन शैली और रोचक यात्रा संस्मरण।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-hin-ch4',
          chapterNumber: 4,
          title: 'दीवानों की हस्ती (Deewanon Ki Hasti)',
          description: 'भगवती चरण वर्मा - देश पर मर मिटने वाले दीवानों का निस्वार्थ जीवन और बलिदान।',
          topics: [
            { id: 't-c8-h4-1', title: 'कविता एवं देशभक्ति भावना', description: 'स्वाधीनता सेनानियों का मस्ती भरा जीवन और त्याग।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-hin-ch5',
          chapterNumber: 5,
          title: 'भगवान के डाकिए (Bhagwan Ke Dakiye)',
          description: 'रामधारी सिंह ‘दिनकर’ - पक्षी और बादल जो विश्व बंधुत्व और एकता का संदेश लाते हैं।',
          topics: [
            { id: 't-c8-h5-1', title: 'कविता सारांश एवं सार्वभौमिक शांति', description: 'प्रकृति में सीमाहीन प्रेम और समरसता का संदेश।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c8-eng',
      name: 'English',
      code: 'ENG-08',
      description: 'Our World through English: Short stories, drama, autobiographies, clauses, active/passive voice, and letters.',
      icon: 'BookOpen',
      accentColor: 'from-violet-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 13,
      chapters: [
        {
          id: 'c8-eng-ch1',
          chapterNumber: 1,
          title: 'The Tattered Blanket',
          description: 'Kamala Das: Gopi visiting his old mother in Kerala, family emotional disconnect, and materialism.',
          topics: [
            { id: 't-c8-e1-1', title: 'Story Reading: Elderly Care & Family Values', description: 'Mother’s unconditional love vs son’s hurried commercial interest.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-e1-2', title: 'Grammar: Noun Phrases & Prepositional Phrases', description: 'Identifying heads and modifiers in noun phrases.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-eng-ch2',
          chapterNumber: 2,
          title: 'Oliver Asks for More',
          description: 'Charles Dickens: Oliver Twist in the London workhouse, poverty, exploitation and courageous plea.',
          topics: [
            { id: 't-c8-e2-1', title: 'Classic Literature Extract & Workhouse Life', description: 'Victorian social injustice and boy’s struggle for survival.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-e2-2', title: 'Grammar: Direct to Indirect Speech', description: 'Reporting imperative and assertive statements.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c8-eng-ch3',
          chapterNumber: 3,
          title: 'The Selfish Giant (Oscar Wilde)',
          description: 'Fairy tale: Giant’s garden, eternal winter, entry of little children and arrival of spring.',
          topics: [
            { id: 't-c8-e3-1', title: 'Story: Transformation of the Giant', description: 'Compassion, warmth and innocence melting cold selfishness.', estimatedMinutes: 25, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-eng-ch4',
          chapterNumber: 4,
          title: 'The Story of Ikebana & Bonsai',
          description: 'Japanese floral art, cultivating patience, and appreciation of nature’s miniature beauty.',
          topics: [
            { id: 't-c8-e4-1', title: 'Art Form & Cultural Harmony', description: 'Shin, Soe, Hikae principles and flower arrangement.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-eng-ch5',
          chapterNumber: 5,
          title: 'The Treasure Within (Hafeez Contractor)',
          description: 'Interview with renowned architect Hafeez Contractor on unconventional learning and creativity.',
          topics: [
            { id: 't-c8-e5-1', title: 'Interview Reading: Discovering Hidden Talents', description: 'Finding one’s calling beyond rote memorization.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c8-maths',
      name: 'Mathematics',
      code: 'MATH-08',
      description: 'Rational numbers, linear equations in one variable, quadrilaterals, exponents, square roots, factorisation, surface areas.',
      icon: 'Calculator',
      accentColor: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 16,
      chapters: [
        {
          id: 'c8-math-ch1',
          chapterNumber: 1,
          title: 'Rational Numbers',
          description: 'Properties of rational numbers (closure, commutativity, associativity, distributive law), density property.',
          topics: [
            { id: 't-c8-m1-1', title: 'Closure, Commutative & Associative Properties', description: 'Operations over rational numbers (Q) and verification.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-m1-2', title: 'Distributive Law & Density Property', description: 'Finding rational numbers between any two given rationals.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-math-ch2',
          chapterNumber: 2,
          title: 'Linear Equations in One Variable',
          description: 'Solving equations with variables on one and both sides, cross-multiplication, age and digits word problems.',
          topics: [
            { id: 't-c8-m2-1', title: 'Solving Linear Equations by Transposition', description: 'Simplifying algebraic fractions and equations.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-m2-2', title: 'Word Problems (Age, Money, Geometric Dimensions)', description: 'Translating verbal conditions into linear expressions.', estimatedMinutes: 30, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-math-ch3',
          chapterNumber: 3,
          title: 'Exponents and Powers',
          description: 'Powers with negative exponents, laws of exponents (a^m × a^n = a^(m+n)), scientific standard form.',
          topics: [
            { id: 't-c8-m3-1', title: 'Laws of Exponents & Negative Powers', description: 'Multiplication, division and power of powers rules.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-m3-2', title: 'Standard Scientific Notation (m × 10^k)', description: 'Expressing very large and very small numbers.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-math-ch4',
          chapterNumber: 4,
          title: 'Square Roots and Cube Roots',
          description: 'Properties of square numbers, prime factorisation and long division square root methods, cube roots.',
          topics: [
            { id: 't-c8-m4-1', title: 'Square Root by Long Division Method', description: 'Finding square roots of integers and decimals.', estimatedMinutes: 30, difficulty: 'Intermediate' },
            { id: 't-c8-m4-2', title: 'Cube Roots by Prime Factorisation', description: 'Identifying perfect cubes and computing cube roots.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-math-ch5',
          chapterNumber: 5,
          title: 'Algebraic Expressions, Identities and Factorisation',
          description: 'Standard identities: (a+b)², (a-b)², a²-b², (x+a)(x+b); grouping terms and splitting middle terms.',
          topics: [
            { id: 't-c8-m5-1', title: 'Standard Algebraic Identities Application', description: 'Evaluating products without direct multiplication.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-m5-2', title: 'Factorisation by Grouping & Splitting Middle Term', description: 'Factoring quadratic trinomials ax² + bx + c.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c8-math-ch6',
          chapterNumber: 6,
          title: 'Surface Area and Volume (Mensuration)',
          description: 'Area of trapezium, general quadrilaterals, total and lateral surface area of cubes, cuboids, cylinders.',
          topics: [
            { id: 't-c8-m6-1', title: 'Area of Trapezium & Polygons', description: 'Dividing polygons into triangles and trapeziums.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-m6-2', title: 'Surface Area & Volume of Cylinders & Cuboids', description: 'Formulae and practical storage container problems.', estimatedMinutes: 30, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c8-phy-sci',
      name: 'Physical Science',
      code: 'PHY-08',
      description: 'Force, friction, synthetic fibres, metals & non-metals, sound, coal & petroleum, combustion and electricity in liquids.',
      icon: 'Atom',
      accentColor: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-500/20 via-indigo-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 14,
      chapters: [
        {
          id: 'c8-phy-ch1',
          chapterNumber: 1,
          title: 'Force and Pressure',
          description: 'Contact forces (muscular, friction, normal, tension) and non-contact forces (magnetic, electrostatic, gravitational); pressure formula (P = F/A).',
          topics: [
            { id: 't-c8-p1-1', title: 'Contact vs Non-Contact Forces', description: 'Net force (F_net), balanced and unbalanced forces.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-p1-2', title: 'Pressure in Fluids & Atmospheric Pressure', description: 'Manometers, height-depth relationship, barometric pressure.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-phy-ch2',
          chapterNumber: 2,
          title: 'Friction',
          description: 'Static, sliding, rolling friction; factors affecting friction; advantages, disadvantages, lubricants and ball bearings.',
          topics: [
            { id: 't-c8-p2-1', title: 'Types of Friction (Static, Sliding, Rolling)', description: 'Microscopic interlocking, spring balance measurements.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-p2-2', title: 'Fluid Friction (Drag) & Streamlining', description: 'Aerodynamic shapes of aircraft, fishes and vehicles.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-phy-ch3',
          chapterNumber: 3,
          title: 'Metals and Non-Metals',
          description: 'Malleability, ductility, sonority, conductivity; reactions with oxygen, water, acids, bases and displacement reactions.',
          topics: [
            { id: 't-c8-p3-1', title: 'Physical & Chemical Properties of Metals', description: 'Metal oxides (basic), reaction with acids producing H2 gas.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-p3-2', title: 'Reactivity Series & Displacement Reactions', description: 'Fe + CuSO4 → FeSO4 + Cu and metal reactivity order.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-phy-ch4',
          chapterNumber: 4,
          title: 'Sound',
          description: 'Vibration as source of sound, human vocal cords (larynx), propagation medium, amplitude, frequency, pitch and loudness.',
          topics: [
            { id: 't-c8-p4-1', title: 'Propagation of Sound & Human Ear Mechanism', description: 'Eardrum, cochlea, audible frequency range (20 Hz - 20,000 Hz).', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-p4-2', title: 'Amplitude, Frequency, Pitch & Noise Pollution', description: 'Decibel scale, ultrasonic sound and noise control measures.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-phy-ch5',
          chapterNumber: 5,
          title: 'Electrical Conductivity of Liquids',
          description: 'Electrolytes, testing conductivity of lemon juice, vinegar, salt solution; electroplating process and uses.',
          topics: [
            { id: 't-c8-p5-1', title: 'Electrolysis & Electroplating Mechanism', description: 'Copper sulphate electrolysis, coating gold/chromium on metals.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c8-bio-sci',
      name: 'Biological Science',
      code: 'BIO-08',
      description: 'Cell structure, microorganisms, reproduction in animals, adolescence, biodiversity, ecosystems and food production.',
      icon: 'Dna',
      accentColor: 'from-emerald-500 to-teal-600',
      gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 13,
      chapters: [
        {
          id: 'c8-bio-ch1',
          chapterNumber: 1,
          title: 'Cell - The Basic Unit of Life',
          description: 'Discovery by Robert Hooke, onion peel and cheek cell slides, cell membrane, cytoplasm, nucleus, organelles (plant vs animal cell).',
          topics: [
            { id: 't-c8-b1-1', title: 'Plant Cell vs Animal Cell Structure', description: 'Cell wall, chloroplasts, large vacuoles in plant cells.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c8-b1-2', title: 'Nucleus, Chromosomes & Prokaryote/Eukaryote', description: 'Nuclear membrane, genetic material and cell division role.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-bio-ch2',
          chapterNumber: 2,
          title: 'The World of Microorganisms',
          description: 'Bacteria, fungi, protozoa, algae, viruses; beneficial uses (curd, bread, antibiotics, vaccines) and harmful pathogens.',
          topics: [
            { id: 't-c8-b2-1', title: 'Beneficial Microbes & Antibiotics (Penicillin)', description: 'Alexander Fleming discovery, fermentation and vaccines.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c8-b2-2', title: 'Pathogens, Vectors & Food Preservation', description: 'Malaria (Anopheles), Dengue (Aedes), pasteurization and salting.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-bio-ch3',
          chapterNumber: 3,
          title: 'Reproduction in Animals',
          description: 'Asexual reproduction (binary fission in amoeba, budding in hydra); sexual reproduction, male & female reproductive organs, fertilization.',
          topics: [
            { id: 't-c8-b3-1', title: 'Internal vs External Fertilization & Metamorphosis', description: 'Frogs life cycle (tadpole), viviparous vs oviparous animals.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-bio-ch4',
          chapterNumber: 4,
          title: 'Reaching the Age of Adolescence',
          description: 'Puberty changes, secondary sexual characters, pituitary and endocrine hormones (testosterone, estrogen), nutrition and hygiene.',
          topics: [
            { id: 't-c8-b4-1', title: 'Endocrine Glands, Hormones & Balanced Diet', description: 'Growth hormone, thyroid, adrenaline and emotional changes.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-bio-ch5',
          chapterNumber: 5,
          title: 'Biodiversity and Its Conservation',
          description: 'Flora, fauna, endemic species, Red Data Book, national parks (KBR, Amrabad), sanctuaries and afforestation.',
          topics: [
            { id: 't-c8-b5-1', title: 'Endangered Species, Red Data Book & Protected Areas', description: 'Tiger conservation, poaching threats and Project Tiger.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c8-soc',
      name: 'Social Studies',
      code: 'SOC-08',
      description: 'Energy from sun, polar regions, minerals & mining, money & banking, Indian National Movement, Hyderabad State freedom struggle.',
      icon: 'Globe',
      accentColor: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 13,
      chapters: [
        {
          id: 'c8-soc-ch1',
          chapterNumber: 1,
          title: 'Energy from the Sun (Insolation & Temperature)',
          description: 'Solar radiation, greenhouse effect, factors affecting temperature (latitude, altitude, distance from sea).',
          topics: [
            { id: 't-c8-so1-1', title: 'Insolation, Heat Budget & Isotherms', description: 'Atmospheric heating, moderate and extreme climate zones.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-soc-ch2',
          chapterNumber: 2,
          title: 'Minerals and Mining (Singareni Collieries)',
          description: 'Renewable vs non-renewable resources, open cast vs underground mining, Singareni Collieries in Telangana.',
          topics: [
            { id: 't-c8-so2-1', title: 'Coal Mining in Godavari Valley (SCCL)', description: 'Working conditions of coal miners, safety hazards and power generation.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c8-soc-ch3',
          chapterNumber: 3,
          title: 'Money and Banking',
          description: 'Evolution of money (barter, coins, paper currency), commercial banks, loans, SHGs, RBI role and digital payments.',
          topics: [
            { id: 't-c8-so3-1', title: 'Commercial Banks, Loans & Reserve Bank of India', description: 'Deposits, credit creation, collateral and self-help groups (SHGs).', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-soc-ch4',
          chapterNumber: 4,
          title: 'National Movement - Early and Last Phases (1885-1947)',
          description: 'Formation of INC (1885), Moderates, Extremists, Swadeshi movement, Gandhiji (Non-Cooperation, Civil Disobedience, Quit India).',
          topics: [
            { id: 't-c8-so4-1', title: 'Gandhian Era, Satyagraha & Salt March (1930)', description: 'Dandi march, mass mobilization, communal politics and independence.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c8-soc-ch5',
          chapterNumber: 5,
          title: 'Freedom Movement in Hyderabad State (Telangana Armed Struggle)',
          description: 'Nizam rule, Jagirdari system, Vetti (forced labor), Andhra Mahasabha, Telangana Peasants Armed Struggle (1946-51), Operation Polo.',
          topics: [
            { id: 't-c8-so5-1', title: 'Telangana Armed Struggle & Doddi Komaraiah', description: 'Chityala Ailamma heroism, Razakar violence, integration into India on 17 Sept 1948.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    }
  ]
};
