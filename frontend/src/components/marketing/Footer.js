import { Link } from "react-router-dom";
import { KeyRound, Phone, Mail } from "lucide-react";
import { CONTACT } from "@/data/content";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-900" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="mb-5">
              <span className="bg-white rounded-lg px-3 py-1.5 inline-flex">
                <img src="/assets/logo.png" alt="Master Key Analysis" className="h-9 w-auto" />
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Unlocking Business Intelligence. We turn complex data into clear insights and practical solutions.
            </p>
            <p className="mt-4 text-orange-400 font-display font-bold tracking-wide">Data Insights. Smart Solutions.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-5">Explore</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["/", "Home"], ["/about", "About Us"], ["/founder", "Founder"], ["/services", "Services"], ["/why-us", "Why Us"], ["/process", "Process"], ["/contact", "Contact"], ["/dashboard", "Dashboard"]].map(([to, label]) => (
                <Link key={to} to={to} className="text-white/60 hover:text-orange-400 transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-5">Contact</h4>
            <div className="space-y-3 text-sm">
              <a href={`tel:${CONTACT.phone}`} data-testid="footer-phone" className="flex items-center gap-3 text-white/70 hover:text-orange-400 transition-colors duration-200">
                <Phone className="w-4 h-4 text-orange-500" /> {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} data-testid="footer-email" className="flex items-center gap-3 text-white/70 hover:text-orange-400 transition-colors duration-200">
                <Mail className="w-4 h-4 text-orange-500" /> {CONTACT.email}
              </a>
            </div>
            <p className="mt-6 text-white/40 text-sm">Founder: Vasanth</p>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Master Key Analysis. All rights reserved.</span>
          <span className="uppercase tracking-[0.3em]">Unlock Your Data's True Potential</span>
        </div>
      </div>
    </footer>
  );
}
