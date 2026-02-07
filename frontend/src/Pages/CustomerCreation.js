import '../App.css';
import { useNavigate } from 'react-router-dom';

const CustomerCreation = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="customer-creation">
      <div className="content">
        Account Creation
        <div className="form">
          <div className="entries">
            First Name<br />
              <input 
                type="text" 
                name="fname"
                placeholder="First Name"
              />
              <br />
            Email<br />
              <input
                type="text"
                name="email"
                placeholder="Email"
              />
              <br />
              Password<br />
              <input
                type="password"
                name="password"
                placeholder="Password"
              />
              <br />
              </div>
            <div className="entries">
              Last Name<br />
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
              />
              <br />
              Phone Number<br />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
              />
              <br />
              Confirm Password<br />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
              />
              <br />
            </div>
        </div>
        <br/>
        <button
         type="submit"
         onClick={handleClick}>
          Create Account
        </button>
      </div>
    </div>
  )
}

export default CustomerCreation