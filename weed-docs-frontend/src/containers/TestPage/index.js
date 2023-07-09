/**
 *
 * TestPage
 */
import React from "react";
import axios from "axios";

const TestPage = () => {
    const clickEv = () => {
        axios
            .post("http://localhost:1337/api/plants", {
                data: {
                    Name: "From API",
                    Content: "Test content"
                },
            })
            .then((response) => {
                console.log('Элемент добавлен: ', response);
            });
    }

    return (
        <div className="test-page">
            <button onClick={clickEv}>Add plant!</button>
        </div>
    );
};

export default TestPage;
