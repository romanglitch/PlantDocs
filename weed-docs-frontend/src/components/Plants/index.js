import axios from "axios";
import { useEffect, useState } from "react";

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
            <ul>
                {plants.map(({ id, attributes }) => (
                    <li key={id}>{attributes.Name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Plants;