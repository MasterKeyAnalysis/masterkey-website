import { useState } from "react";
import { FadeUp, SectionTag, LineMask } from "@/components/marketing/Reveal";
import { Phone, Mail, User, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { CONTACT, SERVICES } from "@/data/content";

const PROMPTS = [
  "Have a reporting challenge?",
  "Need a Power BI dashboard?",
  "Want to automate Excel work?",
  "Looking for PostgreSQL or database solutions?",
  "Need advanced MIS reporting?",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/enquiries", { ...form, service: form.service || null, phone: form.phone || null });
      setSent(true);
      toast.success("Enquiry sent — we'll get back to you soon.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-navy-800 border border-navy-700 px-5 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition-[border-color] duration-200 focus:border-orange-500";

  return (
    <>
      <section className="pt-40 pb-20" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp><SectionTag>Contact Us</SectionTag></FadeUp>
          <h1 className="mt-8 font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <LineMask delay={0.2}>Let's unlock your</LineMask>
            <LineMask delay={0.35} className="text-orange-500">data's true potential</LineMask>
          </h1>
          <FadeUp delay={0.5}>
            <ul className="mt-10 flex flex-wrap gap-3">
              {PROMPTS.map((p) => (
                <li key={p} className="text-xs md:text-sm text-white/60 border border-white/15 rounded-full px-4 py-2">{p}</li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-5 gap-14">
          <FadeUp className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Master Key Analysis</h2>
              <p className="mt-2 text-white/55 text-sm">Founder: Vasanth</p>
            </div>
            <a href={`tel:${CONTACT.phone}`} data-testid="contact-phone" className="flex items-center gap-4 group">
              <span className="w-12 h-12 rounded-xl bg-navy-800 border border-navy-700 grid place-items-center transition-[border-color] duration-200 group-hover:border-orange-500">
                <Phone className="w-5 h-5 text-orange-500" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.25em] text-white/40">Call us</span>
                <span className="block font-display text-xl font-bold group-hover:text-orange-400 transition-colors duration-200">{CONTACT.phone}</span>
              </span>
            </a>
            <a href={`mailto:${CONTACT.email}`} data-testid="contact-email" className="flex items-center gap-4 group">
              <span className="w-12 h-12 rounded-xl bg-navy-800 border border-navy-700 grid place-items-center transition-[border-color] duration-200 group-hover:border-orange-500">
                <Mail className="w-5 h-5 text-orange-500" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.25em] text-white/40">Email</span>
                <span className="block font-display text-xl font-bold group-hover:text-orange-400 transition-colors duration-200 break-all">{CONTACT.email}</span>
              </span>
            </a>
            <p className="text-orange-400 font-display font-bold text-lg">Partner with Master Key Analysis today.</p>
          </FadeUp>

          <FadeUp delay={0.15} className="lg:col-span-3">
            {sent ? (
              <div className="rounded-3xl bg-navy-800 border border-navy-700 p-14 text-center" data-testid="enquiry-success">
                <CheckCircle2 className="w-14 h-14 text-orange-500 mx-auto mb-6" strokeWidth={1.5} />
                <h2 className="font-display text-3xl font-bold tracking-tight">Thank you, {form.name.split(" ")[0]}.</h2>
                <p className="mt-4 text-white/60">Your enquiry has been received. We'll reach out shortly.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", service: "", message: "" }); }}
                  className="mt-8 text-orange-400 font-semibold text-sm underline underline-offset-4"
                  data-testid="send-another-button"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl bg-navy-800 border border-navy-700 p-8 md:p-12 space-y-5" data-testid="enquiry-form">
                <div className="grid md:grid-cols-2 gap-5">
                  <input required value={form.name} onChange={set("name")} placeholder="Your name" className={inputCls} data-testid="enquiry-name-input" />
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="Email address" className={inputCls} data-testid="enquiry-email-input" />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <input value={form.phone} onChange={set("phone")} placeholder="Phone (optional)" className={inputCls} data-testid="enquiry-phone-input" />
                  <select value={form.service} onChange={set("service")} className={inputCls} data-testid="enquiry-service-select">
                    <option value="">Which service interests you?</option>
                    {SERVICES.map((s) => (
                      <option key={s.title} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <textarea required rows={5} value={form.message} onChange={set("message")} placeholder="Tell us about your challenge..." className={inputCls} data-testid="enquiry-message-input" />
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="enquiry-submit-button"
                  className="group inline-flex items-center gap-3 px-9 py-4 rounded-full bg-orange-500 text-navy-900 font-bold transition-[background-color,transform] duration-200 hover:bg-orange-400 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            )}
          </FadeUp>
        </div>
      </section>
    </>
  );
}
