# 🎧 Spotify Playlist Organizer

A personal web app for browsing, filtering, and organizing your saved Spotify tracks.  
Built with **Angular**, **Angular Material**, and the **Spotify Web API**.

---

## ✨ Features

- 🔄 Load and cache your saved Spotify tracks
- 🧩 Filter tracks by **Decade** and **Genre** using a dynamic sidebar
- 📄 Paginated track list with cover images and artist names
- 🎵 Generate Spotify playlists from filtered tracks with one click
- 💾 Data caching with `localStorage` to reduce API usage
- 🎨 Clean **Material Design** UI with dark theme

---

## 🛠 Tech Stack

- **Angular** standalone components
- **Angular Material** for UI
- **Spotify Web API** (User saved tracks, Playlist creation)
- **Last.fm API** for missing genre tags
- **RxJS** for reactive data flow

---

## 🚀 Setup & Usage

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/spotify-playlist-organizer.git
   cd spotify-playlist-organizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Provide your Spotify API credentials**  
   *(Make sure to configure authentication & tokens)*

4. **Run the app**

   ```bash
   ng serve
   ```

---

## 🗒 Planned Features

- 📝 Playlist editing (remove/add tracks)
- 🔍 Smart genre grouping & presets
- 💽 Support for user playlists (not just saved tracks)
