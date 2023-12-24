import StreamerModel from "../models/streamers";

export default async function UpdateStreamerQuery(
  streamer_id: number,
  data: TwitchStreamAttributes
) {
  const isDataUndefined = data === undefined;
  return await StreamerModel.findOneAndUpdate(
    { id: streamer_id },
    isDataUndefined
      ? {
          $unset: {
            title: "",
            game: "",
            viewers: "",
            thumbnail_url: "",
            started_at: "",
          },
          $set: {
            isOnline: false,
          },
        }
      : {
          $set: {
            isOnline: true,
            title: data.title,
            game: data.game_name,
            viewers: data.viewer_count,
            //thumbnail_url: data.thumbnail_url,
            started_at: new Date(data.started_at).getTime(),
          },
        }
  )
    .lean()
    .exec();
}
