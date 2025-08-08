
async function getPlayerProfile(playerIGN) {
  const url = `https://stats.pika-network.net/api/profile/${encodeURIComponent(playerIGN)}`;

  try {
    const response = await fetch(url);

    if (response.status === 400) {
      return { data: null, error: 'not_found_in_database' };
    }

    if (response.status === 404) {
      return { data: null, error: 'invalid_endpoint' };
    }

    const data = await response.json();
    return { data, error: null };

  } catch (err) {
    console.error("❌ Error fetching player data:", err);
    return { data: null, error: 'fetch_failed' };
  }
}

module.exports = getPlayerProfile;
