
Set Up and Run Instructions

   1. Use "npm install" to install the dependencies. 
   2. Start up the server using "nodemon index.js" or "node index.js"

List of dependencies Used
   
   1. express
   2. sqlite
   3. sqlite3
   4. uuid
   5. multer
   6. csv-parser

 API 1
   Path: http://localhost:3000/books
   Method: GET

   Description: Returns the list of books.

   Response:
     [
      {
        "id": "550e8400-e29b-41d4-a716-446655440013",
        "title": "Final Interface",
        "author": "William Frost",
        "publishedYear": 2022
      },
      ...
     ]

API 2
   Path: http://localhost:3000/books/550e8400-e29b-41d4-a716-446655440019
   Method: GET

   Description: Returns details of a specific book.

   Response:
     {
        "id": "550e8400-e29b-41d4-a716-446655440019",
        "title": "Outrun the End",
        "author": "Jack Ember",
        "publishedYear": 2018
      }

API 3
   Path: http://localhost:3000/books
   Method: POST

   Description: Adds a new book.

   Request :
     {
        "title": "Watcher 2",
        "author": "Koontz",
        "publishedYear": 1998
      }
   Response:
     {
        "id": "f811a12b-ee87-442f-9e8a-3e1d79ee0409",
        "title": "Watcher 2",
        "author": "Koontz",
        "publishedYear": 1998
      }

API 4
   Path: http://localhost:3000/books/299eed0a-af8d-46bd-8d28-9fae7b20d77d
   Method: PUT

   Description: Updates an existing book.

   Request :
     {
        "title": "The Watcher 2",
        "author": "Dean Koontz",
        "publishedYear": "2000"
      }   
   Response :
     {
        "id": "299eed0a-af8d-46bd-8d28-9fae7b20d77d",
        "title": "The Watcher 2",
        "author": "Dean Koontz",
        "publishedYear": 2000
      } 

API 5
   Path: http://localhost:3000/books/2ecce00a-0d46-47ea-99d8-68ae92ed2fca
   Method: DELETE

   Description: Deletes a book.

   Response :
     {
        "message": "Book Deleted Successfully"
      }

API 6
   Path: http://localhost:3000/books/import
   Method: POST

   Description: Add multiple books using CSV file.  