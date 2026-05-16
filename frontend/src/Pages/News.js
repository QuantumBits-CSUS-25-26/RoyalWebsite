import imageHoliday from './PlaceHolderNewsImages/Holiday.jpg';
import imageLift from './PlaceHolderNewsImages/Lift.jpg';
import React from 'react';
import './News.css';
import { API_BASE_URL } from '../config';


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
  const [fbPosts, setFbPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/facebook-posts/`)
      .then(res => res.json())
      .then(data => {
        setFbPosts(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load Facebook posts');
        setLoading(false);
      });
  }, []);

  return (
    <div className="news">
      <div className="newsTitle" style={{ color: 'white' }}>
        News / Updates
      </div>
      <main className="news-list" aria-live="polite">
        {loading && <div>Loading Facebook posts...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {/* Facebook posts */}
        {fbPosts.map(post => (
          <article className="news-item" key={post.id}>
            <div className="news-row">
              <div className="news-date">
                {post.created_time && new Date(post.created_time).toLocaleDateString()}
              </div>
              <h3 className="news-title">Facebook Post</h3>
            </div>
            <div className="news-text">
              <p>{post.message || 'No content'}</p>
            </div>
            {post.full_picture && (
              <div className="news-image">
                <img src={post.full_picture} alt="Facebook post" />
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}

export default News