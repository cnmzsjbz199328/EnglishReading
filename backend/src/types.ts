// For list view
export type Recording = {
  id: string;
  title: string;
  createdAt: string;
}

// For detail view
export type RecordingDetail = Recording & {
  originalText: string;
}

// For creating a new recording
export type CreateRecordingSchema = {
  title: string;
  text: string;
  audioKey: string;
}

// TTS related types
export interface TTSRequest {
  text: string
  language?: string
  voice?: string
  encoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16'
  rate?: number
  pitch?: number
  useSSML?: boolean
}

export interface CreateRecordingWithTTSRequest {
  title: string
  content: string
  language?: string
  voice?: string
}

export interface TTSPreviewResponse {
  success: boolean
  audioUrl?: string
  error?: string
}

export interface VoiceListResponse {
  success: boolean
  data?: {
    voices: Array<{
      name: string
      languageCodes: string[]
      ssmlGender: string
      naturalSampleRateHertz: number
    }>
  }
  error?: string
}
