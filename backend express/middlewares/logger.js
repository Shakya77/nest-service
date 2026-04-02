const fs = require("fs");

function logger(req, res, next) {
  const logMessage = `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`;

  console.log(logMessage);

  fs.appendFile("server.log", logMessage + "\n", (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });

  next();
}

module.exports = logger;
