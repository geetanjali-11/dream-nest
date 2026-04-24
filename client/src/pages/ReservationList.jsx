import { useState, useEffect } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { getApiUrl, getAuthHeaders } from "../lib/api";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user?._id);
  const token = useSelector((state) => state.token);
  const reservationList = useSelector((state) => state.reservationList);

  const dispatch = useDispatch();

  const getReservationList = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/users/${userId}/reservations`),
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();
      dispatch(setReservationList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Reservation List Failed!", err.message);
    }
  };

  useEffect(() => {
    getReservationList();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Reservation List</h1>
      <div className="list">
        {reservationList?.map(
          ({ _id, listingId, startDate, endDate, totalPrice }) => (
            <ListingCard
              key={_id}
              listingId={listingId._id}
              listingPhotoPaths={listingId.listingPhotoPaths}
              city={listingId.city}
              province={listingId.province}
              country={listingId.country}
              category={listingId.category}
              type={listingId.type}
              price={listingId.price}
              totalPrice={totalPrice}
              startDate={startDate}
              endDate={endDate}
              booking={true}
            />
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
