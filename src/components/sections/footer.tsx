"use client";

import React, { useState } from 'react';
import { Instagram, Youtube, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

const footerLinkColumnsData = [
  {
    title: 'NEW ARRIVALS',
    links: [
      { text: 'Shop All New', href: '/women/new-arrivals' },
      { text: 'The Sweater Shop', href: '/collections/sweater-shop' },
      { text: 'Holiday Edit', href: '/collections/holiday-edit' },
      { text: 'Gift Guide', href: '/collections/gift-guide' }
    ],
  },
  {
    title: 'CLOTHING',
    links: [
      { text: 'Sweaters', href: '/women/sweaters' },
      { text: 'Tees & Tops', href: '/women/tees-tops' },
      { text: 'Pants', href: '/women/pants' },
      { text: 'Denim', href: '/women/denim' },
      { text: 'Dresses & Skirts', href: '/women/dresses' },
      { text: 'Outerwear', href: '/women/outerwear' },
      { text: 'Activewear', href: '/women/activewear' }
    ],
  },
  {
    title: 'SHOES & ACCESSORIES',
    links: [
      { text: 'Shoes', href: '/women/shoes' },
      { text: 'Bags', href: '/women/bags' },
      { text: 'Accessories', href: '/women/accessories' },
      { text: 'Socks & Underwear', href: '/women/socks-underwear' }
    ],
  },
  {
    title: 'COLLECTIONS',
    links: [
      { text: 'Cashmere Shop', href: '/women/cashmere' },
      { text: 'Best Sellers', href: '/women/best-sellers' },
      { text: 'Sale', href: '/women/sale' }
    ],
  },
];

const connectLinks = [
  { text: 'Instagram', Icon: Instagram, href: 'https://instagram.com/everlane' },
  { text: 'TikTok', Icon: TikTokIcon, href: 'https://tiktok.com/@everlane' },
  { text: 'YouTube', Icon: Youtube, href: 'https://youtube.com/everlane' },
  { text: 'Pinterest', Icon: PinterestIcon, href: 'https://pinterest.com/everlane' },
  { text: 'Affiliates', href: '/affiliates' },
  { text: 'Our Stores', href: '/stores' },
];

const companyLinks = [
  { text: 'About', href: '/about' },
  { text: 'Environmental Initiatives', href: '/sustainability' },
  { text: 'Factories', href: '/factories' },
  { text: 'DEI', href: '/dei' },
  { text: 'Careers', href: '/careers' },
  { text: 'International', href: '/international' },
  { text: 'Accessibility', href: '/accessibility' }
];

const helpLinks = [
  { text: 'Help Center', href: '/help' },
  { text: 'Return Policy', href: '/returns' },
  { text: 'Shipping Info', href: '/shipping' },
  { text: 'Bulk Orders', href: '/bulk-orders' }
];

const accountLinks = [
  { text: 'Manage Account', href: '/account' },
  { text: 'Sign Up', href: '/account/register' },
  { text: 'Redeem a Gift Card', href: '/account/gift-card' }
];

const designerLinks = [
  { text: 'Browse Designers', href: '/designers' },
  { text: 'Become a Designer', href: '/designers/apply' },
  { text: 'Designer Login', href: '/designers/login' }
];

const legalLinks = [
  { text: 'Privacy Policy', href: '/privacy' },
  { text: 'Terms of Service', href: '/terms' },
  { text: 'Cookies Settings', href: '#' },
  { text: 'CA Supply Chain Transparency', href: '/supply-chain' },
  { text: 'Vendor Code of Conduct', href: '/vendor-code' },
];

const LinkColumn = ({ title, links, index }: { title: string; links: Array<{ text: string; href: string }>, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="text-[13px] uppercase tracking-[0.05em] font-medium"
  >
    <h3 className="mb-4">{title}</h3>
    <ul className="space-y-3 font-normal">
      {links.map((link, linkIndex) => (
        <motion.li
          key={link.text}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: (index * 0.1) + (linkIndex * 0.05) }}
        >
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={link.href} className="hover:underline inline-block">
              {link.text}
            </Link>
          </motion.div>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

const ConnectColumn = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="text-[13px] uppercase tracking-[0.05em] font-medium"
  >
    <h3 className="mb-4">CONNECT</h3>
    <ul className="space-y-3 font-normal">
      {connectLinks.map(({ text, Icon, href }, linkIndex) => (
        <motion.li
          key={text}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: (index * 0.1) + (linkIndex * 0.05) }}
        >
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-2 hover:underline"
            >
              {Icon && (
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
              )}
              <span>{text}</span>
            </Link>
          </motion.div>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.code === 'SUBSCRIPTION_SUCCESS') {
          // Successfully saved to database
          console.log('Email subscription saved to database:', {
            subscriptionId: data.subscriptionId,
            email: email,
            discountCode: data.discountCode
          });
          setIsSuccess(true);
          setSuccessMessage(data.message || 'Successfully subscribed! Your email has been saved.');
          toast.success(data.message || 'Successfully subscribed! Your email has been saved.');
          if (data.discountCode) {
            toast.info(`Your discount code: ${data.discountCode}`, {
              duration: 10000,
            });
          }
          // Reset success message after 5 seconds
          setTimeout(() => {
            setIsSuccess(false);
            setSuccessMessage('');
          }, 5000);
        } else if (data.code === 'ALREADY_SUBSCRIBED') {
          setIsSuccess(true);
          setSuccessMessage(data.message || 'You are already subscribed!');
          toast.info(data.message || 'You are already subscribed!');
          if (data.discountCode) {
            toast.info(`Your discount code: ${data.discountCode}`, {
              duration: 10000,
            });
          }
          setTimeout(() => {
            setIsSuccess(false);
            setSuccessMessage('');
          }, 5000);
        } else if (data.code === 'RESUBSCRIBED') {
          // Successfully updated in database
          console.log('Email subscription reactivated in database:', email);
          setIsSuccess(true);
          setSuccessMessage(data.message || 'Welcome back! You have been resubscribed.');
          toast.success(data.message || 'Welcome back! You have been resubscribed.');
          if (data.discountCode) {
            toast.info(`Your discount code: ${data.discountCode}`, {
              duration: 10000,
            });
          }
          setTimeout(() => {
            setIsSuccess(false);
            setSuccessMessage('');
          }, 5000);
        }
        setEmail('');
      } else {
        // Handle error responses
        if (data.code === 'INVALID_EMAIL') {
          toast.error('Please enter a valid email address');
        } else if (data.code === 'MISSING_EMAIL') {
          toast.error('Email is required');
        } else if (data.code === 'DATABASE_ERROR') {
          toast.error('Failed to save subscription. Please try again later.');
          console.error('Database error:', data.error);
        } else {
          toast.error(data.error || 'Failed to subscribe. Please try again.');
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white text-[#333333] font-sans"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-12 gap-x-8 mb-12 md:mb-16">
          {/* Left Side - Navigation Columns */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {footerLinkColumnsData.map((col, index) => (
              <LinkColumn key={col.title} {...col} index={index} />
            ))}
          </div>

          {/* Right Side - Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-base font-normal normal-case tracking-normal mb-4"
            >
              Sign up to receive 20% off your first order
            </motion.h3>
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              onSubmit={handleSubmit}
              className="bg-white border border-border rounded-lg p-4 sm:p-6"
            >
              <div className="space-y-4">
                {/* Success Message */}
                <AnimatePresence>
                  {isSuccess && successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          {successMessage}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Thank you for subscribing! Check your email for your discount code.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label htmlFor="footer-email" className="block text-sm font-bold text-primary-text mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      type="email"
                      id="footer-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Clear success message when user starts typing
                        if (isSuccess) {
                          setIsSuccess(false);
                          setSuccessMessage('');
                        }
                      }}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading || isSuccess}
                      className="flex-1 bg-white border border-[#d4d4d4] rounded-[2px] py-3 px-4 placeholder:text-tertiary-text placeholder:text-sm focus:ring-1 focus:ring-black focus:border-black outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      aria-label="Subscribe to newsletter"
                      disabled={isLoading || isSuccess}
                      className="bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[2px] hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px] sm:min-w-[120px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span className="hidden sm:inline text-sm">Subscribing...</span>
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle size={16} />
                          <span className="hidden sm:inline text-sm">Subscribed!</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium">Subscribe</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="text-xs text-secondary-text normal-case tracking-normal font-light"
                >
                  By providing your email, you agree to receive marketing emails and accept our{' '}
                  <Link href="/privacy" className="underline hover:text-primary-text">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" className="underline hover:text-primary-text">
                    Terms
                  </Link>.
                </motion.p>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Secondary Footer Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12 md:mb-16 pb-12 md:pb-16 border-b border-border">
          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[13px] uppercase tracking-[0.05em] font-medium"
          >
            <h3 className="mb-4">COMPANY</h3>
            <ul className="space-y-3 font-normal">
              {companyLinks.map((link, index) => (
                <motion.li
                  key={link.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={link.href} className="hover:underline inline-block">
                      {link.text}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Get Help Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[13px] uppercase tracking-[0.05em] font-medium"
          >
            <h3 className="mb-4">GET HELP</h3>
            <ul className="space-y-3 font-normal">
              {helpLinks.map((link, index) => (
                <motion.li
                  key={link.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={link.href} className="hover:underline inline-block">
                      {link.text}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Account Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-[13px] uppercase tracking-[0.05em] font-medium"
          >
            <h3 className="mb-4">ACCOUNT</h3>
            <ul className="space-y-3 font-normal">
              {accountLinks.map((link, index) => (
                <motion.li
                  key={link.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={link.href} className="hover:underline inline-block">
                      {link.text}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Designers & Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-[13px] uppercase tracking-[0.05em] font-medium mb-8"
            >
              <h3 className="mb-4">DESIGNERS</h3>
              <ul className="space-y-3 font-normal">
                {designerLinks.map((link, index) => (
                  <motion.li
                    key={link.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link href={link.href} className="hover:underline inline-block">
                        {link.text}
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <ConnectColumn index={4} />
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 text-[11px] text-secondary-text uppercase tracking-wider"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <button className="hover:underline">US/USD</button>
          </motion.div>
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-x-4 gap-y-2">
            {legalLinks.map((link, index) => (
              <motion.div
                key={link.text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 + (index * 0.05) }}
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={link.href} className="hover:underline inline-block">
                    {link.text}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              © 2025 ALL RIGHTS RESERVED
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}