// 预设的TTS语音配置 - 基于Google Cloud TTS实际可用语音
export const TTS_VOICES = {
  'en-US': [
    // Chirp3-HD 系列 (最新高质量语音，以天体命名)
    { name: 'en-US-Chirp3-HD-Achernar', displayName: 'Achernar (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Achird', displayName: 'Achird (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Algenib', displayName: 'Algenib (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Algieba', displayName: 'Algieba (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Alnilam', displayName: 'Alnilam (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Aoede', displayName: 'Aoede (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Autonoe', displayName: 'Autonoe (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Callirrhoe', displayName: 'Callirrhoe (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Charon', displayName: 'Charon (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Despina', displayName: 'Despina (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Enceladus', displayName: 'Enceladus (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Erinome', displayName: 'Erinome (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Fenrir', displayName: 'Fenrir (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Gacrux', displayName: 'Gacrux (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Iapetus', displayName: 'Iapetus (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Kore', displayName: 'Kore (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Laomedeia', displayName: 'Laomedeia (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Leda', displayName: 'Leda (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Orus', displayName: 'Orus (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Puck', displayName: 'Puck (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Pulcherrima', displayName: 'Pulcherrima (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Rasalgethi', displayName: 'Rasalgethi (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Sadachbia', displayName: 'Sadachbia (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Sadaltager', displayName: 'Sadaltager (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Schedar', displayName: 'Schedar (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Sulafat', displayName: 'Sulafat (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Umbriel', displayName: 'Umbriel (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Vindemiatrix', displayName: 'Vindemiatrix (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Zephyr', displayName: 'Zephyr (Female, Chirp3-HD)', gender: 'FEMALE', quality: 'premium', series: 'Chirp3-HD' },
    { name: 'en-US-Chirp3-HD-Zubenelgenubi', displayName: 'Zubenelgenubi (Male, Chirp3-HD)', gender: 'MALE', quality: 'premium', series: 'Chirp3-HD' },

    // Chirp-HD 系列 (高质量语音)
    { name: 'en-US-Chirp-HD-D', displayName: 'Voice D (Male, Chirp-HD)', gender: 'MALE', quality: 'high', series: 'Chirp-HD' },
    { name: 'en-US-Chirp-HD-F', displayName: 'Voice F (Female, Chirp-HD)', gender: 'FEMALE', quality: 'high', series: 'Chirp-HD' },
    { name: 'en-US-Chirp-HD-O', displayName: 'Voice O (Female, Chirp-HD)', gender: 'FEMALE', quality: 'high', series: 'Chirp-HD' },

    // Neural2 系列 (高质量神经网络语音)
    { name: 'en-US-Neural2-A', displayName: 'Voice A (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-C', displayName: 'Voice C (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-D', displayName: 'Voice D (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-E', displayName: 'Voice E (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-F', displayName: 'Voice F (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-G', displayName: 'Voice G (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-H', displayName: 'Voice H (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-I', displayName: 'Voice I (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-J', displayName: 'Voice J (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },

    // Studio 系列 (录音棚质量)
    { name: 'en-US-Studio-O', displayName: 'Voice O (Female, Studio)', gender: 'FEMALE', quality: 'high', series: 'Studio' },
    { name: 'en-US-Studio-Q', displayName: 'Voice Q (Male, Studio)', gender: 'MALE', quality: 'high', series: 'Studio' },

    // News 系列 (新闻播报风格)
    { name: 'en-US-News-K', displayName: 'Voice K (Female, News)', gender: 'FEMALE', quality: 'high', series: 'News' },
    { name: 'en-US-News-L', displayName: 'Voice L (Female, News)', gender: 'FEMALE', quality: 'high', series: 'News' },
    { name: 'en-US-News-N', displayName: 'Voice N (Male, News)', gender: 'MALE', quality: 'high', series: 'News' },

    // Wavenet 系列 (中等质量)
    { name: 'en-US-Wavenet-A', displayName: 'Voice A (Male, Wavenet)', gender: 'MALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-B', displayName: 'Voice B (Male, Wavenet)', gender: 'MALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-C', displayName: 'Voice C (Female, Wavenet)', gender: 'FEMALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-D', displayName: 'Voice D (Male, Wavenet)', gender: 'MALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-E', displayName: 'Voice E (Female, Wavenet)', gender: 'FEMALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-F', displayName: 'Voice F (Female, Wavenet)', gender: 'FEMALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-G', displayName: 'Voice G (Female, Wavenet)', gender: 'FEMALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-H', displayName: 'Voice H (Female, Wavenet)', gender: 'FEMALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-I', displayName: 'Voice I (Male, Wavenet)', gender: 'MALE', quality: 'medium', series: 'Wavenet' },
    { name: 'en-US-Wavenet-J', displayName: 'Voice J (Male, Wavenet)', gender: 'MALE', quality: 'medium', series: 'Wavenet' },

    // 特殊语音
    { name: 'en-US-Casual-K', displayName: 'Voice K (Male, Casual)', gender: 'MALE', quality: 'medium', series: 'Casual' },
    { name: 'en-US-Polyglot-1', displayName: 'Voice 1 (Male, Polyglot)', gender: 'MALE', quality: 'medium', series: 'Polyglot' },

    // Standard 系列 (标准质量)
    { name: 'en-US-Standard-A', displayName: 'Voice A (Male, Standard)', gender: 'MALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-B', displayName: 'Voice B (Male, Standard)', gender: 'MALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-C', displayName: 'Voice C (Female, Standard)', gender: 'FEMALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-D', displayName: 'Voice D (Male, Standard)', gender: 'MALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-E', displayName: 'Voice E (Female, Standard)', gender: 'FEMALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-F', displayName: 'Voice F (Female, Standard)', gender: 'FEMALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-G', displayName: 'Voice G (Female, Standard)', gender: 'FEMALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-H', displayName: 'Voice H (Female, Standard)', gender: 'FEMALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-I', displayName: 'Voice I (Male, Standard)', gender: 'MALE', quality: 'basic', series: 'Standard' },
    { name: 'en-US-Standard-J', displayName: 'Voice J (Male, Standard)', gender: 'MALE', quality: 'basic', series: 'Standard' }
  ],
  
  // 其他语言保持不变，您可以类似地获取并更新
  'en-GB': [
    { name: 'en-GB-Neural2-A', displayName: 'UK Female (Neural2-A)', gender: 'FEMALE', quality: 'high' },
    { name: 'en-GB-Neural2-B', displayName: 'UK Male (Neural2-B)', gender: 'MALE', quality: 'high' },
    { name: 'en-GB-Neural2-C', displayName: 'UK Female (Neural2-C)', gender: 'FEMALE', quality: 'high' },
    { name: 'en-GB-Neural2-D', displayName: 'UK Male (Neural2-D)', gender: 'MALE', quality: 'high' }
  ],
  'en-AU': [
    { name: 'en-AU-Neural2-A', displayName: 'AU Female (Neural2-A)', gender: 'FEMALE', quality: 'high' },
    { name: 'en-AU-Neural2-B', displayName: 'AU Male (Neural2-B)', gender: 'MALE', quality: 'high' },
    { name: 'en-AU-Neural2-C', displayName: 'AU Female (Neural2-C)', gender: 'FEMALE', quality: 'high' },
    { name: 'en-AU-Neural2-D', displayName: 'AU Male (Neural2-D)', gender: 'MALE', quality: 'high' }
  ]
}

// 默认设置配置
export const DEFAULT_TTS_SETTINGS = {
  language: 'en-US',
  voice: 'auto',
  rate: 1.0,
  pitch: 0,
  encoding: 'MP3'
}

// 预设配置
export const TTS_PRESETS = {
  slow: { 
    name: 'Slow Reading',
    description: 'Suitable for learning',
    rate: 0.7, 
    pitch: 0 
  },
  normal: { 
    name: 'Normal Speed',
    description: 'Standard reading speed',
    rate: 1.0, 
    pitch: 0 
  },
  fast: { 
    name: 'Fast Reading',
    description: 'Quick reading',
    rate: 1.3, 
    pitch: 0 
  }
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' }
]

// 工具函数：获取指定语言的语音列表
export function getVoicesForLanguage(language) {
  return TTS_VOICES[language] || []
}

// 工具函数：根据质量级别筛选语音
export function getVoicesByQuality(language, quality) {
  const voices = getVoicesForLanguage(language)
  return voices.filter(voice => voice.quality === quality)
}

// 工具函数：根据语音系列筛选语音
export function getVoicesBySeries(language, series) {
  const voices = getVoicesForLanguage(language)
  return voices.filter(voice => voice.series === series)
}

// 工具函数：获取推荐语音（优先级：Chirp3-HD > Chirp-HD > Neural2 > Studio > News）
export function getRecommendedVoice(language, gender = null) {
  const voices = getVoicesForLanguage(language)
  
  // 定义质量优先级
  const qualityPriority = ['premium', 'high', 'medium', 'basic']
  const seriesPriority = ['Chirp3-HD', 'Chirp-HD', 'Neural2', 'Studio', 'News', 'Wavenet', 'Casual', 'Polyglot', 'Standard']
  
  let filtered = voices
  
  // 如果指定了性别，先按性别筛选
  if (gender) {
    filtered = voices.filter(voice => 
      voice.gender?.toLowerCase() === gender.toLowerCase()
    )
    if (filtered.length === 0) {
      filtered = voices // 如果没有匹配的性别，则使用全部
    }
  }
  
  // 按质量和系列优先级排序
  filtered.sort((a, b) => {
    const qualityDiff = qualityPriority.indexOf(a.quality) - qualityPriority.indexOf(b.quality)
    if (qualityDiff !== 0) return qualityDiff
    
    const seriesDiff = seriesPriority.indexOf(a.series) - seriesPriority.indexOf(b.series)
    return seriesDiff
  })
  
  return filtered[0] || null
}

// 工具函数：获取语音系列的描述
export function getSeriesDescription(series) {
  const descriptions = {
    'Chirp3-HD': '最新高级AI语音，以天体命名，最自然的声音质量',
    'Chirp-HD': '高质量AI语音，自然流畅',
    'Neural2': '神经网络语音，高质量合成',
    'Studio': '录音棚质量，专业级音质',
    'News': '新闻播报风格，清晰专业',
    'Wavenet': 'WaveNet技术，标准质量',
    'Casual': '轻松对话风格',
    'Polyglot': '多语言支持语音',
    'Standard': '基础标准语音'
  }
  return descriptions[series] || '标准语音'
}

// 工具函数：获取质量等级描述
export function getQualityDescription(quality) {
  const descriptions = {
    'premium': '顶级音质 (Premium)',
    'high': '高音质 (High)',
    'medium': '中等音质 (Medium)', 
    'basic': '基础音质 (Basic)'
  }
  return descriptions[quality] || '标准音质'
}

// 工具函数：获取所有支持的语言代码
export function getSupportedLanguageCodes() {
  return Object.keys(TTS_VOICES)
}

// 工具函数：验证设置
export function validateTTSSettings(settings) {
  const errors = []
  
  if (!settings.language || !getSupportedLanguageCodes().includes(settings.language)) {
    errors.push('Invalid language code')
  }
  
  if (settings.rate < 0.25 || settings.rate > 4.0) {
    errors.push('Rate must be between 0.25 and 4.0')
  }
  
  if (settings.pitch < -20 || settings.pitch > 20) {
    errors.push('Pitch must be between -20 and 20')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
