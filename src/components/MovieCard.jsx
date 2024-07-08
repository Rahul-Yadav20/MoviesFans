import React from 'react';
// Import CSS for MovieCard
import '../css/MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      {/* Using Basics of images from API */}
      <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
      <div className="movie-info">
        {/* Title */}
        <h3>{movie.title}</h3>
        <div className="movie-overview">
          {/* Overview */}
          <h3>Overview</h3>
          <p>{movie.overview ? movie.overview:"No Overview is aviable for this movie"}</p>
        </div>
        {/* Genres of Movie */}
        <p><strong>Genres:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
        {/* Cast */}
        <p><strong>Cast:</strong> {movie.cast.join(', ')}</p>
        {/* Director */}
        <p><strong>Director:</strong> {movie.director}</p>
      </div>
    </div>
  );
};

export default MovieCard;
