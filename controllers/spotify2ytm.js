export const spotify2ytm = async (req, res) => {
  const { spotifyURL } = req.query;
  const response = await fetch(
    `https://cors-anywhere.herokuapp.com/https://ytm2spotify.com/convert?url=${spotifyURL}&to_service=youtube_ytm`,
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  const youtubeURL = await response.json();

  return res.status(200).json({
    message: "success",
    youtubeURL: youtubeURL.results[0].url,
  });
};
