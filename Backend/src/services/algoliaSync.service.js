const { searchClient } = require("algoliasearch");
const { pool } = require("../config/postgres");
const ArtworkDetail = require("../models/mongo/ArtworkDetail");
const client = searchClient(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const INDEX_NAME = "artworks";

const syncArtworkToAlgolia = async () => {
  try {
    console.log("Bắt đầu đồng dữ liệu lên Algolia...");
    const { rows: pgArtworks } = await pool.query("SELECT id, title, artist_display_name, media_url, ai_attributes FROM artworks WHERE status = 'published'");
    const algoliaRecords = pgArtworks.map((pgItem) => {
      const aiData = pgItem.ai_attributes || {};
      return {
        objectID: pgItem.id.toString(),
        title: pgItem.title,
        author: pgItem.artist_display_name,
        thumbnail: pgItem.media_url,
        country: aiData.country ? aiData.country[0] : null,
        category: aiData.art_type ? aiData.art_type[0] : null,
        colors: aiData.colors || [],
        ...aiData
      };
    });
    if (algoliaRecords.length > 0) {
      const response = await client.saveObjects({ indexName: INDEX_NAME, objects: algoliaRecords, });
      console.log(`Đồng bộ thành công ${response.objectIDs.length} tác phẩm!`);
    } else {
      console.log("Không có tác phẩm nào để đồng bộ.");
    }
  } catch (error) {
    console.error("Lỗi đồng bộ toàn phần Algolia:", error);
  }
};

const syncSingleArtwork = async (artworkId) => {
  try {
    const { rows } = await pool.query("SELECT id, slug, title, title_en, description, description_en, artist_display_name, media_url FROM artworks WHERE id = $1 AND status = 'published'", [artworkId]);
    if (rows.length === 0) return;
    const pgItem = rows[0];
    const mongoData = await ArtworkDetail.findOne({ artwork_id: artworkId }).lean();
    const extendedAttributes = mongoData ? mongoData.attributes : {};
    const algoliaRecord = {
      objectID: pgItem.id.toString(),
      slug: pgItem.slug,
      title: pgItem.title,
      title_en: pgItem.title_en,
      author: pgItem.artist_display_name,
      thumbnail: pgItem.media_url,
      description: pgItem.description,
      description_en: pgItem.description_en,
      ...extendedAttributes
    };
    await client.saveObjects({ indexName: INDEX_NAME, objects: [algoliaRecord], });
    console.log(`✅ Đã cập nhật dữ liệu tác phẩm ID ${artworkId} lên Algolia!`);
  } catch (error) {
    console.error(`Lỗi đồng bộ cục bộ tác phẩm ${artworkId}:`, error);
  }
};

const deleteArtworkFromAlgolia = async (artworkId) => {
  try {
    await client.deleteObject({ indexName: INDEX_NAME, objectID: artworkId.toString(), });
    console.log(`Đã xóa tác phẩm ID ${artworkId} khỏi hệ thống tìm kiếm.`);
  } catch (error) {
    console.error(`Lỗi khi xóa tác phẩm ${artworkId} trên tìm kiếm:`, error);
  }
};

module.exports = {
  syncArtworkToAlgolia,
  syncSingleArtwork,
  deleteArtworkFromAlgolia,
};