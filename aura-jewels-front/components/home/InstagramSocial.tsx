'use client';

import React from 'react';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';

const InstagramSocial: React.FC<{ instagramSocialData: any }> = ({ instagramSocialData }: any) => {
    if (!instagramSocialData || !instagramSocialData.info || instagramSocialData.info.status !== 'ACTIVE') {
        return null;
    }
    const info = instagramSocialData.info;
    const items = instagramSocialData.items || [];

    // The first item contains the banner image
    const firstItem = items[0];
    if (!firstItem) return null;

    const bannerImage = getImageUrl(firstItem.image);
    const link = firstItem.link || info.buttonlink1 || '';

    const ImageElement = (
        <div className="w-full overflow-hidden">
            <img
                src={bannerImage}
                alt="Instagram Social Banner"
                className="w-full h-auto object-cover"
            />
        </div>
    );

    if (link) {
        return (
            <Link href={link} className="block w-full cursor-pointer">
                {ImageElement}
            </Link>
        );
    }

    return ImageElement;
};

export default InstagramSocial;

