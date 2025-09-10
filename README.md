# SwiftRide-front-end

SwiftRide is a **ride-hailing web application** built with the MERN stack (MongoDB, Express.js, React, Node.js).  
It enables **users to book rides, track drivers on a live map, and view ride history**, while **drivers can accept rides and update their progress** in real time.

---

## Introduction
SwiftRide is designed to make urban transportation more efficient by offering a digital platform similar to Uber or Lyft.  
Users can **book a ride, choose pickup and dropoff points, estimate fares, and track the trip on a map**.  
The application ensures smooth interaction between **customers and drivers**, backed by a modern **full-stack architecture**.

---
<img width="1829" height="988" alt="image" src="https://github.com/user-attachments/assets/71ecf51f-430d-481f-9f03-51ce0c975dac" />
<img width="1880" height="1006" alt="image" src="https://github.com/user-attachments/assets/da69a431-31e2-4e76-bddc-aecc93554baf" />



## Contents
1. **Introduction** – Overview of the project  
2. **Features** – Key functionalities for users and drivers  
3. **Tech Stack** – Technologies used to build the app   
4. **Future Enhancements** – Possible improvements  
5. **Conclusion** – Final remarks  

---

## Features

-  **Authentication** – Secure login and signup for users and drivers.
-  **Interactive Map** – Real-time location tracking with [Leaflet.js](https://leafletjs.com/).
-  **Ride Booking** – Select pickup & drop-off points, view fare estimates, and request a ride.
-  **Ride History** – View past rides and cancel ongoing requests.
-  **Driver Dashboard** – Drivers can appear on the map and accept rides.
-  **Dark Mode UI** – Sleek and modern design.

---

##  Tech Stack

- **Frontend:** React, React Router, React Leaflet, CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Real-time:** Socket.io  
- **Styling:** Custom CSS (Dark Mode)  

---

##  Future Enhancements

While SwiftRide already provides core ride-hailing functionality, future versions could include:

-  **Mobile Application** – Develop Android/iOS apps using React Native for wider accessibility.    
-  **Payment Integration** – Secure in-app payments with Stripe or PayPal.  
-  **Rating & Reviews** – Allow passengers and drivers to rate each other.  
-  **AI-Powered Route Optimization** – Suggest the fastest/cheapest routes using ML.  

---

##  Conclusion

SwiftRide successfully showcases the essential building blocks of a ride-hailing application.  
From route planning to ride management, it delivers a smooth user experience and lays the foundation for future expansion into a fully scalable real-world platform.  

 With additional features like mobile support and payments, SwiftRide has the potential to evolve into a powerful and practical transportation solution.

 ---
 
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
