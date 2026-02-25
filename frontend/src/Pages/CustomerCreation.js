import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-.()]{7,15}$/;

const CustomerCreation = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [payload, setPayload] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'fname':
      case 'lname':
        if (!value) return 'Required';
        if (value.length > 24) return 'Maximum 24 characters';
        return '';
      case 'email':
        if (!value) return 'Required';
        if (!EMAIL_RE.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 24) return 'Password must be at most 24 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Required';
        if (value !== values.password) return 'Passwords do not match';
        return '';
      case 'phone':
        if (!value) return 'Required';
        if (!PHONE_RE.test(value)) return 'Invalid phone number';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const next = {};
    Object.keys(values).forEach((k) => {
      next[k] = validateField(k, values[k]);
    });
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      // build payload that can be sent to a backend/database
      const p = {
        first_name: values.fname.trim(),
        last_name: values.lname.trim(),
        email: values.email.trim(),
        password: values.password, 
        phone: values.phone.trim(),
        createdAt: new Date().toISOString(),
      };
      setPayload(p);
      console.log('Account payload ready:', p);

      // placeholder send function - replace URL and uncomment to send
      const sendPayload = async (payloadObj) => {
        console.log('sendPayload placeholder:', payloadObj);
        return Promise.resolve({ ok: true });
      };

      sendPayload(p).then((res) => console.log('sendPayload result:', res));
      navigate('/dashboard');
    }
  }
  return (
    <div className="customer-creation">
      <div className="content">
        Account Creation
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="entries">
            First Name <br/>
              <input 
                type="text" 
                name="fname"
                placeholder="First Name"
                 maxLength={24}
                value={values.fname}
                onChange={handleChange}
              />
              <br/>
              {errors.fname && <div className="error">{errors.fname}</div>}
           Email <br/>
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={values.email}
                onChange={handleChange}
              />
              <br/>
              {errors.email && <div className="error">{errors.email}</div>}
              Password <br/>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
              />
                <br/>
              {errors.password && <div className="error">{errors.password}</div>}
              </div>
            <div className="entries">
              Last Name <br/>
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
                value={values.lname}
                onChange={handleChange}
              />
                <br/>
              {errors.lname && <div className="error">{errors.lname}</div>}
              Phone Number <br/>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={values.phone}
                onChange={handleChange}
              />
                <br/>
              {errors.phone && <div className="error">{errors.phone}</div>}
              Confirm Password <br/>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChange={handleChange}
              />
                  <br/>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
            </div>
            <div style={{ clear: 'both' }} />
            <br/>
            <button type="submit"> Create Account </button>
          </form>
        </div>
      </div>
  )
}

export default CustomerCreation