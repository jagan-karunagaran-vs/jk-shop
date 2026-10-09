import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // NOTE: No backend /api/contact endpoint exists in this project's
    // scope (not part of the original file structure). This simulates
    // submission client-side only. If you want real message delivery
    // later, this needs a dedicated controller/route added.
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setFormErrors({});

    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="contact-page">
      <h2>Contact JK Shop</h2>
      <p>Have a question or need help? Send us a message and we'll get back to you.</p>

      {submitted && (
        <div className="success-banner">
          Thank you! Your message has been sent. We'll respond shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form" noValidate>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={formErrors.name ? 'input-error' : ''}
          />
          {formErrors.name && <span className="field-error">{formErrors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={formErrors.email ? 'input-error' : ''}
          />
          {formErrors.email && <span className="field-error">{formErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={formErrors.subject ? 'input-error' : ''}
          />
          {formErrors.subject && <span className="field-error">{formErrors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="6"
            value={formData.message}
            onChange={handleChange}
            className={formErrors.message ? 'input-error' : ''}
          />
          {formErrors.message && <span className="field-error">{formErrors.message}</span>}
        </div>

        <button type="submit">Send Message</button>
      </form>

      <div className="contact-info">
        <div>
          <h4>Email</h4>
          <p>support@jkshop.com</p>
        </div>
        <div>
          <h4>Phone</h4>
          <p>+91 98765 43210</p>
        </div>
        <div>
          <h4>Address</h4>
          <p>221 MG Road, Bengaluru, Karnataka 560001</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;