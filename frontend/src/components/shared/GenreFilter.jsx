import { genres } from './SearchFilter';
import MobileFilterDropdown from './MobileFilterDropdown';

export default function GenreFilter({ selectedGenre, onGenreChange }) {
  const genreOptions = genres.map(genre => ({ value: genre, label: genre }));

  return (
    <div className="mb-4">
      <MobileFilterDropdown
        label={selectedGenre}
        options={genreOptions}
        value={selectedGenre}
        onChange={onGenreChange}
        className="w-full"
      />
    </div>
  );
}
