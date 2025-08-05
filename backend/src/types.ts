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
