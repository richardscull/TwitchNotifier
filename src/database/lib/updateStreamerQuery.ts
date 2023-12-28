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
            startedAt: "",
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
            startedAt: new Date(data.started_at).getTime(),
          },
          $max: {
            viewers: data.viewer_count,
          },
        }
  )
    .lean()
    .exec();
}
