export function replaceForNotification(
  text: string,
  live_emoji: string,
  streamer: string,
  game: string,
  title: string,
  url: string
) {
  return text
    .replace("%live_emoji%", live_emoji)
    .replace("%streamer%", streamer)
    .replace("%url%", url)
    .replace("%title%", title)
    .replace("%game%", game);
}
