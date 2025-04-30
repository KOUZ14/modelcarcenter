'use client';

import { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setCars([]);

    try {
      const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setCars(data);
      }
    } catch (err) {
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  };

  // Filtering and sorting
  let filteredCars = [...cars];

  // Sort
  if (sortOption === 'price-low') {
    filteredCars.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortOption === 'price-high') {
    filteredCars.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sortOption === 'az') {
    filteredCars.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'za') {
    filteredCars.sort((a, b) => b.title.localeCompare(a.title));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Search Model Cars</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g. Nissan GTR"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-4 py-2 flex-1 rounded"
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </div>

      {/* Filters and Sorters */}
      <div className="flex gap-4 mb-4">
        <select onChange={(e) => setSortOption(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Sort</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCars.map((car, idx) => (
          <div key={idx} className="border rounded-xl shadow p-4">
            <img src={car.image} alt={car.title} className="w-full h-48 object-cover rounded" />
            <h2 className="text-xl font-bold mt-2">{car.title}</h2>
            <p className="text-gray-700">{car.price}</p>
            <p className="text-sm text-gray-500 mb-1">{car.source}</p>
            <a href={car.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View Listing
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
