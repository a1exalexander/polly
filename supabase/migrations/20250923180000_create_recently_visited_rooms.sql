-- Create RecentlyVisitedRooms table to persist recently visited rooms even after exit/sign out
create table if not exists "public"."RecentlyVisitedRooms" (
  id bigserial primary key,
  public_user_id bigint not null references "Users"(id) on delete cascade,
  room_id bigint not null references "Rooms"(id) on delete cascade,
  last_visited_at timestamptz not null default now(),
  unique(public_user_id, room_id)
);

create index if not exists "idx_recently_visited_rooms_user" on "public"."RecentlyVisitedRooms" (public_user_id, last_visited_at desc);
