import React from 'react'
import AccountSvg from './NavbarAssets/AccountButton.svg';
import HomeSvg from './NavbarAssets/HomeButton.svg';
import AppointmentSvg from './NavbarAssets/AppointmentButton.svg';
import ServicesSvg from './NavbarAssets/ServicesButton.svg';
import NewsSvg from './NavbarAssets/NewsButton.svg';

const Navbar = () => {
  return (
    <div className ="Navbar">
        <div class ="btn-group">
          <button>
            <img src={AccountSvg} alt="AccountImage" style={{ height:30, width:30}}/>
            Account
          </button>
          <button>
            <img src={HomeSvg} alt="HomeImage" style={{ height:30, width:30}}/>
            Home
          </button>
          <button>
            <img src={AppointmentSvg} alt="AppointmentImage" style={{ height:30, width:30}}/>
            Schedule
          </button>
          <button>
            <img src={ServicesSvg} alt="ServicesImage" style={{ height:30, width:30}}/>
            Services
          </button>
          <button>
            <img src={NewsSvg} alt="NewsImage" style={{ height:30, width:30}}/>
            News
          </button>
        </div>
    </div>
  )
}

export default Navbar