const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("🔥 My laptop is now a live server!");
});

app.get("/avinash", (req, res)=>{
    res.json({
        name:'Avinash Sharma',
        course:"B-Tech",
        branch: "Information Technology",
        age:22
    })
})

app.get("/soumya", (req, res)=>{
    res.json({
        name:'Soumya Sharma',
        course:"B-Tech",
        branch: "Computer Science",
        age:20
    })
})
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});