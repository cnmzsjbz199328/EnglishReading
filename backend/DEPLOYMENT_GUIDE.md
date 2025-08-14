# 生产环境部署指南

## 🚀 部署步骤

### 1. 准备环境变量
在 Cloudflare Workers 控制台中手动添加以下两个加密环境变量：

#### GOOGLE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD2cP/WN8z8J2r1
CDIa6eGx/+stbW70a/FVLZVkkFAHtoKKL0epanr5/yiJwVgurAZqlbLCkWJ41SsT
UBYY16x2Y8ydKL/vuSm2J7oMpcxDl0nO76cELhqmiG7LvQppiN46ngmywFeL/IUO
PHfbfziANgPTggWJ+wUBHtjR0UVsXIp3MV0AxK4FFulCvV0Mb93eQm0Sktq5fxul
auL0KDs5K42FzJ7gBHVeBkSQ1AGbe3KnmmtisDTDif3wA28F3xKTvgKlAGto0eTo
6UIUYBEkUX61/lqchsIP1avCeAwIFL/FGY9XDwiZ/oLoc8L20YBlWlpt05f4EcTB
18M3hCtjAgMBAAECggEABnBfZDPNtEznW4LyTt0LhkC/M/mnANXigVeROVvCljZW
Oia6wu9tn83jO5jZ+qYzU2JD6xeCBibeWuvTF/pn9ClECwXUi1Pq22qK+ZJKFaiv
R1aK+5ikyPMe9KMk0YBqULJuYxrpbqvot2gsYtzJF3h8fcXo6nkCNsxH3VDldSD3
ZlxdQ/kHZ84prnWOH094xb78EvEQngJpHdGDhnKOx4IUPhvs6h95TEeBwoYiT1ec
L5/poFKUHhjGtrxVoxa9oDIySXVvUtlSBHpylbv56APhm/8iMLIiQ3FHXfy6IEfz
IBYDvEcQ2BMdTWA0do0D7X36CgRXS20MQ8EZ4x4rqQKBgQD8lFQkU0+IqsKRxjIH
wPZg6jBAbke1FLbgfmwl4jRA/bnyLoEKBK+SRwM+hyVRwCbiVhWDC7lmglkK0WiZ
7w5WB2wrSK7cPgT3m2IGnWsuJl8M8c416ihX1xmFz9PJstW4edLlO8L9ba3ZVaDP
sT9vyofA4QeqMQwZJC3+JORVdQKBgQD5x2QHo8um5cf8GL16vZtDdizpoBYwZZZ6
NWcXLT/9tfVOkVPM9pU12iSn8hOgb7/g0OGpdpQRR+KJ16IaMje8wcTWRBc8TL2/
Ve47FrEqWzgej5nqBGXYqx+yPfo07SFqdZ1NuDSz8RFqdaUTpqBlP2P8xYBVRM2a
WlT0iEZqdwKBgQDeawPZZR+herWRxtUhrNOJLlDFPBebJx2PfORhS9u163iGAluR
ZeTxy+TYeAvt/GaBY0rYNkfSNDCS7SrOewvFyA2B5CRPP7ICFOtyZccPQazr6jcr
lQJnr7wC8KtQb1HyfByxzjl8D8xKmTPeEPiKye9XcxHb1gsQTKLPrM8BTQKBgFdV
y3kMYZHauEFCWUZIc7hz4qJRklCbxLC4aXJmJQDOFZbCI73/3g41VynN7+TiDgJK
pwy85Griaqht2EU2l9yNGAkfR8ySvKnhHupUNeAsgwPUjCmSHhZTR0LofsrwuwVh
WH4rUWo1eTRzLCQh1+Vu88QXPpcR9p3oxdm2qIBjAoGBAIEgKqWxbqtiuc94XVOt
3HjITkMbLRVZeof30GsRuKadds4EXT+k8Z6H7Qa9Miem+tQED5LVq1Rmd3BOtNkF
LQplJ/xRe7sfqr941Ss1M0NvDVyNr3+hBZ/Pp4zqDV86uUO9Ot1AV+nyjlcdwLxD
tfwMQsKWndrfgHcbXBCB7gar
-----END PRIVATE KEY-----
```

#### GOOGLE_CLIENT_EMAIL
```
tangjiang199328@gen-lang-client-0346700592.iam.gserviceaccount.com
```

### 2. 在 Cloudflare Workers 控制台添加环境变量

1. 登录 [Cloudflare Workers 控制台](https://dash.cloudflare.com/)
2. 选择或创建你的 Worker 应用
3. 进入 "Settings" 标签页
4. 在 "Environment Variables" 部分点击 "Add variable"
5. 添加以下两个变量（选择 "Encrypted" 类型）：

   **变量 1:**
   - Name: `GOOGLE_PRIVATE_KEY`
   - Value: 上面的完整私钥（包括 BEGIN 和 END 标记）
   - Type: Encrypted ✅

   **变量 2:**
   - Name: `GOOGLE_CLIENT_EMAIL`
   - Value: `tangjiang199328@gen-lang-client-0346700592.iam.gserviceaccount.com`
   - Type: Encrypted ✅

6. 点击 "Save and deploy"

### 3. 部署应用

在本地运行部署命令：
```bash
cd backend
wrangler deploy
```

### 4. 验证部署

部署完成后，你的应用将可以通过以下 URL 访问：
- 主应用: `https://english-reading-app.<你的子域>.workers.dev`
- TTS API: `https://english-reading-app.<你的子域>.workers.dev/api/tts/voices`
- TTS 合成: `https://english-reading-app.<你的子域>.workers.dev/api/tts/preview`

## 🔧 API 端点

### TTS 语音列表
```
GET /api/tts/voices?language=en-US
```

### TTS 语音合成
```
POST /api/tts/preview
Content-Type: application/json

{
  "text": "Hello, this is a test",
  "language": "en-US",
  "voice": "auto",
  "encoding": "MP3",
  "rate": 1.0,
  "pitch": 0,
  "useSSML": false
}
```

### 其他端点
- VOA 内容: `/api/voa/*`
- 录音上传: `/api/recordings/*`
- 文件上传: `/api/upload/*`
- 调试信息: `/api/debug/env`

## 🔐 安全性

- ✅ 敏感信息已从代码中移除
- ✅ 环境变量使用加密存储
- ✅ CORS 已正确配置
- ✅ 生产环境就绪

## 📝 注意事项

1. 确保 D1 数据库和 R2 存储桶已正确配置
2. 检查 Cloudflare Workers 的使用限制
3. 监控 Google Cloud TTS API 的使用量和配额
4. 定期更新依赖项和安全补丁

## 🆘 故障排除

如果部署后遇到问题：

1. 检查 Workers 控制台的 "Logs" 页面
2. 确认环境变量设置正确
3. 验证 Google Cloud 服务账户权限
4. 测试各个 API 端点的响应
