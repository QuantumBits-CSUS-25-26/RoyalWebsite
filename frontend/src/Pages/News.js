import React from 'react';
import SideNavbar from "../Components/SideNavbar";
import Header from '../Components/Header';

const News = () => {
  return (
    <div className="news">
      <Header />
      <SideNavbar />
      <div className="title">
        News / Updates
      </div>
      <div className="content">
        Entries go in here (will be fetched from backend eventually)
      </div>
    </div>
  )
}

export default News