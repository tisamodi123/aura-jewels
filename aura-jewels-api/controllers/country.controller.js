import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

const countries = [
    { id: "IN", name: "India" }
];

const states = {
    IN: [
        { id: "GJ", name: "Gujarat" },
        { id: "MH", name: "Maharashtra" },
        { id: "RJ", name: "Rajasthan" },
        { id: "DL", name: "Delhi" }
    ]
};

const cities = {
    GJ: [
        { id: "SUR", name: "Surat" },
        { id: "AHM", name: "Ahmedabad" },
        { id: "BRD", name: "Vadodara" },
        { id: "RJK", name: "Rajkot" }
    ],
    MH: [
        { id: "MUM", name: "Mumbai" },
        { id: "PUN", name: "Pune" },
        { id: "NAG", name: "Nagpur" }
    ],
    RJ: [
        { id: "JAI", name: "Jaipur" },
        { id: "JOD", name: "Jodhpur" },
        { id: "UDA", name: "Udaipur" }
    ],
    DL: [
        { id: "NDL", name: "New Delhi" }
    ]
};
import County from "../models/county.model.js";

// CREATE COUNTY
export const createCounty = async (req, res) => {
  try {
    const { code } = req.body;

    const existingCounty = await County.findOne({
      code: code.toUpperCase(),
    });

    if (existingCounty) {
      return res.status(409).json({
        success: false,
        message: "County code already exists",
      });
    }

    const county = await County.create(req.body);

    return res.status(201).json({
      success: true,
      message: "County created successfully",
      data: county,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL COUNTIES
export const getAllCounties = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const counties = await County.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await County.countDocuments();

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: counties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE COUNTY
export const getCountyById = async (req, res) => {
  try {
    const county = await County.findById(req.params.id);

    if (!county) {
      return res.status(404).json({
        success: false,
        message: "County not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: county,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE COUNTY
export const updateCounty = async (req, res) => {
  try {
    const county = await County.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!county) {
      return res.status(404).json({
        success: false,
        message: "County not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "County updated successfully",
      data: county,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE COUNTY
export const deleteCounty = async (req, res) => {
  try {
    const county = await County.findByIdAndDelete(req.params.id);

    if (!county) {
      return res.status(404).json({
        success: false,
        message: "County not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "County deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCountries = async (req, res) => {
    try {
        const countriesList = await County.find().sort({ name: 1 });
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COUNTRY.COUNTRIES_FETCHED,
            data: countriesList
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getStates = async (req, res) => {
    try {
        const countryId = req.body.countryId || req.query.countryId;
        const data = states[countryId] || [];
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COUNTRY.STATES_FETCHED,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCities = async (req, res) => {
    try {
        const stateId = req.body.stateId || req.query.stateId;
        const data = cities[stateId] || [];
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COUNTRY.CITIES_FETCHED,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
