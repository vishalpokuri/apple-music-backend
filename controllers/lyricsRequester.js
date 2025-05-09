export const lyricsRequester = async (req, res) => {
  const { searchQuery, songDuration } = req.query;
  const response = await fetch("https://lrclib.net/api/search?q" + searchQuery);
  const data = await response.json();
  try {
    const lyrics = filterLyrics(data, songDuration)[0];
    return res.status(200).json({
      message: "Success",
      lyrics,
    });
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

function filterLyrics(lyricsArray, songDuration) {
  ```
  //create a function to get filter lyrics based on the parameters 
  1. Duration
  2. Song title + artist name
  3. Synced
  ```;

  return lyricsArray.filter((item) => {
    const matchesDuration = item.duration - songDuration <= 2 ? true : false;
    const syncedavailable = item.syncedLyrics != null ? true : false;
    return matchesDuration && syncedavailable;
  });
}
