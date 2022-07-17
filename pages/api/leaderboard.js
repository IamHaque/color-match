import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: "failed", highscores: null });
  }

  try {
    // Get all users from DB
    const users = await prisma.users.findMany({
      orderBy: [
        {
          username: "asc",
        },
      ],
    });

    // Get leaderboard data for grid size
    let leaderboard = users
      .reduce((acc, user) => {
        return user.highscore > 0
          ? [
              ...acc,
              {
                rank: 0,
                username: user.username,
                highscore: user.highscore,
              },
            ]
          : acc;
      }, [])
      .sort((a, b) => b.highscore - a.highscore);

    // Rank the leaderboard appropriately
    let currentRank = 1;
    while (currentRank <= leaderboard.length) {
      const currentUserHighscore = leaderboard[currentRank - 1].highscore;
      leaderboard = leaderboard.map((user) => {
        return user.highscore === currentUserHighscore
          ? { ...user, rank: currentRank }
          : user;
      });

      const usersWithCurrentUserScore = leaderboard.filter(
        (user) => user.highscore === currentUserHighscore
      ).length;
      currentRank += usersWithCurrentUserScore;
    }

    // Return the leaderboard data for grid size
    return res.status(200).json({ status: "success", leaderboard });
  } catch (e) {
    // Handle DB error
    return res.status(404).json({ status: "failed", message: e });
  }
}
