const CategoryService = require ('../services/category.service');
const {HTTP_STATUS} = require ('../constants/httpStatus');
const asyncHandler = require ('../utils/asyncHandle');
const createError = require ('../utils/createError');
const {CATEROGY_MESSAGES, ERROR_MESSAGES} = require ('../constants/message');
const { SLUG, UUID } = require('../constants/regex');

const CategoryController = {
    create: asyncHandler (async (req, res) => {
        const {name, layout, three_d_config} = req.body;
        if (!name || !layout) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const result = await CategoryService.createCategory({name, layout_type:layout, three_d_config});
        return res.status(HTTP_STATUS.CREATED).json({message: CATEROGY_MESSAGES.CREATED, data: result});
    }),

    getAll: asyncHandler (async (req, res) => {
        const result= await CategoryService.getAllCategories();
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    getByLayout: asyncHandler(async (req, res) =>{
        const {layout} = req.query;
        if(!layout) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        const result = await CategoryService.getCategoriesByLayout(layout);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    getBySlug: asyncHandler (async (req, res) =>{
        const {slug} = req.params;
        if(!slug) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!SLUG.test(slug)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CategoryService.getCategoryBySlug(slug);
        return res.status(HTTP_STATUS.OK).json({data: result});
    }),

    update: asyncHandler (async (req, res) => {
        const {name, layout} = req.body;
        const {id} = req.params;
        if (!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const result = await CategoryService.updateCategory(id, {name, layout_type:layout});
        return res.status(HTTP_STATUS.OK).json({message: CATEROGY_MESSAGES.UPDATED, data: result});
    }),

    update3D: asyncHandler (async (req, res) => {
        const {id} = req.params;
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        const rawdata= req.body;
        const updateFields = {};
        if (rawdata.scale) {
            updateFields['three_d_config.scale'] = parseFloat(rawdata.scale);
        }
        if (rawdata.PositionX) updateFields['three_d_config.position.x'] = parseFloat(rawdata.PositionX);
        if (rawdata.PositionY) updateFields['three_d_config.position.y'] = parseFloat(rawdata.PositionY);
        if (rawdata.PositionZ) updateFields['three_d_config.position.z'] = parseFloat(rawdata.PositionZ);
        if (rawdata.RotationX) updateFields['three_d_config.rotation.x'] = parseFloat(rawdata.RotationX);
        if (rawdata.RotationY) updateFields['three_d_config.rotation.y'] = parseFloat(rawdata.RotationY);
        if (rawdata.RotationZ) updateFields['three_d_config.rotation.z'] = parseFloat(rawdata.RotationZ);
        const result = await CategoryService.update3DConfig(id, updateFields);
        return res.status(HTTP_STATUS.OK).json({message: CATEROGY_MESSAGES.UPDATED, data: result});
    }),

    delete: asyncHandler (async (req, res) =>{
        const {id} = req.params;
        if(!id) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        if(!UUID.test(id)) throw createError(ERROR_MESSAGES.WRONG_FORMAT, HTTP_STATUS.BAD_REQUEST);
        await CategoryService.deleteCategory(id);
        return res.status(HTTP_STATUS.OK).json({message: CATEROGY_MESSAGES.DELETED});
    })
};

module.exports = CategoryController;