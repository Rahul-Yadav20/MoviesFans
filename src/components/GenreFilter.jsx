// src/components/GenreFilter.js
import React from 'react';
import axios from 'axios';

const API_KEY = '2dca580c2a14b55200e784d157207b4d';

const GenreFilter = ({ selectedGenres, onChange }) => {
    const [genres, setGenres] = React.useState([]);

    React.useEffect(() => {
        const fetchGenres = async () => {
            const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
            setGenres(response.data.genres);
        };
        fetchGenres();
    }, []);

    const handleGenreChange = (e) => {
        const { value, checked } = e.target;
        onChange(value, checked);
    };

    return (
        <div className="genre-filter">
            {genres.map(genre => (
                <div key={genre.id}>
                    <input
                        type="checkbox"
                        id={`genre-${genre.id}`}
                        value={genre.id}
                        checked={selectedGenres.includes(genre.id.toString())}
                        onChange={handleGenreChange}
                    />
                    <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                </div>
            ))}
        </div>
    );
};

export default GenreFilter;
