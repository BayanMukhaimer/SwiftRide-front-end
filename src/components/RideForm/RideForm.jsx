import { useState } from "react";
import {createRide} from "../../../lib/api";
import { useNavigate } from "react-router";

const RideForm = ({setFormIsShown}) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pickup:  { address: "", lat: "", lng: "" },
        dropoff: { address: "", lat: "", lng: "" },
        fare: ""
    });


    const setField = (section, key, value) =>
    setFormData(formData => ({ ...formData, [section]: { ...formData[section], [key]: value } }));

    const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) 
        return;

    setIsSubmitting(true);

    const submitData = {
    pickup: {
        address: formData.pickup.address,
        lat: Number(formData.pickup.lat),
        lng: Number(formData.pickup.lng),
    },
    dropoff: {
        address: formData.dropoff.address,
        lat: Number(formData.dropoff.lat),
        lng: Number(formData.dropoff.lng),
    },
    fare: formData.fare ? Number(formData.fare) : 0
    };

    await createRide(submitData);
    setFormIsShown(false);
    setIsSubmitting(false);
    navigate("/rides/myrides");
    }  

    return(
        <div>
            <form onSubmit={handleSubmit}>
            <h2>Book Your Ride</h2>

            <strong>Pickup</strong>
            <input
                placeholder="Pickup address"
                value={formData.pickup.address}
                onChange={event => setField("pickup", "address", event.target.value)}
                required
            />
            <div>
                <input
                placeholder="Pickup lat"
                value={formData.pickup.lat}
                onChange={event => setField("pickup", "lat", event.target.value)}
                required
                />
                <input
                placeholder="Pickup lng"
                value={formData.pickup.lng}
                onChange={event => setField("pickup", "lng", event.target.value)}
                required
                />
            </div>

            <strong>Dropoff</strong>
            <input
                placeholder="Dropoff address"
                value={formData.dropoff.address}
                onChange={event => setField("dropoff", "address", event.target.value)}
                required
            />
            <div>
                <input
                placeholder="Dropoff lat"
                value={formData.dropoff.lat}
                onChange={event => setField("dropoff", "lat", event.target.value)}
                required
                />
                <input
                placeholder="Dropoff lng"
                value={formData.dropoff.lng}
                onChange={event => setField("dropoff", "lng", event.target.value)}
                required
                />
            </div>

            {/* fare */}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Request Ride"}
            </button>
            </form>   
        </div> 
    )

    
}
export default RideForm;
