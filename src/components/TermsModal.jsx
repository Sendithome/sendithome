import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

export default function TermsModal({ open, onClose, type = 'terms' }) {
  const isTerms = type === 'terms';

  const termsContent = [
    {
      heading: '1. INTRODUCTION AND BINDING AGREEMENT',
      body: 'Welcome to the SendItHome Platform. This Platform is owned and operated by Vacation Logistics, DMCC, a company duly registered under the laws of Dubai, United Arab Emirates, under Trade License No. DMCC 844559, with its registered address at Unit 925, DMCC Business Centre, Level 1, Jewellery & Gemplex 3, Dubai, United Arab Emirates ("SendItHome", "Company", "we", "us", or "our").\n\nThese Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Customer", "User", "Guest", or "you") and SendItHome governing your access to and use of the Platform and associated Services across the Service Countries as published on the Platform from time to time.\n\nYou must be at least 18 years of age, or the legal age of majority in your jurisdiction if higher, to access or use the Platform. By accessing or using the Platform, you represent and warrant that you meet this eligibility requirement and have the full legal capacity to enter into this Agreement.\n\nIMPORTANT NOTICE — PERSONAL SHOPPING ONLY: The SendItHome Service is strictly limited to the shipment of personal purchased items acquired during the Customer\'s tourism or leisure travel. Commercial shipments, resale inventory, bulk trading goods, and any business-use shipments are strictly prohibited and constitute a material breach of these Terms.',
    },
    {
      heading: '2. DEFINITIONS AND INTERPRETATION',
      body: '2.1 Definitions\n\nIn these Terms, unless the context otherwise requires, the following expressions shall have the following meanings:\n\n• "Agreement" means these Terms and Conditions, together with any annexes, schedules, and policies referenced herein including the Privacy Policy, Prohibited Items List, and Country-Specific Addenda.\n\n• "Approved Hotel Partner" means any 4-star or 5-star hotel property, resort, or hospitality group that has entered into a commercial partnership agreement with SendItHome to offer the Services to their guests.\n\n• "Applicable Laws" means all statutes, regulations, rules, orders, and binding legal requirements of the Origin Country, Destination Country, and any transit jurisdictions, including customs, export controls, import restrictions, sanctions, and data protection laws.\n\n• "Box" means the SendItHome-approved shipping carton (10kg or 20kg capacity) provided to the Customer by the Approved Hotel Partner for the purpose of packaging personal purchased items.\n\n• "Charges" means the fees payable by the Customer for the Services, as detailed on the Platform at the time of booking, which may include the shipping fee ($60–$90 USD), the hotel service charge ($20 USD), applicable duties, taxes, and any additional service fees.\n\n• "Courier Partner" means the licensed international logistics provider engaged by SendItHome to physically transport Shipments, including but not limited to FedEx, DHL, UPS, and other regionally-approved carriers.\n\n• "Customer" means the individual tourist or hotel guest who registers an account on the Platform and books a Shipment under these Terms.\n\n• "Customer Data" means all information provided by the Customer to the Platform including registration details, identification information where legally required, shipment details, and payment information.\n\n• "Data Protection Laws" means, as applicable: (i) the EU General Data Protection Regulation (Regulation 2016/679) ("GDPR") and national implementing legislation; (ii) the UK Data Protection Act 2018 and UK GDPR; (iii) UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data; (iv) the DIFC Data Protection Law No. 5 of 2020; (v) the California Consumer Privacy Act (CCPA/CPRA); and (vi) any equivalent data protection or privacy laws applicable in the Service Countries.\n\n• "Destination Country" means the country to which the Shipment is delivered, being the Customer\'s home country or other declared address.\n\n• "Government Authority" means any government, tourism authority, customs authority, tax authority, regulatory body or public agency having jurisdiction over the Services.\n\n• "HS Code" means the Harmonized Commodity Description and Coding System code assigned to each item in the Shipment for customs classification purposes.\n\n• "Origin Country" means the country in which the Approved Hotel Partner is located and from which the Shipment is dispatched.\n\n• "Personal Shopping" means items purchased by the Customer for their own personal, household, or gift-giving use, and specifically excludes any commercial, resale, or business-related goods.\n\n• "Platform Pricing" means the pricing, fees, charges and service costs published on the Platform from time to time.\n\n• "Platform" means the SendItHome digital platform accessible via sendithome.com, mobile applications, QR-code-based web interfaces, and any other digital channels operated by SendItHome.\n\n• "Prohibited Items" means items that cannot be shipped through the Platform as detailed in Section 9 of these Terms.\n\n• "Service Countries" means the Service Countries as published on the Platform from time to time in which SendItHome currently operates, as listed on the Platform and updated from time to time.\n\n• "Services" means the end-to-end luggage and personal shopping shipment services provided by SendItHome, including Platform access, order registration, hotel-partner coordination, courier dispatch, customs documentation, shipment tracking, and customer support.\n\n• "Shipment" means any parcel, package, or box tendered by a Customer for transportation and delivery through the Platform.\n\n2.2 Interpretation\n\n1. References to any statute or statutory provision include references to such statute or provision as amended, re-enacted, or extended, and to all subordinate legislation made under such statute or provision.\n\n2. The singular includes the plural and vice versa; masculine gender includes feminine and neuter; references to persons include individuals, bodies corporate, unincorporated associations, and partnerships.\n\n3. "In Writing" includes any written, electronic, or digital communication including email, SMS, WhatsApp, and in-Platform messaging.\n\n4. Clause headings are for convenience only and do not affect the interpretation of these Terms.',
    },
    {
      heading: '3. BASIS OF THE AGREEMENT',
      body: '1. These Terms come into effect when the Customer: (a) completes the account registration process on the Platform; (b) confirms acceptance of these Terms; and (c) submits payment for a Shipment.\n\n2. These Terms apply to the exclusion of, and shall prevail over, any other terms that the Customer may seek to impose or incorporate, or that may be implied by trade, custom, practice, or course of dealing.\n\n3. SendItHome reserves the right to modify these Terms at any time. Material changes will be notified to registered Customers via email and posted prominently on the Platform at least 14 days before taking effect. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.\n\n4. In the event of any conflict between these Terms and any country-specific addendum published by SendItHome for a particular Service Country, the country-specific addendum shall prevail for Shipments originating from or destined to that country.',
    },
    {
      heading: '4. USER ACCOUNTS AND REGISTRATION',
      body: '4.1 Account Creation\n\nTo use the Services, Customers must create an account on the Platform. Registration can be initiated by scanning the QR code displayed in partner hotel rooms, at hotel reception desks, on promotional materials, or by visiting sendithome.com directly.\n\nDuring registration, Customers must provide: (a) full legal name as appears on their travel identification; (b) a valid email address; (c) a mobile telephone number; (d) their current hotel and room number; (e) their home/destination address; and (f) a secure password. A One-Time Password (OTP) is sent to the provided email address and/or mobile number to validate contact details.\n\n4.2 Identity Verification\n\nFor regulatory compliance, anti-money laundering obligations, and to satisfy customs authorities across the Service Countries, SendItHome may require additional identity verification including:\n\n• Passport or national identification document details;\n• Travel visa information where legally applicable;\n• Proof of hotel check-in (room confirmation or key card scan);\n• Biometric verification where offered and legally permitted.\n\nThe specific documentation required varies by Origin Country, Destination Country, and Shipment value. Customers acknowledge that failure to provide requested verification may result in rejection of the Shipment.\n\n4.3 Account Responsibility\n\n1. Customers must provide accurate, complete, and current information during registration and must promptly update any changes.\n\n2. Customers are solely responsible for maintaining the confidentiality of account credentials and for all activity occurring under their account.\n\n3. Customers must immediately notify SendItHome of any unauthorized access, suspected breach, or misuse of their account by contacting our support team.\n\n4. Each Customer may hold only one account. Creation of multiple accounts to circumvent limitations or policies is prohibited.\n\n4.4 Age and Capacity\n\nThe Platform is restricted to individuals aged 18 years or older, or the legal age of majority in their jurisdiction, whichever is greater. By using the Platform, the Customer represents and warrants that they have the full legal capacity to enter into a binding agreement.\n\n4.5 Account Suspension and Termination\n\nSendItHome reserves the right to suspend or terminate any account, with or without notice, if:\n\n• The Customer violates these Terms or any Applicable Laws;\n• Fraudulent, abusive, or unlawful activity is suspected;\n• The Customer attempts to ship Prohibited Items or commercial goods;\n• Payment disputes, chargebacks, or failed payments occur;\n• The account is inactive for more than 24 consecutive months.',
    },
    {
      heading: '5. THE SERVICES',
      body: '5.1 Service Overview\n\nSendItHome provides a technology-enabled logistics platform that facilitates the shipment of personal shopping purchases and personal belongings acquired during travel. The Services enable Customers to arrange the collection, processing, transportation, and delivery of eligible items through participating hospitality providers, Courier Partners, and other service providers operating within the Service Countries.\n\n5.2 Core Service Components\n\n5.2.1 Platform Access and Order Registration\nSendItHome provides the digital Platform through which Customers register Shipments. The registration process is designed to be completed within approximately three (3) minutes and includes item declaration, pricing confirmation, and payment processing.\n\n5.2.2 Approved Hotel Partner Network\nSendItHome collaborates with selected luxury, premium, and partner hotel groups, resorts, and hospitality providers across the Service Countries, as published on the Platform from time to time.\n\n5.2.3 Hotel Concierge Service\nAs part of the Services, the Approved Hotel Partner provides the following services to the Customer, which are included within the hotel service charge ($20 USD per Box):\n\n• Supply of the appropriate 10kg or 20kg shipping Box;\n• Provision of packaging materials including tape, tape gun, bubble wrap, foam padding, and tissue paper;\n• Printing of shipment labels, customs declarations, and related documentation;\n• Secure storage of the sealed Box under CCTV surveillance prior to courier collection;\n• Coordination with the designated Courier Partner for scheduled collection;\n• Handover of the Shipment to the Courier Partner with documentation verification.\n\n5.2.4 International Shipping\nSendItHome partners with leading international Courier Partners including FedEx, DHL, and UPS to provide reliable door-to-door delivery to the Customer\'s declared destination address.\n\n5.2.5 Customs Compliance and Documentation\nSendItHome generates the necessary customs documentation including commercial invoices, customs declarations, and HS Code classifications based on Customer-provided item descriptions. Where available and legally mandated, SendItHome will integrate with retail POS systems to extract HS Codes directly from purchase receipts.\n\n5.2.6 Shipment Tracking and Notifications\nCustomers receive real-time tracking updates via the Platform, email, and optional WhatsApp notifications in multiple languages. A unique tracking number is assigned to each Shipment.\n\n5.2.7 Customer Support\nMultilingual customer support is available via in-Platform chat, email, WhatsApp, and telephone during designated support hours across multiple time zones.\n\n5.3 Charges and Pricing\n\nSendItHome offers transparent and competitive pricing for the Services. Applicable Charges, including shipping fees, service fees, and any optional services, are published on the Platform and may be amended from time to time without prior notice.\n\nThe Charges quoted at the time of booking will apply to the relevant Shipment and will be displayed to the Customer prior to order confirmation and payment.\n\nUnless otherwise stated, Charges do not include applicable customs duties, import taxes, value-added taxes (VAT), goods and services taxes (GST), clearance fees, or other government-imposed charges that may be levied by the Destination Country. Such charges remain the responsibility of the Customer.\n\n5.4 Minimum Spend Requirement\n\nThe Customer must satisfy any minimum purchase requirements published on the Platform from time to time from registered retail establishments during their trip to qualify for the Services. Proof of purchase (receipts) must be presented during the packaging process.',
    },
    {
      heading: '6. PERSONAL SHOPPING ONLY POLICY',
      body: 'CRITICAL COMPLIANCE REQUIREMENT: The SendItHome Service is strictly limited to the shipment of personal shopping items only. This is a non-negotiable condition of Service across all Service Countries.\n\n6.1 Permitted Shipments\n\nThe following categories of items are permitted, subject to the Prohibited Items list in Section 9:\n\n• Personal clothing, fashion items, and accessories;\n• Personal footwear and bags;\n• Souvenirs and gifts purchased during the trip;\n• Children\'s toys and non-fragile household items;\n• Items purchased from registered tax-free retail establishments;\n• Left-behind personal belongings from the partner hotel (Phase 2 Service).\n\n6.2 Strictly Prohibited Use\n\nThe Services must NOT be used for:\n\n• Commercial goods, wholesale inventory, or merchandise for resale;\n• Items purchased for trading, bartering, or commercial distribution;\n• Bulk quantities suggesting commercial intent (e.g., 10+ identical items);\n• Goods acquired as business inventory or for inventory replenishment;\n• Items valued in excess of USD 5,000 per individual item;\n• Shipments serving as a business logistics function of any kind.\n\n6.3 Verification and Enforcement\n\nSendItHome reserves the right, at its absolute discretion, to:\n\n• Inspect and verify the contents of any Shipment;\n• Require documentary proof of personal purchase (receipts, invoices);\n• Refuse any Shipment that appears commercial in nature;\n• Share information with customs authorities and tax authorities of both Origin and Destination Countries;\n• Terminate the account of any Customer found to be in breach of this Section.\n\n6.4 Legal Consequences\n\nMisuse of the Services for commercial purposes may constitute customs fraud, tax evasion, or unlicensed commercial import/export, and may result in criminal prosecution, civil penalties, and seizure of goods by customs authorities in the relevant jurisdictions.',
    },
    {
      heading: '7. ORDER PLACEMENT AND CONFIRMATION',
      body: '7.1 Booking Process\n\nCustomers place Shipment orders through the Platform by: (a) completing registration (if not already registered); (b) declaring all items intended for shipment with accurate descriptions and values; (c) providing Destination Country address details; (d) acknowledging the Personal Shopping Only policy; (e) reviewing and accepting the quoted Charges; and (f) submitting payment.\n\n7.2 Order Acceptance\n\nAll orders are subject to acceptance by SendItHome. Order acceptance occurs when we send an Order Confirmation email to the Customer\'s registered email address. Until confirmation is issued, no contract exists between the parties.\n\n7.3 Order Modification and Cancellation\n\n1. Before payment: Orders may be freely cancelled or modified without charge.\n\n2. After payment, before Shipment collection by the Courier Partner: Orders may be modified at SendItHome\'s discretion. A cancellation may incur a 10% administrative fee to cover processing costs.\n\n3. After Shipment collection: Orders generally cannot be cancelled. Customers may request a recall, subject to the Courier Partner\'s policies and additional recall fees charged by the Courier Partner.\n\n4. SendItHome reserves the right to cancel any order where: (a) fraud is suspected; (b) the Customer attempts to ship Prohibited Items; (c) verification requirements are not satisfied; or (d) circumstances beyond our control prevent performance.',
    },
    {
      heading: '8. PARCEL PACKAGING AND HANDLING',
      body: '8.1 Hotel Staff Packaging\n\nFor the purposes of complying with Applicable Laws, security requirements, and courier regulations, packaging of all Shipments shall be handled exclusively by the designated staff of the Approved Hotel Partner where the Customer is staying.\n\n8.2 Customer Obligations\n\nThe Customer must:\n\n• Present all items to the hotel staff during the packaging process;\n• Provide accurate retail receipts or proof of purchase for each item;\n• Declare the true contents, quantity, and value of the Shipment;\n• Acknowledge that they have reviewed and agreed to the Prohibited Items list;\n• Ensure that all items presented for Shipment comply with the import and export requirements, restrictions, and laws of the Origin Country, Destination Country, and any transit jurisdictions;\n• Sign the Shipment declaration confirming personal-shopping-only compliance.\n\n8.3 Hotel Staff Responsibilities\n\nThe Approved Hotel Partner\'s designated staff will:\n\n• Ensure appropriate packaging using SendItHome-approved materials;\n• Apply printed shipment labels and customs documentation to the Box;\n• Seal the Box securely in the presence of the Customer;\n• Store the sealed Shipment in a secure, CCTV-monitored area pending courier collection;\n• Conduct the formal handover to the Courier Partner with documentation verification.',
    },
    {
      heading: '9. PROHIBITED ITEMS AND RESTRICTIONS',
      body: '9.1 Universally Prohibited Items\n\nThe following items are prohibited from Shipment across all Service Countries:\n\n• Currency, negotiable instruments, bearer bonds, traveler\'s cheques, and precious metals in bullion form;\n• Firearms, ammunition, explosives, fireworks, and weapons of any kind;\n• Illegal drugs, controlled substances, and drug paraphernalia;\n• Hazardous materials including flammable liquids, corrosives, and toxic substances;\n• Live animals, plants, seeds, and biological materials;\n• Human remains, body parts, and biological samples;\n• Perishable food items requiring temperature control;\n• Alcoholic beverages and tobacco products (except within permitted duty-free allowances);\n• Counterfeit goods, pirated materials, and items infringing intellectual property rights;\n• Obscene, pornographic, or legally offensive materials;\n• Items subject to sanctions or trade embargoes;\n• Any item whose shipment would contravene the laws of the Origin Country, Destination Country, or transit jurisdictions.\n\n9.2 Restricted Items (Subject to Review)\n\nThe following items may be permitted subject to additional documentation, insurance, or country-specific approval:\n\n• Electronics containing lithium batteries (subject to IATA dangerous goods regulations);\n• Fine jewellery and watches exceeding USD 5,000 in individual value;\n• Medications (prescription medications require valid prescription documentation);\n• Cultural artifacts and antiques (may require export permits);\n• Items of unusual weight, size, or fragility.\n\n9.3 Country-Specific Restrictions\n\nAdditional restrictions may apply based on the Origin Country, Destination Country, and any transit jurisdictions through which a Shipment may pass. Customers remain solely responsible for ensuring that all goods comply with the import and export requirements, restrictions, and regulations of the Origin Country, Destination Country, and any transit jurisdictions.\n\n9.4 Consequences of Prohibited Item Shipment\n\nIf Prohibited Items are discovered in a Shipment, SendItHome may:\n\n• Refuse to process the Shipment;\n• Remove and lawfully dispose of the Prohibited Items;\n• Notify customs authorities of both Origin and Destination Countries;\n• Terminate the Customer\'s account;\n• Retain all Charges paid as liquidated damages;\n• Initiate legal action to recover any costs, fines, or penalties incurred.',
    },
    {
      heading: '10. ACCEPTABLE USE POLICY',
      body: '10.1 License Grant\n\nSendItHome grants the Customer a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for the purpose of utilizing the Services in accordance with these Terms.\n\n10.2 Prohibited Activities\n\nThe Customer agrees not to:\n\n• Use the Platform for any unlawful purpose or in violation of Applicable Laws;\n• Engage in fraud, deception, or misrepresentation;\n• Impersonate any person or entity or misrepresent affiliations;\n• Transmit viruses, malware, or harmful code;\n• Attempt unauthorized access to the Platform, other accounts, or systems;\n• Reverse engineer, decompile, or create derivative works of the Platform;\n• Scrape, harvest, or collect data from the Platform or other users;\n• Use the Platform to send unsolicited communications or spam;\n• Interfere with the operation of the Platform or Courier Partner systems.\n\n10.3 Customer Content License\n\nBy submitting content to the Platform (including photos, descriptions, addresses), the Customer grants SendItHome a worldwide, royalty-free, non-exclusive, sub-licensable license to use, reproduce, and process such content solely for the purpose of providing the Services and complying with legal obligations.',
    },
    {
      heading: '11. CHARGES AND PAYMENT',
      body: '11.1 Charges\n\nCharges for the Services are clearly displayed on the Platform prior to order confirmation. All Charges are inclusive of applicable VAT, GST, or equivalent sales taxes of the Origin Country unless otherwise stated. Destination Country duties, taxes, and customs fees are separate and payable by the Customer.\n\n11.2 Currency\n\nCharges are quoted in US Dollars (USD) by default. The Platform offers display in local currencies for convenience; however, settlement occurs in the currency specified at checkout.\n\n11.3 Payment Processing\n\nPayment is processed through Stripe Payments, a PCI-DSS Level 1 certified payment service provider. SendItHome accepts major credit and debit cards (Visa, Mastercard, American Express, Discover), digital wallets (Apple Pay, Google Pay), and country-specific payment methods as available.\n\n11.4 Failed Payments\n\nIn the event of payment failure, chargeback, or dispute, SendItHome reserves the right to: (a) suspend the Customer\'s account; (b) refuse future Services; (c) withhold release of Shipments until payment is resolved; and (d) pursue legal recovery of unpaid amounts plus reasonable recovery costs.\n\n11.5 Taxes and Duties\n\nThe Customer is solely responsible for all import duties, taxes, VAT, GST, customs clearance fees, and any other charges imposed by the Destination Country. Where SendItHome prepays such charges on behalf of the Customer, these amounts will be invoiced to the Customer and must be settled before release of the Shipment.',
    },
    {
      heading: '12. CANCELLATION AND REFUND POLICY',
      body: '12.1 Customer Cancellation Rights\n\n1. Cancellation before payment: Free of charge.\n\n2. Cancellation after payment but before courier collection: Refund of 90% of the Charges (10% administrative fee retained).\n\n3. Cancellation after courier collection but before Shipment leaves the Origin Country: Subject to Courier Partner recall fees and administrative costs. Refund calculated net of all such costs.\n\n4. Cancellation after international dispatch: No refund available. The Customer may arrange return shipping at their own expense.\n\n12.2 SendItHome-Initiated Cancellation\n\nWhere SendItHome cancels a Shipment due to circumstances within our control (and not attributable to Customer breach), the Customer will receive a full refund. Where cancellation is due to Customer breach, no refund is payable.\n\n12.3 Refund Processing\n\nApproved refunds are processed to the original payment method within 7–14 business days, subject to the processing timelines of the payment provider and banking network.\n\n12.4 Statutory Cancellation Rights\n\nNothing in this Section affects any statutory cancellation rights the Customer may have under consumer protection laws of their country of residence. Customers in the European Union, United Kingdom, and other jurisdictions with distance-selling regulations retain their statutory withdrawal rights where applicable.',
    },
    {
      heading: '13. SERVICE LEVEL COMMITMENTS AND TRACKING',
      body: '13.1 Delivery Timeframes\n\nSendItHome targets the following delivery timeframes from courier collection:\n\n• Domestic within GCC: 1–2 business days;\n• Intra-continental (e.g., Europe to Europe): 2–4 business days;\n• Intercontinental: 3–7 business days;\n• Remote destinations: 5–10 business days.\n\nThese are target timeframes only and are not guaranteed. Actual delivery times depend on the Courier Partner, customs clearance, local holidays, and other factors beyond SendItHome\'s control.\n\n13.2 Tracking\n\nCustomers receive a unique tracking number upon courier collection and may monitor Shipment progress via the Platform, email notifications, and optional WhatsApp updates in multiple languages.\n\n13.3 Delayed Shipments\n\nWhere a Shipment is delayed beyond 14 days past the latest estimated delivery date, the Customer may escalate to SendItHome support for investigation. Compensation, if any, is governed by the Limitation of Liability in Section 16.',
    },
    {
      heading: '14. ROLE OF COURIER PARTNERS',
      body: '14.1 Intermediary Status\n\nSendItHome acts as a platform operator and logistics coordinator, facilitating the booking, administration, and tracking of Shipments through the Platform. Physical transportation, carriage, handling, customs clearance, and delivery of Shipments are performed by independent Courier Partners and other third-party service providers. SendItHome does not itself undertake the physical transportation of Shipments and is not responsible for the acts, omissions, delays, or performance of any independent Courier Partner, except to the extent required by applicable law.\n\n14.2 Courier Partner Terms\n\nOnce a Shipment is collected by the Courier Partner, the terms and conditions of that Courier Partner (including their carriage terms, maximum liability limits, and claims procedures) apply in addition to these Terms.\n\n14.3 International Conventions\n\nInternational Shipments are subject to applicable international conventions including the Warsaw Convention 1929 (as amended), the Montreal Convention 1999, and the Convention on Contracts for the International Carriage of Goods by Road (CMR), which may limit the liability of Courier Partners for loss, damage, or delay.',
    },
    {
      heading: '15. INSURANCE AND SHIPMENT PROTECTION',
      body: '15.1 Standard Coverage\n\nEach Shipment includes standard loss and damage coverage up to USD 1,000 (or local equivalent) as part of the Service. This coverage is provided through our Courier Partner network and is subject to their terms.\n\n15.2 Enhanced Coverage\n\nCustomers may purchase enhanced insurance coverage up to USD 5,000 per Shipment at the time of booking. Enhanced coverage is underwritten by a licensed insurance provider and subject to the policy terms presented at checkout.\n\n15.3 Claims Procedure\n\nClaims for loss or damage must be submitted within 30 days of the scheduled delivery date. Supporting documentation including receipts, photographs, and declaration forms may be required.',
    },
    {
      heading: '16. LIMITATION OF LIABILITY',
      body: '16.1 Exclusions\n\nNothing in these Terms shall limit or exclude SendItHome\'s liability for: (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; (c) any liability that cannot be excluded under Applicable Laws; or (d) wilful misconduct.\n\n16.2 General Liability Cap\n\nSubject to Section 16.1, SendItHome\'s total aggregate liability arising out of or in connection with these Terms, any Shipment, or the use of the Platform shall not exceed the greater of: (a) the Charges paid by the Customer for the specific Shipment giving rise to the claim; or (b) USD 5,000.\n\n16.3 Excluded Losses\n\nIn no event shall SendItHome be liable for:\n\n• Indirect, consequential, incidental, special, or punitive damages;\n• Loss of profit, revenue, business opportunity, or reputation;\n• Loss or corruption of data;\n• Emotional distress or sentimental value of goods;\n• Damage caused by improper packaging by the Customer or third parties;\n• Customs seizures or actions by regulatory authorities;\n• Force majeure events.\n\n16.4 Time Limitation\n\nAny claim against SendItHome must be brought within 12 months of the event giving rise to the claim, failing which the claim shall be time-barred.',
    },
    {
      heading: '17. INDEMNIFICATION',
      body: 'The Customer agrees to indemnify, defend, and hold harmless SendItHome, its officers, directors, employees, agents, affiliates, Approved Hotel Partners, and Courier Partners from any claims, liabilities, damages, losses, or expenses (including reasonable legal fees) arising out of or in connection with:\n\n• The Customer\'s use or misuse of the Platform and Services;\n• Any violation of these Terms or Applicable Laws;\n• Any breach of the Customer\'s representations and warranties;\n• Shipment of Prohibited Items or misdeclaration of Shipment contents;\n• Customs violations, tax evasion, or regulatory breaches;\n• Infringement of third-party intellectual property or other rights;\n• Unauthorized use of the Customer\'s account.',
    },
    {
      heading: '18. DATA PROTECTION AND PRIVACY',
      body: '18.1 Privacy Policy\n\nSendItHome\'s processing of Personal Data is governed by our Privacy Policy, which forms an integral part of these Terms. The Privacy Policy describes what Personal Data we collect, how we use it, to whom we disclose it, and the rights of data subjects.\n\n18.2 Multi-Jurisdictional Compliance\n\nSendItHome complies with applicable Data Protection Laws across the Service Countries including:\n\n• EU GDPR and national implementing laws;\n• UK GDPR and Data Protection Act 2018;\n• UAE Federal Decree-Law No. 45 of 2021 and DIFC Data Protection Law;\n• Saudi Arabia Personal Data Protection Law (PDPL);\n• Japan Act on the Protection of Personal Information (APPI);\n• Singapore Personal Data Protection Act (PDPA);\n• California Consumer Privacy Act (CCPA/CPRA) where residents are involved;\n• All other applicable data protection laws in the Service Countries.\n\n18.3 International Data Transfers\n\nGiven our multi-country operations, Personal Data may be transferred across international borders. SendItHome implements appropriate safeguards including Standard Contractual Clauses, Binding Corporate Rules, and adequacy-based transfers where available.\n\n18.4 Customer Rights\n\nDepending on applicable Data Protection Laws, Customers may have rights to access, rectify, erase, restrict, port, or object to processing of their Personal Data. Rights requests can be submitted via the Platform or to privacy@sendithome.com.',
    },
    {
      heading: '19. INTELLECTUAL PROPERTY',
      body: 'All intellectual property rights in the Platform, including the SendItHome name, logo, trademarks, software, user interfaces, designs, and all content (other than Customer-submitted content) are owned by or licensed to SendItHome. The Customer is granted only the limited license described in Section 10.1.\n\nThe Customer retains ownership of their submitted content but grants SendItHome the license described in Section 10.3.',
    },
    {
      heading: '20. THIRD-PARTY SERVICES AND LINKS',
      body: 'The Platform may contain links to or integrations with third-party services (including Courier Partners, payment processors, mapping services, and hotel partner systems). These are provided for convenience only. SendItHome is not responsible for the content, availability, accuracy, or practices of third parties. Customers should review the terms and privacy policies of any third parties before engaging.',
    },
    {
      heading: '21. FORCE MAJEURE',
      body: 'Neither party shall be liable for any failure or delay in performance resulting from causes beyond its reasonable control, including acts of God, war, terrorism, civil unrest, strikes, industrial disputes, cyberattacks, pandemics, government orders, customs seizures, weather events, natural disasters, or failures of public infrastructure or third-party services.\n\nIf a force majeure event continues for more than 30 consecutive days, either party may terminate the affected Shipment with a pro-rated refund subject to costs already incurred.',
    },
    {
      heading: '22. GOVERNING LAW AND DISPUTE RESOLUTION',
      body: '22.1 Governing Law\n\nThese Terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with the laws of the Dubai International Financial Centre (DIFC), United Arab Emirates, without regard to its conflict of laws principles.\n\n22.2 Consumer Protection\n\nNothing in Section 22.1 affects any mandatory consumer protection laws of the Customer\'s country of residence that cannot be derogated from by contract.\n\n22.3 Dispute Resolution\n\nBefore commencing formal proceedings, the parties agree to attempt resolution through good-faith negotiation for a minimum of 30 days. Customers may initiate disputes via disputes@sendithome.com.\n\n22.4 Jurisdiction\n\nSubject to applicable consumer rights, the parties submit to the exclusive jurisdiction of the DIFC Courts for any disputes not resolved through negotiation. SendItHome may bring claims in the Customer\'s country of residence where necessary to enforce these Terms or recover amounts owed.\n\n22.5 Class Action Waiver\n\nTo the extent permitted by Applicable Laws, the Customer and SendItHome agree that disputes will be resolved on an individual basis and not as part of a class, consolidated, or representative action.',
    },
    {
      heading: '23. GENERAL PROVISIONS',
      body: '23.1 Entire Agreement\n\nThese Terms, together with the Privacy Policy and any country-specific addenda, constitute the entire agreement between the parties relating to the subject matter and supersede all prior agreements, understandings, and communications.\n\n23.2 Severability\n\nIf any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect, and the invalid provision shall be replaced with an enforceable provision that most closely reflects the original intent.\n\n23.3 Waiver\n\nNo waiver of any breach of these Terms shall constitute a waiver of any subsequent breach. No failure or delay in exercising any right shall operate as a waiver.\n\n23.4 Assignment\n\nThe Customer may not assign, transfer, or delegate their rights or obligations under these Terms without SendItHome\'s prior written consent. SendItHome may assign its rights and obligations to any affiliate, successor entity, or acquirer.\n\n23.5 Notices\n\nFormal notices to SendItHome should be sent to: Vacation Logistics, DMCC, Unit 925, DMCC Business Centre, Level 1, Jewellery & Gemplex 3, Dubai, UAE, with a copy to legal@sendithome.com.\n\nNotices to the Customer will be sent to the email address provided during registration.\n\n23.6 No Agency\n\nNothing in these Terms creates a partnership, agency, joint venture, or employment relationship between the parties.\n\n23.7 Third-Party Rights\n\nA person who is not a party to these Terms has no right to enforce any term, except that Approved Hotel Partners and Courier Partners may enforce indemnification and limitation of liability provisions as third-party beneficiaries.\n\n23.8 Language\n\nThese Terms are drafted in English. Where translations are provided, the English version prevails in the event of any conflict or ambiguity.\n\n23.9 Survival\n\nProvisions which by their nature should survive termination (including indemnification, limitation of liability, governing law, and confidentiality) shall survive termination of these Terms.',
    },
    {
      heading: '24. CONTACT INFORMATION',
      body: 'For questions, complaints, or support requests, please contact us using the following channels:\n\nVacation Logistics, DMCC\nTrading as SendItHome\nUnit 925, DMCC Business Centre, Level 1\nJewellery & Gemplex 3, Dubai, UAE\nTrade License No. DMCC 844559\n\nWebsite: sendithome.com\nGeneral Support: support@sendithome.com\nLegal Notices: legal@sendithome.com\nPrivacy & Data: privacy@sendithome.com\nDisputes: disputes@sendithome.com\nWhatsApp Support: Available via Platform\n\n— END OF TERMS AND CONDITIONS —\nEffective Date: 1 January 2026 · Version 4.0',
    },
  ];

  const privacyContent = [
    {
      heading: '1. Introduction',
      body: 'Send It Home ("SIH", "we", "us") is committed to protecting your personal data. This Privacy Policy explains what data we collect, why we collect it, how we store it, and your rights regarding your information.',
    },
    {
      heading: '2. Data We Collect',
      body: 'We collect the following personal data to provide our shipping service:\n\n• Full name (first, middle, last)\n• Nationality\n• Passport number and expiry date\n• Email address\n• Phone number and WhatsApp number\n• Home delivery address (address, city, postal code, country)\n• Hotel name, room, city, and country (during your stay)\n• Purchased item details (description, category, value, receipts)',
    },
    {
      heading: '3. Why We Collect Your Data',
      body: 'Your data is collected for the following lawful purposes:\n\n• International shipping and logistics (delivering your items home)\n• Customs clearance (generating declarations, invoices, and packing lists)\n• Identity verification (matching your passport to your shipment)\n• Order tracking and status notifications\n• Customer support and dispute resolution\n• Fraud prevention and legal compliance',
    },
    {
      heading: '4. Passport Data — Special Protection',
      body: 'Passport details are classified as sensitive personal data and are required solely for international shipping and customs clearance. They are:\n\n• Encrypted in transit and at rest\n• Accessible only to authorized personnel involved in customs processing\n• Never sold, shared with marketers, or used for advertising\n• Retained only for the duration required by customs and tax regulations, then permanently deleted',
    },
    {
      heading: '5. Data Storage & Security',
      body: 'Your data is stored on secure cloud infrastructure with industry-standard encryption (TLS 1.2+ in transit, AES-256 at rest). Access is restricted to authorized SIH personnel and logistics partners who require it to fulfill your shipment. We conduct regular security reviews to safeguard your information.',
    },
    {
      heading: '6. Data Sharing',
      body: 'We share your data only with parties necessary to complete your shipment:\n\n• Logistics partners (FedEx, DHL) — for shipping and tracking\n• Customs authorities — for clearance and declarations\n• Payment processor (Stripe) — for secure payment (we never see or store your card details)\n• Hotel concierge teams — for item collection and packaging\n\nWe never sell your data to third parties for marketing or commercial purposes.',
    },
    {
      heading: '7. Data Retention',
      body: 'We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, including any legal, accounting, or regulatory requirements. Customs-related records are retained per the laws of the origin and destination countries. Once no longer required, your data is permanently and securely deleted.',
    },
    {
      heading: '8. Your Rights',
      body: 'You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data (subject to legal retention requirements)\n• Object to or restrict certain processing of your data\n• Withdraw consent for marketing communications (if any)\n\nTo exercise any of these rights, contact us at privacy@sendithome.com.',
    },
    {
      heading: '9. Cookies & Analytics',
      body: 'Our platform uses minimal cookies and analytics to improve service quality and user experience. We do not use tracking cookies for third-party advertising.',
    },
    {
      heading: '10. International Transfers',
      body: 'As an international shipping service, your data may be transferred to and processed in countries other than your country of residence. We ensure such transfers comply with applicable data protection laws and that appropriate safeguards are in place.',
    },
    {
      heading: '11. Children\u2019s Privacy',
      body: 'Our service is not available to individuals under 18. We do not knowingly collect data from minors.',
    },
    {
      heading: '12. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. The latest version will always be available within the app. We will notify you of any significant changes that affect your rights.',
    },
    {
      heading: '13. Contact Us',
      body: 'If you have any questions about this Privacy Policy or how your data is handled, please contact us at privacy@sendithome.com.',
    },
  ];

  const content = isTerms ? termsContent : privacyContent;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 flex items-start justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-2xl h-[100dvh] sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-6 sm:px-8 sm:py-8">
              {isTerms ? (
                <div className="bg-black rounded-2xl px-6 py-12 mb-6 text-center">
                  <h1 className="text-3xl font-black mb-1">
                    <span className="text-[#2c2c2c]">Send</span>
                    <span className="text-accent">It</span>
                    <span className="text-[#2c2c2c]">Home</span>
                  </h1>
                  <p className="text-sm text-[#808080] mb-8">Convenience Delivered Seamlessly</p>
                  <h2 className="text-xl font-black uppercase text-[#2c2c2c] mb-1">Terms and Conditions</h2>
                  <p className="text-sm text-[#808080] mb-8">Global Platform Services Agreement</p>
                  <p className="text-xs text-[#2c2c2c]">Vacation Logistics DMCC</p>
                  <p className="text-xs text-[#2c2c2c]">Trading as SendItHome</p>
                  <p className="text-xs text-[#2c2c2c] mt-4">Version 4.0</p>
                  <p className="text-xs text-accent mt-1">sendithome.com</p>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-accent mb-1">Privacy Policy</h1>
                  <p className="text-sm text-muted-foreground mb-6">Last updated: June 2026</p>
                </>
              )}

              <div className="space-y-5">
                {content.map((section, idx) => (
                  <div key={idx}>
                    <h2 className="text-base font-bold text-foreground mb-1.5">{section.heading}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}