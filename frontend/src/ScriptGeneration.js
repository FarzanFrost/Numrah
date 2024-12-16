import { useState } from 'react';
import ButtonComponent from './Buttoncomponent';

function TextInput() {
    return (
      <div className="mb-3">
        <label htmlFor="userText" className="form-label">Enter Text</label>
        <textarea
          id="userText"
          className="form-control"
          rows="3"
          placeholder="Type your text here..."
        />
      </div>
    );
}

function NumberInput() {
    return (
        <div className="mb-3">
        <label htmlFor="count" className="form-label">Enter Count</label>
        <input
            type="number"
            id="count"
            className="form-control"
            placeholder="Enter a number"
        />
        </div>
    );
}

function BookEditor() {
    const [books, setBooks] = useState([
        { id: 1, content: 'This is the first book content.' },
        { id: 2, content: 'This is the second book content.' },
    ]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);

    const handleAddBook = () => {
        const newBook = { id: books.length + 1, content: 'New book content here.' };
        setBooks([...books, newBook]);
        setSelectedBook(newBook); // Automatically select the new book
    };

    const handleContentChange = (event) => {
        const updatedBooks = books.map((book) =>
        book.id === selectedBook.id
            ? { ...book, content: event.target.value }
            : book
        );
        setBooks(updatedBooks);
    };

    const handleBookSelection = (bookId) => {
        const isSelected = selectedBooks.includes(bookId);
        if (isSelected) {
        setSelectedBooks(selectedBooks.filter(id => id !== bookId)); // Unselect
        } else {
        setSelectedBooks([...selectedBooks, bookId]); // Select
        }
    };

    return (
        <div className="d-flex">
        {/* Left Side: Book List */}
        <div className="list-group w-25">
            {books.map((book) => (
            <button
                key={book.id}
                className={`list-group-item list-group-item-action d-flex justify-content-between ${selectedBook?.id === book.id ? 'list-group-item-primary' : ''}`}
                onClick={() => setSelectedBook(book)}
            >
                <div>
                {book.content.slice(0, 20)}... {/* Show first 20 characters */}
                </div>
                <input
                type="checkbox"
                checked={selectedBooks.includes(book.id)}
                onChange={() => handleBookSelection(book.id)}
                className="ms-2"
                />
            </button>
            ))}
            <button
            className="list-group-item list-group-item-action text-center"
            onClick={handleAddBook}
            >
            <strong>+</strong> Add New Book
            </button>
        </div>

        {/* Right Side: Text Editor */}
        <div className="w-75 ps-2">
            {selectedBook ? (
            <>
                <textarea
                value={selectedBook.content}
                onChange={handleContentChange}
                className="form-control"
                rows="10"
                />
            </>
            ) : (
            <div>Select a book to edit or add a new one.</div>
            )}
        </div>
        </div>
    );
}

const SricptGeneration = () => {
    return (
        <>
            <TextInput />
            <NumberInput />
            <ButtonComponent label='Generate Scripts' onClick={() => ''}/>
            <BookEditor />
            <ButtonComponent label='Submit Scripts' onClick={() => ''}/>
        </>
    )
}

export default SricptGeneration