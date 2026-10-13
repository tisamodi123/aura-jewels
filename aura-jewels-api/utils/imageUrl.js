import Constant from "../constants/user.constant.js";

const appendMediaUrls = () => ({
    $addFields: {

        // -------- IMAGES ----------
        images: {
            $cond: [
                { $isArray: "$images" },
                {
                    $map: {
                        input: "$images",
                        as: "img",
                        in: {
                            $mergeObjects: [
                                "$$img",
                                {
                                    MediaLocation: {
                                        $cond: [
                                            { $eq: [{ $type: "$$img.MediaLocation" }, "string"] },
                                            {
                                                $cond: [
                                                    {
                                                        $regexMatch: {
                                                            input: "$$img.MediaLocation",
                                                            regex: "^http"
                                                        }
                                                    },
                                                    "$$img.MediaLocation",
                                                    {
                                                        $concat: [
                                                            { $ifNull: [Constant.PRODUCT_AWS_ZOOM_IMAGE_URL, ""] },
                                                            "$$img.MediaLocation"
                                                        ]
                                                    }
                                                ]
                                            },
                                            "$$img.MediaLocation"
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

        // -------- VIDEOS (FIXED) ----------
        videos: {
            $cond: [
                { $isArray: "$videos" },
                {
                    $map: {
                        input: "$videos",
                        as: "vid",
                        in: {
                            $mergeObjects: [
                                "$$vid",
                                {
                                    MediaLocation: {
                                        $cond: [
                                            { $eq: [{ $type: "$$vid.MediaLocation" }, "string"] },
                                            {
                                                $cond: [
                                                    {
                                                        $regexMatch: {
                                                            input: "$$vid.MediaLocation",
                                                            regex: "^http"
                                                        }
                                                    },
                                                    "$$vid.MediaLocation",
                                                    {
                                                        $concat: [
                                                            { $ifNull: [Constant.PRODUCT_AWS_VIDEO_URL, ""] },
                                                            "$$vid.MediaLocation"
                                                        ]
                                                    }
                                                ]
                                            },
                                            "$$vid.MediaLocation"
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
});

export { appendMediaUrls };