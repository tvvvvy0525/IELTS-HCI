// Speaking 会话状态模型 & Part 1/2/3 内置题库

// ────────────────────────────────────────────────────
// 内置题库（5 套完整题组）
// ────────────────────────────────────────────────────

const TOPIC_SETS = [
  {
    id: 'topic-hometown',
    part1: {
      topic: 'Hometown & Living',
      questions: [
        'Where are you from originally?',
        'Do you like living there? Why or why not?',
        'What is your hometown known for?',
        'Has your hometown changed much over the years?',
        'Would you like to live there in the future?',
      ],
    },
    part2: {
      topic: 'Describe a place you visited that you particularly liked.',
      cueCard: [
        'You should say:',
        'where this place was',
        'when you went there',
        'what you did there',
        'and explain why you particularly liked it.',
      ],
      prepSecs: 60,
      speakSecs: 120,
    },
    part3: {
      topic: 'Tourism & Travel',
      questions: [
        'Why do people enjoy travelling to new places?',
        'How has tourism changed in your country over the past decade?',
        'Do you think tourism has a negative impact on local culture? Why?',
        'What kinds of places are most popular with tourists in your country?',
        'How important is it to preserve historical sites for tourists?',
      ],
    },
  },
  {
    id: 'topic-technology',
    part1: {
      topic: 'Technology & Internet',
      questions: [
        'How often do you use the internet?',
        'What do you mainly use the internet for?',
        'Do you think technology has made life easier?',
        'Are there any downsides to using technology too much?',
        'What technology do you find most useful in your daily life?',
      ],
    },
    part2: {
      topic: 'Describe a piece of technology you use every day.',
      cueCard: [
        'You should say:',
        'what it is',
        'how you use it',
        'how long you have been using it',
        'and explain why it is important to you.',
      ],
      prepSecs: 60,
      speakSecs: 120,
    },
    part3: {
      topic: 'Technology in Society',
      questions: [
        'How has technology changed the way people communicate?',
        'Do you think children are too dependent on technology today?',
        'What are the advantages and disadvantages of working from home using technology?',
        'How might technology change education in the future?',
        'Do you think technology can replace human jobs? Why or why not?',
      ],
    },
  },
  {
    id: 'topic-food',
    part1: {
      topic: 'Food & Eating Habits',
      questions: [
        'Do you enjoy cooking?',
        'What kind of food do you usually eat?',
        'Are there any foods you dislike? Why?',
        'Do you prefer eating at home or at a restaurant?',
        'Has your diet changed in recent years?',
      ],
    },
    part2: {
      topic: 'Describe a meal you enjoyed very much.',
      cueCard: [
        'You should say:',
        'what the meal was',
        'where you had it',
        'who you had it with',
        'and explain why you enjoyed it so much.',
      ],
      prepSecs: 60,
      speakSecs: 120,
    },
    part3: {
      topic: 'Food Culture & Society',
      questions: [
        'Why do you think food is so important in many cultures?',
        'How has globalisation affected the food people eat?',
        'Do you think people today eat more healthily than in the past?',
        'What can governments do to encourage healthier eating habits?',
        'How has the restaurant industry changed in recent years?',
      ],
    },
  },
  {
    id: 'topic-education',
    part1: {
      topic: 'Education & Learning',
      questions: [
        'What are you studying, or what did you study?',
        'Do you enjoy studying? Why or why not?',
        'What subject did you find most interesting at school?',
        'Do you think education in your country is good?',
        'Would you like to study abroad?',
      ],
    },
    part2: {
      topic: 'Describe a teacher who has had a great influence on you.',
      cueCard: [
        'You should say:',
        'who this teacher was',
        'what subject they taught',
        'how they influenced you',
        'and explain why their influence was so important to you.',
      ],
      prepSecs: 60,
      speakSecs: 120,
    },
    part3: {
      topic: 'Education Systems & Policy',
      questions: [
        'What are the main qualities of a good teacher?',
        'How important is a university degree in today\'s job market?',
        'Should education focus more on academic subjects or practical skills?',
        'How can technology improve the quality of education?',
        'Do you think students have too much pressure in the current education system?',
      ],
    },
  },
  {
    id: 'topic-environment',
    part1: {
      topic: 'Environment & Nature',
      questions: [
        'Do you care about environmental issues?',
        'What do you do in your daily life to help the environment?',
        'Do you prefer to spend time outdoors or indoors?',
        'Have you noticed any changes in the environment where you live?',
        'Do you think people are doing enough to protect the environment?',
      ],
    },
    part2: {
      topic: 'Describe a time when you did something to help protect the environment.',
      cueCard: [
        'You should say:',
        'what you did',
        'when and where you did it',
        'why you decided to do it',
        'and explain how you felt about doing it.',
      ],
      prepSecs: 60,
      speakSecs: 120,
    },
    part3: {
      topic: 'Environmental Policy & Action',
      questions: [
        'Who is most responsible for protecting the environment: individuals, companies, or governments?',
        'What can be done to reduce plastic pollution?',
        'How has climate change affected your country?',
        'Do you think renewable energy can fully replace fossil fuels?',
        'Why do some people not care about environmental issues?',
      ],
    },
  },
]

// ────────────────────────────────────────────────────
// 会话状态模型
// ────────────────────────────────────────────────────

/** Part 2 计时阶段 */
export const PART2_PHASE = {
  IDLE: 'idle',
  PREP: 'prep',       // 准备阶段（60s）
  SPEAKING: 'speaking', // 作答阶段（120s）
  DONE: 'done',
}

/**
 * 创建新的 Speaking 会话
 * @param {{ part: 'Part1'|'Part2'|'Part3', topicId?: string }} options
 * @returns {SpeakingSession}
 */
export function createSpeakingSession(options = {}) {
  const { part = 'Part2', topicId } = options
  const topic = topicId
    ? TOPIC_SETS.find((t) => t.id === topicId)
    : TOPIC_SETS[Math.floor(Math.random() * TOPIC_SETS.length)]

  const selectedTopic = topic || TOPIC_SETS[0]

  return {
    sessionId: `speaking-${Date.now()}`,
    part,
    topicId: selectedTopic.id,
    startedAt: new Date().toISOString(),
    endedAt: null,
    // 转写片段数组：[{ questionIndex, transcript, durationSecs, asrProvider }]
    segments: [],
    // Part 2 计时状态
    part2Phase: PART2_PHASE.IDLE,
    part2PrepRemaining: selectedTopic.part2?.prepSecs ?? 60,
    part2SpeakRemaining: selectedTopic.part2?.speakSecs ?? 120,
    // 题卡数据
    topic: selectedTopic,
  }
}

/**
 * 获取所有可用题组列表（用于选题 UI）
 */
export function getTopicList() {
  return TOPIC_SETS.map(({ id, part1, part2, part3 }) => ({
    id,
    title: part1.topic,
    part2Title: part2.topic,
    part3Title: part3.topic,
  }))
}

/**
 * 获取指定 ID 的题组
 * @param {string} topicId
 */
export function getTopicById(topicId) {
  return TOPIC_SETS.find((t) => t.id === topicId) || TOPIC_SETS[0]
}

/**
 * 获取随机题组
 */
export function getRandomTopic() {
  return TOPIC_SETS[Math.floor(Math.random() * TOPIC_SETS.length)]
}

/**
 * 向会话添加转写片段
 * @param {object} session
 * @param {object} segment
 */
export function addSessionSegment(session, segment) {
  session.segments.push({
    questionIndex: segment.questionIndex ?? 0,
    transcript: segment.transcript ?? '',
    durationSecs: segment.durationSecs ?? 0,
    asrProvider: segment.asrProvider ?? 'unknown',
    timestamp: new Date().toISOString(),
  })
}

/**
 * 获取会话全部转写文本（拼接）
 * @param {object} session
 * @returns {string}
 */
export function getSessionFullTranscript(session) {
  return session.segments.map((s) => s.transcript).filter(Boolean).join('\n\n')
}

/**
 * 计算会话总时长（秒）
 * @param {object} session
 * @returns {number}
 */
export function getSessionTotalDuration(session) {
  return session.segments.reduce((sum, s) => sum + (s.durationSecs || 0), 0)
}
