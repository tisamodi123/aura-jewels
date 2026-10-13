'use client'

//** Next imports */
import Link from 'next/link';
import { useState } from 'react';

export function LinkWithLoader({ href, children, ...props }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={href}
            {...props}
            prefetch={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
        </Link>
    );
}