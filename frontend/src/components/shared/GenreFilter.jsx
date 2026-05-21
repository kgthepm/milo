import { genres } from './SearchFilter';
import MobileFilterDropdown from './MobileFilterDropdown';

export default function GenreFilter({ selectedGenre, onGenreChange }) {
  const genreOptions = genres.map(genre => ({ value: genre, label: genre }));

  return (
    <div className="glass rounded-xl p-2 sm:p-3 mb-4">
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
