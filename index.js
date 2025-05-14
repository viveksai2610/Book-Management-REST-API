const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const {v4: uuidv4} = require('uuid')

const app = express()

const fs = require('fs')
const multer = require('multer')
const csv = require('csv-parser')

const upload = multer({dest: 'uploads/'})

app.use(express.json())

const dbPath = path.join(__dirname, 'bookManagement.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/books', async (request, response) => {
  try {
    const getBooksQuery = `SELECT
      *
    FROM
      books
    ORDER BY
       publishedYear DESC;`
    const booksArray = await db.all(getBooksQuery)
    response.status(200)
    response.send(booksArray)
  } catch (error) {
    console.error('Error fetching books:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.get('/books/:id', async (request, response) => {
  const {id} = request.params
  try {
    const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      id = '${id}';`
    const book = await db.get(getBookQuery)

    if (book !== undefined) {
      const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE id = '${id}';`
      const bookArray = await db.get(getBookQuery)
      response.status(200)
      response.send(bookArray)
    } else {
      response.status(404)
      response.send('Invalid Book ID')
    }
  } catch (error) {
    console.error('Error fetching book:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.post('/books', async (request, response) => {
  const bookDetails = request.body
  const {title, author, publishedYear} = bookDetails
  if (
    !title ||
    typeof title !== 'string' ||
    !author ||
    typeof author !== 'string' ||
    !publishedYear ||
    isNaN(parseInt(publishedYear))
  ) {
    response.status(400)
    response.send({
      error: 'Invalid input',
    })
  }
  try {
    const id = uuidv4()
    const addBookQuery = `INSERT INTO books (id, title, author, publishedYear)
    VALUES
      (
        '${id}',
        '${title}',
        '${author}',
        ${publishedYear}
      );`

    await db.run(addBookQuery)
    response.status(201)
    const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      id = '${id}';`
    const newBook = await db.get(getBookQuery)
    response.send(newBook)
  } catch (error) {
    console.error('Error adding book:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.put('/books/:id/', async (request, response) => {
  const {id} = request.params
  const bookDetails = request.body
  const {title, author, publishedYear} = bookDetails
  try {
    const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      id = '${id}';`
    const book = await db.get(getBookQuery)

    if (book !== undefined) {
      const updateBookQuery = `UPDATE
      books
    SET
      title='${title}',
      author = '${author}',
      publishedYear = ${publishedYear} 
    WHERE
      id = '${id}';`
      await db.run(updateBookQuery)
      response.status(200)
      const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      id = '${id}';`
      const updatedBook = await db.get(getBookQuery)
      response.send(updatedBook)
    } else {
      response.status(404)
      response.send({message: 'Given ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error updating book:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.delete('/books/:id/', async (request, response) => {
  const {id} = request.params
  try {
    const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      id = '${id}';`
    const book = await db.get(getBookQuery)

    if (book !== undefined) {
      const deleteBookQuery = `DELETE FROM 
      books 
    WHERE
      id = '${id}';`
      await db.run(deleteBookQuery)
      response.status(200)
      response.send({message: 'Book Deleted Successfully'})
    } else {
      response.status(404)
      response.send({message: 'Given ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.post('/books/import', upload.single('file'), async (request, response) => {
  if (!request.file) {
    response.status(400)
    response.send({error: 'CSV file is required'})
  }

  const results = []
  const errorRows = []
  let rowIndex = 1

  try {
    const stream = fs.createReadStream(request.file.path).pipe(csv())

    for await (const row of stream) {
      rowIndex++
      const {title, author, publishedYear} = row

      if (!title || !author || !publishedYear) {
        errorRows.push(`Row ${rowIndex}: Missing required fields`)
        continue
      }

      const year = parseInt(publishedYear)
      if (isNaN(year) || year < 0) {
        errorRows.push(`Row ${rowIndex}: Invalid published year`)
        continue
      }

      const id = uuidv4()
      try {
        await db.run(
          `INSERT INTO books (id, title, author, publishedYear) VALUES ('${id}','${title}', '${author}', ${publishedYear} )`,
        )
        results.push(id)
      } catch (dbError) {
        errorRows.push(`Row ${rowIndex}: DB Error - ${dbError.message}`)
      }
    }

    fs.unlinkSync(request.file.path)

    response.status(200)
    response.send({
      addedBooksCount: results.length,
      errorRows,
    })
  } catch (error) {
    console.error('Import error:', error)
    fs.unlinkSync(request.file.path)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})
