import axios from "axios";
import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";

const Plants = () => {
    const [error, setError] = useState(null);
    const [plants, setPlants] = useState([]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants?populate[0]=categories`)
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
                    <Link className="listing__item" key={id} to={'/plants/' + id}>
                        <div className="listing__item__name">{attributes.Name}</div>
                        <div className="listing__item__category">
                            {
                                attributes.categories.data.map((cat_data) => (
                                    <div className="cat" data-id={cat_data.id} key={cat_data.id}>
                                        {cat_data.attributes.Name}
                                    </div>
                                ))
                            }
                        </div>
                    </Link>
                ))}
        </div>
    );
};

export default Plants;