-- Add status column to track wishlist ("to_watch") vs viewed ("watched") items.
alter table movies add column if not exists status text not null default 'watched';

create index if not exists movies_user_status_idx on movies (user_id, status);
