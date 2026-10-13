'use client';

import { useEffect } from 'react';
import { detectLocation } from '@/lib/location';

const LocationInitializer = () => {
    useEffect(() => {
        detectLocation();
    }, []);

    return null; // This component doesn't render anything
};

export default LocationInitializer;
