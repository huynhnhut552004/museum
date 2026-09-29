const { GoogleGenerativeAI } = require("@google/generative-ai");
const sharp = require("sharp");
const { pool } = require('../config/postgres');
const ArtworkDetail = require('../models/mongo/ArtworkDetail');
const { syncSingleArtwork } = require('../services/algoliaSync.service');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const jsonModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 4096;
const MAX_IMAGE_HEIGHT = 4096;
const MAX_INPUT_IMAGE_PIXELS = 50_000_000;
const MAX_OUTPUT_IMAGE_BYTES = 5 * 1024 * 1024;

async function fetchImageForGemini(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không thể tải ảnh từ mediaUrl. HTTP ${response.status}.`);
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_IMAGE_BYTES) throw new Error(
    `Ảnh quá lớn (${(contentLength / 1024 / 1024).toFixed(1)} MB). ` +
    `Vui lòng nén ảnh xuống dưới ${MAX_SOURCE_IMAGE_BYTES / 1024 / 1024} MB trước khi xử lý AI.`
  );
  if (!response.body) throw new Error('Không nhận được dữ liệu ảnh từ mediaUrl.');
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_SOURCE_IMAGE_BYTES) {
        await reader.cancel();
        throw new Error(`Ảnh quá lớn (> ${MAX_SOURCE_IMAGE_BYTES / 1024 / 1024} MB). ` + `Vui lòng nén ảnh trước khi chạy AI.`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  let sourceBuffer = Buffer.concat(chunks);
  try {
    const sourceImage = sharp(sourceBuffer, {
      limitInputPixels: MAX_INPUT_IMAGE_PIXELS
    });
    const metadata = await sourceImage.metadata();
    if (!metadata.width || !metadata.height) throw new Error('Không xác định được kích thước ảnh.');
    const sourcePixels = metadata.width * metadata.height;
    console.log(`[Image] ${metadata.width}x${metadata.height}, ` + `${(sourceBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    if (sourcePixels > MAX_INPUT_IMAGE_PIXELS) throw new Error(`Ảnh có ${sourcePixels.toLocaleString()} pixels, vượt giới hạn an toàn ${MAX_INPUT_IMAGE_PIXELS.toLocaleString()} pixels.`);
    if (sourcePixels > MAX_IMAGE_WIDTH * MAX_IMAGE_HEIGHT) console.log(`[Image] Ảnh có độ phân giải lớn, sẽ resize trước khi gửi Gemini.`);
    if (metadata.width > MAX_IMAGE_WIDTH || metadata.height > MAX_IMAGE_HEIGHT) console.log(`[Image] Ảnh vượt ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}, sẽ resize.`);
    let processedBuffer = await sourceImage.resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true
    }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    if (processedBuffer.length > MAX_OUTPUT_IMAGE_BYTES) processedBuffer = await sharp(processedBuffer).jpeg({ quality: 70, mozjpeg: true }).toBuffer();
    console.log(`[Image] Ảnh gửi Gemini: ${(processedBuffer.length / 1024 / 1024).toFixed(2)} MB JPEG.`);
    return { inlineData: { data: processedBuffer.toString('base64'), mimeType: 'image/jpeg' } };
  } catch (error) {
    throw new Error(`Không thể kiểm tra/nén ảnh trước khi chạy AI: ${error.message}`);
  } finally {
    sourceBuffer = null;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_SYNC_RETRIES = 3;
const MAX_ROLLBACK_RETRIES = 2;

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
};

function cloneJson(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
};

async function getArtworkSnapshot(artworkId) {
  const { rows } = await pool.query(
    `SELECT title, description, title_en, description_en, ai_attributes, status
     FROM artworks
     WHERE id = $1`,
    [artworkId]);
  if (!rows[0]) throw new Error(`Không tìm thấy artwork ${artworkId} trong PostgreSQL.`);
  const mongoDoc = await ArtworkDetail.collection.findOne({ artwork_id: artworkId });
  return { postgres: cloneJson(rows[0]), mongo: mongoDoc };
};

async function restorePostgresSnapshot(artworkId, snapshot) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE artworks SET
         title = $1,
         description = $2,
         title_en = $3,
         description_en = $4,
         ai_attributes = $5::jsonb,
         status = $6
       WHERE id = $7`,
      [
        snapshot.postgres.title,
        snapshot.postgres.description,
        snapshot.postgres.title_en,
        snapshot.postgres.description_en,
        JSON.stringify(snapshot.postgres.ai_attributes ?? {}),
        snapshot.postgres.status,
        artworkId
      ]);
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Failed to roll back artwork transaction:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
};

async function restoreMongoSnapshot(artworkId, snapshot) {
  if (snapshot.mongo) {
    await ArtworkDetail.collection.replaceOne({ _id: snapshot.mongo._id }, snapshot.mongo, { upsert: true });
  } else {
    await ArtworkDetail.collection.deleteOne({ artwork_id: artworkId });
  }
};

async function restoreArtworkSnapshot(artworkId, snapshot) {
  await restorePostgresSnapshot(artworkId, snapshot);
  await restoreMongoSnapshot(artworkId, snapshot);
  await syncSingleArtwork(artworkId);
};

async function rollbackUntilConsistent(artworkId, snapshot) {
  let lastRollbackError;
  for (let attempt = 1; attempt <= MAX_ROLLBACK_RETRIES; attempt++) {
    try {
      console.log(`[DB Sync] Rollback toàn bộ lần ${attempt}/${MAX_ROLLBACK_RETRIES}...`);
      await restoreArtworkSnapshot(artworkId, snapshot);
      console.log(`[DB Sync] Rollback PostgreSQL + MongoDB + Algolia thành công.`);
      return;
    } catch (error) {
      lastRollbackError = error;
      console.error(`[DB Sync] Rollback lần ${attempt} thất bại:`, error.message);
      if (attempt < MAX_ROLLBACK_RETRIES) await sleep(1000 * attempt);
    }
  }
  throw new Error(`Không thể rollback nhất quán artwork ${artworkId}. ` + `Lỗi rollback cuối: ${lastRollbackError?.message || 'Unknown error'}`);
};

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
};

function normalizeUserHints(value) {
  if (Array.isArray(value)) return value.map(item => normalizeText(item)).filter(Boolean);
  if (typeof value === 'string') return value.split(/\n|;/).map(item => item.trim()).filter(Boolean);
  return [];
};

function normalizeGeneratedAttributes(rawAttributes) {
  const raw = safeObject(rawAttributes);
  const flat = Object.keys(raw).some(key => key !== 'postgres' && key !== 'mongo') ? raw : {};
  let postgres = safeObject(raw.postgres);
  let mongo = safeObject(raw.mongo);
  if (Object.keys(postgres).length === 0 && Object.keys(mongo).length === 0 && Object.keys(flat).length > 0) {
    postgres = flat;
    mongo = flat;
  }
  if (Object.keys(postgres).length === 0 && Object.keys(mongo).length > 0) {
    postgres = mongo;
  }
  if (Object.keys(mongo).length === 0 && Object.keys(postgres).length > 0) {
    mongo = postgres;
  }
  return { postgres, mongo };
};

function normalizeTranslatedDatabase(sourceAttributes, translatedDatabase) {
  const source = safeObject(sourceAttributes);
  const translated = safeObject(translatedDatabase);
  const flatTranslated = Object.keys(translated).some(key => key !== 'en' && key !== 'vi') ? translated : {};
  let en = safeObject(translated.en);
  let vi = safeObject(translated.vi);
  if (Object.keys(en).length === 0 && Object.keys(flatTranslated).length > 0) {
    en = flatTranslated;
  }
  if (Object.keys(vi).length === 0 && Object.keys(flatTranslated).length > 0) {
    vi = flatTranslated;
  }
  if (Object.keys(en).length === 0) en = { ...source };
  if (Object.keys(vi).length === 0) vi = { ...source };
  return { en, vi };
};

function mergeMongoWithPostgres(postgres, mongo) {
  return {
    en: { ...postgres.en, ...mongo.en },
    vi: { ...postgres.vi, ...mongo.vi }
  };
};

function normalizeTranslationResult(originalData, translationResult) {
  const translatedAttributes = safeObject(translationResult?.translated_attributes);
  const postgres = normalizeTranslatedDatabase(originalData.postgres, translatedAttributes.postgres);
  const mongoRaw = normalizeTranslatedDatabase(originalData.mongo, translatedAttributes.mongo);
  const mongo = mergeMongoWithPostgres(postgres, mongoRaw);
  const originalDescriptionVi = normalizeText(originalData.description_vi);
  const originalDescriptionEn = normalizeText(originalData.description_en);
  const translatedDescriptionVi = normalizeText(translationResult?.translated_description_vi);
  const translatedDescriptionEn = normalizeText(translationResult?.translated_description_en);
  let finalDescriptionVi = originalDescriptionVi;
  let finalDescriptionEn = originalDescriptionEn;
  if (!finalDescriptionVi && !finalDescriptionEn) {
    finalDescriptionVi = translatedDescriptionVi || originalDescriptionVi;
    finalDescriptionEn = translatedDescriptionEn || originalDescriptionEn;
  } else if (finalDescriptionVi && !finalDescriptionEn) {
    finalDescriptionEn = translatedDescriptionEn || originalDescriptionEn || finalDescriptionVi;
  } else if (!finalDescriptionVi && finalDescriptionEn) {
    finalDescriptionVi = translatedDescriptionVi || originalDescriptionVi || finalDescriptionEn;
  }
  const translatedTitle = normalizeText(translationResult?.translated_title);
  const existingTitleEn = normalizeText(originalData.title_en);
  return {
    translated_title: existingTitleEn || translatedTitle || originalData.title,
    translated_description_vi: finalDescriptionVi,
    translated_description_en: finalDescriptionEn,
    translated_attributes: { postgres, mongo }
  };
}

async function saveArtworkWithRollbackRetry({ artworkId, title, finalTitleVi, finalDescVi, finalTitleEn, finalDescEn, pgAttributes, mongoAttributes, status = 'published' }) {
  const snapshot = await getArtworkSnapshot(artworkId);
  let lastError;
  for (let attempt = 1; attempt <= MAX_SYNC_RETRIES; attempt++) {
    try {
      console.log(`[DB Sync] Lần thử ${attempt}/${MAX_SYNC_RETRIES} cho "${title}"...`);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE artworks SET
             title = $1,
             description = $2,
             title_en = $3,
             description_en = $4,
             ai_attributes = $5::jsonb,
             status = $6
           WHERE id = $7`,
          [
            finalTitleVi,
            finalDescVi,
            finalTitleEn,
            finalDescEn,
            JSON.stringify(pgAttributes),
            status,
            artworkId
          ]);
        await client.query('COMMIT');
      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Failed to roll back artwork transaction:', rollbackError);
        }
        throw error;
      } finally {
        client.release();
      }
      await ArtworkDetail.findOneAndUpdate(
        { artwork_id: artworkId },
        { $set: { attributes: mongoAttributes, updated_at: new Date() } },
        { upsert: true, new: true, runValidators: true }
      );
      await syncSingleArtwork(artworkId);
      console.log(`[DB Sync] PostgreSQL + MongoDB + Algolia đều OK cho "${title}".`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`[DB Sync] Lần thử ${attempt}/${MAX_SYNC_RETRIES} thất bại cho "${title}":`, error.message);
      try {
        await rollbackUntilConsistent(artworkId, snapshot);
      } catch (rollbackError) {
        throw new Error(`Không thể đảm bảo dữ liệu đồng nhất cho artwork ${artworkId}. ` + `Lỗi gốc: ${error.message}. ${rollbackError.message}`);
      }
      if (attempt < MAX_SYNC_RETRIES) {
        await sleep(1500 * attempt);
      }
    }
  }
  throw lastError || new Error(`Không thể đồng bộ artwork ${artworkId}.`);
};

function getPromptConfig(layoutType, { title, artist, artistId, hasUserMongoHints = false, userHints = [] }) {
  const isDigital = layoutType === 'digital';
  const artistName = artistId ? (isDigital ? 'một Digital Artist' : 'một nghệ sĩ độc lập') : (artist || 'Khuyết danh');
  const descriptionPrompt = isDigital
    ? `Bạn là một chuyên gia phân tích Digital Art (Nghệ thuật số).
      Tác phẩm này có tên: "${title}" (Tác giả: ${artistName}).
      Dựa vào hình ảnh, hãy viết một đoạn mô tả khoảng 7-8 dòng bằng TIẾNG VIỆT.

      Yêu cầu:
      - Tập trung vào ánh sáng ảo, kết cấu, kỹ xảo thị giác và không khí của tác phẩm.
      - Không dùng các thuật ngữ hội họa truyền thống nếu hình ảnh không thể hiện điều đó.
      - Không tự bịa câu chuyện hoặc bối cảnh lịch sử.
      - Chỉ mô tả những gì có thể quan sát hoặc suy ra hợp lý từ hình ảnh.
      - Trả về plain text, không JSON.`
    : `Bạn là một nhà phê bình nghệ thuật.
      Tác phẩm này có tên gốc là: "${title}" (Tác giả: ${artistName}).
      Dựa vào hình ảnh, hãy viết một đoạn mô tả khoảng 7-8 dòng bằng TIẾNG VIỆT.

      Yêu cầu:
      - Tập trung vào vẻ đẹp thị giác, cảm xúc, ánh sáng, màu sắc và đường nét.
      - Không tự bịa bối cảnh hoặc lịch sử nếu hình ảnh không cung cấp cơ sở.
      - Chỉ mô tả những gì có thể quan sát hoặc suy ra hợp lý từ hình ảnh.
      - Trả về plain text, không JSON.`;
  const userHintsJson = JSON.stringify(userHints);
  const mongoRule = hasUserMongoHints
    ? `Người dùng đã cung cấp một mảng VALUE cho MongoDB:
      ${userHintsJson}

      Quy tắc MongoDB khi có mảng value người dùng:
      - "postgres" vẫn phải được AI suy luận độc lập từ hình ảnh + mô tả.
      - "mongo" PHẢI chứa toàn bộ thuộc tính của "postgres".
      - Với mỗi value người dùng cung cấp, AI hãy suy ra KEY/ý nghĩa phù hợp nhất rồi đặt value đó dưới key tương ứng.
      - Giữ nguyên value người dùng càng sát càng tốt; không bịa thêm nội dung cho value đó.
      - Nếu một value rõ ràng thuộc cùng một key thì có thể gom vào cùng key; không được làm mất thông tin.
      - KHÔNG tự suy nghĩ hoặc tự thêm các thuộc tính mở rộng MongoDB ngoài những value người dùng đã cung cấp.
      - Không được bỏ qua mảng value người dùng.
      - Không dùng "core" hoặc "extended".`
    : `Quy tắc MongoDB khi người dùng không cung cấp value:
      - "mongo" PHẢI chứa toàn bộ thuộc tính của "postgres".
      - Có thể thêm một số thuộc tính mở rộng thực sự hữu ích nếu có bằng chứng từ hình ảnh hoặc mô tả.
      - Không cần cố tạo nhiều attribute.
      - Không dùng "core" hoặc "extended".`;
  const attributePrompt = isDigital
    ? `Dựa vào hình ảnh kỹ thuật số và đoạn mô tả sau: "{{DESCRIPTION}}".
      Hãy trích xuất các thuộc tính hữu ích cho việc phân loại và tìm kiếm.

      Yêu cầu:
      - Trả về 2 object phẳng: "postgres" và "mongo".
      - "postgres" gồm các thuộc tính cốt lõi: art_type, art_movement, country, colors, century, materials.
      - Chỉ ghi thông tin có cơ sở từ hình ảnh hoặc mô tả; không chắc thì dùng "Unknown".
      - "colors" chỉ chọn 1 màu nổi bật từ: Đỏ, Cam, Vàng, Xanh lá, Xanh dương, Tím, Hồng, Nâu, Đen, Trắng, Xám.
      - Giá trị là chuỗi; nhiều giá trị có thể nối bằng dấu phẩy.
      - Với digital art, art_type/art_movement chỉ chọn khi thực sự có cơ sở.

      ${mongoRule}

      Có thể dùng các nhóm thuộc tính mở rộng digital art khi phù hợp với mảng value người dùng: emotions, lighting, perspective, themes, software, technique, environment, subject.`
    : `Dựa vào hình ảnh và đoạn mô tả sau: "{{DESCRIPTION}}".
      Hãy trích xuất các thuộc tính nghệ thuật hữu ích cho việc phân loại và tìm kiếm.

      Yêu cầu:
      - Trả về 2 object phẳng: "postgres" và "mongo".
      - "postgres" gồm các thuộc tính cốt lõi: art_type, art_movement, country, colors, century, materials.
      - Chỉ ghi thông tin có cơ sở từ hình ảnh hoặc mô tả; không chắc thì dùng "Unknown".
      - "colors" chỉ chọn 1 màu nổi bật từ: Đỏ, Cam, Vàng, Xanh lá, Xanh dương, Tím, Hồng, Nâu, Đen, Trắng, Xám.
      - Giá trị là chuỗi; nhiều giá trị có thể nối bằng dấu phẩy.

      ${mongoRule}

      Có thể dùng các nhóm thuộc tính mở rộng như: emotions, inspirations, lighting, composition, subject, themes, technique khi phù hợp và có bằng chứng.`;
  const translationPrompt =
    `Bạn đang hoàn thiện dữ liệu nghệ thuật để lưu vào PostgreSQL và MongoDB.

      Dữ liệu nguồn:
      {{DATA}}

      Quy tắc mô tả:
      - "description_vi" là bản Tiếng Việt người dùng đã nhập hoặc AI vừa tạo.
      - "description_en" là bản Tiếng Anh người dùng đã nhập nếu có.
      - Nếu description_vi có và description_en có: GIỮ NGUYÊN CẢ HAI, KHÔNG dịch lại, không viết lại, không bổ sung.
      - Nếu chỉ có description_vi: dịch description_vi sang Tiếng Anh và trả vào "translated_description_en".
      - Nếu chỉ có description_en: dịch description_en sang Tiếng Việt và trả vào "translated_description_vi".
      - Nếu cả hai đều rỗng: không tự viết mô tả ở bước này.

      Quy tắc title:
      - Nếu "title_en" đã có giá trị thì GIỮ NGUYÊN title_en.
      - Nếu title_en rỗng thì dịch title sang Tiếng Anh.

      Quy tắc attributes:
      - Tạo "translated_attributes" có riêng "postgres" và "mongo".
      - Mỗi phần có "en" và "vi" là object phẳng.
      - Dịch cả key và value sang ngôn ngữ tương ứng.
      - Không tự thêm attribute mới.
      - Các value do người dùng cung cấp cho Mongo là dữ liệu nguồn ưu tiên; không được bỏ, đổi nghĩa hoặc tự thêm thông tin.
      - Giữ nguyên tên riêng, tên phần mềm, công cụ và thuật ngữ chuyên ngành khi phù hợp.
      - Mongo phải chứa toàn bộ attribute của PostgreSQL rồi mới có các attribute mở rộng của Mongo.
      - Không dùng "core" hoặc "extended".

      Trả về JSON đúng dạng:
      {
        "translated_title": "...",
        "translated_description_vi": "...",
        "translated_description_en": "...",
        "translated_attributes": {
          "postgres": { "en": {}, "vi": {} },
          "mongo": { "en": {}, "vi": {} }
        }
      }

      Chỉ trả về JSON.`;
  return { descriptionPrompt, attributePrompt, translationPrompt };
}

const processArtworkAI = async (jobData) => {
  const { artworkId, mediaUrl, title, artist, layout_type, artistId, existingDescription, existingDescriptionEn, existingTitleEn, userHints } = jobData;
  if (!['classic', 'digital'].includes(layout_type)) throw new Error(`layout_type không hợp lệ: ${layout_type}`);
  const descriptionViInput = normalizeText(existingDescription);
  const descriptionEnInput = normalizeText(existingDescriptionEn);
  const titleEnInput = normalizeText(existingTitleEn);
  const normalizedUserHints = normalizeUserHints(userHints);
  const hasUserMongoHints = normalizedUserHints.length > 0;
  console.log(`AI đang xử lý tác phẩm "${title}" (${layout_type}).`);
  try {
    const imagePart = await fetchImageForGemini(mediaUrl);
    const prompts = getPromptConfig(layout_type, { title, artist, artistId, hasUserMongoHints, userHints: normalizedUserHints });
    let generatedDescriptionVi = descriptionViInput;
    let generatedDescriptionEn = descriptionEnInput;
    if (generatedDescriptionVi && generatedDescriptionEn) {
      console.log(`[AI Pipeline - ${layout_type}] Bước 1: Có đủ mô tả VI + EN, bỏ qua xử lý mô tả.`);
    } else if (generatedDescriptionVi) {
      console.log(`[AI Pipeline - ${layout_type}] Bước 1: Đã có mô tả VI, bỏ qua viết mới; sẽ dịch sang EN.`);
    } else if (generatedDescriptionEn) {
      console.log(`[AI Pipeline - ${layout_type}] Bước 1: Đã có mô tả EN, bỏ qua viết mới; sẽ dịch sang VI.`);
    } else {
      console.log(`[AI Pipeline - ${layout_type}] Bước 1: Chưa có mô tả, AI đang viết bản VI...`);
      const result1 = await textModel.generateContent([prompts.descriptionPrompt, imagePart]);
      generatedDescriptionVi = result1.response.text().trim();
      if (generatedDescriptionVi.startsWith('{') && generatedDescriptionVi.endsWith('}')) {
        try {
          const parsedDesc = JSON.parse(generatedDescriptionVi);
          generatedDescriptionVi = parsedDesc.description || Object.values(parsedDesc)[0] || generatedDescriptionVi;
        } catch {
          console.log('[AI Pipeline] Không thể bóc tách JSON mô tả, dùng chuỗi gốc.');
        }
      }
    }
    console.log(`[AI Pipeline - ${layout_type}] Bước 2: AI suy luận thuộc tính PostgreSQL${hasUserMongoHints ? ' và ánh xạ value người dùng cho MongoDB' : ' và MongoDB'}...`);
    const attributePrompt = prompts.attributePrompt.replace('{{DESCRIPTION}}', generatedDescriptionVi || generatedDescriptionEn || '');
    const result2 = await jsonModel.generateContent([attributePrompt, imagePart]);
    const generatedAttributes = JSON.parse(result2.response.text());
    console.log(`[AI Pipeline - ${layout_type}] Bước 3: Dịch và hoàn thiện ngôn ngữ...`);
    const dataToTranslate = { title, title_en: titleEnInput, description_vi: generatedDescriptionVi, description_en: generatedDescriptionEn, attributes: generatedAttributes, user_mongo_values: normalizedUserHints };
    const translationPrompt = prompts.translationPrompt.replace('{{DATA}}', JSON.stringify(dataToTranslate));
    const result3 = await jsonModel.generateContent(translationPrompt);
    const translationResult = JSON.parse(result3.response.text());
    console.log(`[AI Pipeline - ${layout_type}] Bước 4: Chuẩn hóa và lưu dữ liệu...`);
    const generated = normalizeGeneratedAttributes(generatedAttributes);
    const normalizedResult = normalizeTranslationResult(
      {
        title,
        title_en: titleEnInput,
        description_vi: generatedDescriptionVi,
        description_en: generatedDescriptionEn,
        postgres: generated.postgres,
        mongo: generated.mongo
      },
      translationResult
    );
    await saveArtworkWithRollbackRetry({
      artworkId,
      title,
      finalTitleVi: title,
      finalDescVi: normalizedResult.translated_description_vi,
      finalTitleEn: normalizedResult.translated_title,
      finalDescEn: normalizedResult.translated_description_en,
      pgAttributes: normalizedResult.translated_attributes.postgres,
      mongoAttributes: normalizedResult.translated_attributes.mongo
    });
    console.log(`Tác phẩm "${title}" (${layout_type}) được AI xử lý thành công.`);
  } catch (error) {
    console.error(
      `[LỖI] Tác phẩm "${title}" (${layout_type}) xử lý thất bại:`,
      error
    );
    throw error;
  }
};

module.exports = { processArtworkAI };