import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import fs from 'fs';

export const excel_to_array_convertor = async function (req, res) {
    try {
        if (req.files && typeof req.files === 'object' && Object.keys(req.files).length > 0) {
            const filesArray = Array.isArray(req.files) ? req.files : [req.files];
            const file = filesArray[0];

            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                const workbook = new ExcelJS.Workbook();
                if (file.path) {
                    await workbook.xlsx.readFile(file.path);
                } else if (file.buffer) {
                    const buf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
                    await workbook.xlsx.load(buf);
                } else {
                    return { errorCode: 400, message: 'File has no readable content (no path or buffer)' };
                }
                const data = [];
                workbook.eachSheet((worksheet, sheetId) => {
                    let isFirstRow = true;
                    worksheet.eachRow((row, rowNumber) => {
                        if (!isFirstRow) {
                            const rowData = {};
                            row.eachCell((cell, colNumber) => {
                                const headerCell = worksheet.getRow(1).getCell(colNumber);
                                const key = headerCell?.value?.toString().trim().toLowerCase();;
                                const value = cell?.value && typeof cell?.value === 'object' ? cell?.value?.text : cell?.value;
                                rowData[key] = value;
                            });
                            data.push(rowData);
                        }
                        isFirstRow = false;
                    });
                });
                return data;
            } else if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
                const data = [];
                let source;
                if (file.path) {
                    source = fs.createReadStream(file.path);
                } else if (file.buffer) {
                    const { Readable } = await import('stream');
                    const buf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
                    source = Readable.from(buf);
                } else {
                    return { errorCode: 400, message: 'File has no readable content (no path or buffer)' };
                }
                await new Promise((resolve, reject) => {
                    source
                        .pipe(csvParser())
                        .on('data', (row) => {
                            data.push(row);
                        })
                        .on('end', () => {
                            resolve();
                        })
                        .on('error', (error) => {
                            reject(error);
                        });
                });
                return data;
            } else {
                return { errorCode: 400, message: 'Unsupported file format. Please upload an Excel or CSV file' };
            }

        } else {
            return { errorCode: 400, message: 'Please upload file..!' };
        }
    } catch (error) {
        console.log(error?.message);
    }
}



export const convert_excel_to_array_jewellery = async function (req, res) {
    try {
        if (req.files && typeof req.files === 'object' && Object.keys(req.files).length > 0) {
            const filesArray = Array.isArray(req.files) ? req.files : [req.files];
            const file = filesArray[0];
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                const workbook = new ExcelJS.Workbook();

                if (file.path) {
                    // Disk storage (local dev)
                    await workbook.xlsx.readFile(file.path);
                } else if (file.buffer) {
                    // Memory storage (S3/AWS) or child process IPC
                    // IPC serializes Buffer as {type:'Buffer', data:[...]} — reconstruct it
                    const buf = Buffer.isBuffer(file.buffer)
                        ? file.buffer
                        : Buffer.from(file.buffer);
                    await workbook.xlsx.load(buf);
                } else {
                    return { errorCode: 400, message: 'File has no readable content (no path or buffer)' };
                }

                const data = [];
                workbook.eachSheet((worksheet, sheetId) => {
                    const headerRow = worksheet.getRow(1);

                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber > 1) {
                            const rowData = {};
                            row.eachCell((cell, colNumber) => {
                                const headerCell = headerRow.getCell(colNumber);
                                const key = headerCell?.value
                                    ? headerCell.value.toString().trim()
                                    : `column_${colNumber}`;
                                let value;

                                if (!cell.value) {
                                    value = "";
                                } else if (typeof cell.value === "object") {
                                    value = cell.value.text || cell.value.result || "";
                                } else {
                                    value = cell.value;
                                } rowData[key] = value;
                            });
                            data.push(rowData);
                        }
                    });
                });

                return data;
            } else if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
                const data = [];
                let source;
                if (file.path) {
                    source = fs.createReadStream(file.path);
                } else if (file.buffer) {
                    const { Readable } = await import('stream');
                    const buf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
                    source = Readable.from(buf);
                } else {
                    return { errorCode: 400, message: 'File has no readable content (no path or buffer)' };
                }
                await new Promise((resolve, reject) => {
                    source
                        .pipe(csvParser())
                        .on('data', (row) => {
                            data.push(row);
                        })
                        .on('end', () => {
                            resolve();
                        })
                        .on('error', (error) => {
                            reject(error);
                        });
                });
                return data
            } else {
                return { errorCode: 400, message: 'Unsupported file format. Please upload an Excel or CSV file' };
            }
        } else {
            return { errorCode: 400, message: 'No file uploaded' };
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return { errorCode: 500, error: error?.message };
    }
};

/**
 * Validates actual headers against a list of expected headers.
 * Both arrays are trimmed and matched case-insensitively.
 * 
 * @param {string[]} actualHeaders - Headers extracted from the uploaded file
 * @param {string[]} expectedHeaders - List of required headers
 * @returns {{isValid: boolean, message?: string, missingHeaders?: string[]}}
 */
export const validateHeader = (actualHeaders, expectedHeaders) => {
    if (!Array.isArray(actualHeaders) || !Array.isArray(expectedHeaders)) {
        return { isValid: false, message: "Invalid header data format passed for validation" };
    }

    const actualNormalized = new Set(
        actualHeaders.map(h => String(h || "").trim().toLowerCase())
    );

    const missing = expectedHeaders.filter(
        h => !actualNormalized.has(String(h || "").trim().toLowerCase())
    );

    if (missing.length > 0) {
        return {
            isValid: false,
            message: `Missing required columns: ${missing.join(", ")}`,
            missingHeaders: missing
        };
    }

    return { isValid: true };
};

/**
 * Reads only the header row (row 1) from an uploaded Excel or CSV file.
 * Returns the column names exactly as they appear in the sheet (trimmed).
 * This is the only reliable way to know which columns exist in the file —
 * row.eachCell() in the data parser skips empty cells, so columns that are
 * present in the header but have no data in any row would be invisible to
 * an approach that unions keys from data rows.
 *
 * @param {object} req - Express request (req.files must be populated)
 * @returns {string[]} Array of header column names from row 1
 */
export const getExcelHeaders = async (req) => {
    try {
        if (!req.files || !Object.keys(req.files).length) return [];

        const filesArray = Array.isArray(req.files) ? req.files : [req.files];
        const file = filesArray[0];

        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = new ExcelJS.Workbook();
            if (file.path) {
                await workbook.xlsx.readFile(file.path);
            } else if (file.buffer) {
                const buf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
                await workbook.xlsx.load(buf);
            } else {
                return [];
            }

            const headers = [];
            const worksheet = workbook.worksheets[0];
            if (!worksheet) return [];

            const headerRow = worksheet.getRow(1);
            headerRow.eachCell({ includeEmpty: false }, (cell) => {
                const val = cell?.value;
                if (val) headers.push(val.toString().trim());
            });

            return headers;

        } else if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            // For CSV, the first data event from csv-parser carries the headers as keys
            let source;
            if (file.path) {
                source = fs.createReadStream(file.path);
            } else if (file.buffer) {
                const { Readable } = await import('stream');
                const buf = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
                source = Readable.from(buf);
            } else {
                return [];
            }
            let resolved = false;
            return await new Promise((resolve, reject) => {
                source
                    .pipe(csvParser())
                    .on('headers', (hdrs) => {
                        resolved = true;
                        resolve(hdrs.map(h => h.trim()));
                    })
                    .on('data', () => {
                        // fallback: if 'headers' event not fired, resolve on first row
                        if (!resolved) {
                            resolved = true;
                            resolve([]);
                        }
                    })
                    .on('error', reject);
            });
        }

        return [];
    } catch (err) {
        console.error('getExcelHeaders error:', err);
        return [];
    }
};

