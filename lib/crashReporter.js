process.on("unhandledRejection", (reason, p) => {
  console.log("unhandledRejection at Promise", p, reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("uncaughtException at Promise", err);
  process.exit(1);
});
