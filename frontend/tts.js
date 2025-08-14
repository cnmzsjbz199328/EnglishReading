export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS 处理
    const CORS_HEADERS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

  const text = url.searchParams.get("text") || "你好，欢迎使用语音合成测试";
  const lang = url.searchParams.get("lang") || "cmn-CN"; // 语种
  // 当未指定 voice 或指定为 auto 时，自动挑选更高级别声音（Studio/Neural2/Neural/Wavenet/HD 优先）
  let voiceName = url.searchParams.get("voice") || "auto";
  const encoding = (url.searchParams.get("encoding") || "MP3").toUpperCase(); // MP3 | OGG_OPUS | LINEAR16
  const rate = clampNumber(parseFloat(url.searchParams.get("rate") || "1"), 0.25, 4.0); // speakingRate
  const pitch = clampNumber(parseFloat(url.searchParams.get("pitch") || "0"), -20.0, 20.0); // semitones
  const sampleRateHertz = intOrUndefined(url.searchParams.get("sr")); // 可选重采样
  const useSSML = url.searchParams.get("ssml") === "1"; // 将 text 视为 SSML
  const listVoices = url.searchParams.get("list") === "1"; // 返回可用声音列表

    // 强烈建议：使用环境变量存储敏感信息（wrangler secret put）
    // 回落到硬编码值仅用于本地快速测试，请不要提交真实密钥到仓库。
    const serviceAccount = {
      private_key: env.PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD2cP/WN8z8J2r1\nCDIa6eGx/+stbW70a/FVLZVkkFAHtoKKL0epanr5/yiJwVgurAZqlbLCkWJ41SsT\nUBYY16x2Y8ydKL/vuSm2J7oMpcxDl0nO76cELhqmiG7LvQppiN46ngmywFeL/IUO\nPHfbfziANgPTggWJ+wUBHtjR0UVsXIp3MV0AxK4FFulCvV0Mb93eQm0Sktq5fxul\nauL0KDs5K42FzJ7gBHVeBkSQ1AGbe3KnmmtisDTDif3wA28F3xKTvgKlAGto0eTo\n6UIUYBEkUX61/lqchsIP1avCeAwIFL/FGY9XDwiZ/oLoc8L20YBlWlpt05f4EcTB\n18M3hCtjAgMBAAECggEABnBfZDPNtEznW4LyTt0LhkC/M/mnANXigVeROVvCljZW\nOia6wu9tn83jO5jZ+qYzU2JD6xeCBibeWuvTF/pn9ClECwXUi1Pq22qK+ZJKFaiv\nR1aK+5ikyPMe9KMk0YBqULJuYxrpbqvot2gsYtzJF3h8fcXo6nkCNsxH3VDldSD3\nZlxdQ/kHZ84prnWOH094xb78EvEQngJpHdGDhnKOx4IUPhvs6h95TEeBwoYiT1ec\nL5/poFKUHhjGtrxVoxa9oDIySXVvUtlSBHpylbv56APhm/8iMLIiQ3FHXfy6IEfz\nIBYDvEcQ2BMdTWA0do0D7X36CgRXS20MQ8EZ4x4rqQKBgQD8lFQkU0+IqsKRxjIH\nwPZg6jBAbke1FLbgfmwl4jRA/bnyLoEKBK+SRwM+hyVRwCbiVhWDC7lmglkK0WiZ\n7w5WB2wrSK7cPgT3m2IGnWsuJl8M8c416ihX1xmFz9PJstW4edLlO8L9ba3ZVaDP\nsT9vyofA4QeqMQwZJC3+JORVdQKBgQD5x2QHo8um5cf8GL16vZtDdizpoBYwZZZ6\nNWcXLT/9tfVOkVPM9pU12iSn8hOgb7/g0OGpdpQRR+KJ16IaMje8wcTWRBc8TL2/\nVe47FrEqWzgej5nqBGXYqx+yPfo07SFqdZ1NuDSz8RFqdaUTpqBlP2P8xYBVRM2a\nWlT0iEZqdwKBgQDeawPZZR+herWRxtUhrNOJLlDFPBebJx2PfORhS9u163iGAluR\nZeTxy+TYeAvt/GaBY0rYNkfSNDCS7SrOewvFyA2B5CRPP7ICFOtyZccPQazr6jcr\nlQJnr7wC8KtQb1HyfByxzjl8D8xKmTPeEPiKye9XcxHb1gsQTKLPrM8BTQKBgFdV\ny3kMYZHauEFCWUZIc7hz4qJRklCbxLC4aXJmJQDOFZbCI73/3g41VynN7+TiDgJK\npwy85Griaqht2EU2l9yNGAkfR8ySvKnhHupUNeAsgwPUjCmSHhZTR0LofsrwuwVh\nWH4rUWo1eTRzLCQh1+Vu88QXPpcR9p3oxdm2qIBjAoGBAIEgKqWxbqtiuc94XVOt\n3HjITkMbLRVZeof30GsRuKadds4EXT+k8Z6H7Qa9Miem+tQED5LVq1Rmd3BOtNkF\nLQplJ/xRe7sfqr941Ss1M0NvDVyNr3+hBZ/Pp4zqDV86uUO9Ot1AV+nyjlcdwLxD\ntfwMQsKWndrfgHcbXBCB7gar\n-----END PRIVATE KEY-----\n`,
      client_email: env.CLIENT_EMAIL || "tangjiang199328@gen-lang-client-0346700592.iam.gserviceaccount.com"
    };

    try {
      // 生成 JWT
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: "RS256", typ: "JWT" };
      const payload = {
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now
      };

      const encodeBase64Url = (obj) => btoa(JSON.stringify(obj))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const jwtHeader = encodeBase64Url(header);
      const jwtPayload = encodeBase64Url(payload);
      const toSign = `${jwtHeader}.${jwtPayload}`;

      const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        str2ab(serviceAccount.private_key),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        new TextEncoder().encode(toSign)
      );
      const jwt = `${toSign}.${arrayBufferToBase64Url(signature)}`;

  // 获取 access token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });
      if (!tokenRes.ok) {
        const t = await tokenRes.text().catch(() => "");
        return jsonError(`获取 access_token 失败: ${tokenRes.status} ${tokenRes.statusText} ${t}`, 500, CORS_HEADERS);
      }
      const { access_token } = await tokenRes.json();
      if (!access_token) {
        return jsonError("未获取到 access_token", 500, CORS_HEADERS);
      }

  // 如果仅列出声音
      if (listVoices) {
        const vres = await fetch(`https://texttospeech.googleapis.com/v1/voices?languageCode=${encodeURIComponent(lang)}`, {
          headers: { "Authorization": `Bearer ${access_token}` }
        });
        if (!vres.ok) {
          const t = await vres.text().catch(() => "");
          return jsonError(`列出声音失败: ${vres.status} ${vres.statusText} ${t}`, 502, CORS_HEADERS);
        }
        const vjson = await vres.json();
        return new Response(JSON.stringify({ success: true, data: vjson }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
        });
      }

      // 自动选择高级音色
      if (!voiceName || voiceName.toLowerCase() === 'auto') {
        voiceName = await pickBestVoice(access_token, lang);
      }

      // 调用 Google Cloud Text-to-Speech（可调编码/语速/音高/采样率）
      const ttsRes = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: useSSML ? { ssml: text } : { text },
          voice: { languageCode: lang, name: voiceName },
          audioConfig: {
            audioEncoding: encoding,
            speakingRate: rate,
            pitch: pitch,
            ...(sampleRateHertz ? { sampleRateHertz } : {}),
            // 可按需添加设备优化：handset-class-device, small-bluetooth-speaker-class-device 等
            // effectsProfileId: ["handset-class-device"]
          }
        })
      });
      if (!ttsRes.ok) {
        const t = await ttsRes.text().catch(() => "");
        return jsonError(`TTS 调用失败: ${ttsRes.status} ${ttsRes.statusText} ${t}`, 502, CORS_HEADERS);
      }
      const { audioContent } = await ttsRes.json();
      if (!audioContent) {
        return jsonError("TTS 响应缺少 audioContent", 502, CORS_HEADERS);
      }

      // base64 -> Uint8Array（二进制返回，避免字符串编码破坏音频）
      const audioBytes = base64ToUint8Array(audioContent);
    const mimeMap = { MP3: 'audio/mpeg', OGG_OPUS: 'audio/ogg', LINEAR16: 'audio/wav' };
    return new Response(audioBytes, {
        headers: {
      "Content-Type": mimeMap[encoding] || 'audio/mpeg',
          "Content-Disposition": "inline; filename=\"tts.mp3\"",
          "Cache-Control": "public, max-age=300",
          ...CORS_HEADERS
        }
      });
    } catch (err) {
      return jsonError(`服务异常: ${err?.message || err}`, 500, CORS_HEADERS);
    }
  }
};

// Helper: convert PEM string to ArrayBuffer (PKCS#8 DER)
function str2ab(pem) {
  const b64 = pem.replace(/-----.*?-----/g, "").replace(/\n/g, "").trim();
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Helper: ArrayBuffer -> base64url
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Helper: base64 -> Uint8Array
function base64ToUint8Array(b64) {
  const norm = b64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(norm);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function jsonError(message, status = 500, extraHeaders = {}) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders }
  });
}

// utils
function clampNumber(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
function intOrUndefined(v) {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

// 选择更高级别的声音（优先级：Studio > Neural2 > Neural > Wavenet > HD > 其余）
async function pickBestVoice(accessToken, lang) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/voices?languageCode=${encodeURIComponent(lang)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return '';
  const { voices = [] } = await res.json();
  const list = voices.filter(v => (v.languageCodes || []).includes(lang));
  if (!list.length) return '';
  const priority = [/studio/i, /chirp.*hd/i, /neural2/i, /neural/i, /wavenet/i, /hd/i];
  const score = (name='') => {
    for (let i=0;i<priority.length;i++) if (priority[i].test(name)) return i;
    return 999;
  };
  list.sort((a,b)=> score(a.name)-score(b.name) || (b.naturalSampleRateHertz||0)-(a.naturalSampleRateHertz||0));
  return list[0]?.name || '';
}