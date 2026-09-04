import { ClassSyllabus } from '../../types';

export const CLASS_6_SYLLABUS: ClassSyllabus = {
  classLevel: 'Class 6',
  academicBoard: 'Telangana State Board (SCERT)',
  curriculumVersion: 'TS-SCERT-2024-25',
  academicYear: '2024-2025',
  sourceAuthority: 'State Council of Educational Research and Training (SCERT), Telangana',
  sourceReference: 'Government of Telangana School Education Department & SCERT Textbooks',
  subjects: [
    {
      id: 'c6-tel',
      name: 'Telugu (తెలుగు - ప్రథమ భాష)',
      code: 'TEL-06',
      description: 'నవవసంతం-1 పాఠ్యపుస్తకంలోని గేయాలు, పద్యాలు, కథలు మరియు భాషాంశాలు.',
      icon: 'Languages',
      accentColor: 'from-pink-500 to-rose-600',
      gradient: 'bg-gradient-to-br from-pink-500/20 via-rose-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 14,
      chapters: [
        {
          id: 'c6-tel-ch1',
          chapterNumber: 1,
          title: 'అభినందన (Abhinandana)',
          description: 'రైతులు, సైనికుల శ్రమను గౌరవిస్తూ బోయి భీమన్న గారి గేయ వైభవం.',
          topics: [
            { id: 't-c6-tel-1-1', title: 'గేయ భావం & దేశభక్తి సందేశం', description: 'రైతు, జవానుల దేశసేవను ప్రశంసించడం.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-tel-1-2', title: 'భాషాంశాలు: వర్ణమాల & గుణింతాలు', description: 'అచ్చులు, హల్లులు, ఉభయాక్షరాలు మరియు వ్యాకరణ పదాలు.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-tel-ch2',
          chapterNumber: 2,
          title: 'స్నేహబంధం (Snehabandham)',
          description: 'పరస్పర సహాయం, మిత్రుల ఐక్యతను తెలియజేసే పంచతంత్ర కథ.',
          topics: [
            { id: 't-c6-tel-2-1', title: 'చిత్రాంగ, లఘుపతనక, హిరణ్యక మిత్రుల కథ', description: 'ఆపదలో ఆదుకునే స్నేహ ధర్మం.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-tel-2-2', title: 'సొంత వాక్యాలు & విభక్తులు', description: 'ప్రథమా, ద్వితీయా, తృతీయా విభక్తులు.', estimatedMinutes: 20, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-tel-ch3',
          chapterNumber: 3,
          title: 'వర్షం (Varsham)',
          description: 'డాక్టర్ పల్లా దుర్గయ్య రచించిన వానాకాలపు ప్రకృతి అందాల వర్ణన.',
          topics: [
            { id: 't-c6-tel-3-1', title: 'పద్యాలు & ప్రతిపదార్థ భావాలు', description: 'వర్షం కురిసినప్పుడు పల్లె ప్రకృతి చిత్రణ.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c6-tel-3-2', title: 'పర్యాయపదాలు & ప్రకృతి-వికృతులు', description: 'వర్షం, మేఘం, ధరణి మొదలైన పదాల అధ్యయనం.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-tel-ch4',
          chapterNumber: 4,
          title: 'లేఖ (Lekha - దర్శనీయ స్థలాలు)',
          description: 'తెలంగాణలోని చారిత్రక, పర్యాటక ప్రదేశాల విశేషాలు తెలిపే మిత్రుని లేఖ.',
          topics: [
            { id: 't-c6-tel-4-1', title: 'లేఖ రచన విధానం & ప్రదేశాల పరిచయం', description: 'రామప్ప, వేయిస్తంభాల గుడి, నాగార్జున సాగర్ విశేషాలు.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-tel-ch5',
          chapterNumber: 5,
          title: 'శతక సుధ (Sathaka Sudha)',
          description: 'సుమతీ, వేమన, కుమార శతక పద్యాల నైతిక విలువల పరిమళం.',
          topics: [
            { id: 't-c6-tel-5-1', title: 'శతక పద్యాలు & నీతి సూక్తులు', description: 'మానవతా విలువలు, పెద్దల పట్ల గౌరవం బోధించే పద్యాలు.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-tel-ch6',
          chapterNumber: 6,
          title: 'మా కొద్దీ తెల్ల దొరతనము',
          description: 'గరిమెళ్ల సత్యనారాయణ గారి ప్రసిద్ధ స్వాతంత్ర్యోద్యమ జాతీయ గీతం.',
          topics: [
            { id: 't-c6-tel-6-1', title: 'స్వాతంత్ర్య పోరాటం & దేశభక్తి గేయం', description: 'భారతీయుల కష్టాలు, ఆంగ్లేయుల పాలన వ్యతిరేకత.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c6-hin',
      name: 'Hindi (हिंदी - द्वितीय भाषा)',
      code: 'HIN-06',
      description: 'बाल वसंत-1: वर्णमाला, बारहखड़ी, बाल गीत, प्रेरक कहानियाँ एवं बुनियादी व्याकरण।',
      icon: 'Languages',
      accentColor: 'from-amber-500 to-red-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-red-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c6-hin-ch1',
          chapterNumber: 1,
          title: 'आम ले लो आम (Aam Le Lo Aam)',
          description: 'बाल गीत के माध्यम से फलों का परिचय एवं सरल हिंदी शब्दों का ज्ञान।',
          topics: [
            { id: 't-c6-h1-1', title: 'गीत वाचन एवं शब्द ज्ञान', description: 'कविता पठन एवं फलों के नाम।', estimatedMinutes: 15, difficulty: 'Basic' },
            { id: 't-c6-h1-2', title: 'वर्णमाला एवं बारहखड़ी अभ्यास', description: 'स्वर, व्यंजन एवं मात्राओं का सही उच्चारण।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-hin-ch2',
          chapterNumber: 2,
          title: 'हमारा गाँव (Hamara Gaon)',
          description: 'गाँव की प्राकृतिक सुंदरता, हरियाली एवं कृषक जीवन का वर्णन।',
          topics: [
            { id: 't-c6-h2-1', title: 'पाठ का सारांश एवं ग्रामीण परिवेश', description: 'गाँव का महत्व एवं प्राकृतिक सौंदर्य।', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-h2-2', title: 'संज्ञा एवं वचन', description: 'व्यक्ति, स्थान के नाम तथा एकवचन-बहुवचन।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-hin-ch3',
          chapterNumber: 3,
          title: 'बाज़ार (Bazaar)',
          description: 'दुकानें, व्यापार एवं दैनिक जीवन में लेन-देन का संवाद।',
          topics: [
            { id: 't-c6-h3-1', title: 'संवाद एवं शब्दावली', description: 'खरीद-बिक्री के उपयोगी हिंदी वाक्य।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-hin-ch4',
          chapterNumber: 4,
          title: 'प्यारा भारत देश (Pyaara Bharat Desh)',
          description: 'देशभक्ति कविता - भारत की विविधता में एकता एवं संस्कृति।',
          topics: [
            { id: 't-c6-h4-1', title: 'कविता भावार्थ एवं राष्ट्रीय प्रतीक', description: 'तिरंगा, राष्ट्रगान एवं देश की महानता।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-hin-ch5',
          chapterNumber: 5,
          title: 'स्वास्थ्य ही धन है (Swasthya Hi Dhan Hai)',
          description: 'स्वच्छता, संतुलित आहार और व्यायाम का महत्व।',
          topics: [
            { id: 't-c6-h5-1', title: 'अच्छी आदतें एवं स्वास्थ्य नियम', description: 'दैनिक सफाई और स्वास्थ्य सुरक्षा।', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c6-eng',
      name: 'English',
      code: 'ENG-06',
      description: 'Our World through English: Prose stories, poems, grammar fundamentals and writing skills.',
      icon: 'BookOpen',
      accentColor: 'from-violet-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 12,
      chapters: [
        {
          id: 'c6-eng-ch1',
          chapterNumber: 1,
          title: 'Peace and Harmony',
          description: 'Animals living together in forest, jackal entry, and unity restored through friendship.',
          topics: [
            { id: 't-c6-e1-1', title: 'Story Reading: Peace and Harmony', description: 'Moral values, unity, and coexistence in animal kingdom.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-e1-2', title: 'Grammar: Nouns, Pronouns & Adjectives', description: 'Identifying proper, common, collective nouns and describing words.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-eng-ch2',
          chapterNumber: 2,
          title: 'Playing with Words (V.V.S. Laxman)',
          description: 'Interview with cricket legend V.V.S. Laxman highlighting dedication and modesty.',
          topics: [
            { id: 't-c6-e2-1', title: 'Reading: Very Very Special Laxman', description: 'Sportsmanship, dedication and lessons from cricket.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-e2-2', title: 'Grammar: Simple Present & Past Tenses', description: 'Verb conjugations and daily routine descriptions.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-eng-ch3',
          chapterNumber: 3,
          title: 'What Can a Dollar and Eleven Cents Do?',
          description: 'A touching story of little Tess saving her brother through pure faith and love.',
          topics: [
            { id: 't-c6-e3-1', title: 'Story: Tess and the Miracle', description: 'Family affection and selfless determination.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-eng-ch4',
          chapterNumber: 4,
          title: 'An Adventure (The Lost Child)',
          description: 'Exploration, nature appreciation and descriptive narrative writing.',
          topics: [
            { id: 't-c6-e4-1', title: 'Reading & Paragraph Writing', description: 'Sequencing events and writing descriptive paragraphs.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-eng-ch5',
          chapterNumber: 5,
          title: 'Plant a Tree',
          description: 'Environmental conservation, benefits of forests and saving green cover.',
          topics: [
            { id: 't-c6-e5-1', title: 'Poem & Eco-Awareness', description: 'Importance of trees, oxygen cycle and green earth.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c6-maths',
      name: 'Mathematics',
      code: 'MATH-06',
      description: 'Knowing numbers, whole numbers, fractions, decimals, integers, algebra and geometry.',
      icon: 'Calculator',
      accentColor: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent',
      chaptersCount: 6,
      topicsCount: 16,
      chapters: [
        {
          id: 'c6-math-ch1',
          chapterNumber: 1,
          title: 'Knowing Our Numbers',
          description: 'Comparing numbers, place values (Indian & International systems), estimation and Roman numerals.',
          topics: [
            { id: 't-c6-m1-1', title: 'Large Numbers & Place Value Systems', description: 'Indian System (Crores/Lakhs) and International System (Millions).', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-m1-2', title: 'Estimation & Roman Numerals', description: 'Rounding off to nearest tens/hundreds and Roman symbols.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-math-ch2',
          chapterNumber: 2,
          title: 'Whole Numbers',
          description: 'Natural numbers, whole numbers, representation on number line, properties of addition and multiplication.',
          topics: [
            { id: 't-c6-m2-1', title: 'Number Line Operations & Properties', description: 'Closure, Commutative, Associative and Distributive properties.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-math-ch3',
          chapterNumber: 3,
          title: 'Playing with Numbers (HCF & LCM)',
          description: 'Factors, multiples, prime and composite numbers, divisibility tests, prime factorization, HCF and LCM.',
          topics: [
            { id: 't-c6-m3-1', title: 'Divisibility Rules (2, 3, 4, 5, 6, 8, 9, 10, 11)', description: 'Quick tests for factors and prime factor tree method.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c6-m3-2', title: 'Highest Common Factor (HCF) & LCM', description: 'Calculating HCF and LCM by prime factorization and division method.', estimatedMinutes: 30, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-math-ch4',
          chapterNumber: 4,
          title: 'Basic Geometrical Ideas',
          description: 'Points, lines, line segments, rays, angles, polygons, triangles, quadrilaterals and circles.',
          topics: [
            { id: 't-c6-m4-1', title: 'Lines, Rays, Angles & Triangles', description: 'Vertices, arms, interior and exterior regions.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-m4-2', title: 'Circles & Circle Terminology', description: 'Center, radius, diameter, chord, sector, segment and arc.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-math-ch5',
          chapterNumber: 5,
          title: 'Integers',
          description: 'Positive, negative integers, representation on number line, addition and subtraction of integers.',
          topics: [
            { id: 't-c6-m5-1', title: 'Concept of Integers & Number Line', description: 'Opposite values, absolute values and order of integers.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-m5-2', title: 'Addition & Subtraction of Integers', description: 'Rules for signs and solving arithmetic problems.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-math-ch6',
          chapterNumber: 6,
          title: 'Fractions and Decimals',
          description: 'Proper, improper, mixed fractions, equivalent fractions, decimals place value and operations.',
          topics: [
            { id: 't-c6-m6-1', title: 'Fractions: Types & Operations', description: 'Like/unlike fractions, simplifying and arithmetic.', estimatedMinutes: 25, difficulty: 'Intermediate' },
            { id: 't-c6-m6-2', title: 'Decimals & Applications in Money/Length', description: 'Converting fractions to decimals and vice versa.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c6-sci',
      name: 'General Science',
      code: 'SCI-06',
      description: 'Our food, playing with magnets, rain and water cycle, materials, habitat, simple electric circuits.',
      icon: 'Atom',
      accentColor: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-500/20 via-indigo-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 13,
      chapters: [
        {
          id: 'c6-sci-ch1',
          chapterNumber: 1,
          title: 'Our Food and Its Components',
          description: 'Food ingredients, carbohydrates, proteins, fats, roughage, balanced diet and deficiency diseases.',
          topics: [
            { id: 't-c6-s1-1', title: 'Testing for Starch, Proteins & Fats', description: 'Iodine test, copper sulphate and caustic soda experiments.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-s1-2', title: 'Balanced Diet & Deficiency Diseases', description: 'Scurvy, Rickets, Anemia, Goitre and Kwashiorkor prevention.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-sci-ch2',
          chapterNumber: 2,
          title: 'Playing with Magnets',
          description: 'Discovery of magnets, magnetic and non-magnetic materials, poles of magnet, magnetic compass.',
          topics: [
            { id: 't-c6-s2-1', title: 'Poles of Magnet & Attraction/Repulsion', description: 'North-South alignment and properties of bar magnets.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-s2-2', title: 'Making Your Own Magnet & Compass', description: 'Magnetizing iron needles and navigational compass usage.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-sci-ch3',
          chapterNumber: 3,
          title: 'Rain: Where Does It Come From? (Water Cycle)',
          description: 'Evaporation, condensation, cloud formation, precipitation and water conservation.',
          topics: [
            { id: 't-c6-s3-1', title: 'Evaporation & Condensation Mechanism', description: 'Water vapor transformations and rainfall factors.', estimatedMinutes: 20, difficulty: 'Basic' },
            { id: 't-c6-s3-2', title: 'Water Cycle & Rainwater Harvesting', description: 'Nature’s water replenishment and harvesting techniques.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-sci-ch4',
          chapterNumber: 4,
          title: 'Habitat and Living Things',
          description: 'Terrestrial, aquatic habitats, biotic and abiotic components, adaptations in plants and animals.',
          topics: [
            { id: 't-c6-s4-1', title: 'Adaptations in Desert, Pond & Mountain Habitats', description: 'Cactus, fish, camel and evergreen survival strategies.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-sci-ch5',
          chapterNumber: 5,
          title: 'Simple Electric Circuits',
          description: 'Electric cell, bulb, switch, conductors and insulators, circuit diagrams.',
          topics: [
            { id: 't-c6-s5-1', title: 'Electric Cell, Bulb & Closed Circuits', description: 'Terminals, filament, switch role and flow of electricity.', estimatedMinutes: 25, difficulty: 'Basic' }
          ]
        }
      ]
    },
    {
      id: 'c6-soc',
      name: 'Social Studies',
      code: 'SOC-06',
      description: 'Reading maps, globe model of earth, land forms of Telangana, early hunter-gatherers and local governance.',
      icon: 'Globe',
      accentColor: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent',
      chaptersCount: 5,
      topicsCount: 11,
      chapters: [
        {
          id: 'c6-soc-ch1',
          chapterNumber: 1,
          title: 'Reading and Making Maps',
          description: 'Directions, cardinal points, symbols, scale on maps and sketch making.',
          topics: [
            { id: 't-c6-so1-1', title: 'Directions & Cardinal Points', description: 'North, South, East, West and intermediate directions.', estimatedMinutes: 15, difficulty: 'Basic' },
            { id: 't-c6-so1-2', title: 'Symbols & Conventional Signs in Maps', description: 'Bridge, railway, post office, police station symbols.', estimatedMinutes: 15, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-soc-ch2',
          chapterNumber: 2,
          title: 'Globe - Model of the Earth',
          description: 'Latitudes, longitudes, equator, poles, hemispheres, earth rotation and revolution.',
          topics: [
            { id: 't-c6-so2-1', title: 'Latitudes, Longitudes & Hemispheres', description: 'Tropic of Cancer, Capricorn, Prime Meridian and time zones.', estimatedMinutes: 25, difficulty: 'Intermediate' }
          ]
        },
        {
          id: 'c6-soc-ch3',
          chapterNumber: 3,
          title: 'Landforms of Telangana (Plains & Plateaus)',
          description: 'Deccan plateau relief, Godavari and Krishna basin, village life and agricultural seasons.',
          topics: [
            { id: 't-c6-so3-1', title: 'Plateau Features, Red Soils & Tanks', description: 'Telangana topography, chain of tanks system (Mission Kakatiya).', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-soc-ch4',
          chapterNumber: 4,
          title: 'Early Life of Humans (Hunter-Gatherers)',
          description: 'Stone age tools, cave paintings in Telangana (Pandavula Gutta), discovery of fire.',
          topics: [
            { id: 't-c6-so4-1', title: 'Paleolithic Tools & Rock Art in Telangana', description: 'Early settlement sites, hunting methods and shelter.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        },
        {
          id: 'c6-soc-ch5',
          chapterNumber: 5,
          title: 'Democratic Government & Local Self Government',
          description: 'Gram Panchayat, Sarpanch, Ward Members, Mandal Parishad and voting system.',
          topics: [
            { id: 't-c6-so5-1', title: 'Village Panchayat Functions & Decision Making', description: 'Local civic amenities, sanitation, road maintenance and taxes.', estimatedMinutes: 20, difficulty: 'Basic' }
          ]
        }
      ]
    }
  ]
};
