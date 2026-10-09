import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const FAQS = [
  {
    question: 'How do I create an account?',
    answer: 'Click "Login" in the navigation bar, then switch to the "Register" tab and fill in your name, email, and password.',
  },
  {
    question: 'How do I place an order?',
    answer: 'Add items to your cart, go to the Cart page, click "Proceed to Checkout", fill in your shipping address, review your order, and place it. Currently, Cash on Delivery is the primary supported payment method.',
  },
  {
    question: 'Can I cancel an order after placing it?',
    answer: 'Yes, as long as the order status is still "Pending" or "Processing". Go to "My Orders" and click "Cancel Order". Orders that have already shipped cannot be cancelled through the site.',
  },
  {
    question: 'How is delivery handled?',
    answer: 'We do not have a fixed delivery timeline to publish at this time. Please contact us by phone for specific delivery questions on your order.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'Cash on Delivery is available for all orders. Other payment method options are shown at checkout where applicable.',
  },
];

const Help = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await axiosInstance.post('/contact', formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setFormErrors({});
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="help-page">
      <h2>💬 Help & Contact</h2>

      <div className="help-contact-info">
        <p><a href="tel:+919080008236">📞 9080008236</a></p>
        <p>📍 Chennai, Tamil Nadu, India</p>
      </div>

      <section className="help-faq-section">
        <h3>Frequently Asked Questions</h3>
        <div className="help-faq-list">
          {FAQS.map((faq, idx) => (
            <details key={idx} className="help-faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="help-contact-form-section">
        <h3>Send us a message</h3>

        {submitSuccess && (
          <div className="success-banner">
            Your message has been received. We'll get back to you.
          </div>
        )}
        {submitError && <p className="error-text">{submitError}</p>}

        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          <div className="form-group">
            <label htmlFor="help-name">Name</label>
            <input
              type="text"
              id="help-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="help-email">Email</label>
            <input
              type="email"
              id="help-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="help-subject">Subject</label>
            <input
              type="text"
              id="help-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={formErrors.subject ? 'input-error' : ''}
            />
            {formErrors.subject && <span className="field-error">{formErrors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="help-message">Message</label>
            <textarea
              id="help-message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              className={formErrors.message ? 'input-error' : ''}
            />
            {formErrors.message && <span className="field-error">{formErrors.message}</span>}
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Help;