'use client';

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Select from 'react-select';

interface DiamondFilterBarProps {
  onFilterChange?: (filters: any) => void;
  resultsCount?: number;
  activeFilters?: any;
}

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}


const DoubleRangeSlider: React.FC<DoubleRangeSliderProps> = ({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), valueMax - step);
    onChange(val, valueMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), valueMin + step);
    onChange(valueMin, val);
  };

  const minPercent = Math.max(0, Math.min(100, ((valueMin - min) / (max - min)) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((valueMax - min) / (max - min)) * 100));

  return (
    <div className="relative w-full h-5 flex items-center select-none mt-2">
      <div className="absolute left-0 right-0 h-0.5 bg-stone-200 rounded-full" />
      <div
        className="absolute h-0.5 bg-[#B38D63] rounded-full"
        style={{
          left: `${minPercent}%`,
          right: `${100 - maxPercent}%`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={handleMinChange}
        className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none focus:outline-none z-20
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:w-3 
          [&::-webkit-slider-thumb]:h-3 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-[#B38D63] 
          [&::-webkit-slider-thumb]:cursor-pointer 
          [&::-webkit-slider-thumb]:pointer-events-auto
          [&::-moz-range-thumb]:appearance-none 
          [&::-moz-range-thumb]:w-3 
          [&::-moz-range-thumb]:h-3 
          [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:bg-[#B38D63] 
          [&::-moz-range-thumb]:cursor-pointer 
          [&::-moz-range-thumb]:pointer-events-auto"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={handleMaxChange}
        className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none focus:outline-none z-20
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:w-3 
          [&::-webkit-slider-thumb]:h-3 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-[#B38D63] 
          [&::-webkit-slider-thumb]:cursor-pointer 
          [&::-webkit-slider-thumb]:pointer-events-auto
          [&::-moz-range-thumb]:appearance-none 
          [&::-moz-range-thumb]:w-3 
          [&::-moz-range-thumb]:h-3 
          [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:bg-[#B38D63] 
          [&::-moz-range-thumb]:cursor-pointer 
          [&::-moz-range-thumb]:pointer-events-auto"
      />
    </div>
  );
};

interface StopSliderProps {
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const StopSlider: React.FC<StopSliderProps> = ({ options, selectedValue, onChange }) => {
  const selectedIndex = options.indexOf(selectedValue);
  const activeIdx = selectedIndex >= 0 ? selectedIndex : 0;
  const percent = options.length > 1 ? (activeIdx / (options.length - 1)) * 105 : 0;

  return (
    <div className="relative pt-3 pb-8 select-none">
      <div className="absolute left-1 right-1 h-0.5 bg-stone-200 top-[17px]" />
      <div
        className="absolute left-1 h-0.5 bg-[#B38D63] top-[17px] transition-all duration-300"
        style={{ width: `calc(${percent}% - 6px)` }}
      />
      <div className="flex justify-between relative z-10">
        {options.map((option) => {
          const isActive = option === selectedValue;
          return (
            <div
              key={option}
              onClick={() => onChange(option)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 ${
                  isActive
                    ? 'bg-[#B38D63] scale-125'
                    : 'bg-stone-300 group-hover:bg-[#B38D63]'
                }`}
              />
              <span
                className={`text-[10px] md:text-[11px] font-sans mt-2.5 transition-colors whitespace-nowrap ${
                  isActive ? 'text-stone-900 font-semibold' : 'text-stone-400 group-hover:text-stone-600'
                }`}
              >
                {option}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Shape SVG Components for pristine vector rendering
const RoundIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <circle cx="50" cy="50" r="45" />
    <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" />
    <circle cx="50" cy="50" r="22" />
  </svg>
);

const PrincessIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <rect x="10" y="10" width="80" height="80" />
    <path d="M 10 10 L 90 90 M 10 90 L 90 10 M 50 10 L 50 90 M 10 50 L 90 50" />
  </svg>
);

const PearIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <path d="M 50 10 C 25 50 25 70 50 90 C 75 70 75 50 50 10 Z" />
    <path d="M 50 10 L 50 90 M 32 55 L 68 55 M 36 72 L 64 72" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <path d="M 50 25 C 40 10 10 10 10 45 C 10 70 50 90 50 90 C 50 90 90 70 90 45 C 90 10 60 10 50 25 Z" />
    <path d="M 50 25 L 50 90 M 25 45 L 75 45" />
  </svg>
);

const AsscherIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <path d="M 25 10 L 75 10 L 90 25 L 90 75 L 75 90 L 25 90 L 10 75 L 10 25 Z" />
    <path d="M 32 20 L 68 20 L 80 32 L 80 68 L 68 80 L 32 80 L 20 68 L 20 32 Z" />
    <path d="M 10 25 L 90 75 M 10 75 L 90 25 M 50 10 L 50 90 M 10 50 L 90 50" />
  </svg>
);

const CushionIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <rect x="10" y="10" width="80" height="80" rx="20" />
    <path d="M 10 10 L 90 90 M 10 90 L 90 10 M 50 10 L 50 90 M 10 50 L 90 50" />
  </svg>
);

const MarquiseIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <path d="M 50 5 C 20 35 20 65 50 95 C 80 65 80 35 50 5 Z" />
    <path d="M 50 5 L 50 95 M 27 50 L 73 50" />
  </svg>
);

const OvalIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <ellipse cx="50" cy="50" rx="30" ry="45" />
    <path d="M 50 5 L 50 95 M 20 50 L 80 50 M 27 27 L 73 73 M 27 73 L 73 27" />
  </svg>
);

const EmeraldIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <path d="M 20 10 L 80 10 L 90 20 L 90 80 L 80 90 L 20 90 L 10 80 L 10 20 Z" />
    <path d="M 28 18 L 72 18 L 82 28 L 82 72 L 72 82 L 28 82 L 18 72 L 18 28 Z" />
    <path d="M 10 20 L 90 80 M 10 80 L 90 20" />
  </svg>
);

const RadiantIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 stroke-current fill-none stroke-[1.2]">
    <path d="M 22 10 L 78 10 L 90 22 L 90 78 L 78 90 L 22 90 L 10 78 L 10 22 Z" />
    <path d="M 10 22 L 90 78 M 10 78 L 90 22 M 50 10 L 50 90 M 10 50 L 90 50" />
  </svg>
);

const shapesList = [
  { name: 'Round', icon: <RoundIcon /> },
  { name: 'Princess', icon: <PrincessIcon /> },
  { name: 'Pear', icon: <PearIcon /> },
  { name: 'Heart', icon: <HeartIcon /> },
  { name: 'Asscher', icon: <AsscherIcon /> },
  { name: 'Cushion', icon: <CushionIcon /> },
  { name: 'Marquise', icon: <MarquiseIcon /> },
  { name: 'Oval', icon: <OvalIcon /> },
  { name: 'Emerald', icon: <EmeraldIcon /> },
  { name: 'Radiant', icon: <RadiantIcon /> },
];

export const DiamondFilterBar: React.FC<DiamondFilterBarProps> = ({
  onFilterChange,
  resultsCount = 350689,
  activeFilters,
}) => {
  const [selectedShape, setSelectedShape] = useState<string>(() => {
    return (activeFilters?.shape?.[0]) || 'Round';
  });
  const [priceMin, setPriceMin] = useState<string>(() => {
    return activeFilters?.minPrice !== undefined ? activeFilters.minPrice.toLocaleString('en-IN') : '10,000';
  });
  const [priceMax, setPriceMax] = useState<string>(() => {
    return activeFilters?.maxPrice !== undefined ? activeFilters.maxPrice.toLocaleString('en-IN') : '7,00,00,000';
  });
  const [caratMin, setCaratMin] = useState<string>(() => {
    return activeFilters?.minWeight !== undefined ? activeFilters.minWeight.toString() : '0.30';
  });
  const [caratMax, setCaratMax] = useState<string>(() => {
    return activeFilters?.maxWeight !== undefined ? activeFilters.maxWeight.toString() : '10.00';
  });

  const [selectedColour, setSelectedColour] = useState<string>(() => {
    if (activeFilters?.color?.[0]) return activeFilters.color[0];
    const isFancy = activeFilters?.diamondType?.toLowerCase().includes('color');
    return isFancy ? 'Pink' : 'D';
  });
  const [selectedClarity, setSelectedClarity] = useState<string>(() => {
    return (activeFilters?.clarity?.[0]) || 'IF';
  });
  const [selectedCut, setSelectedCut] = useState<string>(() => {
    return (activeFilters?.cut?.[0]) || 'Excellent';
  });
  const [selectedPolish, setSelectedPolish] = useState<string>(() => {
    return (activeFilters?.polish?.[0]) || 'EX';
  });
  const [selectedFluorescence, setSelectedFluorescence] = useState<string>(() => {
    return (activeFilters?.fluorescence?.[0]) || 'NONE';
  });
  const [selectedSymmetry, setSelectedSymmetry] = useState<string>(() => {
    return (activeFilters?.symmetry?.[0]) || 'EX';
  });

  React.useEffect(() => {
    if (activeFilters) {
      if (activeFilters.shape?.[0]) setSelectedShape(activeFilters.shape[0]);
      if (activeFilters.minPrice !== undefined) setPriceMin(activeFilters.minPrice.toLocaleString('en-IN'));
      if (activeFilters.maxPrice !== undefined) setPriceMax(activeFilters.maxPrice.toLocaleString('en-IN'));
      if (activeFilters.minWeight !== undefined) setCaratMin(activeFilters.minWeight.toString());
      if (activeFilters.maxWeight !== undefined) setCaratMax(activeFilters.maxWeight.toString());
      if (activeFilters.color?.[0]) {
        setSelectedColour(activeFilters.color[0]);
      } else {
        const isFancy = activeFilters.diamondType?.toLowerCase().includes('color');
        setSelectedColour(isFancy ? 'Pink' : 'D');
      }
      if (activeFilters.clarity?.[0]) setSelectedClarity(activeFilters.clarity[0]);
      if (activeFilters.cut?.[0]) setSelectedCut(activeFilters.cut[0]);
      if (activeFilters.polish?.[0]) setSelectedPolish(activeFilters.polish[0]);
      if (activeFilters.symmetry?.[0]) setSelectedSymmetry(activeFilters.symmetry[0]);
      if (activeFilters.fluorescence?.[0]) setSelectedFluorescence(activeFilters.fluorescence[0]);
    }
  }, [activeFilters]);

  const isFancyColor = activeFilters?.diamondType?.toLowerCase().includes('color');
  const colours = isFancyColor 
    ? ['Pink', 'Blue', 'Yellow', 'Green', 'Red']
    : ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const clarities = ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
  const cuts = ['Excellent', 'Very Good'];

  const handleShapeSelect = (shapeName: string) => {
    setSelectedShape(shapeName);
    onFilterChange?.({ shape: [shapeName] });
  };

  const handleColourSelect = (color: string) => {
    setSelectedColour(color);
    onFilterChange?.({ color: [color] });
  };

  const handleClaritySelect = (clarity: string) => {
    setSelectedClarity(clarity);
    onFilterChange?.({ clarity: [clarity] });
  };

  const handleCutSelect = (cut: string) => {
    setSelectedCut(cut);
    onFilterChange?.({ cut: [cut] });
  };

  const handlePriceChange = (min: string, max: string) => {
    setPriceMin(min);
    setPriceMax(max);
    const parsedMin = parseFloat(min.replace(/,/g, ''));
    const parsedMax = parseFloat(max.replace(/,/g, ''));
    if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
      onFilterChange?.({ minPrice: parsedMin, maxPrice: parsedMax });
    }
  };

  const handleCaratChange = (min: string, max: string) => {
    setCaratMin(min);
    setCaratMax(max);
    const parsedMin = parseFloat(min);
    const parsedMax = parseFloat(max);
    if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
      onFilterChange?.({ minWeight: parsedMin, maxWeight: parsedMax });
    }
  };

  const handlePolishSelect = (polish: string) => {
    setSelectedPolish(polish);
    onFilterChange?.({ polish: [polish] });
  };

  const handleFluorescenceSelect = (fluorescence: string) => {
    setSelectedFluorescence(fluorescence);
    onFilterChange?.({ fluorescence: [fluorescence] });
  };

  const handleSymmetrySelect = (symmetry: string) => {
    setSelectedSymmetry(symmetry);
    onFilterChange?.({ symmetry: [symmetry] });
  };

  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [depthMin, setDepthMin] = useState<string>('30%');
  const [depthMax, setDepthMax] = useState<string>('100%');
  const [tableMin, setTableMin] = useState<string>('36%');
  const [tableMax, setTableMax] = useState<string>('84%');
  const [lwMin, setLwMin] = useState<string>('0.8');
  const [lwMax, setLwMax] = useState<string>('2.5');

  return (
    <div className="w-full bg-white font-sans border-b border-gray-100 py-6 px-0 mx-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <h2 className="font-serif text-[32px] font-medium text-[#1E1E1E] mb-6 tracking-wide"> </h2>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          {/* Left Side: Shapes */}
          <div className="xl:col-span-7 min-w-0">
            <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
              Shape
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {shapesList.map((shape) => {
                const isSelected = selectedShape === shape.name;
                return (
                  <button
                    key={shape.name}
                    type="button"
                    onClick={() => handleShapeSelect(shape.name)}
                    className={`flex flex-col items-center justify-center border p-1.5 rounded-none transition-all ${isSelected
                      ? 'border-[#B38D63] bg-[#FAF8F5] text-stone-900 font-medium'
                      : 'border-gray-200 text-stone-600 hover:text-stone-900 hover:border-stone-400'
                      }`}
                  >
                    <div className="mb-2 scale-95">{shape.icon}</div>
                    <span className="text-[10px] font-sans text-stone-600 font-medium tracking-wide">{shape.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Price & Carat Sliders */}
          <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
            {/* Price Range */}
            <div className="min-w-0">
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Price
              </span>
              <DoubleRangeSlider
                min={10000}
                max={70000000}
                step={10000}
                valueMin={Number(priceMin.replace(/,/g, ''))}
                valueMax={Number(priceMax.replace(/,/g, ''))}
                onChange={(min, max) => handlePriceChange(min.toLocaleString('en-IN'), max.toLocaleString('en-IN'))}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col items-start">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Min</span>
                  <div className="relative w-[110px]">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">₹</span>
                    <input
                      type="text"
                      value={priceMin}
                      onChange={(e) => handlePriceChange(e.target.value, priceMax)}
                      className="w-full pl-5 pr-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Max</span>
                  <div className="relative w-[110px]">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">₹</span>
                    <input
                      type="text"
                      value={priceMax}
                      onChange={(e) => handlePriceChange(priceMin, e.target.value)}
                      className="w-full pl-5 pr-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Carat Range */}
            <div className="min-w-0">
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Carat
              </span>
              <DoubleRangeSlider
                min={0.1}
                max={15.0}
                step={0.01}
                valueMin={Number(caratMin)}
                valueMax={Number(caratMax)}
                onChange={(min, max) => handleCaratChange(min.toFixed(2), max.toFixed(2))}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col items-start">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Min</span>
                  <input
                    type="text"
                    value={caratMin}
                    onChange={(e) => handleCaratChange(e.target.value, caratMax)}
                    className="w-[100px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Max</span>
                  <input
                    type="text"
                    value={caratMax}
                    onChange={(e) => handleCaratChange(caratMin, e.target.value)}
                    className="w-[100px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Colour, Clarity, Cut */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b border-gray-100 mb-4">
          {/* Colour Selection */}
          <div>
            <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
              Colour
            </span>
            <StopSlider
              options={colours}
              selectedValue={selectedColour}
              onChange={handleColourSelect}
            />
          </div>

          {/* Clarity Selection */}
          <div>
            <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
              Clarity
            </span>
            <StopSlider
              options={clarities}
              selectedValue={selectedClarity}
              onChange={handleClaritySelect}
            />
          </div>

          {/* Cut Selection */}
          <div>
            <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
              Cut
            </span>
            <StopSlider
              options={cuts}
              selectedValue={selectedCut}
              onChange={handleCutSelect}
            />
          </div>
        </div>

        {/* Advanced Filter Collapse */}
        <div
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center justify-between text-[13px] font-semibold text-[#1E1E1E] cursor-pointer py-4 border-b border-gray-100 mt-2 select-none"
        >
          <span>Advanced Filter</span>
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 fill-none stroke-current stroke-2 transition-transform duration-300 ${
              isAdvancedOpen ? 'rotate-180' : ''
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Advanced Filter Expandable Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isAdvancedOpen ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pb-6 border-b border-gray-100 mb-6">
            {/* Depth % */}
            <div>
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Depth %
              </span>
              <DoubleRangeSlider
                min={20}
                max={100}
                step={1}
                valueMin={Number(depthMin.replace('%', ''))}
                valueMax={Number(depthMax.replace('%', ''))}
                onChange={(min, max) => {
                  setDepthMin(min + '%');
                  setDepthMax(max + '%');
                  onFilterChange?.({ minDepth: min, maxDepth: max });
                }}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col items-start">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Min</span>
                  <input
                    type="text"
                    value={depthMin}
                    onChange={(e) => setDepthMin(e.target.value)}
                    className="w-[80px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Max</span>
                  <input
                    type="text"
                    value={depthMax}
                    onChange={(e) => setDepthMax(e.target.value)}
                    className="w-[80px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>

            {/* Table % */}
            <div>
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Table %
              </span>
              <DoubleRangeSlider
                min={20}
                max={100}
                step={1}
                valueMin={Number(tableMin.replace('%', ''))}
                valueMax={Number(tableMax.replace('%', ''))}
                onChange={(min, max) => {
                  setTableMin(min + '%');
                  setTableMax(max + '%');
                  onFilterChange?.({ minTable: min, maxTable: max });
                }}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col items-start">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Min</span>
                  <input
                    type="text"
                    value={tableMin}
                    onChange={(e) => setTableMin(e.target.value)}
                    className="w-[80px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Max</span>
                  <input
                    type="text"
                    value={tableMax}
                    onChange={(e) => setTableMax(e.target.value)}
                    className="w-[80px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>

            {/* LW Ratio */}
            <div>
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                LW Ratio
              </span>
              <DoubleRangeSlider
                min={0.5}
                max={3.0}
                step={0.01}
                valueMin={Number(lwMin)}
                valueMax={Number(lwMax)}
                onChange={(min, max) => {
                  setLwMin(min.toFixed(2));
                  setLwMax(max.toFixed(2));
                  onFilterChange?.({ minLwRatio: min, maxLwRatio: max });
                }}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col items-start">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Min</span>
                  <input
                    type="text"
                    value={lwMin}
                    onChange={(e) => setLwMin(e.target.value)}
                    className="w-[80px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 font-sans mb-1">Max</span>
                  <input
                    type="text"
                    value={lwMax}
                    onChange={(e) => setLwMax(e.target.value)}
                    className="w-[80px] px-2 py-1 border border-gray-200 rounded-none text-xs text-stone-700 bg-white text-center focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selector Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-4">
            {/* Polish Selector */}
            <div>
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Polish
              </span>
              <StopSlider
                options={['FR', 'GD', 'VG', 'EX']}
                selectedValue={selectedPolish}
                onChange={handlePolishSelect}
              />
            </div>

            {/* Fluorescence Selector */}
            <div>
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Fluorescence
              </span>
              <StopSlider
                options={['VSTG', 'STG', 'M', 'S', 'NONE']}
                selectedValue={selectedFluorescence}
                onChange={handleFluorescenceSelect}
              />
            </div>

            {/* Symmetry Selector */}
            <div>
              <span className="block text-[13px] font-semibold text-[#1E1E1E] font-sans mb-3">
                Symmetry
              </span>
              <StopSlider
                options={['FR', 'GD', 'VG', 'EX', 'ID']}
                selectedValue={selectedSymmetry}
                onChange={handleSymmetrySelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiamondFilterBar;
