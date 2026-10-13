import Counter from "../models/counter.model.js";

export const getNextSequenceValue = async (key) => {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return counter.value;
};

export const formatSequence = (value, prefix, pad = 3) => {
  return `${prefix}-${String(value).padStart(pad, "0")}`;
};

export const generateCustomOrderInquiryName = async () => {
  const nextValue = await getNextSequenceValue("custom_order_inquiry");
  return formatSequence(nextValue, "Inq");
};

export const generateQuotationName = async ({
  customOrderId,
  customOrderInqName,
}) => {
  const inquiryNumber = String(customOrderInqName).replace(/^Inq-/i, "");
  const baseName = `Quo-${inquiryNumber}`;

  const sequence = await getNextSequenceValue(`quotation_${customOrderId}`);

  if (sequence === 1) {
    return baseName;
  }

  return `${baseName}-${String(sequence).padStart(2, "0")}`;
};
