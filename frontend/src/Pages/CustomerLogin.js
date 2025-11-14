import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import Header from '../Components/Header';
import InfoBar from '../Components/InfoBar';
import './Homepage.css';
import '../App.css';


const CustomerLogin = () => {
  return (
    <div className="customerLogin">
      <InfoBar />
      <Header />
      <SideNavbar />
      <div className="title">
        Login
      </div>
      <div className="content">
        stuff goes here
      </div>
    </div>
  );
}

export default CustomerLogin;