import Currency from '../models/currency.model.js';

/**
 * Fetches the currency info based on IP address.
 * If IP is from India, returns INR. Otherwise USD.
 * @param {string} ip - The IP address of the user.
 * @returns {Promise<Object>} - { currencyCode, currencySymbol, country, exchangeRate }
 */
export const getCurrencyInfoByIp = async (ip, useBuffer = false, currencyCode = null) => {
  try {
    let country = 'IN'; // Default to IN

    if (currencyCode) {
      country = currencyCode.toUpperCase() === 'INR' ? 'IN' : 'US';
    } else if (ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'localhost') {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        if (data && data.status === 'success') {
          country = data.countryCode;
        }
      } catch (err) {
        console.error('Error fetching IP location:', err);
      }
    }

    // Default to INR for India; switch to USD for all other countries as requested
    const isIndia = country === 'IN';
    const targetCurrencyCode = currencyCode ? currencyCode.toUpperCase() : (isIndia ? 'INR' : 'USD');

    // Find the currency document from the Currency collection
    let currencyDoc = await Currency.findOne({ code: targetCurrencyCode, isActive: true });
    if (!currencyDoc) {
      currencyDoc = await Currency.findOne({ isDefault: true, isActive: true }) || await Currency.findOne({ code: 'INR', isActive: true });
      if (!currencyDoc) {
        throw new Error("Currency data not found. Please configure default currency in admin panel.");
      }
    }

    const defaultCurrencyDoc = await Currency.findOne({ isDefault: true, isActive: true }) || await Currency.findOne({ code: 'INR' });
    const defaultRate = defaultCurrencyDoc ? defaultCurrencyDoc.exchangeRate : 84.5;

    const targetRate = currencyDoc.exchangeRate;
    const targetBuffer = useBuffer ? (currencyDoc.buffer || 0) : 0;

    // effective exchange rate to divide DB prices by
    const exchangeRate = defaultRate / (targetRate * (1 + (targetBuffer / 100)));

    return {
      country,
      currencyCode: currencyDoc.code,
      currencySymbol: currencyDoc.symbol,
      exchangeRate,
      isIndia,
      isEnabled: true
    };
  } catch (error) {
    console.error('Error in getCurrencyInfoByIp:', error);
    // Fallback to USD
    return {
      country: 'US',
      currencyCode: 'USD',
      currencySymbol: '$',
      exchangeRate: 84.5,
      isIndia: false
    };
  }
};
let cachedDefaultCurrency = null;
let lastCacheUpdate = 0;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FALLBACK_CURRENCY = 'USD';

const getDefaultCurrency = async () => {
  const now = Date.now();

  if (
    cachedDefaultCurrency &&
    now - lastCacheUpdate < CACHE_TTL
  ) {
    return cachedDefaultCurrency;
  }

  const currency = await Currency.findOne({
    isDefault: true,
    isActive: true,
  }).lean();

  if (!currency) {
    // Fallback search to find any currency or code 'INR'
    const anyDefault = await Currency.findOne({ code: 'INR', isActive: true }).lean();
    if (anyDefault) {
      cachedDefaultCurrency = anyDefault;
      lastCacheUpdate = now;
      return anyDefault;
    }
    throw new Error('No default currency configured');
  }

  cachedDefaultCurrency = currency;
  lastCacheUpdate = now;

  return currency;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0];
  }

  return req.socket?.remoteAddress;
};

export const clearCurrencyCache = () => {
  cachedDefaultCurrency = null;
  lastCacheUpdate = 0;
};

export const getExchangeRateFromRequest = async (
  req,
  useBuffer = false
) => {
  try {
    const currencyCode =
      req.headers['x-currency'] ||
      req.query?.currency;

    const defaultCurrency = await getDefaultCurrency();

    if (currencyCode) {
      const currency = await Currency.findOne({
        code: currencyCode.toUpperCase(),
        isActive: true,
      }).lean();

      if (currency?.exchangeRate > 0) {
        const buffer = useBuffer
          ? Number(currency.buffer || 0)
          : 0;

        return {
          rate:
            defaultCurrency.exchangeRate /
            (
              currency.exchangeRate *
              (1 + buffer / 100)
            ),
          currency: currency.code,
        };
      }
    }
  } catch (error) {
    console.error(
      '[Currency Service] Currency lookup failed:',
      error
    );
  }

  try {
    const ip = getClientIp(req);

    const currencyInfo = await getCurrencyInfoByIp(
      ip,
      useBuffer
    );

    return {
      rate: currencyInfo.exchangeRate,
      currency: currencyInfo.currencyCode,
    };
  } catch (error) {
    console.error(
      '[Currency Service] IP fallback failed:',
      error
    );

    const defaultCurrency = await getDefaultCurrency().catch(() => ({ exchangeRate: 84.5, code: 'INR' }));
    return {
      rate: defaultCurrency.exchangeRate,
      currency: defaultCurrency.code,
    };
  }
};

export const adjustPricesForCurrency = (data, rate, currency) => {
  if (!data || !rate || rate <= 0 || rate === 1) return data;

  const priceKeys = [
    'finalPrice', 'originalPrice', 'metalPrice', 'labourPrice', 'otherChargePrice',
    'CenterDiamondPrice', 'SideDiamondPrice', 'TotalDiamondPrice', 'price',
    'setting_price', 'settingprice', 'total', 'subtotal', 'grandTotal',
    'shippingCharge', 'taxes', 'amount', 'finalValue', 'lgd_price', 'natural_price',
    'totalItemPrice', 'discountAmount', 'discountedValue', 'discountedPrice',
    'originalValue', 'mrp'
  ];

  const processObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (obj instanceof Date ||
      (obj.constructor && (obj.constructor.name === 'ObjectId' || obj.constructor.name === 'ObjectID' || obj.constructor.name === 'Decimal128')) ||
      obj._bsontype === 'ObjectID' ||
      obj._bsontype === 'Decimal128') {
      return obj;
    }

    // Handle mongoose documents that might be passed in (convert to plain object if possible)
    let target = obj;
    if (obj.toObject && typeof obj.toObject === 'function') {
      target = obj.toObject();
    } else if (obj._doc) {
      target = { ...obj._doc };
    }

    if (Array.isArray(target)) {
      return target.map(item => processObject(item));
    }

    const newObj = { ...target };
    for (const key in newObj) {
      if (priceKeys.includes(key) && typeof newObj[key] === 'number') {
        newObj[key] = parseFloat((newObj[key] / rate).toFixed(2));
      } else if (newObj[key] && typeof newObj[key] === 'object') {
        newObj[key] = processObject(newObj[key]);
      }
    }
    return newObj;
  };

  return processObject(data);
};

export const convertCurrency = (exchangeRate) => {
  if (!exchangeRate || exchangeRate <= 0 || exchangeRate === 1) {
    return { $addFields: {} };
  }

  const convertPriceExpr = (field) => ({
    $cond: [
      { $isNumber: field },
      { $round: [{ $divide: [field, exchangeRate] }, 2] },
      field
    ]
  });

  return {
    $addFields: {
      finalPrice: convertPriceExpr("$finalPrice"),
      originalPrice: convertPriceExpr("$originalPrice"),
      metalPrice: convertPriceExpr("$metalPrice"),
      labourPrice: convertPriceExpr("$labourPrice"),
      otherChargePrice: convertPriceExpr("$otherChargePrice"),
      CenterDiamondPrice: convertPriceExpr("$CenterDiamondPrice"),
      SideDiamondPrice: convertPriceExpr("$SideDiamondPrice"),
      TotalDiamondPrice: convertPriceExpr("$TotalDiamondPrice"),

      // Convert variants
      variants: {
        $cond: [
          { $isArray: "$variants" },
          {
            $map: {
              input: "$variants",
              as: "v",
              in: {
                $mergeObjects: [
                  "$$v",
                  {
                    finalPrice: convertPriceExpr("$$v.finalPrice"),
                    metalPrice: convertPriceExpr("$$v.metalPrice"),
                    labourPrice: convertPriceExpr("$$v.labourPrice"),
                    otherChargePrice: convertPriceExpr("$$v.otherChargePrice"),
                    CenterDiamondPrice: convertPriceExpr("$$v.CenterDiamondPrice"),
                    SideDiamondPrice: convertPriceExpr("$$v.SideDiamondPrice"),
                    TotalDiamondPrice: convertPriceExpr("$$v.TotalDiamondPrice"),
                    stoneDetails: {
                      $cond: [
                        { $isArray: "$$v.stoneDetails" },
                        {
                          $map: {
                            input: "$$v.stoneDetails",
                            as: "vsd",
                            in: {
                              $mergeObjects: [
                                "$$vsd",
                                {
                                  price: convertPriceExpr("$$vsd.price"),
                                  finalValue: convertPriceExpr("$$vsd.finalValue"),
                                  lgdPrice: convertPriceExpr("$$vsd.lgdPrice"),
                                  naturalPrice: convertPriceExpr("$$vsd.naturalPrice"),
                                  stoneGroup: {
                                    $cond: [
                                      { $and: [{ $ne: ["$$vsd.stoneGroup", null] }, { $eq: [{ $type: "$$vsd.stoneGroup" }, "object"] }] },
                                      {
                                        $mergeObjects: [
                                          "$$vsd.stoneGroup",
                                          {
                                            lgd_price: convertPriceExpr("$$vsd.stoneGroup.lgd_price"),
                                            natural_price: convertPriceExpr("$$vsd.stoneGroup.natural_price")
                                          }
                                        ]
                                      },
                                      "$$vsd.stoneGroup"
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        },
                        []
                      ]
                    }
                  }
                ]
              }
            }
          },
          []
        ]
      },

      // Convert stoneDetails
      stoneDetails: {
        $cond: [
          { $isArray: "$stoneDetails" },
          {
            $map: {
              input: "$stoneDetails",
              as: "sd",
              in: {
                $mergeObjects: [
                  "$$sd",
                  {
                    price: convertPriceExpr("$$sd.price"),
                    finalValue: convertPriceExpr("$$sd.finalValue"),
                    lgdPrice: convertPriceExpr("$$sd.lgdPrice"),
                    naturalPrice: convertPriceExpr("$$sd.naturalPrice"),
                    stoneGroup: {
                      $cond: [
                        { $and: [{ $ne: ["$$sd.stoneGroup", null] }, { $eq: [{ $type: "$$sd.stoneGroup" }, "object"] }] },
                        {
                          $mergeObjects: [
                            "$$sd.stoneGroup",
                            {
                              lgd_price: convertPriceExpr("$$sd.stoneGroup.lgd_price"),
                              natural_price: convertPriceExpr("$$sd.stoneGroup.natural_price")
                            }
                          ]
                        },
                        "$$sd.stoneGroup"
                      ]
                    }
                  }
                ]
              }
            }
          },
          []
        ]
      },

      // Convert similar products
      similarProductDetails: {
        $cond: [
          { $isArray: "$similarProductDetails" },
          {
            $map: {
              input: "$similarProductDetails",
              as: "sp",
              in: {
                $mergeObjects: [
                  "$$sp",
                  {
                    finalPrice: convertPriceExpr("$$sp.finalPrice")
                  }
                ]
              }
            }
          },
          []
        ]
      },

      // Convert combine with details
      combineWithDetails: {
        $cond: [
          { $isArray: "$combineWithDetails" },
          {
            $map: {
              input: "$combineWithDetails",
              as: "cw",
              in: {
                $mergeObjects: [
                  "$$cw",
                  {
                    finalPrice: convertPriceExpr("$$cw.finalPrice")
                  }
                ]
              }
            }
          },
          []
        ]
      }
    }
  };
};
