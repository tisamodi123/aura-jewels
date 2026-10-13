import { STATUS_CODE } from "../constants/statusCode.constant.js";
import {
  getCurrenciesService,
  addCurrencyService,
  updateCurrencyService,
  updateCurrencyStatusService,
  deleteCurrencyService,
  setDefaultCurrencyService
} from "../services/currency.services.js";

export const getCurrency = async (req, res) => {
  try {
    const formatted = await getCurrenciesService();
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Currencies fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("getCurrency error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const addCurrency = async (req, res) => {
  try {
    const formatted = await addCurrencyService(req.body);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Currency created successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("addCurrency error:", error);
    const isClientError = error.message.includes("required") || error.message.includes("exists");
    return res.status(isClientError ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: isClientError ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const updateCurrency = async (req, res) => {
  try {
    const { id } = req.params;
    const formatted = await updateCurrencyService(id, req.body);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Currency updated successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("updateCurrency error:", error);
    const isNotFound = error.message.includes("not found");
    return res.status(isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const updateCurrencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const formatted = await updateCurrencyStatusService(id);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: `Currency status updated to ${formatted.status}`,
      data: formatted,
    });
  } catch (error) {
    console.error("updateCurrencyStatus error:", error);
    const isNotFound = error.message.includes("not found");
    return res.status(isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const deleteCurrency = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCurrencyService(id);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Currency deleted successfully",
    });
  } catch (error) {
    console.error("deleteCurrency error:", error);
    const isNotFound = error.message.includes("not found");
    return res.status(isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const setDefaultCurrency = async (req, res) => {
  try {
    const { id } = req.params;
    const formatted = await setDefaultCurrencyService(id);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Default currency status updated successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("setDefaultCurrency error:", error);
    const isNotFound = error.message.includes("not found");
    return res.status(isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: isNotFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};
