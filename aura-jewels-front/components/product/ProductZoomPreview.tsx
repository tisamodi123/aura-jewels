import React from 'react';

interface ProductZoomPreviewProps {
    isVisible: boolean;
    zoomStyle: any;
    isRightSide?: boolean;
}

const ProductZoomPreview: React.FC<ProductZoomPreviewProps> = ({ 
    isVisible, 
    zoomStyle, 
    isRightSide = true 
}) => {
    if (!isVisible) return null;

    return (
        <div 
            className={`absolute top-0 w-[350px] h-[350px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] border border-gray-100 hidden xl:block overflow-hidden pointer-events-none rounded-sm ${
                !isRightSide ? 'right-[105%]' : 'left-[105%]'
            }`}
        >
            <div 
                className="w-full h-full"
                style={{
                    backgroundImage: zoomStyle.backgroundImage,
                    backgroundPosition: zoomStyle.backgroundPosition,
                    backgroundSize: '400% auto',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[8px] font-bold tracking-[0.2em] text-[#014242] border border-gray-100 uppercase">
                HD Detail
            </div>
        </div>
    );
};

export default ProductZoomPreview;
