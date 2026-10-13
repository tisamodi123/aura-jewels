import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { uploadsPath } from "./uploadPaths.js";
import { uploadBufferToS3 } from "./multer.js";

// `sheetName` names the worksheet tab (e.g. "Success" / "Rejected").
export const create_excel_files = async function (data, sheetName = 'Sheet1', customHeaders = null) {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);

        const headers = customHeaders || Object.keys(data[0]);
        sheet.addRow(headers);

        const firstRow = sheet.getRow(1);
        firstRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'ADD8E6' }
            };

            cell.font = { bold: true };
            cell.alignment = { horizontal: 'left' };
        });

        data.forEach((item) => {
            const values = headers.map((header) => item ? item[header] : undefined);

            sheet.addRow(values).eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = { horizontal: 'left' };
            });
        });

        sheet.columns.forEach((column) => {
            let maxLength = 0;

            column.eachCell({ includeEmpty: true }, (cell) => {
                const length = cell.value ? cell.value.toString().length : 0;
                if (length > maxLength) maxLength = length;
            });

            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        const currentDate = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[-:]/g, '');

        // The timestamp is only second-precision, so two files generated in the
        // same request (e.g. a Success sheet and a Rejected sheet) would collide
        // and one would silently overwrite the other. Add a short unique suffix.
        const suffix = Math.random().toString(36).slice(2, 8);

        const excelFileName = `${currentDate}_${suffix}.xlsx`;

        const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== "true";

        if (useAWS) {
            const buffer = await workbook.xlsx.writeBuffer();
            const { url } = await uploadBufferToS3({
                buffer,
                fileName: excelFileName,
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                folder: "website-assets/generatedExcelFiles"
            });
            return url;
        } else {
            const dir = uploadsPath("generatedExcelFile");

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const filePath = path.join(dir, excelFileName);
            await workbook.xlsx.writeFile(filePath);

            return `/uploads/generatedExcelFile/${excelFileName}`;
        }

    } catch (error) {
        console.log(error);
    }
};
