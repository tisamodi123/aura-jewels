import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';

interface HeaderLogoProps {
  logoSize?: string;
  textStyle?: string;
  tracking?: string;
  disableHover?: boolean;
  onClick?: () => void;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  logoSize,
  onClick,
}) => {
  return (
    <Link href="/" onClick={onClick} className="block">
      <div className={`relative ${logoSize || 'w-[110px] h-[32px] md:w-[120px] md:h-[35px] lg:w-[140px] lg:h-[40px]'}`}>
        <Image
          src={`${PREFIX}/images/Aura Jewels/Logo_Png-removebg-preview.png`}
          alt="Aura Jewels New York"
          fill
          priority
          className="object-contain mix-blend-multiply contrast-[1.1] brightness-[1.03]"
        />
      </div>
    </Link>
  );
};

export default HeaderLogo;
