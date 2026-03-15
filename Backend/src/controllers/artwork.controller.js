const ArtworkService = require('../services/artwork.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const asyncHandler = require('../utils/asyncHandle');
const createError = require('../utils/createError');
const { ERROR_MESSAGES, ARTWORK_MESSAGES } = require('../constants/message');
const { SLUG, UUID } = require('../constants/regex');
const parseJSONSafe = require('../utils/parseJSONhelper');

const ArtworkController = {
  create: asyncHandler(async (req, res) => {
    if (!req.file) throw createError(ARTWORK_MESSAGES.MISSING_FILE, HTTP_STATUS.BAD_REQUEST);
    const rawdata = req.body;
    let categories = [];
    if (rawdata.category_ids) {
      if (Array.isArray(rawdata.category_ids)) {
        categories = rawdata.category_ids;
      } else {
        const parsed = parseJSONSafe(rawdata.category_ids, [rawdata.category_ids]);
        categories = Array.isArray(parsed) ? parsed : [parsed];
      }
    };
    const has3D = String(rawdata.has3D) === 'true';
    const three_d_config = has3D ? {
      scale: parseFloat(rawdata.scale || 1),
      position: {
        x: parseFloat(rawdata.PositionX || 0),
        y: parseFloat(rawdata.PositionY || 0),
        z: parseFloat(rawdata.PositionZ || 0)
      },
      rotation: {
        x: parseFloat(rawdata.RotationX || 0),
        y: parseFloat(rawdata.RotationY || 0),
        z: parseFloat(rawdata.RotationZ || 0)
      }
    } : {};
    const annotations = rawdata.annotations ? parseJSONSafe(rawdata.annotations, []) : [];
    if (annotations.length === 0 && rawdata.AnnotationTitle) {
      annotations.push({
        title: rawdata.AnnotationTitle,
        description: rawdata.AnnotationDescription,
        x: parseFloat(rawdata.AnnotationX || 0),
        y: parseFloat(rawdata.AnnotationY || 0)
      });
    }
    const data = {
      title: rawdata.title,
      slug: rawdata.slug,
      artist_id: rawdata.artist_id || null,
      artist_display_name: rawdata.artist_display_name,
      status: rawdata.status,
      description: rawdata.description,
      year: rawdata.year ? parseInt(rawdata.year) : new Date().getFullYear(),
      category_ids: categories,
      media_url: req.file.path,
      public_id: req.file.filename,
      media_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      attributes_text: rawdata.attributes_text,
      three_d_config,
      annotations
    };
    const result = await ArtworkService.createArtwork(data);
    return res.status(HTTP_STATUS.CREATED).json({ message: ARTWORK_MESSAGES.CREATED, data: result });
  }),

  getAll: asyncHandler(async (req, res) => {
    const { page, limit, category_ids, keyword } = req.query;
    const data = {
      page: parseInt(page),
      limit: parseInt(limit),
      category_ids: category_ids ? parseInt(category_ids) : null,
      keyword: keyword ? keyword : null
    };
    const result = await ArtworkService.getArtworks(data);
    return res.status(HTTP_STATUS.OK).json(result);
  }),

  getByAdmin: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const {layout} = req.query || null;
    const result = await ArtworkService.getArtworksForAdmin({ page, limit, layout });
    return res.status(HTTP_STATUS.OK).json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await ArtworkService.getArtworkById(id);
    return res.status(HTTP_STATUS.OK).json(result);
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw createError(ERROR_MESSAGES.MISSING_SLUG, HTTP_STATUS.BAD_REQUEST);
    if (!SLUG.test(slug)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
    const result = await ArtworkService.getArtworkBySlug(slug);
    if (!result) throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return res.status(HTTP_STATUS.OK).json({ data: result });
  }),

  update: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    let categories = [];
    if (updateData.category_ids) {
      if (Array.isArray(updateData.category_ids)) {
        categories = updateData.category_ids;
      } else {
        const parsed = parseJSONSafe(updateData.category_ids, [updateData.category_ids]);
        categories = Array.isArray(parsed) ? parsed : [parsed];
      }
    };
    const has3D = String(updateData.has3D) === 'true';
    const three_d_config = has3D ? {
      scale: parseFloat(updateData.scale || 1),
      position: {
        x: parseFloat(updateData.PositionX || 0),
        y: parseFloat(updateData.PositionY || 0),
        z: parseFloat(updateData.PositionZ || 0)
      },
      rotation: {
        x: parseFloat(updateData.RotationX || 0),
        y: parseFloat(updateData.RotationY || 0),
        z: parseFloat(updateData.RotationZ || 0)
      }
    } : {};
    const annotations = updateData.annotations ? parseJSONSafe(updateData.annotations, []) : [];
    if (annotations.length === 0 && updateData.AnnotationTitle) {
      annotations.push({
        title: updateData.AnnotationTitle,
        description: updateData.AnnotationDescription,
        x: parseFloat(updateData.AnnotationX || 0),
        y: parseFloat(updateData.AnnotationY || 0)
      });
    }
    const parsedYear = parseInt(updateData.year);
    const data = {
      title: updateData.title,
      slug: updateData.slug,
      artist_id: updateData.artist_id || null,
      artist_display_name: updateData.artist_display_name,
      status: updateData.status,
      description: updateData.description,
      year: isNaN(parsedYear) ? null : parsedYear,
      category_ids: categories,
      file: req.file,
      attributes_text: updateData.attributes_text, three_d_config, annotations
    };
    const result = await ArtworkService.updateArtwork(id, data);
    return res.status(HTTP_STATUS.OK).json({ message: ARTWORK_MESSAGES.UPDATED, data: result });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw createError(ERROR_MESSAGES.MISSING_ID, HTTP_STATUS.BAD_REQUEST);
    if (!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
    await ArtworkService.deleteArtwork(id);
    return res.status(HTTP_STATUS.OK).json({ message: ARTWORK_MESSAGES.DELETED });
  }),

  update3D: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw createError(ERROR_MESSAGES.MISSING_ID, HTTP_STATUS.BAD_REQUEST);
    if (!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
    const rawdata = req.body;
    const threeDData = {
      scale: parseFloat(rawdata.scale || 1),
      position: {
        x: parseFloat(rawdata.PositionX || 0),
        y: parseFloat(rawdata.PositionY || 0),
        z: parseFloat(rawdata.PositionZ || 0)
      },
      rotation: {
        x: parseFloat(rawdata.RotationX || 0),
        y: parseFloat(rawdata.RotationY || 0),
        z: parseFloat(rawdata.RotationZ || 0)
      }
    };
    const result = await ArtworkService.update3DConfig(id, threeDData);
    return res.status(HTTP_STATUS.OK).json({ message: ARTWORK_MESSAGES.UPDATED, data: result });
  }),

  addAnnotations: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw createError(ERROR_MESSAGES.MISSING_ID, HTTP_STATUS.BAD_REQUEST);
    if (!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
    const rawdata = req.body;
    const data = {
      x: rawdata.x ? parseFloat(rawdata.x) : undefined,
      y: rawdata.y ? parseFloat(rawdata.y) : undefined,
      title: rawdata.title,
      description: rawdata.description
    };
    const result = await ArtworkService.updateAnnotations(id, data);
    return res.status(HTTP_STATUS.OK).json({ message: ARTWORK_MESSAGES.UPDATED, data: result });
  })
};

module.exports = ArtworkController;