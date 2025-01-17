# Inventory Management App

## Overview
This Inventory Management App is a React-based web application designed to help users manage their pantry items efficiently. It integrates with Firebase for authentication and real-time database operations, ensuring that all data is synchronized across all devices.

## Features

- **User Authentication**: Secure login and registration functionality using Firebase Authentication.
- **Real-Time Data Sync**: All pantry data is stored and retrieved in real-time from Firebase Firestore.
- **Dynamic Item Management**: Users can add, edit, and delete pantry items.
- **Category Filtering**: Items can be filtered by categories, which are dynamically generated based on the items in the pantry.
- **Sorting Options**: Users can sort items alphabetically, by quantity, or by expiration date.
- **Search Functionality**: Items can be quickly searched using a text input that filters items as you type.
- **Responsive Modal**: Add new items using a modal form that validates input and handles different item attributes like quantity, category, and expiration date.
- **Infinite Scrolling**: Load items incrementally as the user scrolls, improving performance and user experience on large datasets.

## Technologies Used

- **React**: For building the user interface.
- **Material-UI**: Used for styling and structuring the layout with ready-to-use components.
- **Firebase**:
  - **Firestore**: To store user and pantry data.
  - **Firebase Auth**: For handling user authentication.
- **React Infinite Scroll Component**: To enhance the scrolling behavior of the item list.

## Setup and Installation

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up Firebase:
   - Create a Firebase project.
   - Enable Firestore and Firebase Authentication.
   - Configure the `.env` file with your Firebase keys.
4. Run the application using `npm start`.

## Usage

After logging in, the user can view all items in their pantry, add new items, or modify existing entries. Each item can be edited directly in the list view, and changes are immediately synchronized with the Firestore database.

## Future Enhancements

- Implement more detailed user settings.
- Provide notifications for expiring items.
- Allow sharing of pantry data between multiple users.

This app is ideal for anyone looking to digitize their pantry management and ensure they keep track of their groceries and supplies effectively.
