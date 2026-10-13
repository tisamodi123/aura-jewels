'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface FAQItem {
    q: React.ReactNode;
    a: React.ReactNode;
}

export interface FAQCategory {
    category: string;
    items: FAQItem[];
}

export const FAQS: FAQCategory[] = [
    {
        category: "About Us",
        items: [
            {
                q: <><strong>Who are we? What makes Aura Jewels different?</strong></>,
                a: "At Aura Jewels, we believe shopping for fine diamond jewellery online should feel easy, personal, honest, and genuinely enjoyable. We're not just another online jewellery brand — our designers, manufacturers, gemologists, and artisans all work together under one roof. That means our deep knowledge of diamonds and fine jewellery, paired with a direct-to-customer model, lets us offer real craftsmanship at prices that make sense. No two diamonds are alike, and neither are our customers — we treat every piece and every person that way."
            },
            {
                q: <><strong>Where is Aura Jewels located?</strong></>,
                a: "We're headquartered in Mumbai, India. Every piece we sell is designed and crafted right here in India."
            },
            {
                q: <><strong>Do you have gemologists in your team?</strong></>,
                a: "We do — our in-house team includes GIA Graduate Gemologists who work closely with our customer support. Have a question about a diamond or a piece of jewellery? You can talk to one of our gemologists directly, anytime."
            },
            {
                q: <><strong>Do you offer any additional discounts?</strong></>,
                a: "Yes! First-time customers get a special discount — just apply the welcome coupon code at checkout."
            }
        ]
    },
    {
        category: "Know Your Diamonds & Jewellery",
        items: [
            {
                q: <><strong>What&apos;s the most important thing to remember while buying a diamond?</strong></>,
                a: "Keep the 4Cs in mind — Cut, Color, Clarity, and Carat Weight. Together, they're what determine a diamond's beauty and value, and understanding them will make choosing the right one much easier. Our 4Cs Guide on the website breaks each of these down in more detail."
            },
            {
                q: <><strong>Is my jewellery authentic and certified?</strong></>,
                a: "Yes. Every diamond above 1.00 carat is certified by a leading international laboratory such as IGI, GSI, or GIA. All our gold jewellery is BIS Hallmarked, and every jewellery piece comes with its own authenticity certificate, so you can buy with complete confidence, knowing exactly what you're getting."
            },
            {
                q: <><strong>What are IGI, GSI, GIA diamond certificates?</strong></>,
                a: "The International Gemological Institute (IGI), the Gemological Science International (GSI), and the Gemological Institute of America (GIA) are among the world's most trusted diamond grading laboratories. A certificate from any of these organizations provides an unbiased, expert assessment of a diamond's Cut, Color, Clarity, and Carat Weight, so you know exactly what you're paying for."
            },
            {
                q: <><strong>How can I make sure the diamonds I receive are actually the diamonds I ordered?</strong></>,
                a: "IGI, GSI, and GIA certified diamonds each carry a unique certificate number, laser-inscribed directly onto the diamond by the respective laboratory. You can verify this number on the IGI, GSI, or GIA website, or match it with the certificate provided with your diamond. Since each certificate number is unique to a single diamond, verification is simple and reliable. If you'd like additional assurance, a qualified gemologist can also examine the diamond and confirm it matches its certificate."
            },
            {
                q: <><strong>Do you offer lab-grown as well as natural diamonds?</strong></>,
                a: "As of now we provide only lab-grown diamonds, and the listing for each piece clearly states which one it is. Either way, it arrives with an IGI, GSI, or GIA certificate confirming authenticity — we're always upfront about which type you're buying. We will soon be providing natural diamond jewellery as well."
            },
            {
                q: <><strong>What are conflict-free diamonds?</strong></>,
                a: "These are diamonds mined and traded without ties to human rights abuses, armed conflict, child labour, or environmental damage. Every diamond at Aura Jewels is conflict-free, sourced through legitimate channels and certified under the internationally recognised Kimberley Process. Ethical sourcing isn't a footnote for us — it's something we take seriously at every step."
            },
            {
                q: <><strong>Do pendants come with the chain?</strong></>,
                a: "Pendants are sold separately from chains — you can pick up a chain to go with it on its own."
            },
            {
                q: <><strong>How do I find my Ring Size?</strong></>,
                a: "A quick at-home trick: wrap a strip of paper or string around your finger, mark where the ends meet, then measure that length in millimetres. You can also measure the inside diameter of a ring you already own that fits well. For a more precise method, check out our Ring Size Guide."
            },
            {
                q: <><strong>Will you resize the ring if it doesn&apos;t fit?</strong></>,
                a: "Yes, resizing is free in almost every case. The only exception is if the design cannot be resized due to technical limitations. If additional material is required for the resize, a small additional charge will apply. If less material is needed, we'll either refund the difference to your bank account or add it to your store credit, whichever you prefer."
            }
        ]
    },
    {
        category: "Placing an Order",
        items: [
            {
                q: <><strong>How should I place an order on your website?</strong></>,
                a: "It only takes a few steps: 1. Browse the collection and hit 'Add to Cart' on the piece you like. 2. Head to Proceed to Checkout when you're ready. 3. Fill in your name, email, and other basic details. 4. Add your shipping and billing address. 5. Pick a payment method and confirm your order. 6. You'll get a confirmation email right after."
            },
            {
                q: <><strong>Can I order by phone?</strong></>,
                a: "Sure can — feel free to browse our designs and place your order right from your phone. Our support team is on hand to walk you through anything along the way."
            },
            {
                q: <><strong>Can I order through your website?</strong></>,
                a: "Absolutely — the website is built for a smooth, secure shopping experience. Engagement rings and the rest of our jewellery collection are all just an encrypted checkout away."
            },
            {
                q: <><strong>Will I get an order confirmation?</strong></>,
                a: "Yes, you'll receive an order confirmation on WhatsApp immediately after your order is placed. If you provided an email address during checkout, we'll also send a confirmation email to that address."
            },
            {
                q: <><strong>What if I need help placing an order?</strong></>,
                a: "Just reach out — our support team is at support@aurajewels.com and happy to guide you through every step of placing your order."
            },
            {
                q: <><strong>What if I have a question about my order or need to cancel it?</strong></>,
                a: "For anything related to an existing order — questions or cancellations — get in touch with our Customer Support team and we'll take care of it promptly."
            },
            {
                q: <><strong>How do I check the status of my order?</strong></>,
                a: "Log into 'My Account' on our website anytime to see the latest status and details of your orders. If you need more help, our support team's just a message away."
            },
            {
                q: <><strong>What is the guarantee of my product being delivered after making the payment?</strong></>,
                a: "The moment your payment is confirmed, your order gets logged into our system and shows up in your account right away. Once it ships, you'll get a tracking email so you can follow it the whole way to your doorstep."
            },
            {
                q: <><strong>Can I gift the product purchased from your website directly to the respective person with a gift card?</strong></>,
                a: "Yes — we can ship your gift straight to the recipient along with a personalised gift card. Just add their details at checkout."
            }
        ]
    },
    {
        category: "Customization & Personalization",
        items: [
            {
                q: <><strong>Can I create my own custom jewellery design?</strong></>,
                a: "Definitely! Our Custom Jewellery feature lets you design something entirely your own — share what inspires you, set your preferences and budget, and our team takes it from there. The result: a piece designed by you, crafted by us."
            },
            {
                q: <><strong>Can I custom design an engagement ring?</strong></>,
                a: "Yes — designing a custom engagement ring is one of the most personal ways to mark your love story. Our team would love to collaborate with you to bring your idea to life. Just get in touch with support to kick things off."
            },
            {
                q: <><strong>What are the customization charges?</strong></>,
                a: "Customization usually doesn't cost extra — whether you go with a design straight off our site or request something fully bespoke, however the making charges per gram of metal at times may be dependent on the complexity of the design."
            },
            {
                q: <><strong>Can you engrave my ring?</strong></>,
                a: "Yes, engraving is on us. Add a message or inscription of your choice while placing your order and we'll take care of the rest."
            },
            {
                q: <><strong>Can I order a ring in a size that isn&apos;t offered on the site?</strong></>,
                a: "Yes — if your size isn't listed, just tell our support team what you need and we'll sort it out."
            }
        ]
    },
    {
        category: "Payments",
        items: [
            {
                q: <><strong>What types of payment do you accept?</strong></>,
                a: "Aura Jewels checkout runs through trusted payment gateways, including RazorPay and CCAvenue, keeping every transaction encrypted and secure. Here's what's accepted: • Credit Cards: Visa, Mastercard, American Express, RuPay • Debit Cards: All major Indian banks • Net Banking: 200+ banks supported • UPI: Google Pay, PhonePe, Paytm, and more"
            },
            {
                q: <><strong>How do I pay using a Credit/Debit card and is it safe?</strong></>,
                a: "We accept VISA, Mastercard and other major cards through our secure payment partners. Just punch in your 16-digit card number and the 3-digit CVV from the back, and you're set. Your card details stay fully confidential — SSL encryption keeps everything locked down at every step."
            },
            {
                q: <><strong>Are there any hidden costs?</strong></>,
                a: "Zero. What you see is what you pay — no hidden fees, no surprise add-ons, and shipping is free across the board. That said, since every piece is made to order, small variations in gold and diamond weight can happen, and any difference will show up clearly on your final invoice."
            },
            {
                q: <><strong>Is your site secure?</strong></>,
                a: "It is. We run 256-bit SSL encryption across the site to keep your personal and payment details protected, with every transaction encrypted and monitored for fraud."
            }
        ]
    },
    {
        category: "Shipping & Insurance",
        items: [
            {
                q: <><strong>How many days does it take to deliver my order?</strong></>,
                a: "Each piece is made fresh for you, which takes about 15 to 17 calendar days to reach your doorstep."
            },
            {
                q: <><strong>How will the delivery be done?</strong></>,
                a: "We ship exclusively through trusted, insured courier partners, so your jewellery arrives safely and on schedule."
            },
            {
                q: <><strong>How do I track my order after it has been shipped?</strong></>,
                a: "Once your order ships, you'll get a confirmation email with a tracking number you can use to follow it in real time through our courier partner's portal. Our support team's around if you need a hand tracking anything down."
            },
            {
                q: <><strong>What if I need my order sooner than the estimated delivery date ?</strong></>,
                a: <>
                    <p>Every Aura Jewels piece is made to order and undergoes a thorough quality assurance process before it is shipped. To ensure the highest standards of craftsmanship, we recommend placing your order well in advance.</p>&nbsp;
                    <p>If you need your jewellery by a specific date, please get in touch with us before placing your order. We'll do our best to accommodate your request whenever possible.</p>
                    <strong>Email :- <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}> {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</a></strong><br></br>
                    <strong>Phone :- <a href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`}>{process.env.NEXT_PUBLIC_SUPPORT_PHONE}</a></strong>
                </>
            },
            {
                q: <><strong>Can I change my shipping address after I have placed an order?</strong></>,
                a: "You can, as long as the order hasn't shipped yet. Once it's dispatched, the address is locked in."
            },
            {
                q: <><strong>Can I ship to an address that is different from my billing address?</strong></>,
                a: "Yes, ship it wherever you'd like — it doesn't need to match your billing address."
            },
            {
                q: <><strong>Are your shipments secure?</strong></>,
                a: "They are — every order within India stays fully insured until it lands in your hands."
            },
            {
                q: <><strong>How safe is my product?</strong></>,
                a: "We pack everything in sturdy, tamper-proof packaging and insure every shipment in transit, handled only by established courier partners. If a package looks like it's been tampered with when it arrives, don't accept it."
            },
            {
                q: <><strong>What if my jewellery gets lost during shipment?</strong></>,
                a: "Every order is fully insured in transit, so in the unlikely event something gets lost, you'll be refunded in full. We want you to have complete peace of mind on this."
            },
            {
                q: <><strong>What will my packing be like?</strong></>,
                a: "Expect your jewellery to arrive in our signature premium box, along with all the relevant certificates — everything you need for total peace of mind."
            }
        ]
    },
    {
        category: "Returns, Exchanges & Buyback",
        items: [
            {
                q: <><strong>Do you have any Return Policy?</strong></>,
                a: "Yes — you can return an eligible piece within 10 days of delivery, no questions asked, as long as it's unused, unworn, and comes back with its original packaging, certificate, and accessories. Full terms are in our Return &amp; Refund Policy."
            },
            {
                q: <><strong>Do you have any Buy Back or Exchange policy?</strong></>,
                a: "We don't do a direct swap within that 10-day window — if you'd rather have a different piece, you'd return the original for a refund or Store Credit and place a fresh order. Separately, though, we do run a Lifetime Exchange Program for eligible pieces further down the road; you'll find the details in our Lifetime Exchange Policy."
            },
            {
                q: <><strong>How long will it take to get refunds, if any?</strong></>,
                a: "Once your return reaches us, our team runs a quality check that typically takes 3–5 business days. Store Credit, if you opt for it, is applied the moment that check clears. A refund to your original payment method — card, UPI, or net banking — usually lands within 7–10 business days after that. For change-of-mind returns, a small return-shipping charge (2% of the invoice value) comes out of the refund; if the return is due to a defect, wrong item, or transit damage on our end, you get the full amount back with nothing deducted."
            },
            {
                q: <><strong>Can I take a ring to my local jeweller to have it resized?</strong></>,
                a: "We'd really advise against it. Once anyone other than Aura Jewels resizes, repairs, or alters a piece, it's no longer eligible for return, refund, or warranty coverage — and there's a genuine risk of damage to the diamond or setting. Bring it to us instead: resizing is free and your piece stays fully protected."
            }
        ]
    },
    {
        category: "After Purchase & Jewellery Care",
        items: [
            {
                q: <><strong>How should I take care of my jewellery after purchase?</strong></>,
                a: "Fine jewellery needs a bit of care — store each piece on its own in a soft pouch or box to prevent scratches, keep it away from chemicals, perfumes, and heat, and take it off before swimming or workouts. Our jewellery care guide covers this in more depth."
            },
            {
                q: <><strong>Do you clean or provide care for jewellery sold on your site?</strong></>,
                a: "Yes — every Aura Jewels piece comes with complimentary lifetime cleaning through our Aura Jewels Care service. You'd just cover the shipping to send it in and back."
            },
            {
                q: <><strong>I lost my jewellery certificate, can I get a duplicate?</strong></>,
                a: "We can arrange a duplicate certificate for you. We will require the jewellery to be sent to us. Re-certification may carry a small cost depending on the grading lab involved. You'd cover the shipping to send it in and back. Reach out to support and we'll help sort it out."
            }
        ]
    }
];

export default function FaqClient() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggle = (id: string) => setOpenIndex(openIndex === id ? null : id);

    return (
        <div className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto animate-fadeIn min-h-screen">
            <div className="text-center mb-20">
                <p className="text-[11px] uppercase tracking-[0.5em] text-[#013D3D] font-bold mb-4 font-jakarta">Support Center</p>
                <h1 className="text-5xl md:text-7xl serif mb-8">Frequently Asked <br />Questions</h1>
                <div className="w-20 h-[1px] bg-black mx-auto"></div>
            </div>

            <div className="space-y-16">
                {FAQS.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-8">
                        <h3 className="text-[14px] uppercase tracking-[0.3em] font-bold font-jakarta text-[#013D3D] border-b border-gray-100 pb-4">
                            {group.category}
                        </h3>
                        <div className="space-y-4">
                            {group.items.map((item, iIdx) => {
                                const id = `${gIdx}-${iIdx}`;
                                const isOpen = openIndex === id;
                                return (
                                    <div key={id} className="border-b border-gray-50 overflow-hidden">
                                        <button
                                            onClick={() => toggle(id)}
                                            className="w-full py-6 flex justify-between items-center text-left group"
                                        >
                                            <span className="text-lg md:text-xl serif text-[#1A1A1A] group-hover:text-[#013D3D] transition-colors">{item.q}</span>
                                            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                                            </span>
                                        </button>
                                        <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] pb-8' : 'max-h-0'}`}>
                                            <div className="text-gray-500 font-jakarta leading-relaxed text-[15px]">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 md:mt-24 p-6 sm:p-8 md:p-12 bg-gray-50 text-center rounded-sm max-w-xl mx-auto">
                <h4 className="text-xl md:text-2xl serif mb-3">Still have questions?</h4>
                <p className="text-gray-500 font-jakarta text-xs sm:text-sm md:text-base mb-6 md:mb-8 leading-relaxed">Our diamond experts are here to help you find the perfect piece.</p>
                <Link href="/get-in-touch" className="btn-luxury px-6 sm:px-10 md:px-12 text-[10px] sm:text-[11px]">
                    Contact Concierge
                </Link>
            </div>
        </div>
    );
}
