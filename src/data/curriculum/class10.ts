import { ClassSyllabus } from '../../types';

export const CLASS_10_SYLLABUS: ClassSyllabus = {
  classLevel: 'Class 10',
  academicBoard: 'Telangana State Board (SCERT)',
  curriculumVersion: 'TS-SCERT-2024-25',
  academicYear: '2024-2025',
  sourceAuthority: 'State Council of Educational Research and Training (SCERT), Telangana',
  sourceReference: 'Government of Telangana Directorate of Government Examinations (SSC Board) & SCERT Textbooks',
  subjects: [
    {
      id: 'c10-maths',
      name: 'Mathematics',
      code: 'MATH-10',
      description: 'SSC Board syllabus: Real numbers, sets, polynomials, quadratic equations, progressions, trigonometry, coordinate geometry, statistics.',
      icon: 'Calculator',
      accentColor: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 18,
      chapters: [
        {
          id: 'c10-math-ch1',
          chapterNumber: 1,
          title: 'Real Numbers',
          description: 'Euclid’s Division Lemma, Fundamental Theorem of Arithmetic, irrationality of √2, √3, √5, logarithms and properties.',
          topics: [
            { id: 't-1-1', title: 'Euclid’s Division Lemma & Algorithm', description: 'Finding HCF of large integers using repeated division algorithm.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-1-2', title: 'Fundamental Theorem of Arithmetic', description: 'Prime factorisation, HCF and LCM relationships, terminating decimal conditions.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-1-3', title: 'Revisiting Irrational Numbers & Logarithms', description: 'Proof of irrationality by contradiction and log laws (log xy = log x + log y).', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c10-math-ch2',
          chapterNumber: 2,
          title: 'Sets',
          description: 'Set notation (Roster & Set-builder), empty set, finite/infinite sets, subsets, Venn diagrams, union, intersection and disjoint sets.',
          topics: [
            { id: 't-2-1', title: 'Set Representation & Types of Sets', description: 'Roster form, set builder notation, null set and universal set.', estimatedMinutes: 15, difficulty: 'Basic' },
            { id: 't-2-2', title: 'Venn Diagrams & Set Operations', description: 'Union (A ∪ B), Intersection (A ∩ B), and Difference (A - B) visualised.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-2-3', title: 'Cardinality & Disjoint Sets', description: 'Formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B) and practical applications.', estimatedMinutes: 20, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-math-ch3',
          chapterNumber: 3,
          title: 'Polynomials',
          description: 'Geometrical meaning of zeroes of linear, quadratic, and cubic polynomials; relationship between zeroes and coefficients.',
          topics: [
            { id: 't-3-1', title: 'Geometrical Meaning of Zeroes', description: 'Parabola graphs of quadratic polynomials and x-axis intersections.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-3-2', title: 'Zeroes and Coefficients Relationship', description: 'Sum (α+β = -b/a) and Product (αβ = c/a) for quadratics and cubics.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-3-3', title: 'Division Algorithm for Polynomials', description: 'Dividing polynomials p(x) = g(x)q(x) + r(x) to find remaining zeroes.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c10-math-ch4',
          chapterNumber: 4,
          title: 'Quadratic Equations',
          description: 'Standard form ax² + bx + c = 0, factorisation method, completing the square, quadratic formula, nature of roots (discriminant D = b² - 4ac).',
          topics: [
            { id: 't-4-1', title: 'Standard Form & Factorisation Method', description: 'Factoring quadratic equations by splitting middle terms.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-4-2', title: 'Quadratic Formula & Completing Square', description: 'Sridharacharya formula: x = (-b ± √(b² - 4ac)) / (2a).', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-4-3', title: 'Nature of Roots & Real-world Word Problems', description: 'Discriminant analysis (D > 0, D = 0, D < 0) applied to age, speed & distance.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c10-math-ch5',
          chapterNumber: 5,
          title: 'Progressions (AP & GP)',
          description: 'Arithmetic Progression (nth term a_n = a + (n-1)d, sum S_n = n/2[2a+(n-1)d]) and Geometric Progression (nth term a_n = ar^(n-1)).',
          topics: [
            { id: 't-5-1', title: 'Arithmetic Progression: nth Term', description: 'First term (a), common difference (d), and identifying AP sequences.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-5-2', title: 'Sum of First n Terms of an AP', description: 'Formula derivation and daily financial saving problem solving.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-5-3', title: 'Introduction to Geometric Progression (GP)', description: 'Common ratio (r), nth term and geometric series applications.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-math-ch6',
          chapterNumber: 6,
          title: 'Trigonometry',
          description: 'Trigonometric ratios (sin, cos, tan, cot, sec, cosec), values for 0°, 30°, 45°, 60°, 90°, complementary angle relations, fundamental identities.',
          topics: [
            { id: 't-6-1', title: 'Trigonometric Ratios & Specific Angle Table', description: 'Defining ratios on right triangles and evaluating exact values.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-6-2', title: 'Ratios of Complementary Angles', description: 'sin(90-θ) = cos θ, tan(90-θ) = cot θ, sec(90-θ) = cosec θ.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-6-3', title: 'Trigonometric Identities Proofs & Applications', description: 'sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        }
      ]
    },
    {
      id: 'c10-phy-sci',
      name: 'Physical Science',
      code: 'PHY-10',
      description: 'Curved mirrors & lenses, chemical equations, acids, bases & salts, structure of atom, periodic classification, chemical bonding, electricity.',
      icon: 'Atom',
      accentColor: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-500/20 via-indigo-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 18,
      chapters: [
        {
          id: 'c10-phy-ch1',
          chapterNumber: 1,
          title: 'Reflection of Light at Curved Surfaces',
          description: 'Concave & convex mirrors, pole, focus, radius of curvature, ray diagrams, mirror formula (1/f = 1/v + 1/u), magnification.',
          topics: [
            { id: 't-phy-1-1', title: 'Focal Length & Curved Mirrors Terminology', description: 'Center of curvature, principal axis, focus and relation R = 2f.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-phy-1-2', title: 'Ray Diagrams for Concave & Convex Mirrors', description: 'Image formation rules, real vs virtual images, solar cooker uses.', estimatedMinutes: 30, difficulty: 'Intermediate' },
            { id: 't-phy-1-3', title: 'Mirror Formula & Sign Convention', description: 'Cartesian sign convention and numerical calculations of v and m.', estimatedMinutes: 25, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c10-phy-ch2',
          chapterNumber: 2,
          title: 'Chemical Equations and Reactions',
          description: 'Writing word equations, balancing chemical equations, types of reactions (combination, decomposition, displacement, double displacement, redox).',
          topics: [
            { id: 't-phy-2-1', title: 'Writing & Balancing Chemical Equations', description: 'Law of conservation of mass, step-by-step balancing with state symbols.', estimatedMinutes: 25, difficulty: 'Basic' },
            { id: 't-phy-2-2', title: 'Types of Reactions: Decomposition & Displacement', description: 'Thermal, electrolytic decomposition and reactivity series single displacements.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-phy-2-3', title: 'Oxidation, Reduction, Corrosion & Rancidity', description: 'Electron transfer / oxygen gain-loss in redox, rust prevention and antioxidants.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-phy-ch3',
          chapterNumber: 3,
          title: 'Acids, Bases and Salts',
          description: 'Reaction with metals and carbonates, pH scale (0-14), universal indicator, salts (Bleaching powder, Baking soda, Washing soda, Plaster of Paris).',
          topics: [
            { id: 't-phy-3-1', title: 'Chemical Properties of Acids & Bases', description: 'Acid-metal reactions releasing H2 gas, acid-base neutralisation.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-phy-3-2', title: 'pH Scale & Importance in Everyday Life', description: 'pH in digestive system, tooth decay prevention, soil pH and acid rain.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-phy-3-3', title: 'Important Salts: Chemistry & Preparation', description: 'NaCl, NaHCO3, Na2CO3·10H2O, CaOCl2 and CaSO4·½H2O.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-phy-ch4',
          chapterNumber: 4,
          title: 'Structure of Atom',
          description: 'Electromagnetic spectrum, Planck’s quantum theory, Bohr’s model of hydrogen atom, Sommerfeld model, quantum numbers (n, l, m_l, m_s), electronic configuration.',
          topics: [
            { id: 't-phy-4-1', title: 'Bohr’s Model & Atomic Spectra', description: 'Stationary orbits, energy levels, emission and absorption lines.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-phy-4-2', title: 'Quantum Mechanical Model & 4 Quantum Numbers', description: 'Principal, Azimuthal, Magnetic, Spin quantum numbers and orbital shapes (s, p, d).', estimatedMinutes: 30, difficulty: 'Advanced' },
            { id: 't-phy-4-3', title: 'Aufbau Principle, Pauli & Hund’s Rules', description: 'Writing electron configurations (1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰) and exceptional cases.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-phy-ch5',
          chapterNumber: 5,
          title: 'Classification of Elements (Periodic Table)',
          description: 'Dobereiner triads, Newlands octaves, Mendeleev periodic law, Modern Periodic Table (Moseley), periodic trends (atomic radius, IE, EA, EN, metallic character).',
          topics: [
            { id: 't-phy-5-1', title: 'Modern Periodic Law & Table Layout (s, p, d, f Blocks)', description: 'Groups (1-18), Periods (1-7), noble gases and transition metals.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-phy-5-2', title: 'Periodic Trends across Periods and Groups', description: 'Variation of atomic size, ionization energy, electron affinity and electronegativity.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        },
        {
          id: 'c10-phy-ch6',
          chapterNumber: 6,
          title: 'Electric Current',
          description: 'Electric potential, potential difference, Ohm’s law (V = IR), factors affecting resistance, resistivity, resistors in series and parallel, Joule’s heating law.',
          topics: [
            { id: 't-phy-6-1', title: 'Ohm’s Law & Resistance Factors (R = ρL/A)', description: 'Verification of Ohm’s law, ohmic vs non-ohmic conductors.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-phy-6-2', title: 'Resistors in Series and Parallel Combinations', description: 'Derivation of R_eq = R1+R2 and 1/R_eq = 1/R1+1/R2, circuit diagrams.', estimatedMinutes: 30, difficulty: 'Intermediate' },
            { id: 't-phy-6-3', title: 'Kirchhoff’s Laws & Electric Power (P = VI = I²R = V²/R)', description: 'Junction law, loop law, domestic electrical wiring and fuses.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        }
      ]
    },
    {
      id: 'c10-bio-sci',
      name: 'Biological Science',
      code: 'BIO-10',
      description: 'Nutrition, respiration, transportation (circulatory system), excretion, control and coordination, reproduction, heredity and evolution.',
      icon: 'Dna',
      accentColor: 'from-emerald-500 to-teal-600',
      gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 16,
      chapters: [
        {
          id: 'c10-bio-ch1',
          chapterNumber: 1,
          title: 'Nutrition - The Food Supplying System',
          description: 'Autotrophic nutrition (photosynthesis, light & dark reactions, chloroplast), heterotrophic nutrition, human digestive system, enzymes, malnutrition.',
          topics: [
            { id: 't-bio-1-1', title: 'Photosynthesis: Light & Dark Reaction Mechanism', description: 'Hill reaction, photolysis of water, ATP/NADPH formation and Calvin cycle.', estimatedMinutes: 30, difficulty: 'Advanced' },
            { id: 't-bio-1-2', title: 'Human Alimentary Canal & Digestive Enzymes', description: 'Mouth, stomach (pepsin), liver (bile), pancreas (trypsin, lipase), small intestine absorption.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-bio-1-3', title: 'Malnutrition: Kwashiorkor, Marasmus & Obesity', description: 'Protein and calorie deficiency syndromes, vitamin deficiency table.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c10-bio-ch2',
          chapterNumber: 2,
          title: 'Respiration - The Energy Releasing System',
          description: 'Aerobic vs anaerobic respiration, glycolysis, Krebs cycle, human respiratory system, gas exchange in alveoli, transport of gases (HbO2).',
          topics: [
            { id: 't-bio-2-1', title: 'Human Respiratory System & Mechanism of Breathing', description: 'Pharynx, larynx, trachea, bronchi, lungs, diaphragm movement.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-bio-2-2', title: 'Cellular Respiration: Glycolysis & Fermentation', description: 'Lactic acid fermentation in muscles, alcoholic fermentation in yeast, ATP count.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-bio-ch3',
          chapterNumber: 3,
          title: 'Transportation - The Circulatory System',
          description: 'Human heart internal structure, cardiac cycle, double circulation, arteries, veins, capillaries, blood pressure (sphygmomanometer), lymphatic system.',
          topics: [
            { id: 't-bio-3-1', title: 'Internal Structure of Human Heart & Cardiac Cycle', description: 'Auricles, ventricles, bicuspid/tricuspid valves, SA node, systolic and diastolic phases.', estimatedMinutes: 30, difficulty: 'Intermediate' },
            { id: 't-bio-3-2', title: 'Double Circulation, Blood Pressure & Lymph', description: 'Pulmonary vs systemic circulation, normal BP (120/80 mmHg), tissue fluid role.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-bio-ch4',
          chapterNumber: 4,
          title: 'Excretion - The Wastage Disposing System',
          description: 'Human excretory system, kidney internal structure, nephron (functional unit), ultrafiltration, tubular reabsorption, dialysis (artificial kidney).',
          topics: [
            { id: 't-bio-4-1', title: 'Structure of Kidney & Nephron Malpighian Body', description: 'Bowman’s capsule, glomerulus, Henle’s loop, collecting duct.', estimatedMinutes: 30, difficulty: 'Intermediate' },
            { id: 't-bio-4-2', title: 'Mechanism of Urine Formation & Hemodialysis', description: 'Glomerular filtration, tubular reabsorption, tubular secretion and kidney transplants.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-bio-ch5',
          chapterNumber: 5,
          title: 'Control and Coordination',
          description: 'Central nervous system (Brain & Spinal Cord), peripheral nervous system, reflex arc, plant hormones (auxins, gibberellins, cytokinins, ABA, ethylene), tropisms.',
          topics: [
            { id: 't-bio-5-1', title: 'Human Brain Anatomy (Cerebrum, Cerebellum, Medulla)', description: 'Cranial nerves, meninges, cerebrospinal fluid and voluntary/involuntary actions.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-bio-5-2', title: 'Reflex Arc & Synaptic Signal Transmission', description: 'Sensory neuron, interneuron, motor neuron and immediate reflex action.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-bio-5-3', title: 'Phytohormones & Tropic Movements in Plants', description: 'Phototropism, geotropism, hydrotropism, thigmotropism, touch-me-not nastic response.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-bio-ch6',
          chapterNumber: 6,
          title: 'Heredity and Evolution',
          description: 'Mendel’s laws of inheritance, monohybrid and dihybrid crosses, genotype and phenotype ratios, sex determination in humans (XX vs XY), homologous vs analogous organs.',
          topics: [
            { id: 't-bio-6-1', title: 'Mendelian Monohybrid & Dihybrid Crosses', description: 'Law of Dominance, Segregation, Independent Assortment, 3:1 and 9:3:3:1 ratios.', estimatedMinutes: 30, difficulty: 'Advanced' },
            { id: 't-bio-6-2', title: 'Sex Determination in Humans & Evolutionary Evidence', description: '23 pairs of chromosomes, autosomes vs allosomes, fossils and Darwin’s natural selection.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c10-soc',
      name: 'Social Studies',
      code: 'SOC-10',
      description: 'India relief features, ideas of development, production & employment, Indian Constitution, national movement, Telangana State formation.',
      icon: 'Globe',
      accentColor: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 13,
      chapters: [
        {
          id: 'c10-soc-ch1',
          chapterNumber: 1,
          title: 'India: Relief Features',
          description: 'Geological background, major physiographic divisions: Himalayas, Indo-Gangetic Plains, Peninsular Plateau, Coastal Plains, Thar Desert, Islands.',
          topics: [
            { id: 't-soc-1-1', title: 'The Himalayas & Indo-Gangetic Plains', description: 'Greater Himalayas (Himadri), Himachal, Shivaliks, Terai, Bhabar, Khadar, Bhangar.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-soc-1-2', title: 'The Peninsular Plateau & Coastal Plains', description: 'Deccan Plateau, Western & Eastern Ghats, Coromandel & Malabar coasts, Andaman & Lakshadweep.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-soc-ch2',
          chapterNumber: 2,
          title: 'Ideas of Development',
          description: 'Income and other development goals, per capita income, World Bank vs UNDP criteria, Human Development Index (HDI), public facilities (PDS).',
          topics: [
            { id: 't-soc-2-1', title: 'Per Capita Income & World Development Reports', description: 'High income, middle income, low income country classification and limitations of averages.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-soc-2-2', title: 'Human Development Report (HDR) & Sustainability', description: 'Health, education indicators, life expectancy, gender development and environmental limits.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-soc-ch3',
          chapterNumber: 3,
          title: 'Production and Employment',
          description: 'Sectors of Indian economy (Primary, Secondary, Tertiary), GDP calculation, structural shift towards services, organised vs unorganised sectors.',
          topics: [
            { id: 't-soc-3-1', title: 'Sectors of Economy & Gross Domestic Product', description: 'Primary, secondary, and service sector contribution to GDP and historical shifts.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-soc-3-2', title: 'Organised vs Unorganised Sectors & Underemployment', description: 'Disguised unemployment, job security, MGNREGA social safety net.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c10-soc-ch4',
          chapterNumber: 4,
          title: 'The Indian Constitution & Governance',
          description: 'Constituent Assembly, Drafting Committee (Dr. B.R. Ambedkar), Preamble, Fundamental Rights, Federalism, Independent Judiciary.',
          topics: [
            { id: 't-soc-4-1', title: 'Making of the Indian Constitution', description: 'Drafting committee, key debates, and constitutional values.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-soc-4-2', title: 'Preamble, Fundamental Rights & Federal Structure', description: 'Sovereign, socialist, secular, democratic, republic values and basic structure doctrine.', estimatedMinutes: 25, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c10-soc-ch5',
          chapterNumber: 5,
          title: 'The Movement for the Formation of Telangana State',
          description: 'Gentlemen’s Agreement (1956), 1969 Telangana agitation, Mulki rules, Jai Telangana movement, JAC formation, Million March, Srikrishna Committee, AP Reorganisation Act 2014.',
          topics: [
            { id: 't-soc-5-1', title: 'Historical Grievances & 1969 Agitation', description: 'Violation of safeguards, Osmania University student protests, Chenna Reddy leadership.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-soc-5-2', title: 'Mass Movements (2001-2014) & Statehood Formation', description: 'Telangana JAC, Sagara Haram, Chalo Assembly, Parliamentary passage on 2 June 2014.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c10-eng',
      name: 'English',
      code: 'ENG-10',
      description: 'Our World through English: Personality development, wit and humour, human relations, discourse writing, defining relative clauses, passive voice.',
      icon: 'BookOpen',
      accentColor: 'from-violet-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-transparent',
      chaptersCount: 3,
      topicsCount: 8,
      chapters: [
        {
          id: 'c10-eng-ch1',
          chapterNumber: 1,
          title: 'Personality Development',
          description: 'Attitude is Altitude (Nick Vujicic), Every Success Story Is Also a Story of Great Failures, I Will Fly (APJ Abdul Kalam).',
          topics: [
            { id: 't-eng-1-1', title: 'Reading A: Attitude is Altitude', description: 'Inspirational journey of Nick Vujicic overcoming adversity.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-eng-1-2', title: 'Vocabulary & Defining Relative Clauses', description: 'Prefixes, suffixes, phrasal verbs, and who/which/that clauses.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-eng-1-3', title: 'Discourse: Biographical Sketch & Speech', description: 'Writing structured biographical sketches and formal speeches.', estimatedMinutes: 30, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-eng-ch2',
          chapterNumber: 2,
          title: 'Wit and Humour',
          description: 'The Dear Departed Part 1 & 2 (Play by Stanley Houghton), The Brave Potter.',
          topics: [
            { id: 't-eng-2-1', title: 'Reading A: The Dear Departed Part 1 & 2', description: 'Dramatic irony, family drama, and moral undertones in Victorian era.', estimatedMinutes: 25, difficulty: 'Basic' },
            { id: 't-eng-2-2', title: 'Grammar: Direct & Indirect Speech', description: 'Reporting verbs, tense adjustments, and imperative/assertive speech.', estimatedMinutes: 30, difficulty: 'Advanced' },
            { id: 't-eng-2-3', title: 'Discourse: Letter Writing & Dialogue', description: 'Formal/informal letter formatting and dramatic dialogue writing.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-eng-ch3',
          chapterNumber: 3,
          title: 'Human Relations',
          description: 'The Journey (Yeshe Dorjee Thongchi), Another Woman (Poem), Never Never Nest.',
          topics: [
            { id: 't-eng-3-1', title: 'Reading A: The Journey', description: 'Father-son relationship, dignity of physical labor and cultural depth.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-eng-3-2', title: 'Grammar: Active Voice & Passive Voice', description: 'Subject-object transpositions and agent omissions.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    },
    {
      id: 'c10-tel',
      name: 'Telugu (తెలుగు - ప్రథమ భాష)',
      code: 'TEL-10',
      description: 'సింగిడి-3: బమ్మెర పోతన దానశీలము, సామల సదాశివ భాషా మాధుర్యం, దాశరథి వీర తెలంగాణ, ఉత్పలమాల ఛందస్సు.',
      icon: 'Languages',
      accentColor: 'from-pink-500 to-rose-600',
      gradient: 'bg-gradient-to-br from-pink-500/20 via-rose-600/10 to-transparent',
      chaptersCount: 3,
      topicsCount: 7,
      chapters: [
        {
          id: 'c10-tel-ch1',
          chapterNumber: 1,
          title: 'దానశీలము (Dana Sheelamu)',
          description: 'బమ్మెర పోతన శ్రీమదాంధ్ర భాగవతంలోని బలి చక్రవర్తి దాన గుణం మరియు గురు-శిష్య సంవాదం.',
          topics: [
            { id: 't-tel-1-1', title: 'కవి పరిచయం & పాఠ్య భాగ నేపథ్యం', description: 'పోతన కవిత్వ వైభవం, స్కంధం విశేషాలు మరియు సందర్భం.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-tel-1-2', title: 'ముఖ్యమైన పద్యాలు & ప్రతిపదార్థాలు', description: 'కలడందురు దీనులయెడల, కులమున్ రాజ్యమున్ పద్య భావాలు.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-tel-1-3', title: 'సంధులు & సమాసాలు (ఉత్వ సంధి, తత్పురుష)', description: 'వ్యాకరణ సూత్రాలు మరియు పద విభజన సాధన.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c10-tel-ch2',
          chapterNumber: 2,
          title: 'ఎవరి భాష వాళ్ళకు వినసొంపు',
          description: 'డాక్టర్ సామల సదాశివ గారి తెలంగాణ మాండలిక భాషా మాధుర్యం వ్యాసం.',
          topics: [
            { id: 't-tel-2-1', title: 'పాఠ్యభాగ వివరణ & తెలంగాణ మాండలికం', description: 'యాస, జాతీయాలు, సామెతలు మరియు భాషా ప్రాధాన్యత.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-tel-2-2', title: 'సొంత వాక్యాలు & పర్యాయపదాలు', description: 'భాషాంశాలు, నానార్థాలు మరియు ప్రకృతి-వికృతులు.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c10-tel-ch3',
          chapterNumber: 3,
          title: 'వీర తెలంగాణ',
          description: 'దాశరథి కృష్ణమాచార్య విరచిత తెలంగాణ చారిత్రక పోరాట కవితా వైభవం.',
          topics: [
            { id: 't-tel-3-1', title: 'దాశరథి కవిత్వ శైలి & ఉద్యమ నేపథ్యం', description: 'నా తెలంగాణ కోటి రతనాల వీణ స్ఫూర్తి మరియు పద్యాలు.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-tel-3-2', title: 'ఛందస్సు (ఉత్పలమాల, చంపకమాల)', description: 'గణ విభజన, యతి ప్రాసలు మరియు లక్షణాలు.', estimatedMinutes: 30, difficulty: 'Advanced' }
          ]
        }
      ]
    },
    {
      id: 'c10-hin',
      name: 'Hindi (हिंदी - द्वितीय भाषा)',
      code: 'HIN-10',
      description: 'लोकभारती / स्पर्श: बरसते बादल, ईदगाह, भक्ति पद, कबीर-रैदास दोहे, संधि एवं वाक्य शुद्धिकरण।',
      icon: 'Languages',
      accentColor: 'from-amber-500 to-red-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-red-600/10 to-transparent',
      chaptersCount: 3,
      topicsCount: 7,
      chapters: [
        {
          id: 'c10-hin-ch1',
          chapterNumber: 1,
          title: 'बरसते बादल (Baraste Baadal - सुमित्रानंदन पंत)',
          description: 'प्रकृति के सुकुमार कवि पंत जी की वर्षा ऋतु की अनुपम सौंदर्य कविता।',
          topics: [
            { id: 't-hin-1-1', title: 'कविता का भावार्थ एवं प्राकृतिक सौंदर्य', description: 'मेघों का गर्जन, मोर का नृत्य और जनमानस में उल्लास।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-hin-1-2', title: 'पर्यायवाची एवं तुकांत शब्द', description: 'बादल, धरा, तरु शब्दों का व्याकरणिक अभ्यास।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c10-hin-ch2',
          chapterNumber: 2,
          title: 'ईदगाह (Idgah - मुंशी प्रेमचंद)',
          description: 'मासूम हामिद का अपनी दादी अमीना के प्रति अद्वितीय प्रेम और चिमटे का त्याग।',
          topics: [
            { id: 't-hin-2-1', title: 'कहानी सारांश एवं बाल मनोविज्ञान', description: 'मेले में हामिद का विवेकपूर्ण निर्णय और मातृत्व स्नेह।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-hin-2-2', title: 'मुहावरे एवं वाक्य प्रयोग', description: 'दिल कचोटना, पैरों में पर लगना आदि मुहावरों का अर्थ।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c10-hin-ch3',
          chapterNumber: 3,
          title: 'कण-कण का अधिकारी (रामधारी सिंह ‘दिनकर’)',
          description: 'श्रमिकों, किसानों के श्रम का गौरव और सामाजिक न्याय की ओजस्वी कविता।',
          topics: [
            { id: 't-hin-3-1', title: 'कविता का सार एवं श्रम का महत्व', description: 'धरती के वैभव पर मेहनत करने वालों का प्रथम अधिकार।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-hin-3-2', title: 'संधि विच्छेद एवं समास', description: 'भाग्यवान, परिश्रमी शब्दों का व्याकरण अध्ययन।', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        }
      ]
    }
  ]
};
