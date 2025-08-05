import type { Recording } from '../types'

export class DatabaseService {
  constructor(private db: any) {} // 暂时使用 any 类型

  async getAllRecordings(): Promise<Recording[]> {
    const { results } = await this.db
      .prepare("SELECT id, title, created_at as createdAt FROM recordings ORDER BY created_at DESC")
      .all();
    return results as Recording[];
  }

  async getRecordingById(id: string) {
    return await this.db
      .prepare("SELECT r2_object_key FROM recordings WHERE id = ?")
      .bind(id)
      .first() as {r2_object_key: string} | null;
  }

  async createRecording(id: string, title: string, text: string, audioKey: string): Promise<boolean> {
    const { success } = await this.db
      .prepare("INSERT INTO recordings (id, title, original_text, r2_object_key) VALUES (?, ?, ?, ?)")
      .bind(id, title, text, audioKey)
      .run();
    return success;
  }

  async deleteRecording(id: string): Promise<boolean> {
    const { success } = await this.db
      .prepare("DELETE FROM recordings WHERE id = ?")
      .bind(id)
      .run();
    return success;
  }
}
