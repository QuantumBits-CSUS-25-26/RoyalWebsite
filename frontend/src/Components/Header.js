import React from 'react'
import { useNavigate } from 'react-router-dom';

const Header = () => {

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  }

  return (
    <div className ="Header">
      <button className='Header-logo-button' onClick={handleLogoClick} aria-label='go to homepage' />
      <h1>Royal Auto & Body Repair</h1>
    </div>
  )
}

export default Header