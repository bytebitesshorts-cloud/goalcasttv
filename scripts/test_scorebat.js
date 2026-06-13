async function run() {
  try {
    const res = await fetch('https://www.scorebat.com/video-api/v3/');
    console.log("Status:", res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log("Success! Total items:", data.response?.length);
      if (data.response && data.response.length > 0) {
        console.log("First item sample:", JSON.stringify(data.response[0], null, 2));
      }
    }
  } catch (err) {
    console.error("Error fetching ScoreBat:", err);
  }
}
run();
