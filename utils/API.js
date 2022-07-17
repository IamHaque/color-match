export const getLeaderboardData = async (
  hostname = "http://localhost:3000"
) => {
  const requestOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  const response = await fetch(hostname + "/api/leaderboard", requestOptions);
  const data = await response.json();

  if (data && data.status && data.status === "success") {
    return [...data.leaderboard];
  }

  return [];
};

export const updateLeaderboard = async (username, score) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify({ username, score }),
    headers: { "Content-Type": "application/json" },
  };

  await fetch("/api/updateHighscore", requestOptions);
};

export const createNewUser = async (username) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify({ username }),
    headers: { "Content-Type": "application/json" },
  };

  const response = await fetch("/api/createUser", requestOptions);
  return await response.json();
};
