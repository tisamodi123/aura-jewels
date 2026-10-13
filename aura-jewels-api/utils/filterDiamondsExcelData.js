export const filter_diamonds = async function (data, paraTypeDetails) {
    try {
        let selectedDiamonds = [];
        let rejectedDiamonds = [];

        for (let dia of data) {

            // Normalize all keys once (IMPORTANT for Excel headers)
            let row = {};
            for (let key in dia) {
                row[key.toLowerCase().trim()] = dia[key];
            }

            let flag = false;
            let itsRound = false;

            // ---------- SHAPE ----------
            if (!paraTypeDetails.shape?.length) {
                row['Issues'] = 'Shape config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let shapeValue = row['shape']?.toString().toLowerCase().trim();

            for (let shape of paraTypeDetails.shape) {
                if (
                    shape.acceptableValues?.includes(shapeValue) ||
                    shapeValue === shape.paraMeterName
                ) {
                    if (shape.paraMeterName?.toLowerCase() === 'round') {
                        itsRound = true;
                    }

                    row['shape'] = shape.paraMeterId;
                    row['shapeSort'] = shape.sort;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Shape is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- COLOR ----------
            if (!paraTypeDetails.color?.length) {
                row['Issues'] = 'Color config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let colorValue = row['color']?.toString().toLowerCase().trim();

            for (let color of paraTypeDetails.color) {
                if (
                    color.acceptableValues?.includes(colorValue) ||
                    colorValue === color.paraMeterName
                ) {
                    row['color'] = color.paraMeterId;
                    row['colorSort'] = color.sort;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Color is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- CLARITY ----------
            if (!paraTypeDetails.clarity?.length) {
                row['Issues'] = 'Clarity config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let clarityValue = row['clarity']?.toString().toLowerCase().trim();

            for (let clarity of paraTypeDetails.clarity) {
                if (
                    clarity.acceptableValues?.includes(clarityValue) ||
                    clarityValue === clarity.paraMeterName
                ) {
                    row['clarity'] = clarity.paraMeterId;
                    row['claritySort'] = clarity.sort;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Clarity is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- CUT (ONLY ROUND) ----------
            if (itsRound) {
                if (!paraTypeDetails.cut?.length) {
                    row['Issues'] = 'Cut config missing';
                    rejectedDiamonds.push(row);
                    continue;
                }

                flag = false;
                let cutValue = row['cut']?.toString().toLowerCase().trim();

                for (let cut of paraTypeDetails.cut) {
                    if (
                        cut.acceptableValues?.includes(cutValue) ||
                        cutValue === cut.paraMeterName
                    ) {
                        row['cut'] = cut.paraMeterId;
                        row['cutSort'] = cut.sort;
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    row['Issues'] = 'Cut is not found';
                    rejectedDiamonds.push(row);
                    continue;
                }
            }

            // ---------- POLISH ----------
            if (!paraTypeDetails.polish?.length) {
                row['Issues'] = 'Polish config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let polishValue = row['polish']?.toString().toLowerCase().trim();

            for (let polish of paraTypeDetails.polish) {
                if (
                    polish.acceptableValues?.includes(polishValue) ||
                    polishValue === polish.paraMeterName
                ) {
                    row['polish'] = polish.paraMeterId;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Polish is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- FLUORESCENCE ----------
            if (!paraTypeDetails.fluorescence?.length) {
                row['Issues'] = 'Fluorescence config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let floValue = row['fluorescence']?.toString().toLowerCase().trim();

            for (let flo of paraTypeDetails.fluorescence) {
                if (
                    flo.acceptableValues?.includes(floValue) ||
                    floValue === flo.paraMeterName
                ) {
                    row['fluorescence'] = flo.paraMeterId;
                    row['fluorescenceSort'] = flo.sort;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Fluorescence is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- SYMMETRY ----------
            if (!paraTypeDetails.symmetry?.length) {
                row['Issues'] = 'Symmetry config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let symValue = row['symmetry']?.toString().toLowerCase().trim();

            for (let sym of paraTypeDetails.symmetry) {
                if (
                    sym.acceptableValues?.includes(symValue) ||
                    symValue === sym.paraMeterName
                ) {
                    row['symmetry'] = sym.paraMeterId;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Symmetry is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- LAB ----------
            if (!paraTypeDetails.lab?.length) {
                row['Issues'] = 'Lab config missing';
                rejectedDiamonds.push(row);
                continue;
            }

            flag = false;
            let labValue = row['lab']?.toString().toLowerCase().trim();

            for (let lab of paraTypeDetails.lab) {
                if (
                    lab.acceptableValues?.includes(labValue) ||
                    labValue === lab.paraMeterName
                ) {
                    row['lab'] = lab.paraMeterId;
                    row['labSort'] = lab.sort;
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                row['Issues'] = 'Lab is not found';
                rejectedDiamonds.push(row);
                continue;
            }

            // ---------- MEASUREMENTS ----------
            if (row['measurements']) {
                let measurement = row['measurements']
                    ?.split(/[-*x]/)
                    ?.map(num => Number(num));

                if (measurement?.length === 3) {
                    row['LengthMM'] = measurement[0];
                    row['WidthMM'] = measurement[1];
                    row['DepthMM'] = measurement[2];
                }
            }

            selectedDiamonds.push(row);
        }

        return { selectedDiamonds, rejectedDiamonds };

    } catch (error) {
        console.log(error);
    }
};