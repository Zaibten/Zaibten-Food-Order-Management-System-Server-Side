const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
// Import required Firebase modules
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
require('dotenv').config();


// Initialize Firebase App
const firebaseApp = initializeApp({
  apiKey: "AIzaSyAd0K-Y8AnNXSJXQRZeQtphPZQPOkSAgmo",
  authDomain: "foodplanet-82388.firebaseapp.com",
  projectId: "foodplanet-82388",
  storageBucket: "foodplanet-82388.firebasestorage.app",
  messagingSenderId: "898880937459",
  appId: "1:898880937459:web:2c23717c73ffdf2eef8686",
  measurementId: "G-CPEP0M2EXG"
});

// Initialize Firestore
const db = getFirestore(firebaseApp);


const app = express();
app.use(cors());
app.use(bodyParser.json());


// SMTP Credentials

app.use('/assets', express.static(path.join(__dirname, 'assets')));


const senderEmail = "muzamilkhanofficial786@gmail.com";
const senderPassword = "sghw vxwt jxau fmjt";

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

// API to send cancellation email
app.post("/send-cancellation-email", async (req, res) => {
  const { email, serviceName, bookingDate, bookingTime, totalPrice } = req.body;

  console.log("Received email request for:", email);

  if (!email) {
    console.error("No email provided!");
    return res.status(400).json({ error: "Email is required" });
  }

  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: "Booking Cancellation Confirmation",
    html: `
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="Company Logo" style="width: 80px; height: 80px; border-radius: 50%; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);"/>
        </div>

        <!-- Title -->
        <h2 style="color: #ff4d4d; text-align: center; font-size: 22px;">Booking Cancellation Confirmation</h2>
        <p style="color: #555; font-size: 16px; text-align: center;">We regret to inform you that your booking has been canceled.</p>

        <!-- Animated Details Box -->
        <div style="border-radius: 8px; background: #f9f9f9; padding: 15px; margin-top: 10px; animation: fadeIn 1.5s ease-in-out;">
          <p style="font-size: 16px;"><strong>Service:</strong> ${serviceName || "Not Available"}</p>
          <p style="font-size: 16px;"><strong>Date:</strong> ${bookingDate || "Not Available"}</p>
          <p style="font-size: 16px;"><strong>Time:</strong> ${bookingTime || "Not Available"}</p>
          <p style="font-size: 16px; color: #ff4d4d;"><strong>Total Price:</strong> ${totalPrice || "Not Available"}</p>
        </div>

        <!-- Footer -->
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">If you have any concerns, please contact our support team.</p>
      </div>

      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "assets/logo.png"), // Ensure your logo is in the 'assets' folder
        cid: "logo",
      },
    ],
  };

  try {
    console.log("Sending email to:", email);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    res.json({ success: true, message: "Cancellation email sent!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


// API to send booking confirmation email
// app.post("/send-booking-email", async (req, res) => {
//     const { email, serviceName, bookingDate, bookingTime, totalPrice } = req.body;
  
//     console.log("Received booking email request for:", email);
  
//     if (!email) {
//       console.error("No email provided!");
//       return res.status(400).json({ error: "Email is required" });
//     }
  
//     const mailOptions = {
//       from: senderEmail,
//       to: email,
//       subject: "Booking Confirmation",
//       html: `
//         <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
//           <!-- Logo -->
//           <div style="text-align: center; margin-bottom: 20px;">
//             <img src="cid:logo" alt="Company Logo" style="width: 80px; height: 80px; border-radius: 50%; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);"/>
//           </div>
  
//           <!-- Title -->
//           <h2 style="color: #4CAF50; text-align: center; font-size: 22px;">Booking Confirmed</h2>
//           <p style="color: #555; font-size: 16px; text-align: center;">Thank you for your booking! Below are your booking details:</p>
  
//           <!-- Animated Details Box -->
//           <div style="border-radius: 8px; background: #f9f9f9; padding: 15px; margin-top: 10px; animation: fadeIn 1.5s ease-in-out;">
//             <p style="font-size: 16px;"><strong>Service:</strong> ${serviceName || "Not Available"}</p>
//             <p style="font-size: 16px;"><strong>Date:</strong> ${bookingDate || "Not Available"}</p>
//             <p style="font-size: 16px;"><strong>Time:</strong> ${bookingTime || "Not Available"}</p>
//             <p style="font-size: 16px; color: #4CAF50;"><strong>Total Price:</strong> ${totalPrice || "Not Available"}</p>
//           </div>
  
//           <!-- Footer -->
//           <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
//             If you have any questions, feel free to contact us. We look forward to serving you!
//           </p>
//         </div>
  
//         <style>
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(-10px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         </style>
//       `,
//       attachments: [
//         {
//           filename: "logo.png",
//           path: path.join(__dirname, "assets/logo.png"), // Ensure your logo is in the 'assets' folder
//           cid: "logo",
//         },
//       ],
//     };
  
//     try {
//       console.log("Sending booking confirmation email to:", email);
//       await transporter.sendMail(mailOptions);
//       console.log("Booking confirmation email sent successfully!");
//       res.json({ success: true, message: "Booking confirmation email sent!" });
//     } catch (error) {
//       console.error("Error sending email:", error);
//       res.status(500).json({ error: "Failed to send booking email" });
//     }
//   });
  


app.post("/send-booking-email", async (req, res) => {
  const { email, serviceName, bookingDate, bookingTime, totalPrice } = req.body;

  console.log("Received booking email request for:", email);

  if (!email) {
    console.error("No email provided!");
    return res.status(400).json({ error: "Email is required" });
  }

  const halfPrice = (parseFloat(totalPrice) / 2).toFixed(2);

  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: "Booking Confirmation & Invoice",
    html: `
      <div style="max-width: 700px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; border: 1px solid #eee;">
        <!-- Logo -->
        <div style="text-align: center;">
          <img src="cid:logo" alt="Company Logo" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px;" />
        </div>

        <!-- Booking Confirmation -->
        <h2 style="color: #4CAF50; text-align: center; font-size: 24px;">Booking Confirmed</h2>
        <p style="text-align: center; font-size: 16px; color: #444;">
          Thank you for your booking! Here are your booking and invoice details.
        </p>

        <!-- Booking Info -->
        <div style="margin: 30px 0;">
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #333;">Booking Details</h3>
          <p><strong>Service Name:</strong> ${serviceName || "Not Available"}</p>
          <p><strong>Date:</strong> ${bookingDate || "Not Available"}</p>
          <p><strong>Time:</strong> ${bookingTime || "Not Available"}</p>
        </div>

        <!-- Invoice -->
        <div style="margin-top: 30px;">
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #333;">Invoice</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Description</th>
                <th style="text-align: right; padding: 10px; border: 1px solid #ddd;">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Total Service Price</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${totalPrice || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Advance Paid (50%)</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${halfPrice}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Remaining Balance</strong></td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>${halfPrice}</strong></td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 15px; font-size: 15px; color: #2e7d32;"><strong>50% booking payment has been successfully received.</strong></p>
        </div>

        <!-- Footer -->
        <p style="text-align: center; font-size: 14px; color: #777; margin-top: 30px;">
          For any inquiries, please contact our support team. We look forward to serving you!
        </p>
      </div>
    `,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "assets/logo.png"),
        cid: "logo",
      },
    ],
  };

  try {
    console.log("Sending booking confirmation email to:", email);
    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent successfully!");
    res.json({ success: true, message: "Booking confirmation email sent!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send booking email" });
  }
});



  // Function to send reminder emails
const sendReminderEmails = async () => {
  try {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Get tomorrow's date

    // Format date to match Firestore's stored format (e.g., "2025-03-28")
    const tomorrowDate = today.toISOString().split("T")[0];

    // Fetch all bookings from Firestore
    const bookingsSnapshot = await db.collection("Bookings").get();

    if (bookingsSnapshot.empty) {
      console.log("No bookings found.");
      return;
    }

    bookingsSnapshot.forEach(async (doc) => {
      const booking = doc.data();

      if (booking.bookingDate === tomorrowDate) {
        const { email, serviceName, bookingDate, bookingTime, totalPrice } = booking;

        const mailOptions = {
          from: senderEmail,
          to: email,
          subject: "Reminder: Upcoming Booking Tomorrow",
          html: `
            <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
              <h2 style="color: #FFA500; text-align: center;">Upcoming Booking Reminder</h2>
              <p style="text-align: center;">This is a reminder about your upcoming booking scheduled for tomorrow.</p>

              <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <p><strong>Service:</strong> ${serviceName || "Not Available"}</p>
                <p><strong>Date:</strong> ${bookingDate || "Not Available"}</p>
                <p><strong>Time:</strong> ${bookingTime || "Not Available"}</p>
                <p style="color: #FFA500;"><strong>Total Price:</strong> ${totalPrice || "Not Available"}</p>
              </div>

              <p style="text-align: center; margin-top: 15px;">If you need to reschedule, please contact us.</p>
            </div>
          `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${email}`);
      }
    });
  } catch (error) {
    console.error("Error sending reminder emails:", error);
  }
};

// Schedule the reminder email to run daily at a fixed time (e.g., midnight)
const scheduleDailyReminder = () => {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(0, 0, 0, 0); // Set execution time to midnight
  nextRun.setDate(nextRun.getDate() + 1); // Run at the next midnight

  const timeUntilNextRun = nextRun.getTime() - now.getTime();
  console.log(`Scheduled reminder emails in ${timeUntilNextRun / 1000 / 60} minutes`);

  setTimeout(() => {
    sendReminderEmails();
    scheduleDailyReminder(); // Reschedule for the next day
  }, timeUntilNextRun);
};

// Start scheduling reminders
scheduleDailyReminder();


// API to send booking confirmation email with QR Code
app.post("/send-master-booking-email", async (req, res) => {
  console.log("Received request body:", req.body); // Debugging

  const { email, serviceName, bookingDate, bookingTime, totalPrice } = req.body;

  if (!email) {
    console.error("Error: Email is missing in the request.");
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Generate QR Code
    const qrCodeData = `Booking Details:\nService: ${serviceName}\nDate: ${bookingDate}\nTime: ${bookingTime}\nPrice: ${totalPrice}`;
    const qrCodePath = path.join(__dirname, "qrcode.png");

    await QRCode.toFile(qrCodePath, qrCodeData);

    // Email content
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: "Booking Confirmation with QR Code",
      html: `
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
          <h2 style="color: #4CAF50; text-align: center;">Booking Confirmed</h2>
          <p style="text-align: center;">Thank you for your booking! Below are your details:</p>
          <div style="border-radius: 8px; background: #f9f9f9; padding: 15px;">
            <p><strong>Service:</strong> ${serviceName || "Not Available"}</p>
            <p><strong>Date:</strong> ${bookingDate || "Not Available"}</p>
            <p><strong>Time:</strong> ${bookingTime || "Not Available"}</p>
            <p style="color: #4CAF50;"><strong>Total Price:</strong> ${totalPrice || "Not Available"}</p>
          </div>
          <p style="text-align: center;">Scan the QR Code below to access your booking details:</p>
          <div style="text-align: center;">
            <img src="cid:qrcode" alt="QR Code" style="width: 150px; height: 150px;"/>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          path: qrCodePath,
          cid: "qrcode",
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent successfully!");
    res.json({ success: true, message: "Booking confirmation email sent with QR Code!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send booking email" });
  }
});




// Email Sending Endpoint
app.post("/mastersend-booking-email", async (req, res) => {
  const { name, email, contact, className, salonName, artistName } = req.body;

  // Step 1: Generate unique code
  const uniqueCode = `MC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Step 2: Create QR Code using Google Charts API
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(uniqueCode)}`;

  try {
    await transporter.sendMail({
      from: `"Masterclass Booking" <${senderEmail}>`,
      to: email,
      subject: `Booking Confirmed: ${className}`,
      html: `
        <h3>Dear ${name},</h3>
        <p>Your booking for the master class <strong>${className}</strong> has been confirmed.</p>
        <p><strong>Artist:</strong> ${artistName}</p>
        <p><strong>Salon:</strong> ${salonName}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Booking Code:</strong> ${uniqueCode}</p>
        <p>Scan the QR code below for your booking verification:</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/800px-QR_Code_Example.svg.png" alt="QR Code" style="width:200px; height:200px;" />
        <br/>
        <p>Thank you for booking with us!</p>
      `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});



// POST route to send contact form email
app.post("/send-contact-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const htmlContent = `
  <html>
  <head>
    <style>
      @keyframes fadeInUp {
        0% {opacity: 0; transform: translateY(20px);}
        100% {opacity: 1; transform: translateY(0);}
      }
      .container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 20px;
        color: #333;
      }
      h1 {
        color: #222;
        animation: fadeInUp 1s ease forwards;
      }
      p {
        font-size: 1.1rem;
        animation: fadeInUp 1.2s ease forwards;
      }
      .emoji {
        display: inline-block;
        animation: bounce 2s infinite ease-in-out;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      .highlight {
        color: #2E86DE;
        font-weight: 700;
      }
      .footer {
        margin-top: 30px;
        font-size: 0.9rem;
        color: #777;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>📬 New Contact Request <span class="emoji">✉️</span></h1>
      <p><strong>Name:</strong> <span class="highlight">${name}</span></p>
      <p><strong>Email:</strong> <span class="highlight">${email}</span></p>
      <p><strong>Subject:</strong> <span class="highlight">${subject}</span></p>
      <p><strong>Message:</strong><br />${message}</p>
      <p class="footer">Sent with ❤️ from your website contact form.</p>
    </div>
  </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Website Contact" <${senderEmail}>`,
      to: senderEmail, // or your admin/support email
      subject: `📩 Contact Form: ${subject}`,
      html: htmlContent,
    });
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.get("/api/images", (req, res) => {
  const images = [
    process.env.IMAGE_1,
    process.env.IMAGE_2,
    process.env.IMAGE_3
  ];

  // Basic validation: check if URLs are valid format (optional enhancement)
  const validImages = images.filter(
    (url) => typeof url === "string" && url.startsWith("http")
  );

  res.json(validImages);
});

app.post("/send-order-email", async (req, res) => {
  const { to, name, cartItems, total, address } = req.body;

  const cartListHtml = cartItems.map(item => `
    <tr>
      <td style="padding: 10px; border-top: 1px solid #eee;">${item.ServiceName}</td>
      <td style="padding: 10px; border-top: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-top: 1px solid #eee;">Rs ${item.Price}</td>
    </tr>
  `).join("");

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="FoodApp Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: white; padding: 8px;" />
        <h1 style="color: #fff; margin: 10px 0 0;">Order Confirmed</h1>
        <p style="color: #e0f2e9; margin: 5px 0 0;">Thanks for choosing FoodApp</p>
      </div>

      <div style="padding: 20px;">
        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 15px; color: #555;">We’ve received your order. Here’s what you ordered:</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 10px;">Item</th>
              <th style="text-align: left; padding: 10px;">Qty</th>
              <th style="text-align: left; padding: 10px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${cartListHtml}
            <tr style="font-weight: bold;">
              <td colspan="2" style="padding: 10px; border-top: 2px solid #ccc;">Total</td>
              <td style="padding: 10px; border-top: 2px solid #ccc;">Rs ${total}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 20px;">
          <p style="font-size: 15px;"><strong>Delivery Address:</strong><br>${address}</p>
        </div>

        <p style="font-size: 15px; margin-top: 30px;">Enjoy your meal!<br/><strong>Team FoodApp</strong></p>
      </div>

      <div style="background-color: #f9f9f9; text-align: center; padding: 12px; font-size: 13px; color: #999;">
        This is an automated email. Please don’t reply to it.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FoodApp Orders" <muzamilkhanofficial786@gmail.com>`,
      to,
      subject: "Your Order Confirmation",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "assets/logo.png"),
          cid: "logo", // referenced in <img src="cid:logo" />
        },
      ],
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.post("/send-delivery-email", async (req, res) => {
  const { to, name } = req.body;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="FoodApp Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: white; padding: 8px;" />
        <h1 style="color: #fff; margin: 10px 0 0;">Order Delivered</h1>
        <p style="color: #e0f2e9; margin: 5px 0 0;">Thanks for choosing FoodApp</p>
      </div>

      <div style="padding: 20px;">
      <p>Hi <strong>${name || "Customer"}</strong>,</p>
      <p>Your order has been delivered successfully.</p>
      <p>We hope you enjoy your meal 🍽️!</p>
      <p style="margin-top: 20px;">Thank you for ordering with <strong>FoodApp</strong>.</p>
      <div style="margin-top: 30px; font-size: 12px; color: #999;">
        This is an automated message. Please do not reply.
      </div>

        <p style="font-size: 15px; margin-top: 30px;">Enjoy your meal!<br/><strong>Team FoodApp</strong></p>
      </div>

      <div style="background-color: #f9f9f9; text-align: center; padding: 12px; font-size: 13px; color: #999;">
        This is an automated email. Please don’t reply to it.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FoodApp Delivery" <muzamilkhanofficial786@gmail.com>`,
      to,
      subject: "Your Order is Delivered - Enjoy Your Meal!",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "assets/logo.png"),
          cid: "logo", // referenced in <img src="cid:logo" />
        },
      ],
    });

    res.status(200).json({ message: "Delivery email sent" });
  } catch (error) {
    console.error("Delivery Email Error:", error);
    res.status(500).json({ message: "Failed to send delivery email" });
  }
});


app.post("/send-tablebooking-email", async (req, res) => {
  const {
    restaurantEmail,
    restaurantName,
    userName,
    userEmail,
    bookingDate,
    bookingTime,
    numberOfGuests,
  } = req.body;

  if (
    !restaurantEmail ||
    !restaurantName ||
    !userName ||
    !userEmail ||
    !bookingDate ||
    !bookingTime ||
    !numberOfGuests
  ) {
    return res.status(400).json({ error: "Missing booking information" });
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="FoodApp Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: white; padding: 8px;" />
        <h1 style="color: #fff; margin: 10px 0 0;">New Table Booking</h1>
        <p style="color: #e0f2e9; margin: 5px 0 0;">Booking notification from <strong>${restaurantName}</strong></p>
      </div>

      <div style="padding: 20px; color: #333;">
        <p>Hi <strong>${restaurantName}</strong>,</p>
        <p>You have a new table booking with the following details:</p>
        <ul style="list-style-type:none; padding: 0;">
          <li><strong>Customer Name:</strong> ${userName}</li>
          <li><strong>Customer Email:</strong> ${userEmail}</li>
          <li><strong>Booking Date:</strong> ${bookingDate}</li>
          <li><strong>Booking Time:</strong> ${bookingTime}</li>
          <li><strong>Number of Guests:</strong> ${numberOfGuests}</li>
        </ul>
        <p style="margin-top: 20px;">Please confirm the booking at your earliest convenience.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
        <p style="font-size: 15px; margin-top: 30px;">Thank you,<br/><strong>Team FoodApp</strong></p>
      </div>

      <div style="background-color: #f9f9f9; text-align: center; padding: 12px; font-size: 13px; color: #999;">
        This is an automated email. Please don’t reply to it.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FoodApp Booking" <${senderEmail}>`,
      to: restaurantEmail,
      subject: `New Table Booking from ${userName}`,
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "assets/logo.png"),
          cid: "logo", // referenced in <img src="cid:logo" />
        },
      ],
    });

    res.json({ success: true, message: "Booking email sent to restaurant" });
  } catch (error) {
    console.error("Error sending booking email:", error);
    res.status(500).json({ error: "Failed to send booking email" });
  }
});

app.post("/send-deletion-email", async (req, res) => {
  const { toEmail, serviceName, bookingDate, bookingTime, totalPrice } = req.body;

  if (!toEmail || !serviceName || !bookingDate || !bookingTime || !totalPrice) {
    return res.status(400).json({ error: "Missing booking deletion information" });
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f44336; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="FoodApp Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: white; padding: 8px;" />
        <h1 style="color: #fff; margin: 10px 0 0;">Booking Cancellation</h1>
        <p style="color: #fdecea; margin: 5px 0 0;">Your booking has been cancelled</p>
      </div>

      <div style="padding: 20px; color: #333;">
        <p>Hi,</p>
        <p>We regret to inform you that your booking has been deleted. Below are the details:</p>
        <ul style="list-style-type:none; padding: 0;">
          <li><strong>Service Name:</strong> ${serviceName}</li>
          <li><strong>Booking Date:</strong> ${bookingDate}</li>
          <li><strong>Booking Time:</strong> ${bookingTime}</li>
          <li><strong>Total Price:</strong> ${totalPrice}</li>
        </ul>
        <p style="margin-top: 20px;">If this was unexpected or you believe it's an error, please contact our support team.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
        <p style="font-size: 15px; margin-top: 30px;">Thank you,<br/><strong>Team FoodApp</strong></p>
      </div>

      <div style="background-color: #f9f9f9; text-align: center; padding: 12px; font-size: 13px; color: #999;">
        This is an automated email. Please don’t reply to it.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FoodApp Cancellation" <${senderEmail}>`,
      to: toEmail,
      subject: "Booking Cancellation Notice",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "assets/logo.png"),
          cid: "logo", // referenced in <img src="cid:logo" />
        },
      ],
    });

    res.status(200).json({ message: "Cancellation email sent successfully." });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});


app.post("/send-confirmtablebooking-email", async (req, res) => {
  const {
    restaurantEmail,
    restaurantName,
    userName,
    userEmail,
    bookingDate,
    bookingTime,
    numberOfGuests,
  } = req.body;

  if (
    !restaurantEmail ||
    !restaurantName ||
    !userName ||
    !userEmail ||
    !bookingDate ||
    !bookingTime ||
    !numberOfGuests
  ) {
    return res.status(400).json({ error: "Missing booking information" });
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <img src="cid:logo" alt="FoodApp Logo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: white; padding: 8px;" />
        <h1 style="color: #fff; margin: 10px 0 0;">Table Booking Confirmed</h1>
        <p style="color: #e0f2e9; margin: 5px 0 0;">Booking confirmation from <strong>${restaurantName}</strong></p>
      </div>

      <div style="padding: 20px; color: #333;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your table booking at <strong>${restaurantName}</strong> has been <strong>confirmed</strong> with the following details:</p>
        <ul style="list-style-type:none; padding: 0;">
          <li><strong>Booking Date:</strong> ${bookingDate}</li>
          <li><strong>Booking Time:</strong> ${bookingTime}</li>
          <li><strong>Number of Guests:</strong> ${numberOfGuests}</li>
        </ul>
        <p style="margin-top: 20px;">We look forward to welcoming you!</p>

        <div style="text-align: center; margin-top: 30px;">
          <p><strong>Scan this QR code on arrival:</strong></p>
          <img src="cid:qrcode" alt="QR Code" style="width: 150px; height: 150px;" />
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
        <p style="font-size: 15px; margin-top: 30px;">Thank you,<br/><strong>Team FoodApp</strong></p>
      </div>

      <div style="background-color: #f9f9f9; text-align: center; padding: 12px; font-size: 13px; color: #999;">
        This is an automated email. Please don’t reply to it.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FoodApp Booking" <${senderEmail}>`,
      to: userEmail, // Send to user email here
      subject: `Your Table Booking at ${restaurantName} is Confirmed`,
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "assets/logo.png"),
          cid: "logo", // referenced in <img src="cid:logo" />
        },
        {
          filename: "qrcode.png",
          path: path.join(__dirname, "assets/qrcode.png"), // Put your QR code image here locally
          cid: "qrcode", // referenced in <img src="cid:qrcode" />
        },
      ],
    });

    res.json({ success: true, message: "Booking confirmation email sent to user" });
  } catch (error) {
    console.error("Error sending booking email:", error);
    res.status(500).json({ error: "Failed to send booking email" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
