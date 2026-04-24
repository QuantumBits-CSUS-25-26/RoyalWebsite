import './Homepage.css';
import '../App.css';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
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
  const sendPayload = async (payloadObj) => {
    try {
      const response = await fetch('http://localhost:8000/api/customers/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadObj),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      return { ok: false, error: error.message };
    }
  };
    const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateAll()) {
      const p = {
        first_name: values.fname.trim(),
        last_name: values.lname.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim(),
      };

      setPayload(p);

      const res = await sendPayload(p);

      if (res.ok === false) {
        alert('Account creation failed: ' + res.error);
      } else {
        if (res.access) {
          sessionStorage.setItem('authToken', res.access);
        }
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="customer-creation">
      <div className="content">
        <Row className="justify-content-center">
          <Col md="8" sm="12">
            <Form className="customerForm fs-3 p-4" onSubmit={handleSubmit} noValidate>
              <div className="my-4"><strong>Sign Up</strong></div>
              <Row className="justify-content-center">
                {/* <Col xs={12} sm={10} md={8} lg={6}> */}
                  <FormGroup className="my-3 text-start">
                    <Label for="fname">First Name</Label>
                    <Input
                      id="fname"
                      name="fname"
                      placeholder="First Name"
                      type="text"
                      maxLength={24}
                      value={values.fname}
                      onChange={handleChange}
                      invalid={!!errors.fname}
                    />
                    {errors.fname && <div className="text-danger small">{errors.fname}</div>}
                  </FormGroup>
                  <FormGroup className="my-3 text-start">
                    <Label for="lname">Last Name</Label>
                    <Input
                      id="lname"
                      name="lname"
                      placeholder="Last Name"
                      type="text"
                      maxLength={24}
                      value={values.lname}
                      onChange={handleChange}
                      invalid={!!errors.lname}
                    />
                    {errors.lname && <div className="text-danger small">{errors.lname}</div>}
                  </FormGroup>
                  <FormGroup className="my-3 text-start">
                    <Label for="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="Email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      invalid={!!errors.email}
                    />
                    {errors.email && <div className="text-danger small">{errors.email}</div>}
                  </FormGroup>
                  <FormGroup className="my-3 text-start">
                    <Label for="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Phone Number"
                      type="text"
                      value={values.phone}
                      onChange={handleChange}
                      invalid={!!errors.phone}
                    />
                    {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                  </FormGroup>
                  <FormGroup className="my-3 text-start">
                    <Label for="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      placeholder="Password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      invalid={!!errors.password}
                    />
                    {errors.password && <div className="text-danger small">{errors.password}</div>}
                  </FormGroup>
                  <FormGroup className="my-3 text-start">
                    <Label for="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <div className="text-danger small">{errors.confirmPassword}</div>}
                  </FormGroup>
                {/* </Col> */}
              </Row>
              <Button type="submit" className="btn btn-lg my-4 py-4 px-5">
                Sign Up
              </Button>
              <div className="mt-3 mb-4" style={{ fontSize: '1rem' }}>
                <span style={{ color: '#6c757d' }}>Already have an account? </span>
                <span
                  style={{ color: '#2F6DAB', cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate('/login')}
                >
                  Log In
                </span>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CustomerCreation