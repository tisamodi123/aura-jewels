import React from 'react';

const AllFilterSkeleton: React.FC<{ hideHeader?: boolean, className?: string }> = ({ hideHeader = false, className }) => {
    return (
        <div className={`flex flex-col h-full bg-white divide-y divide-gray-100 ${className} animate-pulse`}>
            {!hideHeader && (
                <div className="flex items-center justify-between py-4 mb-2">
                    <div className="h-5 w-20 bg-stone-100 rounded" />
                    <div className="h-4 w-16 bg-stone-100 rounded" />
                </div>
            )}
            <div className="space-y-6 pt-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3 pb-4 border-b border-gray-50 last:border-0">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-28 bg-stone-100 rounded" />
                            <div className="h-4 w-4 bg-stone-100 rounded" />
                        </div>
                        <div className="space-y-2.5 pt-1">
                            {[...Array(i === 0 ? 4 : 3)].map((_, j) => (
                                <div key={j} className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-stone-100 rounded-sm" />
                                    <div className={`h-3 bg-stone-100 rounded ${j % 2 === 0 ? 'w-24' : 'w-32'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllFilterSkeleton;