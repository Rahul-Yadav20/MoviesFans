// src/components/GenreFilter.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const GenreFilter = ({ onChange }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=2dca580c2a14b55200e784d157207b4d`
      );
      setGenres(response.data.genres);
    };

    fetchGenres();
  }, []);

  const handleChange = (selectedOptions) => {
    onChange(selectedOptions.map((option) => option.value));
  };

  const genreOptions = genres.map((genre) => ({
    value: genre.id,
    label: genre.name,
  }));

  return (
    <Select
      isMulti
      options={genreOptions}
      onChange={handleChange}
      placeholder="Filter by genres"
    />
  );
};

export default GenreFilter;
