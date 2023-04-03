const express = require("express");
const bcypt = require("bcrypt");
const connection = require("../db/db");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");

const app = express();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const secrets = require("../secrets.js");

const authRouter = express.Router();

app.use(requestIp.mw());

authRouter.post("/signup", async (req, res) => {
  //   console.log("req", req);
  //   console.log("req.body", req.body);
  let { name, number, password, role } = req.body;
  if (!name || !number || !password || !role) {
    return res.status(404).json({
      message: "Please enter all the fields",
    });
  }
  password = await bcypt.hash(password, 10);
  // console.log("password", password);
  connection.query(
    "insert into users (name, number, password, role) values (?,?,?,?)",
    [name, number, password, role],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          error: err.message,
        });
      } else {
        res.status(200).json({
          message: "User created successfully",
          name,
          number,
          role,
        });
      }
    }
  );
});

// THis is setting in different table

authRouter.post("/login", async (req, res) => {
  let { number, password } = req.body;
  if (!number || !password) {
    return res.status(404).json({
      message: "Please enter all the fields",
    });
  }
  connection.query(
    "select * from users where number = ?",
    [number],
    async (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          error: err.message,
        });
      } else {
        if (result.length > 0) {
          const ans = await bcypt.compare(password, result[0].password);
          if (ans) {
            delete result[0].password;
            const token = await jwt.sign({ ...result[0] }, secrets.JWT_KEY, {
              expiresIn: "72h",
            });
            res.status(200).json({
              message: "Login successful",
              token,
              user: result[0],
            });
            // Save token in database and send it to client, also save data in other columns like timestamp, ip address, etc.
            // connection.query(
            //   "insert into userslogin id = ?  , logintime = ? where id = select id from users where number = ?",
            //   [result[0].id, Date.now(), number],
            //   (err, result) => {
            //     if (err) {
            //       console.log("Error -> ", err);
            //       res.json({
            //         message: err.message,
            //       });
            //     } else {
            //       res.json({
            //         message: "token saved , and login successful",
            //         token,
            //         user: result[0],
            //       });
            //     }
            //   }
            // );
          } else {
            res.status(402).json({
              message: "Invalid credentials",
            });
          }
        } else {
          res.status(401).json({
            message: "User not found",
          });
        }
      }
    }
  );
});

// authRouter.post("/check-in", authMiddleware, async (req, res) => {
//   // const ip = "122.162.146.122";
//   const ip = req.clientIp;
//   console.log("ip", ip);
//   const geo = geoip.lookup(ip);
//   console.log("geo", geo);
//   const location = geo
    // ? `${geo.city} , ${geo.region} , ${geo.city}`
//     : "Unknown";
//   console.log("location", location);
//   let { id } = req.body;
//   // var d = new Date(Date.now());
//   // d.toString();
//   let currentDate = new Date().toJSON().slice(0, 10);
//   // console.log("req.body", req.body.id);
//   // console.log("id", id);
//   connection.query(
//     "insert into userslogin (id, logintime , location) values (?,?,?)",
//     [id, currentDate, location],
//     (err, result) => {
//       if (err) {
//         console.log("Error -> ", err);
//         res.json({
//           message: err.message,
//         });
//       } else {
//         res.json({
//           message: "token saved , and login successful",
//           result,
//         });
//       }
//     }
//   );
// });


authRouter.post("/check-in", authMiddleware, async (req, res) => {
  // Get the client's IP address from the request object
  const ip = requestIp.getClientIp(req);
  console.log("ip", ip);

  // Look up location information based on the IP address
  const geo = geoip.lookup(ip);
  console.log("geo", geo);

  // Build a location string based on the location information
  const location = geo
    ? `${geo.city} , ${geo.region} , ${geo.city}`
    : "Unknown";
  console.log("location", location);

  // Extract the id and current date from the request object
  let { id } = req.body;
  let currentDate = new Date().toJSON().slice(0, 10);

  // Insert a new record into the userslogin table with the id, current date, and location information
  connection.query(
    "insert into userslogin (id, logintime , location) values (?,?,?)",
    [id, currentDate, location],
    (err, result) => {
      if (err) {
        console.log("Error -> ", err);
        res.json({
          message: err.message,
        });
      } else {
        res.json({
          message: "token saved , and login successful",
          result,
        });
      }
    }
  );
});

// authRouter.post("/login", async (req, res) => {
//   let { number, password } = req.body;
//   connection.query(
//     "select * from users where number = ?",
//     [number],
//     async (err, result) => {
//       if (err) {
//         // console.log(err);
//         res.status(500).json({
//           error: err.message,
//         });
//       } else {
//         if (result.length > 0) {
//           const ans = await bcypt.compare(password, result[0].password);
//           if (ans) {
//             delete result[0].password;
//             const token = await jwt.sign({ ...result[0] }, secrets.JWT_KEY, {
//               expiresIn: "72h",
//             });
//             // res.status(200).json({
//             //   message: "Login successful",
//             //   token,
//             // user : result[0]
//             // });
//             connection.query(
//               "insert into users (logintime) values (?) where key = ?",
//               [Date.now(), result[0].id],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                   res.status(400).json({
//                     error: err.message,
//                   });
//                 } else {
//                   res.status(200).json({
//                     message: "Login successful",
//                     token,
//                     user: result[0],
//                   });
//                 }
//               }
//             );
//           } else {
//             res.status(401).json({
//               message: "Invalid credentials",
//             });
//           }
//         } else {
//           res.status(401).json({
//             message: "User not found",
//           });
//         }
//       }
//     }
//   );
// });

authRouter.get("/get-all-users", async (req, res) => {
  connection.query("select * from users", (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        error: err.message,
      });
    } else {
      res.status(200).json({
        message: "All users",
        result,
      });
    }
  });
});

authRouter.get("/get-all-users-login", async (req, res) => {
  let currentDate = new Date().toJSON().slice(0, 10);
  console.log(currentDate);
  connection.query(
    "select * from userslogin where logintime = ?",
    [currentDate],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          error: err.message,
        });
      } else {
        res.status(200).json({
          message: "All users",
          result,
        });
      }
    }
  );
});

// The above one is setting in the same table
module.exports = authRouter;
