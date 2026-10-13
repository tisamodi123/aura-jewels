import mongoose from 'mongoose';
import Constant from '../constants/user.constant.js';
import fs from 'fs';
import {
    createSection,
    getSectionDetail,
    getSectionList,
    updateSection,
    deleteSection,
} from '../services/categoryLanding.services.js';
import BaseURL from '../constants/baseUrl.js';
import formatDate from '../utils/formatDate.js';
import Product from '../models/product.model.js';

// CTA redirects arrive as JSON strings in the multipart form. Parse to an
// object; fall back to a "none" redirect on empty/invalid input.
const parseRedirect = (raw) => {
    if (!raw) return undefined;
    if (typeof raw === 'object') return raw;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : undefined;
    } catch {
        return undefined;
    }
};

export const createCategoryLandingSection = async function (req, res) {
    try {
        let imageName = '';
        let mobileImgName = '';
        let videoName = '';

        if (req.files && req.files.length > 0) {
            const imageFile = req.files.find((file) => file.fieldname === 'image');
            if (imageFile) {
                if (!Constant.ALLOWEDIMAGES.includes(imageFile.mimetype)) {
                    fs.unlinkSync(imageFile.path); // Delete the file if it's not allowed
                    return res.status(200).json({ errorCode: 400, message: 'Invalid file' });
                }
                imageName = imageFile.filename;
            }
            const mobile_img = req.files.find((file) => file.fieldname === 'mobile_img');
            if (mobile_img) {
                if (!Constant.ALLOWEDIMAGES.includes(mobile_img.mimetype)) {
                    fs.unlinkSync(mobile_img.path); // Delete the file if it's not allowed
                    return res.status(200).json({ errorCode: 400, message: 'Invalid file' });
                }
                mobileImgName = mobile_img.filename;
            }
            const video = req.files.find((file) => file.fieldname === 'video');
            if (video) {
                if (!Constant.ALLOWEDVIDEOS.includes(video.mimetype)) {
                    fs.unlinkSync(video.path); // Delete the file if it's not allowed
                    return res.status(200).json({ errorCode: 400, message: 'Invalid file' });
                }
                videoName = video.filename;
            }
        }

        await createSection({
            position: req.body.sectionName ? req.body.sectionName : undefined,
            CategoryId: req.body.CategoryId && req.body.CategoryId !== "common" && req.body.CategoryId !== "null" ? req.body.CategoryId : null,
            title: req.body.title ? req.body.title : undefined,
            subTitle: req.body?.subTitle ? req.body.subTitle : undefined,
            description: req.body?.description ? req.body.description : undefined,
            buttontext1: req.body?.buttontext1 ? req.body.buttontext1 : undefined,
            buttontext2: req.body?.buttontext2 ? req.body.buttontext2 : undefined,
            buttonlink1: req.body?.buttonlink1 ? req.body.buttonlink1 : undefined,
            buttonlink2: req.body?.buttonlink2 ? req.body.buttonlink2 : undefined,
            redirect1: parseRedirect(req.body?.redirect1),
            redirect2: parseRedirect(req.body?.redirect2),
            textposition: req.body?.textposition ? req.body.textposition : undefined,
            status: req.body?.status ? req.body.status : undefined,
            image: imageName || undefined,
            mobile_img: mobileImgName || undefined,
            video: videoName || undefined,
            itemcode: req.body?.itemcode ? req.body.itemcode.split(',') : undefined,
            createdBy: req.userId,
        });

        return res.status(201).json({ errorCode: 200, message: 'Created SuccessFully..!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorCode: 500, message: error?.message });
    }
};

export const getCategoryLandingSection = async function (req, res) {
    try {
        if (req.body.sectionName == 'undefined' || !req.body.sectionName) {
            return res.status(200).json({ errorCode: 400, message: 'please provide section id' });
        }
        if (req.body.CategoryId === undefined || req.body.CategoryId === null) {
            return res.status(200).json({ errorCode: 400, message: 'please provide CategoryId' });
        }

        let arr = [];
        const Baseurl = BaseURL(req);

        const query = { position: req.body.sectionName };
        if (req.body.CategoryId && req.body.CategoryId !== "common" && req.body.CategoryId !== "null") {
            query.CategoryId = new mongoose.Types.ObjectId(req.body.CategoryId);
        } else {
            query.CategoryId = null;
        }

        const sectionList = await getSectionList(query);
        if (sectionList.length == 0) {
            return res.status(200).json({ errorCode: 200, message: 'Success', data: [] });
        }
        let sr = 1;
        const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== 'true';

        const getImageUrl = (img) => {
            if (!img) return undefined;
            if (img.startsWith('http')) return img;
            const filename = img.includes('/') ? img.split('/').pop() : img;
            if (useAWS) {
                return `${process.env.AWS_UPLOAD_PATH}website-assets/cms/${filename}`;
            } else {
                const base = Baseurl.endsWith('/') ? Baseurl : `${Baseurl}/`;
                return `${base}uploads/cmsImages/${filename}`;
            }
        };

        const getVideoUrl = (vid) => {
            if (!vid) return undefined;
            if (vid.startsWith('http')) return vid;
            const filename = vid.includes('/') ? vid.split('/').pop() : vid;
            if (useAWS) {
                return `${process.env.AWS_UPLOAD_PATH}website-assets/cms/${filename}`;
            } else {
                const base = Baseurl.endsWith('/') ? Baseurl : `${Baseurl}/`;
                return `${base}uploads/videos/${filename}`;
            }
        };

        for (let field of sectionList) {
            arr.push({
                id: field._id,
                srNo: sr++,
                position: field.position,
                CategoryId: field.CategoryId,
                title: field.title,
                subTitle: field.subTitle,
                description: field.description ? field.description : undefined,
                buttontext1: field.buttontext1,
                buttontext2: field.buttontext2,
                buttonlink1: field.buttonlink1,
                buttonlink2: field.buttonlink2,
                redirect1: field.redirect1 || { type: "none" },
                redirect2: field.redirect2 || { type: "none" },
                textposition: field.textposition,
                image: getImageUrl(field.image),
                mobile_img: getImageUrl(field.mobile_img),
                video: getVideoUrl(field.video),
                itemcode: field.itemcode ? field.itemcode : undefined,
                status: field.status,
                createOn: formatDate(field.createdAt),
                changedOn: formatDate(field.updatedAt),
            });
        }
        return res.status(200).json({
            errorCode: 200,
            message: 'Get Page section list SuccessFully..!',
            total: arr.length,
            data: arr,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorCode: 500, message: error?.message });
    }
};

export const updateCategoryLandingSection = async function (req, res) {
    try {
        if (req.params.id == 'undefined' || !req.params.id) {
            return res.status(200).json({ errorCode: 400, message: 'please provide Secttion id' });
        }
        let imageName = '';
        let mobileImgName = '';
        let videoName = '';

        if (req.files && req.files.length > 0) {
            const imageFile = req.files.find((file) => file.fieldname === 'image');
            if (imageFile) {
                if (!Constant.ALLOWEDIMAGES.includes(imageFile.mimetype)) {
                    fs.unlinkSync(imageFile.path); // Delete the file if it's not allowed
                    return res.status(200).json({ errorCode: 400, message: 'Invalid file' });
                }
                imageName = imageFile.filename;
            }
            const mobile_img = req.files.find((file) => file.fieldname === 'mobile_img');
            if (mobile_img) {
                if (!Constant.ALLOWEDIMAGES.includes(mobile_img.mimetype)) {
                    fs.unlinkSync(mobile_img.path); // Delete the file if it's not allowed
                    return res.status(200).json({ errorCode: 400, message: 'Invalid file' });
                }
                mobileImgName = mobile_img.filename;
            }
            const video = req.files.find((file) => file.fieldname === 'video');
            if (video) {
                if (!Constant.ALLOWEDVIDEOS.includes(video.mimetype)) {
                    fs.unlinkSync(video.path); // Delete the file if it's not allowed
                    return res.status(200).json({ errorCode: 400, message: 'Invalid file' });
                }
                videoName = video.filename;
            }
        }
        let baseUrl = BaseURL(req);
        let getpageSection = await getSectionDetail(req.params.id);
        if (!getpageSection) {
            return res.status(200).json({ errorCode: 400, message: 'Page section not found' });
        }
        if (imageName != '') {
            if (fs.existsSync(baseUrl + getpageSection.image)) {
                fs.unlinkSync(baseUrl + getpageSection.image);
            }
        }
        if (mobileImgName != '') {
            if (fs.existsSync(baseUrl + getpageSection.mobile_img)) {
                fs.unlinkSync(baseUrl + getpageSection.mobile_img);
            }
        }
        if (videoName != '') {
            if (fs.existsSync(baseUrl + getpageSection.video)) {
                fs.unlinkSync(baseUrl + getpageSection.video);
            }
        }
        // Helper to strip S3 or local folder paths and absolute URLs down to just the raw filename.
        // Ensures that untouched legacy paths already in the database are automatically sanitized
        // and migrated to the standard filename-only format when the section is updated.
        const cleanPath = (p) => {
            if (!p || typeof p !== 'string') return p;
            return p.split('/').pop();
        };

        await updateSection(req.params.id, {
            position: req.body.sectionName ? req.body.sectionName : undefined,
            CategoryId: req.body.CategoryId !== undefined ? (req.body.CategoryId && req.body.CategoryId !== "common" && req.body.CategoryId !== "null" ? req.body.CategoryId : null) : undefined,
            title: req.body.title ? req.body.title : undefined,
            subTitle: req.body?.subTitle ? req.body.subTitle : undefined,
            description: req.body?.description ? req.body.description : undefined,
            buttontext1: req.body?.buttontext1 ? req.body.buttontext1 : undefined,
            buttontext2: req.body?.buttontext2 ? req.body.buttontext2 : undefined,
            buttonlink1: req.body?.buttonlink1 ? req.body.buttonlink1 : undefined,
            buttonlink2: req.body?.buttonlink2 ? req.body.buttonlink2 : undefined,
            redirect1: parseRedirect(req.body?.redirect1),
            redirect2: parseRedirect(req.body?.redirect2),
            status: req.body?.status ? req.body.status : undefined,
            itemcode: req.body?.itemcode ? req.body.itemcode.split(',') : undefined,
            textposition: req.body?.textposition ? req.body.textposition : undefined,
            image: imageName !== '' ? imageName : cleanPath(getpageSection.image),
            mobile_img: mobileImgName !== '' ? mobileImgName : cleanPath(getpageSection.mobile_img),
            video: videoName !== '' ? videoName : cleanPath(getpageSection.video),
            updatedBy: req.userId,
        });
        return res.status(201).json({ errorCode: 200, message: 'Updated SuccessFully..!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorCode: 500, message: error?.message });
    }
};

export const updateStatusSection = async function (req, res) {
    try {
        if (req.params.id == 'undefined' || !req.params.id) {
            return res.status(200).json({ errorCode: 400, message: 'please provide section id' });
        }
        let getpageSection = await getSectionDetail(req.params.id);
        if (!getpageSection) {
            return res.status(200).json({ errorCode: 400, message: 'Section not found' });
        }
        let status =
            getpageSection.status == Constant.STATUS.ACTIVE
                ? Constant.STATUS.SUSPENDED
                : Constant.STATUS.ACTIVE;
        await updateSection(req.params.id, {
            status: status,
            updatedBy: req.userId,
        });
        return res.status(201).json({ errorCode: 200, message: 'Status Updated SuccessFully..!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorCode: 500, message: error?.message });
    }
};

export const CategoryLandingdeleteSection = async function (req, res) {
    try {
        if (req.params.id == 'undefined' || !req.params.id) {
            return res.status(200).json({ errorCode: 400, message: 'please provide section id' });
        }
        let getpageSection = await getSectionDetail(req.params.id);
        if (!getpageSection) {
            return res.status(200).json({ errorCode: 400, message: 'Section not found' });
        }
        let baseUrl = BaseURL(req);
        if (getpageSection.image != '') {
            if (fs.existsSync(baseUrl + getpageSection.image)) {
                fs.unlinkSync(baseUrl + getpageSection.image);
            }
        }
        if (getpageSection.mobile_img != '') {
            if (fs.existsSync(baseUrl + getpageSection.mobile_img)) {
                fs.unlinkSync(baseUrl + getpageSection.mobile_img);
            }
        }
        if (getpageSection.video != '') {
            if (fs.existsSync(baseUrl + getpageSection.video)) {
                fs.unlinkSync(baseUrl + getpageSection.video);
            }
        }
        await deleteSection(req.params.id);
        return res.status(200).json({ errorCode: 200, message: 'Data delete successfully..!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorCode: 500, message: error?.message });
    }
};

export const getcategoryMostEngagementRing = async function (req, res) {
    try {
        if (req.params.categoryId == 'undefined' || !req.params.categoryId) {
            return res.status(200).json({ errorCode: 400, message: 'please provide categoryId' });
        }
        let sectionList = await getSectionList({
            position: 'popular-designs',
            CategoryId: new mongoose.Types.ObjectId(req.params.categoryId),
            status: { $ne: Constant.STATUS.SUSPENDED },
        });

        let itemCode = [];
        if (sectionList?.length > 0) {
            itemCode = sectionList[0]?.itemcode || [];
        }

        let matchCondition = {
            isDeleted: false,
            status: Constant.STATUS.ACTIVE,
            categoryId: new mongoose.Types.ObjectId(req.params.categoryId),
        };

        matchCondition.itemCode = { $in: itemCode };

        let productList = await Product.aggregate([
            {
                $match: matchCondition,
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            {
                $project: {
                    _id: 1,
                    finalPrice: 1,
                    b2c_offerPrice: 1,
                    parentItem: 1,
                    itemCode: 1,
                    category: { $arrayElemAt: ['$categoryDetails.categoryName', 0] },
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: 12,
            },
        ]);

        return res.status(200).json({
            errorCode: 200,
            message: 'Get product Successfully',
            data: productList,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errorCode: 500,
            message: error?.message,
        });
    }
};
