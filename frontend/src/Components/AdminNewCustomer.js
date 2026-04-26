import React, { useState } from "react";

const nameRegex = /^[\p{L}\s\-'.]+$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultPlaceholders = {
  firstName: "e.g. John",
  lastName: "e.g. Smith",
  email: "e.g. john.smith@email.com",
  phoneNumber: "e.g. (555) 123-4567",
};

const AdminNewCustomer = ({ isOpen, onClose, onAddCustomer }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setSubmitError("");
    setSubmitting(false);
  };

  const validateFirstName = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter a first name.";
    if (!nameRegex.test(trimmed)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateLastName = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter a last name.";
    if (!nameRegex.test(trimmed)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter an email address.";
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter a phone number.";

    const cleanPhone = trimmed.replace(/[^\d+]/g, "");

    if (cleanPhone.includes("+")) {
      const plusCount = (cleanPhone.match(/\+/g) || []).length;
      if (plusCount > 1 || !cleanPhone.startsWith("+")) {
        return "Please enter a valid phone number.";
      }
    }

    if (cleanPhone.startsWith("+1") && cleanPhone.length === 12) {
      return "";
    }

    if (cleanPhone.startsWith("1") && cleanPhone.length === 11) {
      return "";
    }

    if (cleanPhone.startsWith("+")) {
      const digitsAfterPlus = cleanPhone.slice(1);
      if (digitsAfterPlus.length < 7 || digitsAfterPlus.length > 15) {
        return "Please enter a valid phone number.";
      }
      return "";
    }

    if (cleanPhone.length === 7) {
      return "Please include area code";
    }

    if (cleanPhone.length === 10) {
      return "";
    }

    return "Please enter a valid phone number.";
  };

  const validateForm = () => {
    const nextErrors = {
      firstName: validateFirstName(form.firstName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phoneNumber: validatePhoneNumber(form.phoneNumber),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitError("");

    const isValid = validateForm();
    if (!isValid) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
    };

    try {
      setSubmitting(true);

      if (onAddCustomer) {
        await onAddCustomer(payload);
      }

      resetForm();
      onClose?.();
    } catch (error) {
      setSubmitting(false);
      setSubmitError(error?.message || "Failed to add customer.");
    }
  };

  const handleMouseDown = (e) => {
    setMouseDownTarget(e.target);
  };

  const handleMouseUp = (e) => {
    if (
      e.target.className === "services-management-add-overlay" &&
      mouseDownTarget?.className === "services-management-add-overlay"
    ) {
      resetForm();
      onClose?.();
    }
    setMouseDownTarget(null);
  };

  const getPlaceholder = (field) => errors[field] || defaultPlaceholders[field];

  if (!isOpen) return null;

  return (
    <div
      className="services-management-add-overlay"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="services-management-add">
        <div className="title">Add New Customer</div>

        {submitError && (
          <div className="error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="add-service-content">
            <div className="add-service-field">
              <label htmlFor="fname">First Name *</label>
              <input
                id="fname"
                type="text"
                name="fname"
                placeholder={getPlaceholder("firstName")}
                value={form.firstName}
                onChange={handleChange("firstName")}
                aria-invalid={!!errors.firstName}
              />
            </div>

            <div className="add-service-field">
              <label htmlFor="lname">Last Name *</label>
              <input
                id="lname"
                type="text"
                name="lname"
                placeholder={getPlaceholder("lastName")}
                value={form.lastName}
                onChange={handleChange("lastName")}
                aria-invalid={!!errors.lastName}
              />
            </div>

            <div className="add-service-field">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder={getPlaceholder("phoneNumber")}
                value={form.phoneNumber}
                onChange={handleChange("phoneNumber")}
                aria-invalid={!!errors.phoneNumber}
              />
            </div>

            <div className="add-service-field">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="text"
                name="email"
                placeholder={getPlaceholder("email")}
                value={form.email}
                onChange={handleChange("email")}
                aria-invalid={!!errors.email}
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNewCustomer;