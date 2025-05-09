import youtubeDl from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";

const CACHE_DIR = path.join(os.tmpdir(), "music-cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const songRequest = async (req, res) => {
  try {
    const { songURL } = req.query;
    if (!songURL) {
      return res.status(400).json({ error: "Missing songURL parameter" });
    }

    const response = await fetch(
      "http://localhost:3000/api/song/convert?spotifyURL=" + songURL
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to convert Spotify URL" });
    }

    const convertedUrl = await response.json();
    const ytUrl = convertedUrl.youtubeURL;

    const fileId = crypto.createHash("md5").update(ytUrl).digest("hex");
    const outputFile = path.join(CACHE_DIR, `${fileId}.webm`);

    if (fs.existsSync(outputFile)) {
      console.log("✅ Using cached file:", outputFile);
    } else {
      console.log("🔽 Downloading audio to temporary file...");
      const metadata = await youtubeDl(ytUrl, {
        dumpSingleJson: true,
        noWarnings: true,
        preferFreeFormats: true,
      });

      const duration = metadata.duration;
      console.log("🎵 Duration (sec):", duration);

      // Now download
      await youtubeDl(ytUrl, {
        format: "worstaudio[ext=webm]",
        output: outputFile,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
      });
      console.log("✅ Download complete:", outputFile);
    }

    const stat = fs.statSync(outputFile);
    const fileSize = stat.size;

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/webm",
      });

      const fileStream = fs.createReadStream(outputFile, { start, end });
      fileStream.pipe(res);
    } else {
      //range for seeking
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/webm",
        "Accept-Ranges": "bytes",
      });

      fs.createReadStream(outputFile).pipe(res);
    }
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const cleanupCache = () => {
  fs.readdir(CACHE_DIR, (err, files) => {
    if (err) return;

    const now = Date.now();
    files.forEach((file) => {
      const filePath = path.join(CACHE_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        // Delete files older than 24 hours
        if (now - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
};

setInterval(cleanupCache, 6 * 60 * 60 * 1000);

export { songRequest };
