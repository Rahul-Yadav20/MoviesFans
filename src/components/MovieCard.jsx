// src/components/MovieCard.js
import React from 'react';
import '../css/MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="movie-overview">
          <h3>Overview</h3>
          <p>{movie.overview}</p>
        </div>
        <p>Genres: {movie.genres.map(genre => genre.name).join(', ')}</p>
        <p>Cast: {movie.cast.join(', ')}</p>
        <p>Director: {movie.director}</p>
      </div>
    </div>
  );
};

export default MovieCard;
