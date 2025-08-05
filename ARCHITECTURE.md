# 系统架构与API设计 (V1)

本文档基于 `FEATURES.md` 中定义的需求，提供了项目的技术架构和详细的API设计。

## 1. 系统架构图 (C4 - 容器图)

此图展示了构成系统的主要技术组件（容器）以及它们之间的交互关系。

```mermaid
graph TD
    subgraph "用户浏览器"
        A[前端应用 (React/Vue/etc.)]
    end

    subgraph "Cloudflare 边缘网络"
        B[Cloudflare Worker]
        C[Cloudflare R2 Storage]
        D[Cloudflare D1 Database]
    end

    U[用户] -->|使用| A

    A -->|1. 请求预签名URL (GET /api/presigned-url)| B
    B -->|2. 返回URL| A
    A -->|3. 上传MP3 (PUT)| C
    A -->|4. 创建练习 (POST /api/recordings)| B
    B -->|5. 写入元数据| D
    
    A -->|6. 获取练习列表 (GET /api/recordings)| B
    B -->|7. 查询元数据| D
    D -->|8. 返回元数据| B
    B -->|9. 返回列表| A

    A -->|10. 请求播放音频 (GET /api/recordings/:id/audio)| B
    B -->|11. 从R2获取音频对象| C
    B -->|12. 将音频流返回| A

    A -->|13. 删除练习 (DELETE /api/recordings/:id)| B
    B -->|14. 从D1删除记录| D
    B -->|15. (可选) 从R2删除对象| C

```

## 2. API 端点设计 (V1)

以下是后端Worker需要实现的API端点，这是前后端开发的契约。

---

### **`GET /api/presigned-url`**

- **描述**: 为客户端生成一个用于上传MP3文件的预签名URL。
- **HTTP方法**: `GET`
- **查询参数**:
    - `filename` (string, required): 用户上传的原始文件名，用于生成R2 Object Key。
- **成功响应 (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "signedUrl": "https://<r2-bucket>.<account-id>.r2.cloudflarestorage.com/...?X-Amz-Algorithm=...",
      "key": "uploads/1678886400000-example.mp3"
    }
  }
  ```
- **失败响应 (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Filename is required."
  }
  ```

---

### **`POST /api/recordings`**

- **描述**: 创建一个新的跟读练习记录。在调用此API前，客户端必须已成功将音频上传到R2。
- **HTTP方法**: `POST`
- **请求体 (JSON)**:
  ```json
  {
    "title": "My First Practice",
    "text": "Hello world, this is a test.",
    "audioKey": "uploads/1678886400000-example.mp3"
  }
  ```
- **成功响应 (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "cuid_abc123",
      "title": "My First Practice",
      "createdAt": "2023-03-15T12:00:00Z"
    }
  }
  ```
- **失败响应 (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Title, text, and audioKey are required."
  }
  ```

---

### **`GET /api/recordings`**

- **描述**: 获取所有跟读练习的列表。
- **HTTP方法**: `GET`
- **成功响应 (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cuid_abc123",
        "title": "My First Practice",
        "createdAt": "2023-03-15T12:00:00Z"
      },
      {
        "id": "cuid_def456",
        "title": "Another Practice",
        "createdAt": "2023-03-16T14:30:00Z"
      }
    ]
  }
  ```

---

### **`GET /api/recordings/:id/audio`**

- **描述**: 获取指定练习的音频文件流。
- **HTTP方法**: `GET`
- **URL参数**:
    - `id` (string, required): 练习的唯一ID。
- **成功响应 (200 OK)**:
    - **Headers**: `Content-Type: audio/mpeg`
    - **Body**: The raw MP3 audio stream.
- **失败响应 (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": "Recording not found."
  }
  ```

---

### **`DELETE /api/recordings/:id`**

- **描述**: 删除一个指定的跟读练习。
- **HTTP方法**: `DELETE`
- **URL参数**:
    - `id` (string, required): 练习的唯一ID。
- **成功响应 (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Recording deleted successfully."
  }
  ```
- **失败响应 (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": "Recording not found."
  }
  ```
