interface TwitchUserAttributes {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

interface TwitchStreamAttributes {
  /**
   * @param id - The stream ID.
   */
  id: string;
  /**
   * @param user_id - The user ID of the streamer.
   */
  user_id: string;
  /**
   * @param user_login - The user login of the streamer. Use this to construct the streamer's Twitch URL.
   */
  user_login: string;
  /**
   * @param user_name - The user name of the streamer. Same as user_login, except capitalization.
   */
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  tags_ids: string[];
  is_mature: boolean;
}
