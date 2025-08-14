export interface ValidationResult {
  success: boolean
  errors?: string[]
}

export function validateTTSRequest(body: any): ValidationResult {
  const errors: string[] = []

  // 必填字段验证
  if (!body.text || typeof body.text !== 'string') {
    errors.push('text is required and must be a string')
  }

  if (body.text && body.text.length > 5000) {
    errors.push('text must be less than 5000 characters')
  }

  // 可选字段验证
  if (body.language && typeof body.language !== 'string') {
    errors.push('language must be a string')
  }

  if (body.encoding && !['MP3', 'OGG_OPUS', 'LINEAR16'].includes(body.encoding)) {
    errors.push('encoding must be one of: MP3, OGG_OPUS, LINEAR16')
  }

  if (body.rate && (typeof body.rate !== 'number' || body.rate < 0.25 || body.rate > 4.0)) {
    errors.push('rate must be a number between 0.25 and 4.0')
  }

  if (body.pitch && (typeof body.pitch !== 'number' || body.pitch < -20 || body.pitch > 20)) {
    errors.push('pitch must be a number between -20 and 20')
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

export function validateRecordingRequest(body: any): ValidationResult {
  const errors: string[] = []

  if (!body.title || typeof body.title !== 'string') {
    errors.push('title is required and must be a string')
  }

  if (!body.content || typeof body.content !== 'string') {
    errors.push('content is required and must be a string')
  }

  if (body.title && body.title.length > 200) {
    errors.push('title must be less than 200 characters')
  }

  if (body.content && body.content.length > 10000) {
    errors.push('content must be less than 10000 characters')
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}
