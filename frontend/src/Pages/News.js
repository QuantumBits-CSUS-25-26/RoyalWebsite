import React from 'react';
import SideNavbar from "../Components/SideNavbar";
import Header from '../Components/Header';
import imageHoliday from './PlaceHolderNewsImages/Holiday.jpg';
import imageLift from './PlaceHolderNewsImages/Lift.jpg';
import './News.css';

const sampleEntries = [
  {
    id: 1,
    date: { month: "Nov", day: 10, year: 2025 },
    title: "Holiday Hours & Specials",
    text: "We will be open limited hours over the holidays. Book early to secure your appointment and ask about our holiday oil change special.",
    image: imageHoliday
  },
  {
    id: 2,
    date: { month: "Oct", day: 6, year: 2025 },
    title: "New Lift Installed",
    text: "We installed a new two-post lift to speed up service times and better accommodate SUVs and light trucks.",
    image: imageLift
  }
];

const NewsItem = ({ entry }) => {
  const { date, title, text, image } = entry;
  return (
    <article className="news-item" aria-labelledby={`news-title-${entry.id}`}>
      {image && (
        <div className="news-image">
          <img src={image} alt={title} />
        </div>
      )}

      <div className="news-row">
        <div className="news-date" aria-hidden="false">
          <span className="news-date-month">{date.month}</span>
          <span className="news-date-day"> {date.day},</span>
          <span className="news-date-year"> {date.year}</span>
        </div>

        <h3 id={`news-title-${entry.id}`} className="news-title">{title}</h3>
      </div>

      <div className="news-text">
        <p>{text}</p>
      </div>
    </article>
  );
};

const News = () => {
  return (
    <div className="news">
      <Header />
      <SideNavbar />
      <div className="title">
        News / Updates
      </div>
      <main className="news-list" aria-live="polite">
        {sampleEntries.map(entry => <NewsItem key={entry.id} entry={entry} />)}
      </main>
    </div>
  )
}

export default News