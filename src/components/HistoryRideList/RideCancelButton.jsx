import { cancelRide } from "../../../lib/api";

const RideCancelButton = ({ rideId, getAllRide }) => {
    console.log(rideId)

    const handleDelete = async () => {
        await cancelRide(rideId)
        getAllRide()
    }

    return (
    <button className="btn-delete" onClick={handleDelete} >Cancel Ride</button>
  )
}

export default RideCancelButton
