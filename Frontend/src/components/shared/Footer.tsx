import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-gray-900 overflow-hidden  text-gray-200 pt-10 pb-6 px-4 md:px-16 w-full">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Bite Buddy</h2>
          <p className="text-sm text-gray-400">

            Delivering your favorite meals hot and fresh, right to your doorstep. Enjoy the bite!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">Menu</a></li>
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">FAQs</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 mt-2">
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
              <Twitter size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-sm text-center text-gray-500">
        © {new Date().getFullYear()} Bite Buddy. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;
