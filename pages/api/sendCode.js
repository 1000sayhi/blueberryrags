// import axios from "axios";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   const { phone } = req.body;
//   if (!phone)
//     return res.status(400).json({ error: "휴대폰 번호가 필요합니다." });

//   const code = String(Math.floor(100000 + Math.random() * 900000));

//   try {
//     const timestamp = Date.now().toString();
//     const accessKey = process.env.NCP_ACCESS_KEY;
//     const secretKey = process.env.NCP_SECRET_KEY;
//     const serviceId = process.env.NCP_SMS_SERVICE_ID;
//     const sender = process.env.NCP_SMS_SENDER;

//     const hmac = require("crypto")
//       .createHmac("sha256", secretKey)
//       .update(
//         `POST /sms/v2/services/${serviceId}/messages\n${timestamp}\n${accessKey}`
//       )
//       .digest("base64");

//     const response = await axios.post(
//       `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`,
//       {
//         type: "SMS",
//         contentType: "COMM",
//         countryCode: "82",
//         from: sender,
//         content: `[blueberryrags] 인증번호는 [${code}] 입니다.`,
//         messages: [{ to: phone }],
//       },
//       {
//         headers: {
//           "Content-Type": "application/json; charset=utf-8",
//           "x-ncp-apigw-timestamp": timestamp,
//           "x-ncp-iam-access-key": accessKey,
//           "x-ncp-apigw-signature-v2": hmac,
//         },
//       }
//     );

//     return res.status(200).json({ success: true, code });
//   } catch (err) {
//     console.error("SMS 발송 실패:", err);
//     return res.status(500).json({ error: "SMS 발송 실패" });
//   }
// }
