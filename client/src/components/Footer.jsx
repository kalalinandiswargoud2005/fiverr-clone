// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
    {
      title: 'Categories',
      links: ['Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Programming & Tech', 'AI Services', 'Consulting', 'Data', 'Business', 'Photography', 'Finance'],
    },
    {
      title: 'For Clients',
      links: ['How Fiverr Works', 'Customer Success Stories', 'Trust & Safety', 'Fiverr Learn - Online Courses', 'Fiverr Guides', 'Fiverr Answers'],
    },
    {
      title: 'For Freelancers',
      links: ['Become a Fiverr Freelancer', 'Become an Agency', 'Community Hub', 'Forum', 'Events'],
    },
    {
      title: 'Business Solutions',
      links: ['Fiverr Pro', 'Project Management Service', 'Expert Sourcing Service', 'ClearVoice - Content Marketing', 'Fiverr Logo Maker', 'Contact Sales'],
    },
    {
      title: 'Company',
      links: ['About Fiverr', 'Help & Support', 'Careers', 'Terms of Service', 'Privacy Policy', 'Partnerships', 'Affiliates', 'Invite a Friend', 'Press & News', 'Investor Relations'],
    },
];

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-6 py-12">
        {/* Top Section: Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 border-b border-gray-700 pb-10 mb-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm hover:underline hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section: Logo, Copyright, and Settings */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-white mr-4">fiverr<span className="text-fiverr-green text-3xl">.</span></Link>
            <span className="text-gray-400">© Fiverr International Ltd. {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-1 text-gray-300 hover:text-white">
              <span>English</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-300 hover:text-white">
              <span>₹ INR</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;