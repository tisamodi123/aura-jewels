'use client';

import React from 'react';
import BespokeBanner from './BespokeBanner';
import BespokeSteps from './BespokeSteps';
import BespokeBenefits from './BespokeBenefits';
import BespokeForm from './BespokeForm';

export default function CustomJewellery() {
    return (
        <div className="bg-white min-h-screen">
            {/* 1. Hero Banner */}
            <BespokeBanner />

            {/* 2. How It Works Steps */}
            <BespokeSteps />

            {/* 3. Form Section with Benefits & Form */}
            <div className="mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    {/* Left Column: Benefits & Info */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
                        <BespokeBenefits />
                    </div>

                    {/* Right Column: Request Form */}
                    <div className="lg:col-span-7">
                        <BespokeForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
