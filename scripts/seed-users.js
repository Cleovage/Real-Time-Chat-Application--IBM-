const http = require("http");

const BASE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";

const USERS = [
  {
    username: "alpha_user",
    email: "alpha_user_chatapp@example.com",
    password: "Alpha@12345",
  },
  {
    username: "beta_user",
    email: "beta_user_chatapp@example.com",
    password: "Beta@12345",
  },
  {
    username: "gamma_user",
    email: "gamma_user_chatapp@example.com",
    password: "Gamma@12345",
  },
];

function requestJson(url, method, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = http.request(
      url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 10000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {
            parsed = { raw: data };
          }

          resolve({
            status: res.statusCode,
            body: parsed,
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("request timeout"));
    });

    req.on("error", (err) => reject(err));

    if (payload) req.write(payload);
    req.end();
  });
}

async function seed() {
  const results = [];

  for (const user of USERS) {
    const register = await requestJson(
      `${BASE_URL}/api/users/register`,
      "POST",
      user
    ).catch((error) => ({
      status: "ERR",
      body: { message: error.message },
    }));

    const login = await requestJson(`${BASE_URL}/api/users/login`, "POST", {
      email: user.email,
      password: user.password,
    }).catch((error) => ({
      status: "ERR",
      body: { message: error.message },
    }));

    results.push({ user, register, login });
  }

  for (const result of results) {
    const { user, register, login } = result;
    const registerMsg =
      register.body?.message || (register.status === 201 ? "created" : "ok");
    const loginOk = login.status === 200;

    console.log(
      JSON.stringify({
        username: user.username,
        email: user.email,
        password: user.password,
        registerStatus: register.status,
        registerMessage: registerMsg,
        loginStatus: login.status,
        loginOk,
      })
    );
  }
}

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});