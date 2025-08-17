// Preset TTS voice configuration - Based on Google Cloud TTS available voices
export const TTS_VOICES = {
  'en-US': [
    // Chirp3-HD series (Latest high-quality voices, named after celestial bodies)
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

    // Chirp-HD series (High-quality voices)
    { name: 'en-US-Chirp-HD-D', displayName: 'Voice D (Male, Chirp-HD)', gender: 'MALE', quality: 'high', series: 'Chirp-HD' },
    { name: 'en-US-Chirp-HD-F', displayName: 'Voice F (Female, Chirp-HD)', gender: 'FEMALE', quality: 'high', series: 'Chirp-HD' },
    { name: 'en-US-Chirp-HD-O', displayName: 'Voice O (Female, Chirp-HD)', gender: 'FEMALE', quality: 'high', series: 'Chirp-HD' },

    // Neural2 series (High-quality neural network voices)
    { name: 'en-US-Neural2-A', displayName: 'Voice A (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-C', displayName: 'Voice C (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-D', displayName: 'Voice D (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-E', displayName: 'Voice E (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-F', displayName: 'Voice F (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-G', displayName: 'Voice G (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-H', displayName: 'Voice H (Female, Neural2)', gender: 'FEMALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-I', displayName: 'Voice I (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },
    { name: 'en-US-Neural2-J', displayName: 'Voice J (Male, Neural2)', gender: 'MALE', quality: 'high', series: 'Neural2' },

    // Studio series (Studio quality)
    { name: 'en-US-Studio-O', displayName: 'Voice O (Female, Studio)', gender: 'FEMALE', quality: 'high', series: 'Studio' },
    { name: 'en-US-Studio-Q', displayName: 'Voice Q (Male, Studio)', gender: 'MALE', quality: 'high', series: 'Studio' },

    // News series (News broadcast style)
    { name: 'en-US-News-K', displayName: 'Voice K (Female, News)', gender: 'FEMALE', quality: 'high', series: 'News' },
    { name: 'en-US-News-L', displayName: 'Voice L (Female, News)', gender: 'FEMALE', quality: 'high', series: 'News' },
    { name: 'en-US-News-N', displayName: 'Voice N (Male, News)', gender: 'MALE', quality: 'high', series: 'News' },

    // Wavenet series (Medium quality)
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

    // Special voices
    { name: 'en-US-Casual-K', displayName: 'Voice K (Male, Casual)', gender: 'MALE', quality: 'medium', series: 'Casual' },
    { name: 'en-US-Polyglot-1', displayName: 'Voice 1 (Male, Polyglot)', gender: 'MALE', quality: 'medium', series: 'Polyglot' },

    // Standard series (Standard quality)
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
  
  // Other languages remain unchanged, you can similarly get and update them
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

// Default settings configuration
export const DEFAULT_TTS_SETTINGS = {
  language: 'en-US',
  voice: 'auto',
  rate: 1.0,
  pitch: 0,
  encoding: 'MP3'
}

// Preset configurations
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

// Supported languages list
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' }
]

// Utility function: Get voice list for specified language
export function getVoicesForLanguage(language) {
  return TTS_VOICES[language] || []
}

// Utility function: Filter voices by quality level
export function getVoicesByQuality(language, quality) {
  const voices = getVoicesForLanguage(language)
  return voices.filter(voice => voice.quality === quality)
}

// Utility function: Filter voices by voice series
export function getVoicesBySeries(language, series) {
  const voices = getVoicesForLanguage(language)
  return voices.filter(voice => voice.series === series)
}

// Utility function: Get recommended voice (Priority: Chirp3-HD > Chirp-HD > Neural2 > Studio > News)
export function getRecommendedVoice(language, gender = null) {
  const voices = getVoicesForLanguage(language)
  
  // Define quality priority
  const qualityPriority = ['premium', 'high', 'medium', 'basic']
  const seriesPriority = ['Chirp3-HD', 'Chirp-HD', 'Neural2', 'Studio', 'News', 'Wavenet', 'Casual', 'Polyglot', 'Standard']
  
  let filtered = voices
  
  // If gender is specified, filter by gender first
  if (gender) {
    filtered = voices.filter(voice => 
      voice.gender?.toLowerCase() === gender.toLowerCase()
    )
    if (filtered.length === 0) {
      filtered = voices // If no matching gender, use all
    }
  }
  
  // Sort by quality and series priority
  filtered.sort((a, b) => {
    const qualityDiff = qualityPriority.indexOf(a.quality) - qualityPriority.indexOf(b.quality)
    if (qualityDiff !== 0) return qualityDiff
    
    const seriesDiff = seriesPriority.indexOf(a.series) - seriesPriority.indexOf(b.series)
    return seriesDiff
  })
  
  return filtered[0] || null
}

// Utility function: Get voice series description
export function getSeriesDescription(series) {
  const descriptions = {
    'Chirp3-HD': 'Latest advanced AI voices, named after celestial bodies, most natural sound quality',
    'Chirp-HD': 'High-quality AI voices, natural and smooth',
    'Neural2': 'Neural network voices, high-quality synthesis',
    'Studio': 'Studio quality, professional-grade audio',
    'News': 'News broadcast style, clear and professional',
    'Wavenet': 'WaveNet technology, standard quality',
    'Casual': 'Casual conversation style',
    'Polyglot': 'Multi-language support voices',
    'Standard': 'Basic standard voices'
  }
  return descriptions[series] || 'Standard voice'
}

// Utility function: Get quality level description
export function getQualityDescription(quality) {
  const descriptions = {
    'premium': 'Premium Quality',
    'high': 'High Quality',
    'medium': 'Medium Quality', 
    'basic': 'Basic Quality'
  }
  return descriptions[quality] || 'Standard Quality'
}

// Utility function: Get all supported language codes
export function getSupportedLanguageCodes() {
  return Object.keys(TTS_VOICES)
}

// Utility function: Validate settings
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
