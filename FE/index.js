const clientIo = io("http://localhost:3001/", {
  auth: { authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTNjZjUxNWQwY2RlYmIzZmVlMDI2ZiIsImp0aSI6IlFONC13QzNUQk53ZVR3MmMwUjZ6NiIsImlhdCI6MTc2Mjk4ODkwNCwiZXhwIjoxNzYyOTkyNTA0fQ.1U8kYdsVPPx6yeyGu8sTOdu12PZTpnHK71Gz5cHqa2w" },
});

clientIo.on("connection_id", (id) => {
  console.log("Connected to SocketIO Server Successfully 🚀");
  console.log(`id: ${id}`);
});

clientIo.on("productStock", (data) => {
  console.log({ data });
});

clientIo.on("connect_error", (error) => {
  console.log(`connection error ❌: ${error.message}`);
});
