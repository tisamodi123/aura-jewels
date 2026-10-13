//** React imports */
import React from 'react';

//** Next imports */
import Image from 'next/image';

//** Custom imports */
import { MoveLeft } from 'lucide-react';


import { LinkWithLoader } from '@/components/partials/LinkWithLoader';
import { PREFIX } from '@/lib/APIUrl';

export default function NotFoundPage() {
    return (
        <div className='container mx-auto px-5 py-5'>
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Image
                        src={`${PREFIX}/images/404page.svg`}
                        width={250}
                        height={250}
                        alt='Not-found-data'
                        className='mx-auto'
                    />
                    <p className="text-5xl font-bold text-gray-500 mt-2">Page Not Found</p>
                    <p className="text-xl text-gray-600 mt-2">Sorry, the page you are looking for could not be found.</p>

                    <div className='mt-6'>
                        <LinkWithLoader href='/dashboard' className="bg-black py-2 px-3 rounded text-white inline-flex items-center gap-2">
                            <MoveLeft />
                            <p>Return Home</p>
                        </LinkWithLoader>
                    </div>
                </div>
            </div>
        </div>
    );
}
