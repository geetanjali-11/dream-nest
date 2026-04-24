import { useState, useEffect } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { getApiUrl, getAuthHeaders } from "../lib/api";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user?._id);
  const token = useSelector((state) => state.token);
  const tripList = useSelector((state) => state.tripList);
  

  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/users/${userId}/trips`),
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();
      dispatch(setTripList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Trip List Failed!", err.message);
    }
  };

  useEffect(() => {
    getTripList();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList?.map(
          ({ listingId, hostId, startDate, endDate, totalPrice }) => (
            <ListingCard
              listingId={listingId._id}
              creator={hostId._id}
              listingPhotoPaths={listingId.listingPhotoPaths}
              city={listingId.city}
              province={listingId.province}
              country={listingId.country}
              category={listingId.category}
              startDate={startDate}
              endDate={endDate}
              totalPrice={totalPrice}
            />
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default TripList;
