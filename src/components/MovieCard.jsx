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
          <p>{movie.overview ? movie.overview:"No Overview is aviable for this movie"}</p>
        </div>
        <p><strong>Genres:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
        <p><strong>Cast:</strong> {movie.cast.join(', ')}</p>
        <p><strong>Director:</strong> {movie.director}</p>
      </div>
    </div>
  );
};

export default MovieCard;
