import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, removeFavorite, clearRemoveStatus } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Favorites.module.css';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const removeStatus = useAppSelector(state => state.favorites.removeStatus);
  const removeError = useAppSelector(state => state.favorites.removeError);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  // generated-by-copilot: auto-clear success/error feedback after 3 seconds
  useEffect(() => {
    if (removeStatus === 'succeeded' || removeStatus === 'failed') {
      const timer = setTimeout(() => {
        dispatch(clearRemoveStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [removeStatus, dispatch]);

  // generated-by-copilot: handler to remove a book from favorites
  const handleRemove = (bookId) => {
    dispatch(removeFavorite({ token, bookId }));
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {removeStatus === 'succeeded' && (
        <div className={`${styles.feedback} ${styles.feedbackSuccess}`} role="status">
          Book removed from favorites.
        </div>
      )}
      {removeStatus === 'failed' && (
        <div className={`${styles.feedback} ${styles.feedbackError}`} role="alert">
          {removeError || 'Failed to remove book. Please try again.'}
        </div>
      )}
      {favorites.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <ul className={styles.favoritesList}>
          {favorites.map(book => (
            <li key={book.id} className={styles.favoriteItem}>
              <span>
                <strong>{book.title}</strong> by {book.author}
              </span>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(book.id)}
                disabled={removeStatus === 'loading'}
                aria-label={`Remove ${book.title} from favorites`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
