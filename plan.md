# “跟读练习”应用架构方案 (优化版)

基于您“用户上传文字和MP3语音，实现跟读练习”的需求，并结合架构师的最佳实践，我们制定了以下经过验证和优化的技术方案。

## 一、整体架构

- **前端**：负责用户交互，包括上传文本和MP3文件，展示练习列表，以及播放原文和录制跟读音频。
- **后端 (Cloudflare Worker)**：作为应用的API网关。负责处理前端请求、生成预签名上传URL、验证并保存元数据到D1、代理访问R2音频。
- **Cloudflare R2**：作为对象存储，安全地存放用户上传的MP3文件。**R2桶应设置为私有，不允许公开访问。**
- **Cloudflare D1**：作为SQL数据库，存储每条跟读练习的元数据。

## 二、核心流程

### 1. MP3上传到R2 (安全直传)

- **前端**：用户选择MP3文件后，向后端Worker请求一个用于上传的“预签名URL”（Presigned URL）。
- **后端 Worker**：接收请求，验证后为该文件生成一个有时效性的、仅限PUT操作的预签名URL，并返回给前端。
- **前端**：使用返回的预签名URL，通过`fetch`的`PUT`方法将MP3文件直接上传到R2桶。此过程流量不经过Worker，高效且安全。

### 2. 文字和元信息入库D1

- **文件上传成功后**，前端将“文本内容、标题、MP3在R2的Object Key”等元信息POST到Worker的API端点。
- **后端 Worker**：接收到元数据后，执行以下操作：
    1.  生成一个唯一的ID（如UUID）。
    2.  将ID、文本、标题、R2 Object Key、用户信息等一并写入D1数据库。

### 3. D1数据库设计 (已优化)

我们采用以下结构化的表设计，以增强系统的灵活性和可维护性。

```sql
CREATE TABLE recordings (
  id TEXT PRIMARY KEY, -- 使用UUID/CUID，由Worker生成，而非自增ID
  user_id TEXT NOT NULL, -- 存储用户唯一标识符
  title TEXT NOT NULL, -- 练习的标题
  original_text TEXT NOT NULL, -- 跟读的原文
  r2_object_key TEXT NOT NULL, -- 存储R2中的文件Key，而非完整URL
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```
**设计关键点**：
- **`id`**: 使用`TEXT`类型的唯一ID（如UUID），在分布式环境中比自增整数更稳健。
- **`r2_object_key`**: **核心优化**。仅存储R2对象的唯一Key（如`uploads/user123/abc.mp3`）。完整的访问URL由Worker在需要时动态生成，这使得未来更换域名、修改访问策略（如从代理访问变为签名URL访问）变得极其简单，无需修改数据库。

## 三、前端展示与练习

- **获取列表**：前端通过API从Worker获取练习素材列表（查询D1数据库，返回`id`, `title`, `original_text`等）。
- **播放音频**：当用户点击播放时，前端请求一个特定的API，如 `GET /api/audio/{recording_id}`。
- **Worker代理播放**：Worker接收请求，验证用户权限，然后从D1查出对应的`r2_object_key`，从R2获取该音频对象，并以数据流（Stream）的形式返回给前端。

## 四、安全与访问控制 (核心原则)

- **R2桶必须私有**：杜绝任何对R2桶的直接公开访问，这是保障数据安全的第一道防线。
- **所有访问通过Worker代理**：无论是上传（通过预签名URL）还是下载/播放（通过API代理），所有数据交互都必须经过Worker进行鉴权和控制。这为您提供了集中的权限管理、日志记录和防盗链能力。

## 五、关键代码参考

### 1. 前端上传 (含错误处理)
```javascript
async function handleUpload(file, title, text) {
  try {
    // 1. 获取预签名URL
    const presignRes = await fetch(`/api/get-upload-url?filename=${file.name}`);
    if (!presignRes.ok) {
      throw new Error(`Failed to get upload URL: ${presignRes.statusText}`);
    }
    const { signedUrl, key } = await presignRes.json();

    // 2. 上传MP3到R2
    const uploadRes = await fetch(signedUrl, { method: 'PUT', body: file });
    if (!uploadRes.ok) {
      throw new Error(`File upload to R2 failed: ${uploadRes.statusText}`);
    }

    // 3. 通知后端保存元数据 (可加入重试逻辑)
    const metaRes = await fetch('/api/save-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text, audio_key: key })
    });
    if (!metaRes.ok) {
      throw new Error(`Failed to save metadata: ${metaRes.statusText}`);
    }

    alert('Upload successful!');
    // 可以在此刷新列表

  } catch (error) {
    console.error('Upload process failed:', error);
    alert(`An error occurred: ${error.message}`);
  }
}
```

### 2. Worker生成预签名URL (Hono框架示例)
```javascript
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ... Hono app setup ...

app.get('/api/get-upload-url', async (c) => {
  const s3 = new S3Client({ /* ... R2 config ... */ });
  const filename = c.req.query('filename');
  const key = `uploads/${Date.now()}-${filename}`;

  const signedUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: c.env.R2_BUCKET_NAME, Key: key }),
    { expiresIn: 360 } // URL有效期6分钟
  );

  return c.json({ signedUrl, key });
});
```

## 六、健壮性与扩展建议

- **处理孤儿文件**：当前流程（先传R2，后写D1）可能因第二步失败产生R2中的孤儿文件。建议：
    - **前端重试**：为保存元数据的API调用添加重试逻辑。
    - **定期清理**：编写一个由Cron Trigger触发的Worker，定期扫描R2并删除D1中没有对应记录的文件。
- **用户系统**：集成Cloudflare Access或第三方认证（如Auth0, Clerk），将`user_id`与真实用户关联。
- **前端框架**：使用React, Vue或Svelte等现代前端框架来构建一个交互更丰富的单页应用（SPA）。

这个优化后的方案将为您提供一个更安全、更健壮且易于维护的系统基础。
