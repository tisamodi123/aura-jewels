import Joi from 'joi';

// Colour and clarity are free text — whatever grade the stone groups carry
// ("GH", "VVS", "EF", "VS1"). They are no longer Parameter ids, so a grade can
// be labelled without first creating a Parameter row for it.
const grade = Joi.string().trim().min(1).max(20);

export const createLabelSchema = Joi.object({
    stoneType: Joi.string().valid("CENTER", "SIDE").required(),
    color: grade.required().messages({ "any.required": "Colour is required" }),
    clarity: grade.required().messages({ "any.required": "Clarity is required" }),
    labelName: Joi.string().trim().min(1).max(60).required()
}).unknown(true);

export const updateLabelSchema = Joi.object({
    stoneType: Joi.string().valid("CENTER", "SIDE").required(),
    color: grade.required().messages({ "any.required": "Colour is required" }),
    clarity: grade.required().messages({ "any.required": "Clarity is required" }),
    labelName: Joi.string().trim().min(1).max(60).required()
}).unknown(true);

export const listLabelSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    stoneType: Joi.string().valid("CENTER", "SIDE", "").optional()
}).unknown(true);
