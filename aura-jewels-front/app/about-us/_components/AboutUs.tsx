import React from "react";
import Image from "next/image";
import { Award, Globe, Headset, ShieldCheck, Truck } from "lucide-react";
import { PREFIX } from "@/lib/constants";
import { Promises } from "@/components/commonts/constVariable";
import ProductPromises from '@/app/product/[id]/components/ProductPromises';
import Link from "next/link";

const AboutUs = () => {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center">
        <Image
          src={`${PREFIX}/images/About-Us-Hero.jpg`}
          alt="Aura Jewels Story Hero"
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl text-white mb-4 serif">
            The Aura Jewels Story
          </h1>
          <p className="text-lg md:text-xl text-white/90 dm-sans font-light tracking-wide">
            Diamond Luxury for Everyone, for Every Moment.
          </p>
        </div>
      </section>

      {/* The Visionary Section */}
      <section className="flex flex-col xl:flex-row w-full min-h-[600px] py-6">
        <div className="w-full xl:w-1/2 relative ">
          <img
            src={`${PREFIX}/images/about/image3.jpg`}
            alt="The Visionary Team"
            className="object-cover"
          />
        </div>
        <div className="w-full xl:w-1/2 bg-[#B57A5A] text-white p-8 xl:p-16 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl mb-8 serif">Our Story</h2>
          <h6 className="text-xl md:text-2xl mb-8 ">
            Before Aura Jewels, There Was a Diamond Story Already in the Making
          </h6>
          <div className="space-y-6 dm-sans text-sm md:text-base leading-relaxed text-white/80">
            <p>
              Our journey didn't begin with jewellery — it began with diamonds
              themselves. Long before we crafted a single piece, our team was
              grading polish diamonds against the 4Cs, learning precision,
              consistency and quality from the inside out. From there, we moved
              further into the process — transforming rough diamonds into brilliant polished ones, guided always by innovation and an obsessive
              attention to detail.
            </p>
            <p>
              Somewhere along the way, we realised that grading and
              manufacturing diamonds was only half the story. We wanted to be
              part of the whole journey — from the earth to the everyday. That's
              what led us to jewellery.
            </p>
            <p>
              Aura Jewels was born from that realisation: a brand built to make
              diamond jewellery a luxury accessible to everyone, everywhere, for
              every moment in life — not just the special ones.
            </p>
          </div>
        </div>
      </section>

      {/* Origin + Today Section */}
      <section className="w-full pb-0">
        {/* 1 */}
        <div className="flex flex-col-reverse xl:flex-row min-h-[600px]">
          <div className="w-full xl:w-1/2 bg-white text-[#1A1A1A] p-8 xl:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl mb-6 serif">Our Origin</h2>
            <h3 className="text-xl md:text-2xl mb-8 serif italic">
              Before Brilliance, There is Intention. <br />
              Before Design, There is Meaning.
            </h3>

            <div className="space-y-6 dm-sans text-sm md:text-base leading-relaxed text-[#1A1A1A]/70">
              <p>
                Every diamond begins as a rough diamond, hidden deep within the
                earth for millennia. At Aura Jewels, we believe the journey from
                earth to elegance deserves the same care at every step — from
                the initial selection of the diamond to the final polish.
              </p>
              <p>
                But our origin isn't only about the diamond. It's about a belief:
                that diamonds shouldn't be reserved for once-in-a-lifetime
                moments. They should be part of everyday elegance — worn with
                confidence, not saved for "someday."
              </p>
            </div>
          </div>

          <div className="w-full xl:w-1/2 relative min-h-[400px]">
            <Image
              src={`${PREFIX}/images/About-Us-category-1.jpg`}
              alt="Crystals and Origin"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* 2 */}
        <div className="flex flex-col xl:flex-row min-h-[600px]">
          <div className="w-full xl:w-1/2 relative min-h-[400px]">
            <Image
              src={`${PREFIX}/images/About-Us-category-2.jpg`}
              alt="Jewelry Crafting"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="w-full xl:w-1/2 bg-[#F8F8F8] text-[#1A1A1A] p-8 xl:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl mb-8 serif">
              Where We Are Today
            </h2>

            <div className="space-y-6 dm-sans text-sm md:text-base leading-relaxed text-[#1A1A1A]/70">
              <h4 className="text-lg font-medium text-[#1A1A1A]">
                From Grading Diamonds to Crafting Dreams
              </h4>

              <p>
                Today, Aura Jewels stands for diamond jewellery that's beautifully
                designed, honestly priced, and made for daily life — not just
                display. Our pieces are worn by people who want to celebrate
                themselves without waiting for a special occasion.
              </p>

              <p>
                This confidence comes from where we started. Aura Jewels is backed
                by an experienced team of master artisans and gemologists established in
                2020, built on sourcing certified, high quality, conflict-free
                diamonds with complete transparency. That same foundation of
                trust and craftsmanship now lives in every Aura Jewels piece.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#B57A5A] text-white py-16 px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <p className="text-sm md:text-base dm-sans leading-relaxed text-white/70">
            <span className="text-white font-medium">Aura Jewels</span> is a
            luxury fine jewellery atelier established in{" "}
            <span className="text-white font-medium">2020</span>, specializing
            in the sourcing and craftsmanship of certified, high quality
            diamonds. The brand focuses on transparency, trust, and ethical
            practices, offering carefully curated, conflict-free diamonds with a
            strong commitment to quality and customer relationships. With a
            growing reach,{" "}
            <span className="text-white font-medium">Aura Jewels</span>{" "}
            serves modern connoisseurs by providing a seamless and
            reliable jewellery buying experience.
          </p>

          {/* Logo Block */}
          <div className="flex items-center justify-center gap-4 space-y-4 pt-4">
            <a href="https://aurajewels.com" target="_blank" rel="noopener noreferrer">
              <Image
                src="/images/Logo.svg"
                alt="Aura Jewels Logo"
                width={65}
                height={65}
                unoptimized
              />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-b border-t border-gray-100 w-full md:mt-0">
        <ProductPromises />
      </section>

      {/* Promise + Mission Section */}
      <section className="w-full pt-6">
        {/* Row 1 - Our Promise */}
        <div className="flex flex-col-reverse xl:flex-row min-h-[600px]">
          <div className="w-full xl:w-1/2 bg-white text-[#1A1A1A] p-8 xl:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl mb-8 serif">
              Our Promise – Care Without Compromise
            </h2>

            <div className="space-y-6 dm-sans text-sm md:text-base leading-relaxed text-[#1A1A1A]/70">
              <p>
                We promise jewellery that's as beautiful as it is ethical. Every
                diamond we sell is conflict free and ethically sourced, and every
                piece is crafted to the highest standards.
              </p>

              <p>
                Our relationship with you doesn't end at checkout — it's built
                on integrity, ethics, and trust, with support that lasts as long
                as you wear the piece.
              </p>
            </div>
          </div>

          <div className="w-full xl:w-1/2 relative min-h-[400px]">
            <Image
              src={`${PREFIX}/images/About-Us-category-3.jpg`}
              alt="Diamond Inspection"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Row 2 - Our Mission */}
        <div className="flex flex-col xl:flex-row min-h-[600px]">
          <div className="w-full xl:w-1/2 relative min-h-[400px]">
            <Image
              src={`${PREFIX}/images/About-Us-category-4.jpg`}
              alt="Luxury Rings"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="w-full xl:w-1/2 bg-[#F8F8F8] text-[#1A1A1A] p-8 xl:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl mb-8 serif">Our Mission</h2>

            <div className="space-y-6 dm-sans text-sm md:text-base leading-relaxed text-[#1A1A1A]/70">
              <h4 className="text-lg font-medium text-[#1A1A1A]">
                Beautiful Luxury Made With Conscience<br />
                Lasting Experience Wrapped In Care
              </h4>

              <p>
                Our mission is to lead the way in creating a more sustainable
                and transparent luxury industry. We believe that by combining
                traditional craftsmanship with modern innovation and ethical
                practices, we can create jewellery that not only looks beautiful
                but also makes a positive impact on the world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
