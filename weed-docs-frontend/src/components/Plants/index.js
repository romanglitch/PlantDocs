import axios from "axios";
import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";

const Plants = () => {
    const [error, setError] = useState(null);
    const [plants, setPlants] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:1337/api/plants")
            .then(({ data }) => setPlants(data.data))
            .catch((error) => setError(error));
    }, []);

    if (error) {
        // Print errors if any
        return <div>An error occured: {error.message}</div>;
    }

    return (
        <div className="listing">
                {plants.map(({ id, attributes }) => (
                    <Link key={id} to={'/plants/' + id}>{attributes.Name}</Link>
                ))}
        </div>
    );
};

export default Plants;