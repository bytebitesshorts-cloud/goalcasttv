async function run() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
    console.log("Status:", res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log("Success! Events count:", data.events?.length);
      if (data.events && data.events.length > 0) {
        const firstEvent = data.events[0];
        console.log("Match title:", firstEvent.name);
        console.log("Status:", firstEvent.status?.type?.detail);
        
        // Competitors
        const competitors = firstEvent.competitions?.[0]?.competitors || [];
        for (const team of competitors) {
          console.log(`Team: ${team.team?.displayName}, Score: ${team.score}, Logo: ${team.team?.logo}`);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching ESPN:", err);
  }
}
run();
