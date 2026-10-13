import { getImageUrl } from "@/lib/utils";
import Image from "next/image";

const PaymentMethodsPage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased py-16 px-6">
      <div className="max-w-[840px] mx-auto space-y-12 animate-in fade-in duration-1000">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-el-messiri tracking-wide text-[#1A1A1A]">
            Payment Methods
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light max-w-[640px] mx-auto">
            We offer a variety of secure payment methods to ensure a seamless and safe purchasing experience for your jewelry.
          </p>
        </div>

        {/* ─── Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Credit & Debit Cards */}
          <div className="bg-white border border-gray-200/90 rounded-sm p-6 md:p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="mb-4">
              <Image src={getImageUrl("/images/icons-svg/1.svg")} alt="Credit Card" width={50} height={50} className="w-8 h-8 object-contain" />
            </div>
            <h3 className="text-xs md:text-sm font-el-messiri tracking-[0.15em] text-[#1A1A1A] font-medium uppercase mb-3">
              Credit & Debit Cards
            </h3>
            <p className="text-xs md:text-sm text-gray-500 font-jakarta leading-relaxed font-light">
              We accept Visa, MasterCard, American Express, and RuPay cards via our secure gateway.
            </p>
          </div>

          {/* Card 2: UPI & Net Banking */}
          <div className="bg-white border border-gray-200/90 rounded-sm p-6 md:p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="mb-4">
              <Image src={getImageUrl("/images/icons-svg/1.svg")} alt="Credit Card" width={50} height={50} className="w-8 h-8 object-contain" />
            </div>
            <h3 className="text-xs md:text-sm font-el-messiri tracking-[0.15em] text-[#1A1A1A] font-medium uppercase mb-3">
              UPI & Net Banking
            </h3>
            <p className="text-xs md:text-sm text-gray-500 font-jakarta leading-relaxed font-light">
              Seamless transactions through all major Indian banks and UPI applications (GPay, PhonePe).
            </p>
          </div>

          {/* Card 3: Bank Transfer */}
          <div className="bg-white border border-gray-200/90 rounded-sm p-6 md:p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="mb-4">
              <Image src={getImageUrl("/images/icons-svg/1.svg")} alt="Credit Card" width={50} height={50} className="w-8 h-8 object-contain" />
            </div>
            <h3 className="text-xs md:text-sm font-el-messiri tracking-[0.15em] text-[#1A1A1A] font-medium uppercase mb-3">
              Bank Transfer
            </h3>
            <p className="text-xs md:text-sm text-gray-500 font-jakarta leading-relaxed font-light">
              For bespoke or high-value orders, we accept NEFT/RTGS direct bank transfers.
            </p>
          </div>

        </div>

        {/* ─── Payment Security ─── */}
        <div className="border-t border-gray-200/40 pt-10">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            Payment Security
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
            Your security is our paramount concern. All transactions are processed through highly secure, RBI-compliant payment gateways using 256-bit SSL encryption. Aura Jewels does not store your credit card information on our servers.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PaymentMethodsPage;
