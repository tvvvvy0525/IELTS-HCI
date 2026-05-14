function toDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isWithinDays(timestamp, days, now) {
  const date = toDate(timestamp)
  if (!date) return false
  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000
}

function getSubjectCount(records, subject) {
  return records.filter((record) => record.subject === subject).length
}

function getLowestAccuracyRecord(records) {
  return [...records]
    .filter((record) => Number.isFinite(record.accuracy))
    .sort((a, b) => a.accuracy - b.accuracy)[0] || null
}

export function getHistoryInsights(records = [], now = new Date()) {
  const recentRecords = records.filter((record) => isWithinDays(record.timestamp, 7, now))

  if (!recentRecords.length) {
    return [
      {
        id: 'empty-start',
        title: '先完成第一套阅读练习',
        description: '最近 7 天还没有学习记录，建议先做一套阅读，熟悉答题和提交流程。',
        actionLabel: '开始阅读',
        to: '/exam/reading',
      },
    ]
  }

  if (getSubjectCount(recentRecords, 'writing') === 0) {
    return [
      {
        id: 'missing-writing',
        title: '补一篇写作，完成闭环',
        description: '最近 7 天还没有写作记录。写作是最容易中断的一环，建议今天补 1 题。',
        actionLabel: '开始写作',
        to: '/exam/writing',
      },
    ]
  }

  if (getSubjectCount(recentRecords, 'listening') === 0) {
    return [
      {
        id: 'missing-listening',
        title: '安排一套听力练习',
        description: '最近 7 天还没有听力记录，建议补一套限时听力，避免只练单科。',
        actionLabel: '开始听力',
        to: '/exam/listening',
      },
    ]
  }

  const weakestRecord = getLowestAccuracyRecord(recentRecords)
  if (weakestRecord && weakestRecord.accuracy < 65) {
    const subjectMap = {
      reading: { label: '阅读', to: '/exam/reading' },
      listening: { label: '听力', to: '/exam/listening' },
      writing: { label: '写作', to: '/exam/writing' },
      speaking: { label: '口语', to: '/exam/speaking' },
    }
    const subject = subjectMap[weakestRecord.subject] || { label: '该科', to: '/exam/dashboard' }

    return [
      {
        id: 'weakest-subject',
        title: `优先复盘${subject.label}`,
        description: `最近 7 天里，${subject.label}的最低正确率只有 ${weakestRecord.accuracy}%。建议先回到这一科做一套针对性练习。`,
        actionLabel: `去练${subject.label}`,
        to: subject.to,
      },
    ]
  }

  return [
    {
      id: 'good-progress',
      title: '继续保持今天的节奏',
      description: '最近 7 天记录比较均衡，可以继续按照“词汇 -> 阅读 -> 听力 -> 写作”的顺序完成今日任务。',
      actionLabel: '开始今日任务',
      to: '/exam/dashboard',
    },
  ]
}
