import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";

import { getAllRide as fetchRides } from "../../../lib/api";
import RideCancelButton  from "./RideCancelButton"

const HistoryRideList = () => {
    const [ rides, setRides ] = useState([]);
    const [ loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    const getAllRide = async () => {
        const response = await fetchRides();
        setRides(response.data || []);
    };

    useEffect(() => {
        (async () => {
            await getAllRide()
            setLoading(false);
        })();
    }, []);

    if (loading) return <ClipLoader />;

    return (
        <div>
            <ol>
               
                    {rides.map(ride => (
                        <li key={ride._id}>
                            <p><strong>ride status:</strong> {ride.status}</p>
                            <p><strong>Driver:</strong> {ride.driver ? ride.driver.name : "Unassigned"}</p>
                            <p><strong>fare:</strong> {ride.fare ?? 0}</p>
                            <p><strong>Pickup:</strong> {ride.pickup.address} </p>
                            <p><strong>Dropoff:</strong> {ride.dropoff.address} </p>   
                            <div>
                            {/* <button className="btn" onClick={() => handleEditClick(booking)}>Update</button> */}

                            {ride.status === "requested" 
                            ?
                            <RideCancelButton
                                rideId={ride._id}
                                getAllRide={getAllRide}
                                
                            />
                            :
                            null
                            }
                            </div>
                        </li>
                    ))}
            </ol>
        </div>
    )
}
export default HistoryRideList;