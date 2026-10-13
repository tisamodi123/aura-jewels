import Joi from 'joi';

export const getStatesSchema = Joi.object({
    countryId: Joi.string().trim().min(1).required()
}).unknown(true);

export const getCitiesSchema = Joi.object({
    stateId: Joi.string().trim().min(1).required()
}).unknown(true);

export const createCountyValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(2).max(10).required(),
  flag: Joi.string().allow("").optional(),
  faxNo: Joi.string().required(),
});

export const updateCountyValidation = Joi.object({
  name: Joi.string().min(2).max(100),
  code: Joi.string().min(2).max(10),
  flag: Joi.string().allow(""),
  faxNo: Joi.string(),
});