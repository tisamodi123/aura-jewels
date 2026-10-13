import { parentPort, workerData } from 'worker_threads';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import fs from 'fs';

const normalize = (str) =>
  str
    ?.toString()
    .toLowerCase()
    .replace(/\s+/g, "")        // remove all spaces
    .replace(/[^a-z0-9]/g, "")  // remove special chars
    .trim();

const resolveParamId = (value, map) => {
  if (!value) return null;
  const key = normalize(value);
  const matched = map[key];
  return matched ? matched._id : null;
};

const toNumber = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  // Keep digits, dots, and minus signs
  const num = Number(val.toString().replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

const generateRandomRap = () => {
  return Math.floor((Math.random() * 900000 + 100000) / 1000) * 1000;
};

const generateRandomDiscount = () => {
  return Math.floor(Math.random() * (60 - 10 + 1)) + 10;
};

const findRowValue = (row, possibleKeys) => {
  const rowKeys = Object.keys(row);
  for (const possible of possibleKeys) {
    const normPossible = possible.toLowerCase().trim();
    // Look for exact match first
    for (const rk of rowKeys) {
      if (rk.toLowerCase().trim() === normPossible) {
        return row[rk];
      }
    }
  }
  // Look for partial match
  for (const possible of possibleKeys) {
    const normPossible = possible.toLowerCase().trim();
    for (const rk of rowKeys) {
      if (rk.toLowerCase().trim().includes(normPossible)) {
        return row[rk];
      }
    }
  }
  return undefined;
};

const run = async () => {
  try {
    const { filePath, fileBuffer, mimeType, parameterIdMaps, existingPricing, userId } = workerData;

    let data = [];

    // Parse spreadsheet or CSV file
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const workbook = new ExcelJS.Workbook();
      if (filePath) {
        await workbook.xlsx.readFile(filePath);
      } else if (fileBuffer) {
        const buf = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
        await workbook.xlsx.load(buf);
      } else {
        throw new Error('No path or buffer supplied');
      }

      workbook.eachSheet((worksheet) => {
        let isFirstRow = true;
        worksheet.eachRow((row) => {
          if (!isFirstRow) {
            const rowData = {};
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const headerCell = worksheet.getRow(1).getCell(colNumber);
              const key = headerCell?.value?.toString().trim().toLowerCase();
              let val = cell?.value;
              if (val && typeof val === 'object') {
                if (val.text) val = val.text;
                else if (val.result) val = val.result;
              }
              if (key) rowData[key] = val;
            });
            data.push(rowData);
          }
          isFirstRow = false;
        });
      });
    } else if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel') {
      let source;
      if (filePath) {
        source = fs.createReadStream(filePath);
      } else if (fileBuffer) {
        const buf = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
        source = Readable.from(buf);
      } else {
        throw new Error('No path or buffer supplied');
      }

      await new Promise((resolve, reject) => {
        source
          .pipe(csvParser())
          .on('data', (row) => {
            const cleanedRow = {};
            for (let key of Object.keys(row)) {
              cleanedRow[key.trim().toLowerCase()] = row[key];
            }
            data.push(cleanedRow);
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      throw new Error('Unsupported file format/mimetype');
    }

    if (data.length === 0) {
      parentPort.postMessage({ success: true, operations: [], totalRows: 0, rejectedRows: [] });
      return;
    }

    const operations = [];
    const rejectedRows = [];
    let totalRows = 0;

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      totalRows++;

      // 1. Identify and Validate Stock ID
      const stockIdRaw = row['stockid'] || row['stock id'] || row['stock_id'] || row['stockcode'] || row['stock code'];
      if (!stockIdRaw) {
        row.issues = 'Missing Stock ID';
        rejectedRows.push(row);
        continue;
      }
      const stockId = stockIdRaw.toString().trim().toUpperCase();

      // 2. Validate Status
      const statusRaw = row['status'] || 'AVAILABLE';
      const status = statusRaw.toString().trim().toUpperCase();

      // 3. Validate SizeMM (support sizemm, size mm, size_mm, measurement, measurements, dimensions, size, size(mm))
      const sizeMMRaw = findRowValue(row, ['sizemm', 'size mm', 'size_mm', 'measurement', 'measurements', 'dimensions', 'size']) || '';
      const sizeMM = sizeMMRaw.toString().trim();

      // 4. Resolve master ObjectIDs
      const shapeRaw = row['shape'];
      const colorRaw = row['color'];
      const clarityRaw = row['clarity'];
      const cutRaw = row['cut'];
      const polishRaw = row['polish'];
      const symRaw = row['sym'] || row['symmetry'];
      const fluorRaw = row['fluor'] || row['fluorescence'] || row['fluro'] || row['fluorintensity'] || row['fluor intensity'];
      const labRaw = row['lab'] || row['cert lab'] || row['certlab'] || row['cert_lab'] || row['labname'] || row['lab name'];

      const issues = [];

      // Resolve required master ObjectIDs
      const shape = resolveParamId(shapeRaw, parameterIdMaps.shape);
      if (shapeRaw && shapeRaw.toString().trim() && !shape) {
        issues.push(`Invalid Shape: "${shapeRaw}"`);
      } else if (!shapeRaw || !shapeRaw.toString().trim()) {
        issues.push(`Shape is required`);
      }

      const color = resolveParamId(colorRaw, parameterIdMaps.color);
      if (colorRaw && colorRaw.toString().trim() && !color) {
        issues.push(`Invalid Color: "${colorRaw}"`);
      } else if (!colorRaw || !colorRaw.toString().trim()) {
        issues.push(`Color is required`);
      }

      const clarity = resolveParamId(clarityRaw, parameterIdMaps.clarity);
      if (clarityRaw && clarityRaw.toString().trim() && !clarity) {
        issues.push(`Invalid Clarity: "${clarityRaw}"`);
      } else if (!clarityRaw || !clarityRaw.toString().trim()) {
        issues.push(`Clarity is required`);
      }

      const certLab = resolveParamId(labRaw, parameterIdMaps.lab);
      if (labRaw && labRaw.toString().trim() && !certLab) {
        issues.push(`Invalid Lab: "${labRaw}"`);
      } else if (!labRaw || !labRaw.toString().trim()) {
        issues.push(`Lab is required`);
      }

      // Resolve optional master ObjectIDs (validate only if values are provided)
      let cut = null;
      if (cutRaw && cutRaw.toString().trim()) {
        cut = resolveParamId(cutRaw, parameterIdMaps.cut);
        if (!cut) issues.push(`Invalid Cut: "${cutRaw}"`);
      }

      let polish = null;
      if (polishRaw && polishRaw.toString().trim()) {
        polish = resolveParamId(polishRaw, parameterIdMaps.polish);
        if (!polish) issues.push(`Invalid Polish: "${polishRaw}"`);
      }

      let symmetry = null;
      if (symRaw && symRaw.toString().trim()) {
        symmetry = resolveParamId(symRaw, parameterIdMaps.symmetry);
        if (!symmetry) issues.push(`Invalid Sym: "${symRaw}"`);
      }

      let fluorescence = null;
      if (fluorRaw && fluorRaw.toString().trim()) {
        fluorescence = resolveParamId(fluorRaw, parameterIdMaps.fluorescence);
        if (!fluorescence) issues.push(`Invalid Fluor: "${fluorRaw}"`);
      }

      // 11. Gemstone fields
      const gemstoneType = (row['gemstonetype'] || row['gemstone type'] || row['gemstone_type'] || '').toString().trim();
      const gemstoneOrigin = (row['gemstoneorigin'] || row['gemstone origin'] || row['gemstone_origin'] || '').toString().trim();

      // 13. Carat
      const caratVal = row['carat'];
      const carat = toNumber(caratVal);
      if (caratVal === undefined || caratVal === null || caratVal === '' || isNaN(Number(caratVal)) || Number(caratVal) <= 0) {
        issues.push(`Invalid Carat: "${caratVal || ''}"`);
      }

      // 14. CaratNo
      const caratNoRaw = row['caratno'] || row['carat no'] || row['carat_no'] || '';
      const caratNo = caratNoRaw.toString().trim();

      // 16. Country
      const country = (row['country'] || '').toString().trim();

      // If any validation issues, reject this row
      if (issues.length > 0) {
        row.issues = issues.join(', ');
        rejectedRows.push(row);
        continue;
      }

      // 17. RAP & Discount (Generated or Preserved)
      const normStockId = stockId.toUpperCase().trim();
      const existing = existingPricing ? existingPricing[normStockId] : null;

      let rap = 0;
      let disc = 0;

      if (existing && existing.rap > 0) {
        rap = Number(existing.rap);
      } else {
        rap = generateRandomRap();
      }

      if (existing && existing.disc !== undefined && existing.disc !== 0) {
        disc = Number(existing.disc);
      } else {
        disc = generateRandomDiscount();
      }

      // Calculate PPC (PPC = RAP - (RAP * DISC / 100))
      const ppc = Number((rap - (rap * disc / 100)).toFixed(2));

      // Calculate Price (Price = PPC * Carat)
      const price = Number((ppc * carat).toFixed(2));

      const discount = `${disc}%`;

      // Other fields
      const creation = (row['creation'] || '').toString().trim();
      const certNo = (row['certno'] || row['cert no'] || row['cert_no'] || '').toString().trim();
      const certLink = (row['certlink'] || row['cert link'] || row['cert_link'] || '').toString().trim();

      operations.push({
        updateOne: {
          filter: { stockId },
          update: {
            $set: {
              status,
              shape,
              color,
              clarity,
              sizeMM,
              cut,
              polish,
              symmetry,
              fluorescence,
              creation,
              gemstoneType,
              gemstoneOrigin,
              carat,
              caratNo,
              certNo,
              certLab,
              certLink,
              country,
              rap,
              disc,
              discount,
              ppc,
              price,
              isDeleted: 0,
              updatedBy: userId,
            },
            $setOnInsert: {
              createdBy: userId,
            }
          },
          upsert: true,
        }
      });
    }

    parentPort.postMessage({
      success: true,
      operations,
      totalRows,
      rejectedCount: rejectedRows.length,
      rejectedRows,
    });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
};

run();
