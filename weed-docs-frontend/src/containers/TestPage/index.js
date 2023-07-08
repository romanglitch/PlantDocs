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
                    Content: "Test content",
                    weeks: {
                        testValue: 'sdssdsd'
                    }
                },
            })
            .then((response) => {
                console.log(response);
            });
    }

    return (
        <div className="test-page">
            <button onClick={clickEv}>Add plant!</button>
        </div>
    );
};

export default TestPage;
