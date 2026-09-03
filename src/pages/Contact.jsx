/**
 * Contact.jsx
 * ---------------------------------------------------------------------
 * Contact Us page — simple form (name, email, message) plus contact
 * details and social links, matching the mockup.
 * ---------------------------------------------------------------------
 */
import { useState } from "react";
import { Phone, Mail, MapPin, Send, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send to your backend / email service
    console.log("Contact form:", form);
    setSent(true);
  };

  return (
    <div className="bg-rq-bg text-rq-text min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-rq-red text-xs font-semibold mb-2">CONTACT US</p>
          <h1 className="text-2xl font-bold mb-3">We're here to help you!</h1>
          <p className="text-sm text-rq-muted mb-8 max-w-sm">
            Have a question about donating, volunteering, or partnering
            with a hospital? Reach out and our team will get back to you.
          </p>

          <div className="space-y-4 text-sm mb-8">
            <p className="flex items-center gap-3"><Phone size={16} className="text-rq-red" /> +91 121-12310</p>
            <p className="flex items-center gap-3"><Mail size={16} className="text-rq-red" /> hello@resqnet.org</p>
            <p className="flex items-center gap-3"><MapPin size={16} className="text-rq-red" /> ResQNet Foundation, New Delhi, India</p>
          </div>

          <p className="text-xs text-rq-muted mb-3">Follow Us</p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full border border-rq-border flex items-center justify-center hover:border-rq-red hover:text-rq-red">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-rq-panel border border-rq-border rounded-xl p-8">
          {sent ? (
            <div className="text-center py-10">
              <p className="text-rq-red font-semibold mb-2">Message sent!</p>
              <p className="text-sm text-rq-muted">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Your Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
              <div>
                <label className="text-xs text-rq-muted mb-1 block">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Type your message..."
                  className="w-full bg-rq-bg border border-rq-border rounded-lg px-4 py-3 text-sm outline-none focus:border-rq-red resize-none"
                />
              </div>
              <Button type="submit" icon={Send} className="w-full">Send Message</Button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-rq-muted mb-1 block">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-rq-bg border border-rq-border rounded-lg px-4 py-3 text-sm outline-none focus:border-rq-red"
      />
    </div>
  );
}
