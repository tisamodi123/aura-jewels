import { getCurrencyInfoByIp } from '../utils/currencyConvertor.js';

export const getCurrencyInfo = async (req, res) => {
  try {
    const ip = req.query?.ip || req.body?.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress;
    const currencyCode = req.query?.currency || req.headers?.['x-currency'];
    const currencyInfo = await getCurrencyInfoByIp(ip, false, currencyCode);

    res.status(200).json({
      success: true,
      data: currencyInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency info',
      error: error.message
    });
  }
};


