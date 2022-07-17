export const getLeaderboardData = async (hostname) => {
  try {
    const URL = hostname ? hostname + "/api/leaderboard" : "/api/leaderboard";

    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch(URL, requestOptions);
    const data = await response.json();

    if (data && data.status && data.status === "success") {
      return [...data.leaderboard];
    }

    return [];
  } catch (e) {
    return [];
  }
};

export const updateLeaderboard = async (username, score) => {
  try {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ username, score }),
      headers: { "Content-Type": "application/json" },
    };

    await fetch("/api/updateHighscore", requestOptions);
  } catch (e) {
    return;
  }
};

export const createNewUser = async (username) => {
  try {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch("/api/createUser", requestOptions);
    return await response.json();
  } catch (e) {
    return { status: "failed", message: "Unknown error occurred" };
  }
};
